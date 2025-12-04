import { useContext, useEffect, useReducer, useState } from 'react'
import { Stack, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { createChat, getCSRF, getPrekeyBundle, getUsername, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { handle_message, init_ratchet_root_receiver, init_ratchet_root_sender } from '../../utils/RatchetUtils'
import { handle_X3DH_message, send_X3DH_message } from '../../utils/X3DHUtils'
import { send_new_encrypted_message } from '../../utils/WebsocketUtils'
import { ChatMessage } from '../../utils/protocol/messages'
import { create_chat_object, create_double_ratchet_recipient, delete_chat, get_all_double_ratchet_sess,  get_chat,  get_messages, getOneTimePrekeyWithPubKey, store_chat, store_double_ratchet_session, store_message, useIdentityInformation, useIndexedDB } from '../../utils/StorageUtils'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { identity_context } from '../../globals'


function ChatPage({ logoutCallback }) {

    let [currentChat, setCurrentChat] = useState(undefined)

    let [chats, chatsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "init":
                return action.data.map((chat) => { return { ...chat, "new_message": 0, "last_timestamp": 0 } })
            case "add":
                return [...prev, { ...action.new, "new_message": 0, "last_timestamp": 0 }].sort((a, b) => b.last_timestamp - a.last_timestamp)
            case "del":
                return prev.filter((chat) => chat.chat_id !== action.chat_id);
            case "mod":
                return prev.map((chat) => {
                    if (chat.chat_id !== action.chat_id)
                        return { ...chat }
                    return { ...chat, new_message: action.read ? 0 : chat.new_message + 1, "last_timestamp": action.last_timestamp || chat.last_timestamp }
                }).sort((a, b) => b.last_timestamp - a.last_timestamp)
        }
    }, [])

    let [messages, messageReducer] = useReducer((prev, action) => {
        let chat_id = action.chat_id
        let chatMessages = prev[chat_id] || []
        switch (action.action) {
            case "pop":
                return { ...prev, [chat_id]: [...chatMessages.slice(0, -1)] }
            case "add":
                return { ...prev, [chat_id]: [...chatMessages, action.new].sort((a, b) => a.timestamp - b.timestamp) }
            case "init":
                prev[chat_id] = [...action.messages]
                return { ...prev }
        }
    }, {})



    const addMessageUI = (newMessage) => { messageReducer({ action: "add", new: newMessage, chat_id: newMessage.chat_id }) }
    const popMessageUI = () => { messageReducer({ action: "pop" }) }


    const readMessages = (chat_id) => { chatsReducer({ chat_id: chat_id, "action": "mod", "read": true }) }
    const addMessageToChatCount = (chat_id, timestamp) => { chatsReducer({ chat_id: chat_id, "action": "mod", "read": false, "last_timestamp": timestamp }) }
    const addNewChatUI = async (chat) => {
        chatsReducer({ "action": "add", "new": chat })
    }
    const setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    const delChatUI = (chat_id) => { chatsReducer({ "action": "del", chat_id: chat_id }) }


    let { db, loading } = useIndexedDB()

    useEffect(() => {
        async function get_chats_callback() {
            if (db) {
                let chats = await get_all_double_ratchet_sess(db)
                setNewChats(chats)
            }
        }
        get_chats_callback()

    }, [db])


    let [{ user_id, identityKey,  verifierKey, signedPreKey, expiration },set_ident_info] = useContext(identity_context)

    const convert_proto_chat_msg = (message_proto, message_contents, message_header, message_key) => {
        return {
            chat_id: message_header.chat_id || message_header.senderId, // if chat id is not given, the sender_id identitfies the chat as the direct chat
            sender_id: message_header.senderId,
            contents: message_contents,
            timestamp: message_proto.timestamp,
            message_key: message_key
        }
    }

    const onMessage = async (message) => {
        console.log("New STOMP message!")
        let chat_message = ChatMessage.decode(message.binaryBody)
        if (chat_message.messageHeader) {
            // X3DH message
            let otp = !chat_message.messageHeader.oneTimePrekey || await getOneTimePrekeyWithPubKey(db, chat_message.messageHeader.oneTimePrekey)
            // if a one time prekey is specified
            let { KM, chat_id } = await handle_X3DH_message(db, identityKey, signedPreKey, chat_message, otp)

            let sender_id = chat_message.messageHeader.senderId

            let name = await getUsername(db, sender_id)

            let other_dh_public = chat_message.messageHeader.dhPublicKey

            let dr_session = await create_double_ratchet_recipient(identityKey, chat_id, sender_id, name, other_dh_public, KM)
            await init_ratchet_root_receiver(dr_session)

            await store_double_ratchet_session(db, dr_session)
            await store_chat(db, create_chat_object(sender_id, name, "DIRECT"))

            addNewChatUI({ chat_id: chat_id, user_id: sender_id, name: name })
        } else {


            // nortmal message, decrypt with double ratchet algo
            let { message_contents,messageHeader, message_key } = await handle_message(db,  chat_message)

            console.log(message_contents)

            let msg_obj = convert_proto_chat_msg(chat_message, message_contents, messageHeader, message_key )
            let chat_object = await get_chat(db, msg_obj.chat_id)
            await store_message(db, msg_obj)
            addMessageUI(msg_obj)
            if (currentChat && chat_object.chat_id === currentChat.chat_id)
                readMessages(chat_object.chat_id)
            addMessageToChatCount(chat_object.chat_id, chat_message.timestamp)
        }



    } // PUT notification symbol on chat
    useSubscription("/user/messages", onMessage)
    const client = useStompClient()

    const sendMessage = async (chat_id, text, file_object) => {
        let contents = await send_new_encrypted_message(client, db, chat_id, { text: text, file: file_object })
        let timestamp = Date.now()
        const message = { chat_id: chat_id, contents: contents, sender_id: user_id, timestamp: timestamp, message_key: contents.message_key }
        await store_message(db, message)
        readMessages(chat_id)
        addMessageUI(message)
    }
    const setMessages = (chat_id, messages) => {
        messageReducer({ action: "init", chat_id: chat_id, messages: messages })
    }

    const createNewChat = async () => {
        if (!identityKey || !signedPreKey) {
            alert("No identity loaded");
            return
        }
        let name = prompt("Enter Username:");
        if (!name) {
            return
        }
        await send_X3DH_message(db, client, user_id, name, identityKey , signedPreKey, verifierKey)
        addNewChatUI({ chat_id: chat_id, user_id: other_id, name: name })
    }
    const leaveChat = async (chat_id) => {

        await delete_chat(db, chat_id);
        delChatUI(chat_id);
        if (currentChat && chat_id === currentChat.chat_id)
            setCurrentChat(undefined)

    }
    const onChatClick = async (chat_object) => {
        if (currentChat && currentChat.chat_id === chat_object.chat_id)
            return
        let chat_messages = messages[chat_object.chat_id] || await get_messages(db, chat_object.chat_id)
        const chat_id = chat_object.chat_id
        setMessages(chat_id, chat_messages)
        setCurrentChat({ ...chat_object })
        readMessages(chat_id)
    }

    return <Container fluid><Row>
        <Col sm={2} >
            <Stack>
                <Link className='btn btn-danger' to={"/login"} onClick={async (e) => {
                    await logout()
                    setAxiosCSRF(await getCSRF())
                    logoutCallback()
                }} >Logout</Link>
                <Link className='btn btn-primary' to={"/profile"} >Edit Profile</Link>
            </Stack>
        </Col>
        <Col sm={4} >
            <ChatListBar chats={chats} onChatLeave={leaveChat} onChatClick={onChatClick} onChatJoin={(e) => { }} onChatCreate={createNewChat} />
        </Col>
        <Col sm={6}>
            {currentChat && <ChatWindow user_id={user_id} chat_object={currentChat} messages={(messages && messages[currentChat.chat_id]) || []} onMessageSend={sendMessage} />}
        </Col>
    </Row>
    </Container>
}

export default ChatPage

import { useContext, useEffect, useReducer, useState } from 'react'
import { Stack, Col, Container, Row } from 'react-bootstrap'
import { Link, useLocation } from 'react-router'
import { createChat, getCSRF, getPrekeyBundle, getUsername, getUserProfile, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { decrypt_chat_message, init_ratchet_root_receiver, init_ratchet_root_sender, test_all_skipped_messages_for_session } from '../../utils/RatchetUtils'
import { handle_X3DH_message, send_X3DH_message } from '../../utils/X3DHUtils'
import { handle_new_encrypted_message, send_new_encrypted_message } from '../../utils/MessagingUtils'
import { ChatMessage } from '../../utils/protocol/messages'
import { create_chat_object, create_double_ratchet_recipient, delete_chat, delete_skipped_message, get_all_chats, get_all_double_ratchet_sess, get_chat, get_double_ratchet_session, get_messages, getOneTimePrekeyWithPubKey, store_chat, store_double_ratchet_session, store_message, useIdentityInformation, useIndexedDB, USER_ADDED } from '../../utils/StorageUtils'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { identity_context, user_id_context } from '../../globals'
import GroupChatCreate from '../chat/GroupChatCreate'


function ChatPage({ logoutCallback }) {

    let location = useLocation()
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
    const chatInUI = (chat_id) => chats.find((chat) => chat.chat_id === chat_id)


    let { db, loading } = useIndexedDB()

    useEffect(() => {
        async function get_chats_callback() {
            if (db) {
                let chats = await get_all_chats(db) || []
                setNewChats(chats)
            }
        }
        get_chats_callback()

    }, [db])


    let [ident_info, set_ident_info] = useContext(identity_context)
    let [user_id, set_user_id] = useContext(user_id_context)


    let [show_chat_modal, set_chat_modal] = useState(false)

    const onMessageNormal = async (chat_message, dr_session = null) => {
        let { msg_obj, chat_object } = await handle_new_encrypted_message(db, client, chat_message, ident_info, dr_session)

        if (chat_object && !chatInUI(chat_object.chat_id))
            addNewChatUI(chat_object)

        if (msg_obj)
            addMessageUI(msg_obj)

        if (currentChat && chat_object && chat_object.chat_id === currentChat.chat_id)
            readMessages(chat_object.chat_id)

        if (chat_object)
            addMessageToChatCount(chat_object.chat_id, chat_message.timestamp)

    }

    const onMessage = async (message) => {
        console.log("New STOMP message!")
        let chat_message = ChatMessage.decode(message.binaryBody)
        if (chat_message.messageHeader) {
            // X3DH message
            let new_dr_session = await handle_X3DH_message(db, ident_info.identityKey, ident_info.signedPrekey, chat_message)

            let found_skipped_messages = await test_all_skipped_messages_for_session(db, new_dr_session)
            found_skipped_messages.forEach(
                async (skipped_msg) => {
                    await onMessageNormal(skipped_msg, new_dr_session);
                    await delete_skipped_message(db, skipped_msg)
                })
        } else {
            // nortmal message, decrypt with double ratchet algo
            await onMessageNormal(chat_message)
        }

    } // PUT notification symbol on chat
    useSubscription("/user/messages", onMessage)
    const client = useStompClient()

    const sendMessage = async (chat_id, text, file_object) => {
        let chat_object = await get_chat(db, chat_id)
        let { message_contents,type, message_key, timestamp } = await send_new_encrypted_message(client, db, chat_id, { text: text, file: file_object }, user_id, chat_object.type )
        const message = { type:type, message_contents: message_contents, sender_id: user_id, timestamp: timestamp, message_key: message_key}
        await store_message(db, message, chat_object)
        message.chat_id = chat_id
        readMessages(chat_id)
        addMessageUI(message)
    }
    const setMessages = (chat_id, messages) => {
        messageReducer({ action: "init", chat_id: chat_id, messages: messages })
    }

    const onInviteUser=async  (chat)=>{
        let other_username = prompt("Enter username")
        let prekey_bundle_other = await getPrekeyBundle(other_username)
        let other_id = prekey_bundle_other.id
        let msg = await send_new_encrypted_message(client, db, chat.chat_id, {userId:other_id}, user_id,ident_info, USER_ADDED)
        addMessageUI(msg)
    }

    const onChatToNewUser = async () => {
        if (!ident_info) {
            alert("No identity loaded");
            return
        }
        let other_name = prompt("Enter Username:");
        if (!other_name) {
            return
        }
        try {
            let prekey_bundle_other = await getPrekeyBundle(other_name)
            let other_id = prekey_bundle_other.id
            // if chat is already in ui, dont bother
            if (chatInUI(other_id)) {
                return
            }
            // if a chat exists, then double ratchet session must exist
            if (!(await get_double_ratchet_session(db, other_id))) {
                await send_X3DH_message(db, client, user_id, other_id, other_name, ident_info.identityKey, ident_info.signedPreKey, ident_info.verifierKey, prekey_bundle_other)
            }
            let  chat_object = await create_chat_object(other_id, other_name, "DIRECT")
            await store_chat(db, chat_object)
           
            // for debugging
            if (!chat_object)
                throw new Error("Cannot add empty chat in UI")

            addNewChatUI(chat_object)
        } catch (e) {
            if (e.code && e.code==404) {
                alert("failed to get prekey bundle")
            } else {
                throw e
            }
        }
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
                    logoutCallback()
                    location.pathname = "/login"
                }} >Logout</Link>
                <Link className='btn btn-primary' to={"/profile"} >Edit Profile</Link>
            </Stack>
        </Col>
        <Col sm={4} >
            <ChatListBar chats={chats} onChatLeave={leaveChat} onChatClick={onChatClick} onMessageUser={onChatToNewUser} onChatCreate={()=>{set_chat_modal(true)}} />
        </Col>
        <Col sm={6}>
            {currentChat && <ChatWindow onInviteUser={onInviteUser} chat_object={currentChat} messages={(messages && messages[currentChat.chat_id]) || []} onMessageSend={sendMessage} />}
        </Col>
    </Row>
    <GroupChatCreate show={show_chat_modal} onChatCreate={(chat) => { addNewChatUI(chat); set_chat_modal(false) }} onClose={() => { set_chat_modal(false) }} />
    </Container>
}

export default ChatPage

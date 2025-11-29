import { useContext, useEffect, useReducer, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { userIdContext } from '../../globals'
import { getCSRF, getPrekeyBundle, getUsername, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { handle_message, init_ratchet_root_receiver, init_ratchet_root_sender } from '../../utils/RatchetUtils'
import { handle_X3DH_message } from '../../utils/X3DHUtils'
import { send, send_new_encrypted_message } from '../../utils/WebsocketUtils'
import { ChatMessage, MessageType, MessageHeader } from '../../utils/protocol/messages'
import { generate25519KeyExchangePair, exportX25519PublicKey, X3DH_send } from '../../utils/CryptoUtils'
import { create_chat_object_recipient, create_chat_object_sender, delete_chat, get_all_chats, get_chat_info, get_messages, getOneTimePrekeyWithPubKey, store_chat, store_message, useIdentityInformation, useIndexedDB } from '../../utils/StorageUtils'
import { v4 } from 'uuid'
import { useStompClient, useSubscription } from 'react-stomp-hooks'


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
                return { ...prev , chat_id:[...chatMessages.slice(0,-1)]}
            case "add":
                return { ...prev, [chat_id]:[...chatMessages, action.new].sort((a, b) => a.timestamp - b.timestamp) }
            case "init":
                prev[chat_id] =  [...action.messages]
                return {...prev}
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

    let [user_id, set_user_id] = useContext(userIdContext)

    let { db, loading } = useIndexedDB()

    useEffect(() => {
        async function get_chats_callback() {
            if (db) {
                let chats = await get_all_chats(db)
                setNewChats(chats)
            }
        }
        get_chats_callback()

    }, [db])


    let { identity, verifier_key, signed_prekey, expiration } = useIdentityInformation(db, user_id)

    const convert_proto_chat_msg = (message_proto,chat_object)=>{
        return {
            chat_id:chat_object.chat_id,
            sender_id:chat_object.user_id,
            contents:message_proto.message_contents,
            timestamp:message_proto.timestamp*1000,
            message_key:message_proto.message_key
        }
    }

    const onMessage = async (message) => {
        console.log("New STOMP message!")
        let chat_message = ChatMessage.decode(message.binaryBody)
        if (chat_message.messageHeader ) {
            // X3DH message
            let otp = !chat_message.messageHeader.oneTimePrekey || await getOneTimePrekeyWithPubKey(db, chat_message.messageHeader.oneTimePrekey)
            // if a one time prekey is specified
            let  {KM, chat_id} = await handle_X3DH_message(db, identity, signed_prekey, chat_message, otp)

            let sender_id = chat_message.messageHeader.senderId

            let name = await getUsername(db, sender_id)

            let other_dh_public = chat_message.messageHeader.dhPublicKey

            let chat_object = await create_chat_object_recipient(identity, chat_id, sender_id, name, other_dh_public, KM)
            await init_ratchet_root_receiver(chat_object)

            await store_chat(db, chat_object)

            addNewChatUI({chat_id:chat_id,user_id:sender_id, name:name})
        } else {


            // nortmal message, decrypt with double ratchet algo
            let {message_contents, message_key, chat_object } = await handle_message(db, identity, chat_message)
            
            console.log(message_contents)

            let decrypted_chat_message = { ...chat_message, message_contents, message_key }
            let msg_obj = convert_proto_chat_msg( decrypted_chat_message, chat_object)
            await store_message(db,msg_obj)

            addMessageUI(msg_obj)
            if (currentChat && chat_object.chat_id === currentChat.chat_id)
                readMessages(chat_object.chat_id)
            addMessageToChatCount(chat_object.chat_id, decrypted_chat_message.timestamp)
        }



    } // PUT notification symbol on chat
    useSubscription("/user/messages", onMessage)
    const client = useStompClient()

    const sendMessage = async (chat_id, text, file_object) => {
        let contents = await send_new_encrypted_message(client, db, chat_id, { text: text, file: file_object })
        let timestamp =Date.now() 
        const message = {chat_id:chat_id, contents: contents,sender_id:user_id , timestamp:timestamp, message_key:contents.message_key}
        await store_message(db,message )
        readMessages(chat_id)
        addMessageUI(message)
    }
    const setMessages= (chat_id,messages) => {
        messageReducer({action:"init",chat_id:chat_id, messages:messages})
    }

    const createNewChat = async () => {
        if (!identity || !signed_prekey) {
            alert("No identity loaded");
            return
        }
        let name = prompt("Enter Username:");
        if (!name) {
            return
        }
        let prekey_bundle = await getPrekeyBundle(name)
        let other_id = prekey_bundle.id
        let { KM, AD, AD_encrypted, AD_IV, ephemeralKeyPair, onetime_prekey, chat_id } = await X3DH_send({ identityKey: identity, verifierKey: verifier_key, signedPrekey: signed_prekey }, prekey_bundle)
        let ephemeral_key_bytes = await exportX25519PublicKey(ephemeralKeyPair.publicKey)

        let sender_ratchet_key = await generate25519KeyExchangePair()
        let sender_ratchet_key_bytes = await exportX25519PublicKey(sender_ratchet_key.publicKey)
        let msg_header_js = { type: "JOINED", messageIv: AD_IV, chainLength: 0, dhPublicKey: sender_ratchet_key_bytes, ephemeralKey: ephemeral_key_bytes, oneTimePrekey: await exportX25519PublicKey(onetime_prekey), senderId: user_id }
        let messageHeader = MessageHeader.fromObject(msg_header_js)
        let chat_message = ChatMessage.fromObject({ messageHeader: messageHeader, messageContentsEncrypted: AD_encrypted, timestamp: new Date().getTime() })

        if (client) {
            send(client, other_id, chat_message)
        } else {
            console.error("No stomp connection")
        }
        console.log("shared root key")
        console.log(KM)
        console.log(`AD:${AD}`)
        let chat_object = await create_chat_object_sender(chat_id, other_id, name, sender_ratchet_key, prekey_bundle.identityKey, KM)
        await init_ratchet_root_sender(chat_object)
        await store_chat(db, chat_object)
        addNewChatUI({chat_id:chat_id,user_id:other_id,name:name})
    }
    const leaveChat = async (chat_id) => {

        await delete_chat(db, chat_id);
        delChatUI(chat_id);
        if (currentChat && chat_id === currentChat.chat_id)
            setCurrentChat( undefined)

    }
    const onChatClick = async (chat_object) =>{
        if (currentChat && currentChat.chat_id === chat_object.chat_id)
            return
        let chat_messages =  messages[chat_object.chat_id] || await get_messages(db,chat_object.chat_id)
        const chat_id = chat_object.chat_id
        setMessages(chat_id, chat_messages)
        setCurrentChat( {...chat_object} )
        readMessages(chat_id)
    } 

    return <Container className='vh-100 vw-100'>
        <Link style={{ width:"6%"}} className='btn btn-danger position-fixed top-0 start-0' to={"/login"} onClick={async (e) => {
            await logout()
            setAxiosCSRF(await getCSRF())
            logoutCallback()
        }} >Logout</Link>
        <Link style={{top:"40px", width:"6%"}} className='btn btn-primary position-fixed start-0 ' to={"/profile"} >Edit Profile</Link>
        <Container>
            <Row fluid={"true"} >
                <Col sm={4} >
                    <ChatListBar chats={chats} onChatLeave={leaveChat} onChatClick={onChatClick} onChatJoin={(e) => { }} onChatCreate={createNewChat} />
                </Col>
                <Col sm={8}>
                    {currentChat && <ChatWindow chat_object={currentChat} messages={(messages && messages[currentChat.chat_id]) || []} onMessageSend={sendMessage}  />}
                </Col>
            </Row>
        </Container>
    </Container>

}

export default ChatPage

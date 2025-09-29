import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Col, Container, ListGroup, ListGroupItem, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router'
import { userContext, userIdContext } from '../../globals'
import { createChat, deleteChatRequest, getChats, getCSRF, getPrekeyBundle, getUsername, join, leaveChatRequest, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import { performActionWithAlert } from '../../utils/UIUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import {  activate, broker_url, disconnect, handle_message, handle_X3DH_message, listenForMessages, send, send_new_encrypted_message, subscribe, unSubscribe } from '../../utils/WebsocketUtils'
import {ChatMessage, MessageType,MessageHeader, MessageContents} from '../../utils/protocol/messages' 
import {generate25519KeyExchangePair, exportX25519PublicKey, extractC25519ExchangePublicKey, X3DH_send } from '../../utils/CryptoUtils'
import { create_chat_object_recipient, create_chat_object_sender, getOneTimePrekeyWithPubKey, store_chat, store_message, useIdentityInformation, useIndexedDB } from '../../utils/StorageUtils'
import {v4} from 'uuid'
import { StompConfig, useStompClient, useSubscription } from 'react-stomp-hooks'


function ChatPage({ logoutCallback }) {

    let [currentChat, setCurrentChat] = useState("")

    let [chats, chatsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "init":
                return action.data.map((chat) => { return { ...chat, "new_message": 0, "last_timestamp": 0 } })
            case "add":
                return [...prev, { ...action.new, "new_message": 0, "last_timestamp": 0 }].sort((a, b) => b.last_timestamp - a.last_timestamp)
            case "del":
                return prev.filter((chat) => chat.chatId !== action.chatId);
            case "mod":
                return prev.map((chat) => {
                    if (chat.chatId !== action.chatId)
                        return { ...chat }
                    return { ...chat, new_message: action.read ? 0 : chat.new_message + 1, "last_timestamp": action.last_timestamp || chat.last_timestamp }
                }).sort((a, b) => b.last_timestamp - a.last_timestamp)
        }
    }, [])

    let [messages, messageReducer] = useReducer((prev, action) => {
        let chatId = action.chatId
        let chatMessages = prev[chatId] || []
        switch (action.action) {
            case "pop":
                chatMessages.pop()
                prev[chatId] = [...chatMessages]
                return { ...prev }
            case "add":
                prev[chatId] = [...chatMessages, action.new].sort((a, b) => a.timestamp - b.timestamp)
                return { ...prev }
        }
    }, {})


    let addMessageUI = (newMessage) => { messageReducer({ action: "add", new: newMessage, chatId: newMessage.chatId }) }
    let popMessageUI = () => { messageReducer({ action: "pop" }) }


    let readMessages = (chat_id) => { chatsReducer({ "chatId": chat_id, "action": "mod", "read": true }) }
    let addMessageToChatCount = (chat_id, timestamp) => { chatsReducer({ "chatId": chat_id, "action": "mod", "read": false, "last_timestamp": timestamp }) }
    let addNewChatUI = async (chat_id, name) => {
        chatsReducer({ "action": "add", "new": { "chatId": chat_id, "name": name } })
    }
    let setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    let delChatUI = (chat_id) => { chatsReducer({ "action": "del", "chatId": chat_id }) }

    let [user_id, set_user_id ] = useContext(userIdContext)

    let {db, loading} = useIndexedDB() 

    // useEffect(()=>{

    // },[])


    let {identity, verifier_key, signed_prekey, expiration } = useIdentityInformation(db,user_id)

    let onMessage = async (message) => {
        console.log("New STOMP message!")
        let chat_message = ChatMessage.decode(message.binaryBody)
        if (chat_message.messageHeader.type == MessageType.JOINED){
            // X3DH message
            let otp = !chat_message.messageHeader.oneTimePrekey || await getOneTimePrekeyWithPubKey(db,chat_message.messageHeader.oneTimePrekey)
            let KM  = await handle_X3DH_message(identity, signed_prekey, chat_message, otp)
            let sender_id = chat_message.messageHeader.senderId
            let name = await getUsername(sender_id)
            let chat_id = chat_message.chatId
            let other_dh_public = chat_message.messageHeader.dhPublicKey
            let chat_object = await create_chat_object_recipient(identity.privateKey, chat_id, sender_id,name,other_dh_public ,KM)
            await store_chat(db, chat_object)
            addNewChatUI(chat_id, name)
        }else{
            // nortmal message, decrypt with double ratchet algo
            let messageContents = await handle_message(db,identity, chat_message)
            console.log(messageContents)
            let decrypted_chat_message = {...chat_message, messageContents}
            await store_message(db, decrypted_chat_message)

            addMessageUI(decrypted_chat_message)
            addMessageToChatCount(decrypted_chat_message.chatId, decrypted_chat_message.timestamp)
        }



    } // PUT notification symbol on chat
    useSubscription("/user/messages", onMessage)
    const client = useStompClient()

    // let connect_chat = (chat_id) => { subscribeToChat(chat_id, 0) }
    // let disconnect_chat = (chat_id) => { unSubscribe() }


    let sendMessage = async (chat_id,text, file_blob) => {
        // addMessageUI(newMessage)
        send_new_encrypted_message(client, db,chat_id,{text:text} )
    }


    let createNewChat = async () => { 
        if (!identity || !signed_prekey){
            alert("No identity loaded");
            return
        } 
        let name = prompt("Enter Username:"); 
        if (!name){
            return
        }
        let prekey_bundle =await getPrekeyBundle(name)
        let other_id = prekey_bundle.id
        let {KM, AD,AD_encrypted, AD_IV, ephemeralKeyPair, onetime_prekey} = await X3DH_send({identityKey:identity,verifierKey:verifier_key, signedPrekey:signed_prekey}, prekey_bundle)
        let ephemeral_key_bytes = await exportX25519PublicKey(ephemeralKeyPair.publicKey)

        let sender_ratchet_key = await generate25519KeyExchangePair()
        let sender_ratchet_key_bytes= await exportX25519PublicKey(sender_ratchet_key.publicKey)
        let messageHeader = MessageHeader.fromObject({type:"JOINED", messageIv:AD_IV, chainLength:0 , dhPublicKey:sender_ratchet_key_bytes, ephemeralKey:ephemeral_key_bytes, oneTimePrekey:await exportX25519PublicKey(onetime_prekey), senderId:user_id })
        let chat_id = v4() // generate chat_id
        let chat_message = ChatMessage.fromObject({chatId:chat_id, messageHeader:messageHeader, messageContentsEncrypted:AD_encrypted, timestamp:new Date().getTime() })

        if (client){
            send(client,other_id,chat_message)
        }else{
            console.error("No stomp connection")
        }
        console.log("shared root key")
        console.log(KM)
        console.log(`AD:${AD}`)
        let chat_object = await create_chat_object_sender(chat_id, other_id,name, sender_ratchet_key.privateKey,prekey_bundle.identityKey,KM)
        await store_chat(db, chat_object)
        addNewChatUI(chat_id, name)
    }
    let leaveChat = async (chat_id) => {  delChatUI(chat_id);  }
    let deleteChat = async (chat_id) => {  delChatUI(chat_id);  }

    return <Container className='vh-100 vw-100'>
        <Link className='btn btn-danger position-fixed top-0 start-0' to={"/login"} onClick={async (e) => {
            await logout()
            setAxiosCSRF(await getCSRF())
            logoutCallback()
        }} >Logout</Link>
        <Link className='btn btn-primary' to={"/profile"} >Edit Profile</Link>
        <Container>
            <Row fluid={"true"} >
                <Col sm={4} >
                    <ChatListBar chats={chats} onChatDelete={deleteChat} onChatLeave={leaveChat} onChatClick={setCurrentChat} onChatJoin={(e)=>{}} onChatCreate={createNewChat} />
                </Col>
                <Col sm={8}>
                    {currentChat && <ChatWindow chat_id={currentChat.chatId} onMessageSend={sendMessage} messages={messages[currentChat.chatId] || []} />}
                </Col>
            </Row>
        </Container>
    </Container>

}

export default ChatPage

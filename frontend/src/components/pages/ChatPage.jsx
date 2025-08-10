import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Col, Container, ListGroup, ListGroupItem, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router'
import { userContext, userIdContext } from '../../globals'
import { createChat, deleteChatRequest, getChats, getCSRF, join, leaveChatRequest, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import { performActionWithAlert } from '../../utils/UIUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { ChatWSMessage, MessageContents, activate, broker_url, disconnect, listenForMessages, send, subscribe, subscribeToChat, unSubscribe } from '../../utils/WebsocketUtils'


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
    let addNewChatUI = async (chat_id, owner_id, name) => {
        chatsReducer({ "action": "add", "new": { "chatId": chat_id, "ownerId": owner_id, "name": name } })
    }
    let setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    let delChatUI = (chat_id) => { chatsReducer({ "action": "del", "chatId": chat_id }) }

    let onMessage = async (message) => {
        console.log(message)
        let message_body = JSON.parse(message.body)
        addMessageUI(message_body)
        addMessageToChatCount(message_body.chatId, message_body.timestamp)
    } // PUT notification symbol on chat
    let connect_chat = (chat_id) => { subscribeToChat(chat_id, 0) }
    let disconnect_chat = (chat_id) => { unSubscribe(chat_id) }


    useEffect(() => {
        async function getChatsConnect() {
            let newChats = await getChats()
            activate((frame) => { setNewChats(newChats); newChats.forEach((chat) => connect_chat(chat.chatId)); listenForMessages(onMessage); })
        }
        getChatsConnect()
        return () => { disconnect() }
    }, [])


    let sendMessage = async (contents, file_id=undefined) => {
        let newMessage = new ChatWSMessage(currentChat.chatId, new MessageContents(contents, file_id))
        // addMessageUI(newMessage)
        send(newMessage)
    }


    let createNewChat = async () => { let name = prompt("Enter Name:"); let chat = await createChat(name); addNewChatUI(chat.chatId, chat.ownerId, name); connect_chat(chat.chatId) }
    let joinChat = async (chat_id) => { let chat = await join(chat_id); addNewChatUI(chat_id, chat.ownerId, chat.name); connect_chat(chat_id) }
    let leaveChat = async (chat_id) => { await leaveChatRequest(chat_id); delChatUI(chat_id); disconnect_chat(chat_id) }
    let deleteChat = async (chat_id) => { await deleteChatRequest(chat_id); delChatUI(chat_id); disconnect_chat(chat_id) }

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
                    <ChatListBar chats={chats} onChatDelete={deleteChat} onChatLeave={leaveChat} onChatClick={setCurrentChat} onChatJoin={joinChat} onChatCreate={createNewChat} />
                </Col>
                <Col sm={8}>
                    {currentChat && <ChatWindow onMessageSend={sendMessage} messages={messages[currentChat.chatId] || []} />}
                </Col>
            </Row>
        </Container>
    </Container>

}

export default ChatPage

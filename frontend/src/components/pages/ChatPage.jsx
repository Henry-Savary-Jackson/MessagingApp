import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Container, ListGroup, ListGroupItem, Stack } from 'react-bootstrap'
import { Link } from 'react-router'
import { userContext } from '../../globals'
import { createChat, getChats, getCSRF, join, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import { performActionWithAlert } from '../../utils/UIUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { MessageContents, activate, broker_url, disconnect, send, subscribe, unSubscribe } from '../../utils/WebsocketUtils'
import ChatMessage from '../chat/ChatMessage'
import { useStompClient, useSubscription, StompSessionProvider, withStompClient } from 'react-stomp-hooks'


function ChatPage({ logoutCallback }) {

    let [user, setUser] = useContext(userContext)
    let [currentChat, setCurrentChat] = useState("")
    let client = useStompClient()

    let [chats, chatsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "init":
                return action.data.map((chat_id) => { return { "chat_id": chat_id, "new_message": 0 } })
            case "add":
                return ([...prev, { "chat_id": action.chat_id, "new_message": 0 }]).sort((a, b) => a.new_message - b.new_message)
            case "del":
                return prev.filter((chat) => chat.chatId !== action.chat_id);
            case "mod":
                return prev.map((chat) => {
                    if (chat.chatId !== action.chat_id)
                        return chat
                    return { ...chat, new_message: action.read ? 0 : chat.new_message + 1 }
                })
        }
    }, [])

    let messageMap = useRef(new Map())

    let [messages, messageReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "pop":
                return prev + action.new
            case "add":
                prev.pop()
                return [...prev]
            case "reset":
                return []
            case "init":
                return action.messages
        }
    }, [])

    let setMesssagesUI = (newMessages) => { messageReducer({ action: "init", messages: newMessages }) }
    let addMessageUI = (newMessage) => { messageReducer({ action: "add", new: newMessage }) }
    let popMessageUI = () => { messageReducer({ action: "pop" }) }
    let resetMessagesUI = () => { messageReducer({ action: "reset" }) }


    let readMessages = (chat_id) => { chatsReducer({ "chat_id": chat_id, "action": "mod", "read": true }) }
    let addMessageToChatCount = (chat_id) => { chatsReducer({ "chat_id": chat_id, "action": "mod", "read": false }) }
    let addNewChatUI = async (chat_id) => {
        chatsReducer({ "action": "add", "chat_id": chat_id })
    }
    let setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    let delChat = (chat_id) => { chatsReducer({ "action": "del", "chat_id": chat_id }) }

    useEffect(() => {
        async function getChatsConnect() {
            let newChats = await getChats()
            await activate(client)

            client.onConnect((frame) => { setNewChats(newChats); newChats.forEach(connect_chat); })
        }
        getChatsConnect()
        return () => { disconnect() }
    }, [])

    useEffect(() => {
        resetMessagesUI()
        setMesssagesUI(messageMap.current[currentChat] || [])
    }, [currentChat])

    useEffect(() => {
        messageMap.current[currentChat] = messages
    }, [messages])


    let onMessage = async (message) => {
        console.log(message)
        let message_body = JSON.parse(message.body)
        addMessageUI(message_body)
        addMessageToChatCount(message_body.chatId)
    } // PUT notification symbol on chat
    let connect_chat = async (chat_id) => { subscribe(client, chat_id, onMessage, 0) }
    let disconnect_chat = async (chat_id) => { await unSubscribe(chat_id) }


    let sendMessage = async (contents) => {
        let newMessage = new ChatMessage(currentChat, new MessageContents(contents))
        addMessageUI(newMessage)
        await send(client, newMessage)
    }


    let createNewChat = async () => { let chat_id = await createChat(); addNewChatUI(chat_id) }
    let joinChat = async (chat_id) => { await join(chat_id); addNewChatUI(chat_id) }

    return <Stack>
        <Link to={"/login"} onClick={async (e) => {
            await logout()
            setAxiosCSRF(await getCSRF())
            logoutCallback()
        }} >Logout</Link>
        <Container>
            <ChatListBar chats={chats} onChatClick={setCurrentChat} onChatJoin={joinChat} onChatCreate={createNewChat} />
            {currentChat && <ChatWindow onMessageSend={sendMessage} messages={messages} />}
        </Container>
    </Stack>

}

export default ChatPage

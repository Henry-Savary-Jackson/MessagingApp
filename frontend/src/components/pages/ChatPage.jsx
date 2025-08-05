import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Container, ListGroup, ListGroupItem, Stack } from 'react-bootstrap'
import { Link } from 'react-router'
import { userContext } from '../../globals'
import { createChat, getChats, getCSRF, join, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import { performActionWithAlert } from '../../utils/UIUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { MessageContents, activate, disconnect, send, subscribe, unSubscribe } from '../../utils/WebsocketUtils'
import ChatMessage from '../chat/ChatMessage'


function ChatPage({ }) {

    let [user, setUser] = useContext(userContext)
    let [currentChat, setCurrentChat] = useState("")
    let [chats, chatsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "init":
                return action.data.map((chat_id) => { return { "chat_id": chat_id, "new_message": 0 } })
            case "add":
                return (prev + [{ "chat_id": action.data, "new_message": 0 }]).sort((a, b) => a.new_message - b.new_message)
            case "del":
                return prev.filter((chat) => chat.chat_id !== action.data);
            case "mod":
                return prev.map((chat) => {
                    if (chat.chat_id !== action.chat_id)
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


    let readMessages = (chat_id) => { chatsReducer({ "action": "mod", "read": true }) }
    let addMessageToChatCount = (chat_id) => { chatsReducer({ "action": "mod", "read": false }) }
    let addNewChatUI = async (chat_id) => {
        chatsReducer({ "action": "add", "data": chat_id })
    }
    let setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    let delChat = (chat_id) => { chatsReducer({ "action": "del", "data": chat_id }) }

    useEffect(() => {
        async function getChatsConnect() {
            let chats = await getChats()
            await activate()
            setNewChats(chats)

            chats.forEach(connect_chat);
        }
        getChatsConnect()
        return async () => { await disconnect() }
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
        addMessageUI(JSON.parse(message.body))
     } // PUT notification symbol on chat
    let connect_chat = async (chat_id) => { subscribe(user, chat_id, onMessage, 0) }
    let disconnect_chat = async (chat_id) => { await unSubscribe(chat_id) }

    return <Stack>
        <Link to={"/login"} onClick={async (e) => {
            await logout()
            setAxiosCSRF(await getCSRF())
            setUser("")
        }} >Logout</Link>
        <Container>
            <ChatListBar chats={chats} onChatClick={setCurrentChat} onChatJoin={async (chat_id) => { await join(chat_id); addNewChatUI(chat_id) }} onChatCreate={async (chat_id) => { await createChat(chat_id); addNewChatUI(chat_id) }} />
            {currentChat && <ChatWindow onMessageSend={async(contents) => {
                let newMessage = new ChatMessage(currentChat, new MessageContents(contents))
                addMessageUI(newMessage)
                await send(newMessage)}} messages={messages} />}

        </Container>
    </Stack>

}

export default ChatPage

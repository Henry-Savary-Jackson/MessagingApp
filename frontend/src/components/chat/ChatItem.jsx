import { Button, Container } from "react-bootstrap"

function ChatItem({ onChatDelete, chat, onChatClick, onChateLeave, user_id }) {
    return <Container key={chat.chatId} >
        <span onClick={(e) => { onChatClick(chat) }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChateLeave(chat.chatId) }} variant="danger">Leave</Button>
        <Button onClick={(e) => { navigator.clipboard.writeText(chat.chatId) }} variant="success">Share</Button>
        {chat.ownerId == user_id && <Button onClick={(e) => { onChatDelete(chat.chatId) }} variant="danger">Remove</Button>}
    </Container>
}

export default ChatItem
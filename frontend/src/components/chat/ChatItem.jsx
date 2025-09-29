import { Button, Container, Stack } from "react-bootstrap"

function ChatItem({ onChatDelete, chat, onChatClick, onChatLeave}) {
    return <Stack direction="horizontal" gap={1} key={chat.chatId} >
        <span onClick={(e) => { onChatClick(chat) }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chatId) }} variant="danger">Leave</Button>
        <Button onClick={(e) => { navigator.clipboard.writeText(chat.chatId) }} variant="success">Share</Button>
        <Button onClick={(e) => { onChatDelete(chat.chatId) }} variant="danger">Remove</Button>
    </Stack>
}

export default ChatItem
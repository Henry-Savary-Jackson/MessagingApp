import { Button, Container, Navbar, NavbarCollapse, NavItem, Stack } from "react-bootstrap";


function ChatListBar({ chats, onChatClick, onChatCreate, onChatJoin }) {
    return <Stack>
        <Button onClick={(e) => {
            let uuid = window.prompt("Put chat UUID:")
            if (!uuid)
                return;
            onChatJoin(uuid)
        }} >Join a chat</Button>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button>
        <Stack>
            {chats.map((chat) => <Container key={chat.chat_id} onClick={(e) => { onChatClick(chat) }}>{chat.chat_id}:{chat.new_message}</Container>)}
        </Stack>
    </Stack>
}


export default ChatListBar
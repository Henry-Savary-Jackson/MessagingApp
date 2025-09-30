import { Button, Container, Navbar, NavbarCollapse, NavItem, Stack } from "react-bootstrap";
import ChatItem from "./ChatItem";


function ChatListBar({ chats, onChatClick, onChatCreate, onChatJoin, onChatLeave  }) {
    return <Stack className="border vh-100 " gap={3}>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button>
        <Stack className="overflow-y-scroll mh-100"  gap={2}>
            {chats.map((chat) => <ChatItem key={chat.chat_id} chat={chat} onChatClick={onChatClick} onChatLeave={onChatLeave} /> )}
        </Stack>
    </Stack>
}


export default ChatListBar
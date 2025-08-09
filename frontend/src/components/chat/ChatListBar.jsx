import { Button, Container, Navbar, NavbarCollapse, NavItem, Stack } from "react-bootstrap";
import ChatItem from "./ChatItem";


function ChatListBar({ chats,user_id, onChatClick, onChatCreate, onChatJoin,onChatDelete, onChatLeave  }) {
    return <Stack gap={3}>
        <Button onClick={(e) => {
            let uuid = window.prompt("Put chat UUID:")
            if (!uuid)
                return;
            onChatJoin(uuid)
        }} >Join a chat</Button>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button>
        <Stack className="overflow-y-scroll"  gap={2}>
            {chats.map((chat) => <ChatItem key={chat.chatId} user_id={user_id} chat={chat} onChatClick={onChatClick} onChateLeave={onChatLeave} onChatDelete={onChatDelete}/> )}
        </Stack>
    </Stack>
}


export default ChatListBar
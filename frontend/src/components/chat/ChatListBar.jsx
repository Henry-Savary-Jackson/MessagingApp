import { Button, Container, Navbar, NavbarCollapse, NavItem, Stack } from "react-bootstrap";
import ChatItem from "./ChatItem";
import { useContext } from "react";
import { userIdContext } from "../../globals";


function ChatListBar({ chats, onChatClick, onChatCreate, onChatJoin,onChatDelete, onChatLeave  }) {
    let [user_id, setUserId] = useContext(userIdContext)

    return <Stack className="border vh-100 " gap={3}>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button>
        <Stack className="overflow-y-scroll mh-100"  gap={2}>
            {chats.map((chat) => <ChatItem key={chat.chatId} user_id={user_id} chat={chat} onChatClick={onChatClick} onChateLeave={onChatLeave} onChatDelete={onChatDelete}/> )}
        </Stack>
    </Stack>
}


export default ChatListBar
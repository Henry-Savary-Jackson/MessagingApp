import { Button, NavbarCollapse, NavItem, Stack } from "react-bootstrap";


function ChatListBar({ chats, onChatClick, onChatCreate, onChatJoin }) {
    return <Stack>
        <Button onClick={(e) => {
            let uuid = window.prompt("Put chat UUID:")
            if (!uuid)
                return;
            onChatJoin(uuid)
        }} >Join a chat</Button>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button><NavbarCollapse className="overflow-scroll">
            {chats.map((chat) => <NavItem className={"sidebar"} onClick={(e) => { onChatClick(chat) }}>{chat}</NavItem>)}
        </NavbarCollapse></Stack>
}


export default ChatListBar
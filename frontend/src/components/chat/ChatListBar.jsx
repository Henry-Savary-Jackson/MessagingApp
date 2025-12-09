import { Button, Container, Navbar, NavbarCollapse, NavItem, Stack } from "react-bootstrap";
import ChatItem from "./ChatItem";
import { useState } from "react";
import GroupChatCreate from "./GroupChatCreate";


function ChatListBar({ chats, onChatClick, onChatCreate, onMessageUser, onChatLeave }) {

    return <Stack className="border vh-100 " gap={3}>
        <Button onClick={(e) => { onMessageUser() }} >Message user</Button>
        <Button onClick={(e) => { onChatCreate() }} >Create your chat</Button>
        <Stack className="overflow-y-scroll mh-100" gap={2}>
            {chats.map((chat) => <ChatItem key={chat.chat_id} chat={chat} onChatClick={onChatClick} onChatLeave={onChatLeave} />)}
        </Stack>
    </Stack>
}


export default ChatListBar
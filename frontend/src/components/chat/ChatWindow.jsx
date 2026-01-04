import { Stack, Card, CardBody, CardFooter, CardHeader, Button } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";
import { useContext, useState } from "react";
import { user_id_context } from "../../globals";
import GroupUserList from "./GroupUserList";


export default function ChatWindow({  chat_object, onMessageSend, onInviteUser, onDeleteUser }) {
    let [user_id, set_user_id] = useContext(user_id_context) 
    let [disp_modal, set_disp_modal] = useState(false)
    let messages = chat_object.messages || []

    return <Card className="h-100 mh-100 border">
        {chat_object.type === "GROUP" &&chat_object.initiator && chat_object.initiator === user_id && <CardHeader>
           { disp_modal &&  chat_object && <GroupUserList  show={disp_modal} chat_id={chat_object.chat_id} onAddUser={onInviteUser} onRemoveUser={onDeleteUser} onClose={()=>{set_disp_modal(false)}} /> }
            <Button variant="primary" onClick={(e) => set_disp_modal(true)}>Manage Users</Button>
        </CardHeader>}
        <CardBody className="overflow-y-scroll border">
            <Stack style={{paddingBottom:"10vh"}} gap={2}  >
                {messages && messages.sort((a, b) => a.timestamp - b.timestamp).map((message, index) => <ChatMessage  type={message.type} key={message.id} message_key={message.message_key} contents={message.message_contents} sender={message.sender_id} />)}
            </Stack>
        </CardBody>
        <CardFooter className="position-absolute w-100  bg-white bottom-0">
            <ChatKeyboard chat_id={chat_object.chat_id} onMessageSend={onMessageSend} />
        </CardFooter>
    </Card>
}
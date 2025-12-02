import {  Stack, Card, CardBody, CardFooter } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";


function ChatWindow({ chat_object, messages, onMessageSend }) {



    return <Card fluid className="border position-relative vh-100">
        <CardBody className="overflow-y-scroll" >
        <Stack style={{paddingBottom:"15%"}} className="border h-100 mh-100 overflow-y-scroll gap-2 " >
                {messages && messages.sort((a, b) => a.timestamp - b.timestamp).map((message,index) => <ChatMessage key={index} message_key={message.message_key} contents={message.contents} sender={message.sender_id} />)}
        </Stack>
        </CardBody>
        <CardFooter className="position-absolute w-100  bg-white bottom-0">

            <ChatKeyboard chat_id={chat_object.chat_id} onMessageSend={onMessageSend} />
        </CardFooter>
    </Card>

}

export default ChatWindow;
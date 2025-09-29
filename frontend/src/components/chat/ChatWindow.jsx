import { Col, Row, Container, Stack } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";
import {v4} from 'uuid'


function ChatWindow({ chat_id,messages, onMessageSend }) {
 
    return <Container fluid className="border position-relative vh-100">
        <Stack className="overflow-y-scroll mh-100 ">
            {messages.sort((a, b) => a.timestamp - b.timestamp).map((message) => <ChatMessage key={v4()} message_key={message.message_key} contents={message.messageContents} sender={message.messageHeader.senderId} />)}
        </Stack>
        <ChatKeyboard chat_id={chat_id} onMessageSend={onMessageSend} />
    </Container>

}

export default ChatWindow;
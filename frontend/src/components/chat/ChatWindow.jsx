import { Col, Row, Container, Stack } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";


function ChatWindow({ messages, onMessageSend }) {
 
    return <Container fluid className="border position-relative vh-100">
        <Stack className="overflow-y-scroll mh-100 ">
            {messages.sort((a, b) => a.timestamp - b.timestamp).map((message) => <ChatMessage key={message.messageId} contents={message.contents} sender={message.sender} />)}
        </Stack>
        <ChatKeyboard  onMessageSend={onMessageSend} />
    </Container>

}

export default ChatWindow;
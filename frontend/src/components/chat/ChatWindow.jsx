import { Col, Row, Container, Stack } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";


function ChatWindow({ messages, onMessageSend }) {

    return <Container className="border h-100">
        <Stack className="overflow-y-scroll">
            {messages.sort((a, b) => a.timestamp - b.timestamp).map((message) => <ChatMessage key={message.messageId} contents={message.contents.text} sender={message.sender} />)}
        </Stack>
        <Container className="position-sticky bottom-0 end-0" >
            <ChatKeyboard onMessageSend={onMessageSend} />
        </Container>
    </Container>

}

export default ChatWindow;
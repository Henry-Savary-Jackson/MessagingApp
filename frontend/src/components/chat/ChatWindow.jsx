import { Container, Stack } from "react-bootstrap";
import ChatMessage from "./ChatMessage";
import ChatKeyboard from "./ChatKeyboard";


function ChatWindow({ messages, onMessageSend }) {

    return <Stack>
        <Stack className="overflow-scroll">
            {messages.sort((a,b)=> a.timestamp-b.timestamp).map((message) => <ChatMessage contents={message.contents.text} sender={message.sender} />)}
        </Stack>
        <ChatKeyboard onMessageSend={onMessageSend} />
    </Stack>
}

export default ChatWindow;
import { useState } from "react"
import { Container, Form, Button, FormControl } from "react-bootstrap"

function ChatKeyboard({ onMessageSend }) {

    let [message, setMessage] = useState("")


    return <Form onSubmit={(e) => {
        e.preventDefault();
        onMessageSend(message)
        setMessage("")

    }}><FormControl type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type="submit">Send</Button></Form>
}


export default ChatKeyboard 
import { Container } from "react-bootstrap"
import { userContext } from "../../globals"
import { useContext } from "react"


function ChatMessage({ contents, sender }) {
    return <Container>{sender}:{contents}</Container>
}


export default ChatMessage 
import { Container } from "react-bootstrap"
import { getUsername } from "../../utils/RequestUtils"
import {  useState, useEffect } from "react"


function ChatMessage({ contents, sender }) {

    let [username , setUsername] = useState("")
    useEffect(()=>{
        (async () => {setUsername(await getUsername(sender))})()
    },[])
    return <Container>{username}:{contents}</Container>
}


export default ChatMessage 
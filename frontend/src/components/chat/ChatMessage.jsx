import { Container } from "react-bootstrap"
import { getUsername } from "../../utils/RequestUtils"
import {  useState, useEffect, useContext } from "react"
import { userIdContext } from "../../globals"
import { send } from "../../utils/WebsocketUtils";


function ChatMessage({ contents, sender }) {

    let [user_id, setUserId] = useContext(userIdContext);

    let [username , setUsername] = useState("")
    useEffect(()=>{
        (async () => {setUsername(await getUsername(sender))})()
    },[])
    return <Container className={user_id===sender? "text-end":"text-start"}>{username}:{contents}
    {/* <a download href="">File</a> */}
    </Container>
}


export default ChatMessage 
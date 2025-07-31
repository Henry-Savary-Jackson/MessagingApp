import { useContext, useEffect, useState } from 'react'
import { Button, Container, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Link } from 'react-router'
import { csrfContext, userContext } from '../globals'
import { createChat, getChats, getCSRF, join, logout, setAxiosCSRF } from '../utils/RequestUtils'
import { performActionWithAlert } from '../utils/UIUtils'


export default ({ }) => {

    let [user, setUser] = useContext(userContext)
    let [csrf, setCsrf] = useContext(csrfContext)

    let [chats, setChats] = useState([])


    useEffect(() => {
        (async () => setChats(await getChats()))()
    }, [])

    return <Container>Hello
        <Link to={"/login"} onClick={async (e) => {
            await logout()
            setCsrf(setAxiosCSRF(await getCSRF()))
            setUser("")
        }} >Logout</Link>
        <Button onClick={async (e) => {
            await performActionWithAlert(async () => alert(await createChat()))
        }}>Chat</Button>
        <Button onClick={async (e) => {
            let id = prompt("UUID")
            await join(id)
            await (async () => setChats(await getChats()))()
        }}>Join</Button>
        <ListGroup>
            {chats.map((chat) => <ListGroupItem >{chat}</ListGroupItem>)}
        </ListGroup>
    </Container>

}

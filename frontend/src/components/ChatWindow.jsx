import { useContext } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router'
import { csrfContext, userContext } from '../globals'
import { createChat, setAxiosCSRF } from '../utils/RequestUtils'
import { performActionWithAlert } from '../utils/UIUtils'


export default ({ }) => {

    let [user, setUser] = useContext(userContext)
    let [csrf, setCsrf] = useContext(csrfContext)


    return <Container>Hello
        <Link to={"/login"} onClick={async (e) => {
            setCsrf(await setAxiosCSRF())
            setUser("")
        }} >Login Page</Link>
        <Button onClick={async (e) => {
            await performActionWithAlert(async () => alert(await createChat()))
        }}>Chat</Button>
    </Container>

}

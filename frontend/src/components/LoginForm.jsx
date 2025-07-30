import { useContext, useState } from "react";
import { Form, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { removeHeaderFooterToKey, signChallenge } from "../utils/CryptoUtils";
import { login , setAxiosCSRF} from "../utils/RequestUtils";
import { Link, useLocation } from "react-router";
import { userContext, csrfContext } from "../globals";
import { convertBase64StringToArrayBuffer, convertArrayBufferToBase64 } from "../utils/EncodingUtils";
import { performActionWithAlert } from "../utils/UIUtils";

function LoginForm() {

    let location = useLocation()
    let [user, setUser] = useContext(userContext)
    let [csrf, setCsrf] = useContext(csrfContext)
    let [username, setUsername] = useState("")
    let [file, setFile] = useState(null)

    return <Form onSubmit={async (e) => {
        e.preventDefault()

        let privKeyFile = file ? file : null
        if (!privKeyFile) {
            alert("please give the private key")
            return;
        }
        let reader = new FileReader()
        reader.onloadend = async (event) => {
            let privateKeyFileRawStr = reader.result
            let privateKeyBase64 = removeHeaderFooterToKey(privateKeyFileRawStr)
            let privKeyBuffer = convertBase64StringToArrayBuffer(privateKeyBase64)
            console.log(privKeyBuffer, convertArrayBufferToBase64(privKeyBuffer))

            const authenticationRequest = await signChallenge(privKeyBuffer)
            authenticationRequest.username = username
            console.log(authenticationRequest)
            await performActionWithAlert(async () => {
                await login(authenticationRequest)
                setCsrf(await setAxiosCSRF())
                setUser(username)
                location.pathname = "/"
            })
        }
        reader.readAsText(privKeyFile)
    }}>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
        </FormGroup>
        <FormGroup>
            <FormLabel>Private Key</FormLabel>
            <FormControl type="file" onChange={(e) => setFile(e.target.files[0])} />
        </FormGroup>
        <Link to="/register">Register</Link>
    </Form>


};


export default LoginForm;
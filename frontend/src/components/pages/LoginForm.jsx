import { useContext, useState } from "react";
import { Form, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { removeHeaderFooterToKey, signChallenge } from "../../utils/CryptoUtils";
import { getCSRF, login , setAxiosCSRF} from "../../utils/RequestUtils";
import { Link, useLocation } from "react-router";
import { userContext  } from "../../globals";
import { convertBase64StringToArrayBuffer, convertArrayBufferToBase64 } from "../../utils/EncodingUtils";
import { performActionWithAlert } from "../../utils/UIUtils";

function LoginForm({setUserCallback}) {

    let location = useLocation()
    let [user, setUser] = useContext(userContext)
    let [username, setUsername] = useState("")
    let [file, setFile] = useState(null)

    return <Form onSubmit={async (e) => {
        e.preventDefault()

        let privKeyFile = file ? file : null
        if (!privKeyFile) {
            alert("Please give the private key.")
            return;
        }
        let reader = new FileReader()
        reader.onloadend = async (event) => {
            let privateKeyFileRawStr = reader.result
            let privateKeyBase64 = removeHeaderFooterToKey(privateKeyFileRawStr)
            let privKeyBuffer = convertBase64StringToArrayBuffer(privateKeyBase64)

            const authenticationRequest = await signChallenge(privKeyBuffer)
            authenticationRequest.username = username
            await performActionWithAlert(async () => {
                let csrf_data = await login(authenticationRequest)
                setAxiosCSRF(await getCSRF())
                setUserCallback(username)
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
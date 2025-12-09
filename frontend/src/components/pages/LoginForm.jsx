import { useContext, useState } from "react";
import { Button, Form, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { signChallenge } from "../../utils/CryptoUtils";
import { login} from "../../utils/RequestUtils";
import { Link, useLocation } from "react-router";
import {  identity_context, user_id_context } from "../../globals";
import { performActionWithAlert } from "../../utils/UIUtils";
import {convertProtoBufIdentityToObject, import_identity} from "../../utils/StorageUtils"

function LoginForm({setUserCallback}) {

    let location = useLocation()
    let [ident_info, set_ident_info] = useContext(identity_context)
    let [user_id, set_user_id] = useContext(user_id_context)
    let [username, setUsername] = useState("")
    let [file, setFile] = useState(null)

    return <Form onSubmit={async (e) => {
        e.preventDefault()

        let identityFile = file ? file : null
        if (!identityFile) {
            alert("Please give the private key.")
            return;
        }
        let reader = new FileReader()
        reader.onloadend = async (event) => {
            let identity_file_raw_bytes = new Uint8Array(reader.result)
            let identity_protobuf_obj = await import_identity(identity_file_raw_bytes)
            let identity_js_object = await convertProtoBufIdentityToObject(identity_protobuf_obj)

            const authenticationRequest = await signChallenge(identity_js_object.verifierKey.privateKey)
            authenticationRequest.username = username
            await performActionWithAlert(async () => {
                // Great, store user_id into idb
                let user_id = await login(authenticationRequest)

                await set_ident_info({...identity_js_object, username:username,user_id:user_id})

                setUserCallback(username, user_id)
                location.pathname = "/chat"
            })
        }
        reader.readAsArrayBuffer(identityFile)
    }}>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
        </FormGroup>
        <FormGroup>
            <FormLabel>Identity File</FormLabel>
            <FormControl type="file" onChange={(e) => setFile(e.target.files[0])} />
        </FormGroup>
        <Button type="submit">Login</Button>
        <Link to="/register">Register</Link>
    </Form>


};


export default LoginForm;
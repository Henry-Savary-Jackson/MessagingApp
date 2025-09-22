import { useContext, useState } from "react";
import { Button, Form, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { removeHeaderFooterToKey, signChallenge } from "../../utils/CryptoUtils";
import { getCSRF, login , setAxiosCSRF} from "../../utils/RequestUtils";
import { Link, useLocation } from "react-router";
import { userContext  } from "../../globals";
import { convertBase64StringToArrayBuffer, convertArrayBufferToBase64 } from "../../utils/EncodingUtils";
import { performActionWithAlert } from "../../utils/UIUtils";
import {convertProtoBufIdentityToObject, import_identity, storeUserData, useIndexedDB} from "../../utils/StorageUtils"

function LoginForm({setUserCallback}) {

    let location = useLocation()
    let {db,loading} = useIndexedDB()
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
                let user_id = await login(authenticationRequest)
                if (db){
                    await storeUserData(db,  {...identity_js_object, user_id:user_id})

                }else{
                    throw new Error("No db initialized") 
                }
                // Great, store user_id into idb
                setAxiosCSRF(await getCSRF())
                setUserCallback(username, user_id)
                location.pathname = "/"
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
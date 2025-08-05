import { useEffect, useContext, useRef, useState } from "react";
import { Link } from "react-router";
import { Button, Form, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { convertKeyPairToBase64, addHeaderFooterToKey, generatePrivatePublicKeyPair } from "../../utils/CryptoUtils"
import { register, setAxiosCSRF } from "../../utils/RequestUtils"
import { useLocation } from 'react-router'
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer, } from "../../utils/EncodingUtils";
import { userContext } from "../../globals";
import { performActionWithAlert } from "../../utils/UIUtils";

function RegisterForm() {

    let location = useLocation()

    let [user, setUser] = useContext(userContext)
    let [username, setUsername] = useState("")
    let [privKey, setPrivKey] = useState(null)
    let [pubKey, setPubKey] = useState(null)
    let [privKeyName, setPrivKeyName] = useState("privateKey.pem")
    let [pubKeyName, setPubKeyName] = useState("publicKey.pem")

    let [privKeyURL, setPrivKeyURL] = useState("");
    let [pubKeyURL, setPubKeyURL] = useState("");

    const revokeURLs = () => {
        if (privKeyURL)
            URL.revokeObjectURL(privKeyURL)
        if (pubKeyURL)
            URL.revokeObjectURL(pubKeyURL)
    }

    useEffect(() => {
        if (privKey) {
            setPrivKeyURL(URL.createObjectURL(new Blob([addHeaderFooterToKey("private", privKey)], { type: "application/x-pem-file" })))

        }
        if (pubKey) {
            setPubKeyURL(URL.createObjectURL(new Blob([addHeaderFooterToKey("public", pubKey)], { type: "application/x-pem-file" })))
        }
        return revokeURLs //as cleanup
    }, [privKey, pubKey])


    return <Form onSubmit={async (e) => {
        e.preventDefault()
        let registerRequest = { "username": username, "base64PubKey": pubKey }

        await performActionWithAlert(async () => {
            let csrf_data = await register(registerRequest)
            setUser(username)
            location.pathname = "/"
            setAxiosCSRF(csrf_data)
        });
    }}>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
        </FormGroup>
        <Button onClick={async (e) => {
            let keypair = await generatePrivatePublicKeyPair()
            revokeURLs()
            setPrivKey(keypair.privateKey)
            setPubKey(keypair.publicKey)
        }} >{privKey ? "Regenerate Public/Private Key pair" : "Generate Public/Private Key pair"}</Button>
        {privKey && privKeyURL && <FormGroup>
            <FormLabel htmlFor="privKeyName"><a href={privKeyURL} download={privKeyName} >Save Private Key</a></FormLabel>
            <FormControl id="privKeyName" value={privKeyName} onChange={(e) => { setPrivKeyName(e.target.value) }} />
        </FormGroup>}
        {pubKey && pubKeyURL && <FormGroup>
            <FormLabel><a htmlFor="pubKeyName" href={pubKeyURL} download={pubKeyName} >Save Public Key</a></FormLabel>
            <FormControl id="pubKeyName" value={privKeyName} onChange={(e) => { setPubKeyName(e.target.value) }} />
        </FormGroup>}
        <Link to="/login">Login</Link>
    </Form >
    // TODO: allow user to set filenames to download
}

export default RegisterForm;
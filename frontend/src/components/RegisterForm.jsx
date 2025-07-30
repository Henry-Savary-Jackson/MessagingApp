import { useEffect, useContext, useRef, useState } from "react";
import { Link } from "react-router";
import { Button, Form, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { convertKeyPairToBase64, addHeaderFooterToKey, generatePrivatePublicKeyPair } from "../utils/CryptoUtils"
import { register, setAxiosCSRF } from "../utils/RequestUtils"
import { useLocation } from 'react-router'
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer, } from "../utils/EncodingUtils";
import { csrfContext, userContext } from "../globals";
import { performActionWithAlert } from "../utils/UIUtils";

function RegisterForm() {

    let location = useLocation()

    let [user, setUser] = useContext(userContext)
    let [csrf, setCsrf] = useContext(csrfContext)
    let [username, setUsername] = useState("")
    let [privKey, setPrivKey] = useState(null)
    let [pubKey, setPubKey] = useState(null)

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
        return revokeURLs
    }, [privKey, pubKey])


    return <Form onSubmit={async (e) => {
        e.preventDefault()
        console.log(privKey, convertBase64StringToArrayBuffer(privKey))
        let registerRequest = { "username": username, "base64PubKey": pubKey }

        await performActionWithAlert(async () => {
            await register(registerRequest)
            setUser(username)
            location.pathname = "/"
            setCsrf(await setAxiosCSRF())
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
        {privKey && privKeyURL && <a href={privKeyURL} download={"privateKey.pem"} >Save Private Key</a>}
        {pubKey && pubKeyURL && <a href={pubKeyURL} download={"publicKey.pem"} >Save Public Key</a>}
        <Link to="/login">Login</Link>
    </Form >

}

export default RegisterForm;
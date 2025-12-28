import { useContext, useEffect, useRef, useState } from "react";
import {  identity_context, user_id_context } from "../../globals";
import { Container, Spinner, Stack } from "react-bootstrap";
import { extractC25519SignaturePrivateKey, signChallenge } from "../../utils/CryptoUtils";
import { useLocation } from "react-router";
import { login } from "../../utils/RequestUtils";


export default function LoadingLogin({ setUserCallback }) {
    let location = useLocation()
    let [ident_info, set_ident_info] = useContext(identity_context)
    let [user_id, set_user_id] = useContext(user_id_context)

    async function log_in() {
        const authenticationRequest = await signChallenge(ident_info.verifierKey.privateKey)
        authenticationRequest.username = ident_info.username
        if (!ident_info.last_msg_timestamp){
            let new_ident = {...ident_info,identityKeyNew:structuredClone(ident_info.identityKey), last_msg_timestamp:new Date().getTime()}
            set_ident_info(new_ident)
        }

        const user_id = await login(authenticationRequest)
        setUserCallback( ident_info.username, user_id)
        location.pathname = "/chat"
    }

    let need_login = useRef(true)

    useEffect(()=>{
        if (user_id && ident_info  && ident_info !== "Not found" ){
            location.pathname = "/chat"
        }else if (ident_info && ident_info === "Not found"){
            location.pathname = "/login"
        }else if (!user_id && ident_info  && ident_info !== "Not found" && need_login.current){
            need_login.current = false
            log_in()
        }
    }, [ident_info, user_id])


    return <Container className="d-flex flex-column vh-100 align-items-center justify-items-center">
        <Spinner  variant="primary" />
        <span>Logging in...</span>
    </Container >

}
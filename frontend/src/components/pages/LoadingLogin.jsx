import { useContext, useEffect, useRef, useState } from "react";
import {  identity_context, user_id_context } from "../../globals";
import { Spinner, Stack } from "react-bootstrap";
import { signChallenge } from "../../utils/CryptoUtils";
import { useLocation } from "react-router";
import { login } from "../../utils/RequestUtils";


export default function LoadingLogin({ setUserCallback }) {
    let location = useLocation()
    let [ident_info, set_ident_info] = useContext(identity_context)
    let [user_id, set_user_id] = useContext(user_id_context)

    async function log_in() {
        const authenticationRequest = await signChallenge(ident_info.verifierKey.privateKey)
        authenticationRequest.username = ident_info.username
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


    return <Stack>
        <Spinner />
        <span>Logging in...</span>
    </Stack >

}
import { useContext, useEffect, useState } from "react";
import { identity_context } from "../../globals";
import { Spinner, Stack } from "react-bootstrap";
import { signChallenge } from "../../utils/CryptoUtils";
import { useLocation } from "react-router";



export default function LoadingLogin({ set_logged_in }) {
    let location = useLocation()
    let [ident_info, set_ident_info] = useContext(identity_context)

    async function log_in() {
        const authenticationRequest = await signChallenge(ident_info.verifierKey.privateKey)
        authenticationRequest.username = ident_info.username
        set_logged_in(true)
        location.pathname = "/"
    }

    useEffect(() => {
        if (ident_info) {
            log_in()
        } else {
            throw new Error("Oi no identity initialized.")
        }
    }, [])


    return <Stack>
        <Spinner />
        <span>Logging in...</span>
    </Stack >

}
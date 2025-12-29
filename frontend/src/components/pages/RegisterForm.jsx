import { useEffect, useContext, useState, useRef, useMemo } from "react";
import { Link } from "react-router";
import { Button, Image, Form, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { create_new_identity, create_new_prekey_bundle } from "../../utils/CryptoUtils"
import { register } from "../../utils/RequestUtils"
import { useLocation } from 'react-router'
import { convertArrayBufferToBase64, } from "../../utils/EncodingUtils";
import { performActionWithAlert } from "../../utils/UIUtils";
import { Identity, PreKeyBundle } from "../../utils/protocol/messages";
import { identity_context } from "../../globals";
import "../../css/auth.scss"
import "../../css/global.scss"

function RegisterForm({ setUserCallback }) {

    let location = useLocation()

    let [username, setUsername] = useState("")
    let [profileImageBlob, setProfileImageBlob] = useState(undefined)

    let [ident_info, set_ident_info] = useContext(identity_context)

    let [identity_file_name, set_identity_file_name] = useState("IdentityFile.bin")
    let [identity_data, set_identity_data] = useState(null)
    let [identity_file_url, set_identity_file_url] = useState("");

    let previousProfileBlob = useRef(null)

    let profile_img_url = useMemo(() => {
        if (profileImageBlob) {
            return URL.createObjectURL(profileImageBlob)
        }
        return ""
    }, [profileImageBlob])

    const revokeURLs = () => {
        if (identity_file_url)
            URL.revokeObjectURL(identity_file_url)
        if (profile_img_url)
            URL.revokeObjectURL(profile_img_url)
    }

    useEffect(() => {
        (async () => {
            if (identity_data) {
                let identity_protobuf = Identity.fromObject(identity_data)
                let identity_bytes = Identity.encode(identity_protobuf).finish()
                set_identity_file_url(URL.createObjectURL(new Blob([identity_bytes], { type: "application/octet-stream" })))
            }
        })()
        return revokeURLs //as cleanup
    }, [identity_data])


    return <Form className="auth-form" onSubmit={async (e) => {
        e.preventDefault()
        let profileImageData = undefined;
        async function submit() {
            let prekey_bundle = await create_new_prekey_bundle(identity_data)
            let prekey_bundle_protobuf = PreKeyBundle.fromObject(prekey_bundle)
            let prekey_bundle_base64 = convertArrayBufferToBase64(PreKeyBundle.encode(prekey_bundle_protobuf).finish())

            let registerRequest = { "username": username, "base64PrekeyBundle": prekey_bundle_base64, "profileImage": profileImageData }

            await performActionWithAlert(async () => {
                let user_id = await register(registerRequest)
                // now put it into indexeddb

                await set_ident_info({ ...identity_data, identityKeyPriv: new Uint8Array(identity_data.identityKey.privateKey), username: username, user_id: user_id })
                setUserCallback(username, user_id)
                location.pathname = "/chat"
            });
        }
        if (profileImageBlob) {
            let reader = new FileReader();
            reader.onloadend = async (ev) => {

                profileImageData = { "data": reader.result.slice(reader.result.indexOf("base64,") + 7), "mimeType": profileImageBlob.type }
                await submit()
            }
            reader.readAsDataURL(profileImageBlob)
        } else {
            await submit()
        }


    }}>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
        </FormGroup>
        <Button onClick={async (e) => {
            let identity_js_object = await create_new_identity()
            revokeURLs()
            set_identity_data(identity_js_object)
        }} >{identity_data ? "Regenerate identity file" : "Generate Identity file"}</Button>
        {identity_data && identity_file_url && <FormGroup>
            <FormLabel >
                <a href={identity_file_url} download={identity_file_name} >Save Identity File</a>
            </FormLabel>
            <FormGroup className="d-flex flex-row align-items-center">
                <FormLabel>Filename:</FormLabel>
                <FormControl id="identityFileName" value={identity_file_name} onChange={(e) => { set_identity_file_name(e.target.value) }} />
            </FormGroup>
        </FormGroup>}
        <FormGroup>
            <FormLabel className="profile-upload" htmlFor="profileImage">
                <span>Profile Image</span>
                {profile_img_url && <Image className="h-25 w-25" src={profile_img_url} />}
                <Image src="/chat-profile-input.svg" />
                <span>{profileImageBlob && profileImageBlob.name}</span>
            </FormLabel>
            <FormControl className="disappear" id="profileImage" type="file" onChange={(e) => {
                let file = (e.target.files ? e.target.files[0] : null)
                if (file) {
                    if (!file.type.startsWith("image/")) {
                        alert("Please upload an image file")
                        return;
                    }
                    if (profile_img_url)
                        URL.revokeObjectURL(profile_img_url)
                    setProfileImageBlob(file)
                }
            }} />
        </FormGroup>
        <Button type="submit"> Register</Button>
        <Link to="/login">Login</Link>
    </Form >
}

export default RegisterForm;
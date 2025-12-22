
import { useContext, useEffect, useState } from "react";
import { Form, Image, Button, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { identity_context } from "../../globals";
import { getUserProfileImage, putUserProfile } from "../../utils/RequestUtils";
import { Link } from "react-router";
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils";
import { get_user_info, store_user_info, useIndexedDB } from "../../utils/StorageUtils";
import "../../css/profile-page.scss";

function ProfilePage() {
    let { db, loading } = useIndexedDB()
    let [identity, set_ident_info] = useContext(identity_context)

    let [newUsername, setNewUsername] = useState(identity.username)
    let [profileImageBlob, setProfileImageBlob] = useState(undefined)

    let [newFile, setNewFile] = useState(undefined)
    let profileBlobURL = null

    const unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    const updateBlobURL = (profileImage) => {
        profileBlobURL = (URL.createObjectURL(profileImage))
    }
    if (profileImageBlob) {
        updateBlobURL(profileImageBlob)
    }

    // gcreate a blob url and display it using an image component
    useEffect(() => {

        (async () => {
            if (db)
                setProfileImageBlob(await getUserProfileImage(db, identity.user_id) || undefined)
        })()
        return unsetBlobURL

    }, [db])

    return <Form onSubmit={async (e) => {
        e.preventDefault()
        async function submit(newProfileImage = null) {
            let request = { "username": newUsername, }
            if (newProfileImage)
                request = { ...request, "profile": newProfileImage }
            await putUserProfile(request)
            console.log("success")
            set_ident_info({ ...identity, username: newUsername })
        }
        if (newFile) {
            const fileReader = new FileReader()
            fileReader.onload = (ev) => {
                let bytes = fileReader.result
                let newProfile = { "data": convertArrayBufferToBase64(bytes), mimeType: newFile.type }
                let new_profile = new File([bytes], { type: newFile.type, name: newFile.name })
                setProfileImageBlob(new_profile)

                let user_info = get_user_info(db, identity.user_id)
                user_info.profile = new_profile
                store_user_info(db, user_info)

                console.log("uploaded profile image")

                submit(newProfile)
            }
            fileReader.readAsArrayBuffer(newFile)
        } else {
            await submit()
        }

    }} className="profile-form">
        <Link to={"/chat"} className="btn btn-primary"> HomePage</Link>
        <FormGroup className="profile-image">
            <FormLabel className="profile-image" htmlFor="set-profile-input">
                <Image alt="Profile Image" src={profileBlobURL || undefined} roundedCircle />
            </FormLabel>
            <a download={"profile.png"} href={profileBlobURL} ></a>
            <FormControl id="set-profile-input" onChange={(e) => {
                if (e.target.files) {
                    setNewFile(e.target.files[0])
                    updateBlobURL(e.target.files[0])
                }
            }} type="file" />
        </FormGroup>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={newUsername} onChange={(e) => setNewUsername(e.target.value)} type="text" />
        </FormGroup>
        <Button variant="success" type="submit">Save</Button>
    </Form>
}

export default ProfilePage; 
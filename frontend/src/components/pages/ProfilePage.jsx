
import { useContext, useEffect, useRef, useState } from "react";
import { Form, Image, Button, FormLabel, FormControl, FormGroup, Container } from "react-bootstrap";
import { identity_context } from "../../globals";
import { getUserProfileImage, putUserProfile } from "../../utils/RequestUtils";
import { Link } from "react-router";
import { convertArrayBufferToBase64 } from "../../utils/EncodingUtils";
import { current_version, get_user_info, store_user_info } from "../../utils/StorageUtils";
import "../../css/profile-page.scss";
import useBlobStore from "../../context/useBlobStore";
import useDBContext from "../../context/useDBContext";

function ProfilePage() {
    let { db, loading } = useDBContext()
    let [addBlob, removeBlob, getBlob] = useBlobStore()
    let [identity, set_ident_info] = useContext(identity_context)

    let [newUsername, setNewUsername] = useState(identity.username)

    let [newFile, setNewFile] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState(getBlob(identity.user_id))

    const unsetBlobURL = () => {
        if (profileBlobURL) {
            URL.revokeObjectURL(profileBlobURL)
        }
    }

    const updateBlobURL = (profileImage) => {
        unsetBlobURL()
        setProfileBlobURL(URL.createObjectURL(profileImage))
    }

    async function get_profile_image() {
        if (db && !profileBlobURL)
            setProfileBlobURL(addBlob(identity.user_id, await getUserProfileImage(db, identity.user_id)))
    }

    get_profile_image()

    // create a blob url and display it using an image component

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
            fileReader.onload = async (ev) => {
                let bytes = fileReader.result
                let newProfile = { "data": convertArrayBufferToBase64(bytes), mimeType: newFile.type }
                let new_profile = new File([bytes], { type: newFile.type, name: newFile.name })
                updateBlobURL(new_profile)

                let user_info = await get_user_info(db, identity.user_id)

                user_info.profile = new_profile

                store_user_info(db, user_info)

                console.log("uploaded profile image")

                submit(newProfile)
                addBlob(identity.user_id, new_profile)
            }
            fileReader.readAsArrayBuffer(newFile)
        } else {
            await submit()
        }

    }} className="profile-form">
        <Link to={"/chat"} className="btn btn-primary"> HomePage</Link>
        <FormGroup  >
            <FormLabel className="d-flex flex-column align-items-center" htmlFor="set-profile-input">
                <Image className="border profile-image" alt="Profile Image" src={profileBlobURL || undefined} roundedCircle />
                <a download={"profile.png"} href={profileBlobURL} >Download</a>
            </FormLabel>
            <FormControl id="set-profile-input" className="disappear" onChange={(e) => {
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

import { useContext, useEffect, useState } from "react";
import { Form, Image, Button, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { userContext, userIdContext } from "../../globals";
import { getUserProfile, putUserProfile } from "../../utils/RequestUtils";
import { Link } from "react-router";
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils";

function ProfilePage() {
    let [oldUsername, setOldUsername] = useContext(userContext)

    let [newUsername, setNewUsername] = useState(oldUsername)
    let [userId, getUserId] = useContext(userIdContext)
    let [profileImage, setProfileImage] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState("")

    let unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    useEffect(
        () => {
            if (profileImage) {
                setProfileBlobURL(URL.createObjectURL(new Blob([convertBase64StringToArrayBuffer(profileImage.datab64)]), { type: profileImage.mimeType }))
            }
            return unsetBlobURL
        }
        , [profileImage])

    // gcreate a blob url and display it using an image component
    useEffect(() => {

        (async () => {
            setProfileImage(await getUserProfile(userId) || undefined)
        })()

    }, [])

    return <Form onSubmit={async (e) => {
        e.preventDefault()

        let request = { "username": newUsername, "profileImage": profileImage }
        await putUserProfile(request)
        console.log("success")
    }}>
        <Link to={"/"} className="btn btn-primary"> HomePage</Link>
        <Image alt="Profile Image" src={profileBlobURL|| undefined} roundedCircle />
        <a  download href={profileBlobURL} ></a>
        <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormControl value={newUsername} onChange={(e) => setNewUsername(e.target.value)} type="text" />
        </FormGroup>
        <Button variant="success" type="submit">Save</Button>
    </Form>
}

export default ProfilePage; 
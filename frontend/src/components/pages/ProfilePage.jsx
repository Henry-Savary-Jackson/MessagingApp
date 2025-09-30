
import { useContext, useEffect, useState } from "react";
import { Form, Image, Button, FormLabel, FormControl, FormGroup } from "react-bootstrap";
import { userContext, userIdContext } from "../../globals";
import { getUserProfile, putUserProfile } from "../../utils/RequestUtils";
import { Link } from "react-router";
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils";
import { useIndexedDB } from "../../utils/StorageUtils";

function ProfilePage() {
    let {db,loading}=  useIndexedDB()
    let [oldUsername, setOldUsername] = useContext(userContext)

    let [newUsername, setNewUsername] = useState(oldUsername)
    let [userId, getUserId] = useContext(userIdContext)
    let [profileImage, setProfileImage] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState("")
    let [newFile, setNewFile] = useState(undefined)

    let unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    let updateBlobURL = (profileImage)=>{
        setProfileBlobURL(URL.createObjectURL(new Blob([convertBase64StringToArrayBuffer(profileImage.datab64)]), { type: profileImage.mimeType }))
    }
    useEffect(
        () => {
            if (profileImage) {
                updateBlobURL(profileImage)
            }
            return unsetBlobURL
        }
        , [profileImage])

    // gcreate a blob url and display it using an image component
    useEffect(() => {

        (async () => {
            if (db)
                setProfileImage(await getUserProfile(db,userId) || undefined)
        })()

    }, [db])

    return <Form onSubmit={async (e) => {
        e.preventDefault()
        async function submit(newProfileImage=null){
            let request = { "username": newUsername,  }
            if (newProfileImage)
                request = {...request, "profile": newProfileImage}
            await putUserProfile(request)
            console.log("success")
        }
        if (newFile){
            const fileReader=  new FileReader()
            fileReader.onload = (ev)=>{
                let bytes = fileReader.result 
                let newProfile = {"datab64":convertArrayBufferToBase64(bytes), mimeType:newFile.type}
                updateBlobURL(newProfile)
                console.log("uploaded profile image")
                submit(newProfile)
            }
            fileReader.readAsArrayBuffer(newFile)
        }else{
            await submit()
        }

    }}>
        <Link to={"/"} className="btn btn-primary"> HomePage</Link>
        <Image className="w-25" alt="Profile Image" src={profileBlobURL|| undefined} roundedCircle />
        <a  download={"profile.png"} href={profileBlobURL} ></a>
        <FormGroup>
            <FormControl onChange={(e) => 
            {
                if (e.target.files){
                    setNewFile(e.target.files[0])
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
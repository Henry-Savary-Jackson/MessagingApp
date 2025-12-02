import { useEffect,useState } from "react"
import { Button, Image,Container, Stack } from "react-bootstrap"
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils"
import { getUserProfile } from "../../utils/RequestUtils"
import { useIndexedDB } from "../../utils/StorageUtils"
import "../../css/chats.scss"

function ChatItem({ chat, onChatClick, onChatLeave }) {

    let {db,loading} = useIndexedDB()

    let [profileImage, setProfileImage] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState("")

    let unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    let updateBlobURL = (profileImage) => {
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

    useEffect(() => {
        (async () => {
            if (db)
                setProfileImage(await getUserProfile(db,chat.user_id) || undefined)
        })()
    }, [db])

    return <Stack  className="chat-item border" direction="horizontal" gap={1} key={chat.chat_id} >
        <Image className="w-25" alt={chat.name} src={profileBlobURL|| undefined} roundedCircle />
        <span onClick={(e) => { onChatClick(chat) }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chat_id) }} variant="danger">Leave</Button>
    </Stack>
}

export default ChatItem
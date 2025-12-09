import { useEffect, useState } from "react"
import { Button, Image, Container, Stack } from "react-bootstrap"
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils"
import { getFile, getUserProfile } from "../../utils/RequestUtils"
import { useIndexedDB } from "../../utils/StorageUtils"
import "../../css/chats.scss"

function ChatItem({ chat, onChatClick, onChatLeave }) {

    let { db, loading } = useIndexedDB()

    let [profileImage, setProfileImage] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState("")

    let unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    let updateBlobURL = (profileImage) => {
        setProfileBlobURL(URL.createObjectURL(new Blob([profileImage.data]), { type: profileImage.mimeType }))
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
            if (db) {
                if (chat.type === "DIRECT") {
                    let profileImage = await getUserProfile(db, chat.chat_id) || undefined
                    if (profileImage)
                        profileImage.data = convertBase64StringToArrayBuffer(profileImage.data)
                    setProfileImage(profileImage)
                } else if (chat.type === "GROUP") {
                    chat.group_image_file && setProfileImage(await getFile(db, chat.group_image_file.fileId, null, chat.group_image_file.fileIv))
                }
            }
        })()
    }, [db])

    return <Stack className="chat-item border" direction="horizontal" gap={1} key={chat.chat_id} >
        <Image className="w-25" alt={chat.name} src={profileBlobURL || undefined} roundedCircle />
        <span onClick={(e) => { onChatClick(chat) }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chat_id) }} variant="danger">Leave</Button>
    </Stack>
}

export default ChatItem
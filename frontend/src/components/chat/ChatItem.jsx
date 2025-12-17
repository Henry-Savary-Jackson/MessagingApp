import { useEffect, useState } from "react"
import { Button, Image, Container, Stack } from "react-bootstrap"
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils"
import { getFile, getUserProfile } from "../../utils/RequestUtils"
import { useIndexedDB } from "../../utils/StorageUtils"
import "../../css/chats.scss"

function ChatItem({ chat, onChatClick, onChatLeave }) {

    let { db, loading } = useIndexedDB()

    let [profile_image_blob, setProfileImageBlob] = useState(undefined)

    let [profileBlobURL, setProfileBlobURL] = useState("")

    let unsetBlobURL = () => {
        if (profileBlobURL)
            URL.revokeObjectURL(profileBlobURL)
    }
    let updateBlobURL = (profile_image_blob) => {
        setProfileBlobURL(URL.createObjectURL(profile_image_blob))

    }
    useEffect(
        () => {
            if (profile_image_blob) {
                updateBlobURL(profile_image_blob)
            }
            return unsetBlobURL
        }
        , [profile_image_blob])

    useEffect(() => {
        (async () => {
            if (db) {
                if (chat.type === "DIRECT") {
                    let profileImage = await getUserProfile(db, chat.chat_id) || undefined
                    setProfileImageBlob(profileImage)
                } else if (chat.type === "GROUP") {
                    setProfileImageBlob(await getFile(db, chat.group_image_file.fileId, null, chat.group_image_file.fileIv))
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
import { useEffect, useState } from "react"
import { Button, Image, Container, Stack } from "react-bootstrap"
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils"
import { getFile, getUserProfileImage } from "../../utils/RequestUtils"
import { useIndexedDB } from "../../utils/StorageUtils"
import "../../css/chats.scss"

function ChatItem({  chat, onChatClick, onChatLeave }) {

    let { db, loading } = useIndexedDB()


    let [addBlob, removeBlob,getBlob, ] = useContext(blob_context)

    let unsetBlobURL = () => {
        if (getBlob(chat.chat_id))
            removeBlob(chat.chat_id)
    }
    let updateBlobURL = (profile_image_blob) => {
        addBlob(chat.chat_id, profile_image_blob)
    }
    useEffect(() => {
        (async () => {
            if (db) {
                if (chat.type === "DIRECT") {
                    addBlob(chat.chat_id,await getUserProfileImage(db, chat.chat_id) || undefined)
                } else if (chat.type === "GROUP") {
                    chat.group_image_file && addBlob(chat.group_image_file.fileId,await getFile(db, chat.group_image_file.fileId, null, chat.group_image_file.fileIv))
                }
            }
        })()
    }, [db])

    return <Stack className="chat-item border" direction="horizontal" gap={1} key={chat.chat_id} >
        <Image className="w-25 border" alt={chat.name} src={getBlob(chat.chat_id) || undefined}  roundedCircle />
        <span onClick={(e) => { onChatClick(chat) }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chat_id) }} variant="danger">Leave</Button>
    </Stack>
}

export default ChatItem
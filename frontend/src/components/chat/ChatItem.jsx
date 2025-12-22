import { useContext, useEffect, useState } from "react"
import { Button, Image, Container, Stack, Fade } from "react-bootstrap"
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils"
import { getFile, getUserProfileImage } from "../../utils/RequestUtils"
import { blob_context } from "../../globals"
import { useIndexedDB } from "../../utils/StorageUtils"
import "../../css/chats.scss"

function ChatItem({ chat, onChatClick, onChatLeave }) {

    let { db, loading } = useIndexedDB()
    let [addBlob, removeBlob, getBlob,] = useContext(blob_context)
    let [fileId, setFileId] = useState("")

    useEffect(() => {
        (async () => {
            if (db) {
                let file_blob = null
                let new_file_id = ""
                if (chat.type === "DIRECT") {
                    new_file_id = (chat.chat_id)
                    file_blob = await getUserProfileImage(db, chat.chat_id) || undefined
                } else if (chat.type === "GROUP" && chat.group_image_file) {
                    new_file_id = (chat.group_image_file.fileId)
                    file_blob = await getFile(db, new_file_id, null, chat.group_image_file.fileIv)
                }

                setFileId(new_file_id)
                file_blob && addBlob(new_file_id, file_blob)

                return () => { new_file_id && file_blob && removeBlob(new_file_id) }
            }
        })()
    }, [db])

    return  <Stack className="chat-item border" direction="horizontal" gap={1} key={chat.chat_id} >
        <Image className="w-25 border" alt={chat.name} src={getBlob(fileId) || undefined} roundedCircle />
        <span onClick={(e) => { 
            onChatClick(chat)
             }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chat_id) }} variant="danger">Leave</Button>
    </Stack>

}

export default ChatItem
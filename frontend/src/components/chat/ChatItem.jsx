import { useEffect, useState } from "react"
import { Button, Image, Stack } from "react-bootstrap"
import { getFile, getUserProfileImage } from "../../utils/RequestUtils"
import "../../css/chats.scss"
import useBlobStore from "../../context/useBlobStore"

export default function ChatItem({ chat, onChatClick, onChatLeave }) {

    let [addBlob, removeBlob, getBlob] = useBlobStore() 
    let [fileId, setFileId] = useState("")

    useEffect(() => {
        (async () => {
            let new_file_id = chat.type === "DIRECT"? (chat.chat_id) : chat.group_image_file && chat.group_image_file.fileId
            setFileId(new_file_id)
            if ( new_file_id && !getBlob(new_file_id) ) {
                let file_blob = null
                if (chat.type === "DIRECT") {
                    file_blob = await getUserProfileImage( new_file_id) || undefined
                } else if (chat.type === "GROUP" ) {
                    file_blob = await getFile( new_file_id, null, chat.group_image_file.fileIv)
                }
                addBlob(new_file_id, file_blob)
                return () => { new_file_id && file_blob && removeBlob(new_file_id) }
            }
        })()
    }, [])

    return  <Stack className="chat-item border" direction="horizontal" gap={1} key={chat.chat_id} >
        <Image className="w-25 border" alt={chat.name} src={getBlob(fileId) || undefined} roundedCircle />
        <span onClick={(e) => { 
            onChatClick(chat)
             }}> {chat.name || "No name to chat"} : {chat.new_message} new messages
        </span>
        <Button onClick={(e) => { onChatLeave(chat.chat_id) }} variant="danger">Leave</Button>
    </Stack>

}
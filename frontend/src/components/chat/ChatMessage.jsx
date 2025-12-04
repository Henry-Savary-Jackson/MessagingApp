import { Container, Stack, Image, Card, Button } from "react-bootstrap"
import { getFile, getUsername } from "../../utils/RequestUtils"
import { useState, useEffect, useContext, memo } from "react"
import { useIndexedDB } from "../../utils/StorageUtils";
import "../../css/chats.scss"

const ChatMessage = memo(({user_id, message_key, contents, sender }) => {

    let { db, loading } = useIndexedDB()
    let [file, setFile] = useState(undefined)
    let [fileBlobURL, setFileBlobURL] = useState(undefined)

    useEffect(() => {
        if (file) {
            setFileBlobURL(URL.createObjectURL(new Blob([file.data], { type: file.mimeType})))
        }
    }, [file])

    useEffect(() => {
        if (contents.fileId) {
            (async () => {
                if (db) {
                    let file_proto_obj = await getFile(db, contents.fileId, message_key, contents.fileIv)
                    setFile(file_proto_obj)
                }
            })()
        }
    }, [db])

    let [username, setUsername] = useState("")
    useEffect(() => {
        (async () => {
            if (db) {
                setUsername(await getUsername(db, sender))
            }
        })()
    }, [db])
    return <Stack className={user_id === sender ? "chat-message-sender": "chat-message-other" }  >
                <span className={user_id === sender ? "chat-text-sender": "chat-text-other" }  >{contents.text}</span>
                <span className={user_id==sender?  "text-end":"text-start"} >{username}</span> 
                {fileBlobURL && file.mimeType.startsWith("image/") && <Image thumbnail className={user_id === sender ? "align-self-end" : "align-self-start"} style={{ "maxHeight": "500px", "maxWidth": "500px", height: "auto", width: "auto" }} src={fileBlobURL} />}
                {fileBlobURL && <Button  href={fileBlobURL} download={file.fileName}>Download file</Button>}
            </Stack>
})


export default ChatMessage 
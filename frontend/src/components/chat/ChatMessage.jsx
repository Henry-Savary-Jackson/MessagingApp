import { Container , Stack, Image } from "react-bootstrap"
import { getFile, getUsername } from "../../utils/RequestUtils"
import { useState, useEffect, useContext } from "react"
import { userIdContext } from "../../globals"
import { send } from "../../utils/WebsocketUtils";
import { convertBase64StringToArrayBuffer } from "../../utils/EncodingUtils";


function ChatMessage({ message_key,contents, sender }) {

    let [user_id, setUserId] = useContext(userIdContext);
    let [file, setFile] = useState(undefined)
    let [fileBlobURL, setFileBlobURL] = useState(undefined)

    useEffect(() => {
        if (file) {
            setFileBlobURL(URL.createObjectURL(new Blob([file.data]), { type: file.mimeType }))
        }
    }, [file])

    useEffect(() => {
        if (contents.fileId) {
            (async () => { 
                let file_bytes=  await getFile(contents.fileId)
                let file_protobuf_obj = File.decode(file_bytes)
                setFile(file_protobuf_obj) 
            
            })()
        }
    }, [])

    let [username, setUsername] = useState("")
    useEffect(() => {
        (async () => { setUsername(await getUsername(sender)) })()
    }, [])
    return <Container className={user_id === sender ? "text-end" : "text-start"}>
        <Stack><span>{username}:{contents.text}</span>
            {fileBlobURL && file.mimeType.startsWith("image/") && <Image thumbnail className={user_id === sender? "align-self-end": "align-self-start"}  style={{ "maxHeight": "500px", "maxWidth": "500px", height: "auto", width: "auto" }} src={fileBlobURL} />}
            {fileBlobURL && <a href={fileBlobURL} download={`${contents.fileId}.png` }>Download file</a>}
        </Stack>
    </Container>
}


export default ChatMessage 
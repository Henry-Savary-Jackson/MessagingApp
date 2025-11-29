import { Container, Stack, Image, Card } from "react-bootstrap"
import { getFile, getUsername } from "../../utils/RequestUtils"
import { useState, useEffect, useContext, memo } from "react"
import { userIdContext } from "../../globals"
import { useIndexedDB } from "../../utils/StorageUtils";


const ChatMessage = memo(({ message_key, contents, sender }) => {

    let { db, loading } = useIndexedDB()
    let [user_id, setUserId] = useContext(userIdContext);
    let [file, setFile] = useState(undefined)
    let [fileBlobURL, setFileBlobURL] = useState(undefined)

    useEffect(() => {
        if (file) {
            setFileBlobURL(URL.createObjectURL(new Blob([file.data]), { type: file.mimetype }))
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
    return <Container className={user_id === sender ? "text-end" : "text-start"}>
        <Stack>
            <Stack className="p-3 ms-3 mw-50 gap-2 align-items-end" style={{ "border-radius": "15px", "background-color": "rgba(57, 192, 237,.2)" }} >
                <span className=" text-bg-white " >{user_id === sender ? `${contents.text}:${username}` : `${username}:${contents.text}`}</span>
                {fileBlobURL && file.mimetype.startsWith("image/") && <Image thumbnail className={user_id === sender ? "align-self-end" : "align-self-start"} style={{ "maxHeight": "500px", "maxWidth": "500px", height: "auto", width: "auto" }} src={fileBlobURL} />}
                {fileBlobURL && <a href={fileBlobURL} download={`${contents.fileId}`}>Download file</a>}
            </Stack>
        </Stack>
    </Container>
})


export default ChatMessage 
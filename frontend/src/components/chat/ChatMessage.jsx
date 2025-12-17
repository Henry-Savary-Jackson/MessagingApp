import { Container, Stack, Image, Card, Button } from "react-bootstrap"
import { getFile, getUsername } from "../../utils/RequestUtils"
import { useState, useEffect, useContext, memo } from "react"
import { DIRECT, GROUP, GROUP_INVITE, useIndexedDB, USER_ADDED, USER_REMOVED } from "../../utils/StorageUtils";
import "../../css/chats.scss"
import { user_id_context, username_context } from "../../globals";

const ChatMessage = memo(({ message_key, contents, sender, type }) => {

    let { db, loading } = useIndexedDB()
    let [file, setFile] = useState(undefined)
    let [fileBlobURL, setFileBlobURL] = useState(undefined)
    let [user_id, set_user_id] = useContext(user_id_context)
    let [current_username, set_current_username] = useContext(username_context)

    useEffect(() => {
        if (file) {
            setFileBlobURL(URL.createObjectURL(file))
        }
    }, [file])

    useEffect(() => {
        if (contents.fileId) {
            (async () => {
                if (db) {
                    let file_blob = await getFile(db, contents.fileId, message_key, contents.fileIv)
                    setFile(file_blob)
                }
            })()
        }
    }, [db])

    let [username, setUsername] = useState("")
    let [changed_user_username, set_new_username] = useState("")
    useEffect(() => {
        (async () => {
            if (db) {
                try {
                    setUsername(await getUsername(db, sender))
                } catch (e) {
                    if (e.code && e.code == 404) {
                        setUsername(`(Unknown user)${sender && sender.slice(0, 4)}`)
                    }
                }
            }
        })()
    }, [db])

    useEffect(() => {
        (async () => {
            let changed_user_id = contents.userGroupChange && contents.userGroupChange.userId
            if (db && type in [USER_ADDED, USER_REMOVED] && changed_user_id) {
                try {
                    set_new_username(await getUsername(db, changed_user_id))
                } catch (e) {
                    if (e.code && e.code == 404) {
                        set_new_username(`(Unknown user)${changed_user_id && changed_user_id.slice(0, 4)}`)
                    }
                }
            }
        })()
    }, [db])
    return <Stack className={user_id === sender ? "chat-message-sender" : "chat-message-other"}  >
        {[GROUP, DIRECT].includes(type)  &&
            <> <span className={user_id === sender ? "chat-text-sender" : "chat-text-other"}  >{contents.text}</span>
                <span className={user_id == sender ? "text-end" : "text-start"} >{username}</span></>}
        {[USER_ADDED, USER_REMOVED, GROUP_INVITE].includes(type)  && <span className="text-center">{username} {type === USER_REMOVED ? "removed" : "added"} {type === GROUP_INVITE ? current_username : changed_user_username}</span>}
        {fileBlobURL && file.mimeType.startsWith("image/") && <Image thumbnail className={user_id === sender ? "align-self-end" : "align-self-start"} style={{ "maxHeight": "500px", "maxWidth": "500px", height: "auto", width: "auto" }} src={fileBlobURL} />}
        {fileBlobURL && <Button href={fileBlobURL} download={file.name}>Download file</Button>}
    </Stack>
})


export default ChatMessage 
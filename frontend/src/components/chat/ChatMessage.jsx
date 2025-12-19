import { Stack, Image, Button, Container } from "react-bootstrap"
import { getFile, getUsername, getUserProfileImage } from "../../utils/RequestUtils"
import { useState, useEffect, useContext, memo } from "react"
import { DIRECT, GROUP, GROUP_INVITE, useIndexedDB, USER_ADDED, USER_REMOVED } from "../../utils/StorageUtils";
import "../../css/chats.scss"
import { blob_context, user_id_context, username_context } from "../../globals";

const ChatMessage = memo(({ message_key, contents, sender, type }) => {

    let { db, loading } = useIndexedDB()
    let [file_metadata, set_file_metadata] = useState(undefined)
    let [user_id, set_user_id] = useContext(user_id_context)
    let [current_username, set_current_username] = useContext(username_context)
    let [addBlob, removeBlob,getBlob, ] = useContext(blob_context)

    useEffect(() => {
        (async () => {
            if (db) {
                addBlob(sender, await getUserProfileImage(db, sender))
            }
        })()
    }, [db])

    useEffect(() => {
        if (contents.fileInfo) {
            (async () => {
                if (db) {
                    let file_blob = await getFile(db, contents.fileInfo.fileId, message_key, contents.fileInfo.fileIv)
                    addBlob(contents.fileInfo.fileId, file_blob)
                    set_file_metadata({ type: file_blob.type, name: file_blob.name })
                }
            })()
        }

        return () => { contents.fileInfo && removeBlob(contents.fileInfo.fileId) }
    }, [db])

    let [username, setUsername] = useState("")

    let [changed_user_username, set_changed_username] = useState("")

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
            if (db && [USER_ADDED, USER_REMOVED].includes(type) && changed_user_id) {
                try {
                    set_changed_username(await getUsername(db, changed_user_id))
                } catch (e) {
                    if (e.code && e.code == 404) {
                        set_changed_username(`(Unknown user)${changed_user_id && changed_user_id.slice(0, 4)}`)
                    }
                }
            }
        })()
    }, [db])
    return <Stack className={user_id === sender ? "chat-message-sender " : "chat-message-other"}  >
        {[GROUP, DIRECT].includes(type) &&
            <>
                <span className={user_id === sender ? "chat-text-sender" : "chat-text-other"}  >{contents.text}</span>
                {contents.fileInfo && <Image thumbnail className={user_id === sender ? "align-self-end" : "align-self-start"} src={getBlob(contents.fileInfo.fileId)} />}</>
        }
        {[USER_ADDED, USER_REMOVED, GROUP_INVITE].includes(type) && <span className="text-center">{username} {type === USER_REMOVED ? "removed" : "added"} {type === GROUP_INVITE ? current_username : changed_user_username}</span>}
        {[GROUP, DIRECT].includes(type) &&
            <Stack className={user_id === sender ? "justify-content-end" : ""} direction="horizontal">
                <Image roundedCircle className={`border msg-profile-image order-${Number(user_id === sender)}`} src={getBlob(sender)} />
                <span className={`order-${Number(user_id !== sender)}`}  >{username}</span>
            </Stack>}
        {contents.fileInfo && getBlob(contents.fileInfo.fileId) && <Button href={getBlob(contents.fileInfo.fileId)} download={file_metadata.name}><Image className="download-file-icon" src="/download-file-icon.svg"></Image>Download file</Button>}
    </Stack>
})


export default ChatMessage 
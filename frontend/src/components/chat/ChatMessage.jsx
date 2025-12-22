import { Stack, Image, Button, Container } from "react-bootstrap"
import { getFile, getUsername, getUserProfileImage } from "../../utils/RequestUtils"
import { useState, useEffect, useContext, memo } from "react"
import { DIRECT, GROUP, GROUP_INVITE, useIndexedDB, USER_ADDED, USER_REMOVED } from "../../utils/StorageUtils";
import "../../css/chats.scss"
import { blob_context, user_id_context, username_context } from "../../globals";

function render_text(contents, current_user_id, sender_id, sender_name, type, new_user_name, new_user_id) {
    let text = ""
    switch (type) {
        case DIRECT:
        case GROUP:
            text = contents.text
            break;
        case GROUP_INVITE:
            text = `${sender_name} added You`
            break;
        case USER_REMOVED:
        case USER_ADDED:
            if (sender_id === new_user_id) {
                text = `${sender_name} left`
            } else {
                text = `${sender_name} ${type == USER_ADDED ? "added" : "removed"} ${new_user_name}`
            }
            break;

    }
    let text_class = sender_id === current_user_id ? "chat-text-sender" : "chat-text-other"

    let message_class = sender_id === current_user_id ? "chat-message-sender" : "chat-message-other"

    if ([GROUP_INVITE, USER_ADDED, USER_REMOVED].includes(type)) {
        message_class = "chat-message-info"
        text_class = ""
    }
    return { text, text_class, message_class }
}

const ChatMessage = memo(({ message_key, contents, sender, type }) => {

    let { db, loading } = useIndexedDB()
    let [file_metadata, set_file_metadata] = useState(undefined)
    let [user_id, set_user_id] = useContext(user_id_context)
    let [current_username, set_current_username] = useContext(username_context)
    let [addBlob, removeBlob, getBlob,] = useContext(blob_context)

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


    let changed_user_id = contents.userGroupChange && contents.userGroupChange.userId
    useEffect(() => {
        (async () => {
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

    let { text, text_class, message_class } = render_text(contents, user_id, sender, username, type, changed_user_username, changed_user_id)
    return <Stack className={message_class}  >
        {text &&
            <span className={text_class}  >{text}</span>
        }
        {contents.fileInfo && <Image thumbnail className={user_id === sender ? "align-self-end" : "align-self-start"} src={getBlob(contents.fileInfo.fileId)} />}
        {contents.fileInfo && getBlob(contents.fileInfo.fileId) && <Button href={getBlob(contents.fileInfo.fileId)} download={file_metadata.name}><Image className="download-file-icon" src="/download-file-icon.svg"></Image>Download file</Button>}
        {[GROUP, DIRECT].includes(type) &&
            <Stack className={user_id === sender ? "justify-content-end" : ""} direction="horizontal">
                <Image roundedCircle className={`border msg-profile-image order-${Number(user_id === sender)}`} src={getBlob(sender)} />
                <span className={`order-${Number(user_id !== sender)}`}  >{username}</span>
            </Stack>}
    </Stack>
})


export default ChatMessage 
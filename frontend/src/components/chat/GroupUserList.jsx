import { useContext, useEffect, useState } from "react";
import { blob_context } from "../../globals";
import { Button, Image, CloseButton, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Stack } from "react-bootstrap";
import { getUserProfileById } from "../../utils/RequestUtils";
import "../../css/chats.scss"
import { get_chat, useIndexedDB } from "../../utils/StorageUtils";
import UserSearch from "./UserSearch";

function useUserInfo(db, user_id) {
    let [addBlob, removeBlob, getBlob] = useContext(blob_context)

    let [user_info, setUserInfo] = useState(null)
    let [profileURL, setProfileURL] = useState(null)

    useEffect(() => {
        (async () => {
            let new_user_info = await getUserProfileById(db, user_id)
            setUserInfo(new_user_info)
            addBlob(user_id, new_user_info.profile)
        })()
    }, [])

    useEffect(() => {
        if (user_info && user_info.profile) {
            let url = getBlob(user_id)
            setProfileURL(url)
        }
    }, [user_info])


    return { user_info, profileURL }

}

function UserGroupInfo({ chat_object, indexed_db, user_id, onRemoveUser }) {

    let { user_info, profileURL } = useUserInfo(indexed_db, user_id)

    return <Stack key={user_id} gap={2} className="w-100 border justify-items-start align-items-center" direction="horizontal">
        {profileURL && <Image className=" msg-profile-image " src={profileURL} roundedCircle />}
        <span>{user_info ? user_info.username : ""}</span>
        {user_id !== chat_object.initiator && <Button onClick={(e) => {
            onRemoveUser(user_id)
        }} variant="danger">X</Button>}
    </Stack>

}



export default function GroupUserList({ show, chat_id, onAddUser, onRemoveUser, onClose }) {

    let [chat_object, set_chat_object] = useState(null)
    let { db, loading } = useIndexedDB()

    const updateChatObject = async () => { set_chat_object(await get_chat(db, chat_id)) }

    useEffect(() => {
        if (db)
            updateChatObject()
    }, [db])


    async function removeUserCallback(user_id) {
        await onRemoveUser(chat_object, user_id)
        await updateChatObject()
    }

    async function addUserCallback(user_id) {
        await onAddUser(chat_object, user_id)
        await updateChatObject()
    }

    return <Modal show={show}>
        <ModalTitle>Manage users</ModalTitle>
        <ModalHeader>
            <UserSearch selectUserCallback={addUserCallback} />
        </ModalHeader>
        <ModalBody>
            <Stack>
                {chat_object && db && chat_object.users.map((user_id) => <UserGroupInfo key={user_id} chat_object={chat_object} indexed_db={db} onRemoveUser={removeUserCallback} user_id={user_id} initiator={chat_object.initiator} />)}
            </Stack>
        </ModalBody>
        <ModalFooter><CloseButton variant="danger" onClick={(e) => { onClose() }} /></ModalFooter>
    </Modal>
}
import { useEffect, useState } from "react";
import { Button, Image, CloseButton, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Stack } from "react-bootstrap";
import "../../css/chats.scss"
import { get_chat  } from "../../utils/StorageUtils";
import UserSearch from "./UserSearch";
import { useUserInfo } from "../../hooks/useUserInfo";



function UserGroupInfo({ chat_object, user_id, onRemoveUser }) {

    let { user_info, profileURL } = useUserInfo(user_id)

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

    const updateChatObject = async () => { set_chat_object(await get_chat( chat_id)) }

    useEffect(() => {
        updateChatObject()
    }, [])


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
                {chat_object  && chat_object.users.map((user_id) => <UserGroupInfo key={user_id} chat_object={chat_object} onRemoveUser={removeUserCallback} user_id={user_id} initiator={chat_object.initiator} />)}
            </Stack>
        </ModalBody>
        <ModalFooter><CloseButton variant="danger" onClick={(e) => { onClose() }} /></ModalFooter>
    </Modal>
}
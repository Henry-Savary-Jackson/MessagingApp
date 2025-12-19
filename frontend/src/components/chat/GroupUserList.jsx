
// use this to see
// list fo users
// search for user to add
// remove any users
// only for group initiator

import { useContext, useEffect, useState } from "react";
import { blob_context, user_id_context } from "../../globals";
import { Button, CloseButton, Form, FormControl, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Stack } from "react-bootstrap";
import { getUserId, getUsername, getUserProfileImage } from "../../utils/RequestUtils";
import "../../css/chats.scss"
import { useIndexedDB } from "../../utils/StorageUtils";

function UserGroupInfo({ db, user_id, onRemoveUser, chat_object }) {


    let [addBlob, removeBlob, getBlob] = useContext(blob_context)

    let [user_info, setUserInfo] = useState(null)


    useEffect(() => {
        (async () => {
            setUserInfo(await getUserProfileImage(db,user_id))
            if (user_info.profile && !getBlob(user_id))
                addBlob(user_id. user_info.profile)

            return ()=>{removeBlob(user_id)}
        })()
    }, [])

    return <Stack gap={2} className="w-100 border m-5 justify-items-start align-items-center" direction="horizontal">
        <Image className=" msg-profile-image " src={getBlob(user_id)|""} roundedCircle />
        <span>{user_info ? user_info.username: ""}</span>
       { user_id !== chat_object.initiator &&  <Button onClick={(e)=>{onRemoveUser(chat_object,user_id)}} variant="danger">X</Button> }
    </Stack>

}

export default function GroupUserList({ show, chat_object, onAddUser, onRemoveUser, onClose }) {
    let [usernameSearch, setUsernameSearch] = useState("")
    let [user_id, set_user_id] = useContext(user_id_context)

    let { db, loading } = useIndexedDB()

    return <Modal show={show}>
        <ModalTitle>Manage users</ModalTitle>
        <ModalHeader>
            <Form onSubmit={async (e)=>{
                e.preventDefault()
                onAddUser(chat_object, await getUserId(db, usernameSearch))
            }}>
                <FormControl type="text" value={usernameSearch} onChange={(e)=>setUsernameSearch(e.target.value)}/>
                <Button type="submit" variant="success">Add</Button>
            </Form>
        </ModalHeader>
        <ModalBody>
            <Stack>
                {chat_object && chat_object.users.map((user) => <UserGroupInfo db={db} onRemoveUser={onRemoveUser} user_id={user} initiator={chat_object.initiator} />)}
            </Stack>
        </ModalBody>
        <ModalFooter><CloseButton variant="danger" onClick={(e)=>{onClose()}}/></ModalFooter>
    </Modal>
}
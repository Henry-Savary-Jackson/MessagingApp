
// use this to see
// list fo users
// search for user to add
// remove any users
// only for group initiator

import { useContext, useEffect, useRef, useState } from "react";
import { blob_context, user_id_context } from "../../globals";
import { Button, Image, CloseButton, Form, FormControl, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Stack, ListGroup, ListGroupItem } from "react-bootstrap";
import { getUserId, getUsername, getUserProfileById, getUserProfileImage, searchUserIdsByUsername } from "../../utils/RequestUtils";
import "../../css/chats.scss"
import { get_chat, useIndexedDB } from "../../utils/StorageUtils";

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

function UserSearchResult({ indexed_db, user_id, onUserSelect }) {

    let { user_info, profileURL } = useUserInfo(indexed_db, user_id)

    return <ListGroupItem key={user_id} onClick={(e) => { onUserSelect(user_id) }}>
        {profileURL && <Image className=" msg-profile-image " src={profileURL} roundedCircle />}
        <span>{user_info ? user_info.username : ""}</span>
    </ListGroupItem>
}

export default function GroupUserList({ show, chat_id, onAddUser, onRemoveUser, onClose }) {
    let [usernameSearch, setUsernameSearch] = useState("")

    let [chat_object, set_chat_object] = useState(null)
    let { db, loading } = useIndexedDB()
    let searchState = useRef(false)
    let [foundUserIds, setFoundsUserIds] = useState(null)


    let setSearchResultCallback = async () => {
        searchState.current = true
        try {
            usernameSearch && setFoundsUserIds(await searchUserIdsByUsername(db, usernameSearch))
        } finally {
            searchState.current = false
        }
    }

    const updateChatObject = async () => { set_chat_object(await get_chat(db, chat_id)) }

    useEffect(() => {
        if (db)
            updateChatObject()
    }, [db])

    useEffect(() => {
        var timeout = setTimeout(async () => {
            if (searchState.current) {
                clearTimeout(timeout)
                return;
            }
            setSearchResultCallback()
        }, 250)
    }, [usernameSearch])

    async function removeUserCallback(user_id) {
        await onRemoveUser(chat_object, user_id)
        await updateChatObject()
    }

    async function addUserCallback(user_id) {
        await onAddUser(chat_object, user_id)
        setUsernameSearch("");
        setFoundsUserIds(null)
        await updateChatObject()
    }

    return <Modal show={show}>
        <ModalTitle>Manage users</ModalTitle>
        <ModalHeader>
            <Form onSubmit={async (e) => {
                e.preventDefault()
                addUserCallback(await getUserId(db, usernameSearch))
            }}>
                <FormControl type="text" value={usernameSearch} onChange={(e) => setUsernameSearch(e.target.value)} />
                <Button type="submit" variant="success">Add</Button>
                {foundUserIds && <ListGroup>
                    {foundUserIds.map((user_id) => <UserSearchResult onUserSelect={(user_id) => {
                        addUserCallback(user_id)
                    }} indexed_db={db} user_id={user_id} />)}
                </ListGroup>}
            </Form>
        </ModalHeader>
        <ModalBody>
            <Stack>
                {chat_object && db && chat_object.users.map((user) => <UserGroupInfo chat_object={chat_object} indexed_db={db} onRemoveUser={removeUserCallback} user_id={user} initiator={chat_object.initiator} />)}
            </Stack>
        </ModalBody>
        <ModalFooter><CloseButton variant="danger" onClick={(e) => { onClose() }} /></ModalFooter>
    </Modal>
}
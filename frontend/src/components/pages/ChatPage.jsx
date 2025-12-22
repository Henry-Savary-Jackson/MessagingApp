import { useContext, useEffect, useReducer, useState } from 'react'
import { Stack, Col, Container, Row, Modal, ModalTitle, ModalBody, ModalFooter, CloseButton } from 'react-bootstrap'
import { Link, useLocation } from 'react-router'
import { createChat, getCSRF, getPrekeyBundle, getUsername, getUserProfileImage, logout, setAxiosCSRF } from '../../utils/RequestUtils'
import ChatWindow from "./../chat/ChatWindow"
import ChatListBar from "./../chat/ChatListBar"
import { decrypt_chat_message, init_ratchet_root_receiver, init_ratchet_root_sender, handle_all_skipped_messages_for_session } from '../../utils/RatchetUtils'
import { handle_X3DH_message, send_X3DH_message } from '../../utils/X3DHUtils'
import { handle_new_encrypted_message, send_new_encrypted_message } from '../../utils/MessagingUtils'
import { ChatMessage } from '../../utils/protocol/messages'
import { create_chat_object, create_double_ratchet_recipient, delete_chat, delete_skipped_message, get_all_chats, get_all_double_ratchet_sess, get_chat, get_double_ratchet_session, get_messages, get_metadata, getOneTimePrekeyWithPubKey, set_metadata, store_chat, store_double_ratchet_session, store_message, useIdentityInformation, useIndexedDB, USER_ADDED, USER_REMOVED } from '../../utils/StorageUtils'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { blob_context, identity_context, user_id_context, username_context } from '../../globals'
import GroupChatCreate from '../chat/GroupChatCreate'
import UserSearch from '../chat/UserSearch'


function ChatPage({ ident_info, set_ident_info, logoutCallback }) {

    let location = useLocation()

    let [show_user_search, set_show_user_search] = useState(false)



    let [currentChatId, setCurrentChat] = useState("")

    let [blobs, blobsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "add":
                return { ...prev, [action.fileId]: URL.createObjectURL(action.blob) }
            case "remove":
                URL.revokeObjectURL(prev[action.fileId])
                delete prev[action.fileId]
                return { ...prev }
        }
    }, {})

    const add_blob = (fileId, blob) => { blob && blobsReducer({ action: "add", fileId: fileId, blob: blob }) }
    const remove_blob = (fileId) => { blobsReducer({ action: "remove", fileId: fileId }) }
    const get_blob = (fileId) => blobs[fileId]

    let [chats, chatsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "init":
                return action.data.map((chat) => { return { ...chat, "new_message": 0, "last_timestamp": 0 } })
            case "add":
                return [...prev, { ...action.new, "new_message": 0, "last_timestamp": 0 }].sort((a, b) => b.last_timestamp - a.last_timestamp)
            case "del":
                return prev.filter((chat) => chat.chat_id !== action.chat_id);
            case "read_message":
                return prev.map((chat) => {
                    if (chat.chat_id !== action.chat_id)
                        return { ...chat }
                    return { ...chat, new_message: 0 }
                }).sort((a, b) => b.last_timestamp - a.last_timestamp)
            case "add_message":
                return prev.map((chat) => {
                    if (chat.chat_id !== action.chat_id)
                        return chat
                    return { ...chat, messages: [...chat.messages, action.message], new_message: chat.new_message + 1, "last_timestamp": new Date().getTime() }
                })


        }
    }, [])


    const getChatById = (chat_id) => chats.find((chat) => chat.chat_id === chat_id)


    const addMessageUI = (newMessage) => { chatsReducer({ action: "add_message", message: newMessage, chat_id: newMessage.chat_id }) }

    const readMessages = (chat_id) => { chatsReducer({ chat_id: chat_id, "action": "read_message" }) }
    const addNewChatUI = async (chat) => {
        chatsReducer({ "action": "add", "new": chat })
    }
    const setNewChats = (newChats) => { chatsReducer({ "action": "init", "data": newChats }) }
    const delChatUI = (chat_id) => { chatsReducer({ "action": "del", chat_id: chat_id }) } // TODO: make it so that the message
    const chatInUI = (chat_id) => chats.find((chat) => chat.chat_id === chat_id)


    let { db, loading } = useIndexedDB()

    useEffect(() => {
        async function get_chats_callback() {
            if (db) {
                let chats = await get_all_chats(db) || []
                setNewChats(chats)
            }
        }
        get_chats_callback()

    }, [db])
    let [user_metadata, set_user_metadata] = useState({})

    async function update_metadata(new_metadata) {
        set_user_metadata(new_metadata)
        await set_metadata(db, new_metadata, user_id)
    }

    useEffect(() => {
        (async () => {
            if (!db || !user_id)
                return
            let metadata = await get_metadata(db, user_id) || { last_msg_timestamp: new Date().getTime() }
            metadata && update_metadata(metadata)
        })()
    }

        , [db])

    let [user_id, set_user_id] = useContext(user_id_context)
    let [username, set_current_username] = useContext(username_context)


    let [show_chat_modal, set_chat_modal] = useState(false)

    const onMessageUI = async (msg_obj, chat_object) => {
        if (msg_obj && msg_obj.type === USER_REMOVED && !msg_obj.message_contents.userGroupChange) {
            leaveChatUI(chat_object.chat_id)
            return;
        }
        if (chat_object && !chatInUI(chat_object.chat_id))
            addNewChatUI(chat_object)

        if (msg_obj)
            addMessageUI(msg_obj)

        if (currentChatId && chat_object && chat_object.chat_id === currentChatId)
            readMessages(chat_object.chat_id)

    }

    const onMessage = async (message) => {
        console.log("New STOMP message!")
        try {
            let chat_message = ChatMessage.decode(message.binaryBody)
            if (chat_message.messageHeader) {
                // X3DH message
                let new_dr_session = await handle_X3DH_message(db, ident_info.identityKey, ident_info.signedPrekey, chat_message)

                let found_skipped_messages = await handle_all_skipped_messages_for_session(db, client, ident_info, new_dr_session)

                found_skipped_messages.forEach(
                    async (skipped_msg) => {
                        let { msg_obj, chat_object } = skipped_msg
                        console.log("Handling skipped message on UI!")
                        console.log(skipped_msg)
                        await onMessageUI(msg_obj, chat_object);
                    })
            } else {
                // nortmal message, decrypt with double ratchet algo

                let { msg_obj, chat_object } = await handle_new_encrypted_message(db, client, chat_message, ident_info)
                await onMessageUI(msg_obj, chat_object)
            }
        } finally {
            // is there not a cleaner way to do this????
            // why should i update the whole object
            // doing this causes re_renders which causes unnecesarry unsub adnd subcribe calls
            const new_metadata = { ...user_metadata, last_msg_timestamp: new Date().getTime() }
            set_user_metadata(new_metadata)
            db && await set_metadata(db, new_metadata, user_id)
        }
    }


    useSubscription("/user/messages", onMessage, { last_timestamp: (user_metadata && user_metadata.last_msg_timestamp) || new Date().getTime() })
    const client = useStompClient()

    const sendMessage = async (chat_id, text, file_object = null) => {
        let inital_chat_obj = await get_chat(db, chat_id)
        let {msg_obj, chat_object} = await send_new_encrypted_message(client, db, chat_id, { text: text, file: file_object }, user_id, ident_info, inital_chat_obj.type, file_object)
        await store_message(db, msg_obj, chat_object)
        addMessageUI(msg_obj)
        readMessages(chat_id)
    }
    const onInviteUser = async (chat, other_id) => {
        let {msg_obj,chat_object} = await send_new_encrypted_message(client, db, chat.chat_id, { userId: other_id }, user_id, ident_info, USER_ADDED)
        await store_message(db, msg_obj, chat_object)
        addMessageUI(msg_obj)
        readMessages(chat.chat_id)
    }

    const onDeleteUser = async (chat, other_id) => {
        let {msg_obj,chat_object} = await send_new_encrypted_message(client, db, chat.chat_id, { userId: other_id }, user_id, ident_info, USER_REMOVED)
        await store_message(db, msg_obj, chat_object)
        addMessageUI(msg_obj)
        readMessages(chat.chat_id)
    }

    const onChatToNewUser = async (other_id) => {
        try {
            let other_name = await getUsername(db, other_id)
            let prekey_bundle_other = await getPrekeyBundle(other_name)
            // if chat is already in ui, dont bother
            if (chatInUI(other_id)) {
                return
            }
            // if a chat exists, then double ratchet session must exist
            if (!(await get_double_ratchet_session(db, other_id))) {
                await send_X3DH_message(db, client, user_id, other_id, other_name, ident_info.identityKey, ident_info.signedPreKey, ident_info.verifierKey, prekey_bundle_other)
            }
            let chat_object = await create_chat_object(other_id, other_name, "DIRECT")
            await store_chat(db, chat_object)

            // for debugging
            if (!chat_object)
                throw new Error("Cannot add empty chat in UI")

            addNewChatUI(chat_object)
            set_show_user_search(false)
        } catch (e) {
            if (e.code && e.code == 404) {
                alert("failed to get prekey bundle")
            } else {
                throw e
            }
        }
    }
    const leaveChatUI = async (chat_id) => {
        delChatUI(chat_id);
        if (currentChatId && chat_id === currentChatId.chat_id)
            setCurrentChat(undefined)
    }
    const leaveChat = async (chat_id) => {
        let chat_object = await get_chat(db, chat_id)
        if (chat_object.type === "GROUP")
            await send_new_encrypted_message(client, db, chat_id, { userId: user_id }, user_id, ident_info, USER_REMOVED)
        await delete_chat(db, chat_id);
        leaveChatUI(chat_id)
    }

    const onChatClick = async (chat_object) => {
        const chat_id = chat_object.chat_id
        setCurrentChat(chat_id)
        readMessages(chat_id)
    }

    let currentChat = currentChatId && getChatById(currentChatId)


    return <blob_context.Provider value={[add_blob, remove_blob, get_blob]} > <Container fluid><Row>
        <Col sm={2} >
            <Stack gap={2}>
                <span>{username}</span>
                <Link className='btn btn-primary' to={"/profile"} >Edit Profile</Link>
                <Link className='btn btn-danger' to={"/login"} onClick={async (e) => {
                    await logout()
                    logoutCallback()
                    location.pathname = "/login"
                }} >Logout</Link>
            </Stack>
        </Col>
        <Col sm={4} >
            <ChatListBar chats={chats} onChatLeave={leaveChat} onChatClick={onChatClick} onMessageUser={() => { set_show_user_search(true) }} onChatCreate={() => { set_chat_modal(true) }} />
        </Col>
        <Col className='vh-100' sm={6}>
            {currentChat && <ChatWindow onDeleteUser={onDeleteUser} onInviteUser={onInviteUser} chat_object={currentChat} onMessageSend={sendMessage} />}
        </Col>
    </Row>
        <Modal show={show_user_search}>
            <ModalTitle>Search for user</ModalTitle>
            <ModalBody>
                <UserSearch selectUserCallback={onChatToNewUser} />
            </ModalBody>
            <ModalFooter>
                <CloseButton variant='danger' onClick={(e) => set_show_user_search(false)} />
            </ModalFooter>
        </Modal>
        <GroupChatCreate show={show_chat_modal} onChatCreate={(chat) => { addNewChatUI(chat); set_chat_modal(false) }} onClose={() => { set_chat_modal(false) }} />
    </Container>
    </blob_context.Provider>
}

export default ChatPage

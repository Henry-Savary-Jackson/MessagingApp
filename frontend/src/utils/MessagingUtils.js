import { ChatMessage, MessageType, MessageHeader, MessageFile, MessageContents } from "./protocol/messages"
import { decrypt_message_contents, encrypt_file_contents, encrypt_header, encrypt_message_contents, exportX25519PublicKey, signed_prekey_lifetime_ms } from './CryptoUtils'
import { store_message, convert_proto_chat_msg, DIRECT, get_chat, get_double_ratchet_session, GROUP, GROUP_MEMBERSHIP, GROUP_INVITE, store_chat, store_double_ratchet_session, USER_ADDED, USER_REMOVED, delete_chat, create_chat_object, store_skipped_message } from './StorageUtils'
import { decrypt_chat_message, ratchet_turn_send } from "./RatchetUtils"
import { getPrekeyBundle, getUsername, uploadFile } from "./RequestUtils"
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer } from "./EncodingUtils"
import { send_X3DH_message } from "./X3DHUtils"

export var broker_url = "ws://localhost:8080/ws"
const protobuf_mimetype = "application/x-protobuf"



export function send(client, recipient, chatMessage) {

    client.publish({
        destination: `/send/${recipient}`, binaryBody: ChatMessage.encode(chatMessage).finish(), headers: { "content-type": protobuf_mimetype }
    })
}

export function parseMessage(message_bytes) {
    let chatMessage = ChatMessage.decode(message_bytes);
    // TODO handle verification errors
    return chatMessage;
}

export async function send_user_removal_message(client, indexed_db, chat_id, contents, sender_id) {
    // make the contest
    let removed_user_id = contents.userId

    let chat_object = await get_chat(indexed_db, chat_id)
    chat_object.users = chat_object.users.filter((user) => user === removed_user_id)
    await store_chat(indexed_db, chat_object)
    // send_direct_message
    let message_contents_to_removed = {
    }
    // if empty the user will delete their group chat client side. In any case htey wont recieve the new group key
    await send_direct_message(client, indexed_db, removed_user_id, message_contents_to_removed, sender_id, USER_REMOVED)

    let group_chat_msg_contents = { userGroupChange: { userId: removed_user_id, newGroupKey: chat_object.group_secret_key, } }

    return await send_group_message(client, indexed_db, chat_id, group_chat_msg_contents, sender_id, USER_REMOVED)
}
export async function send_group_membership_message(client, indexed_db, chat_id, contents, sender_id, identity) {
    let new_user_id = contents.userId

    let chat_object = await get_chat(indexed_db, chat_id)
    let message_contents_to_new = {
        groupMembership:
        {
            groupKey: chat_object.group_secret_key,
        }
    }
    return await send_direct_message(client, indexed_db, new_user_id, message_contents_to_new, sender_id,identity, GROUP_MEMBERSHIP)
}

export async function send_user_add_message(client, indexed_db, chat_id, contents, sender_id,identity) {
    // make the contest
    let new_user_id = contents.userId

    let chat_object = await get_chat(indexed_db, chat_id)
    // send_direct_message
    let message_contents_to_new = {
        groupChatInvite:
        {
            groupChatId: chat_id,
            groupChatName: chat_object.name,
            groupKey: chat_object.group_secret_key,
            groupImage: chat_object.group_image_file
        }
    }
    await send_direct_message(client, indexed_db, new_user_id, message_contents_to_new, sender_id,identity, GROUP_INVITE)

    return await send_group_message(client, indexed_db, chat_id, { userId: new_user_id, newGroupKey: chat_object.group_secret_key, }, sender_id,identity ,USER_ADDED)
}

export async function send_group_message(client, indexed_db, chat_id, contents, sender_id, identity,type = GROUP) {

    // get chat
    let chat_object = await get_chat(indexed_db, chat_id)

    // get all the users in the chat

    let users = chat_object.users

    let message_contents_protobuf_obj = MessageContents.fromObject(contents)
    // encrypt using group key
    let encrypted_bytes = await encrypt_message_contents(chat_object.group_secret_key, message_contents_protobuf_obj)

    // create message headers for
    let message_contents_text = convertArrayBufferToBase64(encrypted_bytes)
    let result = {}
    for (let user of users) {
        // for each user
        if (user === sender_id)
            continue
        // send this message using dourble ratchet algo
        result = await send_direct_message(client, indexed_db, user, { text: message_contents_text }, sender_id, identity,type)
    }

    return { type: type, sender_id: sender_id, message_contents: contents, message_key: chat_object.group_secret_key, timestamp: new Date().getTime() }
}


export async function send_direct_message(client, indexed_db, recipient_id, contents, sender_id, identity,type = DIRECT) {
    let dr_session = await get_double_ratchet_session(indexed_db, recipient_id)
    if (!dr_session) {
        // initiate  X3DH if a session is not already initiate
        let recipient_username = await getUsername(indexed_db, recipient_id)
        let recipient_prekey_bundle = await getPrekeyBundle(recipient_username)
        dr_session = await send_X3DH_message(indexed_db, client, sender_id, recipient_id, recipient_username, identity.identityKey, identity.signedPrekey, identity.verifierKey, recipient_prekey_bundle)
    }
    // ratchet turn, if you have not send any messages on the sending chain, you should do a ratchet turn for the root key
    let message_keys = dr_session.sending_chain.message_keys
    await ratchet_turn_send(dr_session, dr_session.receiving_chain.message_keys.length > 0)
    // save changes
    await store_double_ratchet_session(indexed_db, dr_session)
    // get the message key for the message
    let message_key = message_keys[message_keys.length - 1]

    let message_contents_js_obj = { ...contents }
    if (contents.file) {
        let file_contents_protobuf_obj = MessageFile.fromObject(contents.file)
        let [file_contents_encrypt, file_iv] = await encrypt_file_contents(message_key, file_contents_protobuf_obj)
        let file_id = await uploadFile(file_contents_encrypt)
        message_contents_js_obj = { ...message_contents_js_obj, fileId: file_id, fileIv: file_iv }
    }
    let message_contents_protobuf_obj = MessageContents.fromObject(message_contents_js_obj)
    let [message_contents_encrypted, iv] = await encrypt_message_contents(message_key, message_contents_protobuf_obj)

    let message_header_js_obj = {
        type: type,
        chainLength: message_keys.length,
        messageIv: iv,
        senderId: sender_id,
        previousLength: dr_session.sending_chain.pn || 0, // put previous n
        dhPublicKey: await exportX25519PublicKey(dr_session.dh_keypair_private.publicKey)
    }


    let message_header_proto = MessageHeader.fromObject(message_header_js_obj)
    let [message_header_enc, header_iv] = await encrypt_header(message_header_proto, dr_session.sending_chain.header_key)

    let chat_message_js_obj = {
        messageHeaderEncrypted: message_header_enc,
        messageContentsEncrypted: message_contents_encrypted,
        timestamp: new Date().getTime(),
        headerIv: header_iv
    }

    let chat_message_proto_obj = ChatMessage.fromObject(chat_message_js_obj)
    send(client, dr_session.user_id, chat_message_proto_obj)

    return { sender_id: sender_id, message_contents: message_contents_js_obj, type: message_header_js_obj.type, message_key: message_key, timestamp: chat_message_js_obj.timestamp }
}

// if direct, using norm dr ratchet,
// if it is a group chat, using the current group key

export async function send_new_encrypted_message(client, indexed_db, chat_id, contents, sender_id, identity ,type = DIRECT) {
    switch (type) {
        case DIRECT:
            return await send_direct_message(client, indexed_db, chat_id, contents, sender_id, identity)
        case GROUP:
            return await send_group_message(client, indexed_db, chat_id, contents, sender_id, identity)
        case USER_ADDED:
            return await send_user_add_message(client, indexed_db, chat_id, contents, sender_id, identity)
        case USER_REMOVED:
            return await send_user_removal_message(client, indexed_db, chat_id, contents, sender_id,  identity)
        case GROUP_MEMBERSHIP:
            return await send_group_membership_message(client, indexed_db, chat_id, contents, sender_id, identity)

        default:
            throw new Error("Oi the message type is not a proper message type.")
    }
}

export async function handle_group_invite_message(indexed_db, chat_message, message_contents, message_header, message_key) {

    let { groupChatId, groupChatName, groupKey, groupImage } = message_contents.groupChatInvite.chatId

    let new_chat_object = await create_chat_object(groupChatId, groupChatName, "GROUP", [message_header.senderId], groupImage, groupKey)

    return await store_message_object_chat(indexed_db, chat_message, message_contents, message_header, message_key, new_chat_object)
}

export async function convertGroupMessage(chat_object, contents) {
    let secret_group_key = chat_object.group_secret_key
    let bytes = convertBase64StringToArrayBuffer(contents.text)
    return await decrypt_message_contents(secret_group_key, bytes)
}

export async function handle_user_removed_message(indexed_db, client, chat_message, message_contents, message_header, message_key) {
    let chat_object = await get_chat(indexed_db, message_header.chatId)
    let decrypted_contents = await convertGroupMessage(chat_object, message_contents)

    // check if empty
    if (!decrypted_contents.userGroupChange) {
        // remove yourself from the group 
        await delete_chat(indexed_db, message_header.chatId)
        return { msg_obj: null, chat_object: null }
    }

    let removed_user_id = decrypted_contents.userGroupChange.userId
    // update user list and new group key
    chat_object.users = chat_object.users.filter((user) => user === removed_user_id)
    chat_object.group_secret_key = decrypted_contents.userGroupChange.newGroupKey

    return await store_message_object_chat(indexed_db, chat_message, decrypted_contents, message_header, message_key, chat_object)
}

export async function store_message_object_chat(indexed_db, chat_message, message_contents, message_header, message_key, chat_object) {
    let msg_obj = convert_proto_chat_msg(chat_message, message_contents, message_header, message_key)
    await store_message(indexed_db, msg_obj, chat_object)
    return { msg_obj, chat_object }
}

export async function handle_user_added_message(indexed_db, client, user_id, chat_message, message_contents, message_header, message_key, identity) {

    let decrypted_contents = await convertGroupMessage(chat_object, message_contents)

    let user_group_change = decrypted_contents.userGroupChange
    // look for double ratchet session with new user
    let chat_object = await get_chat(indexed_db, message_header.chatId)

    let new_user_id = user_group_change.userId
    let new_group_key = user_group_change.newGroupKey
    chat_object.users = [...chat_object.users, new_user_id]
    chat_object.group_secret_key = new_group_key

    // look for double ratchet session and initiate if doesnt exist
    
    // send membership message
    await send_direct_message(client, indexed_db, new_user_id, { groupMembership: { groupKey: new_group_key } }, user_id, identity,GROUP_MEMBERSHIP)

    return await store_message_object_chat(indexed_db, chat_message, message_contents, message_header, message_key, chat_object)
}

export async function handle_group_message(indexed_db, chat_message, message_contents, message_header, message_key) {
    let chat_object = await get_chat(indexed_db, message_header.chatId)
    return store_message_object_chat(indexed_db, chat_message, message_contents, message_header, message_key, chat_object)
}

export async function handle_direct_message(indexed_db, chat_message, message_contents, message_header, message_key) {
    let chat_object = await get_chat(indexed_db, message_header.senderId)
    return await store_message_object_chat(indexed_db, chat_message, message_contents, message_header, message_key, chat_object)

}

export async function handle_new_encrypted_message(indexed_db, client, chat_message, identity, dr_session = null) {

    let { message_contents, message_header, message_key } = await decrypt_chat_message(indexed_db, chat_message, dr_session)
    // handle messages not found
    if (!(message_contents && message_header && message_key)) {
        console.log("skipped message")
        await store_skipped_message(indexed_db, chat_message)
        return {msg_obj:null, chat_object:null};
    }

    switch (MessageType[message_header.type]) {
        case DIRECT:
            return await handle_direct_message(indexed_db, chat_message, message_contents, message_header, message_key)
        case GROUP:
            return await handle_group_message(indexed_db, client, chat_message, message_contents, message_header, message_key)
        case USER_ADDED:
            return await handle_user_added_message(indexed_db, client, identity.user_id, chat_message, message_contents, message_header, message_key, identity)
        case USER_REMOVED:
            return await handle_user_removed_message(indexed_db, client, chat_message, message_contents, message_header, message_key)
        case GROUP_INVITE:
            return await handle_group_invite_message(indexed_db, chat_message, message_contents, message_header, message_key)
        default:
            throw new Error("Invalid message type in header.")
    }
}




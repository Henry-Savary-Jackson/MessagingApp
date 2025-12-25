import { ChatMessage, MessageType, MessageHeader, MessageFile, MessageContents } from "./protocol/messages"
import { decrypt_message_contents, encrypt_file_contents, encrypt_header, encrypt_message_contents, exportAESKey, exportX25519PublicKey, generateAESkey, signed_prekey_lifetime_ms } from './CryptoUtils'
import { store_message, convert_proto_chat_msg, DIRECT, get_chat, get_double_ratchet_session, GROUP, GROUP_MEMBERSHIP, GROUP_INVITE, store_chat, store_double_ratchet_session, USER_ADDED, USER_REMOVED, delete_chat, create_chat_object, store_skipped_message } from './StorageUtils'
import { decrypt_chat_message, ratchet_turn_send } from "./RatchetUtils"
import { getPrekeyBundle, getUsername, uploadFile } from "./RequestUtils"
import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer } from "./EncodingUtils"
import { send_X3DH_message } from "./X3DHUtils"
import { user_id_context } from "../globals"

export var broker_url = "ws://localhost:8080/ws"
const protobuf_mimetype = "application/x-protobuf"



export function send(client, recipient, chatMessage) {

    client.publish({
        destination: `/send/${recipient}`, binaryBody: ChatMessage.encode(chatMessage).finish(), headers: { "content-type": protobuf_mimetype }
    })
}

export function parseMessage(message_bytes) {
    let chatMessage = ChatMessage.decode(message_bytes);
    // TODO: handle verification errors
    return chatMessage;
}


export async function send_user_removal_message(client,  chat_id, contents, sender_id, identity) {
    // make the contest
    let removed_user_id = contents.userId

    let chat_object = await get_chat( chat_id)
    chat_object.users = chat_object.users.filter((user) => user !== removed_user_id)
    // send_direct_message
    if (removed_user_id !== sender_id) {
        // if empty the user will delete their group chat client side. In any case htey wont recieve the new group key
        await send_direct_message(client, removed_user_id, {}, sender_id, identity, USER_REMOVED, chat_id)
    }

    let group_chat_msg_contents = { userGroupChange: { userId: removed_user_id, newGroupKey: chat_object.group_secret_key, } }

    // create new group key to keep new comms secret to removed user

    let result = await send_group_message(client,  chat_id, group_chat_msg_contents, sender_id, identity, USER_REMOVED)
    return { ...result, chat_object }
}
export async function send_group_membership_message(client,  chat_id, contents, sender_id, identity) {
    let new_user_id = contents.userId

    let chat_object = await get_chat( chat_id)
    let message_contents_to_new = {
        groupMembership:
        {
            groupKey: chat_object.group_secret_key,
        }
    }
    await send_direct_message(client,  new_user_id, message_contents_to_new, sender_id, identity, GROUP_MEMBERSHIP, chat_id)
    return { msg_obj: null, chat_object }
}

export async function send_user_add_message(client,  chat_id, contents, sender_id, identity) {
    // make the contest
    let new_user_id = contents.userId

    let chat_object = await get_chat( chat_id)
    // send_direct_message
    let message_contents_to_new = {
        groupInvite:
        {
            groupChatId: chat_id,
            groupChatName: chat_object.name,
            groupKey: chat_object.group_secret_key,
            groupImage: chat_object.group_image_file
        }
    }

    await send_direct_message(client,  new_user_id, message_contents_to_new, sender_id, identity, GROUP_INVITE)

    let result = await send_group_message(client,  chat_id, { userGroupChange: { userId: new_user_id, newGroupKey: chat_object.group_secret_key, } }, sender_id, identity, USER_ADDED)
    chat_object.users.push(new_user_id)
    return { ...result, chat_object: chat_object }
}

export async function send_group_message(client, chat_id, contents, sender_id, identity, type = GROUP) {

    // get chat
    let chat_object = await get_chat( chat_id)

    // get all the users in the chat

    let users = chat_object.users
    let file_key = null
    if (contents.file) {
        let file_contents_protobuf_obj = MessageFile.fromObject(contents.file)
        file_key = await exportAESKey(await generateAESkey())
        let [file_contents_encrypt, file_iv] = await encrypt_file_contents(file_key, file_contents_protobuf_obj)
        let file_id = await uploadFile(file_contents_encrypt)
        contents = { ...contents, fileInfo: { fileId: file_id, fileIv: file_iv, fileKey: file_key } }
        // upload file encrypted with group key and remove it so there isn't an upload for each individal participant
    }



    for (let user of users) {
        // for each user
        if (user === sender_id)
            continue
        // send this message using dourble ratchet algo
        await send_direct_message(client,  user, contents, sender_id, identity, type, chat_id)
    }

    // convert file data into fileblob and store it locally
    let msg_obj = { chat_id: chat_id, type: type, sender_id: sender_id, message_contents: contents, message_key: file_key, timestamp: new Date().getTime() }

    return { msg_obj, chat_object }
}


export async function send_direct_message(client,  recipient_id, contents, sender_id, identity, type = DIRECT, chat_id = null) {
    let dr_session = await get_double_ratchet_session( recipient_id)
    if (!dr_session) {
        // initiate  X3DH if a session is not already initiate
        let recipient_username = await getUsername( recipient_id)
        console.log(recipient_username)
        let recipient_prekey_bundle = await getPrekeyBundle(recipient_username)
        dr_session = await send_X3DH_message( client, sender_id, recipient_id, recipient_username, identity.identityKey, identity.signedPrekey, identity.verifierKey, recipient_prekey_bundle)
    }
    // ratchet turn, if you have not send any messages on the sending chain, you should do a ratchet turn for the root key
    await ratchet_turn_send( dr_session, dr_session.receiving_chain.message_keys.length > 0)
    let message_keys = dr_session.sending_chain.message_keys
    // save changes
    await store_double_ratchet_session( dr_session)
    // get the message key for the message
    let message_key = message_keys[message_keys.length - 1]

    if (contents.file) {
        let file_contents_protobuf_obj = MessageFile.fromObject(contents.file)
        let [file_contents_encrypt, file_iv] = await encrypt_file_contents(message_key, file_contents_protobuf_obj)
        let file_id = await uploadFile(file_contents_encrypt)
        contents = { ...contents, fileInfo: { fileId: file_id, fileIv: file_iv } }
        delete contents.file
    }
    let message_contents_protobuf_obj = MessageContents.fromObject(contents)
    let [message_contents_encrypted, iv] = await encrypt_message_contents(message_key, message_contents_protobuf_obj)

    let message_header_js_obj = {
        type: type,
        chainLength: message_keys.length,
        messageIv: iv,
        senderId: sender_id,
        previousLength: dr_session.sending_chain.pn || 0, // put previous n
        dhPublicKey: await exportX25519PublicKey(dr_session.dh_keypair_private.publicKey)
    }
    if (chat_id)
        message_header_js_obj.chatId = chat_id

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
    // setTimeout(() => 
    // , Math.random() * 10000)

    return { sender_id: sender_id, message_contents: contents, type: message_header_js_obj.type, message_key: message_key, timestamp: chat_message_js_obj.timestamp }
}

// if direct, using norm dr ratchet,
// if it is a group chat, using the current group key

export async function send_new_encrypted_message(client, chat_id, contents, sender_id, identity, type = DIRECT, file = null) {
    switch (type) {
        case DIRECT:
            // is this crappy code
            let msg_obj = await send_direct_message(client, chat_id, contents, sender_id, identity)
            let chat_object = await get_chat( chat_id)
            return { msg_obj, chat_object }
        case GROUP:
            return await send_group_message(client,  chat_id, contents, sender_id, identity)
        case USER_ADDED:
            return await send_user_add_message(client,  chat_id, contents, sender_id, identity)
        case USER_REMOVED:
            return await send_user_removal_message(client,  chat_id, contents, sender_id, identity)
        case GROUP_MEMBERSHIP:
            return await send_group_membership_message(client,  chat_id, contents, sender_id, identity)

        default:
            throw new Error("Oi the message type is not a proper message type.")
    }
}

export async function handle_group_invite_message( user_id, chat_message, message_contents, message_header, message_key) {

    let { groupChatId, groupChatName, groupImage } = message_contents.groupInvite

    let new_chat_object = await create_chat_object(groupChatId, groupChatName, "GROUP", [message_header.senderId, user_id], groupImage, message_header.senderId)
    // store 
    message_header.chatId = groupChatId

    return await store_message_object_chat( chat_message, message_contents, message_header, message_key, new_chat_object)
}

export async function convertGroupMessage(chat_object, contents) {
    let secret_group_key = chat_object.group_secret_key
    let bytes = convertBase64StringToArrayBuffer(contents.text)
    let iv = contents.groupMessageIv
    return await decrypt_message_contents(secret_group_key, bytes, iv)
}

export async function handle_user_removed_message( client, current_user_id, chat_message, message_contents, message_header, message_key, identity) {
    let chat_object = await get_chat( message_header.chatId)

    let removed_user_id = message_contents.userGroupChange && message_contents.userGroupChange.userId
    chat_object.users = chat_object.users.filter((user) => user !== removed_user_id)

    if (chat_object.initiator && message_header.senderId !== chat_object.initiator) {
        if (!removed_user_id || message_header.senderId !== removed_user_id) {
            console.error("Rejected user removal message. Not from intiator or removed user.")
            return { msg_obj: null, chat_object: null }
        }
    }

    // check if empty
    if (!message_contents.userGroupChange) {
        // remove yourself from the group 
        await delete_chat(message_header.chatId)
        return { msg_obj: convert_proto_chat_msg(chat_message, message_contents, message_header, message_key), chat_object: chat_object }
    }

    // only accept if initiator or user in question is the sender
    // update user list and new group key

    return await store_message_object_chat( chat_message, message_contents, message_header, message_key, chat_object)
}

export async function store_message_object_chat( chat_message, message_contents, message_header, message_key, chat_object) {
    let msg_obj = convert_proto_chat_msg(chat_message, message_contents, message_header, message_key)
    await store_message( msg_obj, chat_object)
    return { msg_obj, chat_object }
}

export async function handle_user_added_message( client, user_id, chat_message, message_contents, message_header, message_key, identity) {

    let chat_object = await get_chat( message_header.chatId)

    let user_group_change = message_contents.userGroupChange
    // look for double ratchet session with new user

    let new_user_id = user_group_change.userId

    if (chat_object.initiator && message_header.senderId !== chat_object.initiator) {
        console.error("Rejected user added message. Not from initiator.")
        return { msg_obj: null, chat_object: null }
    }
    chat_object.users = [...chat_object.users, new_user_id]
    // only accept if initiator added user
    // look for double ratchet session and initiate if doesnt exist
    // send membership message
    await send_group_membership_message(client,  chat_object.chat_id, { userId: new_user_id }, user_id, identity)

    return await store_message_object_chat( chat_message, message_contents, message_header, message_key, chat_object)
}

export async function handle_group_membership_message( message_contents, message_header) {
    let chat_object = await get_chat( message_header.chatId)
    // check if the key is correct
    let sender_id = message_header.senderId
    if (!chat_object) {
        // received a group memebership before the invite message
        chat_object = await create_chat_object(message_header.chatId, "", "GROUP", [sender_id],)
    } else {
        chat_object.users.push(sender_id)
    }

    await store_chat( chat_object)
    return { msg_obj: null, chat_object: chat_object }
}

export async function handle_group_message( chat_message, message_contents, message_header, message_key) {
    let chat_object = await get_chat( message_header.chatId)
    if (message_contents.fileInfo && message_contents.fileInfo.fileKey)
        message_key = message_contents.fileInfo.fileKey
    return store_message_object_chat( chat_message, message_contents, message_header, message_key, chat_object)
}

export async function handle_direct_message( chat_message, message_contents, message_header, message_key) {
    let sender_id = message_header.senderId
    let chat_object = await get_chat( sender_id) || await create_chat_object(sender_id, await getUsername( sender_id), "DIRECT")
    return await store_message_object_chat( chat_message, message_contents, message_header, message_key, chat_object)

}

export async function handle_new_decrypted_message( client, chat_message, identity, message_contents, message_header, message_key) {

    switch (MessageType[message_header.type]) {
        case DIRECT:
            return await handle_direct_message( chat_message, message_contents, message_header, message_key)
        case GROUP:
            return await handle_group_message( chat_message, message_contents, message_header, message_key)
        case USER_ADDED:
            return await handle_user_added_message( client, identity.user_id, chat_message, message_contents, message_header, message_key, identity)
        case USER_REMOVED:
            return await handle_user_removed_message( client, identity.user_id, chat_message, message_contents, message_header, message_key, identity)
        case GROUP_INVITE:
            return await handle_group_invite_message( identity.user_id, chat_message, message_contents, message_header, message_key)
        case GROUP_MEMBERSHIP:
            return await handle_group_membership_message( message_contents, message_header)
        default:
            throw new Error("Invalid message type in header.")
    }
}

export async function handle_new_encrypted_message( client, chat_message, identity) {
    try {
        let { message_contents, message_header, message_key } = await decrypt_chat_message( chat_message)
        // handle messages not found
        if (!(message_contents && message_header && message_key)) {
            console.log("skipped message")
            await store_skipped_message( chat_message)
            return { msg_obj: null, chat_object: null };
        }
        return await handle_new_decrypted_message( client, chat_message, identity, message_contents, message_header, message_key)
    } catch (e) {
        console.error("message gave error when handled")
        console.error(e)
        return { msg_obj: null, chat_object: null };
    }
}




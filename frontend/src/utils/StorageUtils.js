import { v4 } from "uuid"
import { generate25519KeyExchangePair, DH, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair, extractC25519ExchangePublicKey, concatenateUIntArray, generate25519SignaturePair, signPreKey, exportX25519PublicKey, signed_prekey_lifetime_ms, generateAESkey, exportAESKey, extractC25519SignaturePublicKey, extractC25519KeyExchangePrivateKey } from "./CryptoUtils"
import { Identity, MessageType } from "./protocol/messages"
import { Dexie } from "dexie"
import "dexie-export-import"
export const [X3DH, DIRECT, GROUP, USER_ADDED, USER_REMOVED, GROUP_INVITE, GROUP_MEMBERSHIP] = ["X3DH", "DIRECT", "GROUP", "USER_ADDED", "USER_REMOVED", "GROUP_INVITE", "GROUP_MEMBERSHIP"]

export const db_string = "messaging_clone"
export const identity_store_name = "identity"
export const double_ratchet_store_name = "dr_sessions"
export const chats_store_name = "chats"
export const otp_store_name = "one_time_prekeys"
export const dh_keystore_name = "dh_keys_prev"
export const skipped_messages_store_name = "skipped_messages"
export const file_store_name = "message_files"
export const user_info_store_name = "user_cache"
export const username_index_name = "username_index"
export const expiration_index_name = "expiration"
export const user_metadata_store_name = "user_metadata"
export const current_version = 2
export const max_otp = 100;

export const db = new Dexie(db_string)

db.version(current_version).stores({
    [identity_store_name]: "user_id",
    [double_ratchet_store_name]: "user_id",
    [chats_store_name]: "chat_id",
    [otp_store_name]: "publicKey",
    [dh_keystore_name]: "header_key, expiration",
    [file_store_name]: "",
    [user_metadata_store_name]: "",
    [user_info_store_name]: "user_id, username, expiration",
    [skipped_messages_store_name]: "message_id, expiration"
})

db.open()

async function deleteFromIndexExpired(store_name) {
    const oldest_timestamp = new Date().getTime()
    await db.table(store_name).where(expiration_index_name).below(oldest_timestamp).delete()
}

export async function clear_expired_user_info() {
    await deleteFromIndexExpired(user_info_store_name)
}

export async function clear_expired_skipped_messages() {
    await deleteFromIndexExpired(skipped_messages_store_name)
}
export async function clear_expired_receiving_chains() {
    await deleteFromIndexExpired(dh_keystore_name)
}



clear_expired_receiving_chains()
clear_expired_user_info()
clear_expired_skipped_messages()


export async function exportDBToJSON(progess_callback = (prog) => { }) {
    return await db.export({ progressCallback: progess_callback, prettyJson: true })
}

export async function importDBFromJSON(blob, progess_callback = (prog) => { }) {
    await db.import(blob, {overwriteValues:true, clearTablesBeforeImport:true,progressCallback: progess_callback })
}

export const convert_proto_chat_msg = (message_proto, message_contents, message_header, message_key) => {
    return {
        id: v4(),
        sender_id: message_header.senderId,
        chat_id: message_header.chatId || message_header.senderId,
        message_contents: message_contents,
        timestamp: message_proto.timestamp,
        message_key: message_key,
        type: MessageType[message_header.type]
    }
}
// so that react components can access the idb IndexedDB object to use utilit methods on to perform operations


export async function get_all_skipped_messages() {
    return await db.table(skipped_messages_store_name).toArray()
}

export async function delete_skipped_message(skipped_message) {
    await db.table(skipped_messages_store_name).delete(skipped_message.message_id)
}

export async function store_skipped_message(skipped_message) {
    await db.table(skipped_messages_store_name).put({ message_id: v4(), expiration: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, ...skipped_message })
}

export async function storeUserData(identity) {
    if (identity.oneTimePrekey) {
        await db.table(otp_store_name).bulkAdd(identity.oneTimePrekey)
        delete identity.oneTimePrekey
    }

    return await db.table(identity_store_name).add(identity)
}

export async function getOneTimePrekeyWithPubKey(public_key_bytes) {
    return await db.table(otp_store_name).get(public_key_bytes)
}

export async function getOneTimePreKeys() {
    return concatenateUIntArray(...(await db.table(otp_store_name).toArray()))
}

export async function refill_otp() {
    let numOTP = getLengthOtp()
    let new_public_keys = []
    for (let index = numOTP; index < max_otp; index++) {
        let keyPair = await generate25519KeyExchangePair()
        let keyPairObject = await exportX25519KeyPair(keyPair)
        new_public_keys.push(keyPairObject.publicKey)
    }
    await db.table(otp_store_name).bulkAdd(new_public_keys)
    return new_public_keys;
}

export async function delete_otp(otp_bytes) {
    await db.table(otp_store_name).delete(otp_bytes)
}

export async function delete_chat(chat_id) {
    await db.table(chats_store_name).delete(chat_id)
}

export async function get_all_chats() {
    return db.table(chats_store_name).toArray()
}

export async function getLengthOtp() {
    return db.table(otp_store_name).count()

}
export async function fetch_one_time_prekey(public_key_bytes) {
    return await db.table(otp_store_name).get(public_key_bytes)
}

export async function delete_one_time_prekey(public_key_bytes) {
    await db.table(otp_store_name).delete(public_key_bytes)
    return await getLengthOtp()

}

export async function store_message(message, chat_object) {
    let messages = chat_object.messages
    if (!messages)
        messages = chat_object.messages = []
    messages.push(message)
    await store_chat(chat_object)
}

export async function store_double_ratchet_session(dr_session) {
    return await db.table(double_ratchet_store_name).put(dr_session)
}

export async function get_double_ratchet_session(user_id) {
    return await db.table(double_ratchet_store_name).get(user_id)
}

export async function store_chat(chat_object) {
    await db.table(chats_store_name).put(chat_object)
}

export async function get_chat(chat_id) {
    return await db.table(chats_store_name).get(chat_id)
}

export async function get_messages(chat_id) {
    let chat = await get_chat(chat_id)
    return chat && chat.messages ? chat.messages : []
}

export async function get_file_local(file_id) {
    return await db.table(file_store_name).get(file_id)
}

export async function store_file_local(file_object, uuid) {
    await db.table(file_store_name).put(file_object, uuid)
}

export async function get_user_info_username(username) {
    return await db.table(user_info_store_name).where(username_index_name).equals(username).first()
}

export async function get_user_info(user_id) {
    let query_col = db.table(user_info_store_name).where("user_id").equals(user_id)
    let result = await query_col.first()
    // delete if old
    if (result && result.expiration && result.expiration < new Date().getTime()) {
        await query_col.delete()
    }
    return result
}

export async function store_user_info(user_object) {
    const expiration = new Date().getTime() + 4 * 60 * 60 * 1000
    await db.table(user_info_store_name).put({ ...user_object, expiration })
}

export async function import_identity(identityBytes) {
    let identity_protobuf = Identity.decode(identityBytes);
    return identity_protobuf
}

export async function getIdentityDataFromDB() {
    // get from identity store
    return (await db.table(identity_store_name).toCollection().first()) || "Not found"
}

export async function get_metadata(user_id) {
    // get from identity store
    return await db.table(user_metadata_store_name).get(user_id)
}

export async function set_metadata(metadata, user_id) {
    // get from identity store
    return await db.table(user_metadata_store_name).put(metadata, user_id)
}



export async function get_recieving_chains() {
    return await db.table(dh_keystore_name).toArray()
}

export async function store_recieving_chain(receiving_chain) {
    const expiration = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    await db.table(dh_keystore_name).put({ ...receiving_chain, expiration })
}

export async function get_all_double_ratchet_sess() {
    return await db.table(double_ratchet_store_name).toArray()
}

export async function create_chat_object(chat_id, name, type, users = [], group_image_file = undefined, initiator = "", group_secret_key = null) {
    let chat_object = {
        chat_id: chat_id, name: name, messages: [], type: type,
        timestamp: new Date().getTime(),
    }
    // add initiator

    if (type === "GROUP") {
        if (initiator)
            chat_object.initiator = initiator
        chat_object.users = users
        chat_object.group_image_file = group_image_file
    }
    return chat_object
}

export async function create_double_ratchet_sender(other_id, sender_dh_ratchet_key, other_identity_key, shared_key) {

    let dh_input = await DH(sender_dh_ratchet_key.privateKey, other_identity_key)

    return {
        timestamp: new Date().getTime(),
        user_id: other_id,
        root_key: shared_key,
        dh_keypair_private: sender_dh_ratchet_key,
        other_dh_public: other_identity_key,
        dh_input: dh_input,
        sending_chain: {
            message_keys: [],
        },
        receiving_chain: {
            message_keys: []
        },
    }
}


export async function get_previous_messages_keys(other_dh_public) {
    return await db.get(dh_keystore_name, other_dh_public)
}



export async function create_double_ratchet_recipient(identityKey, other_id, other_public_key_bytes, shared_key) {

    let dh_input = await DH(identityKey.privateKey, other_public_key_bytes)

    return {
        timestamp: new Date().getTime(),
        user_id: other_id,
        root_key: shared_key,
        dh_keypair_private: identityKey,
        other_dh_public: other_public_key_bytes,
        dh_input: dh_input,
        sending_chain: {
            message_keys: [],
        },
        receiving_chain: {
            message_keys: []
        },
    }
}

export async function updateSignedPrekey(user_id) {
    let new_signed_prekey = await generate25519SignaturePair()
    let new_signed_prekey_bytes = await exportX25519PublicKey(new_signed_prekey.publicKey)
    let identity_data = await getIdentityDataFromDB(user_id)
    let prekey_signature_bytes = signPreKey(new_signed_prekey_bytes, identity_data.identityKey)
    identity_data.signedPrekey = new_signed_prekey
    identity_data.expiration = new Date().getTime() + signed_prekey_lifetime_ms
    await storeUserData(identity_data)
    return [new_signed_prekey_bytes, prekey_signature_bytes]
}


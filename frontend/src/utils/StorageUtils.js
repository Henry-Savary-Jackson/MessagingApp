import { openDB } from "idb"
import { v4 } from "uuid"
import { useEffect, useState } from "react"
import { generate25519KeyExchangePair, DH, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair, extractC25519ExchangePublicKey, concatenateUIntArray, generate25519SignaturePair, signPreKey, exportX25519PublicKey, signed_prekey_lifetime_ms, generateAESkey, exportAESKey } from "./CryptoUtils"
import { Identity, MessageType } from "./protocol/messages"


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
export const expiration_index_name = "expiration_index"
export const user_metadata_store_name = "user_metadata"
export const current_version = 2
export const max_otp = 100;

export const [X3DH, DIRECT, GROUP, USER_ADDED, USER_REMOVED, GROUP_INVITE, GROUP_MEMBERSHIP] = ["X3DH", "DIRECT", "GROUP", "USER_ADDED", "USER_REMOVED", "GROUP_INVITE", "GROUP_MEMBERSHIP"]

export const convert_proto_chat_msg = (message_proto, message_contents, message_header, message_key) => {
    return {
        sender_id: message_header.senderId,
        chat_id: message_header.chatId || message_header.senderId,
        message_contents: message_contents,
        timestamp: message_proto.timestamp,
        message_key: message_key,
        type: MessageType[message_header.type]
    }
}
// so that react components can access the idb IndexedDB object to use utilit methods on to perform operations


export async function get_all_skipped_messages(indexed_db) {
    return await indexed_db.getAll(skipped_messages_store_name)
}

export async function delete_skipped_message(indexed_db, skipped_message) {
    await indexed_db.delete(skipped_messages_store_name, skipped_message.message_id)
}

export async function store_skipped_message(indexed_db, skipped_message) {
    await indexed_db.put(skipped_messages_store_name, { message_id: v4(), expiration: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, ...skipped_message })
}

export async function delete_old_skipped_messages(indexed_db) {

}


export async function storeUserData(indexed_db, identity) {
    if (identity.oneTimePrekey) {
        for (let otp of identity.oneTimePrekey) {
            let raw_pubkey = (await exportX25519KeyPair(otp)).publicKey
            await indexed_db.put(otp_store_name, otp, raw_pubkey)
        }
        identity.oneTimePrekey = undefined
    }

    return await indexed_db.put(identity_store_name, identity)
}

export async function getOneTimePrekeyWithPubKey(indexed_db, public_key_bytes) {
    return await indexed_db.get(otp_store_name, public_key_bytes)
}

export async function getOneTimePreKeys(indexed_db) {
    return concatenateUIntArray(...(await indexed_db.getAll(otp_store_name)))
}

export async function refill_otp(indexed_db) {
    let numOTP = getLengthOtp(indexed_db)
    let new_public_keys = []
    for (let index = numOTP; index < max_otp; index++) {
        let keyPair = await generate25519KeyExchangePair()
        let keyPairObject = await exportX25519KeyPair(keyPair)
        new_public_keys.push(keyPairObject.publicKey)
        await indexed_db.put(otp_store_name, keyPairObject, keyPairObject.publicKey)
    }
    return new_public_keys;
}

export async function delete_otp(indexed_db, otp_bytes) {
    await indexed_db.delete(otp_store_name, otp_bytes)
}

export async function delete_chat(indexed_db, chat_id) {
    await indexed_db.delete(chats_store_name, chat_id)
}

export async function get_all_chats(indexed_db) {
    return await indexed_db.getAll(chats_store_name)
}

export async function getLengthOtp(indexed_db) {
    return await indexed_db.count(otp_store_name)

}
export async function fetch_one_time_prekey(indexed_db, public_key_bytes) {
    return await indexed_db.get(otp_store_name, public_key_bytes)
}

export async function delete_one_time_prekey(indexed_db, public_key_bytes) {
    await indexed_db.delete(otp_store_name, public_key_bytes)
    return await getLengthOtp(indexed_db)

}

export async function store_message(indexed_db, message, chat_object) {
    let messages = chat_object.messages
    if (!messages)
        messages = chat_object.messages = []
    messages.push(message)
    await store_chat(indexed_db, chat_object)
}

export async function store_double_ratchet_session(indexed_db, dr_session) {
    await indexed_db.put(double_ratchet_store_name, dr_session)
}

export async function get_double_ratchet_session(indexed_db, user_id) {
    return await indexed_db.get(double_ratchet_store_name, user_id)
}

export async function store_chat(indexed_db, chat_object) {
    await indexed_db.put(chats_store_name, chat_object)
}

export async function get_chat(indexed_db, chat_id) {
    return await indexed_db.get(chats_store_name, chat_id)
}

export async function get_messages(indexed_db, chat_id) {
    let chat = await get_chat(indexed_db, chat_id)
    return chat && chat.messages ? chat.messages : []
}

export async function get_file_local(indexed_db, file_id) {
    return await indexed_db.get(file_store_name, file_id)
}

export async function store_file_local(indexed_db, file_object, uuid) {
    await indexed_db.put(file_store_name, file_object, uuid)
}

export async function get_user_info_username(indexed_db, username) {
    return await indexed_db.getFromIndex(user_info_store_name, username_index_name, username)
}

export async function get_user_info(indexed_db, user_id) {
    let result = await indexed_db.get(user_info_store_name, user_id)
    // delete if old
    if (result && result.expiration && result.expiration < new Date().getTime()){
        await indexed_db.delete(user_info_store_name, user_id)
    }
    return result
}

export async function store_user_info(indexed_db, user_object) {
    const expiration = new Date().getTime() + 4 * 60 * 60 * 1000
    await indexed_db.put(user_info_store_name, { ...user_object, expiration })
}

async function deleteFromIndexExpired(indexed_db, store_name) {
    const oldest_timestamp = new Date().getTime() 
    const lower_bound = IDBKeyRange.upperBound(oldest_timestamp, true)
    const index = indexed_db.transaction(store_name, "readwrite").objectStore(store_name).index(expiration_index_name)
    let expired_keys_cursor = await index.openCursor(lower_bound)
    while (expired_keys_cursor) {
        await expired_keys_cursor.delete()
        await expired_keys_cursor.continue()
    }
}

export async function clear_expired_user_info(indexed_db) {
    await deleteFromIndexExpired(indexed_db, user_info_store_name)
}

export async function clear_expired_skipped_messages(indexed_db) {
    await deleteFromIndexExpired(indexed_db, skipped_messages_store_name)
}
export async function clear_expired_receiving_chains(indexed_db) {
    await deleteFromIndexExpired(indexed_db, dh_keystore_name)
}

export async function import_identity(identityBytes) {

    let identity_protobuf = Identity.decode(identityBytes);
    return identity_protobuf

}

export async function convertProtoBufIdentityToObject(identity_protobuf) {
    // convert otps into Crypto Keypair
    let identity = identity_protobuf.identityKey
    let verifier = identity_protobuf.verifierKey
    let signed_prekey = identity_protobuf.signedPrekey
    let signedPreKeyExpiration = identity_protobuf.signedPrekeyExpiration
    let one_time_prekeys = identity_protobuf.oneTimePrekey

    let identityKey = await extractC25519KeyExchangePair(identity)
    let verifierKey = await extractC25519KeySignaturePair(verifier)
    let signedPrekey = await extractC25519KeyExchangePair(signed_prekey)
    let oneTimePrekey = []
    for (let otp of one_time_prekeys) {
        oneTimePrekey.push(await extractC25519KeyExchangePair(otp))
    }

    return { identityKey: identityKey, verifierKey: verifierKey, signedPrekey: signedPrekey, signedPreKeyExpiration: signedPreKeyExpiration, oneTimePrekey: oneTimePrekey }
}

export async function getIdentityDataFromDB(indexed_db) {
    // get from identity store
    let cursor = await indexed_db.transaction(identity_store_name).store.openCursor()
    return cursor ? cursor.value : "Not found"
}

export async function get_metadata(indexed_db, user_id) {
    // get from identity store
    return await indexed_db.get(user_metadata_store_name, user_id)
}

export async function set_metadata(indexed_db, metadata, user_id) {
    // get from identity store
    await indexed_db.put(user_metadata_store_name, metadata, user_id)
}



export async function get_recieving_chains(indexed_db) {
    return await indexed_db.getAll(dh_keystore_name)
}

export async function store_recieving_chain(indexed_db, receiving_chain) {
    const expiration = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    await indexed_db.put(dh_keystore_name, { ...receiving_chain, expiration })
}

export async function get_all_double_ratchet_sess(indexed_db) {
    return await indexed_db.getAll(double_ratchet_store_name)
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

    let other_identity_key_public = await extractC25519ExchangePublicKey(other_identity_key)
    let dh_input = await DH(sender_dh_ratchet_key.privateKey, other_identity_key_public)

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


export async function get_previous_messages_keys(indexed_db, other_dh_public) {
    return await indexed_db.get(dh_keystore_name, other_dh_public)
}



export async function create_double_ratchet_recipient(identityKey, other_id, other_public_key_bytes, shared_key) {

    let other_ratchet_key_public = await extractC25519ExchangePublicKey(other_public_key_bytes)
    let dh_input = await DH(identityKey.privateKey, other_ratchet_key_public)

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

export async function updateSignedPrekey(indexed_db, user_id) {
    let new_signed_prekey = await generate25519SignaturePair()
    let new_signed_prekey_bytes = await exportX25519PublicKey(new_signed_prekey.publicKey)
    let identity_data = await getIdentityDataFromDB(indexed_db, user_id)
    let prekey_signature_bytes = signPreKey(new_signed_prekey_bytes, identity_data.identityKey)
    identity_data.signedPrekey = new_signed_prekey
    identity_data.expiration = new Date().getTime() + signed_prekey_lifetime_ms
    await storeUserData(indexed_db, identity_data)
    return [new_signed_prekey_bytes, prekey_signature_bytes]
}


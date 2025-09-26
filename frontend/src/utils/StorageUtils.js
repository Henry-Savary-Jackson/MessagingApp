import { openDB } from "idb"
import { useEffect, useState } from "react"
import { generate25519KeyExchangePair, DH, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair, KDF_chain_key, KDF_root_key, extractC25519ExchangePublicKey, exportX25519PublicKey } from "./CryptoUtils"
import { Identity } from "./protocol/messages"
import { send } from "./WebsocketUtils"


const db_string = "messaging_clone"
const identity_store_name = "identity"
const chat_store_name = "chats"
const otp_store_name = "one_time_prekeys"
const dh_keystore_name = "dh_keys_prev"
const max_otp = 100;


// so that react components can access the idb IndexedDB object to use utilit methods on to perform operations
export function useIndexedDB() {

    let [db, setDB] = useState(null)
    let [loading, setLoading] = useState(true)

    useEffect(() => {
        let db_obj = null
        const open = async () => {

            db_obj = await openDB(db_string, 1, {
                upgrade(db_obj, oldVersion, newVersion, transaction) {
                    const identity_store = db_obj.createObjectStore(identity_store_name, { keyPath: "user_id" });
                    const chat_store = db_obj.createObjectStore(chat_store_name, { keyPath: "chat_id" });
                    const otp_store = db_obj.createObjectStore(otp_store_name);
                    const dh_key_store = db_obj.createObjectStore(dh_keystore_name, { keyPath: "dh_bytes_sender" })
                }
            })
            setLoading(false);
            setDB(db_obj)
        }
        open()
        return () => {
            db_obj.close()
        }
    }, [])

    return { db, loading }
}

// fetch identity information from the database when eeded
// useful for react components that need to initiate an X3DH protocol or the need to accept an X3DH start message
export function useIdentityInformation(indexed_db, user_id) {

    let [identity, set_identity_key_pair] = useState(null)
    let [verifierKey, set_verififer_key] = useState(null)
    let [signed_prekey, set_signed_prekey] = useState(null)
    // let [prekey_signature, set_prekey_signature] = useState(null)
    let [expiration, set_expiration] = useState(0)

    useEffect(() => {
        const get_from_db = async () => {
            if (!indexed_db)
                return
            let { identityKey, verifierKey, signedPrekey, signedPreKeyExpiration } = await getIdentityDataFromDB(indexed_db, user_id)
            set_identity_key_pair(identityKey)
            set_verififer_key(verifierKey)
            set_signed_prekey(signedPrekey)
            set_expiration(signedPreKeyExpiration)
        }
        get_from_db()
    }, [indexed_db])
    return { identity: identity, verifier_key: verifierKey, signed_prekey: signed_prekey, expiration: expiration }


}

export async function storeUserData(indexed_db, identity) {
    for (let otp of identity.oneTimePrekey) {
        let raw_pubkey = (await exportX25519KeyPair(otp)).publicKey
        await indexed_db.put(otp_store_name, otp, raw_pubkey)
    }
    identity.oneTimePrekey = undefined

    return await indexed_db.put(identity_store_name, identity)
}

export async function getOneTimePrekeyWithPubKey(indexed_db, public_key_bytes) {
    return await indexed_db.get(otp_store_name, public_key_bytes)
}


export async function get_user_data(indexed_db, user_id) {
    return await indexed_db.get(identity_store_name, user_id)
}

export async function refill_otp(indexed_db) {
    let numOTP = getLengthOtp(indexed_db)
    for (let index = numOTP; index < max_otp; index++) {
        let keyPair = await generate25519KeyExchangePair()
        let keyPairObject = await exportX25519KeyPair(keyPair)
        await indexed_db.put(otp_store_name, keyPairObject, keyPairObject.public_key)
    }
}

export async function getLengthOtp(indexed_db) {
    return await indexed_db.count(otp_store_name)

}
export async function fetch_one_time_prekey(indexed_db, public_key_bytes) {
    return await indexed_db.get(otp_store_name, public_key_bytes)
}

export async function delete_one_time_prekey(indexed_db, public_key_bytes) {
    return await indexed_db.delete(otp_store_name, public_key_bytes)
}

export async function store_message(indexed_db, message) {

}

export async function get_chat_info(indexed_db, chat_id) {

}

export async function get_messages(indexed_db, chat_id) {

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

export async function getIdentityDataFromDB(indexed_db, user_id) {
    // get from identity store
    return await get_user_data(indexed_db, user_id)
    // return await convertProtoBufIdentityToObject(user_data)
}

export async function store_previous_message_key(other_dh, message_key){

}

export async function ratchet_turn_send(chat_object, turn_root = true) {
    if (turn_root) {
        chat_object.dh_keypair_private = await generate25519KeyExchangePair()
        chat_object.dh_input = await DH(chat_object.dh_keypair_private, chat_object.other_dh_public)
        await turn_ratchet_root_send(chat_object)
    }

}

export async function turn_ratchet_root_send(chat_object) {

    let [root_key, new_sending_key, iv] = await KDF_root_key(chat_object.root_key, chat_object.dh_input)
    let [new_root_key, new_recieving_key, i] = await KDF_root_key(root_key, chat_object.dh_input)
    chat_object.root_key = new_root_key
    chat_object.sending_chain.chain_key = new_sending_key
    chat_object.recieving_chain.chain_key = new_recieving_key
    reset_send_recv_chains(chat_object)
}
export async function turn_ratchet_root_recieve(chat_object) {
    let [root_key, new_recieving_key, iv] = await KDF_root_key(chat_object.root_key, chat_object.dh_input)
    let [new_root_key, new_sending_key, i] = await KDF_root_key(root_key, chat_object.dh_input)
    chat_object.root_key = new_root_key
    chat_object.sending_chain.chain_key = new_sending_key
    chat_object.recieving_chain.chain_key = new_recieving_key
    // store previous dh key and message keys in db for later use for out of order messages
    reset_send_recv_chains(chat_object)
}

export function reset_send_recv_chains(chat_object,) {
    chat_object.recieving_chain.length = 0
    chat_object.sending_chain.length = 0

}

export function Uint8ArrayEquals(arr_1, arr_2) {
    if (arr_1.length != arr_2.length)
        return false
    return arr_1.every((val, index) => arr_2.at(index) === val)
}

export async function ratchet_turn_recieve(chat_object, other_dh) {
    let other_dh_public_bytes = await exportX25519PublicKey(chat_object.other_dh_public)

    if (!chat_object.other_dh_public || !Uint8ArrayEquals(other_dh, other_dh_public_bytes)) {
        chat_object.other_dh_public = await extractC25519ExchangePublicKey(other_dh)
        chat_object.dh_input = await DH(chat_object.dh_keypair_private, chat_object.other_dh_public)
        await turn_ratchet_root_recieve(chat_object)
    }
}

export async function create_chat_object_sender(chat_id, other_id, other_identity_key, shared_key) {

    let sender_ratchet_key = await generate25519KeyExchangePair()
    let other_identity_key_public = await extractC25519ExchangePublicKey(other_identity_key)
    let dh_input = await DH(sender_ratchet_key, other_identity_key_public)

    return {
        chat_id: chat_id,
        timestamp: new Date().getTime(),
        user_id: other_id,
        root_key: shared_key,
        dh_keypair_private: sender_ratchet_key,
        other_dh_public: other_identity_key,
        dh_input: dh_input,
        sending_chain: {
            chain_key: null,
            length: 0

        },
        recieving_chain: {
            chain_key: null,
            length: 0,
        },
    }
}


export async function create_chat_object_recipient(identityKey,chat_id, other_id, other_public_key_bytes, shared_key) {

    let other_ratchet_key_public = await extractC25519ExchangePublicKey(other_public_key_bytes)
    let dh_input = await DH(sender_ratchet_key, other_identity_key_public)


    return {
        chat_id: chat_id,
        timestamp: new Date().getTime(),
        user_id: other_id,
        root_key: shared_key,
        dh_keypair_private: identityKey,
        other_dh_public: other_ratchet_key_public,
        dh_input: dh_input,
        sending_chain: {
            chain_key: null,
            length: 0

        },
        recieving_chain: {
            chain_key: null,
            length: 0,
        },
    }
}


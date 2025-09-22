import { openDB } from "idb"
import { useEffect, useState } from "react"
import { generate25519KeyExchangePair, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair } from "./CryptoUtils"
import { Identity } from "./protocol/messages"


const db_string = "messaging_clone"
const identity_store_name = "identity"
const chat_store_name = "chats"
const otp_store_name = "one_time_prekeys"
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
                    const otp_store = db_obj.createObjectStore(otp_store_name, { keyPath: "public_key" });
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
    let [otps, set_otps] = useState([])
    // let [prekey_signature, set_prekey_signature] = useState(null)
    let [expiration, set_expiration] = useState(0)

    useEffect(() => {
        const get_from_db = async () => {
            if (!indexed_db)
                return
            let {identityKey, verifierKey , signedPrekey, signedPreKeyExpiration, oneTimePrekey } = await getIdentityDataFromDB(indexed_db, user_id)
            set_identity_key_pair(identityKey)
            set_verififer_key(verifierKey)
            set_signed_prekey(signedPrekey)
            set_expiration(signedPreKeyExpiration)
            set_otps(oneTimePrekey)
        }
        get_from_db()
    }, [indexed_db])
    return { identity:identity, verifier_key:verifierKey, signed_prekey:signed_prekey,  expiration:expiration, otps:otps }


}

export async function storeUserData(indexed_db, identity) {
    return await indexed_db.put(identity_store_name, identity)
}


export async function get_user_data(indexed_db, user_id) {
    return await indexed_db.get(identity_store_name, user_id)
}

export async function refill_otp(indexed_db) {
    let numOTP = getLengthOtp(indexed_db)
    for (let index = numOTP; index < max_otp; index++) {
        let keyPair = await generate25519KeyExchangePair()
        let keyPairObject = await exportX25519KeyPair(keyPair)
        indexed_db.put(otp_store_name, keyPairObject, keyPairObject.public_key)
    }
}

export async function getLengthOtp(indexed_db) {

}
export async function fetch_one_time_prekey(indexed_db, public_key_bytes) {
    return await indexed_db.get(otp_store_name, { public_key: public_key_bytes })
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
    for (let otp of one_time_prekeys){
        oneTimePrekey.push(await extractC25519KeyExchangePair(otp))
    }

    return { identityKey:identityKey, verifierKey:verifierKey ,signedPrekey:signedPrekey, signedPreKeyExpiration:signedPreKeyExpiration, oneTimePrekey:oneTimePrekey  }
}

export async function getIdentityDataFromDB(indexed_db, user_id) {
    // get from identity store
    return await get_user_data(indexed_db, user_id)
    // return await convertProtoBufIdentityToObject(user_data)
}


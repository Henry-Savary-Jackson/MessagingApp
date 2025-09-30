
import { decrypt_message_contents,generate25519KeyExchangePair, DH, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair, KDF_chain_key, KDF_root_key, extractC25519ExchangePublicKey, exportX25519PublicKey } from "./CryptoUtils"
import { Uint8ArrayEquals } from "./EncodingUtils"
import { get_chat_info,get_previous_messages_keys ,store_chat, store_previous_receiving_chain } from "./StorageUtils"


export async function ratchet_turn_until_match(message_keys, index){
    if (message_keys.length <= index){
        for (let i = message_keys.length; i < index+1 ; i++) {
            let new_message_key = await KDF_chain_key( message_keys[i-1])
            message_keys.push(new_message_key)
        }
    }
    return message_keys[index]

}

export async function get_previous_message_key(indexed_db, other_dh, index){
    let previous_receiving_chain = await get_previous_messages_keys(indexed_db, other_dh)
    let message_keys = previous_receiving_chain.receiving_chain.message_keys
    let length_orig = message_keys.length
    let key = await ratchet_turn_until_match(message_keys,index )
    let new_length = message_keys.length
    if (new_length != length_orig)
        await store_previous_receiving_chain(indexed_db, other_dh, previous_receiving_chain)
    return key
}



export async function ratchet_turn_send(chat_object, turn_root = true) {
    if (turn_root) {
        chat_object.dh_keypair_private = await generate25519KeyExchangePair()
        let public_cryptokey_other = await extractC25519ExchangePublicKey(chat_object.other_dh_public)
        chat_object.dh_input = await DH(chat_object.dh_keypair_private.privateKey, public_cryptokey_other)
        await turn_ratchet_root_sender(chat_object)
    }else{
        let message_keys = chat_object.sending_chain.message_keys
        if (message_keys.length == 0){
            throw new Error("Error, no message in sending chain")
        }
        let last_message_key =  message_keys[message_keys.length-1]
        let new_chain_key = await KDF_chain_key(last_message_key)
        message_keys.push(new_chain_key)
    }
    chat_object.sending_chain.n_sent += 1
}

export async function turn_ratchet_root_sender(chat_object) {

    let [root_key, new_sending_key] = await KDF_root_key(chat_object.root_key, chat_object.dh_input)
    let [new_root_key, new_recieving_key] = await KDF_root_key(root_key, chat_object.dh_input)
    chat_object.root_key = new_root_key
    chat_object.sending_chain.message_keys = [new_sending_key]
    chat_object.receiving_chain.message_keys = [new_recieving_key]
    chat_object.sending_chain.n_sent = 0
}
export async function turn_ratchet_root_recieve(chat_object) {
    let [root_key, new_recieving_key] = await KDF_root_key(chat_object.root_key, chat_object.dh_input)
    let [new_root_key, new_sending_key] = await KDF_root_key(root_key, chat_object.dh_input)
    chat_object.root_key = new_root_key
    chat_object.sending_chain.message_keys = [new_sending_key]
    chat_object.receiving_chain.message_keys = [new_recieving_key]
    chat_object.sending_chain.n_sent = 0
    // store previous dh key and message keys in db for later use for out of order messages
}


export async function root_ratchet_turn_recieve(chat_object, other_dh) {
    let other_dh_public_cryptokey = await extractC25519ExchangePublicKey(other_dh)
    chat_object.other_dh_public = other_dh
    chat_object.dh_input = await DH(chat_object.dh_keypair_private.privateKey, other_dh_public_cryptokey)
    await turn_ratchet_root_recieve(chat_object)
}



export async function get_message_key_for_message(indexed_db, chat_message, chat_object) {
    let chat_message_count = chat_message.messageHeader.chainLength
    let dh_public_bytes = chat_message.messageHeader.dhPublicKey
    let other_dh_public = chat_object.other_dh_public
    if (!Uint8ArrayEquals(dh_public_bytes, other_dh_public)) {
        let prev_dh_info = await get_previous_messages_keys(indexed_db, dh_public_bytes)
        if (prev_dh_info) {
            // found it in a previous recieving chain
            return await get_previous_message_key(indexed_db, other_dh_public, chat_message_count-1)
        } else {
            // ratchet_turn if it is the next recieving chain
            // store current into indexeddb 
            await store_previous_receiving_chain(indexed_db, other_dh_public,chat_object.receiving_chain) 
            await root_ratchet_turn_recieve(chat_object, dh_public_bytes)
        }
    } 
    let message_keys = chat_object.receiving_chain.message_keys
    let message_key = await ratchet_turn_until_match(message_keys, chat_message_count-1)
    await store_chat(indexed_db,chat_object)
    return message_key

}

export async function handle_message(indexed_db, identity, chat_message) {
    let chat_id = chat_message.chatId;
    let chat_object = await get_chat_info(indexed_db, chat_id)
    let message_key = await get_message_key_for_message(indexed_db, chat_message, chat_object)

    let messageContents = await decrypt_message_contents(message_key, chat_message.messageContentsEncrypted, chat_message.messageHeader.messageIv)

    // store into db again
    return [messageContents, message_key]
}

import { decrypt_message_contents, decrypt_message_header,generate25519KeyExchangePair, DH, extractC25519KeyExchangePair, exportX25519KeyPair, extractC25519KeySignaturePair, KDF_chain_key, KDF_root_key, extractC25519ExchangePublicKey, exportX25519PublicKey } from "./CryptoUtils"
import { Uint8ArrayEquals } from "./EncodingUtils"
import { get_all_double_ratchet_sess, get_double_ratchet_session,get_previous_messages_keys ,get_recieving_chains,store_chat, store_recieving_chain } from "./StorageUtils"


export async function ratchet_turn_until_match(chain, index){
    if (chain.message_keys.length <= index){
        for (let i = chain.message_keys.length; i < index+1 ; i++) {
            chain.message_keys.push(chain.chain_key)
            chain.chain_key = await KDF_chain_key( chain.chain_key)
        }
    }
    return chain.message_keys[index]
}

export async function get_previous_message_key(indexed_db, other_dh, index){
    let previous_receiving_chain = await get_previous_messages_keys(indexed_db, other_dh)
    let message_keys = previous_receiving_chain.receiving_chain.message_keys
    let length_orig = message_keys.length
    let key = await ratchet_turn_until_match(previous_receiving_chain,index )
    let new_length = message_keys.length
    if (new_length != length_orig)
        await store_recieving_chain(indexed_db, other_dh, previous_receiving_chain)
    return key
}



export async function ratchet_turn_send(dr_session, turn_root = true) {
    if (turn_root) {
        console.log("Turning root sender! ")
        // perform a diffie helmann key exchans with the otherś dh key
        dr_session.dh_keypair_private = await generate25519KeyExchangePair()

        let public_cryptokey_other = await extractC25519ExchangePublicKey(dr_session.other_dh_public)

        
        dr_session.dh_input = await DH(dr_session.dh_keypair_private.privateKey, public_cryptokey_other)

        // use this diffie helman output in the ratchet turn step
        await turn_ratchet_root_sender(dr_session)
    }
    let message_keys = dr_session.sending_chain.message_keys
    let chain_key =  dr_session.sending_chain.chain_key 
    // do only a kdf ratchet turn on the current sending chain
    let new_chain_key = await KDF_chain_key(chain_key)
    dr_session.sending_chain.chain_key = new_chain_key 
    message_keys.push(chain_key)
}

export async function init_ratchet_root_receiver(dr_session){
    let [root_key, new_recieving_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_sending_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, header_key_recv] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_3,next_header_key_recv] = await KDF_root_key(root_key_2, dr_session.dh_input)
    let [root_key_4,header_key_send ] = await KDF_root_key(root_key_3, dr_session.dh_input)
    let [root_key_final, next_header_key_send ] = await KDF_root_key(root_key_4, dr_session.dh_input)
    dr_session.root_key =root_key_final 

    dr_session.receiving_chain.header_key = header_key_recv 
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.header_key =header_key_send 
    dr_session.sending_chain.next_header_key= next_header_key_send 

    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.sending_chain.chain_key = new_sending_key 

}

export async function init_ratchet_root_sender(dr_session){
    let [root_key, new_sending_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_recieving_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, header_key_send] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_3, next_header_key_send] = await KDF_root_key(root_key_2, dr_session.dh_input)
    let [root_key_4, header_key_recv] = await KDF_root_key(root_key_3, dr_session.dh_input)
    let [root_key_final, next_header_key_recv] = await KDF_root_key(root_key_4, dr_session.dh_input)
    dr_session.root_key =root_key_final 

    dr_session.receiving_chain.header_key = header_key_recv 
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.header_key =header_key_send 
    dr_session.sending_chain.next_header_key= next_header_key_send 

    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.sending_chain.chain_key = new_sending_key 

}

export async function turn_ratchet_root_sender(dr_session) {

    dr_session.sending_chain.pn = dr_session.sending_chain.message_keys.length

    let [root_key, new_sending_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_recieving_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, next_header_key_send] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_final, next_header_key_recv] = await KDF_root_key(root_key_2, dr_session.dh_input)
    dr_session.root_key =root_key_final 

    dr_session.sending_chain.header_key =  dr_session.sending_chain.next_header_key
    dr_session.sending_chain.next_header_key =  next_header_key_send
    dr_session.receiving_chain.header_key = dr_session.receiving_chain.next_header_key
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    
    dr_session.sending_chain.chain_key = new_sending_key
    dr_session.sending_chain.messages_keys = []
    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.receiving_chain.messages_keys = []
}

export async function root_ratchet_turn_recieve(dr_session, other_dh) {
    let other_dh_public_cryptokey = await extractC25519ExchangePublicKey(other_dh)
    dr_session.other_dh_public = other_dh
    dr_session.dh_input = await DH(dr_session.dh_keypair_private.privateKey, other_dh_public_cryptokey)

    // save previous length of recieving_chain
    dr_session.sending_chain.pn = dr_session.sending_chain.message_keys.length;
    let [root_key, new_recieving_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_sending_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2,  next_header_key_recv] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_final,next_header_key_send] = await KDF_root_key(root_key_2, dr_session.dh_input)
    dr_session.root_key =root_key_final 

    dr_session.sending_chain.header_key =  dr_session.sending_chain.next_header_key
    dr_session.sending_chain.next_header_key =  next_header_key_send
    dr_session.receiving_chain.header_key = dr_session.receiving_chain.next_header_key
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.chain_key = new_sending_key
    dr_session.sending_chain.messages_keys = []
    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.receiving_chain.messages_keys = []


}

export async function look_for_header_key_skipped(indexed_db, chat_message){

    let receiving_chains = await get_recieving_chains(indexed_db)
    let chat_header_bytes = chat_message.messageHeader
    let chat_header_iv = chat_message.headerIv
    for (let receiving_chain of receiving_chains){
        try {
            return  [await  decrypt_message_header(receiving_chain.header_key_bytes, chat_header_bytes, chat_header_iv), receiving_chain]
        }catch(e){}
    }
    return  [ null, null ]

}

export async function look_for_header_key_chats(indexed_db, chat_message){
    // look in the currentl chats first
    let chats = await get_all_double_ratchet_sess(indexed_db)
    let chat_header_bytes = chat_message.messageHeaderEncrypted
    let chat_header_iv = chat_message.headerIv
    for (let chat of chats){
        try {
            return [ await decrypt_message_header(chat.receiving_chain.header_key, chat_header_bytes, chat_header_iv), chat.receiving_chain.header_key, chat]
        }catch(e){}
        try {
            return  [await decrypt_message_header(chat.receiving_chain.next_header_key, chat_header_bytes, chat_header_iv), chat.receiving_chain.next_header_key, chat]
        }catch(e){}
    }
    return  [null, null, null]


}


export async function get_message_key_for_message(indexed_db, chat_message) {


    let [messageHeader ,header_key, dr_session ] = await look_for_header_key_chats(indexed_db, chat_message)

    if (messageHeader != null){

        let dh_public_bytes = messageHeader.dhPublicKey
        // in an existing chatś recievng chain
        if (Uint8ArrayEquals(header_key,dr_session.receiving_chain.next_header_key) ){
            // ratchet turn
            // store previous n now that you have ratchet turned
            console.log("Ratchet turn receive!")
            dr_session.receiving_chain.max_n = messageHeader.previousLength

            await store_recieving_chain(indexed_db, dr_session.receiving_chain.header_key ,dr_session.receiving_chain) 

            await root_ratchet_turn_recieve(dr_session, dh_public_bytes)

            let message_key = await ratchet_turn_until_match(dr_session.receiving_chain, messageHeader.chainLength-1)

            // get the total messages sent in the previous chain 
            await store_chat(indexed_db,dr_session)
            return {message_key,  messageHeader}
            
        } else{

            console.log("No ratchet turn receive!")
            let message_key = await ratchet_turn_until_match(dr_session.receiving_chain, messageHeader.chainLength-1) 
            await store_chat(indexed_db, dr_session)

            return {message_key, messageHeader}
            // use the current recieving chain
        }
    }else{
        //  the message is in a previous recieving chain
        let [messageHeader, receiving_chain ] = await look_for_header_key_skipped(indexed_db, chat_message)
        let message_key = await ratchet_turn_until_match(receiving_chain, messageHeader.chainLength)
        await store_recieving_chain(indexed_db, receiving_chain.header_key_bytes,receiving_chain)
        return {message_key, messageHeader}
    }
}


export async function handle_message(indexed_db,chat_message) {
    let {message_key,  messageHeader } = await get_message_key_for_message(indexed_db, chat_message)
     
    let message_contents = await decrypt_message_contents(message_key, chat_message.messageContentsEncrypted, messageHeader.messageIv)

    // store into db again
    return {message_contents, messageHeader,message_key}
}
import { decrypt_message_contents, decrypt_message_header, generate25519KeyExchangePair, DH, KDF_chain_key, KDF_root_key, extractC25519ExchangePublicKey } from "./CryptoUtils"
import { Uint8ArrayEquals } from "./EncodingUtils"
import { handle_new_decrypted_message } from "./MessagingUtils"
import { get_all_double_ratchet_sess, get_previous_messages_keys, get_recieving_chains, store_double_ratchet_session, store_recieving_chain, get_all_skipped_messages, convert_proto_chat_msg, delete_skipped_message } from "./StorageUtils"


export async function ratchet_turn_until_match(chain, index) {
    if (index <= -1) {
        return chain.chain_key
    }
    if (chain.message_keys.length <= index) {
        for (let i = chain.message_keys.length; i < index + 1; i++) {
            chain.message_keys.push(chain.chain_key)
            chain.chain_key = await KDF_chain_key(chain.chain_key)
        }
    }
    return chain.message_keys[index]
}

export async function ratchet_turn_send(indexed_db, dr_session, turn_root = true) {
    if (turn_root) {
        console.log("Turning root sender! ")
        // perform a diffie helmann key exchans with the otherś dh key
        dr_session.dh_keypair_private = await generate25519KeyExchangePair()

        let public_cryptokey_other = await extractC25519ExchangePublicKey(dr_session.other_dh_public)

        dr_session.dh_input = await DH(dr_session.dh_keypair_private.privateKey, public_cryptokey_other)

        // use this diffie helman output in the ratchet turn step
        await store_recieving_chain(indexed_db, dr_session.receiving_chain)
        await turn_ratchet_root_sender(dr_session)
    }
    let message_keys = dr_session.sending_chain.message_keys
    let chain_key = dr_session.sending_chain.chain_key
    // do only a kdf ratchet turn on the current sending chain
    let new_chain_key = await KDF_chain_key(chain_key)
    dr_session.sending_chain.chain_key = new_chain_key
    message_keys.push(chain_key)
}

export async function init_ratchet_root_receiver(dr_session) {
    let [root_key, new_recieving_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_sending_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, header_key_recv] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_3, next_header_key_recv] = await KDF_root_key(root_key_2, dr_session.dh_input)
    let [root_key_4, header_key_send] = await KDF_root_key(root_key_3, dr_session.dh_input)
    let [root_key_final, next_header_key_send] = await KDF_root_key(root_key_4, dr_session.dh_input)
    dr_session.root_key = root_key_final

    dr_session.receiving_chain.header_key = header_key_recv
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.header_key = header_key_send
    dr_session.sending_chain.next_header_key = next_header_key_send

    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.sending_chain.chain_key = new_sending_key

}

export async function init_ratchet_root_sender(dr_session) {
    let [root_key, new_sending_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_recieving_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, header_key_send] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_3, next_header_key_send] = await KDF_root_key(root_key_2, dr_session.dh_input)
    let [root_key_4, header_key_recv] = await KDF_root_key(root_key_3, dr_session.dh_input)
    let [root_key_final, next_header_key_recv] = await KDF_root_key(root_key_4, dr_session.dh_input)
    dr_session.root_key = root_key_final

    dr_session.receiving_chain.header_key = header_key_recv
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.header_key = header_key_send
    dr_session.sending_chain.next_header_key = next_header_key_send

    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.sending_chain.chain_key = new_sending_key

}

export async function turn_ratchet_root_sender(dr_session) {

    dr_session.sending_chain.pn = dr_session.sending_chain.message_keys.length

    let [root_key, new_sending_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_recieving_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, next_header_key_send] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_final, next_header_key_recv] = await KDF_root_key(root_key_2, dr_session.dh_input)
    dr_session.root_key = root_key_final

    dr_session.sending_chain.header_key = dr_session.sending_chain.next_header_key
    dr_session.sending_chain.next_header_key = next_header_key_send
    dr_session.receiving_chain.header_key = dr_session.receiving_chain.next_header_key
    dr_session.receiving_chain.next_header_key = next_header_key_recv


    dr_session.sending_chain.chain_key = new_sending_key
    dr_session.sending_chain.message_keys = []
    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.receiving_chain.message_keys = []
}

export async function root_ratchet_turn_recieve(dr_session, other_dh) {
    let other_dh_public_cryptokey = await extractC25519ExchangePublicKey(other_dh)
    dr_session.other_dh_public = other_dh
    dr_session.dh_input = await DH(dr_session.dh_keypair_private.privateKey, other_dh_public_cryptokey)

    // save previous length of recieving_chain
    dr_session.sending_chain.pn = dr_session.sending_chain.message_keys.length;
    let [root_key, new_recieving_key] = await KDF_root_key(dr_session.root_key, dr_session.dh_input)
    let [root_key_1, new_sending_key] = await KDF_root_key(root_key, dr_session.dh_input)
    let [root_key_2, next_header_key_recv] = await KDF_root_key(root_key_1, dr_session.dh_input)
    let [root_key_final, next_header_key_send] = await KDF_root_key(root_key_2, dr_session.dh_input)
    dr_session.root_key = root_key_final

    dr_session.sending_chain.header_key = dr_session.sending_chain.next_header_key
    dr_session.sending_chain.next_header_key = next_header_key_send
    dr_session.receiving_chain.header_key = dr_session.receiving_chain.next_header_key
    dr_session.receiving_chain.next_header_key = next_header_key_recv

    dr_session.sending_chain.chain_key = new_sending_key
    dr_session.sending_chain.message_keys = []
    dr_session.receiving_chain.chain_key = new_recieving_key
    dr_session.receiving_chain.message_keys = []


}

export async function look_for_header_key_skipped(indexed_db, chat_message) {

    let receiving_chains = await get_recieving_chains(indexed_db)
    let chat_header_bytes = chat_message.messageHeaderEncrypted
    let chat_header_iv = chat_message.headerIv
    for (let receiving_chain of receiving_chains) {
        try {
            console.log(receiving_chain, chat_header_bytes)
            return [await decrypt_message_header(receiving_chain.header_key, chat_header_bytes, chat_header_iv), receiving_chain]

        } catch (e) { }
    }
    return [null, null]

}

// looks for all  skipped messages and sees if they can be attributes to this new double ratchet session
export async function test_all_skipped_messages_session(indexed_db, new_session) {
    let skipped_messages = await get_all_skipped_messages(indexed_db)
    let found_messages = []
    for (let skipped_message of skipped_messages) {
        try {
            found_messages.push([...await test_header_key_for_session(new_session, skipped_message.messageHeaderEncrypted, skipped_message.headerIv), skipped_message])
        } catch (e) {
        }
    }
    return found_messages
}

export async function handle_all_skipped_messages_for_session(indexed_db, client, identity, new_session) {

    let found_skipped_messages = await test_all_skipped_messages_session(indexed_db, new_session)
    let decrypted_found_messages = []
    for (let [message_header, header_key, _, skipped_message] of found_skipped_messages) {

        let message_key = await get_message_key_in_session(indexed_db, new_session, message_header, header_key)

        let message_contents = await decrypt_message_contents(message_key, skipped_message.messageContentsEncrypted, message_header.messageIv)

        decrypted_found_messages.push(await handle_new_decrypted_message(indexed_db, client, skipped_message, identity, message_contents, message_header, message_key))

        await delete_skipped_message(indexed_db, skipped_message)
    }
    return decrypted_found_messages
}


export async function test_header_key_for_session(dr_session, header_bytes, header_iv) {
    try {
        return [await decrypt_message_header(dr_session.receiving_chain.header_key, header_bytes, header_iv), dr_session.receiving_chain.header_key, dr_session]
    } catch (e) { }
    try {
        return [await decrypt_message_header(dr_session.receiving_chain.next_header_key, header_bytes, header_iv), dr_session.receiving_chain.next_header_key, dr_session]
    } catch (e) { throw e }

}

export async function look_for_header_key_sessions(indexed_db, chat_message) {
    // look in the currentl chats first
    let sessions_search = await get_all_double_ratchet_sess(indexed_db)
    let header_bytes = chat_message.messageHeaderEncrypted
    let header_iv = chat_message.headerIv
    for (let dr_session of sessions_search) {
        try {
            return await test_header_key_for_session(dr_session, header_bytes, header_iv)
        } catch (e) { }
    }
    return [null, null, null]
}

export async function get_message_key_in_session(indexed_db, dr_session, message_header, header_key) {
    let dh_public_bytes = message_header.dhPublicKey
    // in an existing chatś recievng chain
    if (Uint8ArrayEquals(header_key, dr_session.receiving_chain.next_header_key)) {
        // ratchet turn
        // store previous n now that you have ratchet turned
        console.log("Ratchet turn receive!")
        dr_session.receiving_chain.max_n = message_header.previousLength

        await store_recieving_chain(indexed_db, dr_session.receiving_chain)

        await root_ratchet_turn_recieve(dr_session, dh_public_bytes)

        let message_key = await ratchet_turn_until_match(dr_session.receiving_chain, message_header.chainLength - 1)

        // get the total messages sent in the previous chain 
        await store_double_ratchet_session(indexed_db, dr_session)
        return message_key

    } else {

        console.log("No ratchet turn receive!")
        let message_key = await ratchet_turn_until_match(dr_session.receiving_chain, message_header.chainLength - 1)
        await store_double_ratchet_session(indexed_db, dr_session)
        return message_key
        // use the current recieving chain
    }
}

export async function get_message_key_in_recieving_chain(indexed_db, receiving_chain, message_header,) {
    let message_key = await ratchet_turn_until_match(receiving_chain, message_header.chainLength-1)
    await store_recieving_chain(indexed_db, receiving_chain)
    return message_key
}

export async function get_message_key_for_message(indexed_db, chat_message) {

    // if a dr_session is already found, only decrypt for that session 
    let [message_header, header_key, dr_session] = await look_for_header_key_sessions(indexed_db, chat_message)

    if (message_header != null) {
        let message_key = await get_message_key_in_session(indexed_db, dr_session, message_header, header_key)
        return { message_header, message_key }
    } else {
        //  the message is in a previous recieving chain
        let [message_header, receiving_chain] = await look_for_header_key_skipped(indexed_db, chat_message)
        if (!message_header || !receiving_chain) {
            return { message_header: null, message_key: null }
        }
        console.log("Found header key!!!!")
        let message_key = await get_message_key_in_recieving_chain(indexed_db, receiving_chain, message_header)
        return { message_header, message_key }
    }
}

export async function decrypt_chat_message(indexed_db, chat_message) {
    let { message_key, message_header } = await get_message_key_for_message(indexed_db, chat_message)

    if (!message_key || !message_header) {
        return { message_header: null, message_contents: null, message_key: null }
    }

    // check if it is a group message, group invite, or direct message
    let message_contents = await decrypt_message_contents(message_key, chat_message.messageContentsEncrypted, message_header.messageIv)


    // store into db again
    console.log(message_contents)

    return { message_contents, message_header, message_key }


}
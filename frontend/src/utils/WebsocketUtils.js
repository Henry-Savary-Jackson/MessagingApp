import { Client } from '@stomp/stompjs'
import { ChatMessage, MessageContents } from "./protocol/messages"
import { Uint8ArrayEquals } from './EncodingUtils'
import { decrypt_message_contents, encrypt_message_contents, exportX25519PublicKey, KDF_chain_key, X3DH_accept } from './CryptoUtils'
import { getPrekeyBundle, getUsername } from './RequestUtils'
import { get_chat_info, get_previous_message_key, get_previous_messages_keys, root_ratchet_turn_recieve, ratchet_turn_send, store_chat, store_previous_receiving_chain , ratchet_turn_until_match  } from './StorageUtils'

export var broker_url = "ws://localhost:8080/ws"
var client = new Client({ brokerURL: broker_url })
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

export async function send_new_encrypted_message(client,indexed_db, chat_id,contents){

    let chat_object = await get_chat_info(indexed_db, chat_id)

    // ratchet turn
    // ratchet turn root
    await ratchet_turn_send(chat_object, chat_object.sending_chain.message_keys.length <= 0)
    await store_chat(indexed_db,chat_object)
    let message_keys =chat_object.sending_chain.message_keys 
    let message_key = message_keys[message_keys.length-1]

    let message_contents_js_obj = {text:contents.text}
    let message_contents_protobuf_obj = MessageContents.fromObject(message_contents_js_obj)
    let [message_contents_encrypted,iv] = await encrypt_message_contents(message_key, message_contents_protobuf_obj)

    let message_header_js_obj = {
        type: "CHAT",
        chainLength:message_keys.length,
        messageIv:iv,
        dhPublicKey: await exportX25519PublicKey(chat_object.dh_keypair_private.publicKey)
    }

    let chat_message_js_obj = {
        chatId:chat_id,
        messageHeader:message_header_js_obj,
        messageContentsEncrypted:message_contents_encrypted,
        timestamp:new Date().getTime()

    }

    let chat_message_proto_obj = ChatMessage.fromObject(chat_message_js_obj)
    send(client, chat_object.user_id, chat_message_proto_obj)

    await store_chat(indexed_db,chat_object)
    // upload file 
    // encrypt file with key
    // uplaod to blob store
    // send id and any text in message contetns object
    // encyrpted message contents object
    
    // send it via websockets
}

export async function handle_message(indexed_db, identity, chat_message) {
    let chat_id = chat_message.chatId;
    let chat_object = await get_chat_info(indexed_db, chat_id)
    let message_key = await get_message_key_for_message(indexed_db, chat_message, chat_object)

    let messageContents = await decrypt_message_contents(message_key, chat_message.messageContentsEncrypted, chat_message.messageHeader.messageIv)

    return messageContents
    // store into db again

}

export async function handle_X3DH_message(identity, signed_prekey, chat_message, one_time_prekey) {

    let headers = chat_message.messageHeader
    let sender_id = headers.senderId
    if (!sender_id) {
        console.error("no sender id")
        return
    }
    let ad_iv = headers.messageIv
    let ephemeral_public_key = headers.ephemeralKey
    // let one_time_prekey = headers.oneTimePrekey || null
    let ad_encrypted = chat_message.messageContentsEncrypted

    let prekey_bundle = await getPrekeyBundle(await getUsername(sender_id))

    return await X3DH_accept({ identityKey: identity, signedPrekey: signed_prekey }, prekey_bundle, ephemeral_public_key, ad_encrypted, ad_iv, one_time_prekey)
}
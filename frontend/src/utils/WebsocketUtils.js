import { Client, StompHeaders } from '@stomp/stompjs'
import axios from "axios"
import { ChatMessage, MessageContents, MessageHeader } from "./protocol/messages"
import { convertArrayBufferToBase64 } from './EncodingUtils'
import { KDF_chain_key, X3DH_accept } from './CryptoUtils'
import { getPrekeyBundle, getUsername } from './RequestUtils'
import { useEffect, useState } from 'react'
import { get_chat_info, Uint8ArrayEquals } from './StorageUtils'

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

export async function ratchet_turn_until_match(messages, key_n){

}

export async function handle_message(identity, chat_message, indexed_db) {
    let chat_id = chat_message.chatId;
    let chat_object = await get_chat_info(indexed_db, chat_id)
    let chat_message_count = chat_message.messageHeader.messageCount
    let dh_public_bytes = chat_message.messageHeader.dhPublicKey
    let current_chat_other_dh_public = await exportX25519PublicKey(chat_object.other_dh_public)
    if (!Uint8ArrayEquals(dh_public_bytes, current_chat_other_dh_public)) {
        let prev_dh_info = await get
        if (prev_dh_info) {
            let message_keys = current_chat_dh_info.message_keys
            // if zero
            for (let index = message_keys.length - 1; index < chat_message_count; index++) {
                message_keys.push(await KDF_chain_key(message_keys[index]))
            }
            let mk = message_keys[message_keys.length - 1]
            // store into db again

        } else {

        }
    } else {
        // load or create current dh key object
        let current_chat_dh_info = await get
        let message_keys = current_chat_dh_info.message_keys
        // if zero
        // check if already generated, then use that
        for (let index = message_keys.length - 1; index < chat_message_count; index++) {
            message_keys.push(await KDF_chain_key(message_keys[index]))
        }
        let mk = message_keys[message_keys.length - 1]
        // store into db again
    }

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
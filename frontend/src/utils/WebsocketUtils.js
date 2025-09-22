import { Client, StompHeaders } from '@stomp/stompjs'
import axios from "axios"
import {ChatMessage, MessageContents ,MessageHeader} from "./protocol/messages"
import {convertArrayBufferToBase64} from './EncodingUtils'
import { X3DH_accept } from './CryptoUtils'
import { getPrekeyBundle, getUsername } from './RequestUtils'

export var broker_url = "ws://localhost:8080/ws"
var client = new Client({ brokerURL: broker_url })
const protobuf_mimetype="application/x-protobuf"

export function activate(onConnect) {
    client.configure({ connectHeaders: { "X-CSRF-TOKEN": axios.defaults.headers.common["X-CSRF-TOKEN"] } })
    client.onConnect = onConnect
    client.activate()
}

export function send(chatMessage) {
    client.publish({
        destination: "/chat", binaryBody: ChatMessage.encode(chatMessage).finish() , headers:{"content-type":protobuf_mimetype} })
}

export function parseMessage(message_bytes){
    let chatMessage = ChatMessage.decode(message_bytes);
    // TODO handle verification errors
    return chatMessage;
}

export function listenForMessages( onMessage){
    client.subscribe(`/user/messages`, onMessage)
}

export function unSubscribe() {
    client.unsubscribe(`/user/messages`)
}

export async function disconnect() {
    await client.deactivate()
}


export async function handle_X3DH_message(identity, chat_message){
    
    let headers = chat_message.message_header
    let sender_id = headers.sender_id
    let ad_iv = headers.message_iv 
    let ephemeral_public_key = headers.ephemeral_key
    let one_time_prekey = headers.one_time_prekey || null
    let ad_encrypted = chat_message.message_contents_encrypted

    let prekey_bundle =  await getPrekeyBundle(await getUsername(sender_id))
    
    return await X3DH_accept(identity,prekey_bundle, ephemeral_public_key, ad_encrypted, ad_iv, one_time_prekey)
}
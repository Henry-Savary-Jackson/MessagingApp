import { Client } from '@stomp/stompjs'
import axios from "axios"
export var broker_url = "ws://localhost:8080/ws"

import {ChatMessage, MessageContents ,MessageHeader} from "./protocol/messages"
import {convertArrayBufferToBase64} from './EncodingUtils'
var client = new Client({ brokerURL: broker_url })

export function activate(onConnect) {
    client.configure({ connectHeaders: { "X-CSRF-TOKEN": axios.defaults.headers.common["X-CSRF-TOKEN"] } })
    client.onConnect = onConnect
    client.activate()
}

export function send(chatMessage) {
    client.publish({
        destination: "/chat", body: convertArrayBufferToBase64(chatMessage.encode().finish())   })
}

export function parseMessage(message_bytes){
    let chatMessage = ChatMessage.decode(message_bytes);
    // TODO handle verification errors
    return chatMessage;
}

export function subscribeToChat(topic, offset) {
    client.subscribe(`/sub/${topic}`, (m)=>{},{ "offset": offset })
}

export function listenForMessages( onMessage){
    client.subscribe(`/user/messages`, onMessage)
}

export function unSubscribe(topic) {
    client.unsubscribe(`/sub/${topic}`)
}

export async function disconnect() {
    await client.deactivate()
}

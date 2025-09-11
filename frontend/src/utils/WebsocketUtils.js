import { Client } from '@stomp/stompjs'
import axios from "axios"
export var broker_url = "ws://localhost:8080/ws"

var client = new Client({ brokerURL: broker_url })

export function activate(onConnect) {
    client.configure({ connectHeaders: { "X-CSRF-TOKEN": axios.defaults.headers.common["X-CSRF-TOKEN"] } })
    client.onConnect = onConnect
    client.activate()
}

export function send(chatMessage) {
    client.publish({
        destination: "/chat", body: JSON.stringify(chatMessage)    })
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

export class MessageContents {
    constructor(text, file_uuid = null) {
        this.fileId = file_uuid;
        this.text = text
        this.type = "MESSAGE"
    }
}

export class ChatWSMessage {
    constructor(chatId, contents, sender = "") {
        this.messageId = crypto.randomUUID()
        this.chatId = chatId
        this.sender = sender
        this.timestamp = Math.floor(new Date().valueOf() / 1000)
        this.contents = contents
    }
}

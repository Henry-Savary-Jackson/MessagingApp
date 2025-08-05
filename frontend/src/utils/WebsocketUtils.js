import { Client, Stomp, StompConfig } from '@stomp/stompjs'
import axios from "axios"
let broker_url = "ws://localhost:8080/ws"

var client = new Client({ brokerURL: broker_url })

export async function activate() {
    client.connectHeaders._csrf = axios.defaults.headers["X_CSRF_TOKEN"]
    client.activate()
}

export async function send(chatMessage) {
    client.publish({ destination: "/chat", body: JSON.stringify(chatMessage)})
}

export async function subscribe(username,topic, onMessage, offset) {
    client.subscribe(`/user/${username}/${topic}`, onMessage, { "offset": offset, "_csrf": axios.defaults.headers["X_CSRF_TOKEN"] })
}

export async function unSubscribe(topic) {
    client.unsubscribe(topic)
}

export async function disconnect() {
    await client.deactivate()
}

export class MessageContents {
    constructor(text, file_uuid = null) {
        this.file_uuid = file_uuid;
        this.text = text
        this.type = "MESSAGE"
    }
}

export class ChatMessage {
    constructor(chat_id,contents, sender ="") {
        this.message_id = crypto.randomUUID() 
        this.chat_id = chat_id
        this.sender = sender
        this.timestamp = Math.floor(new Date().valueOf()/1000)
        this.contents = contents
    }
}

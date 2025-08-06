import { Client } from '@stomp/stompjs'
import axios from "axios"
export var broker_url = "ws://localhost:8080/ws"

export async function activate(client,onConnect) {
    client.configure({connectheaders : {"x-csrf-token":axios.defaults.headers.common["x-csrf-token"] }})
    client.onConnect = onConnect
    client.activate()
}

export async function send(client,chatMessage) {
    client.publish({ destination: "/app/chat", body: JSON.stringify(chatMessage)})
}

export async function subscribe(client,topic, onMessage, offset) {
    client.subscribe(`/app/chat/${topic}`, onMessage, { "offset": offset })
}

export async function unSubscribe(client,topic) {
    client.unsubscribe(topic)
}

export async function disconnect(client) {
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
    constructor(chatId,contents, sender ="") {
        this.messageId = crypto.randomUUID() 
        this.chatId = chatId
        this.sender = sender
        this.timestamp = Math.floor(new Date().valueOf()/1000)
        this.contents = contents
    }
}

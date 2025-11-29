import { ChatMessage,MessageHeader, MessageFile,MessageContents } from "./protocol/messages"
import { encrypt_file_contents, encrypt_header, encrypt_message_contents, exportX25519PublicKey } from './CryptoUtils'
import { get_chat_info, store_chat } from './StorageUtils'
import { ratchet_turn_send } from "./RatchetUtils"
import { uploadFile } from "./RequestUtils"

export var broker_url = "ws://localhost:8080/ws"
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



export async function send_new_encrypted_message(client, indexed_db, chat_id, contents) {

    let chat_object = await get_chat_info(indexed_db, chat_id)
    // ratchet turn, if you have not send any messages on the sending chain, you should do a ratchet turn for the root key
    let message_keys = chat_object.sending_chain.message_keys
    await ratchet_turn_send(chat_object, chat_object.receiving_chain.message_keys.length > 0)
    // save changes
    await store_chat(indexed_db, chat_object)
    // get the message key for the message
    let message_key = chat_object.sending_chain.chain_key

    let message_contents_js_obj = { text: contents.text }
    if (contents.file) {
        let file_contents_protobuf_obj = MessageFile.fromObject(contents.file)
        let [file_contents_encrypt, file_iv] = await encrypt_file_contents(message_key, file_contents_protobuf_obj)
        let file_id = await uploadFile(file_contents_encrypt)
        message_contents_js_obj = { ...message_contents_js_obj, fileId: file_id, fileIv: file_iv, message_key:message_key }
    }
    let message_contents_protobuf_obj = MessageContents.fromObject(message_contents_js_obj)
    let [message_contents_encrypted, iv] = await encrypt_message_contents(message_key, message_contents_protobuf_obj)

    let message_header_js_obj = {
        type: "CHAT",
        chainLength: message_keys.length,
        messageIv: iv,
        previousLength:chat_object.receiving_chain.pn, // put previous n
        dhPublicKey: await exportX25519PublicKey(chat_object.dh_keypair_private.publicKey)
    }


    let message_header_proto = MessageHeader.fromObject(message_header_js_obj)
    let [ message_header_enc, header_iv ]=await encrypt_header(message_header_proto, chat_object.sending_chain.header_key)

    let chat_message_js_obj = {
        messageHeaderEncrypted: message_header_enc,
        messageContentsEncrypted: message_contents_encrypted,
        timestamp: new Date().getTime(),
        headerIv : header_iv
    }

    let chat_message_proto_obj = ChatMessage.fromObject(chat_message_js_obj)
    send(client, chat_object.user_id, chat_message_proto_obj)

    return message_contents_js_obj
}



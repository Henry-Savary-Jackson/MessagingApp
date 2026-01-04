// src/workers/messageHandlerWorker.js
import { handle_all_skipped_messages_for_session } from '../utils/RatchetUtils'
import { handle_X3DH_message } from '../utils/X3DHUtils'
import { handle_new_encrypted_message } from '../utils/MessagingUtils'
import { ChatMessage } from '../utils/protocol/messages'
import {Client} from "@stomp/stompjs"
import { getIdentityDataFromDB } from '../utils/StorageUtils'
import { broker_url } from '../utils/MessagingUtils'
/* eslint-disable no-restricted-globals */

const client = new Client({brokerURL:broker_url}) 
client.activate()

self.onmessage = async (event) => {
    const { data } = event;
    let chat_message = ChatMessage.decode(data)
    let ident_info = await getIdentityDataFromDB()
    ident_info = { ...ident_info, identityKey: { ...ident_info.identityKey, privateKey: ident_info.identityKeyPriv } }
    if (chat_message.messageHeader) {
        // X3DH message
        let new_dr_session = await handle_X3DH_message(ident_info.identityKey, ident_info.signedPrekey, chat_message)

        let found_skipped_messages = await handle_all_skipped_messages_for_session(client, ident_info, new_dr_session)

        found_skipped_messages.forEach(
            async (skipped_msg) => {
                console.log("Handling skipped message on UI!")
                console.log(skipped_msg)
                self.postMessage(skipped_msg)
            })
    } else {
        // nortmal message, decrypt with double ratchet algo

        let result = await handle_new_encrypted_message(client, chat_message, ident_info)
        self.postMessage(result);
    }

};

self.addEventListener('error', (error) => {
    console.error('Error in worker:', error);
});

export {}
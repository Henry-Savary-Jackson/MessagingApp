import { ChatMessage, MessageHeader } from './protocol/messages'
import { send } from './WebsocketUtils'
import { v4 } from 'uuid'
import { init_ratchet_root_sender } from './RatchetUtils'
import { generate25519KeyExchangePair, exportX25519PublicKey, X3DH_send, X3DH_accept } from './CryptoUtils'
import { addOTP, getPrekeyBundle, getUsername } from './RequestUtils'
import { delete_one_time_prekey,create_double_ratchet_sender, getOneTimePrekeyWithPubKey, refill_otp, create_chat_object, store_double_ratchet_session } from './StorageUtils'

export async function handle_X3DH_message(indexed_db, identity, signed_prekey, chat_message, one_time_prekey) {

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

    let prekey_bundle = await getPrekeyBundle(await getUsername(indexed_db, sender_id))

    if (one_time_prekey) {
        let under_full = await delete_one_time_prekey(indexed_db, one_time_prekey)
        async function refill() {
            let new_public_keys = await refill_otp(indexed_db)
            await addOTP(new_public_keys)
        }
        under_full || refill()
    }

    return await X3DH_accept({ identityKey: identity, signedPrekey: signed_prekey }, prekey_bundle, ephemeral_public_key, ad_encrypted, ad_iv, one_time_prekey)
}
export async function send_X3DH_message(indexed_db, stomp_client, user_id ,other_name, identity, signed_prekey, verifier_key) {
    let prekey_bundle = await getPrekeyBundle(other_name)
    let other_id = prekey_bundle.id
    let { KM, AD, AD_encrypted, AD_IV, ephemeralKeyPair, onetime_prekey } = await X3DH_send({ identityKey: identity, verifierKey: verifier_key, signedPrekey: signed_prekey }, prekey_bundle)
    let ephemeral_key_bytes = await exportX25519PublicKey(ephemeralKeyPair.publicKey)

    let sender_ratchet_key = await generate25519KeyExchangePair()
    let sender_ratchet_key_bytes = await exportX25519PublicKey(sender_ratchet_key.publicKey)
    let msg_header_js = { type: "X3DH", messageIv: AD_IV, chainLength: 0, dhPublicKey: sender_ratchet_key_bytes, ephemeralKey: ephemeral_key_bytes, oneTimePrekey: await exportX25519PublicKey(onetime_prekey), senderId: user_id }
    let messageHeader = MessageHeader.fromObject(msg_header_js)
    let chat_message = ChatMessage.fromObject({ messageHeader: messageHeader, messageContentsEncrypted: AD_encrypted, timestamp: new Date().getTime() })

    if (stomp_client) {
        send(stomp_client, other_id, chat_message)
    } else {
        console.error("No stomp connection")
    }
    console.log("shared root key")
    console.log(KM)
    console.log(`AD:${AD}`)
    let dr_session = await create_double_ratchet_sender(chat_id, other_id, other_name, sender_ratchet_key, prekey_bundle.identityKey, KM)
    await init_ratchet_root_sender(dr_session)
    await store_double_ratchet_session(indexed_db, dr_session)
    let new_chat = create_chat_object(v4(), other_name, "DIRECT")
    await store_chat(indexed_db, new_chat)
}
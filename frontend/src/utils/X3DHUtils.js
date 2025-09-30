
import { X3DH_accept } from './CryptoUtils'
import { getPrekeyBundle, getUsername } from './RequestUtils'


export async function handle_X3DH_message(indexed_db,identity, signed_prekey, chat_message, one_time_prekey) {

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

    let prekey_bundle = await getPrekeyBundle(await getUsername(indexed_db,sender_id))

    return await X3DH_accept({ identityKey: identity, signedPrekey: signed_prekey }, prekey_bundle, ephemeral_public_key, ad_encrypted, ad_iv, one_time_prekey)
}
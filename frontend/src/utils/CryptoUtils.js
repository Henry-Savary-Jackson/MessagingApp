import { convertArrayBufferToBase64, convertBase64StringToArrayBuffer } from "./EncodingUtils";
import {Identity,MessageFile, MessageHeader,MessageContents} from "../utils/protocol/messages"

export const signed_prekey_lifetime_ms = 5*24*60*60*1000 

export function generateChallengeBuffer() {
    return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(200))).buffer
}

export async function generateAESkey() {
    return await crypto.subtle.generateKey({"name":"AES-GCM", length:256}, true, ["encrypt", "decrypt" ])
}

export async function exportAESKey(aes_key){
    return new Uint8Array( await crypto.subtle.exportKey("raw",aes_key ))
}

export async function generate25519KeyExchangePair() {
    return await crypto.subtle.generateKey({"name":"X25519"}, true, ["deriveBits" ,"deriveKey" ])
}
export async function generate25519SignaturePair() {
    return await crypto.subtle.generateKey({"name":"Ed25519"}, true, ["sign", "verify" ])
}

export async function extractC25519ExchangePublicKey(publicKey) {
    return await crypto.subtle.importKey("raw", publicKey, {name:"X25519"}, true,  [ ]);
}
export async function extractC25519SignaturePublicKey(publicKey) {
    return await crypto.subtle.importKey("raw", publicKey, {name:"Ed25519"}, true, [ "verify" ]);
}
export async function exportX25519PublicKey(publicKey) {
    return new Uint8Array(await crypto.subtle.exportKey("raw", publicKey))
}
export async function extractC25519SignaturePrivateKey(private_key) {
    return await crypto.subtle.importKey("pkcs8", private_key, {name:"Ed25519"}, true, ["sign" ]);
}
export async function extractC25519KeyExchangePrivateKey(private_key) {
    return await crypto.subtle.importKey("pkcs8", private_key, {name:"X25519"}, true, ["deriveKey", "deriveBits" ]);
}



export async function extractC25519KeyExchangePair(keyPairMessage) {
    let publicKey = await extractC25519ExchangePublicKey( keyPairMessage.publicKey)
    let privateKey = await extractC25519KeyExchangePrivateKey( keyPairMessage.privateKey)
    let subleKeyPair= {
        privateKey:privateKey,
        publicKey:publicKey,
    };
    return subleKeyPair
}

export async function extractC25519KeySignaturePair(keyPairMessage) {
    
    let publicKey = await extractC25519SignaturePublicKey( keyPairMessage.publicKey)
    let privateKey = await extractC25519SignaturePrivateKey( keyPairMessage.privateKey)
    let subleKeyPair= {
        privateKey:privateKey,
        publicKey:publicKey,
    };
    return subleKeyPair
}


export async function X3DH_accept(identity, prekey_bundle, ephemeral_key_bytes, AD_encrypted, AD_iv, one_time_prekey=null){
    // verify the signature of sign prekey

    await verify_signed_prekey(prekey_bundle.verifierKey, prekey_bundle.prekeySignature, prekey_bundle.signedPrekey)

    // derive root key
    let KM = await derive_root_key_recipient(identity.identityKey,prekey_bundle.identityKey , identity.signedPrekey, ephemeral_key_bytes, one_time_prekey )
    console.log(KM)
    
    let SK = await create_shared_key(KM)

    // unecnrypt AD ciphertext into plain text using root key
    let bytesRecipientIdentityPubKey = identity.identityKey.publicKey
    let bytesSenderIdentityPubKey = prekey_bundle.identityKey
    let AD_derived =concatenateUIntArray(bytesSenderIdentityPubKey,bytesRecipientIdentityPubKey) 

    console.log(AD_derived)
    let AD_decrypted = new Uint8Array( await crypto.subtle.decrypt({"name":"AES-GCM", iv:AD_iv}, SK, AD_encrypted))


    console.log(AD_decrypted)
    // verify the ad byte sequence is correct
    if (!AD_decrypted.slice(0,64).every( (a,index)=>a===AD_derived.at(index) )){
        throw new Error("The AD byte sequence does not match the one given")
    }

    return KM  // only need to give secret key

}

export async function derive_root_key_recipient( identity_key, other_identity_key, signed_prekey,  ephemeral_key_public, onetime_prekey_pair= null){
    let DH1 = await DH(identity_key.privateKey, other_identity_key)
    let DH2 = await DH(identity_key.privateKey,ephemeral_key_public, )
    let DH3 = await DH(signed_prekey.privateKey, ephemeral_key_public)
    let DH4 = onetime_prekey_pair && await DH(onetime_prekey_pair.privateKey, ephemeral_key_public)

    let KM = DH4 ?concatenateUIntArray(DH1,DH2, DH3,DH4): concatenateUIntArray(DH1,DH2, DH3)
    KM =  createHKDFRootInput(KM)

    return KM
}
export async function derive_root_key_sender(identity_key, other_identity_key, other_signed_prekey,  ephemeral_key_pair, onetime_prekey_public=null){
    let DH1 = await DH(identity_key.privateKey, other_identity_key)
    let DH2 = await DH(ephemeral_key_pair.privateKey, other_identity_key)
    let DH3 = await DH(ephemeral_key_pair.privateKey, other_signed_prekey)
    let DH4 = onetime_prekey_public && await DH(ephemeral_key_pair.privateKey, onetime_prekey_public)

    let KM = DH4 ? concatenateUIntArray(DH1,DH2, DH3,DH4): concatenateUIntArray(DH1,DH2, DH3)
    KM =  createHKDFRootInput(KM)

    return KM
}
export async function verify_signed_prekey(otherVerifierKey, otherPreKeySignature,signed_prekey_bytes) {

    let otherVerifierCryptoKey = await extractC25519SignaturePublicKey(otherVerifierKey)
    
    let result = await crypto.subtle.verify("Ed25519",  otherVerifierCryptoKey, otherPreKeySignature, signed_prekey_bytes)
    if (!result){
        throw new Error("Invalid prekey signature")
    }
    return result
    // perform DH 


}

export async function X3DH_send(identity, prekey_bundle){
    
    // make an ephem key for this session
    let ephemeralKeyPair =await exportX25519KeyPair( await generate25519KeyExchangePair())

    // verify prekey signature

    await verify_signed_prekey(prekey_bundle.verifierKey,prekey_bundle.prekeySignature, prekey_bundle.signedPrekey)

    // choose random one time prekey
    let onetime_prekeys = prekey_bundle.oneTimePrekey


    let onetime_prekey =  onetime_prekeys.length> 0 && onetime_prekeys[Math.floor(Math.random()*onetime_prekeys.length)]

    let KM = await derive_root_key_sender(identity.identityKey, prekey_bundle.identityKey, prekey_bundle.signedPrekey, ephemeralKeyPair, onetime_prekey)
    console.log(KM)

    let SK = await create_shared_key(KM)
    // these vars are just to mkae sure the order of public keys matches for both sender and reciever
    let bytesYourIdentityPubKey = identity.identityKey.publicKey 
    let bytesOtherIdentityPubKey =  prekey_bundle.identityKey

    let AD =concatenateUIntArray(bytesYourIdentityPubKey,bytesOtherIdentityPubKey) 

    console.log("Ad bytes seq")
    console.log(AD)
    // concatenate chat id to ad byte sequence. 

    let AD_IV = crypto.getRandomValues(new Uint8Array(12)) 
    let AD_encrypted = new Uint8Array(await crypto.subtle.encrypt({"name":"AES-GCM", iv:AD_IV}, SK, AD))

    return { KM, AD, AD_encrypted,AD_IV, ephemeralKeyPair, onetime_prekey }
}


export async function create_shared_key(KM){
    let salt = new Uint8Array(32); 
    let info = new Uint8Array(8);
    let KM_key = await crypto.subtle.importKey("raw", KM, {"name":"HKDF"}, false,["deriveBits", "deriveKey"])
    let SK = await crypto.subtle.deriveKey({"name":"HKDF", "hash":"SHA-256", "info":info, "salt":salt},KM_key, {"name":"AES-GCM", length:256} , true, ["encrypt", "decrypt"]) 
    return SK
}

export function concatenateUIntArray(...arr){
    let length = arr.reduce((a,b)=>a+b.length,0)
    let offset = 0;
    let output = new Uint8Array(length)
    for (let element of arr){
        output.set(element, offset)
        offset+= element.byteLength
    }
    return output 
}

export async function KDF_root_key(root_key_inp, dh_output){
    let info = new Uint8Array(8);
    let dh_key = await crypto.subtle.importKey("raw", dh_output, {"name":"HKDF"}, false, ["deriveKey", "deriveBits"])
    let resultBits = new Uint8Array( await crypto.subtle.deriveBits({"name":"HKDF", "hash":"SHA-512", "info":info, "salt":root_key_inp},dh_key , 512) )

    let root_bits = resultBits.slice(0,32)
    // let root_key = await crypto.subtle.importKey("raw", root_bits, {"name":"HKDF"}, true, ["deriveKey", "deriveBits"])
    let chain_key_bits = resultBits.slice(32,64)

    return [root_bits, chain_key_bits]
}

export async function KDF_chain_key( chain_key_bits){

    let info = new Uint8Array(8);
    let salt = new Uint8Array(32);
    let chain_key = await crypto.subtle.importKey("raw", chain_key_bits, {"name":"HKDF"},false, ["deriveBits"] )
    let resultBits = new Uint8Array( await crypto.subtle.deriveBits({"name":"HKDF", "hash":"SHA-512", "info":info, "salt":salt},chain_key , 256) )
    return resultBits 
}


export async function  encrypt_header(message_header, header_key_bits){
    let header_iv = new Uint8Array(32);
    let header_key = await crypto.subtle.importKey("raw", header_key_bits, {name:"AES-GCM"}, true, ["encrypt"])
    let header_contents_bytes  =  MessageHeader.encode(message_header).finish()
    let encrypted_bytes_buffer = new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM", iv:header_iv}, header_key, header_contents_bytes) )
    return [ encrypted_bytes_buffer, header_iv ]
}

export function createHKDFRootInput(KM_bytes){
    let output= new Uint8Array(32+KM_bytes.byteLength)
    output =output.fill(0xFF, 0, 32)
    output.set(KM_bytes,32)
    return output
    
}

export async function DH(yourKey, otherKey){
    let yourKeyCryptoKey = await extractC25519KeyExchangePrivateKey(yourKey)
    let otherKeyCryptoKey = await extractC25519ExchangePublicKey(otherKey)
    return new Uint8Array( await crypto.subtle.deriveBits({name:"X25519", public:otherKeyCryptoKey}, yourKeyCryptoKey,256 ))
}

export async function exportX25519KeyPair(subtleKeyPair) {
    return  {
        "privateKey": new Uint8Array( await crypto.subtle.exportKey("pkcs8", subtleKeyPair.privateKey)),
        "publicKey": new Uint8Array( await  crypto.subtle.exportKey("raw", subtleKeyPair.publicKey))
    }
}

export async function signPreKey(prekeyBytes, identityKey) {
    return await signBytes(identityKey.privateKey,prekeyBytes)
}

export async function signBytes(key, bytes){
    let cryptoKey = await extractC25519SignaturePrivateKey(key)
   return new Uint8Array(await crypto.subtle.sign('Ed25519', cryptoKey, bytes ))
}

export async function create_new_prekey_bundle(js_identity){
    let identityKey = js_identity.identityKey.publicKey
    let verifierKey = js_identity.verifierKey.publicKey
    let signedPrekey = js_identity.signedPrekey.publicKey
    let prekeySignature = await signBytes(js_identity.verifierKey.privateKey,signedPrekey )
    let oneTimePrekey = js_identity.oneTimePrekey.map((otp)=>otp.publicKey)

    return { identityKey, verifierKey,signedPrekey,prekeySignature, signedPrekeyExpiration:js_identity.signedPreKeyExpiration , oneTimePrekey}
}

export async function signChallenge(signingKey) {

    let private_verifier_key  = await extractC25519SignaturePrivateKey(signingKey)
    let challenge = generateChallengeBuffer()
    let signatrueBytes = await crypto.subtle.sign('Ed25519', private_verifier_key,
        challenge);
    return {
        "challenge": convertArrayBufferToBase64(challenge), "challengeSignature":
            convertArrayBufferToBase64(signatrueBytes)
    }
}

export async function convertKeyToBase64(type, key) {
    return convertArrayBufferToBase64(await crypto.subtle.exportKey(type == "public" ? "raw" : "pkcs8", key))
}

export function addHeaderFooterToKey(type, base64Key) {
    const text =type == "public"? "CERTIFICATE": "PRIVATE KEY"
    return `-----BEGIN ${text}-----\n${base64Key}\n-----END ${text}-----`
}

export function removeHeaderFooterToKey(rawStr) {
    return rawStr.slice(rawStr.indexOf("\n") + 1, rawStr.lastIndexOf("\n"))
}


export async function create_new_identity(){
    let identityKey  =await exportX25519KeyPair(await generate25519KeyExchangePair());
    let verifierKey  =await exportX25519KeyPair( await generate25519SignaturePair());
    let signedPrekey = await exportX25519KeyPair( await generate25519KeyExchangePair());

    let current_date = new Date()
    let expiration = current_date.getTime() + signed_prekey_lifetime_ms

    let n_otp = 100;
    let oneTimePrekey  = []
    for (let i=0 ; i< n_otp; i++){
        oneTimePrekey.push(await exportX25519KeyPair( await generate25519KeyExchangePair()))
    }
    let last_msg_timestamp = current_date.getTime()
    return {identityKey,verifierKey, signedPrekey, expiration, oneTimePrekey, last_msg_timestamp}
}

export async function decrypt_message_header(header_key_bits,header_contents_bytes, header_iv){
    try {
    let header_key = await crypto.subtle.importKey("raw", header_key_bits, {name:"AES-GCM"}, true, ["decrypt"])
    let decrypted_bytes_buffer = new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM", iv:header_iv}, header_key, header_contents_bytes) )
    return MessageHeader.decode(decrypted_bytes_buffer) 
    }catch(err){
        console.log(`Failed to here decrypt:${err}`)
        throw err
    }
}

export async function decrypt_message_contents(message_key_bits,message_contents_bytes, message_iv) {
    try {

    let message_key = await crypto.subtle.importKey("raw", message_key_bits, {name:"AES-GCM"}, true, ["decrypt"])
    let decrypted_bytes_buffer = new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM", iv:message_iv}, message_key, message_contents_bytes) )
    return MessageContents.decode(decrypted_bytes_buffer) 
    }catch(err){
        console.log(`Failed to here decrypt:${err}`)
        throw err
    }
}
export async function decrypt_file_contents(message_key_bits,file_contents_bytes, file_iv) {
    try {

    let message_key = await crypto.subtle.importKey("raw", message_key_bits, {name:"AES-GCM"}, true, ["decrypt"])
    let decrypted_bytes_buffer = new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM", iv:file_iv}, message_key, file_contents_bytes) )
    return MessageFile.decode(decrypted_bytes_buffer) 
    }catch(err){
        console.log(`Failed to decrypt:${err}`)
        throw err
    }
}

async function encrypt_uint8array(message_key_bits, data){

    let iv = crypto.getRandomValues(new Uint8Array(32));
    let message_key = await crypto.subtle.importKey("raw", message_key_bits, {name:"AES-GCM"}, true, ["encrypt"])
    let encrypted_bytes_buffer = new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, message_key, data) )
    return [encrypted_bytes_buffer, iv]
}

export async function encrypt_message_contents(message_key_bits, message_contents){
    let message_contents_bytes = MessageContents.encode(message_contents).finish() 
    return encrypt_uint8array(message_key_bits,message_contents_bytes)
}

export async function encrypt_file_contents(message_key_bits, file_contents) {
    let file_contents_bytes = MessageFile.encode(file_contents).finish() 
    return encrypt_uint8array(message_key_bits,file_contents_bytes)
}
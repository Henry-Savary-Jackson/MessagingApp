import { convertArrayBufferToBase64 } from "./EncodingUtils";

export function generateChallengeBuffer() {
    return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(200))).buffer
}

export async function generateX25519KeyPair() {
    let keyPair = await crypto.subtle.generateKey("X25519", true, ["sign", "verify"])
    return keyPair
}

export async function extractX25519PublicKey(publicKey) {
    return await crypto.subtle.importKey("spki", publicKey, "X25519", true, ["sign", "verify"]);
}
export async function exportX25519PublicKey(publicKey) {
    return await crypto.subtle.exportKey("spki", publicKey)
}

export async function extractX25519KeyPair(keyPairMessage) {
    let publicKey = await crypto.subtle.importKey("spki", keyPairMessage.public_key, "X25519", true, ["sign", "verify", "deriveKey"]);
    let privateKey = await crypto.subtle.importKey("pkcs8", keyPairMessage.private_key, "X25519", true, ["sign", "verify", "deriveBits"]);
    let subleKeyPair= {
        privateKey,
        publicKey,
    };
    return subleKeyPair
}


export async function X3DH_accept(identity, prekey_bundle, ephemeral_key_bytes, AD_encrypted, AD_iv, one_time_prekey_bytes=null){
    let identityCryptoKeyPair = await extractX25519KeyPair(identity.identity_key)
    let signed_prekey_keypair = await extractX25519KeyPair(identity.signed_prekey)

    let otherIdentityKey = await extractX25519PublicKey(prekey_bundle.identity_key)
    // verify the signature of sign prekey
    
    let ephemeralKey = await extractX25519PublicKey(ephemeral_key_bytes)

    let onetime_prekey_public  = one_time_prekey_bytes && await extractX25519PublicKey(one_time_prekey_bytes)
    // find relevant onetime prek private key in identity

    let otherPreKeySignature = prekey_bundle.prekey_signature

    await verify_signed_prekey(otherIdentityKey, otherPreKeySignature, prekey_bundle.signed_prekey)

    // derive root key
    let KM = await derive_root_key_recipient(identityCryptoKeyPair, otherIdentityKey, signed_prekey_keypair, ephemeralKey, onetime_prekey_public )
    
    let SK = await create_shared_key(KM)

    // unecnrypt AD ciphertext into plain text using root key
    let bytesRecipientIdentityPubKey = new Uint8Array( await crypto.subtle.exportKey("raw", identityCryptoKeyPair ))
    let bytesSenderIdentityPubKey = new Uint8Array(await crypto.subtle.exportKey("raw", otherIdentityKey))
    let AD_derived =concatenateUIntArray(bytesSenderIdentityPubKey,bytesRecipientIdentityPubKey) 

    let SK_key = await crypto.subtle.importKey("raw", SK, {"name":"AES-GCM"} )
    let AD_decrypted = await crypto.subtle.decrypt({"name":"AES-GCM", AD_iv}, SK_key, data)

    // verify the ad byte sequence is correct
    if (AD_decrypted != AD_derived){
        throw new Error("The AD byte sequence does not match the one given")
    }
    return SK // only need to give secret key

}

export async function derive_root_key_recipient( identity_key, other_identity_key, signed_prekey,  ephemeral_key_public, onetime_prekey_pair= null){
    let DH1 =await export_HMAC_Key( await DH(identity_key.privateKey, other_identity_key))
    let DH2 = await export_HMAC_Key(await DH(identity_key.privateKey,ephemeral_key_public, ))
    let DH3 = await export_HMAC_Key(await DH(signed_prekey.privateKey, ephemeral_key_public))
    let DH4 = onetime_prekey && await export_HMAC_Key(await DH(onetime_prekey_pair.privateKey, ephemeral_key_public))

    KM = DH4 ? concatenateUIntArray(DH1,DH2, DH3,DH4): concatenateUIntArray(DH1,DH2, DH3)
    KM =  createHKDFRootInput(KM)

    return KM
}
export async function derive_root_key_sender(identity_key, other_identity_key, other_signed_prekey,  ephemeral_key_pair, onetime_prekey_public=null){
    let DH1 =await export_HMAC_Key( await DH(identity_key.privateKey, other_identity_key))
    let DH2 = await export_HMAC_Key(await DH(ephemeral_key_pair.privateKey, other_identity_key))
    let DH3 = await export_HMAC_Key(await DH(ephemeral_key_pair.privateKey, other_signed_prekey))
    let DH4 = onetime_prekey && await export_HMAC_Key(await DH(ephemeral_key_pair.privateKey, onetime_prekey_public))

    KM = DH4 ? concatenateUIntArray(DH1,DH2, DH3,DH4): concatenateUIntArray(DH1,DH2, DH3)
    KM =  createHKDFRootInput(KM)

    return KM
}
export async function verify_signed_prekey(otherIdentityKey, otherPreKeySignature,signed_prekey_bytes) {
    
    let result = await crypto.subtle.verify("Ed25519",  otherIdentityKey, otherPreKeySignature, signed_prekey_bytes)
    if (!result){
        throw new Error("Invalid prekey signature")
    }
    return result
    // perform DH 


}

export async function X3DH_send(identity, prekey_bundle){
    let identityCryptoKeyPair = await extractX25519KeyPair(identity.identity_key)

    let otherIdentityKey = await extractX25519PublicKey(prekey_bundle.identity_key)
    let othersignedPrekKey = await extractX25519PublicKey(prekey_bundle.signed_prekey)
    
    let ephemeralKeyPair = await generateX25519KeyPair()

    // verify prekey signature
    let otherPreKeySignature = prekey_bundle.prekey_signature

    await verify_signed_prekey(otherIdentityKey,otherPreKeySignature, prekey_bundle.signed_prekey)

    // choose random one time prekey
    const onetime_prekeys = prekey_bundle.onetime_prekey
    let onetime_prekey =  onetime_prekeys.length> 0 && extractX25519PublicKey(onetime_prekeys[Math.floor(Math.random()*onetime_prekeys.length)])

    let KM = await derive_root_key_sender(identityCryptoKeyPair, otherIdentityKey, othersignedPrekKey, ephemeralKeyPair, onetime_prekey)

    let SK = await create_shared_key(KM)
    let bytesYourIdentityPubKey = new Uint8Array( await crypto.subtle.exportKey("raw", identityCryptoKeyPair.publicKey))
    let bytesOtherIdentityPubKey = new Uint8Array(await crypto.subtle.exportKey("raw", otherIdentityKey))
    let AD =concatenateUIntArray(bytesYourIdentityPubKey,bytesOtherIdentityPubKey) 
    let AD_IV = crypto.getRandomValues(new Uint8Array(12)) 
    let SK_key = await crypto.subtle.importKey("raw", SK, {"name":"AES-GCM"} )
    let AD_encrypted = await crypto.subtle.encrypt({"name":"AES-GCM", AD_IV}, SK_key, AD)

    return { SK, AD_encrypted,AD_IV, ephemeralKeyPair, onetime_prekey }
}


export async function create_shared_key(KM){
    let salt = new Uint8Array(32); 
    let info = new Uint8Array(8);
    let KM_key = await crypto.subtle.importKey("raw", KM, {"name":"HKDF"}, false,["deriveBits", "deriveKey"])
    let SK = await crypto.subtle.deriveBits({"name":"HKDF", "hash":"SHA-512", "info":info, "salt":salt},KM_key , 32) 
    return SK
}

export function concatenateUIntArray(...arr){
    let length = arr.reduce((a,b)=>a.byteLength+b.byteLength)
    let offset = 0;
    let output = new Uint8Array(length)
    for (let element of arr){
        arr.set(element, offset)
        offset+= element.byteLength
    }
    return output 
}


export async function ratchet_turn(chain_key,input_key){
    let input_key_bytes = await export_HMAC_Key(input_key)
    await crypto.subtle.deriveKey({"name":"HKDF", "input":input_key_bytes }, chain_key, {"name":"HMAC", "hash":"SHA-512"}, true, ["encrypt", "decrypt", "verify", "sign"])
}

export async function createHKDFRootInput(KM_bytes){
    let output= new Uint8Array(32+KM_bytes.byteLength)
    output =output.fill(0xFF, 0, 32)
    return output
    
}

export async function export_HMAC_Key(key){
    return new Uint8Array(await crypto.subtle.exportKey("pkcs8", key))

}

export async function DH(yourKey, otherKey){
    let newKey = await crypto.subtle.deriveKey({name:"X25519", public:otherKey}, yourKey,{name:"HMAC", hash:"SHA-512"}, true, ["encrypt","sign", "verify", "decrypt"])
    return newKey
}


export async function exportX25519KeyPair(subleKeyPair) {
    const keyPairMessage = {
        "private_key": await crypto.subtle.exportKey("pkcs8", subleKeyPair.privateKey),
        "public_key": await  crypto.subtle.exportKey("spki", subleKeyPair.publicKey)
    }
    return keyPairMessage
}

export async function signPreKey(prekeyBytes, identityKey) {
    return await signBytes(identityKey.privateKey,prekeyBytes)
}

export async function signBytes(key, bytes){
   return await crypto.subtle.sign('Ed25519', key, bytes )
}

export async function signChallenge(identityKey) {
    let challenge = generateChallengeBuffer()
    let signatrueBytes = await crypto.subtle.sign('Ed25519', identityKey,
        challenge);
    return {
        "challenge": convertArrayBufferToBase64(challenge), "challengeSignature":
            convertArrayBufferToBase64(signatrueBytes)
    }
}

export async function convertKeyToBase64(type, key) {
    return convertArrayBufferToBase64(await crypto.subtle.exportKey(type == "public" ? "spki" : "pkcs8", key))
}

export function addHeaderFooterToKey(type, base64Key) {
    return `-----BEGIN ${type.toUpperCase()} KEY-----\n${base64Key}\n-----END ${type.toUpperCase()} KEY-----`
}

export function removeHeaderFooterToKey(rawStr) {
    return rawStr.slice(rawStr.indexOf("\n") + 1, rawStr.lastIndexOf("\n"))
}

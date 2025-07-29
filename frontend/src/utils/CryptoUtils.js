import { convertArrayBufferToBase64 } from "./EncodingUtils";

export function generateChallengeBuffer() {
    return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(200))).buffer
}

export async function signChallenge(privKeyBuffer) {
    let privKeyFile = await crypto.subtle.importKey("pkcs8", privKeyBuffer, "Ed25519", true, ["sign"]);
    let challenge = generateChallengeBuffer()
    let signatrueBytes = await crypto.subtle.sign('Ed25519', privKeyFile,
        challenge
    );
    return {
        "challenge": convertArrayBufferToBase64(challenge), "challengeSignature":
            convertArrayBufferToBase64(signatrueBytes)
    }
}

export async function generatePrivatePublicKeyPair() {
    const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"])
    return {
        "privateKey": await convertKeyToBase64("private", keyPair.privateKey),
        "publicKey": await convertKeyToBase64("public", keyPair.publicKey)
    }
}

export async function convertKeyToBase64(type, key) {
    return convertArrayBufferToBase64(await crypto.subtle.exportKey(type == "public" ? "raw" : "pkcs8", key))
}

export function addHeaderFooterToKey(type, base64Key) {
    return `-----BEGIN ${type.toUpperCase()} KEY-----\n${base64Key}\n-----END ${type.toUpperCase()} KEY-----`
}

export function removeHeaderFooterToKey(rawStr) {
    return rawStr.slice(rawStr.indexOf("\n") + 1, rawStr.lastIndexOf("\n"))
}

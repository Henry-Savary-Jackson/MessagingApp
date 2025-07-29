

// from https://www.technocatgames.com/blog/fast-arraybuffer-to-base64-in-javascript/
export function convertArrayBufferToBase64(arrayBuffer) {

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}



// from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
export function convertBase64StringToArrayBuffer(base64str) {
    const binary_string = window.atob(base64str);
    const len = binary_string.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary_string.charCodeAt(i);
    }
    return buffer;
}
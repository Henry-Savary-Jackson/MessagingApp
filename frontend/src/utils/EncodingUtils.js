

// from https://www.technocatgames.com/blog/fast-arraybuffer-to-base64-in-javascript/
export function convertArrayBufferToBase64(arrayBuffer) {

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
export function convertBase64StringToArrayBuffer(base64str) {
    const binary_string = atob(base64str);
    const len = binary_string.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary_string.charCodeAt(i);
    }
    return buffer;
}


export function Uint8ArrayEquals(arr_1, arr_2) {
    if (arr_1.length != arr_2.length)
        return false
    return arr_1.every((val, index) => arr_2.at(index) === val)
}
import axios from 'axios'

import { PreKeyBundle } from "../utils/protocol/messages"
import { get_file_local, get_user_info, store_file_local, store_user_info, storeUserData } from './StorageUtils'
import { decrypt_file_contents } from './CryptoUtils'

const api_url = "http://localhost:8080"
const username_cache = new Map()
const profile_cache = new Map()
const protobuf_mimetype="application/x-protobuf"

export function setAxiosCSRF(csrf_data) {
    axios.defaults.headers.common[csrf_data.headerName] = csrf_data.token
    return csrf_data.token
}

export async function getCSRF() {
    return await performRequest(async () => (await axios.get(`${api_url}/csrf`, { withCredentials: true })).data)
}


export async function getChats() {
    return await performRequest(async () => (await axios.get(`${api_url}/chat/list`, { withCredentials: true, withXSRFToken: true })).data)
}

export async function join(chat_id) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/join`, chat_id, { headers: { "Content-Type": "text/plain" }, withCredentials: true, withXSRFToken: true })).data)
}

export async function logout() {
    return await performRequest(async () => (await axios.post(`${api_url}/user/logout`, null, { withCredentials: true, withXSRFToken: true })).data)
}

async function performRequest(requestFunction) {
    try {
        return await requestFunction()
    } catch (e) {
        if (e.response) {
            e.code = e.response.data.code
            e.message = e.response.data.message
        }
        throw e
    }
}

export async function login(data) {
    return await performRequest(async () => (await axios.post(`${api_url}/user/login`, data, { withCredentials: true, withXSRFToken: true })).data)
}

export async function register(data) {
    return await performRequest(async () => (await axios.post(`${api_url}/user/register`, data, { withCredentials: true })).data);
}


export async function createChat(name) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/create`, name, { withCredentials: true, withXSRFToken: true })).data);
}

export async function leaveChatRequest(chat_id) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/leave`, chat_id, { withCredentials: true, withXSRFToken: true })).data);
}
export async function deleteChatRequest(chat_id) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/delete`, chat_id, { withCredentials: true, withXSRFToken: true })).data);
}


export async function getUserProfile(indexed_db,user_id) {
    return await performRequest(async () => {
        let user_info  = await get_user_info(indexed_db, user_id)
        if (user_info && user_info.profile){
            return user_info.profile
        }

        let result = (await axios.get(`${api_url}/user/profile/${user_id}`, { withCredentials: true, withXSRFToken: true })).data
        user_info = user_info || {user_id:user_id}
        user_info.profile=result
        await store_user_info(indexed_db, user_info)
        return result
    }
    );

}
export async function putUserProfile(data) {
    return await performRequest(async () => (await axios.put(`${api_url}/user/profile`, data, { withCredentials: true, withXSRFToken: true })).data);
}

export async function uploadFile(data) {
    return await performRequest(async () => (await axios.post(`${api_url}/file/upload`, data, { headers:{"Content-Type":"application/octet-stream"},withCredentials: true, withXSRFToken: true })).data);
}
export async function deleteFile(uuid) {
    return await performRequest(async () => (await axios.delete(`${api_url}/file/${uuid}`, null, { withCredentials: true, withXSRFToken: true })).data);
}
export async function getFile(indexed_db,uuid, message_key, fileIv) {
    return  await performRequest(async () => {
        let file_local = await get_file_local(indexed_db, uuid)
        if (file_local){
            return file_local
        }
        let buffer_encrypted = (await axios.get(`${api_url}/file/${uuid}`, { responseType: 'arraybuffer',withCredentials: true, withXSRFToken: true })).data
        try {

            let message_file_proto = await decrypt_file_contents(message_key, buffer_encrypted, fileIv)
            await store_file_local(indexed_db, message_file_proto,uuid)

            return message_file_proto
        } catch (e) {
            throw e;
        }
    })
}

export async function getPrekeyBundle(username) {
    return await performRequest(async () => {
        let response = (await axios.get(`${api_url}/user/prekeybundle/${username}`, {  responseType: 'arraybuffer', withCredentials: true, withXSRFToken: true }))
        try {
            return PreKeyBundle.decode(new Uint8Array(response.data));
        } catch (e) {
            throw e;
        }
    });

}

export async function updateOTPs(otps) {
    // return await performRequest(async () => (await axios.get(`${api_url}/file/${uuid}`, { withCredentials: true, withXSRFToken: true })).data);
}
    

export async function getUsername(indexed_db,user_id) {
    let user_info = await get_user_info(indexed_db, user_id)
    if (user_info) {
        return user_info.name;
    }
    let username = await performRequest(async () => (await axios.get(`${api_url}/user/username/${user_id}`, { withCredentials: true })).data)
    user_info  = { name:username, user_id:user_id}
    await store_user_info(indexed_db, user_info) 
    return username;
}
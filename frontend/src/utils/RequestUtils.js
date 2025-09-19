import axios from 'axios'


const api_url = "http://localhost:8080"
const username_cache = new Map()
const profile_cache = new Map()

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
    return await performRequest(async () => (await axios.post(`${api_url}/chat/create`, name, {  withCredentials: true, withXSRFToken: true })).data);
}

export async function leaveChatRequest(chat_id) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/leave`, chat_id, {  withCredentials: true, withXSRFToken: true })).data);
}
export async function deleteChatRequest(chat_id) {
    return await performRequest(async () => (await axios.post(`${api_url}/chat/delete`, chat_id, { withCredentials: true, withXSRFToken: true })).data);
}

export async function getUserProfile(user_id){
    return await performRequest(async () => (await axios.get(`${api_url}/user/profile/${user_id}`, { withCredentials: true, withXSRFToken: true })).data);
}
export async function putUserProfile(data) {
    return await performRequest(async () => (await axios.put(`${api_url}/user/profile`, data, { withCredentials: true, withXSRFToken: true })).data);
}

export async function uploadFile(data) {
    return await performRequest(async () => (await axios.post(`${api_url}/file/upload`, data, { withCredentials: true, withXSRFToken: true })).data);
}
export async function deleteFile(uuid) {
    return await performRequest(async () => (await axios.delete(`${api_url}/file/${uuid}`, null, { withCredentials: true, withXSRFToken: true })).data);
}
export async function getFile(uuid) {
    return await performRequest(async () => (await axios.get(`${api_url}/file/${uuid}`, { withCredentials: true, withXSRFToken: true })).data);
}

export async function getPrekeyBundle(user_id) {
    // return await performRequest(async () => (await axios.get(`${api_url}/file/${uuid}`, { withCredentials: true, withXSRFToken: true })).data);
}

export async function updateOTPs(otps) {
    // return await performRequest(async () => (await axios.get(`${api_url}/file/${uuid}`, { withCredentials: true, withXSRFToken: true })).data);
}


export async function getUsername(user_id) {
    if (user_id in username_cache) {
        return username_cache[user_id];

    }
    let username = await performRequest(async () => (await axios.get(`${api_url}/user/username/${user_id}`, { withCredentials: true })).data)
    username_cache[user_id] = username;
    return username;
}
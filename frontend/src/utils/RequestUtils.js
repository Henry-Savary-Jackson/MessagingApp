import axios from 'axios'


const api_url = "http://localhost:8080"

export function setAxiosCSRF(csrf_data) {
    axios.defaults.headers.common[csrf_data.headerName] = csrf_data.token
    return csrf_data.token
}

export async function getCSRF(){
    return await performRequest(async () => (await axios.get(`${api_url}/csrf`, { withCredentials: true })).data)
}


export async function getChats(){
    return await performRequest(async () => (await axios.get(`${api_url}/chat/list`, { withCredentials: true, withXSRFToken: true })).data)
}

export async function join(chat_id){
    return await performRequest(async () => (await axios.post(`${api_url}/chat/join`, chat_id, { headers:{"Content-Type":"application/json"}, withCredentials: true, withXSRFToken: true })).data)
}

export async function logout(){
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


export async function createChat(){
    return await performRequest(async () => (await axios.post(`${api_url}/chat/create`, null, { withCredentials: true })).data);
}
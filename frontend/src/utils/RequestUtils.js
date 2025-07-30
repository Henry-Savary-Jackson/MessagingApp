import axios from 'axios'


const api_url = "http://localhost:8080"

export async function setAxiosCSRF() {
    const test = axios
    const csrf_data = await performRequest(async () => (await axios.get(`${api_url}/csrf`, { withCredentials: true })).data)

    axios.defaults.headers.common[csrf_data.headerName] = csrf_data.token
    return csrf_data.token
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
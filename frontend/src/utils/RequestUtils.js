import axios from 'axios'


const api_url = "http://localhost:8080"

export async function setAxiosCSRF(){
    const csrf_data = await (await axios.get(`${api_url}/csrf`, { withCredentials:true})).data
    axios.defaults.headers[csrf_data.headerName] = csrf_data.token
    return csrf_data.token 
}

export async function login(data){
    return (await axios.post(`${api_url}/user/login`, data, {withCredentials:true})).data
}

export async function register(data){
    return (await axios.post(`${api_url}/user/register`, data, {withCredentials:true})).data
}
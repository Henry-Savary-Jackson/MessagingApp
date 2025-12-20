import { createContext } from "react";

export let csrf_context = createContext("")
export let identity_context = createContext(null)
export let user_id_context = createContext("")
export let username_context = createContext("")
export let blob_context = createContext({})

import { createContext, useContext } from "react"

export const blob_context = createContext(undefined)

export default function useBlobStore(){
    let context = useContext(blob_context)
    return context 
}
import { createContext, useContext } from "react"

export const db_context = createContext(undefined)

export default function useDBContext(){
    let context = useContext(db_context)
    if (context === undefined)
        throw new Error("Must use DB context within context provider")
    return context 
}
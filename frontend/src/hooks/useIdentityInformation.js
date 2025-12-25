import { useState, useEffect } from "react"
import { storeUserData, getIdentityDataFromDB } from "../utils/StorageUtils"
import { useLiveQuery} from 'dexie-react-hooks`'
// fetch identity information from the database when eeded
// useful for react components that need to initiate an X3DH protocol or the need to accept an X3DH start message
export default function useIdentityInformation() {
    let ident_info = useLiveQuery(()=>{
        ()=>getIdentityDataFromDB()
    })

    return [ident_info, storeUserData]

}


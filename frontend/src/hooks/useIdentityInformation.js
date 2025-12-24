import { useState, useEffect } from "react"
import { storeUserData, getIdentityDataFromDB } from "../utils/StorageUtils"

// fetch identity information from the database when eeded
// useful for react components that need to initiate an X3DH protocol or the need to accept an X3DH start message
export default function useIdentityInformation(indexed_db) {
    let [ident_info, set_ident_info] = useState(null)

    function save_new_ident_info(new_ident_info) {
        if (indexed_db) {
            set_ident_info(new_ident_info)
            storeUserData(indexed_db, new_ident_info)
        } else {
            throw new Error("IndexedDB not intialized when saving identity information!")
        }
    }

    useEffect(() => {
        const get_from_db = async () => {
            if (!indexed_db)
                return
            set_ident_info(await getIdentityDataFromDB(indexed_db))
        }
        get_from_db()
    }, [indexed_db])

    return [ident_info, save_new_ident_info]


}


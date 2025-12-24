import { useIndexedDB } from "../../hooks/useIndexedDB";
import { db_context } from "../../context/useDBContext";

export default function DBProvider({children}){
    let {db, loading} = useIndexedDB()
    return <db_context.Provider value={{db, loading}}>
        {db && children}
    </db_context.Provider> 
}
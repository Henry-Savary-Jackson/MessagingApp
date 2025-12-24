import { useReducer  } from "react";
import { blob_context } from "../../context/useBlobStore";

export default function BlobStoreProvider({children}){

    let [blobs, blobsReducer] = useReducer((prev, action) => {
        switch (action.action) {
            case "add":
                return { ...prev, [action.fileId]: action.url }
            case "remove":
                URL.revokeObjectURL(prev[action.fileId])
                delete prev[action.fileId]
                return { ...prev }
        }
    }, {})

    const add_blob = (fileId, blob) => { 
        if (blob){
            let url = URL.createObjectURL(blob)
            blobsReducer({ action: "add", fileId: fileId, url: url }) 
            return url
        }
    }

        
    const remove_blob = (fileId) => { blobsReducer({ action: "remove", fileId: fileId }) }
    const get_blob = (fileId) => blobs[fileId]


    return <blob_context.Provider value={[add_blob, remove_blob, get_blob]}>
        {children}
    </blob_context.Provider> 
}
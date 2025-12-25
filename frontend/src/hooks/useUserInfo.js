import { useEffect, useState } from "react";
import { getUserProfileById } from "../utils/RequestUtils";
import useBlobStore from "../context/useBlobStore";


export function useUserInfo( user_id) {
    let [addBlob, removeBlob, getBlob] = useBlobStore()

    let user_info = useLiveQuery(()=>getUserProfileById(user_id) ,[user_id])
    let profileURL = "" 
    if (user_info && user_info.profile){
        profileURL =addBlob(user_id, user_info.profile)
    }

    return { user_info, profileURL }

}
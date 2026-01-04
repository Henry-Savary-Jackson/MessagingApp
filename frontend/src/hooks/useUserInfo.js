import { useEffect, useState } from "react";
import { getUserProfileById } from "../utils/RequestUtils";
import useBlobStore from "../context/useBlobStore";


export function useUserInfo(user_id) {
    let [user_info, set_user_info] = useState(null)
    let [profileURL, setProfileURL] = useState("")
    let [addBlob, removeBlob, getBlob] = useBlobStore()
    useEffect(() => {
        (async () => set_user_info(await getUserProfileById(user_id)))()
    }
        , [])

    useEffect(() => {
        if (user_info && user_info.profile && !getBlob(user_id)) {
            setProfileURL(addBlob(user_id, user_info.profile))
            return () => removeBlob(user_id)
        }
    }, [user_info])

    return { user_info, profileURL }
}
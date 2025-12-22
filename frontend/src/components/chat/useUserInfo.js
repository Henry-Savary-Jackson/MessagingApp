import { useContext, useEffect, useState } from "react";
import { blob_context } from "../../globals";
import { getUserProfileById } from "../../utils/RequestUtils";
import "../../css/chats.scss"


export function useUserInfo(db, user_id) {
    let [addBlob, removeBlob, getBlob] = useContext(blob_context)

    let [user_info, setUserInfo] = useState(null)
    let [profileURL, setProfileURL] = useState(null)

    useEffect(() => {
        (async () => {
            let new_user_info = await getUserProfileById(db, user_id)
            setUserInfo(new_user_info)
            addBlob(user_id, new_user_info.profile)
        })()
    }, [])

    useEffect(() => {
        if (user_info && user_info.profile) {
            let url = getBlob(user_id)

            setProfileURL(url)
        }
    }, [user_info])


    return { user_info, profileURL }

}
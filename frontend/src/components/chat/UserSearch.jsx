import { useEffect, useContext, useRef, useState } from "react";
import { Button, Image, Form, FormControl, ListGroup, ListGroupItem } from "react-bootstrap";
import { getUserId, getUsername, getUserProfileById, searchUserIdsByUsername } from "../../utils/RequestUtils";
import { useUserInfo } from "./useUserInfo";
import { blob_context } from "../../globals";
import "../../css/chats.scss"
import { useIndexedDB } from "../../utils/StorageUtils";


function UserSearchResult({ indexed_db, user_id, onUserSelect }) {
    
    let {user_info, profileURL}= useUserInfo(indexed_db, user_id)

    return <ListGroupItem key={user_id} onClick={(e) => { onUserSelect(user_id) }}>
        {profileURL && <Image className="border msg-profile-image " src={profileURL} roundedCircle />}
        <span>{user_info && user_info.username}</span>
    </ListGroupItem>
}

export default function UserSearch({ selectUserCallback }) {

    let [foundUserIds, setFoundsUserIds] = useState(null)
    let { db, loading } = useIndexedDB()


    let setSearchResultCallback = async (username) => {
        if (!username){
            setFoundsUserIds(null)
            return;
        }
        db && setFoundsUserIds(await searchUserIdsByUsername(db, username))
    }

    return <Form onSubmit={(e) => {
        e.preventDefault()
    }}>
        <FormControl type="text" onChange={(e) => { setSearchResultCallback(e.currentTarget.value) }} />
        <Button type="submit" variant="success">Add</Button>
        {foundUserIds && <ListGroup>
            {foundUserIds.map((user_id) => <UserSearchResult key={user_id} onUserSelect={(user_id) => {
                selectUserCallback(user_id)
            }} indexed_db={db} user_id={user_id} />)}
        </ListGroup>}
    </Form>

}
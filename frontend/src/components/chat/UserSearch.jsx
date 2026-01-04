import { useState } from "react";
import { Button, Image, Form, FormControl, ListGroup, ListGroupItem } from "react-bootstrap";
import { searchUserIdsByUsername } from "../../utils/RequestUtils";
import { useUserInfo } from "../../hooks/useUserInfo";
import "../../css/chats.scss"


function UserSearchResult({  user_id, onUserSelect }) {
    let {user_info,profileURL}= useUserInfo( user_id)

    return <ListGroupItem key={user_id} onClick={(e) => { onUserSelect(user_id) }}>
        {profileURL && <Image className="border msg-profile-image " src={profileURL} roundedCircle />}
        <span>{user_info && user_info.username}</span>
    </ListGroupItem>
}

export default function UserSearch({ selectUserCallback }) {

    let [foundUserIds, setFoundsUserIds] = useState(null)


    let setSearchResultCallback = async (username) => {
        if (!username){
            setFoundsUserIds(null)
            return;
        }
        setFoundsUserIds(await searchUserIdsByUsername( username))
    }

    return <Form onSubmit={(e) => {
        e.preventDefault()
    }}>
        <FormControl type="text" onChange={(e) => { setSearchResultCallback(e.currentTarget.value) }} />
        {foundUserIds && <ListGroup>
            {foundUserIds.map((user_id) => <UserSearchResult key={user_id} onUserSelect={(user_id) => {
                selectUserCallback(user_id)
            }}  user_id={user_id} />)}
        </ListGroup>}
    </Form>

}
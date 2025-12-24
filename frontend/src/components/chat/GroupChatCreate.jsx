import { useContext, useEffect, useState } from "react";
import { v4 } from "uuid"
import { Button, Image,Form,Stack, CloseButton, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import { user_id_context } from "../../globals";
import { create_chat_object, store_chat, } from "../../utils/StorageUtils";
import { createChat, uploadFile } from "../../utils/RequestUtils";
import { FileInfo, MessageFile } from "../../utils/protocol/messages";
import "../../css/global.scss"
import "../../css/chats.scss"
import useDBContext from "../../context/useDBContext";


export default function GroupChatCreate({show, onChatCreate, onClose}) {

    let [user_id, set_user_id] = useContext(user_id_context)
    let { db, loading } = useDBContext()

    let [group_name, set_group_name] = useState("")
    let [group_image, set_group_image] = useState(undefined)

    let [group_image_blob_url, set_group_image_blob_url] = useState("")

    useEffect(() => {

        if (group_image) {
            set_group_image_blob_url(URL.createObjectURL(group_image))
        }


        return () => {
            if (group_image_blob_url)
                URL.revokeObjectURL(group_image_blob_url)
        }
    }, [group_image])

    async function submitGroup(group_name, group_image_file) {
        // add to local db with the only user being 

        // upload group image if any
        if (group_image_file) {
            let image_file_protobuf = MessageFile.fromObject(group_image_file)
            let id = await uploadFile(MessageFile.encode(image_file_protobuf).finish())
            group_image_file = {  fileId: id, fileIv: new Uint8Array(12) }
        }

        let chat_object = await create_chat_object(v4(), group_name, "GROUP", [user_id], group_image_file, user_id)
        await store_chat(db, chat_object)
        return  chat_object
    }

    return <Modal show={show}  >
        <ModalHeader><ModalTitle>Create new group chat</ModalTitle></ModalHeader>
        <ModalBody >
            <Stack>
                {group_image_blob_url && <Image width={300} height={300} src={group_image_blob_url} />}
                <FormLabel className="group-icon-upload" htmlFor="chat-upload-pic">Upload Icon<Image src="/chat-profile-input.svg" />{group_image ? group_image.name :""}</FormLabel>
                <FormControl className="disappear" id="chat-upload-pic" type="file" onChange={(e) => {
                    if (e.target.files)
                        set_group_image(e.target.files[0])
                }} />
                <FormLabel htmlFor="group-name" >Group Name</FormLabel>
                <FormControl id="group-name" type="text" value={group_name} onChange={(e) => { set_group_name(e.currentTarget.value) }} />
            </Stack>
        </ModalBody>
        <ModalFooter>
            <Button variant="success" onClick={(e) => {
                let reader = new FileReader()
                if (group_image) {
                    reader.onloadend = () => {
                        let data = new Uint8Array(reader.result)
                        let mimeType = group_image.mimeType
                        let fileName = group_image.name
                        submitGroup(group_name, { data, mimeType, fileName }).then((chat) => { onChatCreate(chat) })
                    }
                    reader.readAsArrayBuffer(group_image)
                } else {
                    submitGroup(group_name, undefined).then((chat) => { onChatCreate(chat) })
                }
            }}>Save</Button>
            <CloseButton variant="danger" onClick={(e) => onClose()}/>
        </ModalFooter>
    </Modal>

}
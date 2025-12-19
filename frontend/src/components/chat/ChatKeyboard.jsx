import { useState } from "react"
import { Image, Form, Button, FormControl, Stack, FormLabel } from "react-bootstrap"
import "../../css/chats.scss"

function ChatKeyboard({ chat_id, onMessageSend }) {

    let [message, setMessage] = useState("")
    let [file, setFile] = useState(undefined)

    return <Form className={"position-sticky start-0 w-100 bottom-0"} onSubmit={async (e) => {
        e.preventDefault();

        async function submitMessage(file_js_obj = undefined) {
            onMessageSend(chat_id, message, file_js_obj)
            setMessage("")
            setFile(undefined)
        }
        if (file) {
            let reader = new FileReader();
            reader.onloadend = async (e) => {
                let file_obj = { data: new Uint8Array(reader.result), mimeType: file.type, fileName: file.name }

                document.getElementById("input-file-chat").value = null
                await submitMessage(file_obj)
            }
            reader.readAsArrayBuffer(file)
        } else {
            await submitMessage()
        }

    }}>
        <Stack gap={2} direction="horizontal">
            <Button type="submit"> &gt; </Button>
            <FormLabel htmlFor="input-file-chat" className="chat-file-upload">
                <Image src="/file-input-svg.svg" />
            </FormLabel>
            <FormControl type="file" id="input-file-chat" onChange={(e) => {
                if (e.target.files) {
                    setFile(e.target.files[0])
                }
            }} />
            <Button onClick={(e) => { document.getElementById("input-file-chat").value = null }} >Clear file input</Button>

            <FormControl type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </Stack>
    </Form>
}


export default ChatKeyboard 
import { useState } from "react"
import { Container, Form, Button, FormControl, Stack } from "react-bootstrap"
import { uploadFile } from "../../utils/RequestUtils"

function ChatKeyboard({chat_id, onMessageSend }) {

    let [message, setMessage] = useState("")
    let [file, setFile] = useState(undefined)
    let [file_js_obj ,set_file_js_obj] = useState(undefined)

    return <Form className={"position-sticky start-0 w-100 bottom-0"} onSubmit={async (e) => {
        e.preventDefault();
        if (message) {

            async function submitMessage() {
                onMessageSend(chat_id,message, file_js_obj)
                setMessage("")
                setFile(undefined)
            }
            if (file) {
                let reader = new FileReader();
                reader.onloadend = async (e) => {
                    set_file_js_obj( { data: new Uint8Array(reader.result), mimeType: file.type })
                    await submitMessage()
                }
                reader.readAsArrayBuffer(file)


            } else {
                await submitMessage()

            }
        }

    }}>
        <Stack gap={2} direction="horizontal">
            <Button type="submit"> &gt; </Button>
            <FormControl type="file" onChange={(e) => {
                if (e.target.files) {
                    setFile(e.target.files[0])
                }
            }} />

            <FormControl type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </Stack>
    </Form>
}


export default ChatKeyboard 
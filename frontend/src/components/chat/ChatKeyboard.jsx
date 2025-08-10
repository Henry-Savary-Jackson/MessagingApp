import { useState } from "react"
import { Container, Form, Button, FormControl, Stack } from "react-bootstrap"
import { uploadFile } from "../../utils/RequestUtils"

function ChatKeyboard({ onMessageSend }) {

    let [message, setMessage] = useState("")
    let [file, setFile] = useState(undefined)


    return <Form className={"position-sticky start-0 w-100 bottom-0"} onSubmit={async (e) => {
        e.preventDefault();
        if (message) {
            let file_data = undefined;
            let file_id = undefined
            async function submitMessage() {
                onMessageSend(message, file_id)
                setMessage("")
            }
            if (file) {
                let reader = new FileReader();
                reader.onloadend = async (e) => {
                    file_data = { datab64: reader.result.slice(reader.result.indexOf("base64,") + 7), mimeType: file.type }
                    console.log("uploading file")
                    file_id = await uploadFile(file_data)
                    console.log("uploaded file")
                    await submitMessage()
                }
                reader.readAsDataURL(file)


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
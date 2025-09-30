import { useState } from "react"
import { Form, Button, FormControl, Stack } from "react-bootstrap"

function ChatKeyboard({chat_id, onMessageSend }) {

    let [message, setMessage] = useState("")
    let [file, setFile] = useState(undefined)

    return <Form className={"position-sticky start-0 w-100 bottom-0"} onSubmit={async (e) => {
        e.preventDefault();
        if (message) {

            async function submitMessage(file_js_obj=undefined) {
                onMessageSend(chat_id,message, file_js_obj)
                setMessage("")
                setFile(undefined)
            }
            if (file) {
                let reader = new FileReader();
                reader.onloadend = async (e) => {
                    let file_obj = { data: new Uint8Array(reader.result), mimetype: file.type }

                    document.getElementById("input-file").value =null 
                    await submitMessage(file_obj)
                }
                reader.readAsArrayBuffer(file)
            } else {
                await submitMessage()
            }
        }

    }}>
        <Stack gap={2} direction="horizontal">
            <Button type="submit"> &gt; </Button>
            <FormControl type="file" id="input-file" onChange={(e) => {
                if (e.target.files) {
                    setFile(e.target.files[0])
                }
            }} />
            <Button onClick={(e)=>{document.getElementById("input-file").value  = null}} >Clear file input</Button>

            <FormControl type="text"  value={message} onChange={(e) => setMessage(e.target.value)} />
        </Stack>
    </Form>
}


export default ChatKeyboard 
import { useState, useEffect } from "react"
import { Button,Image, ProgressBar, Stack } from "react-bootstrap"
import { exportDBToJSON } from "../../utils/StorageUtils"

export default function DBExport({ onDone}){

    let [file_blob , set_file_blob ] = useState(null)
    let [progress, setProgess] = useState(null)

    let file_blob_url = file_blob ? URL.createObjectURL(file_blob) : ""

    useEffect(()=>{
        return ()=>{file_blob_url&& URL.revokeObjectURL(file_blob_url)}
    },[])

    function onProgressEvent(ev){
        setProgess(ev.done?null :ev.completeRows*100/ev.totalRows)
    }

    return <Stack className="justify-content-center align-items-center">
        {progress === null && <Button onClick={async ()=>{
            set_file_blob(await exportDBToJSON(onProgressEvent))
            onDone()
        }}  variant="primary" >Download DB</Button>}
        {file_blob_url && <Button  download={"export.json"} href={file_blob_url} ><Image className="download-file-icon" src="/download-file-icon.svg" />Download</Button>}
       { progress!== null && <ProgressBar now={progress}  />}

    </Stack>

    

}
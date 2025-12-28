import { useState, useEffect } from "react"
import { Button, Form,FormControl, ProgressBar, Stack } from "react-bootstrap"
import { exportDBToJSON, importDBFromJSON } from "../../utils/StorageUtils"
import "../../css/global.scss"

export default function DBImport({ onDone }) {

    let [progress, setProgess] = useState(null)

    function onProgressEvent(ev) {
        setProgess(ev.done ? null : ev.completeRows * 100 / ev.totalRows)
    }

    return <Stack className=" justify-content-center align-items-center">
        {progress === null && <Button onClick={() => {
            document.getElementById("import-inp").click()
        }} variant="primary" >Import</Button>}
        <FormControl type="file" id="import-inp" className="disappear" onChange={async (e) => {
            if (e.target.value) {
                let file = e.target.files[0]
                try {
                    await importDBFromJSON(file, onProgressEvent)
                    onDone()
                } catch (e) {
                    alert("Failed to import!")
                    console.log(e)
                }
            }
        }} />
        {progress !== null && <ProgressBar now={progress} />}

    </Stack>



}
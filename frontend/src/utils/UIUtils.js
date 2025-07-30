


export async function performActionWithAlert(action){
    try {
    return await action()
    } catch(e){
        window.alert(`${e.code} : ${e.message}`)
    }
}
export function handleAxiosError(error: any) {
    if (error.response) {
        console.error(error.response.data)
        console.error(error.response.status)
        console.error(error.response.headers)
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request)
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message)
    }
    console.error(error.config)
}

import { Server } from 'socket.io'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

// const model = 'text-ada-001'
const model = 'text-davinci-003'

const SocketHandler = (req: any, res: any) => {
    if (res.socket?.server.io) {
        console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const io = new Server(res.socket.server)
        res.socket.server.io = io
        io.on('connection', (socket: any) => {
            console.log('Socket connected')
            const openai = new OpenAIApi(configuration)
            socket.on('query-input-change', (msg: string) => {
                console.log('Message: ' + msg)
            })
            let previousMessage = ''
            socket.on('query-submit', async (msg: string) => {
                console.log('Message-query: ' + msg)
                try {
                    const response = await openai.createCompletion({
                        model,
                        prompt: msg,
                        temperature: 0.1,
                        max_tokens: 120,
                        top_p: 1,
                        frequency_penalty: 0.5,
                        presence_penalty: 0,
                    })
                    let answer: string = response.data.choices[0].text!
                    console.log('Message-response: ', answer)
                    answer = answer.replace('\n\n', '\n')
                    previousMessage = answer
                    socket.emit('openai-response', answer)
                } catch (error: any) {
                    console.error('openai error')
                    if (error.response) {
                        console.log(error.response.status)
                        console.log(error.response.data)
                    } else {
                        console.log(error.message)
                    }
                }
            })
            socket.on('query-submit-continue', async () => {
                try {
                    const response = await openai.createCompletion({
                        model,
                        prompt: previousMessage,
                        temperature: 0.1,
                        max_tokens: 120,
                        top_p: 1,
                        frequency_penalty: 0.5,
                        presence_penalty: 0,
                    })
                    let answer: string = response.data.choices[0].text!
                    console.log('Message-response: ', answer)
                    answer = answer.replace('\n\n', '\n')
                    previousMessage = answer
                    socket.emit('openai-response', answer)
                } catch (error: any) {
                    console.error('openai error')
                    if (error.response) {
                        console.log(error.response.status)
                        console.log(error.response.data)
                    } else {
                        console.log(error.message)
                    }
                }

            })
        })
    }
    res.end()
}

export default SocketHandler

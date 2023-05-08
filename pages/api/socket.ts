import {Server} from 'socket.io'
import {Configuration, OpenAIApi} from 'openai'
import axios from 'axios'
import {ClientToServerEvents, ServerToClientEvents} from '../../types/socket'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

// const model = 'text-ada-001'
const model = 'gpt-3.5-turbo'
const prompt = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever.`

const SocketHandler = (req: any, res: any) => {
    if (res.socket?.server.io) {
        console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server)
        res.socket.server.io = io
        io.on('connection', (socket: any) => {
            console.log('Socket connected')
            const openai = new OpenAIApi(configuration)
            socket.on('query-input-change', async (data: { msg: string, transaction: number }) => {
                const ac = await axios.get('https://ac.duckduckgo.com/ac/?q=' + data.msg)
                socket.emit('ac', {items: ac.data.map((item: any) => item.phrase), transaction: data.transaction})
            })
            let previousMessage = ''
            let previewsToken = ''
            socket.on('query-submit', async (data: { query: string, transactionToken: string }) => {
                console.log('query-submit', data.query)
                if (data.transactionToken !== previewsToken) {
                    previewsToken = data.transactionToken
                } else {
                    return
                }
                try {
                    const response = await openai.createChatCompletion({
                        model,
                        messages: [{role: 'system', content: prompt}, {role: 'user', content: data.query}],
                        temperature: 0.7,
                        max_tokens: 256,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                    })
                    let answer: string = response.data.choices[0].message!.content!
                    console.log('answer', answer)
                    answer = answer.replace('\n\n', '\n')
                    previousMessage = answer
                    socket.emit('openai-response', previousMessage)
                } catch (error: any) {
                    console.error('openai error')
                    if (error.response) {
                        console.error(error.response.status)
                        console.error(error.response.data)
                    } else {
                        error.error(error.message)
                    }
                    socket.emit('openai-fail')
                }
            })
            socket.on('query-submit-continue', async () => {
                try {
                    const response = await openai.createChatCompletion({
                        model,
                        messages: [{role: 'system', content: prompt}, {role: 'user', content: previousMessage}],
                        temperature: 0.7,
                        max_tokens: 256,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                    })
                    let answer: string = response.data.choices[0].message!.content!
                    answer = answer.replace('\n\n', '\n')
                    previousMessage += answer
                    socket.emit('openai-response', previousMessage)
                } catch (error: any) {
                    console.error('openai error')
                    if (error.response) {
                        console.error(error.response.status)
                        console.error(error.response.data)
                    } else {
                        console.error(error.message)
                    }
                }

            })
        })
    }
    res.end()
}

export default SocketHandler

import { Server } from 'socket.io'
import { Configuration, OpenAIApi } from 'openai'
import axios from 'axios'
import { ClientToServerEvents, ServerToClientEvents } from '../../types/socket'

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
        const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server)
        res.socket.server.io = io
        io.on('connection', (socket: any) => {
            console.log('Socket connected')
            const openai = new OpenAIApi(configuration)
            socket.on('query-input-change', async (data: { msg: string, transaction: number }) => {
                const ac = await axios.get('https://ac.duckduckgo.com/ac/?q=' + data.msg)
                socket.emit('ac', { items: ac.data.map((item: any) => item.phrase), transaction: data.transaction })
            })
            let previousMessage = ''
            socket.on('query-submit', async (msg: string) => {
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
                    answer = answer.replace('\n\n', '\n')
                    previousMessage = msg + answer
                    socket.emit('openai-response', previousMessage)
                } catch (error: any) {
                    console.error('openai error')
                    if (error.response) {
                        console.error(error.response.status)
                        console.error(error.response.data)
                    } else {
                        error.error(error.message)
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
/*

import { ChatGPTAPI, getOpenAIAuth } from 'chatgpt'

async function example() {
    console.log('ChatGPT example')
    // use puppeteer to bypass cloudflare (headful because of captchas)
    const openAIAuth = await getOpenAIAuth({
        email: process.env.OPENAI_EMAIL,
        password: process.env.OPENAI_PASSWORD
    })
    console.log('openAIAuth', openAIAuth)

    const api = new ChatGPTAPI({ ...openAIAuth })
    await api.initSession()

    // send a message and wait for the response
    const result = await api.sendMessage('Write a python version of bubble sort.')

    // result.response is a markdown-formatted string
    console.log(result.response)
}

example()
*/

export default SocketHandler

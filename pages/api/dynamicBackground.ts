import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

class DynamicBackground {
    lastImageData: string = ''

    constructor() {
        this.init().catch(e => console.error(e))
    }

    async init() {
        console.log('DynamicBackground init')
        await this.loadNewImage()
        const now = new Date()
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
        const timeToTomorrow = tomorrow.getTime() - now.getTime()
        setInterval(() => {
            this.loadNewImage().catch(e => console.error(e))
        }, 1000 * 60 * 60 * 24)
    }

    async loadNewImage() {
        const result = await axios.get('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=fr-FR')
        const imageUrl = 'https://www.bing.com' + result.data.images[0].url
        const result2 = await axios.get(imageUrl, { responseType: 'arraybuffer' })
        const image = Buffer.from(result2.data, 'binary').toString('base64')
        this.lastImageData = `data:${ result2.headers['content-type'] };base64,${ image }`
        console.log('New image loaded', imageUrl)
    }

    getBackground = () => {
        return this.lastImageData
    }
}

const dynamiqueBackground = new DynamicBackground()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ img: string }>
) {
    res.status(200).json({ img: dynamiqueBackground.getBackground() })
}

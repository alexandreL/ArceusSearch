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
        }, timeToTomorrow)
    }

    async loadNewImage() {
        const result = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: process.env.UNSPLASH_ACCESS_KEY,
                orientation: 'landscape',
                topics: 'nature,landscape,city,travel,food,architecture,technology,science,interiors,wallpaper,background,arts-culture,people,street-photography',
            },
            headers: { 'Accept-Encoding': 'gzip,deflate,compress' },

        })
        const imageUrl = result.data.urls.full
        const result2 = await axios.get(imageUrl, { responseType: 'arraybuffer' })
        const image = Buffer.from(result2.data, 'binary').toString('base64')
        this.lastImageData = `data:${ result2.headers['content-type'] };base64,${ image }`
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

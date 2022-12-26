import axios from 'axios'

class DynamiqueBackground {
    lastImage: string = ''

    constructor() {
        this.init().catch(e => console.error(e))
    }

    async init() {
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
        this.lastImage = 'https://www.bing.com' + result.data.images[0].url
        console.log('New image: ' + this.lastImage)
    }

    getBackground = () => {
        console.log('Get background: ' + this.lastImage)
        return this.lastImage
    }
}

const dynamiqueBackground = new DynamiqueBackground()
export default dynamiqueBackground

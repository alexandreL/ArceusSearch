import Head from 'next/head'
import { useEffect, useState } from 'react'
import SearchInput from '../components/elements/searchInput'
import _axios from 'axios'
import { useRouter } from 'next/router'

const axios = _axios.create({})

let intervalId: NodeJS.Timeout

function Home() {
    const router = useRouter()
    const [ query, setQuery ] = useState('')
    const [ backgroundUrl, setBackgroundUrl ] = useState('')
    let [ currentTime, changeTime ] = useState('00:00')

    useEffect(() => {
        if (intervalId) clearInterval(intervalId)

        function checkTime() {
            const time = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
            if (time !== currentTime)
                changeTime(time)
        }

        if (currentTime === '00:00') checkTime()

        intervalId = setInterval(checkTime, 1000)
    }, [ currentTime ])

    useEffect(() => {
        console.log('useEffect main')
        if (backgroundUrl === '')
            axios.get('/api/dynamicBackground').then(res => {
                console.log('reload background')
                setBackgroundUrl(res.data.img)
            })
    }, [ backgroundUrl ])

    const launchSearch = (q: string) => {
        console.log('launchSearch', q)
        // go to the search page
        router.push(`/search?q=${ q }`)
    }

    return (
        <>
            <Head>
                <title>Arceus search</title>
                <meta name="description" content="new way to search"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className="">
                <style jsx>{`
                  .hours {
                    --value: ${parseInt(currentTime.split(':')[0])};
                  }
                    .minutes {
                    --value: ${parseInt(currentTime.split(':')[1])};
                    }
                `}</style>
                <div className="grid content-center bg-cover min-h-screen"
                     style={ { backgroundImage: `url(${ backgroundUrl })` } }>
                    <div className="">
                        <div className="grid grid-cols-6 gap-4">
                            <div className=" col-start-2 col-span-4 ">
                                <div className="text-center">
                                    <span className=" text-9xl text-white font-mono font-bold countdown"
                                          style={ { textShadow: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)' } }>
                                        <span className="hours"></span>:
                                        <span className="minutes"></span>
                                    </span>
                                </div>
                                <div className="divider"></div>
                                <SearchInput query={ query } launchSearch={ launchSearch }/>
                                {/*<button className="btn" onClick={ handleClick }>Go</button>*/ }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )

}

export default Home

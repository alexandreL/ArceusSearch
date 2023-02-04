import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import SearchInput from '../components/elements/searchInput'
import _axios from 'axios'
import { useRouter } from 'next/router'

const axios = _axios.create({})

const coolDown = 500
let timeout: NodeJS.Timeout
let socket: Socket<any>


function Home() {
    const [ query, setQuery ] = useState('')
    const [ backgroundUrl, setBackgroundUrl ] = useState('')
    const router = useRouter()


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
                <div className="grid content-center bg-cover min-h-screen"
                     style={ { backgroundImage: `url(${ backgroundUrl })` } }>
                    <div className="">
                        <div className="grid grid-cols-6 gap-4">
                            <div className=" col-start-2 col-span-4 ">
                                <p className={ 'text-center text-9xl text-white font-bold' }
                                   style={ { textShadow: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)' } }>19:11</p>
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

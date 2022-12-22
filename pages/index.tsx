import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Calculator from '../components/elements/calcule'
import Result, { ResultProps } from '../components/elements/result'
import { io, Socket } from 'socket.io-client'

const coolDown = 500
let lastCall = 0
let timeout: NodeJS.Timeout

export default function Home() {
    const router = useRouter()
    let socket: Socket<any>
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ results, setResults ] = useState<Array<ResultProps>>([])

    const getResults = async () => {
        if (query && query.length > 0) {
            fetch('/api/search?query=' + query).then(res => res.json()).then(data => {
                setResults(data)
            }).catch(err => console.error(err))
        }
    }

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
        })
    }

    useEffect(() => {
        socketInitializer().catch(e => console.error(e))
        getResults().catch(e => console.error(e))
    }, [])


    useEffect(() => {
        getResults().catch(e => console.error(e))
    }, [ router.query.q ])

    // coolDown wait for the user to stop typing
    const handleSearchDebounced = (query: string) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            router.push(`/?q=${ query }`)
        }, coolDown)
    }

    const handleKeyPress = (e: any) => {
        setQuery(e.target.value)
        socket?.emit('query', e.target.value)
        handleSearchDebounced(e.target.value)
        if (e.key === 'Enter') { // todo ======================== marche pas
            console.log('enter press here! ')
            if (query && query.length > 0) {
                if (query == e.target.value)
                    return getResults().catch(e => console.error(e))
                router.push(`/?q=${ query }`)
            } else {
                // rest all page
            }
        }
    }

    return (
        <>
            <Head>
                <title>Arceus search</title>
                <meta name="description" content="new way to search"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className="drawer-content">
                <div className="hero text-neutral-content bg-neutral">
                    <div className="text-center">
                        <div className="hero-content mx-auto md:max-w-full">
                            <input autoFocus name="search" type="text" placeholder="Search" className="input input-bordered w-full max-w-xl"
                                   value={ query } onInput={ handleKeyPress }/>

                            {/*<button className="btn" onClick={ handleClick }>Go</button>*/ }
                            <Calculator query={ query }/></div>
                    </div>
                </div>
                <div className="flex w-full grid-flow-row-dense pt-1">
                    <div className="flex-grow pl-1">
                        { results.map((item, index) => {
                            return (
                                <Result key={ index }
                                        title={ item.title }
                                        description={ item.description }
                                        url={ item.url }
                                        displayUrl={ item.displayUrl }/>
                            )
                        }) }

                    </div>
                    <div className="divider divider-horizontal"></div>
                    <div className="flex-grow ">
                        <Result key={ 1 }
                                title={ 'No data' }
                                description={ '' }
                                url={ '' }
                                displayUrl={ '' }/>
                    </div>
                </div>
            </main>
        </>
    )
}

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Calculator from '../components/elements/calcule'
import Result, { ResultProps } from '../components/elements/result'
import { io, Socket } from 'socket.io-client'
import useDebounce from '../components/utils/debouce'

const coolDown = 500
let timeout: NodeJS.Timeout

export interface HomeProps {
    results: ResultProps[]
}

function Home(props: HomeProps) {
    const router = useRouter()
    let socket: Socket<any>
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ results, setResults ] = useState<Array<ResultProps>>(props.results || [])
    const debouncedSearch = useDebounce(query, 500)

    const getResults = () => {
        if (query && query.length > 0) {
            fetch('/api/search?query=' + query).then(res => res.json()).then(data => {
                setResults(data)
            }).catch(err => console.error(err))
        }
    }

    useEffect(() => {
        if (debouncedSearch) {
            getResults()
        }
    }, [ debouncedSearch ])

    {
        const socketInitializer = async () => {
            await fetch('/api/socket')
            socket = io()

            socket.on('connect', () => {
            })
        }

        useEffect(() => {
            socketInitializer().catch(e => console.error(e))
        }, [])
    }

    const handleInput = (e: any) => {
        setQuery(e.target.value)
        socket?.emit('query', e.target.value)
        if (e.key === 'Enter') { // todo ======================== marche pas
            /*
                        console.log('enter press here! ')
                        if (query && query.length > 0) {
                            if (query == e.target.value)
                                return getResults().catch(e => console.error(e))
                            router.push(`/?q=${ query }`)
                        } else {
                            // rest all page
                        }
            */
        }
    }

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            console.log('enter press here! ')
            if (query && query.length > 0) {
                if (query == e.target.value)
                    return getResults()
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
                                   value={ query } onInput={ handleInput } onKeyDown={ handleKeyDown }/>

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

Home.getInitialProps = async (context: any) => {
    if (context.query?.q) {
        const res = await fetch(`http://localhost:3000/api/search?query=XX${ context.query.q }`)
        const data = await res.json()
        if (!data) {
            return {}
        }
        return {
            results: data
        }
    } else {
        return {}
    }
}

export default Home

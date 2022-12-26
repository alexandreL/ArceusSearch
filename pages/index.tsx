import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { SearchResults, SearchDetail, SocialDetail } from '../types/SearchResults'
import SocialResult from '../components/elements/socialResult'
import SearchResult from '../components/elements/searchResult'
import SearchInput from '../components/elements/searchInput'
import Calculator from '../components/elements/calcule'
import dynamiqueBackground from '../components/elements/dynamiqueBackground'

const coolDown = 500
let timeout: NodeJS.Timeout
let socket: Socket<any>

export interface HomeProps {
    results: SearchResults
}


function Home(props: HomeProps) {
    const router = useRouter()
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ answer, setAnswer ] = useState('')
    const [ lastQuery, setLastQuery ] = useState(query)
    const [ searchResult, setSearchResult ] = useState<Array<SearchDetail>>(props.results?.search || [])
    const [ socialResult, setSocialResult ] = useState<Array<SocialDetail>>(props.results?.social || [])
    // const debouncedSearch = useDebounce(query, 500)
    const [ isLoaded, setIsLoaded ] = useState(false)
    const [ hasCalculation, setHasCalculation ] = useState(false)

    const continueSearch = () => {
        socket.emit('query-submit-continue', query)
    }

    const getResults = () => {
        if (query && query.length > 0 && query !== lastQuery && !hasCalculation) {
            setIsLoaded(true)
            setLastQuery(query)
            setAnswer('')
            setSearchResult([])
            setSocialResult([])
            socket?.emit('query-submit', query)
            fetch('/api/search?query=' + query).then(res => res.json()).then(data => {
                setSearchResult(data.search)
                setSocialResult(data.social)
                router.push('/?q=' + query, undefined, { shallow: true })
                setIsLoaded(false)
            }).catch(err => console.error(err))
        }
    }

    /*
        useEffect(() => {
            if (debouncedSearch) {
                getResults()
            }
        }, [ debouncedSearch ])
    */

    {
        const socketInitializer = async () => {
            if (socket) return
            await fetch('/api/socket')
            socket = io()

            socket.on('connect', () => {
            })
            socket.on('openai-response', (data: string) => {
                setAnswer(data)
            })
        }

        useEffect(() => {
            socketInitializer().catch(e => console.error(e))
        }, [])
    }

    const handleInput = (e: any) => {
        setQuery(e.target.value)
        socket?.emit('query-input-change', e.target.value)
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

    if ((query && query.length > 0) && !hasCalculation && lastQuery != '') {
        return (
            <>
                <Head>
                    <title>Arceus search</title>
                    <meta name="description" content="new way to search"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className="">
                    <SearchInput query={ query } handleInput={ handleInput } handleKeyDown={ handleKeyDown }
                                 hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }/>
                    { isLoaded && <progress className="progress progress-primary"></progress> }
                    <div className="min-h-12 card bg-neutral-focus m-4">
                        <div className="card-body">
                            <h2 className="card-title">gpt answer</h2>
                            <p className="card-text whitespace-pre-wrap">{ answer }</p>
                            {/*    button to continue*/ }
                            <button className="btn btn-primary" onClick={ () => continueSearch() }>Continue</button>
                        </div>

                    </div>
                    <div className="flex flex-col w-full lg:flex-row pt-2">
                        <div className="flex-initial lg:w-1/2 md:w-full">
                            <h2 className="text-2xl font-bold pl-2">Search results</h2>
                            { searchResult.map((item, index) => {
                                return (
                                    <SearchResult key={ index }
                                                  data={ item }/>
                                )
                            }) }

                        </div>
                        <div className="divider divider-horizontal"></div>
                        <div className="flex-initial lg:w-1/2 md:w-full">
                            <div className={ 'flex flex-col w-full lg:flex-row ' }>
                                <div className={ 'flex-initial lg:w-1/2 md:w-full ' }>
                                    <h2 className="text-2xl font-bold pl-2">Actuality results</h2>
                                </div>
                                <div className="divider divider-horizontal"></div>
                                <div className={ 'flex-initial lg:w-1/2 md:w-full' }>
                                    <h2 className="text-2xl font-bold pl-2">Twitter results</h2>
                                    { socialResult.map((item, index) => {
                                        return (<SocialResult key={ index } data={ item }/>)
                                    }) }
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        )
    } else {
        return (
            <>
                <Head>
                    <title>Arceus search</title>
                    <meta name="description" content="new way to search"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className="">
                    <div className="grid content-center bg-cover min-h-screen" style={ { backgroundImage: `url(${ dynamiqueBackground.getBackground() })` } }>
                        <div className="">
                            <div className="grid grid-cols-6 gap-4">
                                <div className=" col-start-2 col-span-4 ">
                                    <input autoFocus name="search" type="text" placeholder="Search"
                                           className="input input-bordered w-full my-2 shadow-md text-xl"
                                           value={ query } onInput={ handleInput } onKeyDown={ handleKeyDown }/>
                                    {/*<button className="btn" onClick={ handleClick }>Go</button>*/ }
                                </div>
                                <div className={ 'justify-self-start flex' }>
                                    <Calculator query={ query } hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }/>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        )
    }
}

Home.getInitialProps = async (context: any) => {
    if (context.query?.q) {
        const res = await fetch(`http://localhost:3000/api/search?query=${ context.query.q }`)
        const data = await res.json()
        if (!data) {
            return {}
        }
        return {
            results: data
        }
    } else {
        return {
            results: null
        }
    }
}

export default Home

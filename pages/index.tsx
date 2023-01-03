import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { SearchResults, SearchDetail, SocialDetail, ActualityDetail, Suggestion } from '../types/SearchResults'
import SocialResult from '../components/elements/socialResult'
import SearchResult from '../components/elements/searchResult'
import SearchInput from '../components/elements/searchInput'
import Calculator from '../components/elements/calcule'
import _axios from 'axios'
import ActualityResult from '../components/elements/actualityResult'

const axios = _axios.create({})

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
    const [ tmpQuery, setTmpQuery ] = useState(query)
    const [ searchResult, setSearchResult ] = useState<Array<SearchDetail>>(props.results?.search || [])
    const [ socialResult, setSocialResult ] = useState<Array<SocialDetail>>(props.results?.social || [])
    const [ actualityResult, setActualityResult ] = useState<Array<ActualityDetail>>(props.results?.actuality || [])
    const [ backgroundUrl, setBackgroundUrl ] = useState('')
    const [ autoSuggest, setAutoSuggest ] = useState<Suggestion[]>([])
    // const debouncedSearch = useDebounce(query, 500)
    const [ isLoaded, setIsLoaded ] = useState(false)
    const [ hasCalculation, setHasCalculation ] = useState(false)

    const continueSearch = () => {
        socket.emit('query-submit-continue', query)
    }

    const getResults = () => {
        if (query && query !== lastQuery && !hasCalculation) {
            setIsLoaded(true)
            setLastQuery(query)
            setAnswer('')
            setSearchResult([])
            setSocialResult([])
            setActualityResult([])
            socket?.emit('query-submit', query)
            fetch('/api/search?query=' + query).then(res => res.json()).then(data => {
                setSearchResult(data.search)
                setSocialResult(data.social)
                setActualityResult(data.actuality)
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
            socket.on('ac', (data: string[]) => {
                setAutoSuggest(data.map((item: string, index: number) => ({ id: index, name: item })))
            })
        }

        useEffect(() => {
            console.log('useEffect main')
            socketInitializer().catch(e => console.error(e))
            if (backgroundUrl === '')
                axios.get('/api/dynamicBackground').then(res => {
                    setBackgroundUrl(res.data.img)
                })
        }, [])
    }

    const handleInput = (e: any) => {
        let value: string
        if (typeof e === 'string')
            value = e
        else
            value = e.target.value
        if (query !== value) {
            console.log('save query')
            setQuery(value)
            socket?.emit('query-input-change', value)
        } else {
            console.log('search query')
            return launchSearch(value)
        }
    }

    const launchSearch = (q: string) => {
        console.log('launchSearch')
        console.log(q)
        if (query && query.length > 0) {
            return getResults()
        } else {
            setLastQuery(query)
            setAnswer('')
            setSearchResult([])
            setSocialResult([])
            setActualityResult([])
            router.push('/?q=' + query, undefined, { shallow: true })
        }
    }

    if (lastQuery.length > 0) {
        return (
            <>
                <Head>
                    <title>Arceus search</title>
                    <meta name="description" content="new way to search"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className="">
                    <div className="grid grid-cols-6 gap-4 gap-y-4 bg-neutral">
                        <SearchInput query={ query } handleInput={ handleInput }
                                     launchSearch={ launchSearch }
                                     hasCalculation={ hasCalculation }
                                     setHasCalculation={ setHasCalculation }
                                     setQuery={ setQuery }
                                     autoSuggest={ autoSuggest }/>
                    </div>
                    { isLoaded && <progress className="progress progress-primary"></progress> }
                    { answer && <div className="min-h-12 card bg-neutral m-4">
                        <div className="card-body">
                            <h2 className="card-title">gpt answer</h2>
                            <p className={ 'card-text whitespace-pre-wrap' }>{ answer }</p>
                            <div className={ 'card-actions justify-start ' }>
                                <button className={ 'btn btn-primary ' } onClick={ () => continueSearch() }>Continue</button>
                            </div>
                        </div>
                    </div>
                    }
                    <div className="flex flex-col w-full lg:flex-row pt-6">
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
                                <div className={ 'flex flex-col lg:w-1/2 md:w-full space-y-2' }>
                                    <h2 className="text-2xl font-bold pl-2">Actuality results</h2>
                                    { actualityResult.map((item, index) => {
                                        return (<ActualityResult key={ index } data={ item }/>)
                                    }) }
                                </div>
                                <div className="divider divider-horizontal"></div>
                                <div className={ 'flex flex-col lg:w-1/2 md:w-full space-y-2 ' }>
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
                    <div className="grid content-center bg-cover min-h-screen"
                         style={ { backgroundImage: `url(${ backgroundUrl })` } }>
                        <div className="">
                            <div className="grid grid-cols-6 gap-4">
                                <div className=" col-start-2 col-span-4 ">
                                    <p className={ 'text-center text-9xl text-white font-bold' }
                                       style={ { textShadow: '1px 1px 3px rgb(0 0 0 / 29%), 2px 4px 7px rgb(73 64 125 / 35%)' } }>19:11</p>
                                    <div className="divider"></div>
                                    <SearchInput query={ query } handleInput={ handleInput } launchSearch={ launchSearch }
                                                 hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }
                                                 setQuery={ setQuery } autoSuggest={ autoSuggest }/>
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
        const res = await fetch(`http://localhost:2222/api/search?query=${ context.query.q }`)
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

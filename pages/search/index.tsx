import Head from 'next/head'
import SearchInput from '../../components/elements/searchInput'
import SearchResult from '../../components/elements/searchResult'
import ActualityResult from '../../components/elements/actualityResult'
import SocialResult from '../../components/elements/socialResult'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { SearchResults, SearchDetail, SocialDetail, ActualityDetail } from '../../types/SearchResults'
import { NextPageContext } from 'next'
import { server_url } from '../../utils/config'
import { io, Socket } from 'socket.io-client'

export interface SearchPageProps {
    results: SearchResults
}

let socket: Socket<any>

function SearchPage(props: SearchPageProps) {
    const router = useRouter()
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ answer, setAnswer ] = useState('')
    const [ lastQuery, setLastQuery ] = useState(query)
    const [ searchResult, setSearchResult ] = useState<Array<SearchDetail>>(props.results?.search || [])
    const [ socialResult, setSocialResult ] = useState<Array<SocialDetail>>(props.results?.social || [])
    const [ actualityResult, setActualityResult ] = useState<Array<ActualityDetail>>(props.results?.actuality || [])

    const [ isLoaded, setIsLoaded ] = useState(false)
    console.log('query', query)
    console.log('lastQuery', lastQuery)

    // gpt
    const continueSearch = () => {
        socket.emit('query-submit-continue', query)
    }

    const getResults = () => {
        if (query && query !== lastQuery) {
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
                router.push('/search?q=' + query, undefined, { shallow: true })
                setIsLoaded(false)
            }).catch(err => console.error(err))
        } else {
            if (!query) console.log('no query')
            if (query === lastQuery) console.log('same query')
        }
    }


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
        console.log('useEffect index')
        socketInitializer().catch(e => console.error(e))
    }, [])

    useEffect(() => {
        console.log('useEffect query')
        getResults()
    }, [ query ])

    const launchSearch = (q: string) => {
        console.log('launchSearch')
        console.log(q)
        setQuery(q)
    }

    return (<>
            <Head>
                <title>Arceus search</title>
                <meta name="description" content="new way to search"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className="">
                <div className="grid grid-cols-6 gap-4 gap-y-4 bg-neutral">
                    <SearchInput query={ query } launchSearch={ launchSearch }/>
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
}

SearchPage.getInitialProps = async (context: NextPageContext) => {
    if (context.query?.q) {
        const res = await fetch(`${ server_url }/api/search?query=${ context.query.q }`)
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

export default SearchPage

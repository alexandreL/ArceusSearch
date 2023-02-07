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
import DynamicHeader from '../../components/elements/dynamicHeader'

export interface SearchPageProps {
    results: SearchResults
}

let socket: Socket<any>

function SearchPage(props: SearchPageProps) {
    const router = useRouter()
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ lastQuery, setLastQuery ] = useState(query)
    const [ searchResult, setSearchResult ] = useState<Array<SearchDetail>>(props.results?.search || [])
    const [ socialResult, setSocialResult ] = useState<Array<SocialDetail>>(props.results?.social || [])
    const [ actualityResult, setActualityResult ] = useState<Array<ActualityDetail>>(props.results?.actuality || [])

    const [ gptAnswer, setGptAnswer ] = useState('')
    const [ wikiAnswer, setWikiAnswer ] = useState(props.results?.wiki || null)
    const [ mathAnswer, setMathAnswer ] = useState(props.results?.math || null)
    const [ images, setImages ] = useState(props.results?.images || [])

    const [ isLoaded, setIsLoaded ] = useState(false)
    console.log('query', query)
    console.log('lastQuery', lastQuery)

    // gpt
    const continueSearch = () => {
        socket.emit('query-submit-continue', query)
    }

    const socketInitializer = async () => {
        if (socket) return
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            socket?.emit('query-submit', query)
        })
        socket.on('openai-response', (data: string) => {
            setGptAnswer(data)
        })
    }

    useEffect(() => {
        socketInitializer().catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (isLoaded) return
        if (query && query !== lastQuery) {
            console.log('getResults')
            setIsLoaded(true)
            setLastQuery(query)
            setGptAnswer('')
            setSearchResult([])
            setSocialResult([])
            setActualityResult([])
            setWikiAnswer(null)
            setMathAnswer(null)
            setImages([])
            socket?.emit('query-submit', query)
            fetch('/api/search?query=' + query).then(res => res.json()).then((data: SearchResults) => {
                setSearchResult(data.search)
                setSocialResult(data.social)
                setActualityResult(data.actuality)
                console.log(data.wiki)
                if (data.wiki) setWikiAnswer(data.wiki)
                if (data.math) setMathAnswer(data.math)
                if (data.images) setImages(data.images)
                router.push('/search?q=' + query, undefined, { shallow: true })
                setIsLoaded(false)
            }).catch(err => console.error(err))
        } else {
            if (!query) console.log('no query')
            if (query === lastQuery) console.log('same query')
            if (socket) { // first load page most of the time
                console.log('ask gpt')
                socket?.emit('query-submit', query)
            }
        }
    }, [ query, router ])

    const launchSearch = (q: string) => {
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
                <DynamicHeader gptAnswer={ gptAnswer } wikiAnswer={ wikiAnswer } mathAnswer={ mathAnswer } images={ images } continueSearch={ continueSearch }/>
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

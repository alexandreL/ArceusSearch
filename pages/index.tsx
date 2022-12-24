import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Calculator from '../components/elements/calcule'
import { io, Socket } from 'socket.io-client'
import { SearchResults, SearchDetail, SocialDetail } from '../types/SearchResults'
import SocialResult from '../components/elements/socialResult'
import SearchResult from '../components/elements/searchResult'

const coolDown = 500
let timeout: NodeJS.Timeout

export interface HomeProps {
    results: SearchResults
}

function Home(props: HomeProps) {
    const router = useRouter()
    let socket: Socket<any>
    let { q } = router.query
    if (Array.isArray(q)) q = q[0]
    const [ query, setQuery ] = useState(q || '')
    const [ lastQuery, setLastQuery ] = useState(query)
    const [ searchResult, setSearchResult ] = useState<Array<SearchDetail>>(props.results?.search || [])
    const [ socialResult, setSocialResult ] = useState<Array<SocialDetail>>(props.results?.social || [])
    // const debouncedSearch = useDebounce(query, 500)
    const [ isLoaded, setIsLoaded ] = useState(false)
    const [ hasCalculation, setHasCalculation ] = useState(false)

    const getResults = () => {
        if (query && query.length > 0 && query !== lastQuery && !hasCalculation) {
            setIsLoaded(true)
            setLastQuery(query)
            setSearchResult([])
            setSocialResult([])
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
            <main className="">
                <div className="grid grid-cols-6 gap-4 gap-y-4 bg-neutral">
                    <div className=" col-start-2 col-span-4 ">
                        <input autoFocus name="search" type="text" placeholder="Search" className="input input-bordered w-full my-2"
                               value={ query } onInput={ handleInput } onKeyDown={ handleKeyDown }/>
                        {/*<button className="btn" onClick={ handleClick }>Go</button>*/ }
                    </div>
                    <div className={ 'justify-self-start flex' }>
                        <Calculator query={ query } hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }/>
                    </div>
                </div>
                { isLoaded && <progress className="progress progress-primary"></progress> }
                <div className="flex flex-col w-full lg:flex-row pt-2">
                    <div className="grid gap-2 flex-initial lg:w-1/2 md:w-full">
                        { searchResult.map((item, index) => {
                            return (
                                <SearchResult key={ index }
                                              title={ item.title }
                                              description={ item.description }
                                              url={ item.url }
                                              displayUrl={ item.displayUrl }/>
                            )
                        }) }

                    </div>
                    <div className="divider divider-horizontal"></div>
                    <div className="flex-initial gap-2 w-1/2">
                        { socialResult.map((item, index) => {
                            return (<SocialResult key={ index } data={ item }/>)
                        }) }

                    </div>
                </div>
            </main>
        </>
    )
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
        return {}
    }
}

export default Home

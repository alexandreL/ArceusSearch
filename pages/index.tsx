import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Calculator from '../component/calcule'
import Result, { ResultProps } from '../component/result'

const data: Array<ResultProps> = [ {
    title: 'google',
    description: 'djkbfasfbsdj',
    url: 'http://google.com',
}, {
    title: 'bing',
    description: 'djkbfasfbsdj',
    url: 'http://bing.com',
}, {
    title: 'yahoo',
    description: 'djkbfasfbsdj',
    url: 'http://yahoo.com',
}, {
    title: 'duckduckgo',
    description: 'djkbfasfbsdj',
    url: 'http://duckduckgo.com',
}, {
    title: 'yandex',
    description: 'djkbfasfbsdj',
    url: 'http://yandex.com',
}, {
    title: 'baidu',
    description: 'djkbfasfbsdj',
    url: 'http://baidu.com',
}
]

export default function Home() {
    const router = useRouter()
    const [ query, setQuery ] = useState()

    // if input clic enter send to search page
    const handleKeyPress = (e: any) => {
        setQuery(e.target.value)
        if (e.key === 'Enter') {
            router.push(`/search?q=${ query }`)
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
                <div className="flex w-full">
                    <div className="grid flex-grow">
                        <Result key={ -1 } title={ "ca" } description={ "asdsa" } url={ 'sadf' }/>
                        { data.map((item, index) => {
                            return (
                                <Result key={ index } title={ item.title } description={ item.description } url={ item.url }/>
                            )
                        }) }

                    </div>
                    <div className="divider divider-horizontal"></div>
                    <div className="grid flex-grow">
                        { data.map((item, index) => {
                            return (
                                <Result key={ index } title={ item.title } description={ item.description } url={ item.url }/>
                            )
                        }) }
                    </div>
                </div>
            </main>
        </>
    )
}

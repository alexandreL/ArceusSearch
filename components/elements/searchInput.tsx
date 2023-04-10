import { useState, useEffect } from 'react'
import { Suggestion } from '../../types/SearchResults'
// @ts-ignore
import daisyuiColors from 'daisyui/src/colors'
import { Socket, io } from 'socket.io-client'
import { Combobox } from '@headlessui/react'


export interface SearchInputProps {
    query: string
    launchSearch: (e: any) => void
}

let socket: Socket<any>


export default function SearchInput(props: SearchInputProps) {
    const { query, launchSearch } = props
    const [ autoSuggest, setAutoSuggest ] = useState<Suggestion[]>([])
    const [ lastQuery, setLastQuery ] = useState('')

    const handleOnSearch = (q: string, results: Array<Suggestion>) => {

        if (q == lastQuery && q.length > 1) {
            return launchSearch(q)
        }

        if (q.length > 2) {
            if (socket.active) {
                socket.emit('query-input-change', q)
            }
        }
        setLastQuery(q)
    }

    const handleOnHover = (result: Suggestion) => {
    }

    const handleOnSelect = (item: Suggestion) => {
    }

    const formatResult = (item: Suggestion) => {
        return (
            <>
                <span id={ item.id.toString() } style={ { display: 'block', textAlign: 'left' } }>{ item.name }</span>
            </>
        )
    }

    const socketInitializer = async () => {
        if (socket) return
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected input')
        })

        socket.on('ac', (data: string[]) => {
            setAutoSuggest(data.map((item: string, index: number) => ({ id: index, name: item })))
        })
    }

    useEffect(() => {
        socketInitializer().catch(e => console.error(e))
    }, [])

    return <>
        <div className=" col-start-2 col-span-4 my-2">
            <Combobox<Suggestion>
                items={ autoSuggest }
                onSearch={ handleOnSearch }
                onHover={ handleOnHover }
                onSelect={ handleOnSelect }
                inputSearchString={ query }
                formatResult={ formatResult }
                styling={ {
                    zIndex: 3,
                    backgroundColor: daisyuiColors['base-100'],
                    color: daisyuiColors['base-content'],
                    placeholderColor: daisyuiColors['base-content'],
                    hoverBackgroundColor: daisyuiColors['neutral-focus'],
                } } // To display it on top of the search box below
            />
        </div>
    </>
}

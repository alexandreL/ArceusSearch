import { useEffect, useState } from 'react'
import { Suggestion } from '../../types/SearchResults'
// @ts-ignore
import daisyuiColors from 'daisyui/src/colors'
import { socket } from '../utils/socket'
import { Combobox } from '@headlessui/react'


export interface SearchInputProps {
    query: string
    launchSearch: (e: any) => void
}

export default function SearchInput(props: SearchInputProps) {
    const { query, launchSearch } = props
    const [ autoSuggest, setAutoSuggest ] = useState<Suggestion[]>([])
    const [ lastQuery, setLastQuery ] = useState(query)
    const [ lastTransaction, setLastTransaction ] = useState<number>(0)

    const handleOnChange = (q: string) => {
        if (q.length > 2) {
            if (socket.active) {
                const newTransaction = lastTransaction + 1
                setLastTransaction(newTransaction)
                socket.emit('query-input-change', { msg: q, transaction: newTransaction })
            }
        } else {
            setAutoSuggest([])
        }
        setLastQuery(q)
    }

    const handleOnAutoSuggest = (data: { items: string[], transaction: number }) => {
        if (lastTransaction == data.transaction)
            setAutoSuggest(data.items.map((item: string, index: number) => ({ id: index, name: item })))
    }


    useEffect(() => {
        if (!socket || !socket.connected) {
            return
        }
        socket.on('connect', () => {
            console.log('connected input')
        })

        socket.on('ac', handleOnAutoSuggest)

        return () => {
            socket.off('ac', handleOnAutoSuggest)
        }
    }, [ lastTransaction ])

    const handleOnBase = (q: string) => {
        return launchSearch(q)
    }

    return <>
        <div className=" col-start-2 col-span-4 my-2">
            <Combobox
                onChange={ handleOnBase }
            >
                <Combobox.Input
                    className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    placeholder="Search"
                    value={ lastQuery }
                    onChange={ (event) => handleOnChange(event.target.value) }
                />
                <Combobox.Options>
                    { lastQuery.length > 0 && (
                        <Combobox.Option
                            key={ -1 }
                            value={ lastQuery }
                        >
                            { ({ active }) => (
                                <div
                                    className={ `${ active ? 'text-white bg-indigo-600' : 'text-gray-900' } cursor-default select-none relative py-2 pl-3 pr-9` }
                                >
                                    <div>
                                        <span>
                                            { lastQuery }
                                        </span>
                                    </div>
                                </div>
                            ) }
                        </Combobox.Option>
                    ) }
                    { autoSuggest.map((item, index) => (
                        <Combobox.Option
                            key={ index }
                            value={ item.name }
                        >
                            { ({ active }) => (
                                <div
                                    className={ `${ active ? 'text-white bg-indigo-600' : 'text-gray-900' } cursor-default select-none relative py-2 pl-3 pr-9` }
                                >
                                    <div>
                                        <span>
                                            { item.name }
                                        </span>
                                    </div>

                                </div>
                            ) }
                        </Combobox.Option>
                    )) }
                </Combobox.Options>

            </Combobox>
        </div>
    </>
}

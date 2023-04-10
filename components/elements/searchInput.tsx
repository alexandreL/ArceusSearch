import { useEffect, useState } from 'react'
import { Suggestion } from '../../types/SearchResults'
// @ts-ignore
import daisyuiColors from 'daisyui/src/colors'
import { socket } from '../utils/socket'
import { Combobox } from '@headlessui/react'
import { trim } from 'lodash'


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

    const acOption = (key: number, name: string) => {
        return <Combobox.Option
            key={ key }
            value={ name }
        >
            { ({ active, selected }) => {
                return <div
                    className={ `${ active ? 'bg-primary-focus' : '' } ${ selected ? 'bg-neutral-focus' : '' } cursor-default select-none relative py-2 pl-3 pr-9` }
                >
                    <div>

                        <span>
                            { name }
                        </span>
                        { selected ? (
                            <span
                                className={ `font-medium text-primary pl-1` }
                                aria-hidden="true"
                            >
                                &#10003;
                            </span>
                        ) : null }
                    </div>
                </div>
            } }
        </Combobox.Option>
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

    useEffect(() => {
        setLastQuery(query)
    }, [ query ])

    const handleOnBase = (q: string) => {
        return launchSearch(q)
    }

    return <>
        <div className=" col-start-2 col-span-4 my-2 ">
            <Combobox
                onChange={ handleOnBase }
            >
                <Combobox.Input
                    className="input input-bordered input-primary w-full rounded-full"
                    placeholder="Search"
                    value={ lastQuery }
                    onChange={ (event) => handleOnChange(event.target.value) }
                />
                <Combobox.Options
                    className=" absolute z-50 max-w-2xl dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    { lastQuery.length > 0 && !autoSuggest.find(i => trim(i.name) == trim(lastQuery)) && (
                        acOption(0, lastQuery)
                    ) }
                    { autoSuggest.map((item, index) => (
                        acOption(index + 1, item.name)
                    )) }
                </Combobox.Options>

            </Combobox>
        </div>
    </>
}

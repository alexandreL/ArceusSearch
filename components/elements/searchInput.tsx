import Calculator from './calcule'
import { useState } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { Suggestion } from '../../types/SearchResults'
// @ts-ignore
import daisyuiColors from 'daisyui/src/colors'


export interface SearchInputProps {
    query: string
    handleInput: (e: any) => void
    launchSearch: (e: any) => void
    hasCalculation: boolean
    setHasCalculation: (value: (((prevState: boolean) => boolean) | boolean)) => void
    setQuery: (value: (((prevState: string) => string) | string)) => void
    autoSuggest: Suggestion[]
}

export default function SearchInput(props: SearchInputProps) {
    const { query, handleInput, launchSearch, hasCalculation, setHasCalculation, autoSuggest, setQuery } = props
    const [ isFocused, setIsFocused ] = useState(false)
    const [ selected, setSelected ] = useState(0)

    const handleOnSearch = (q: string, results: Array<Suggestion>) => {
        handleInput(q)
        console.log(q, results)
    }

    const handleOnHover = (result: Suggestion) => {
        console.log('handleOnHover')
    }

    const handleOnSelect = (item: Suggestion) => {
        console.log('handleOnSelect')
    }

    const handleOnFocus = () => {
    }

    const formatResult = (item: Suggestion) => {
        return (
            <>
                <span style={ { display: 'block', textAlign: 'left' } }>{ item.name }</span>
            </>
        )
    }

    return <>
        <div className=" col-start-2 col-span-4 my-2">
            <ReactSearchAutocomplete<Suggestion>
                items={ autoSuggest }
                onSearch={ handleOnSearch }
                onHover={ handleOnHover }
                onSelect={ handleOnSelect }
                onFocus={ handleOnFocus }
                autoFocus
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
        <div className={ 'justify-self-start flex' }>
            <Calculator query={ query } hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }/>
        </div>
    </>
}

import Calculator from './calcule'

export interface SearchInputProps {
    query: string
    handleInput: (e: any) => void
    handleKeyDown: (e: any) => void
    hasCalculation: boolean
    setHasCalculation: (value: (((prevState: boolean) => boolean) | boolean)) => void
}

export default function SearchInput(props: SearchInputProps) {
    const { query, handleInput, handleKeyDown, hasCalculation, setHasCalculation } = props
    return <div className="grid grid-cols-6 gap-4 gap-y-4 bg-neutral">
        <div className=" col-start-2 col-span-4 ">
            <input autoFocus name="search" type="text" placeholder="Search" className="input input-bordered w-full my-2"
                   value={ query } onInput={ handleInput } onKeyDown={ handleKeyDown }/>
            {/*<button className="btn" onClick={ handleClick }>Go</button>*/ }
        </div>
        <div className={ 'justify-self-start flex' }>
            <Calculator query={ query } hasCalculation={ hasCalculation } setHasCalculation={ setHasCalculation }/>
        </div>
    </div>
}

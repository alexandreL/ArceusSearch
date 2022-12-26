import { useState, useEffect } from 'react'

interface ICalculeProps {
    query?: string
    setHasCalculation: (hasCalculation: boolean) => void
    hasCalculation: boolean
}


export default function Calculator(props: ICalculeProps) {
    const [ precision, setPrecision ] = useState(Math.pow(10, 15))
    const [ result, setResult ] = useState('')
    const [ query, setQuery ] = useState(props.query)

    function calculator(q: string): string {
        if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
            const result = eval(q)
            props.setHasCalculation(true)
            return (Math.round(result * precision) / precision).toString(10)
        }
        throw new Error('Invalid calculation')
    }

    function processQuery(q?: string): string {
        props.setHasCalculation(false)
        if (!q) return ''
        try {
            return calculator(q)
        } catch (_) {
            // do nothing
        }
        return ''
    }

    useEffect(() => {
        setQuery(props.query)
        setResult(processQuery(props.query))
    }, [ props ])

    if (props.hasCalculation) {
        return (
            <div className="hero bg-neutral rounded-full px-4">
                <p >= { result }</p>
            </div>
        )
    } else {
        return (<> </>)
    }
}

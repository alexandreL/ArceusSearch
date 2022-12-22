import { useState, useEffect } from 'react'

interface ICalculeProps {
    query?: string
}


export default function Calculator(props: ICalculeProps) {
    const [ hasCalculation, setHasCalculation ] = useState(false)
    const [ precision, setPrecision ] = useState(Math.pow(10, 15))
    const [ result, setResult ] = useState('')
    const [ query, setQuery ] = useState(props.query)

    function calculator(q: string): string {
        setHasCalculation(false)
        if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
            const result = eval(q)
            setHasCalculation(true)
            return (Math.round(result * precision) / precision).toString(10)
        }
        throw new Error('Invalid calculation')
    }

    function processQuery(q?: string): string {
        setHasCalculation(false)
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
        console.log('query', props.query)
    }, [ props ])

    if (hasCalculation) {
        return (
            <div className="hero">
                <p >= { result }</p>
            </div>
        )
    } else {
        return (<> </>)
    }
}

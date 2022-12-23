import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Search(query: string) {
    const { data, error, isLoading } = useSWR('/api/search?query=' + query, fetcher)

    return {
        result: data,
        isLoading,
        isError: error
    }
}

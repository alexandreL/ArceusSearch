// show a result of a search

export interface ResultProps {
    title: string
    description?: string
    url: string
    thumbnail?: string
}

function goToUrl(url: string) {
    window.open(url, '_blank')
}

export default function Result(data: ResultProps) {
    return (
        <div className="card w-auto shadow-xl">
            <div className="card-body" onClick={ () => goToUrl(data.url) }>
                <h2 className="card-title">{ data.title }</h2>
                <p className="card-text">{ data.description }</p>
            </div>
        </div>
    )
}

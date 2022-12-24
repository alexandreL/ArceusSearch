import { SearchDetail } from '../../types/SearchResults'

export default function SearchResult(data: SearchDetail) {
    return (
        <a className="card shadow-md hover:shadow-neutral" href={ data.url }>
            <div className="card-body">
                <h2 className="card-title text-primary">{ data.title }</h2>
                <div className="link link-accent">{ data.displayUrl }</div>
                <p className="card-text">{ data.description }</p>
            </div>
        </a>
    )
}

import { SearchDetail } from '../../types/SearchResults'

export default function SearchResult(props: { data: SearchDetail }) {
    const data = props.data
    return (
        <a className="card shadow-md hover:shadow-neutral" href={ data.url }>
            <div className="card-body">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <img className={ `rounded-full w-8 h-8 ${ data.thumbnail ? '' : 'hidden' }` } src={ data.thumbnail } alt=""/>
                        <div className="ml-2">
                            <h2 className="card-title text-primary">{ data.title }</h2>
                            <div className="link link-accent">{ data.displayUrl }</div>
                        </div>
                    </div>
                </div>
                <p className="card-text">{ data.description }</p>
            </div>
        </a>
    )
}

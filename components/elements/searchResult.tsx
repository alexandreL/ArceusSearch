import { SearchDetail } from '../../types/SearchResults'

export default function SearchResult(props: { data: SearchDetail }) {
    const data = props.data
    return (
        <div className="card shadow-md hover:shadow-neutral">
            <div className="card-body">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <img className={ `rounded-full w-8 h-8 ${ data.thumbnail ? '' : 'hidden' }` }
                             src={ data.thumbnail } alt=""/>
                        <div className="ml-2">
                            <h2 className="card-title text-primary"><a href={ data.url }>{ data.title }</a></h2>
                            <div className="link link-accent text-xs"><a href={ data.url }>{ data.displayUrl }</a></div>
                        </div>
                    </div>
                </div>
                <p className="card-text text-sm">{ data.description }</p>
            </div>
        </div>
    )
}

import { ActualityDetail } from '../../types/SearchResults'

export default function ActualityResult(props: { data: ActualityDetail }) {
    const data = props.data
    return (
        <div className="card shadow-md hover:shadow-neutral">
            <figure className="card-image">
                <img src={ data.thumbnail } alt={ data.title }/>
            </figure>
            <div className="card-body">
                <h2 className="card-title"><a href={ data.url }>{ data.title }</a></h2>
                <p className="card-subtitle link-accent text-xs">
                    <a href={ data.url }>{ data.source }</a>  - { data.date }
                </p>
                <p className="card-text text-sm">{ data.description }</p>
            </div>
        </div>
    )
}

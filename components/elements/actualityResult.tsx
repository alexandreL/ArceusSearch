import { ActualityDetail } from '../../types/SearchResults'

export default function ActualityResult(props: { data: ActualityDetail }) {
    const data = props.data
    return (
        <a className="card shadow-md hover:shadow-neutral" href={ data.url }>
            <figure className="card-image">
                <img src={ data.thumbnail } alt={ data.title }/>
            </figure>
            <div className="card-body">
                <h2 className="card-title">{ data.title }</h2>
                <p className="card-subtitle link-accent">
                    { data.source } - { data.date }
                </p>
                <p className="card-text">{ data.description }</p>
            </div>
        </a>
    )
}

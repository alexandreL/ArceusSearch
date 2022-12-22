// show a result of a search

import router from 'next/router'

export interface ResultProps {
    title: string
    description?: string
    url: string
    displayUrl?: string
    thumbnail?: string
}

export default function Result(data: ResultProps) {
    return (
        <a className="card shadow-md hover:shadow-neutral mb-2 " href={ data.url }>
            <div className="card-body">
                <h2 className="card-title text-primary-content">{ data.title }</h2>
                <div className="link link-accent">{ data.displayUrl }</div>
                <p className="card-text">{ data.description }</p>
            </div>
        </a>
    )
}

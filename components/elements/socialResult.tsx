import { SocialDetail } from '../../types/SearchResults'
import Image from 'next/image'
import moment from 'moment'
import 'moment/locale/fr'  // without this line it didn't work
moment.locale('fr')


export default function SocialResult(props: { data: SocialDetail }) {
    const data = props.data

    return (
        <a className="card shadow-md hover:shadow-neutral" href={ data.url }>
            <div className="card-body">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <img className="rounded-full w-8 h-8" src={ data.user.profileImageUrl } alt=""/>
                        <div className="ml-2">
                            <h2 className="card-title">{ data.user.name }</h2>
                            <div className="link link-accent">@{ data.user.screenName }</div>
                        </div>
                    </div>
                    <div className="link link-accent">{ moment(data.date).fromNow() }</div>
                </div>
                <p className="card-text">{ data.content }</p>
            </div>
        </a>
    )
}

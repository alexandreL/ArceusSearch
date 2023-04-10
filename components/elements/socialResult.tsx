import { SocialDetail } from '../../types/SearchResults'
import moment from 'moment'
import 'moment/locale/fr' // without this line it didn't work
moment.locale('fr')


export default function SocialResult(props: { data: SocialDetail }) {
    const data = props.data

    return (
        <div className="card shadow-md hover:shadow-neutral">
            <div className="card-body">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <img className="rounded-full w-8 h-8" src={ data.user.profileImageUrl } alt=""/>
                        <div className="ml-2">
                            <h2 className="card-title">{ data.user.name }</h2>
                            <div className="link link-accent text-sm">@{ data.user.screenName }</div>
                        </div>
                    </div>
                    <div className="link link-accent text-xs">{ moment(data.date).fromNow() }</div>
                </div>
                <p className="card-text text-sm">{ data.content }</p>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <a className="link link-accent" href={ data.url }> watch on Twitter </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

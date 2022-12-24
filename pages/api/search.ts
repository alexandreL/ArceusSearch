// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { load } from 'cheerio'
import { SearchDetail, SearchResults, SocialDetail } from '../../types/SearchResults'
import axios from 'axios'

const getGoogleOrganicData = async (query: string) => {
    console.log('getGoogleOrganicData', query)
    const result = await fetch(`https://www.google.com/search?q=${ query }&oq=${ query }&sourceid=chrome&ie=UTF-8`, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-full-version': '"108.0.5359.124"',
            'sec-ch-ua-full-version-list': '"Not?A_Brand";v="8.0.0.0", "Chromium";v="108.0.5359.124", "Google Chrome";v="108.0.5359.124"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Linux"',
            'sec-ch-ua-platform-version': '"6.0.12"',
            'sec-ch-ua-wow64': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
        },
        'referrerPolicy': 'strict-origin-when-cross-origin',
        'body': null,
        'method': 'GET'
    })
    const rowBody = await result.arrayBuffer()
    const decodedBody = new TextDecoder('iso-8859-1').decode(rowBody)
    let $ = load(decodedBody)

    const organicResults: Array<SearchDetail> = []

    const nodes = $('#main > div')
    for (let i = 0; i < nodes.length; i++) {
        const organicResult: SearchDetail = {
            title: '',
            url: '',
            description: '',
            displayUrl: ''
        }
        organicResult.title = $(nodes[i]).find('h3').text()
        organicResult.url = $(nodes[i]).find('a').attr('href') ?? ''
        organicResult.description = $(nodes[i]).find('div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)').text()
        organicResult.displayUrl = $(nodes[i]).find('div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)').text()
        if (organicResult.url !== '' && organicResult.title !== '') {
            organicResult.url = organicResult.url.replace('/url?q=', '')
            organicResults.push(organicResult)
        }
    }
    if (organicResults.length == 0) {
        console.error(decodedBody)
    }

    return organicResults
}

const twitterSample = {
    'data': [
        {
            'text': '6 innovations EnR à découvrir &amp; soutenir. Merci de votre curiosité\nsite : https://t.co/IdrtbHjtd9\n@chatton_isa\n@Chiara50903392\n@BenjaminMHughes\n@telexhauser\n@Whokilledbill3\n@dlb_max\n@mtprespire \n@anel_asso \n@LoigCG\n@Contrepoints\n@RaymondEleonor1\n@RegisIannone\n@laurossignol\n#elu https://t.co/02fUAHsbNw',
            'id': '1606281085901381632',
            'author_id': '3995548521',
            'created_at': '2022-12-23T13:30:28.000Z',
            'edit_history_tweet_ids': [
                '1606281085901381632'
            ],
            'attachments': {
                'media_keys': [
                    '3_1606281042536587265',
                    '3_1606281042943512576',
                    '3_1606281043291643904'
                ]
            }
        },
        {
            'text': 'RT @tweetbytheriver: \'Copy the river\nNo outcomes\nNo postcards\'\n\nShadows &amp; Reflections: Folklore Tapes\' David Chatton Barker shares notebook…',
            'id': '1606140533323112449',
            'author_id': '143465352',
            'created_at': '2022-12-23T04:11:58.000Z',
            'edit_history_tweet_ids': [
                '1606140533323112449'
            ]
        },
        {
            'text': 'Sam McLoughlin &amp; David Chatton Barker - Four https://t.co/d4unhN7VGf #NowPlaying #BBCRadio3',
            'id': '1606076133581152256',
            'author_id': '1343566466281574400',
            'created_at': '2022-12-22T23:56:04.000Z',
            'edit_history_tweet_ids': [
                '1606076133581152256'
            ]
        },
        {
            'text': '🔊 #NowPlaying on #BBCRadio3\'s #Unclassified\n\nSam McLoughlin &amp; David Chatton Barker:\n  🎵 Four\n\n#SamMcLoughlin #DavidChattonBarker',
            'id': '1606076072772132867',
            'author_id': '1016030984012288000',
            'created_at': '2022-12-22T23:55:49.000Z',
            'edit_history_tweet_ids': [
                '1606076072772132867'
            ]
        },
        {
            'text': '@_SeeDee benoit_chatton (oui c’est mon nom de famille)',
            'id': '1606064335528161281',
            'author_id': '1181158566041968640',
            'created_at': '2022-12-22T23:09:11.000Z',
            'edit_history_tweet_ids': [
                '1606064335528161281'
            ]
        },
        {
            'text': '@AngryShadowYT @zkikro Kong, Garp &amp; Sengoku are still capable fighters and then there are the top Vice Admirals who were Admiral candidates on top of that. Gion, Chatton &amp; Kurouma',
            'id': '1605893475358097416',
            'author_id': '1537024846584070144',
            'created_at': '2022-12-22T11:50:15.000Z',
            'edit_history_tweet_ids': [
                '1605893475358097416'
            ]
        },
        {
            'text': 'Kung ka chatton ka nako palihug ayaw padayuna',
            'id': '1605774384236351488',
            'author_id': '1434562970495827969',
            'created_at': '2022-12-22T03:57:01.000Z',
            'edit_history_tweet_ids': [
                '1605774384236351488'
            ]
        },
        {
            'text': '@Philipp90214640 @Chats_Pitres_66 @collectif_bois @PattesMauves @justineducern @brigitte_bardot @courbet_julien @HenryJeanServat Bonsoir, Vous avez raison réfléchir à deux fois avant d adopter, et quand on adopte autre qu un chatton, lui ou elle ont un vécu plus ou moins douloureux, amour assuré en retour nos amis à poils ne trichent jamais, vous êtes sont ange et il compte sur vous 💘',
            'id': '1605722882516156418',
            'author_id': '1239128366843863040',
            'created_at': '2022-12-22T00:32:22.000Z',
            'edit_history_tweet_ids': [
                '1605722882516156418'
            ]
        },
        {
            'text': 'RT @AnimalPlanet: Why do wrens sing so much?\n\nThey’re hoping to attract a mate! 🐦💕\n\n📸: Lawrence Chatton\n\n#Wildlife #Nature #NatureLovers #P…',
            'id': '1605636703858802688',
            'author_id': '1479499093672144901',
            'created_at': '2022-12-21T18:49:56.000Z',
            'edit_history_tweet_ids': [
                '1605636703858802688'
            ]
        },
        {
            'text': '@ryan_chatton Oh love you! Can’t wait!!! Xxx',
            'id': '1605582450918293505',
            'author_id': '1329439899431342085',
            'created_at': '2022-12-21T15:14:21.000Z',
            'edit_history_tweet_ids': [
                '1605582450918293505'
            ]
        }
    ],
    'includes': {
        'users': [
            {
                'id': '3995548521',
                'name': 'M S',
                'username': 'MWindtrap'
            },
            {
                'id': '143465352',
                'name': 'hiromi suzuki / 鈴木博美',
                'username': 'HRMsuzuki'
            },
            {
                'id': '1343566466281574400',
                'name': 'Radio3 whats-on bot',
                'username': 'bs_on3'
            },
            {
                'id': '1016030984012288000',
                'name': 'The pretty BBC Radio 3 🎶 #NowPlaying Bot',
                'username': 'BBC3MusicBot'
            },
            {
                'id': '1181158566041968640',
                'name': 'UnMecLambda',
                'username': 'BenoitChatton'
            },
            {
                'id': '1537024846584070144',
                'name': 'Typical Joe',
                'username': '3SkullJoe'
            },
            {
                'id': '1434562970495827969',
                'name': 'sikoo',
                'username': 'rezan_juntilla'
            },
            {
                'id': '1239128366843863040',
                'name': 'BLANDINIERES Henri',
                'username': 'henri1968'
            },
            {
                'id': '1479499093672144901',
                'name': 'Martin',
                'username': 'MartinRcr1086'
            },
            {
                'id': '1329439899431342085',
                'name': 'AnnaMelissaMcGowan',
                'username': 'AnnaMelissaMcG1'
            }
        ]
    },
    'meta': {
        'newest_id': '1606281085901381632',
        'oldest_id': '1605582450918293505',
        'result_count': 10,
        'next_token': 'b26v89c19zqg8o3fqk11ohijl0l6f59x2oetv05pfagl9'
    }
}

async function getTwitterData(query: string) {
    console.log('getTwitterData', query)
    try {
        const result = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            params: {
                query: query + ' -is:retweet',
                max_results: 10,
                expansions: 'author_id',
                'user.fields': 'name,profile_image_url',
                'tweet.fields': 'created_at,attachments',
            }, headers: {
                'authorization': `Bearer ${ process.env.TWITTER_BEARER_TOKEN }`
            }
        })
        const twitterResult: Array<SocialDetail> = []
        /*
                twitterResult.push({
                    content:  string,
                    date: string,
                    user: {
                        name: string,
                        screenName: string,
                        profileImageUrl: string
                    },
                    url: string,
                })
        */
        for (const tweet of result.data.data) {
            const user = result.data.includes.users.find((user: any) => user.id === tweet.author_id)
            twitterResult.push({
                content: tweet.text,
                date: tweet.created_at,
                user: {
                    name: user.name,
                    screenName: user.username,
                    profileImageUrl: user.profile_image_url
                },
                url: `https://twitter.com/${ user.username }/status/${ tweet.id }`
            })
        }

        return twitterResult
    } catch (e: any) {
        console.error('Error getTwitterData')
        if (e.response) {
            console.error(e.response.data)
            console.error(e.response.status)
            console.error(e.response.headers)
        } else if (e.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(e.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', e.message)
        }
        console.error(e.config)
        return []
    }


}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SearchResults>
) {
    let { query } = req.query
    if (Array.isArray(query)) {
        query = query[0]
    }
    if (typeof query !== 'string') {
        console.log('Query is not a string')
        return res.status(400).json({ search: [], social: [] })
    }
    try {
        const results: Array<Promise<Array<SearchDetail | SocialDetail>>> = [
            getGoogleOrganicData(query),
            getTwitterData(query),
        ]
        const rawResults = await Promise.all(results)
        const formattedResults = {
            search: rawResults[0] as Array<SearchDetail>,
            social: rawResults[1] as Array<SocialDetail>,
        }
        res.status(200).json(formattedResults)
    } catch (e) {
        console.error(e)
        res.status(500).json({ search: [], social: [] })
    }
}

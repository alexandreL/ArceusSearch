// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { load } from 'cheerio'
import { SearchDetail, SearchResults, SocialDetail } from '../../types/SearchResults'
import axios from 'axios'
import { handleAxiosError } from '../../components/utils/axios'

const getGoogleOrganicData = async (query: string) => {
    console.log('getGoogleOrganicData', query)

    try {
        const result = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
                q: query,
                num: 10,
                safe: 'off',
                fields: 'items(title,link,snippet,displayLink,pagemap(cse_image(src)))',
                c2coff: 1,
            }
        })
        const googleResult: Array<SearchDetail> = []
        for (const item of result.data.items) {
            if (item.pagemap?.cse_image?.length > 1) {
                console.log('cse_image', item.pagemap.cse_image)
            }
            googleResult.push({
                title: item.title,
                description: item.snippet,
                url: item.link,
                displayUrl: item.displayLink,
                thumbnail: item.pagemap?.cse_image?.[0]?.src
            })
        }
        return googleResult
    } catch (e) {
        console.error('Error getGoogleOrganicData')
        handleAxiosError(e)
        return []
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
        handleAxiosError(e)
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

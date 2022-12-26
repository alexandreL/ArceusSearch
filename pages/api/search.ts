// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { SearchDetail, SearchResults, SocialDetail, ActualityDetail } from '../../types/SearchResults'
import axios from 'axios'
import { handleAxiosError } from '../../components/utils/axios'
// @ts-ignore
import NEWSAPI from 'newsapi'
const newsapi = new NEWSAPI(process.env.NEWS_API_KEY)

const getNewsData = async (query: string) => {
    console.log('getNewsData', query)
    try {
        const result = await newsapi.v2.everything({
            q: query,
            pageSize: 10,
            sortBy: 'relevancy',
            page: 1
        })
        const newsResult: Array<ActualityDetail> = []
        for (const article of result.articles) {
            newsResult.push({
                title: article.title,
                description: article.description,
                url: article.url,
                thumbnail: article.urlToImage,
                source: article.source.name,
                date: article.publishedAt
            })
        }
        return newsResult
    } catch (e) {
        console.error('Error getNewsData')
        handleAxiosError(e)
        return []
    }
}

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
        if (result.data.data.length === 0) return []
        const twitterResult: Array<SocialDetail> = []
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
        // handleAxiosError(e)
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
        return res.status(400).json({ search: [], social: [], actuality: [] })
    }
    try {
        const results: Array<Promise<Array<SearchDetail | SocialDetail>>> = [
            getGoogleOrganicData(query),
            getTwitterData(query),
            getNewsData(query),
        ]
        const rawResults = await Promise.all(results)
        const formattedResults = {
            search: rawResults[0] as Array<SearchDetail>,
            social: rawResults[1] as Array<SocialDetail>,
            actuality: rawResults[2] as Array<ActualityDetail>,
        }
        res.status(200).json(formattedResults)
    } catch (e) {
        console.error(e)
        res.status(500).json({ search: [], social: [], actuality: [] })
    }
}

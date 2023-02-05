// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { SearchDetail, SearchResults, SocialDetail, ActualityDetail } from '../../types/SearchResults'
import axios from 'axios'
import memoize from 'timed-memoize'
import { handleAxiosError } from '../../components/utils/axios'
// @ts-ignore
import NEWSAPI from 'newsapi'

const newsapi = new NEWSAPI(process.env.NEWS_API_KEY)

const getNewsData = async (query: string) => {
    try {
        const results = await Promise.all([ newsapi.v2.everything({
            q: query,
            pageSize: 10,
            sortBy: 'publishedAt',
            page: 1,
            language: 'fr',
            searchIn: 'title,description',
        }), newsapi.v2.everything({
            q: query,
            pageSize: 10,
            sortBy: 'publishedAt',
            page: 1,
            language: 'en',
            searchIn: 'title,description',
        }) ])
        const [ frResult, enResult ] = results

        const newsResult: Array<ActualityDetail> = []
        for (const article of frResult.articles) {
            newsResult.push({
                title: article.title,
                description: article.description,
                url: article.url,
                thumbnail: article.urlToImage,
                source: article.source.name,
                date: article.publishedAt
            })
        }
        for (const article of enResult.articles) {
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

const getWikipediaData = async (query: string): Promise<SearchDetail | undefined> => {
    try {
        const result = await axios.get('https://fr.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                format: 'json',
                prop: 'extracts',
                titles: query,
                formatversion: 2,
                exchars: 256,
                explaintext: 1,
                exsectionformat: 'plain',
            }
        })

        if (result.data.query.pages[0].missing) {
            return
        }
        return {
            title: result.data.query.pages[0].title,
            description: result.data.query.pages[0].extract,
            url: `https://fr.wikipedia.org/wiki/${ encodeURIComponent(query) }`,
        }
    } catch (e) {
        console.error('Error getWikipediaData')
        handleAxiosError(e)
        return
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
                // fields: 'items(title,link,snippet,displayLink,pagemap(cse_image(src)))',
                c2coff: 1,
                gl: 'fr',
                hl: 'fr',
            }
        })
        const googleResult: Array<SearchDetail> = []
        for (const item of result.data.items) {
            // console.log('item', item.pagemap)
            if (item.pagemap?.cse_image?.length > 1) {
                // console.log('cse_image', item.pagemap.cse_image)
            }
            googleResult.push({
                title: item.title,
                description: item.snippet,
                url: item.link,
                displayUrl: item.formattedUrl,
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

const getGoogleImagesData = async (query: string) => {
    console.log('getGoogleImagesData', query)

    try {
        const result = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
                q: query,
                num: 10,
                safe: 'off',
                searchType: 'image',
                gl: 'fr',
                hl: 'fr',
            }
        })
        const googleResult: Array<SearchDetail> = []
        console.log(result.data.items)
        for (const item of result.data.items) {
            googleResult.push({
                title: item.title,
                description: item.snippet,
                url: item.link,
                displayUrl: item.formattedUrl,
                thumbnail: item.image.thumbnailLink
            })
        }
        return googleResult
    } catch (e) {
        console.error('Error getGoogleImagesData')
        handleAxiosError(e)
        return []
    }
}

async function getTwitterData(query: string) {
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
        console.error('Error getTwitterData', e)
        return []
    }
}

const memoizedGetGoogleOrganicData = memoize(getGoogleOrganicData, { timeout: 1000 * 60 * 60 * 12 }) // 12 hours
const memoizedGetGoogleImagesData = memoize(getGoogleImagesData, { timeout: 1000 * 60 * 60 * 12 }) // 12 hours
const memoizedGetTwitterData = memoize(getTwitterData, { timeout: 1000 * 60 }) // 1 minute
const memoizedGetNewsData = memoize(getNewsData, { timeout: 1000 * 60 * 60 }) // 1 hour
const memoizedGetWikipediaData = memoize(getWikipediaData, { timeout: 1000 * 60 * 60 * 24 }) // 24 hours

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
        return res.status(400).json({ search: [], social: [], actuality: [], images: [] })
    }
    try {
        const results: Array<Promise<Array<SearchDetail | SocialDetail> | SearchDetail | undefined>> = [
            memoizedGetGoogleOrganicData(query),
            memoizedGetTwitterData(query),
            memoizedGetNewsData(query),
            memoizedGetWikipediaData(query),
            memoizedGetGoogleImagesData(query)
        ]
        const rawResults = await Promise.all(results)
        const formattedResults: SearchResults = {
            search: rawResults[0] as Array<SearchDetail>,
            social: rawResults[1] as Array<SocialDetail>,
            actuality: rawResults[2] as Array<ActualityDetail>,
            wiki: rawResults[3] as SearchDetail,
            images: rawResults[4] as Array<SearchDetail>
        }
        res.status(200).json(formattedResults)
    } catch (e) {
        console.error(e)
        res.status(500).json({ search: [], social: [], actuality: [], images: [] })
    }
}

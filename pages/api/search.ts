// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ResultProps } from '../../components/elements/result'
import { load } from 'cheerio'

const getOrganicData = async (query: string) => {
    console.log('getOrganicData', query)
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

    const organicResults: Array<ResultProps> = []

    const nodes = $('#main > div')
    for (let i = 0; i < nodes.length; i++) {
        const organicResult: ResultProps = {
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Array<ResultProps>>
) {
    let { query } = req.query
    if (Array.isArray(query)) {
        query = query[0]
    }
    if (typeof query !== 'string') {
        console.log('Query is not a string')
        return res.status(400).json([])
    }
    try {
        res.status(200).json(await getOrganicData(query))
    } catch (e) {
        console.error(e)
        res.status(500).json([])
    }
}

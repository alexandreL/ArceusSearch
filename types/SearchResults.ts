export interface SearchDetail {
    title: string
    description?: string
    url: string
    displayUrl?: string
    thumbnail?: string
}

export interface ActualityDetail {
    title: string
    description?: string
    url: string
    thumbnail?: string
    source?: string
    date?: string
}

export interface SocialDetail {
    content?: string
    url: string
    thumbnail?: string
    date?: string
    user: {
        name: string
        screenName: string
        profileImageUrl: string
    }
}

export interface SearchResults {
    search: Array<SearchDetail>
    social: Array<SocialDetail>
    actuality: Array<ActualityDetail>
}

export interface Suggestion {
    name: string
    id: number
}

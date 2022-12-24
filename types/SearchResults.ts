export interface SearchDetail {
    title: string
    description?: string
    url: string
    displayUrl?: string
    thumbnail?: string
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
}

# Arceus Search

Arceus Search is a search engine for everything. It is a project that I started to make a better way to search information. 

_It is a work in progress, and my first Project with NextJS. I'm still learning how to use it._

## Features

- Classique Search over the web with Google (still the best, but maybe add other search engines)
- A flux of news from the web
- A flux of tweets from Twitter
- An answer to your question with OpenAI GPT-3 (hopefully add chatGPT) :+1:
- Instant answers for simple cases (calculator)
- ad free
- background image from Bing

## ToDo

- [ ] Clean the code (the project is a mess and still a POC)
- [ ] Implement a autocomplete search (google can do it, need to find another service)
- [ ] Simple backend cache for google search with cooldown
- [ ] Simple backend cache for news and twitter search with a shorter cooldown
- [ ] Implement bang support like DuckDuckGo
- [ ] Add result of wikipedia if exact match
- [ ] fav like [nightTab](https://github.com/zombieFox/nightTab) The best new tab extension
- [ ] add a button to change to light theme
- [ ] ctrl +k for focus on search bar
- [ ] better image from unsplash.com
- [ ] sexy favicon
- [ ] maybe implement wolframalpha.com
- [ ] maybe implement duckduckgo.com

## Getting Started

First, run the development server:

```bash
npm run dev
```

## Account needed

### Twitter

env variable: `TWITTER_BEARER_TOKEN`

### Google

env variable: `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`

To get the `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` 
you need to create a project on [Google Programable Search Engine](https://programmablesearchengine.google.com/about/) 
and follow the instructions at [Google Search Engine](https://developers.google.com/custom-search/docs/overview)

### OPENAI

env variable: `OPENAI_API_KEY`

### NewsAPI

env variable: `NEWS_API_KEY`

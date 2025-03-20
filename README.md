# About
Helper for getting block position from [Google Search API by SerpApi](https://serpapi.com/search-api).

It's a temporary solution, while waiting for [the official one](https://github.com/serpapi/public-roadmap/issues/113).

## Status
Under development. Feel free to try and share your feedback.

## How it works
- You need to perform a regular search at SerpApi first and get the search ID
- Run this project (read `how to run` section below)
- Access through browser or programmatically via the URL `http://localhost:3000/{searchID}`
- It will return the original json alongside new global_position key

```
...
"global_position": {
    "x": 28,
    "y": 1067.984375,
    "ranking": 2
}
```

## How to run
- Run `npm install` once
- Create `.env` file and add `SERPAPI_API_KEY=YOUR_API_KEY`
- Run with `node index`
- access from URL `http://localhost:3000/{searchID}`


## Notes
- Currently, we always set knowledge_graph position to "1" for desktop.
- We ignore any hidden elements (where x==0 and y==0) 

## TODO
- test tablet size
- test mobile size

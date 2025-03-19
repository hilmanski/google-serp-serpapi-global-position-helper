# About
Helper for getting block position from SerpApi SERP result.

## Status
Under heavy development

## How to run
- Run `npm install` once
- Create `.env` file and add your SERPAPI_API_KEY
- Adjust the searchID on `index.js` file to ID you want to check
- Run with `node index`

## Notes
- Currently, we always put knowledge_graph at 1st position
- We ignore any hidden elements (where x==0 and y==0) 

# Status for mobile/tablet
Can't continue since currently the xray class position is not very reliable on mobile.
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
- Currently, we always set knowledge_graph position to "-" for desktop.
- We ignore any hidden elements (where x==0 and y==0) 

## Status for mobile/tablet
Can't continue since currently the xray class position is not very reliable on mobile.

## TODO
- Test on 5 queries
- add endpoint access via GET HTTP URL
- share overview step on readme:
    - perform search as usual to SerpApi
    - access this endpoint

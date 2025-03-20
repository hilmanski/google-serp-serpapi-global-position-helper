# About
Helper for getting block position from Google Search API by SerpApi.

## Status
Under heavy development

## How to run
- Run `npm install` once
- Create `.env` file and add your SERPAPI_API_KEY
- Adjust the searchID on `index.js` file to ID you want to check
- Run with `node index`
- access from URL http://localhost:3000/{searchID}

## Notes
- Currently, we always set knowledge_graph position to "1" for desktop.
- We ignore any hidden elements (where x==0 and y==0) 
- If the main key only include arrays, we'll skip the global position for it's parent. Ex: (inline_images, related_questions)

## Status for mobile/tablet
Can't continue since currently the xray class position is not very reliable on mobile.

## TODO
- share overview step on readme:
    - perform search as usual to SerpApi
    - access this endpoint
- test tablet size
- test mobile size

sample ID: 67da5b9ea57b437e91699eab
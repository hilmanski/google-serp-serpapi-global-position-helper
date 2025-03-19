
// scrape xray page
// get the global positions back
// get the original API response
// merge them togerther
// return alongside the position
// ensure it works for desktop, mobile, and tablet
// Final result: x,y position and actual position
// How people can host this easily? write on ReadMe

const dotenv = require('dotenv');
dotenv.config();
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const puppeteer = require('puppeteer');

const searchID = "67da3ff34ac94f2f3106d29e"
const archiveData = `https://serpapi.com/searches/${searchID}.json?api_key=${SERPAPI_API_KEY}`


// To Think: should you use archived API or should you make it work directly after calling the API?
    // meaning archiveData is not needed. Maybe create two different use cases
fetch(archiveData)
    .then((response) => response.text())
    .then((body) => {
        const jsonBody = JSON.parse(body);
        const xrayPageUrl = jsonBody.search_metadata.raw_html_file.replace(".html", ".xray");
        const device = jsonBody.search_parameters.device || "desktop";
        scrapeXRayPage(xrayPageUrl, device);
    });

async function scrapeXRayPage(xrayPageUrl, device) {
    console.log("checking: ", xrayPageUrl, device);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let viewPortSize = {width: 1080, height: 1024};

    if (device === 'mobile') {
        viewPortSize = {width: 400, height: 600};
    }

    if (device === 'tablet') {
        viewPortSize = {width: 768, height: 1024};
    }

    await page.setViewport(viewPortSize);
    await page.goto(xrayPageUrl, { waitUntil: 'domcontentloaded' });
    // console.log(await page.content()

    // Get list of elements that has xray-json-path attribute
    const elementPositions = (await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[xray-json-path]')).map(element => {
            const { x, y } = element.getBoundingClientRect()
            return {
                element: element.getAttribute('xray-json-path'),
                position: { x, y }
            }
        })
    })).filter(elPos => !elPos.element.includes('].'))
    .filter(elPos => !elPos.element.includes('knowledge_graph.') && !elPos.element.includes('answer_box.') && !elPos.element.includes('refine_this_search') )

    // console.log('Element position:', elementPositions);

    const globalPositions = elementPositions.sort((elPos, elPosOther) => {
        if (device === "desktop" && elPos.element === 'knowledge_graph') return 1
        if (elPos.position.y == elPosOther.position.y) return elPos.position.x - elPosOther.position.x
        return elPos.position.y - elPosOther.position.y
    }).reduce((globalPositions, elPos, index) => {
        globalPositions[elPos.element] = { ...elPos.position, global_position: index + 1 }
        return globalPositions
    }, {})

    console.log('Global positions:', globalPositions);

    await browser.close();
}

// expose as /get  request
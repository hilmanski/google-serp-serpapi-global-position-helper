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

// sample id for more data outside organic result: 67da3ff34ac94f2f3106d29e
const searchID = "67da5b9ea57b437e91699eab"
const archiveData = `https://serpapi.com/searches/${searchID}.json?api_key=${SERPAPI_API_KEY}`


// To Think: should you use archived API or should you make it work directly after calling the API?
    // meaning archiveData is not needed. Maybe create two different use cases
fetch(archiveData)
    .then((response) => response.text())
    .then((body) => {
        const jsonBody = JSON.parse(body);
        const xrayPageUrl = jsonBody.search_metadata.raw_html_file.replace(".html", ".xray");
        const device = jsonBody.search_parameters.device || "desktop";
        scrapeXRayPage(jsonBody, xrayPageUrl, device);
    });

// Merge x,y, and global_position back to original jsonBody
function mergeGlobalPositions(jsonBody, globalPositions) {
    Object.keys(globalPositions).forEach(key => {
        const path = key.split('.');
        let current = jsonBody;

        for (let i = 0; i < path.length; i++) {
            const part = path[i];
            if (part.includes('[')) {
                const [arrayKey, index] = part.split(/[\[\]]/).filter(Boolean);
                if (!current[arrayKey] || !current[arrayKey][parseInt(index)]) {
                    console.warn(`Path not found: ${key}`);
                    return; // Exit if path is not valid
                }
                current = current[arrayKey][parseInt(index)];
            } else {
                if (!current[part]) {
                    console.warn(`Path not found: ${key}`);
                    return; // Exit if path is not valid
                }
                current = current[part];
            }
        }

        current.global_position = {
            x: globalPositions[key].x,
            y: globalPositions[key].y,
            ranking: globalPositions[key].position
        }
    });

    return jsonBody;
}

async function scrapeXRayPage(jsonBody, xrayPageUrl, device) {
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
            const { x, y } = element.getBoundingClientRect();
            return {
                element: element.getAttribute('xray-json-path'),
                position: { x, y }
            };
        });
    })).filter(elPos => {
        const element = elPos.element;
        return !element.includes('].') &&
               !element.includes('knowledge_graph.') &&
               !element.includes('answer_box.') &&
               !element.includes('refine_this_search') &&
               !element.includes('search_information.') &&
               (elPos.position.x !== 0 || elPos.position.y !== 0);
    });

    const globalPositions = elementPositions.sort((elPos, nextElPos) => {
        if (elPos.position.y == nextElPos.position.y) return elPos.position.x - nextElPos.position.x
        return elPos.position.y - nextElPos.position.y
    }).reduce((globalPositions, elPos, index) => {
        let ranking = index + 1
        if (device === "desktop" && elPos.element === 'knowledge_graph') {
            ranking = "-"
        }
        globalPositions[elPos.element] = { ...elPos.position, position: ranking }
        return globalPositions
    }, {})

    const updatedJsonBody = mergeGlobalPositions(jsonBody, globalPositions);
    console.log('Updated JSON Body:', updatedJsonBody);

    await browser.close();
}

// expose as /get  request


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

const searchID = "67930391120847753e0a3eac"
const archiveData = `https://serpapi.com/searches/${searchID}.json?api_key=${SERPAPI_API_KEY}`


// To Think: should you use archived API or should you make it work directly after calling the API?
    // meaning archiveData is not needed. Maybe create two different use cases
fetch(archiveData)
    .then((response) => response.text())
    .then((body) => {
        const jsonBody = JSON.parse(body);
        const xrayPageUrl = jsonBody.search_metadata.raw_html_file.replace(".html", ".xray");
        scrapeXRayPage(xrayPageUrl);
    });

async function scrapeXRayPage(xrayPageUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    await page.goto(xrayPageUrl);
    // console.log(await page.content()

    // Get list of elements that has xray-json-path attribute
    const elementsWithXray = await page.evaluate(() => {
        const elements = document.querySelectorAll('[xray-json-path]');
        return Array.from(elements).map(element => element.getAttribute('xray-json-path'));
    });

    // Remove all subitems and knowledge_graph's subelement
    let cleanedElements = elementsWithXray.filter(element => !element.includes('].'));
    cleanedElements = cleanedElements.filter(element => !element.includes('knowledge_graph.'));

    // Get the position of each element
    let elementPositions = await Promise.all(cleanedElements.map(async (element) => {
        const position = await page.evaluate((element) => {
            const item = document.querySelector(`[xray-json-path="${element}"]`);
            if (item) {
                const rect = item.getBoundingClientRect();
                return { x: rect.left, y: rect.top };
            }
            return null;
        }, element);
        return { element, position };
    }));

    // console.log('Element position:', elementPositions);

    let globalPositions = {};

    elementPositions.forEach((elementPosition, index) => {
        let rank = 0;
        elementPositions.forEach((otherElementPosition) => {
            if (elementPosition.position.y > otherElementPosition.position.y) {
                rank++;
            } else if (elementPosition.position.y === otherElementPosition.position.y) {
                if (elementPosition.position.x > otherElementPosition.position.x) {
                    rank++;
                }
            }

            // Hack for knowledge_graph, set it to last
            if (elementPosition.element === 'knowledge_graph') {
                rank = elementPositions.length;
            }

            if(rank == 0) {
                rank = 1;
            }
        });
        globalPositions[elementPosition.element] = { ...elementPosition.position, global_position: rank };
    });

    console.log('Global positions:', globalPositions);


    await browser.close();

}

// expose as /get  request
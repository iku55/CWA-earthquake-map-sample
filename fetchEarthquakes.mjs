import * as fs from 'fs';
const APIキー = fs.readFileSync('APIKEY.txt').toString();

async function fetchEarthquakes(apikey) {
    const request = await fetch('https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization='+apikey);
    if (request.status == 401) { throw Error('APIキーが無効です'); }
    if (!request.ok) { throw Error(); }
    const earthquakes = await request.json();
    if (!earthquakes.success) { throw Error(); }
    return earthquakes;
}
console.log((await fetchEarthquakes(APIキー)).records.Earthquake[0])
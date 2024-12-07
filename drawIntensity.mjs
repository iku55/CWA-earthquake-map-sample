import * as d3 from "d3";
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import { Resvg } from '@resvg/resvg-js';
const APIキー = fs.readFileSync('APIKEY.txt').toString();

// 地図データを読み込み
const geoData = JSON.parse(fs.readFileSync('map.geojson'));

// JSDOM上でSVG要素を作成
const document = new JSDOM().window.document;
const svg = d3.select(document.body).append('svg');

const width = 1920; // 画像サイズ横
const height = 1080; // 画像サイズ縦

svg.attr('width', width)
    .attr('height', height)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');

//背景を描画
svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .style('fill', '#ddd'); // 背景色

// 中央位置・ズームレベルの決定
var projection = d3.geoMercator()
    .scale(12000) // ズームレベル
    .center([121, 23.5]) // 中央位置
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

// 地図を描画
svg.selectAll('path')
    .data(geoData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', '#fff') // 塗りつぶし色
    .style("stroke", '#222') // 境界線色
    .style("stroke-width", "1.5px"); // 境界線の太さ

// 地震情報取得関数
async function fetchEarthquakes(apikey) {
    const request = await fetch('https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization='+apikey);
    if (request.status == 401) { throw Error('APIキーが無効です'); }
    if (!request.ok) { throw Error(); }
    const earthquakes = await request.json();
    if (!earthquakes.success) { throw Error(); }
    return earthquakes;
}

// 地震情報取得
const earthquakes = await fetchEarthquakes(APIキー);
const earthquake = earthquakes.records.Earthquake[0];

// 観測点マッピング
const fillColors = {
    '7級': "#780078",
    "6強": "#960000",
    "6弱": "#BE0000",
    "5強": "#FF6400",
    "5弱": "#FF9600",
    "4級": "#E1AF05",
    "3級": "#00c878",
    "2級": "#3264C8",
    "1級": "#646464"
}; // 塗りつぶし色を震度階級ごとに書いておく

for (const area of earthquake.Intensity.ShakingArea) {
    if (area.AreaDesc.includes('最大震度')) {
        continue; // テキスト化用と思われる地域があるので無視する("最大震度4の地域":"〇〇県、〇〇市"みたいな感じ)
    }
    console.log('[地域]', area.CountyName, ':', area.AreaIntensity);
    for (const station of area.EqStation) {
        console.log('[観測点]', station.StationName, ':', station.SeismicIntensity);
        svg.append('rect')
        .attr('x', projection([station.StationLongitude, station.StationLatitude])[0]-5)
        .attr('y', projection([station.StationLongitude, station.StationLatitude])[1]-5)
        .attr('width', '10')
        .attr('height', '10')
        .attr('fill', fillColors[station.SeismicIntensity]);
    }
}

// 震源地表示
svg.append("defs")
    .append("path")
    .attr("id", "Center")
    .attr("x", 0)
    .attr("y", 0)
    .attr("d", "M-20-14-6 0-20 14-14 20 0 6 14 20 20 14 6 0 20-14 14-20 0-6-14-20-20-14Z")
    .attr("fill", "#990000")
    .attr('stroke', '#fff')
    .attr('stroke-width', '3'); // 震源のバツ印を定義

svg.append("use")
    .attr("x", projection([earthquake.EarthquakeInfo.Epicenter.EpicenterLongitude, earthquake.EarthquakeInfo.Epicenter.EpicenterLatitude])[0])
    .attr("y", projection([earthquake.EarthquakeInfo.Epicenter.EpicenterLongitude, earthquake.EarthquakeInfo.Epicenter.EpicenterLatitude])[1])
    .attr("xlink:href", "#Center");

// SVG->PNG変換
const resvg = new Resvg(document.body.innerHTML);
const pngData = resvg.render();
fs.writeFileSync('out.png', pngData.asPng());
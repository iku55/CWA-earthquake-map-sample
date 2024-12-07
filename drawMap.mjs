import * as d3 from "d3";
import * as fs from 'fs';
import { JSDOM } from 'jsdom';

const geoData = JSON.parse(fs.readFileSync('map.geojson'));
// 地図データ(GeoJSON)の保存先はmap.geojsonです。

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

fs.writeFileSync('out.svg', document.body.innerHTML);
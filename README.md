# CWA-earthquake-map-sample
[Qiita記事 「台湾の中央気象署(CWA)から地震情報を取得し震度分布図を生成する」](https://qiita.com/iku55/items/6af3dcfb485ddf1a51a7)のサンプルです。  
`npm install`でパッケージをダウンロードし、CWAのAPIキーをAPIKEY.txtに記載することで実行可能です。  
記事の紹介順:
1. fetchEarthquakes.mjs
2. drawMap.mjs
3. drawIntensity.mjs
4. drawArea.mjs

`map.geojson`, `centroids.geojson`はNaturalEarthのデータを利用しています。

# Wiki Visualization Standard

Kagglectureの記事内で使う可視化の選択基準。描画ライブラリの実装説明は公開記事に書かない。

## Selection

| 表現 | 使う場面 |
|---|---|
| Markdown table | 手法、スコア、条件の比較 |
| Mermaid | フロー、判断、モデル構造、関係 |
| MathJax / LaTeX | 評価指標、Loss、数式 |
| Chart.js | 軽量な棒・線・散布図 |
| Plotly | hover / zoomが理解に役立つ定量グラフ |
| Vega-Lite | 複数軸・統計的な比較 |
| D3 | 他の手段で表現しにくい特殊図 |
| Leaflet | 地理・位置情報コンペ |
| SVG | 精密な模式図 |
| Callout | 重要事項、注意、リーク警告 |
| details | 発展事項・補足・長い説明 |
| image / iframe | 外部図、動画、スライド |

## Priority

基本優先順位:

1. Markdown表
2. Mermaid
3. LaTeX
4. Chart.js / Plotly / Vega-Lite
5. SVG / D3
6. Leaflet
7. 外部画像 / 動画

単純な表やMermaidで十分なら、複雑なライブラリを使わない。

## UX rules

- 可視化そのものを目的にしない。
- 文章より速く理解できる場合だけ使う。
- 同じ内容を文章・表・図で重複させない。
- スマートフォンで読めるサイズ・横スクロール量を意識する。
- 長い補足は `details` に入れ、本文の流れを止めない。
- 図の直前または直後に「何を見る図か」だけを短く説明する。
- 装飾目的の図は作らない。

## Quantitative charts

- 出典で確認済みの実測値だけを使う。
- 値を推測・補間・捏造しない。
- 比較条件が異なるスコアを同一軸で雑に比較しない。
- グラフのデータ元は追跡可能にする。

## Runtime

公開サイトでは以下を利用できる。

- Mermaid
- MathJax / LaTeX
- Chart.js
- Plotly
- Vega-Lite
- D3
- Leaflet
- SVG
- HTML / CSS components

これらの読み込み方法、CDN、JavaScript、Jekyll等は読者向け記事に説明しない。
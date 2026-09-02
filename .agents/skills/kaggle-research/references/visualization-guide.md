# Visualization Guide

このファイルはKaggle Wiki記事を作成する側の内部ガイド。読者向けページには描画ライブラリや実装方法を説明しない。

## Selection

| 表現 | 使う場面 |
|---|---|
| Markdown table | 手法、スコア、条件の比較 |
| Mermaid | フロー、判断、モデル構造、関係 |
| MathJax / LaTeX | 評価指標、Loss、数式 |
| Chart.js | 軽量な棒・線・散布図 |
| Plotly | hoverやzoomが理解に役立つ定量グラフ |
| Vega-Lite | 複数軸・統計的な比較 |
| D3 | 他で表現できない特殊図 |
| Leaflet | 地理・位置情報コンペ |
| SVG | 精密な模式図 |
| Callout | 重要、注意、リーク警告 |
| details | 発展事項・補足・長い説明 |
| image / iframe | 外部図、動画、スライド |

## UX rules

- 可視化そのものを目的にしない。
- 読者が文章より速く理解できる場合だけ使う。
- 同じ内容を文章・表・図で重複させない。
- 数値グラフは確認済みの実測値のみ使う。
- 複雑な図より、単純な表やMermaidで十分ならそちらを選ぶ。
- スマートフォンでも横スクロールや崩れが最小になる構成を選ぶ。
- 長い補足は `details` に入れ、本文の流れを止めない。
- 技術的な描画方法、CDN、JavaScript、Jekyll等の説明は読者向け記事に書かない。

## Available runtime

MermaidとMathJaxは共通で利用可能。Chart.js / Plotly / Vega-Lite / D3 / Leafletは `window.KagglectureViz` 経由で必要時のみ読み込める。

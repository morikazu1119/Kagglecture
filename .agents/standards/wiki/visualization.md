# Wiki Visualization Standard

Kagglectureの記事内で使う可視化の選択基準。描画ライブラリの実装説明は公開記事に書かない。

## Goal

可視化は装飾ではなく、**文章だけでは理解しにくい関係・変化・比較を短時間で理解させるために使う**。

記事作成時は必ず一度、次を判断する。

1. この概念は図にすると理解が速くなるか
2. ユーザーが操作すると理解がさらに深まるか
3. 静的図で十分か、Interactiveにする価値があるか

## Selection

| 表現 | 使う場面 |
|---|---|
| Markdown table | 手法、スコア、条件の比較 |
| Mermaid | フロー、判断、モデル構造、関係 |
| MathJax / LaTeX | 評価指標、Loss、数式 |
| HTML / CSS / SVG interactive | fold、threshold、weight、samplingなどを操作して理解する図 |
| Chart.js | 軽量な棒・線・散布図 |
| Plotly | hover / zoom / legend切替が理解に役立つ定量グラフ |
| Vega-Lite | 複数軸・統計的な比較 |
| D3 | 他の手段で表現しにくい特殊図・interaction |
| Leaflet | 地理・位置情報コンペ |
| SVG | 精密な模式図 |
| Callout | 重要事項、注意、リーク警告 |
| details | 発展事項・補足・長い説明 |
| image / iframe | 外部図、動画、スライド |

## Static vs Interactive

### Interactiveを優先するケース

ユーザーが値・状態・条件を変えたときに、結果がどう変化するかを見ること自体が理解につながる場合。

例:

- KFold / GroupKFoldを切り替えてleakageを見る
- thresholdを動かしてPrecision / Recall / F1を見る
- Ensemble weightを変えて予測の変化を見る
- Calibration前後を切り替える
- foldを切り替えてTrain / Validationの分離を見る
- Ranking metricで順位入れ替えによるscore変化を見る
- augmentationやsamplingの適用前後を比較する

### Staticで十分なケース

- 単純な処理順
- 固定されたモデル構造
- 数値を操作しても新しい理解が増えない比較
- 表だけで十分な使い分け

Interactiveにできるという理由だけでInteractiveにしない。

## Interactive UX rules

- **最初の表示だけでも結論が分かる**状態にする。
- 操作対象は2〜5個程度に絞る。
- ボタン、slider、select等は何を変えるか明示する。
- 操作後に「何が変わったか」を文章またはstatusで即時表示する。
- hoverだけに重要情報を置かない。クリック・タップでも理解できるようにする。
- 自動で延々動くanimationは使わない。必要ならユーザー操作で開始・停止できるようにする。
- `prefers-reduced-motion` を尊重する。
- キーボード操作可能なnative controlを優先する。
- `aria-pressed`、`aria-live`等を必要に応じて使う。
- モバイル幅で操作できることを確認する。
- JavaScriptが無効でも、周囲の本文だけで本質が理解できるようにする。

## Progressive enhancement

Interactiveは本文の代替ではなく補助。

- 定義・結論は通常のHTML / Markdown本文に残す。
- Interactiveが読み込めなくても記事が成立すること。
- 重要な主張をInteractiveの内部だけに閉じ込めない。
- 実装詳細、JavaScript、CDN等は公開記事に説明しない。

## Visual explanation

仕組みを説明する記事では、文章だけで理解させようとせず、**データがどこからどこへ動くか、何が分離されるか、何を比較しているか**を視覚化する。

図の直前または直後に「何を見る図か」を1〜2文だけ書く。同じ内容を長文で繰り返さない。

## Quantitative charts

- 出典で確認済みの実測値だけを使う。
- 値を推測・補間・捏造しない。
- 比較条件が異なるスコアを同一軸で雑に比較しない。
- グラフのデータ元は追跡可能にする。
- hover可能でも、軸・凡例・要点が静止状態で理解できるようにする。

## Runtime

公開サイトでは以下を利用できる。

- Mermaid
- MathJax / LaTeX
- HTML / CSS / SVG interactive components
- Chart.js
- Plotly
- Vega-Lite
- D3
- Leaflet

小規模なinteractionはvanilla JavaScript / HTML / CSS / SVGを優先する。高度な定量可視化でのみ外部ライブラリを使う。

これらの読み込み方法、CDN、JavaScript、Jekyll等は読者向け記事に説明しない。

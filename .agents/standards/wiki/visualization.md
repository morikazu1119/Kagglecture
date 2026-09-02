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
| HTML / CSS / SVG | 単純な固定フロー、関係、模式図 |
| MathJax / LaTeX | 評価指標、Loss、数式 |
| HTML / CSS / SVG interactive | fold、threshold、weight、sampling、overlap、分布差などを操作して理解する図 |
| Chart.js | 軽量な棒・線・散布図 |
| Plotly | hover / zoom / legend切替が理解に役立つ定量グラフ |
| Vega-Lite | 複数軸・統計的な比較 |
| D3 | 他の手段で表現しにくい特殊図・interaction |
| Leaflet | 地理・位置情報コンペ |
| Callout | 重要事項、注意、リーク警告 |
| details | 発展事項・補足・長い説明 |
| image / iframe | 外部図、動画、スライド |

### Mermaidの扱い

Mermaidは**原則として第一候補にしない**。

- 値・状態・条件を変えると理解が深まるならInteractiveを優先する。
- 固定された単純フローならHTML / CSS / SVGを優先する。
- Mermaidを使うのは、複雑な静的関係を短く保守でき、Interactive化しても理解が増えず、SVG/CSSを手書きする利点も小さい場合に限定する。
- 「フローだからMermaid」という機械的な選択をしない。

## Static vs Interactive

### Interactiveを優先するケース

ユーザーが値・状態・条件を変えたときに、結果がどう変化するかを見ること自体が理解につながる場合。

例:

- KFold / GroupKFoldを切り替えてleakageを見る
- thresholdを動かしてPrecision / Recall / F1を見る
- Ensemble weightを変えて予測の変化を見る
- Calibration前後を切り替える
- foldを切り替えてTrain / Validationの分離を見る
- Target Encodingで自己targetを含む/除く差を見る
- Pseudo Label thresholdで採用数とnoiseのtrade-offを見る
- Dice / IoUでmask overlapを動かす
- RMSE / MAEで外れ値の影響を変える
- augmentationやsamplingの適用前後を比較する

### Staticで十分なケース

- 単純な処理順で、切替や値変更から新しい理解が増えない
- 固定されたモデル構造
- 数値を操作しても新しい理解が増えない比較
- 表だけで十分な使い分け

Interactiveにできるという理由だけでInteractiveにしない。ただし**操作対象が明確に存在する概念を、静的フローだけで済ませない**。

## Synthetic / illustrative data

概念説明用に作った値やsampleをInteractiveで使う場合は、実測値と混同させない。

- 「模式例」「理解用の例」「実測値ではない」などを図内または直前に明示する。
- KaggleのCV / LB / ablation値に見える数値を捏造しない。
- 実在Competitionの定量グラフを作る場合は、確認済み実測値だけを使い出典を付ける。

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

- MathJax / LaTeX
- HTML / CSS / SVG interactive components
- Chart.js
- Plotly
- Vega-Lite
- D3
- Leaflet

小規模なinteractionはvanilla JavaScript / HTML / CSS / SVGを優先する。高度な定量可視化でのみ外部ライブラリを使う。

これらの読み込み方法、CDN、JavaScript、Jekyll等は読者向け記事に説明しない。

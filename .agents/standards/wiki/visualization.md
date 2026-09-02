# Wiki Visualization Standard

Kagglectureの記事内で使う可視化の選択基準。描画ライブラリの実装説明は公開記事に書かない。

## Goal

可視化は装飾ではなく、**文章だけでは理解しにくい関係・変化・比較を短時間で正確に理解させるために使う**。

記事作成時は必ず一度、次を判断する。

1. この概念は図にすると理解が速くなるか
2. ユーザーが操作すると理解がさらに深まるか
3. 静的図で十分か、Interactiveにする価値があるか
4. 2Dと3Dのどちらが情報を正確に伝えるか
5. モバイル幅でも同じ意味を保てるか

## HTML-first requirement

公開記事の**図・表・グラフ・比較ボードは原則HTMLを土台にする**。

- 表はraw HTMLの`<table>`を使い、`html-table-wrap` / `html-table`で表現する。
- Markdown pipe tableを新規作成しない。
- 静的な図はHTML / CSS / inline SVGを使う。
- 静的な棒・分布・matrix等は、規模が小さければHTML / CSSを優先する。
- InteractiveもHTMLを初期表示の土台にしてJavaScriptでprogressive enhancementする。
- Canvasだけに情報を閉じ込めず、ラベル・値・結論をHTMLにも残す。
- 外部ライブラリを使う高度なグラフでも、タイトル・凡例・要点・fallbackはHTMLで持つ。

既存のMarkdown tableは表示時に共通layout guardでHTML tableとして補強するが、**記事を更新する際はraw HTMLへ移行する**。

## Selection

表現方法の優先順位は以下。

1. 短い文章だけで十分 → 文章
2. 条件・手法・数値の比較 → HTML table / comparison cards
3. 値・状態・条件を変えると理解が深まる → HTML / CSS / SVG Interactive
4. 固定された関係・処理順 → HTML / CSS / inline SVG
5. 少数の定量比較 → HTML / CSS bar / matrix / position encoding
6. hover / zoom / 大量点探索が重要 → Chart.js / Plotly / Vega-Lite / D3
7. 地理情報 → Leaflet
8. 数式自体が本質 → MathJax / LaTeX

### Mermaidの扱い

Mermaidは**原則使わない**。

- 操作対象があればInteractiveを優先する。
- 固定フローはHTML / CSS / inline SVGを優先する。
- 複雑な静的関係でも、まずHTML/SVGで明快に表現できないか検討する。
- 「フローだからMermaid」という選択は禁止する。

## 2D vs 3D

### 2Dを優先するケース

数値比較・順位・割合・時間変化・確率・Metricなど、**位置や長さを定量的に読む図は原則2D**にする。

理由:

- 3D perspectiveは棒の長さや面積を歪め、比較精度を下げやすい。
- mobileで奥行き方向のラベルが潰れやすい。
- hover前提になりやすい。

### 3D / 2.5Dが有効なケース

奥行きそのものが概念理解に寄与する場合のみ使う。

例:

- CNNのfeature map / channel stack
- ViTやTransformerのlayer stack
- 3次元volume / voxel / medical imaging
- 空間構造・座標系そのものがtaskに関係する場合

3Dは装飾目的で使わない。定量値の大小比較を3D barで表現しない。

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
- 1つの結論を示す小規模な比較
- 数値を操作しても新しい理解が増えない比較

Staticでも文章だけで済ませず、図の方が理解が速い場合はHTML / CSS / SVGで視覚化する。

## Tables

表は「情報を詰める場所」ではなく、比較軸を読むための可視化として設計する。

- 2〜5列程度に絞る。
- 重要列を左側へ置く。
- 数値列は右寄せしtabular numsを使う。
- 長い説明が多い場合はtableではなくcomparison cardへ変える。
- 620px幅で読めない表は、無理に縮小せず横スクロールを許可する。
- 横スクロール時はページ全体をoverflowさせずtable wrapper内だけに閉じる。
- mobileで列見出しが読めないほど狭くなる場合はcard化を検討する。

## Static HTML diagrams

- `static-viz` / `html-diagram`を基本containerにする。
- data flowは`html-flow`のようにnodeとconnectorを明示する。
- architecture depthは`layer-scene`等で2.5D表示してよい。
- ViT等のpatch/token関係はgrid + token layoutの方がflowchartより明確ならそちらを使う。
- 色だけに意味を持たせず、text labelを併記する。
- SVGは必ず`viewBox`を持ち、固定pixel幅にしない。

## Synthetic / illustrative data

概念説明用に作った値やsampleを可視化で使う場合は、実測値と混同させない。

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
- JavaScriptが無効でも本文と初期HTMLから本質が理解できるようにする。

## Layout verification

図表を追加・変更したら、少なくとも次を確認する。

- 320px: phone narrow
- 390px: common phone
- 620px: article max width
- 1003px: wide/index width

確認項目:

- page-level horizontal overflowがない。
- tableだけ必要に応じてwrapper内horizontal scrollになる。
- labelがcontainer外へ飛び出さない。
- SVG / diagram / chartが切れない。
- 2列・3列layoutがmobileで1列へreflowする。
- interactive controlが44px前後のtouch targetを保つ。
- dark modeでもcontrastが崩れない。
- `prefers-reduced-motion`で3D transformやanimationが理解を妨げない。

公開runtimeでは`KagglectureLayout.audit()`でvisual containerのoverflowを検査できる。新しいcomponentはlayout audit対象selectorへ含める。

## Progressive enhancement

Interactiveは本文の代替ではなく補助。

- 定義・結論は通常のHTML / Markdown本文に残す。
- Interactiveが読み込めなくても記事が成立すること。
- 重要な主張をInteractiveの内部だけに閉じ込めない。
- 実装詳細、JavaScript、CDN等は公開記事に説明しない。

## Quantitative charts

- 出典で確認済みの実測値だけを使う。
- 値を推測・補間・捏造しない。
- 比較条件が異なるスコアを同一軸で雑に比較しない。
- グラフのデータ元は追跡可能にする。
- baselineが意味を持つ棒グラフでは軸の切断で差を誇張しない。
- hover可能でも、軸・凡例・要点が静止状態で理解できるようにする。

## Runtime

公開サイトでは以下を利用できる。

- HTML / CSS / inline SVG static components
- HTML / CSS / SVG interactive components
- MathJax / LaTeX
- Chart.js
- Plotly
- Vega-Lite
- D3
- Leaflet

小規模なstatic/interactionはvanilla HTML / CSS / SVG / JavaScriptを優先する。高度な定量可視化でのみ外部ライブラリを使う。

これらの読み込み方法、CDN、JavaScript、Jekyll等は読者向け記事に説明しない。

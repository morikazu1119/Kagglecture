---
layout: default
title: Rank Averaging
summary: 各モデルの予測値を順位へ変換してから平均し、予測スケールの違いを吸収するEnsemble。
type: reference
domain: kaggle
topic: rank-averaging
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - ensemble
  - ranking
---

# Rank Averaging

**Rank Averagingは、各モデルの生の予測値ではなく「サンプルの順位」に変換してから平均するEnsembleです。**

モデルAが0.01〜0.99、モデルBが0.40〜0.60のように予測スケールが違っても、順位へ変換すれば同じ尺度で混ぜられます。AUCなどrankingが中心のMetricで特に扱いやすい方法です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

各モデルについて予測を小さい順に並べ、0〜1程度へ正規化したrankへ変換します。そのrankを平均またはweighted averageします。

<div class="static-viz html-diagram" aria-label="異なる予測スケールをrankへ変換する模式図">
  <div class="viz-heading"><div><div class="viz-title">値のscaleを捨て、順序だけ同じ空間へ揃える</div><p class="viz-subtitle">Model A/Bは値の単位が違っても、3 sampleの順序が同じならrankは同じになります。</p></div><span class="viz-badge">模式例</span></div>
  <div class="html-table-wrap"><table class="html-table">
    <thead><tr><th scope="col">Sample</th><th scope="col" class="numeric">Model A</th><th scope="col" class="numeric">Model B</th><th scope="col" class="numeric">Rank A</th><th scope="col" class="numeric">Rank B</th></tr></thead>
    <tbody>
      <tr><th scope="row">S1</th><td class="numeric">0.10</td><td class="numeric">-2.0</td><td class="numeric">0.0</td><td class="numeric">0.0</td></tr>
      <tr><th scope="row">S2</th><td class="numeric">0.55</td><td class="numeric">0.1</td><td class="numeric">0.5</td><td class="numeric">0.5</td></tr>
      <tr><th scope="row">S3</th><td class="numeric">0.90</td><td class="numeric">3.0</td><td class="numeric status-good">1.0</td><td class="numeric status-good">1.0</td></tr>
    </tbody>
  </table></div>
  <p class="viz-caption">値は理解用の人工例です。絶対確率を捨てる代わりに、異なるmodel scaleのrankingを揃えます。</p>
</div>

絶対確率は捨てますが、**順序情報を揃えて混ぜる**ことができます。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Rank Averagingと他Ensembleの比較">
  <section class="comparison-card"><h4>Probability Average</h4><dl><dt>保持</dt><dd>確率の大きさ + 順序</dd><dt>向くMetric</dt><dd>LogLoss / Brier等</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Rank Average</h4><dl><dt>保持</dt><dd>順序中心</dd><dt>向くMetric</dt><dd>AUC / ranking系</dd></dl></section>
  <section class="comparison-card"><h4>Stacking</h4><dl><dt>保持</dt><dd>OOF予測から組合せを学習</dd><dt>向くMetric</dt><dd>幅広い</dd></dl></section>
</div>

LogLossやBrier Scoreでは予測確率の値そのものが重要なので、rank化すると情報を失います。

## Kaggleでの実例 {#kaggle-examples}

Quora Insincere Questions Classificationの1位解法では、モデルごとの最適F1 thresholdのばらつきに対し、予測確率をrank化して平均するとより安定した結果になったと報告しています（[1st place solution](https://www.kaggle.com/competitions/quora-insincere-questions-classification/writeups/the-zoo-1st-place-solution)）。

Jigsaw - Agile Community Rules Classificationの公開Solutionでも、DeBERTa・k-NN・Llamaの予測をrank化し、0.5/0.3/0.2でweighted rank ensembleする例があります（[Solution Writeup](https://www.kaggle.com/competitions/jigsaw-agile-community-rules/writeups/solution-writeup-jigsaw-agile-community-rules-c)）。後者は188位であり、「一般的な使用例」として扱い、上位性の根拠にはしません。

## 注意点 {#pitfalls}

### 確率較正を失う

0.51と0.99でも順位が隣なら差は小さくなります。Probability Metricでは不利になり得ます。

### F1 thresholdの意味が変わる

rank化後の0.9は「90%確率」ではなく「上位10%付近」です。thresholdはOOFのrank空間で選び直します。

### tieの扱い

同値予測が多い離散モデルではrank定義で結果が変わる場合があります。

## Quick Reference {#quick-reference}

- モデル間の予測scaleが違うとき有効。
- AUC/ranking系と相性が良い。
- 確率の絶対値は捨てる。
- thresholdはrank化後のOOFで再選択する。
- Probability Metricでは通常のaverageも比較する。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})

## 参考文献

1. [Kaggle, “Quora Insincere Questions Classification: 1st place solution”, 2019](https://www.kaggle.com/competitions/quora-insincere-questions-classification/writeups/the-zoo-1st-place-solution)
2. [Kaggle, “Jigsaw - Agile Community Rules Classification: Solution Writeup”, 2025](https://www.kaggle.com/competitions/jigsaw-agile-community-rules/writeups/solution-writeup-jigsaw-agile-community-rules-c)
3. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)

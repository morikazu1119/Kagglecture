---
layout: default
title: Hill Climbing Ensemble
description: OOF Metricが最も改善する予測を1本ずつ追加し、候補model群から小さく強いblendを貪欲に選ぶ方法。
summary: 現在のblendへ各候補を試し、OOF Metricを最も改善するmodelだけを1本ずつ採用するgreedy ensemble selection。
type: reference
domain: kaggle
topic: hill-climbing
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - ensemble
  - hill-climbing
  - oof
---

# Hill Climbing Ensemble

**Hill Climbing Ensembleは、「いまのEnsembleに1本追加するなら、どのモデルがOOF scoreを一番良くするか」を全候補で試し、最良の1本だけを順番に追加していく方法です。**

単体scoreが2番目・3番目のモデルでも、現在のblendが外すsampleを補えるなら採用されます。つまり見るのは**そのmodel単体の強さではなく、今のblendに足したときの追加価値**です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#example">具体例</a>
  <a href="#algorithm">アルゴリズム</a>
  <a href="#why">なぜ効くか</a>
  <a href="#weights">重みの意味</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず4モデルから選ぶ例 {#example}

候補A/B/C/DのOOF predictionがあるとします。最初にbest singleのAを選び、その次に`A+B`, `A+C`, `A+D`を実際のCompetition Metricで比較します。

<div class="model-architecture" aria-label="Hill Climbing Ensembleで候補を逐次追加する模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Stepごとに「追加後のscore」を全候補で試す</div><p class="model-architecture__subtitle">下はRMSEを小さくする模式例です。数値は人工値です。</p></div>
    <span class="model-architecture__badge">greedy selection</span>
  </div>
  <div class="html-table-wrap"><table class="html-table">
    <thead><tr><th scope="col">Step</th><th scope="col">試す候補</th><th scope="col">OOF RMSE</th><th scope="col">判断</th></tr></thead>
    <tbody>
      <tr><th scope="row">0</th><td>A単体</td><td class="numeric">0.720</td><td>Aから開始</td></tr>
      <tr><th scope="row" rowspan="3">1</th><td>A + B</td><td class="numeric">0.716</td><td>改善</td></tr>
      <tr><td>A + C</td><td class="numeric status-good"><strong>0.711</strong></td><td><strong>Cを採用</strong></td></tr>
      <tr><td>A + D</td><td class="numeric">0.718</td><td>不採用</td></tr>
      <tr><th scope="row" rowspan="2">2</th><td>A + C + B</td><td class="numeric status-good"><strong>0.709</strong></td><td><strong>Bを採用</strong></td></tr>
      <tr><td>A + C + D</td><td class="numeric">0.712</td><td>不採用</td></tr>
    </tbody>
  </table></div>
  <p class="model-architecture__caption">Cは単体でAより弱くても、Aと誤差が違えばA+Cが最良になることがあります。</p>
</div>

この例では順番が`A → C → B`になります。**Dを採らなかった理由はDが弱いからとは限らず、現在のblendに足しても新しい情報が少なかったから**です。

## アルゴリズム {#algorithm}

<div class="model-architecture" aria-label="Hill Climbing Ensembleの処理全体">
  <div class="model-architecture__header"><div><div class="model-architecture__title">OOF候補を揃え、1本ずつmarginal gainを測る</div><p class="model-architecture__subtitle">Public LBではなく同じOOF row・同じMetric上で選択します。</p></div><span class="model-architecture__badge">selection loop</span></div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>OOF pool<br>A B C D …</span></div><span class="model-stage__label">候補を揃える</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Start</strong><br>best single</span></div><span class="model-stage__label">現在blend</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Try each candidate</strong><br>blend + candidate</span></div><span class="model-stage__label">全候補を仮追加</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Best metric gain</span></div><span class="model-stage__label">1本だけ採用</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Repeat until<br>no improvement</span></div><span class="model-stage__label">Final blend</span></div>
  </div>
</div>

基本形は次です。

1. 全候補のOOF predictionを**同じrow順・同じfold設計**で揃える。
2. best single modelから開始する。
3. 未選択候補を1本ずつ仮に現在blendへ追加しMetricを計算する。
4. 最も改善する候補だけを正式採用する。
5. 改善が止まるか、設定本数に達するまで繰り返す。

## なぜ単体2位を飛ばすことがあるのか {#why}

重要なのは**marginal contribution（追加したときの改善量）**です。

<div class="comparison-board" aria-label="Hill Climbingで候補の価値が変わる例">
  <section class="comparison-card"><h4>Model B</h4><dl><dt>単体</dt><dd>かなり強い</dd><dt>既存blendとの相関</dt><dd>0.99</dd><dt>追加価値</dt><dd>小さい可能性</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Model C</h4><dl><dt>単体</dt><dd>Bより少し弱い</dd><dt>既存blendとの相関</dt><dd>0.88</dd><dt>追加価値</dt><dd>外し方が違えば大きい</dd></dl></section>
  <section class="comparison-card"><h4>Model D</h4><dl><dt>単体</dt><dd>かなり弱い</dd><dt>相関</dt><dd>低い</dd><dt>追加価値</dt><dd>多様なだけでは不十分</dd></dl></section>
</div>

強いmodel同士でもpredictionがほぼ同じなら追加価値は小さく、少し弱くても既存blendが外すsampleを当てるmodelには価値があります。

## 同じモデルを何回も選ぶと重みになる {#weights}

実装によっては、既に選んだmodelを次のstepでも再度候補にできます。たとえば10回中Aが5回、Cが3回、Bが2回選ばれれば、単純平均では実質`A 50% / C 30% / B 20%`に近い重みになります。

<div class="html-bar-chart" aria-label="Hill Climbingの選択回数を重みにした模式図">
  <div class="html-bar-row is-highlight"><span class="html-bar-label">Model A</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:50"></span></span><span class="html-bar-value">5 / 10</span></div>
  <div class="html-bar-row"><span class="html-bar-label">Model C</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:30"></span></span><span class="html-bar-value">3 / 10</span></div>
  <div class="html-bar-row"><span class="html-bar-label">Model B</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:20"></span></span><span class="html-bar-value">2 / 10</span></div>
</div>
<p class="viz-note">模式例。実際のweighting ruleは実装によって異なります。</p>

## Kaggleでの実例 {#kaggle-examples}

Playground Series S4E8の1位解法では72 OOFを含む多数候補にHill Climbingを使い、60 model超では2時間以上かかる規模までensemble探索しています。AutoGluonへ渡すOOFを8本へ絞る用途にもHill Climbingを使っています（[1st Place Solution](https://www.kaggle.com/competitions/playground-series-s4e8/writeups/optimistix-1st-place-solution-72-oofs-a-whole-lott)）。

30 Days of MLの1位解法ではLevel 2 modelを最終的にforward selectionでweighted ensembleし、CV RMSE 0.715437、Private 0.71533の最終solutionを構築しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Playground Series S6E3の1位解法も大規模model poolにGPU Hill Climbingを含むKGMON Playbookで候補選択を行っています（[1st Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/1st-place-gpt5-4-gemini3-1-claudeopus4-6-kgm)）。

## 注意点 {#pitfalls}

### OOFへの過適合

候補が数千本あると、greedy selection自体がOOF noiseを拾います。model familyごとの制限、outer holdout、複数seed/foldで再現性を確認します。

### ほぼduplicate予測を大量投入

計算量だけ増えます。prediction correlationやmodel metadataで事前にdeduplicateします。

### Test prediction alignment

OOFで選んだmodel IDとTest predictionの列順・前処理を完全に一致させます。

### 改善が微小でも無限に追加する

候補数を増やすほどOOF偶然差も拾いやすくなります。minimum improvementや最大本数を決め、fold別改善も確認します。

## Quick Reference {#quick-reference}

- 「単体で強い順」ではなく「現在blendへ足した改善順」に選ぶ。
- 全候補のOOFを同一row順で保存する。
- best singleからgreedyに1本ずつ追加する。
- 再選択を許す方式では選択回数をweightにできる。
- 大規模model poolではOOF overfittingを必ず疑う。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Playground Series S4E8: 1st Place Solution”, 2024](https://www.kaggle.com/competitions/playground-series-s4e8/writeups/optimistix-1st-place-solution-72-oofs-a-whole-lott)
2. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
3. [Kaggle, “Playground Series S6E3: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/1st-place-gpt5-4-gemini3-1-claudeopus4-6-kgm)
4. [Caruana et al., “Ensemble Selection from Libraries of Models”, 2004](https://www.cs.cornell.edu/~caruana/ctp/ct.papers/caruana.icml04.icdm06long.pdf)

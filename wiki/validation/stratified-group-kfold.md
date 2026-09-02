---
layout: default
title: StratifiedGroupKFold
summary: groupをTrain/Validationで完全分離しながら、各foldのクラス比もできるだけ揃えるCross Validation。
type: reference
domain: kaggle
topic: stratified-group-kfold
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - cross-validation
  - grouping
  - imbalance
---

# StratifiedGroupKFold

**StratifiedGroupKFoldは、同じ患者・ユーザーなどのgroupをfold間で分離しつつ、各foldのクラス比も元データへ近づけるCross Validationです。**

`GroupKFold`が必要なデータで、groupごとのラベル偏りが大きくfoldごとのpositive率まで崩れる場合に使います。group境界が最優先で、stratificationはその制約内で「可能な範囲」で行われます（[scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board" aria-label="StratifiedGroupKFoldを選ぶ状況">
  <section class="comparison-card is-primary"><h4>患者ごとに複数画像 + 疾患率が偏る</h4><dl><dt>選択</dt><dd>StratifiedGroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>authorごとに複数音声 + species偏り</h4><dl><dt>選択</dt><dd>StratifiedGroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>groupはあるがtarget比は安定</h4><dl><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>groupなしの不均衡分類</h4><dl><dt>選択</dt><dd>StratifiedKFold</dd></dl></section>
  <section class="comparison-card"><h4>時間順序が本質</h4><dl><dt>優先</dt><dd>時間分割</dd></dl></section>
</div>

## 仕組み {#mechanism}

通常のStratifiedKFoldはsampleを自由に移動できますが、StratifiedGroupKFoldでは**groupを分割できません**。下の模式図では1つのpatient内のsampleが必ず同じboxに残ります。

<div class="static-viz html-diagram" aria-label="Groupを分割せずclass比を揃える模式図">
  <div class="viz-heading"><div><div class="viz-title">groupを丸ごと配置し、その中でclass比を近づける</div><p class="viz-subtitle">1 patientを複数foldへ分割しないことが最優先です。</p></div><span class="viz-badge">模式例</span></div>
  <div class="comparison-board">
    <section class="comparison-card"><h4>Patient A</h4><dl><dt>samples</dt><dd>positive / positive / positive</dd><dt>制約</dt><dd>3件とも同じfold</dd></dl></section>
    <section class="comparison-card"><h4>Patient B</h4><dl><dt>samples</dt><dd>negative / negative</dd><dt>制約</dt><dd>2件とも同じfold</dd></dl></section>
    <section class="comparison-card"><h4>Patient C</h4><dl><dt>samples</dt><dd>positive / negative</dd><dt>制約</dt><dd>2件とも同じfold</dd></dl></section>
  </div>
  <div class="html-flow" style="--flow-columns: 3">
    <div class="flow-node"><strong>Groupを壊さない</strong><span>patient単位で候補foldを選ぶ</span></div>
    <div class="flow-node"><strong>class比を評価</strong><span>配置後のpositive率を確認</span></div>
    <div class="flow-node is-accent"><strong>最もbalancedな配置</strong><span>group制約内で近づける</span></div>
  </div>
  <p class="viz-caption">group構造が極端なら完全なstratificationは不可能です。比率よりgroup leakage防止を優先します。</p>
</div>

## 使い分け {#comparison}

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th scope="col">手法</th><th scope="col">group分離</th><th scope="col">class比維持</th></tr></thead>
  <tbody>
    <tr><th scope="row">KFold</th><td>×</td><td>×</td></tr>
    <tr><th scope="row">StratifiedKFold</th><td>×</td><td class="status-good">○</td></tr>
    <tr><th scope="row">GroupKFold</th><td class="status-good">○</td><td>×</td></tr>
    <tr><th scope="row">StratifiedGroupKFold</th><td class="status-good">○</td><td class="status-good">○に近づける</td></tr>
  </tbody>
</table></div>

**group leakageを防ぐ方がclass比をきれいにするより重要**です。group制約を外してまでstratifyしません。

## Kaggleでの実例 {#kaggle-examples}

BirdCLEF 2022の23位解法では、録音authorをgroupとしてStratifiedGroupKFoldを使っています（[23th Place Solution](https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution)）。同じ録音者由来の音響条件がTrainとValidationへまたがるのを避けながら、鳥種の偏りも抑える設計です。

26-shinnen-3Dpathologyの1位team solutionではpatient由来画像をGroupKFoldで分離しています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。このような医療データでclass imbalanceまで大きい場合がStratifiedGroupKFoldの典型候補です。

## 注意点 {#pitfalls}

### 「stratifiedだから各fold完全一致」と思う

groupが大きいほど比率調整の自由度が下がります。foldごとの件数・positive率を実際に出して確認します。

### groupを細かく設定する

患者単位が必要なのに画像IDをgroupにすると意味がありません。**本番で独立して現れる単位**をgroupにします。

### rare classが特定groupにしかない

少数classが3患者にしか存在しないのに5-foldへ均等配置することはできません。fold数を減らす判断も必要です。

## Quick Reference {#quick-reference}

- group境界を最優先で守る。
- class比は「可能な範囲」で揃える。
- foldごとのclass件数を必ず可視化する。
- rare classを持つdistinct group数と`n_splits`を確認する。
- 時系列制約があれば別途考慮する。

## 関連項目

- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “StratifiedGroupKFold”](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)
2. [scikit-learn, “StratifiedGroupKFold API”](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html)
3. [Kaggle, “BirdCLEF 2022: 23th Place Solution”](https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution)
4. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)

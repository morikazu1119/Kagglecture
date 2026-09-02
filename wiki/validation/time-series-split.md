---
layout: default
title: TimeSeriesSplit
summary: 過去だけで学習し未来で評価する、時間順序を壊さないCross Validation。
type: reference
domain: kaggle
topic: time-series-split
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - time-series
  - leakage
---

# TimeSeriesSplit

**TimeSeriesSplitは、過去データで学習し、それより未来のデータで評価する時間順序付きCross Validationです。**

通常KFoldのように時間を混ぜると、「未来を知った状態で過去を当てる」評価になり得ます。時系列予測では、本番の時間方向をValidationでも再現することが重要です（[scikit-learn: TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

- 売上・需要・価格など未来値を予測する。
- train期間よりtest期間が後にある。
- 時間でデータ分布が変わる可能性がある。
- 同一entityの履歴から未来を予測する。

## 仕組み {#mechanism}

典型的なexpanding windowでは、後のfoldほどTrain期間が長くなります。時間方向を定量的に読みたいので、3Dではなく**左=過去、右=未来の2D HTML timeline**で示します。

<div class="static-viz html-diagram" aria-label="Expanding windowのTimeSeriesSplit模式図">
  <div class="viz-heading">
    <div><div class="viz-title">過去で学習し、その直後の未来で評価する</div><p class="viz-subtitle">緑 = Validation。後のfoldほどTrain windowが右へ拡張します。</p></div>
    <span class="viz-badge">past → future</span>
  </div>
  <div class="html-matrix" style="--matrix-cols: 6">
    <div class="matrix-cell is-header"></div><div class="matrix-cell is-header">t1</div><div class="matrix-cell is-header">t2</div><div class="matrix-cell is-header">t3</div><div class="matrix-cell is-header">t4</div><div class="matrix-cell is-header">t5</div><div class="matrix-cell is-header">t6</div>
    <div class="matrix-cell is-header">Fold 1</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell"></div><div class="matrix-cell"></div>
    <div class="matrix-cell is-header">Fold 2</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell"></div>
    <div class="matrix-cell is-header">Fold 3</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell is-good">Valid</div>
  </div>
  <p class="viz-caption">模式例。実際のperiod長・fold数・gapはCompetitionのtest horizonやリーク構造に合わせます。</p>
</div>

scikit-learnの`TimeSeriesSplit`では、k番目のsplitで先頭側をTrain、その直後をValidationとし、必要なら`gap`でTrain末尾とValidation先頭の間を空けられます（[公式ドキュメント](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)）。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="時系列Validation設計の使い分け">
  <section class="comparison-card is-primary"><h4>Expanding window</h4><dl><dt>向く状況</dt><dd>古いデータも継続利用したい</dd><dt>Train</dt><dd>foldごとに増える</dd></dl></section>
  <section class="comparison-card"><h4>Rolling window</h4><dl><dt>向く状況</dt><dd>古すぎるデータを捨てたい</dd><dt>Train</dt><dd>一定幅で移動</dd></dl></section>
  <section class="comparison-card"><h4>Gap付きsplit</h4><dl><dt>向く状況</dt><dd>直前情報がリークしやすい</dd><dt>特徴</dt><dd>Train/Valid間を空ける</dd></dl></section>
  <section class="comparison-card"><h4>Leave-one-period-out</h4><dl><dt>向く状況</dt><dd>年・season単位で評価したい</dd><dt>単位</dt><dd>明確な期間bucket</dd></dl></section>
  <section class="comparison-card"><h4>Purged split</h4><dl><dt>向く状況</dt><dd>label期間が重なる金融等</dd><dt>目的</dt><dd>overlap情報を除去</dd></dl></section>
</div>

## Kaggleでの実例 {#kaggle-examples}

松尾研 DS Dojo #4の1位解法では、Competition自体が2016年以前をtrain、2017年以降をtestとする時間分割でした。解法側でもValidation設計が重要で、OOF予測を後段のLightGBMへ渡しています（[1st Place Solution](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)）。

MWS Cup 2022の1位解法ではtrainが2020年、testが2022年で分布差があり、通常CVだけでなくAdversarial Validationも検討されています（[1st place solution](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)）。**時間差があると、分割方法そのものがモデル選択へ直結します。**

## 注意点 {#pitfalls}

### rolling featureの未来参照

splitだけ時間順でも、移動平均や集計特徴量が未来行を含めばリークします。特徴量生成も「予測時点で利用可能な情報だけ」に限定します。

### entity境界を無視する

複数店舗・銘柄・ユーザーが混在する場合、時間だけでなくentityの扱いも設計が必要です。

### test horizonが違う

Validationが1日先、testが3か月先では難易度が違います。Validation期間長を本番horizonへ近づけます。

## Quick Reference {#quick-reference}

- 未来予測ならshuffleしない。
- Validationは必ずTrainより未来に置く。
- lag・rolling・集計特徴も時間リークを確認する。
- 必要なら`gap`を置く。
- 本番の予測期間とValidation horizonを近づける。

## 関連項目

- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})
- [MAE]({{ '/wiki/metrics/mae.html' | relative_url }})
- [RMSE]({{ '/wiki/metrics/rmse.html' | relative_url }})

## 参考文献

1. [scikit-learn, “TimeSeriesSplit”](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
2. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)
3. [Kaggle, “MWS Cup 2022: 1st place solution”, 2022](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)
4. [Qiita, “一流の「ものさし」職人になろう Cross Validationを深堀り”, 2019](https://qiita.com/Hatomugi/items/620c1bc757266b00e87f)

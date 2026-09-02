---
layout: default
title: CatBoost
summary: Ordered Boostingとカテゴリ特徴処理を備え、categorical-richな表形式データで扱いやすいGBDT。
type: reference
domain: kaggle
topic: catboost
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - gbdt
  - catboost
  - categorical
---

# CatBoost

**CatBoostは、カテゴリ特徴を直接扱えるGradient Boosted Decision Tree（GBDT）です。**

特徴的なのは、target statisticsやboostingで現在の行自身のtargetを直接参照しにくくする**ordering principle / Ordered Boosting**です。カテゴリが多いtabularで、one-hotや手作業のTarget Encodingを減らせることがあります（[CatBoost papers](https://catboost.ai/docs/en/concepts/educational-materials-papers)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">特徴</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 特徴 {#mechanism}

CatBoostは数値だけでなくcategorical、text、embedding featuresも扱えます。カテゴリ処理ではorderingを使い、あるsampleの統計を作るときにそのsample自身のtargetを直接使うLeakageを抑える設計があります（[CatBoost FAQ](https://catboost.ai/docs/en/concepts/faq)）。

<div class="static-viz html-diagram" aria-label="CatBoostのordered categorical処理の模式図">
  <div class="viz-heading"><div><div class="viz-title">現在のrowより前の情報でカテゴリ統計を作る</div><p class="viz-subtitle">orderingを使い、自分自身のtargetを直接カテゴリ統計へ混ぜにくくします。</p></div><span class="viz-badge">ordered処理模式図</span></div>
  <div class="html-flow" style="--flow-columns:4">
    <div class="flow-node"><strong>Permutation</strong><span>sample順序を定義</span></div>
    <div class="flow-node"><strong>Past rows</strong><span>先に現れたtarget統計</span></div>
    <div class="flow-node is-accent"><strong>Current row</strong><span>自分のtargetを使わず特徴化</span></div>
    <div class="flow-node"><strong>Boosting</strong><span>ordered predictionで学習</span></div>
  </div>
  <p class="viz-caption">内部アルゴリズムを簡略化した模式図です。Ordered Boostingでも外側のCVや前処理Leakageは別途防ぐ必要があります。</p>
</div>

## 使う場面 {#use-cases}

- 文字列カテゴリや高cardinalityカテゴリが多い。
- Target Encoding pipelineを単純化したい。
- 数値+カテゴリのtabular baselineを素早く作りたい。
- LightGBM/XGBoostと異なる誤差を持つensemble候補が欲しい。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="CatBoost LightGBM XGBoostの比較">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>特徴</dt><dd>高速、leaf-wise、histogram</dd><dt>categorical</dt><dd>native対応あり</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/xgboost.html' | relative_url }}">XGBoost</a></h4><dl><dt>特徴</dt><dd>正則化制御、成熟したGBDT</dd><dt>強み</dt><dd>sampling/regularizationの制御</dd></dl></section>
  <section class="comparison-card is-primary"><h4>CatBoost</h4><dl><dt>特徴</dt><dd>categorical + ordered処理</dd><dt>強み</dt><dd>手作業encodingを減らしやすい</dd></dl></section>
</div>

カテゴリが多いからCatBoostが必ず勝つわけではありません。native categorical、Target Encoding + LightGBM、XGBoostを同一CVで比較します。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではCatBoostをLightGBM・XGBoost・HGBRとともにLevel 1/2 ensembleへ採用しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Predicting F1 Pit Stops 2026の11位解法はXGBoost、LightGBM、DART等とともにCatBoostを多数のOOF候補へ含め、CatBoostが特に良かった可能性としてOrdered Boostingに言及しています（[11th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/11th-place-in-the-midst-of-entrance-exams)）。

Predicting Student Health Risk 2026ではCatBoost・LightGBM・XGBoostなどのtree model同士の予測一致率が非常に高い分析もあり、**異なるlibrary名だけでは十分なensemble diversityにならない**場合があります（[analysis](https://www.kaggle.com/competitions/playground-series-s6e7/discussion/732538)）。

## 注意点 {#pitfalls}

### 数値IDをcategoryにすべきか自動で決まらない

整数だからnumericとは限らず、数字だからcategoryとも限りません。生成過程で判断します。

### 外部Target Encodingと二重に複雑化する

CatBoost自身のカテゴリ処理と外部TEを両方使うと、CV設計が複雑になります。まずnative処理をbaselineにします。

### Ordered BoostingでもCV Leakageは防げない

モデル内部の仕組みが安全でも、全Trainで前処理や特徴選択をfitすればLeakageします。pipeline全体はfold内に閉じます。

## Quick Reference {#quick-reference}

- categorical-rich tabularの第一候補。
- `cat_features`を正しく指定する。
- native categoricalと他encodingをOOF比較する。
- iterationsはEarly Stoppingと組み合わせる。
- ensembleではerror correlationも確認する。

## 関連項目

- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})

## 参考文献

1. [CatBoost, “Reference papers”](https://catboost.ai/docs/en/concepts/educational-materials-papers)
2. [CatBoost, “FAQ”](https://catboost.ai/docs/en/concepts/faq)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “Predicting F1 Pit Stops: 11th Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/11th-place-in-the-midst-of-entrance-exams)
5. [Kaggle, “Predicting Student Health Risk: tree error correlation analysis”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/discussion/732538)

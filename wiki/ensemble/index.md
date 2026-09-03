---
layout: default
title: Ensemble
description: KaggleのEnsemble手法を、平均・順位・meta model・model selectionごとに調べるカテゴリ索引。
summary: Blend、Rank Average、Stacking、Fold/Seed、Hill Climbingを結合方法で整理する。
type: category-index
nav_order: 6
permalink: /wiki/ensemble/
---

# Ensemble

Ensembleは、**複数modelの予測を組み合わせて、1つのmodelより安定したpredictionを作る方法**です。

「複数modelを使う」だけではなく、**どう結合するか / どう候補を選ぶか**で手法を分けます。

## 予測値を直接混ぜる

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/weighted-average.html' | relative_url }}"><h3>Weighted Average</h3><p>複数modelのpredictionをCVで選んだweight付き平均で統合する基本Ensemble。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/rank-averaging.html' | relative_url }}"><h3>Rank Averaging</h3><p>predictionを順位へ変換してから平均し、model間のscale差を吸収する。</p></a>
</div>

## Modelの予測から組合せ方を学ぶ

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/stacking.html' | relative_url }}"><h3>Stacking</h3><p>OOF predictionをfeatureとしてMeta modelに組合せ方を学習させる。</p></a>
</div>

## 同じmodelの揺れを平均する

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }}"><h3>Fold / Seed Ensemble</h3><p>foldやseed違いmodelを平均し、学習の偶然性によるprediction varianceを減らす。</p></a>
</div>

## 多数候補から使うmodelを選ぶ

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/hill-climbing.html' | relative_url }}"><h3>Hill Climbing Ensemble</h3><p>OOF Metricを最も改善する候補をgreedyに追加し、大量modelからblendを選ぶ。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>まず2〜5 modelを混ぜたい</h4><dl><dt>候補</dt><dd>Weighted Average</dd><dt>AUC等</dt><dd>Rank Averageも比較</dd></dl></section>
  <section class="comparison-card"><h4>組合せをmodelに学ばせたい</h4><dl><dt>候補</dt><dd>Stacking</dd><dt>必須</dt><dd>OOF prediction</dd></dl></section>
  <section class="comparison-card"><h4>同一architectureのvarianceを減らす</h4><dl><dt>候補</dt><dd>Fold / Seed Ensemble</dd></dl></section>
  <section class="comparison-card"><h4>候補が数十〜数百</h4><dl><dt>候補</dt><dd>Hill Climbing</dd><dt>注意</dt><dd>OOF overfitting</dd></dl></section>
</div>

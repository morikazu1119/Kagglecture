---
layout: default
title: Advanced Methods
description: Kaggleの発展手法を、追加data・推論・確率補正・最終処理ごとに調べるカテゴリ索引。
summary: Pseudo Label、External Data、TTA、Calibration、Post-processingを適用段階で整理する。
type: category-index
nav_order: 5
permalink: /wiki/advanced-methods/
---

# Advanced Methods

Advanced Methodsでは、**基本modelにもう一段工夫を足して性能を伸ばす手法**を扱います。

同じ「追加テクニック」でも、Train dataを変えるのか、Inferenceを増やすのか、predictionを補正するのかでriskが違います。

## 学習data / 学習signalを増やす

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }}"><h3>Pseudo Labeling</h3><p>高confidenceなunlabeled predictionを仮labelとして再学習へ利用する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/external-data.html' | relative_url }}"><h3>External Data</h3><p>Rulesを守って外部label・pretraining signal・metadataを利用する。</p></a>
</div>

## Inference時に予測を安定化する

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/test-time-augmentation.html' | relative_url }}"><h3>Test-Time Augmentation</h3><p>推論時に複数変換した入力のpredictionを平均し、変換依存の揺れを減らす。</p></a>
</div>

## Probabilityを補正する

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/probability-calibration.html' | relative_url }}"><h3>Probability Calibration</h3><p>OOFを使って予測確率scaleを実際の発生率へ近づける。</p></a>
</div>

## 最終outputをtaskへ合わせる

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/post-processing.html' | relative_url }}"><h3>Post-processing</h3><p>threshold、constraint、smoothing、component除去等でraw predictionをsubmissionへ整える。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card"><h4>labelが少ない</h4><dl><dt>unlabeled test/data</dt><dd>Pseudo Labeling</dd><dt>公開data</dt><dd>External Data</dd></dl></section>
  <section class="comparison-card is-primary"><h4>input変換で予測が揺れる</h4><dl><dt>候補</dt><dd>TTA</dd><dt>条件</dt><dd>label semanticsを変えない変換</dd></dl></section>
  <section class="comparison-card"><h4>0.9予測が90%当たらない</h4><dl><dt>候補</dt><dd>Probability Calibration</dd></dl></section>
  <section class="comparison-card"><h4>Metric/task制約へ合わせたい</h4><dl><dt>候補</dt><dd>Post-processing</dd><dt>必須</dt><dd>OOFでrule検証</dd></dl></section>
</div>

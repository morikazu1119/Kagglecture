---
layout: default
title: Metrics
description: Kaggleの評価指標を、何を測るかで整理するカテゴリ索引。
summary: hard label、ranking、probability、regression、segmentationのMetricを整理する。
type: category-index
nav_order: 2
permalink: /wiki/metrics/
---

# Metrics

評価指標は、**「予測の良さを何で点数化するか」**を決めるルールです。

同じpredictionでもMetricが違えば最適なmodel、threshold、post-processingが変わります。まず**hard label / ranking / probability / continuous value / maskのどれを評価するか**で探します。

## Classification — Hard Label / Threshold

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/accuracy.html' | relative_url }}"><h3>Accuracy</h3><p>全sampleの正解率。直感的だがclass imbalanceでは多数派に偏りやすい。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/balanced-accuracy.html' | relative_url }}"><h3>Balanced Accuracy</h3><p>各classのRecallを同じ重みで平均し、不均衡分類を評価する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/precision-recall.html' | relative_url }}"><h3>Precision / Recall</h3><p>誤検知の少なさと見逃しの少なさ。threshold設計の基本。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/f1-score.html' | relative_url }}"><h3>F1 Score</h3><p>PrecisionとRecallのbalanceを測るthreshold依存の分類指標。</p></a>
</div>

## Classification — Ranking / Curve

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/roc-auc.html' | relative_url }}"><h3>ROC-AUC</h3><p>正例を負例より上位に並べるranking能力をthresholdなしで評価。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/pr-auc-average-precision.html' | relative_url }}"><h3>PR-AUC / Average Precision</h3><p>positiveが少ない分類でPrecision-Recall curve全体を評価する。</p></a>
</div>

## Classification — Probability Quality

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/log-loss.html' | relative_url }}"><h3>LogLoss</h3><p>予測確率の質を測り、自信を持った誤答を強く罰する。</p></a>
</div>

## Regression

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/rmse.html' | relative_url }}"><h3>RMSE</h3><p>大きな予測ミスを二乗で強く罰する回帰指標。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/mae.html' | relative_url }}"><h3>MAE</h3><p>絶対誤差を平均し、すべての誤差を線形に扱う回帰指標。</p></a>
</div>

## Segmentation / Overlap

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/dice-iou.html' | relative_url }}"><h3>Dice / IoU</h3><p>予測maskと正解maskの重なりを測るSegmentationの代表指標。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card"><h4>最終classだけ重要</h4><dl><dt>候補</dt><dd>Accuracy / Balanced Accuracy / F1</dd><dt>確認</dt><dd>class imbalanceとthreshold</dd></dl></section>
  <section class="comparison-card"><h4>順位が重要</h4><dl><dt>候補</dt><dd>ROC-AUC / PR-AUC</dd><dt>確認</dt><dd>positive率</dd></dl></section>
  <section class="comparison-card is-primary"><h4>確率そのものが重要</h4><dl><dt>候補</dt><dd>LogLoss</dd><dt>確認</dt><dd>Calibration</dd></dl></section>
  <section class="comparison-card"><h4>連続値</h4><dl><dt>大外しを強く罰す</dt><dd>RMSE</dd><dt>線形に扱う</dt><dd>MAE</dd></dl></section>
  <section class="comparison-card"><h4>Mask</h4><dl><dt>候補</dt><dd>Dice / IoU</dd><dt>確認</dt><dd>threshold / component処理</dd></dl></section>
</div>

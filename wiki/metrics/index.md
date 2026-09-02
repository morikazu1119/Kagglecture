---
layout: default
title: Metrics
description: Kaggleの評価指標を調べるためのカテゴリ索引。
summary: Accuracy、Precision、Recall、F1、AUC、LogLoss、RMSE、MAE、Ranking指標。
type: category-index
nav_order: 2
permalink: /wiki/metrics/
---

# Metrics

評価指標は、**「予測の良さを何で点数化するか」**を決めるルールです。

同じ予測でもMetricが違えば最適なモデル、threshold、後処理が変わります。Competition公式の式をローカルで完全再現することが前提です。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/accuracy.html' | relative_url }}" aria-label="Accuracy を開く"><h3>Accuracy</h3><p>全sampleの正解率。直感的だがクラス不均衡では多数派に偏りやすい。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/balanced-accuracy.html' | relative_url }}" aria-label="Balanced Accuracy を開く"><h3>Balanced Accuracy</h3><p>各classのRecallを同じ重みで平均し、不均衡分類を評価する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/precision-recall.html' | relative_url }}" aria-label="Precision / Recall を開く"><h3>Precision / Recall</h3><p>誤検知の少なさと見逃しの少なさ。threshold設計の基本。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/pr-auc-average-precision.html' | relative_url }}" aria-label="PR-AUC / Average Precision を開く"><h3>PR-AUC / Average Precision</h3><p>positiveが少ない分類でPrecision-Recall curve全体を評価する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/roc-auc.html' | relative_url }}" aria-label="ROC-AUC を開く"><h3>ROC-AUC</h3><p>正例を負例より上位に並べるranking能力をthresholdなしで評価。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/log-loss.html' | relative_url }}" aria-label="LogLoss を開く"><h3>LogLoss</h3><p>予測確率の質を測り、自信を持った誤答を強く罰する分類指標。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/f1-score.html' | relative_url }}" aria-label="F1 Score を開く"><h3>F1 Score</h3><p>PrecisionとRecallのバランスを測るthreshold依存の分類指標。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/rmse.html' | relative_url }}" aria-label="RMSE を開く"><h3>RMSE</h3><p>大きな予測ミスを二乗で強く罰する回帰指標。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/mae.html' | relative_url }}" aria-label="MAE を開く"><h3>MAE</h3><p>絶対誤差を平均し、すべての誤差を線形に扱う回帰指標。</p></a>
</div>

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

Accuracy、AUC、F1、LogLoss、RMSEなど、同じ予測でも指標が違えば良いモデルの条件も変わります。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/roc-auc.html' | relative_url }}" aria-label="ROC-AUC を開く">
    <h3>ROC-AUC</h3>
    <p>正例を負例より上位に並べるranking能力をthresholdなしで評価。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/log-loss.html' | relative_url }}" aria-label="LogLoss を開く">
    <h3>LogLoss</h3>
    <p>予測確率の質を測り、自信を持った誤答を強く罰する分類指標。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/f1-score.html' | relative_url }}" aria-label="F1 Score を開く">
    <h3>F1 Score</h3>
    <p>PrecisionとRecallのバランスを測るthreshold依存の分類指標。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/rmse.html' | relative_url }}" aria-label="RMSE を開く">
    <h3>RMSE</h3>
    <p>大きな予測ミスを二乗で強く罰する回帰指標。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/metrics/mae.html' | relative_url }}" aria-label="MAE を開く">
    <h3>MAE</h3>
    <p>絶対誤差を平均し、すべての誤差を線形に扱う回帰指標。</p>
  </a>
</div>

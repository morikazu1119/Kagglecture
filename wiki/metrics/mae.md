---
layout: default
title: MAE
summary: 予測値と正解値の絶対誤差を平均し、すべての誤差を線形に扱う回帰指標。
type: reference
domain: kaggle
topic: mae
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - regression
  - mae
---

# MAE

**MAE（Mean Absolute Error）は、予測値と正解値の差の絶対値を平均する回帰指標です。**

誤差1は1、誤差10は10として扱うため、RMSEのように大きな誤差を二乗で増幅しません。値は小さいほど良く、targetと同じ単位です（[scikit-learn: mean_absolute_error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#comparison">RMSEとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i-\hat{y}_i|
$$

平均絶対誤差なので、たとえばMAE=3.2なら「平均してtarget単位で約3.2外している」と解釈しやすい指標です。

## RMSEとの比較 {#comparison}

| 指標 | 誤差の重み | 特徴 |
|---|---|---|
| **MAE** | 線形 | 外れ値の影響が比較的小さい |
| RMSE | 二乗 | 大きなミスを強く罰する |

どちらが上位互換という関係ではありません。Competition Metricに合わせて最適化します。

## Kaggleでの実例 {#kaggle-examples}

Optiver - Trading at the Closeは、予測returnと観測targetのMAEで評価されます（[Competition Evaluation](https://www.kaggle.com/competitions/optiver-trading-at-the-close/overview/evaluation/timeline/citation/evaluation)）。またLANL Earthquake Predictionもtime_to_failureのMAEを採用しています（[Competition](https://www.kaggle.com/competitions/LANL-Earthquake-Prediction)）。

時系列Competitionでは、Metricが単純なMAEでも**未来情報を使わないValidation**が不可欠です。

## 注意点 {#pitfalls}

### 大外しを特別扱いしない

誤差100は誤差10の10倍であり、RMSEのように100倍にはなりません。巨大ミスが致命的な問題ではMetric設計として合わない場合があります。

### target変換

log変換targetで学習して逆変換する場合、log-spaceのMAEを見てもCompetitionの元スケールMAEとは一致しません。

### median寄りの最適解

絶対誤差を最小化する代表値はmeanではなくmedianです。Lossやpost-processingの設計にも影響します。

## Quick Reference {#quick-reference}

- 小さいほど良い。
- targetと同じ単位。
- すべての誤差を線形に扱う。
- RMSEより外れ値の影響が弱い。
- 時系列ならMetricより先にsplitを正しくする。

## 関連項目

- [RMSE]({{ '/wiki/metrics/rmse.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. [scikit-learn, “mean_absolute_error”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html)
2. [Kaggle, “Optiver - Trading at the Close: Evaluation”, 2023](https://www.kaggle.com/competitions/optiver-trading-at-the-close/overview/evaluation/timeline/citation/evaluation)
3. [Kaggle, “LANL Earthquake Prediction: Evaluation”, 2019](https://www.kaggle.com/competitions/LANL-Earthquake-Prediction)
4. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

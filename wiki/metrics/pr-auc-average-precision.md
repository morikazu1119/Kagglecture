---
layout: default
title: PR-AUC / Average Precision
summary: Precision-Recall curve全体を要約し、positiveが少ない分類でpositive側のranking品質を重点評価する指標。
type: reference
domain: kaggle
topic: pr-auc-average-precision
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - imbalance
  - ranking
---

# PR-AUC / Average Precision

**Precision-Recall curveはthresholdを動かしたときのPrecisionとRecallのtrade-offを表し、Average Precision（AP）はそのcurveを1つの値へ要約する代表的指標です。**

positiveが非常に少ない問題ではROC-AUCだけではFalse Positiveの実務的な多さが見えにくいことがあり、PR系指標が有用です（[scikit-learn Precision-Recall](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#ap">Average Precision</a>
  <a href="#comparison">ROC-AUCとの違い</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感 {#intuition}

positiveを上位へ集めつつ、上位にnegativeを混ぜないモデルほどcurveが右上側になります。PrecisionとRecallの両方が高い領域が広いほど良いと考えます。

## Average Precision {#ap}

scikit-learnのAPは、各thresholdでRecallが増えた分をweightにしてPrecisionを平均します。

$$
AP = \sum_n (R_n-R_{n-1})P_n
$$

**APと、台形則で計算する単純なPR曲線下面積は同じとは限りません。** Competitionが`average_precision_score`なのか独自PR-AUCなのか確認します（[model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html)）。

## ROC-AUCとの違い {#comparison}

| 指標 | x/y | 不均衡時の見え方 |
|---|---|---|
| ROC-AUC | FPR / TPR | negative全体が分母になる |
| PR / AP | Recall / Precision | positive検出とFPを直接見る |

random predictorのAP baselineはpositive率です。positive率1%ならAP 0.01付近がrandom相当になるため、dataset間で生値を比較するときはclass prevalenceも見ます（[scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)）。

## 注意点 {#pitfalls}

### 「PR-AUC」の計算定義を確認する

AP、trapezoidal AUC、interpolated APなど実装差があります。Competition公式evaluation codeを最優先します。

### prevalenceでbaselineが変わる

ROC-AUCのrandom baseline 0.5と違い、AP baselineはpositive率に依存します。

### threshold選択は別

APが高くても最終F1 thresholdが自動で決まるわけではありません。hard-label MetricならOOFでoperating pointを選びます。

## Quick Reference {#quick-reference}

- positiveが少ない分類で重要。
- APは0〜1で高いほど良い。
- random APはpositive率。
- APと単純PR曲線面積を混同しない。
- Competition実装と同じ式を使う。

## 関連項目

- [Precision / Recall]({{ '/wiki/metrics/precision-recall.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Precision-Recall”](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)
2. [scikit-learn, “average_precision_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html)
3. [scikit-learn, “Metrics and scoring”](https://scikit-learn.org/stable/modules/model_evaluation.html)
4. [scikit-learn, “precision_recall_curve”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)

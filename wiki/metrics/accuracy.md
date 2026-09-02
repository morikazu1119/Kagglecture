---
layout: default
title: Accuracy
summary: 全sampleのうち正しく分類できた割合。直感的だがクラス不均衡では多数派予測を過大評価しやすい。
type: reference
domain: kaggle
topic: accuracy
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - metrics
  - classification
  - accuracy
---

# Accuracy

**Accuracyは、全sampleのうち予測labelが正解した割合です。**

最も直感的な分類指標ですが、95%がnegativeのデータで全件negativeと予測してもAccuracy 95%になるため、**クラス不均衡では単独で使うと危険**です（[scikit-learn: accuracy_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

$$
Accuracy = \frac{TP + TN}{TP + TN + FP + FN}
$$

multiclassでも「正解labelと一致したsample数 / 全sample数」と考えれば同じです。

## 使う場面 {#use-cases}

- class比が大きく偏っていない。
- 各classの誤分類コストがほぼ同じ。
- hard labelの最終正解率が目的。

## 使い分け {#comparison}

| 指標 | 不均衡への強さ | 見るもの |
|---|---:|---|
| Accuracy | 低い | 全体正解率 |
| Balanced Accuracy | 高い | classごとのRecall平均 |
| F1 | 高い | Precision/Recall balance |
| ROC-AUC | 比較的高い | ranking |

## 注意点 {#pitfalls}

### 多数派classだけ当てる

class shareとAccuracy baselineを最初に比較します。最大classが90%ならAccuracy 90%は何も学習していない可能性があります。

### threshold依存

Probabilityをlabelへ変換するdecision ruleでAccuracyは変わります。Competition MetricがAccuracyならOOFでthreshold/class correctionも評価します。

### multilabelの定義

scikit-learnのmultilabel Accuracyはsample内のlabel setが完全一致するsubset accuracyです。Competition定義と一致するか確認します。

## Quick Reference {#quick-reference}

- 1が最良。
- class比を必ず確認する。
- majority baselineと比較する。
- 不均衡ならBalanced Accuracy/F1/PR系を検討する。
- probability metricではない。

## 関連項目

- [Balanced Accuracy]({{ '/wiki/metrics/balanced-accuracy.html' | relative_url }})
- [Precision / Recall]({{ '/wiki/metrics/precision-recall.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “accuracy_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html)
2. [scikit-learn, “Metrics and scoring”](https://scikit-learn.org/stable/modules/model_evaluation.html)
3. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

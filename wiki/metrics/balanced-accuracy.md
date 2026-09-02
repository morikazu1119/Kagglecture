---
layout: default
title: Balanced Accuracy
summary: 各classのRecallを同じ重みで平均し、多数派classだけを当てるモデルを評価しにくくする分類指標。
type: reference
domain: kaggle
topic: balanced-accuracy
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - imbalance
---

# Balanced Accuracy

**Balanced Accuracyは、各classのRecallを同じ重みで平均する分類指標です。**

class件数が85% / 8% / 6%のように偏っていても、少数classを多数派と同じ重さで評価できます。通常Accuracyが多数派に支配される問題で有効です（[scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.balanced_accuracy_score.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">直感と数式</a>
  <a href="#comparison">Accuracyとの違い</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感と数式 {#formula}

K classなら、各classを「そのclass vs その他」と考えたRecallの平均です。

$$
BalancedAccuracy = \frac{1}{K}\sum_{k=1}^{K} Recall_k
$$

3 classなら各classが1/3ずつscoreへ効きます。

## Accuracyとの違い {#comparison}

85%を占めるclass Aを全部正解し、少数class B/Cを全滅させた場合、Accuracyは高く見えます。一方Balanced AccuracyではB/CのRecall=0が同じ重みで効くため低くなります。

## Kaggleでの実例 {#kaggle-examples}

Predicting Student Health Risk 2026は3-classの強い不均衡問題でBalanced Accuracyを採用しました。4位解法ではmajority `at-risk`が85.87%、`fit`が5.77%、`unhealthy`が8.36%で、decision ruleを`argmax(p / class_prior)`へ変えることでOOF Balanced Accuracy 0.89187→0.95063と報告しています（[4th Place Solution](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)）。

2位解法では18 base predictorsのensemble後、class-specific multiplier tuningまで行い、OOF Balanced Accuracy 0.950737を報告しています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### probabilityの質は直接評価しない

最終labelだけを見るため、0.51と0.99は同じclassなら同じです。LogLossとは目的が違います。

### decision ruleが重要

単純`argmax`がMetric最適とは限りません。class prior correctionやthresholdをOOFで評価します。

### 小さいclassのvariance

少数classの件数が非常に少ないと、そのRecallの数件差でscoreが大きく動きます。Stratified CVとfold別class Recallを確認します。

## Quick Reference {#quick-reference}

- classごとのRecallを同じ重みで平均。
- 不均衡multiclassで有力。
- decision ruleまでMetricに合わせる。
- fold別class Recallを見る。
- probability calibrationとは別問題。

## 関連項目

- [Accuracy]({{ '/wiki/metrics/accuracy.html' | relative_url }})
- [Precision / Recall]({{ '/wiki/metrics/precision-recall.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})

## 参考文献

1. [scikit-learn, “balanced_accuracy_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.balanced_accuracy_score.html)
2. [Kaggle, “Predicting Student Health Risk: 4th Place - Trusting OOF”, 2026](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)
3. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)
4. [scikit-learn, “Metrics and scoring”](https://scikit-learn.org/stable/modules/model_evaluation.html)

---
layout: default
title: ROC-AUC
summary: 正例を負例より上位に並べられる能力を、閾値に依存せず評価する分類指標。
type: reference
domain: kaggle
topic: roc-auc
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - auc
---

# ROC-AUC

**ROC-AUCは、予測スコアが正例を負例より上位に並べられる能力を評価する分類指標です。**

二値分類では0.5付近がランダム相当、1.0が完全な順位付けです。固定thresholdで0/1へ変換する前の予測スコアを評価するため、threshold選択に依存しません（[scikit-learn: roc_auc_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感 {#intuition}

正例1件と負例1件をランダムに選んだとき、**正例の予測スコアを負例より高くできる確率**として理解すると直感的です。

ROC曲線はthresholdを動かしたときのTrue Positive RateとFalse Positive Rateの組合せを描き、その曲線下面積がAUCです。

## 使う場面 {#use-cases}

- 最終的な0/1 thresholdがまだ決まっていない。
- 「上位に正例を集める」能力を比較したい。
- クラス比が多少変わってもrankingを比較したい。

## 使い分け {#comparison}

| Metric | 見るもの | threshold依存 |
|---|---|---:|
| **ROC-AUC** | 全thresholdでの順位性能 | なし |
| F1 | Precision/Recallのバランス | あり |
| LogLoss | 確率の正しさ・自信度 | なし |
| Accuracy | 0/1正解率 | あり |

AUCが同じでも、予測確率0.51と0.99の「確率としての質」は区別しません。確率較正が重要ならLogLossなども確認します。

## Kaggleでの実例 {#kaggle-examples}

Predicting F1 Pit Stops 2026の1位解法ではROC-AUCが中心指標で、多数のOOF予測をlogit化してensembleし、Public 0.95488 / Private 0.95503の最終提出を作っています（[1st Place](https://www.kaggle.com/c/playground-series-s6e5/writeups/1st-place-by-the-skin-of-my-teeth)）。

松尾研 DS Dojo #4の1位解法もAUCで評価され、GemmaとLightGBMのブレンドを採用しています（[1st Place Solution](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)）。

## 注意点 {#pitfalls}

### 極端な不均衡ではPR-AUCも見る

negativeが圧倒的に多い問題では、False Positive Rateが小さく見えやすいことがあります。実運用でpositive側のPrecisionが重要ならPrecision-Recall曲線も確認します。

### threshold最適化とは別問題

AUCを上げても、F1やAccuracyの最適thresholdが同じとは限りません。提出MetricがF1なら、OOF上でthreshold選択まで評価します。

### multiclassの定義を確認する

OvR/OvO、macro/weightedで値が変わります。CompetitionのEvaluation定義と同じ計算方法を使います（[scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html)）。

## Quick Reference {#quick-reference}

- 1.0が最良、0.5付近がランダム相当。
- 0/1ではなく連続スコアを入力する。
- ranking性能を見る指標。
- probability calibrationは評価しない。
- multiclassではaverageとOvR/OvOを確認する。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [LogLoss]({{ '/wiki/metrics/log-loss.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})

## 参考文献

1. [scikit-learn, “roc_auc_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html)
2. [Kaggle, “Predicting F1 Pit Stops: 1st Place”, 2026](https://www.kaggle.com/c/playground-series-s6e5/writeups/1st-place-by-the-skin-of-my-teeth)
3. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)
4. [Qiita, “scikit-learn ROC曲線で遊んでみた”, 2020](https://qiita.com/yuki_edy/items/54f6a62c6480f3979602)

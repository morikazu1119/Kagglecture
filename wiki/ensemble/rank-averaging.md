---
layout: default
title: Rank Averaging
summary: 各モデルの予測値を順位へ変換してから平均し、予測スケールの違いを吸収するEnsemble。
type: reference
domain: kaggle
topic: rank-averaging
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - ensemble
  - ranking
---

# Rank Averaging

**Rank Averagingは、各モデルの生の予測値ではなく「サンプルの順位」に変換してから平均するEnsembleです。**

モデルAが0.01〜0.99、モデルBが0.40〜0.60のように予測スケールが違っても、順位へ変換すれば同じ尺度で混ぜられます。AUCなどrankingが中心のMetricで特に扱いやすい方法です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

各モデルについて予測を小さい順に並べ、0〜1程度へ正規化したrankへ変換します。そのrankを平均またはweighted averageします。

```text
Model A probability: 0.10, 0.90, 0.55 -> rank: 0.0, 1.0, 0.5
Model B score:       -2.0, 3.0, 0.1  -> rank: 0.0, 1.0, 0.5
```

絶対確率は捨てますが、**順序情報を揃えて混ぜる**ことができます。

## 使い分け {#comparison}

| 手法 | 保持する情報 | 向くMetric |
|---|---|---|
| Probability Average | 確率の大きさ + 順序 | LogLoss/Brier等 |
| **Rank Average** | 順序中心 | AUC、ranking系 |
| Stacking | OOFから組合せを学習 | 幅広い |

LogLossやBrier Scoreでは予測確率の値そのものが重要なので、rank化すると情報を失います。

## Kaggleでの実例 {#kaggle-examples}

Quora Insincere Questions Classificationの1位解法では、モデルごとの最適F1 thresholdのばらつきに対し、予測確率をrank化して平均するとより安定した結果になったと報告しています（[1st place solution](https://www.kaggle.com/competitions/quora-insincere-questions-classification/writeups/the-zoo-1st-place-solution)）。

Jigsaw - Agile Community Rules Classificationの公開Solutionでも、DeBERTa・k-NN・Llamaの予測をrank化し、0.5/0.3/0.2でweighted rank ensembleする例があります（[Solution Writeup](https://www.kaggle.com/competitions/jigsaw-agile-community-rules/writeups/solution-writeup-jigsaw-agile-community-rules-c)）。後者は188位であり、「一般的な使用例」として扱い、上位性の根拠にはしません。

## 注意点 {#pitfalls}

### 確率較正を失う

0.51と0.99でも順位が隣なら差は小さくなります。Probability Metricでは不利になり得ます。

### F1 thresholdの意味が変わる

rank化後の0.9は「90%確率」ではなく「上位10%付近」です。thresholdはOOFのrank空間で選び直します。

### tieの扱い

同値予測が多い離散モデルではrank定義で結果が変わる場合があります。

## Quick Reference {#quick-reference}

- モデル間の予測scaleが違うとき有効。
- AUC/ranking系と相性が良い。
- 確率の絶対値は捨てる。
- thresholdはrank化後のOOFで再選択する。
- Probability Metricでは通常のaverageも比較する。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})

## 参考文献

1. [Kaggle, “Quora Insincere Questions Classification: 1st place solution”, 2019](https://www.kaggle.com/competitions/quora-insincere-questions-classification/writeups/the-zoo-1st-place-solution)
2. [Kaggle, “Jigsaw - Agile Community Rules Classification: Solution Writeup”, 2025](https://www.kaggle.com/competitions/jigsaw-agile-community-rules/writeups/solution-writeup-jigsaw-agile-community-rules-c)
3. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)

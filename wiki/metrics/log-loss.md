---
layout: default
title: LogLoss
summary: 正解クラスへ高い確率を出すほど良く、自信を持った誤答を強く罰する確率予測のLoss。
type: reference
domain: kaggle
topic: log-loss
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - probability
---

# LogLoss

**LogLossは、正解クラスへ高い確率を出すほど小さくなり、間違ったクラスへ極端に高い確率を出すと大きく悪化する分類指標です。**

AccuracyやF1と違い、0/1に丸める前の**予測確率そのものの質**を評価します。Cross Entropyとも呼ばれます（[scikit-learn: log_loss](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#intuition">直感</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

二値分類で、正解を`y`、positive予測確率を`p`とすると1サンプルのLogLossは次です。

$$
L = -\left(y\log p + (1-y)\log(1-p)\right)
$$

平均LogLossは**小さいほど良い**指標です。

## 直感 {#intuition}

正解がpositiveのとき、`p=0.6`より`p=0.9`の方が良い予測です。一方、positiveなのに`p=0.001`と強く否定すると非常に大きな罰を受けます。

つまりLogLossでは、**「当たったか」だけでなく「どのくらい自信を持っていたか」**が重要です。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="LogLossと代表分類Metricの比較">
  <section class="comparison-card is-primary"><h4>LogLoss</h4><dl><dt>評価</dt><dd>確率の大きさ</dd><dt>ranking</dt><dd>間接的</dd><dt>threshold</dt><dd>不要</dd></dl></section>
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>評価</dt><dd>順位</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>不要</dd></dl></section>
  <section class="comparison-card"><h4>F1</h4><dl><dt>評価</dt><dd>Precision / Recall</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>必要</dd></dl></section>
  <section class="comparison-card"><h4>Accuracy</h4><dl><dt>評価</dt><dd>0/1正解率</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>必要</dd></dl></section>
</div>

## Kaggleでの実例 {#kaggle-examples}

Otto Group Product Classification Challengeは9クラスの予測確率を提出し、multi-class logarithmic lossで評価します（[Competition Evaluation](https://www.kaggle.com/competitions/otto-group-product-classification-challenge/overview/citation)）。

Quora Question Pairsの1位解法では、train/testのtarget分布差に合わせたrescalingでLogLossを改善する後処理が使われています（[1st place solution](https://www.kaggle.com/competitions/quora-question-pairs/writeups/dl-guys-1st-place-solution)）。

## 注意点 {#pitfalls}

### 0/1ラベルを提出しない

LogLossで必要なのは確率です。0または1へ丸めると、誤答時のペナルティが極端になります。

### 過剰なconfidence

モデルが未較正なのに0.999などを大量に出すと、少数の誤答でスコアが崩れます。必要ならcalibrationやprediction clippingをCVで検討します。

### class順序

multi-classではsubmission列と予測確率列のclass順序がずれると致命的です。

## Quick Reference {#quick-reference}

- 小さいほど良い。
- 予測確率を評価する。
- 自信を持った誤答を強く罰する。
- AUCが良くてもLogLossが良いとは限らない。
- multi-classではclass列順を確認する。

## 関連項目

- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “log_loss”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html)
2. [Kaggle, “Otto Group Product Classification Challenge: Evaluation”, 2015](https://www.kaggle.com/competitions/otto-group-product-classification-challenge/overview/citation)
3. [Kaggle, “Quora Question Pairs: 1st place solution”](https://www.kaggle.com/competitions/quora-question-pairs/writeups/dl-guys-1st-place-solution)
4. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

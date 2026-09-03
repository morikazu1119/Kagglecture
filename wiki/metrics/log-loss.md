---
layout: default
title: LogLoss
summary: 予測確率そのものを評価し、正解へ高い確率を出すほど小さく、自信を持って外すほど急激に悪化する分類指標。
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

**LogLossは、「当たったか」だけでなく「どれくらい自信を持って予測したか」まで採点する分類指標です。**

正解がPositiveなら、`p=0.90`は`p=0.60`より良い予測です。逆に本当はPositiveなのに`p=0.01`と強く否定すると、**自信満々の誤答**として大きなペナルティを受けます。AccuracyやF1と違い、0/1へ丸める前の予測確率そのものを評価します（[scikit-learn: log_loss](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#formula">数式</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず確率を動かして見る {#intuition}

下は**正解がPositive（y=1）**の1サンプルです。Positiveへ出す予測確率を動かすと、LogLossがどう変わるか確認できます。

<div class="interactive-viz" data-interactive="logloss-confidence">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">正解Positiveに何%の確率を出すか</div>
      <p class="interactive-viz__subtitle">同じ正解でも、0.51と0.99では「確率としての良さ」が違います。間違った方向へ強く確信するとLossが急増します。</p>
    </div>
    <span class="interactive-status" data-logloss-status data-state="safe">Positive 90%</span>
  </div>
  <p class="interactive-note">模式例。正解labelをy=1に固定した1サンプルのbinary LogLossです。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Positive予測確率</span>
    <label class="interactive-range">
      <input type="range" min="1" max="99" step="1" value="90" data-logloss-probability aria-label="Positiveへ出す予測確率">
      <span class="interactive-range-labels"><span>1%</span><span>50%</span><span>99%</span></span>
    </label>
  </div>
  <div class="metric-grid">
    <div class="metric-card"><span>Positive probability</span><strong data-logloss-prob>0.90</strong></div>
    <div class="metric-card"><span>LogLoss</span><strong data-logloss-value>0.105</strong></div>
    <div class="metric-card"><span>0.5でlabel化</span><strong data-logloss-hard>正解</strong></div>
  </div>
  <div class="bar-list" data-logloss-bar></div>
  <p class="interactive-explanation" data-logloss-explanation aria-live="polite">正解へ高い確率を出しているのでLossは小さい状態です。</p>
  <noscript><p class="interactive-explanation">正解がPositiveなら、p=0.9のLossは約0.105、p=0.5は約0.693、p=0.01は約4.605です。自信を持った誤答ほど大きく罰します。</p></noscript>
</div>

ここで重要なのは、`p=0.51`と`p=0.99`はthreshold 0.5ならどちらも「Positiveで正解」ですが、LogLossでは0.99の方が高く評価されることです。

<div class="comparison-board" aria-label="同じhard labelでもLogLossが異なる例">
  <section class="comparison-card"><h4>p = 0.51</h4><dl><dt>0.5 threshold</dt><dd>Positiveで正解</dd><dt>LogLoss</dt><dd>約0.673</dd><dt>意味</dt><dd>ほぼ迷っている</dd></dl></section>
  <section class="comparison-card is-primary"><h4>p = 0.99</h4><dl><dt>0.5 threshold</dt><dd>Positiveで正解</dd><dt>LogLoss</dt><dd>約0.010</dd><dt>意味</dt><dd>正しく高い自信</dd></dl></section>
  <section class="comparison-card"><h4>p = 0.01</h4><dl><dt>0.5 threshold</dt><dd>Negativeで誤答</dd><dt>LogLoss</dt><dd>約4.605</dd><dt>意味</dt><dd>強い自信で逆を予測</dd></dl></section>
</div>
<p class="viz-note">値はbinary LogLossの式から計算した模式例です。</p>

## 数式はこの挙動を表している {#formula}

直感を確認した後で式を見ると、意味がつながります。二値分類で正解を`y`、Positive予測確率を`p`とすると1サンプルのLogLossは次です。

$$
L = -\left(y\log p + (1-y)\log(1-p)\right)
$$

正解がPositiveなら`y=1`なので、式は実質`-log(p)`になります。`p`が1へ近づくほど0へ近づき、`p`が0へ近づくほど急激に大きくなります。

**平均LogLossは小さいほど良い**指標です。Cross Entropyと呼ばれることもあります。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="LogLossと代表分類Metricの比較">
  <section class="comparison-card is-primary"><h4>LogLoss</h4><dl><dt>見るもの</dt><dd>確率の値と自信度</dd><dt>threshold</dt><dd>不要</dd><dt>強く罰する</dt><dd>自信を持った誤答</dd></dl></section>
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>見るもの</dt><dd>正例を上へ並べるranking</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>不要</dd></dl></section>
  <section class="comparison-card"><h4>F1</h4><dl><dt>見るもの</dt><dd>Precision / Recall</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>必要</dd></dl></section>
  <section class="comparison-card"><h4>Accuracy</h4><dl><dt>見るもの</dt><dd>0/1正解率</dd><dt>確率scale</dt><dd>評価しない</dd><dt>threshold</dt><dd>必要</dd></dl></section>
</div>

AUCが同じでもLogLossは異なることがあります。**順位が合っているか**ではなく、**0.8と言った予測が本当に80%くらい当たるか**が重要なら、Probability Calibrationも関係します。

## Kaggleでの実例 {#kaggle-examples}

Otto Group Product Classification Challengeは9クラスの予測確率を提出し、multi-class logarithmic lossで評価します（[Competition Evaluation](https://www.kaggle.com/competitions/otto-group-product-classification-challenge/overview/citation)）。

Quora Question Pairsの1位解法では、train/testのtarget分布差に合わせたrescalingでLogLossを改善する後処理が使われています（[1st place solution](https://www.kaggle.com/competitions/quora-question-pairs/writeups/dl-guys-1st-place-solution)）。

## 注意点 {#pitfalls}

### 0/1ラベルを提出しない

LogLossで必要なのは確率です。0または1へ丸めると、誤答時のペナルティが極端になります。

### 過剰なconfidence

モデルが未較正なのに0.999などを大量に出すと、少数の誤答でscoreが大きく悪化します。必要ならcalibrationやprediction clippingをOOFで検討します。

### class順序

multi-classではsubmission列と予測確率列のclass順序がずれると致命的です。

### AUC改善をそのまま期待しない

rankingが同じまま確率scaleだけ改善してもAUCは変わりません。Competition Metricが何を評価するかに合わせます。

## Quick Reference {#quick-reference}

- 小さいほど良い。
- 予測確率そのものを評価する。
- 正しい高confidenceは高評価、間違った高confidenceは強く罰する。
- thresholdで0/1へ丸めない。
- AUCが良くてもLogLossが良いとは限らない。

## 関連項目

- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [Probability Calibration]({{ '/wiki/advanced-methods/probability-calibration.html' | relative_url }})

## 参考文献

1. [scikit-learn, “log_loss”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html)
2. [Kaggle, “Otto Group Product Classification Challenge: Evaluation”, 2015](https://www.kaggle.com/competitions/otto-group-product-classification-challenge/overview/citation)
3. [Kaggle, “Quora Question Pairs: 1st place solution”](https://www.kaggle.com/competitions/quora-question-pairs/writeups/dl-guys-1st-place-solution)
4. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

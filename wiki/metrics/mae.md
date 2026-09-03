---
layout: default
title: MAE
summary: 予測値が正解から平均でどれだけ外れたかを、誤差の絶対値でそのまま平均する回帰指標。
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

**MAE（Mean Absolute Error）は、「予測が正解から平均で何単位ずれているか」をそのまま測る回帰指標です。**

家賃を万円単位で予測してMAE=3.2なら、ざっくり「1件あたり平均3.2万円くらい外している」と読めます。誤差1は1、誤差10は10として数えるため、RMSEのように大外しだけを二乗で強く増幅しません（[scikit-learn: mean_absolute_error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#formula">数式</a>
  <a href="#comparison">RMSEとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず4件だけ計算してみる {#intuition}

<div class="html-table-wrap">
<table class="html-table" aria-label="MAEを4サンプルで計算する模式例">
  <thead><tr><th scope="col">Sample</th><th scope="col" class="numeric">正解</th><th scope="col" class="numeric">予測</th><th scope="col" class="numeric">誤差</th><th scope="col" class="numeric">絶対誤差</th></tr></thead>
  <tbody>
    <tr><th scope="row">A</th><td class="numeric">10</td><td class="numeric">12</td><td class="numeric">+2</td><td class="numeric">2</td></tr>
    <tr><th scope="row">B</th><td class="numeric">20</td><td class="numeric">19</td><td class="numeric">−1</td><td class="numeric">1</td></tr>
    <tr><th scope="row">C</th><td class="numeric">30</td><td class="numeric">34</td><td class="numeric">+4</td><td class="numeric">4</td></tr>
    <tr><th scope="row">D</th><td class="numeric">40</td><td class="numeric">37</td><td class="numeric">−3</td><td class="numeric">3</td></tr>
  </tbody>
</table>
</div>
<p class="table-caption">模式例。targetの単位は任意です。</p>

プラスとマイナスをそのまま平均すると打ち消し合うため、まず絶対値にします。上の例では`2 + 1 + 4 + 3 = 10`、4件で割るので**MAE=2.5**です。

<div class="model-architecture" aria-label="MAEの計算手順">
  <div class="model-architecture__header"><div><div class="model-architecture__title">方向を消して「外れ幅」だけを平均する</div><p class="model-architecture__subtitle">予測が上に外れたか下に外れたかではなく、距離だけを数えます。</p></div><span class="model-architecture__badge">error → absolute → mean</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Prediction<br>ŷ</span></div><span class="model-stage__label">予測</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>y − ŷ</strong><br>+ / − の誤差</span></div><span class="model-stage__label">difference</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>|y − ŷ|</strong><br>方向を消す</span></div><span class="model-stage__label">absolute error</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>平均</span></div><span class="model-stage__label">MAE</span></div>
  </div>
</div>

## 数式 {#formula}

この計算を全サンプルへ一般化した式が次です。

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i-\hat{y}_i|
$$

値は**小さいほど良く**、targetと同じ単位です。

## RMSEとの比較 {#comparison}

<div class="comparison-board" aria-label="MAEとRMSEの比較">
  <section class="comparison-card is-primary"><h4>MAE</h4><dl><dt>誤差1</dt><dd>1として数える</dd><dt>誤差10</dt><dd>10として数える</dd><dt>特徴</dt><dd>外れ幅を線形に扱う</dd></dl></section>
  <section class="comparison-card"><h4>RMSE</h4><dl><dt>計算途中</dt><dd>誤差を二乗</dd><dt>大外し</dt><dd>相対的に強く効く</dd><dt>特徴</dt><dd>巨大ミスをより嫌う</dd></dl></section>
</div>

<div class="static-viz html-chart" aria-label="MAEでは誤差に比例してペナルティが増える模式図">
  <div class="viz-heading"><div><div class="viz-title">MAEは誤差が2倍ならペナルティも2倍</div><p class="viz-subtitle">RMSEとの最大の違いは、大きな誤差を二乗で増幅しないことです。</p></div><span class="viz-badge">linear penalty</span></div>
  <div class="html-bar-chart">
    <div class="html-bar-row"><span class="html-bar-label">誤差 1</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">1</span></div>
    <div class="html-bar-row"><span class="html-bar-label">誤差 5</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:50"></span></span><span class="html-bar-value">5</span></div>
    <div class="html-bar-row is-highlight"><span class="html-bar-label">誤差 10</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:100"></span></span><span class="html-bar-value">10</span></div>
  </div>
  <p class="viz-caption">模式例。RMSEで外れ値を動かした場合の違いはRMSE記事のInteractiveで確認できます。</p>
</div>

どちらが上位互換という関係ではありません。Competition Metricに合わせて最適化します。

## Kaggleでの実例 {#kaggle-examples}

Optiver - Trading at the Closeは、予測returnと観測targetのMAEで評価されます（[Competition Evaluation](https://www.kaggle.com/competitions/optiver-trading-at-the-close/overview/evaluation/timeline/citation/evaluation)）。またLANL Earthquake Predictionもtime_to_failureのMAEを採用しています（[Competition](https://www.kaggle.com/competitions/LANL-Earthquake-Prediction)）。

時系列Competitionでは、Metricが単純なMAEでも**未来情報を使わないValidation**が不可欠です。

## 注意点 {#pitfalls}

### 大外しを特別扱いしない

誤差100は誤差10の10倍です。巨大ミスが致命的な問題では、MetricとしてRMSEなどの方が目的に合う場合があります。

### target変換

log変換targetで学習して逆変換する場合、log-spaceのMAEを見てもCompetitionの元スケールMAEとは一致しません。

### median寄りの最適解

絶対誤差を最小化する代表値はmeanではなくmedianです。Lossやpost-processingの設計にも影響します。

## Quick Reference {#quick-reference}

- MAE = 平均の絶対的な外れ幅。
- 小さいほど良い。
- targetと同じ単位なので解釈しやすい。
- 大外しを二乗で強調しない。
- RMSEと迷ったら「巨大ミスを特別に重く罰したいか」で考える。

## 関連項目

- [RMSE]({{ '/wiki/metrics/rmse.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. [scikit-learn, “mean_absolute_error”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html)
2. [Kaggle, “Optiver - Trading at the Close: Evaluation”, 2023](https://www.kaggle.com/competitions/optiver-trading-at-the-close/overview/evaluation/timeline/citation/evaluation)
3. [Kaggle, “LANL Earthquake Prediction: Evaluation”, 2019](https://www.kaggle.com/competitions/LANL-Earthquake-Prediction)
4. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

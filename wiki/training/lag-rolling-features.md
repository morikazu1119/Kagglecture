---
layout: default
title: Lag / Rolling Features
summary: 過去の値と過去区間の統計を特徴量へ変換し、時系列の自己相関・季節性・局所trendをGBDT等へ渡す。
type: reference
domain: kaggle
topic: lag-rolling-features
created: 2026-09-07
updated: 2026-09-07
source_count: 8
tags:
  - kaggle
  - feature-engineering
  - time-series
  - forecasting
---

# Lag / Rolling Features

**Lag Featuresは「少し前の値」、Rolling Featuresは「少し前までの区間の統計」を現在行の特徴量にする手法です。**

時系列の予測では、未来のtargetそのものは見えませんが、過去の値には自己相関・曜日周期・trend・volatilityが残っています。Lag / Rollingは、その履歴をLightGBMやXGBoostなど通常のtabular modelが扱える列へ変換します。

最重要の前提は、**予測時点より後の情報を絶対に混ぜないこと**です。rolling meanを作るだけでも、shiftの位置を間違えるとtarget leakageになります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

<h2 id="use-cases">使う場面</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>直近値が効く</h4><dl><dt>候補</dt><dd>lag 1 / 2 / 3</dd><dt>例</dt><dd>前日の売上、直前lap、直近sensor値</dd></dl></section>
  <section class="comparison-card"><h4>周期がある</h4><dl><dt>候補</dt><dd>lag 7 / 14 / 28など</dd><dt>例</dt><dd>曜日周期、月次周期、seasonality</dd></dl></section>
  <section class="comparison-card"><h4>局所trendを見たい</h4><dl><dt>候補</dt><dd>rolling mean / median</dd><dt>意味</dt><dd>単日のnoiseをならして最近の水準を渡す</dd></dl></section>
  <section class="comparison-card"><h4>変動の大きさを見たい</h4><dl><dt>候補</dt><dd>rolling std / min / max</dd><dt>意味</dt><dd>最近のvolatilityや局所的なextremeを渡す</dd></dl></section>
</div>

Lagを何本も追加すること自体が目的ではありません。**「予測時点で本当に観測できる過去情報のうち、どの時間幅がtarget生成過程を表すか」**を決めるのが本質です。

<h2 id="mechanism">仕組み</h2>

### Lagは「時間をずらして過去を横に置く」

時点 `t` のtargetを予測するとき、lag 1は `t-1`、lag 7は `t-7` の値です。

<div class="static-viz html-diagram" role="img" aria-label="時点tを予測するために過去のt-1とt-7をLag特徴量として参照する模式図">
  <div class="html-flow">
    <div class="html-flow-node"><strong>t-7</strong><br>1週間前<br><small>lag_7</small></div>
    <div class="html-flow-node"><strong>t-2</strong><br>2日前</div>
    <div class="html-flow-node"><strong>t-1</strong><br>直前<br><small>lag_1</small></div>
    <div class="html-flow-node"><strong>t</strong><br>予測対象</div>
  </div>
  <p class="viz-note">模式例。右へ時間が進む。予測対象tより左側だけをfeatureとして使う。</p>
</div>

式では、元の系列を $y_t$ とするとlag $k$ は次です。

$$
\mathrm{lag}_k(t)=y_{t-k}
$$

lag 1が強ければ「直前の状態が続きやすい」、lag 7が強ければ「7日前と似た周期がある」といった構造をmodelが利用できます。

Kaggle LearnのTime Series教材でも、lagを「未来を過去から予測するための特徴表現」として基本要素に置いています（[Kaggle Learn: Time Series](https://www.kaggle.com/learn/time-series)）。

### Rollingは「過去の一定区間を1値に圧縮する」

rolling mean 7は、予測時点より前の7観測の平均です。

$$
\mathrm{rollmean}_7(t)=\frac{1}{7}\sum_{i=1}^{7}y_{t-i}
$$

重要なのは総和が **$t-1$ から始まる**点です。予測対象 `t` のtargetを含めてはいけません。

<div class="static-viz html-diagram" role="img" aria-label="予測時点tのrolling mean 4がt-4からt-1だけを集約する模式図">
  <div class="comparison-board">
    <section class="comparison-card"><h4>t-4</h4><dl><dt>値</dt><dd>window内</dd></dl></section>
    <section class="comparison-card"><h4>t-3</h4><dl><dt>値</dt><dd>window内</dd></dl></section>
    <section class="comparison-card"><h4>t-2</h4><dl><dt>値</dt><dd>window内</dd></dl></section>
    <section class="comparison-card"><h4>t-1</h4><dl><dt>値</dt><dd>window内</dd></dl></section>
    <section class="comparison-card is-primary"><h4>t</h4><dl><dt>役割</dt><dd>予測対象。集約に入れない</dd></dl></section>
  </div>
  <p class="viz-note">模式例。rolling windowを4とした場合。実測値ではない。</p>
</div>

rollingでよく使う統計はmeanだけではありません。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>特徴</th><th>拾いやすい情報</th><th>向く状況</th></tr></thead>
  <tbody>
    <tr><td>rolling mean / median</td><td>最近の水準・trend</td><td>単日のnoiseをならしたい</td></tr>
    <tr><td>rolling std</td><td>最近の変動幅</td><td>volatility自体がsignal</td></tr>
    <tr><td>rolling min / max</td><td>局所extreme</td><td>直近の上限・下限が重要</td></tr>
    <tr><td>rolling sum</td><td>期間内の累積量</td><td>需要量・回数・負荷</td></tr>
    <tr><td>rolling quantile</td><td>分布の位置</td><td>外れ値にmeanが引っ張られる</td></tr>
  </tbody>
</table></div>

### LagとRollingは役割が違う

lag 7は「ちょうど7日前」という一点を保持します。rolling mean 7は「直近7点の平均」に圧縮します。

そのため、**周期の位相を保持したいならLag、最近の水準を安定して渡したいならRolling**が基本です。実際には両方を併用し、modelへ違う時間解像度を渡すことが多くなります。

<h2 id="comparison">使い分け</h2>

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>手法</th><th>保持するもの</th><th>強み</th><th>主な弱点</th></tr></thead>
  <tbody>
    <tr><td><strong>Lag</strong></td><td>特定時点の値</td><td>周期・遅延効果を直接保持</td><td>本数を増やすと冗長になりやすい</td></tr>
    <tr><td><strong>Rolling</strong></td><td>過去区間の統計</td><td>noiseを圧縮し局所trendを表現</td><td>window内の細かな順序を失う</td></tr>
    <tr><td>Expanding</td><td>開始点から現在までの統計</td><td>長期baselineを表現</td><td>最近のregime changeへ鈍い</td></tr>
    <tr><td>EWMA</td><td>過去を指数減衰で重み付け</td><td>直近を強く見ながらsmooth</td><td>decay設定が必要</td></tr>
    <tr><td>Datetime Features</td><td>曜日・月・時刻等</td><td>calendar由来のseasonality</td><td>target履歴そのものは使わない</td></tr>
  </tbody>
</table></div>

### window / lag幅は周期から決める

`1, 2, 3, 4, ...`と無差別に増やすより、dataの周期を仮説にします。

- 日次売上で週周期があるならlag 7 / 14 / 28
- 直近のmomentumならlag 1 / 2 / 3
- 1週間の局所水準ならrolling 7
- 月近辺のbaselineならrolling 28 / 30

2026年1月の日本語記事でも、Kaggle Store Salesを例にACF / PACFや周期性を確認したうえでlag 1 / 7 / 14とrolling mean 7を設計しています（[Qiita: 時系列分析・予測のための基礎知識とKaggle実装例](https://qiita.com/soranjiro/items/f18bf11db47f972f4c6d)）。二次情報なのでCompetition固有の効果主張には使わず、設計手順の補助として扱います。

<h2 id="kaggle-examples">Kaggleでの実例</h2>

### MITSUI&CO. Commodity Prediction Challenge — 2026

2026年1月のMITSUI&CO. Commodity Prediction Challengeでは、複数の上位解法が時間方向の履歴を明示的に使っています。

25位Silver解法はgroup-wise ensembleに加え、**提供されたlabel lag 1–4をinference時に強く利用し、それを最も重要なperformance gainと説明**しています（[25th Place Silver Solution](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/25th-place-silver-mitsui-commodity-prediction)）。単独ablation値は公開されていないため、Evidence Bとして扱います。

3位解法ではvolatileなmarket signalへ保守的なtime-series feature engineeringを適用し、lag、rolling mean、rolling max、differenceを使用しています。rolling windowはregime overfitを避けるためmoderateな幅に抑えたと説明しています（[3rd Place Solution](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/3-rd-place-solution-directional-trends-over-vola)）。これも単独の定量差はないためEvidence Bです。

この2解法から一般化できるのは、**volatile seriesでは履歴を大量に足すことより、lagで方向性・rollingで安定した局所contextを与える設計が使われている**点です。

### M5 Forecasting — 3位 / 7位

M5 Forecasting - Accuracyは大量の商品×店舗の日次需要を予測する代表的なKaggle forecasting competitionです。

3位NN解法はsale valueとして**lag 1と7日・28日のmoving average**を入力し、28日先までrolling predictionする学習構造を採用しています（[3rd place solution - NN approach](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/mf-3rd-place-solution-nn-approach)）。

7位LightGBM解法はsales featureとして**recursive 7日・14日のlagged rolling meansと28日のlagged rolling means**を使いました。Validationは過去から未来を予測する複数の時間区間で構成しています（[7th place solution](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/randomlearner-7th-place-solution)）。

一方、別のM5上位解法では「同じ性質のlagを増やしすぎると悪化した」と報告されています（[M5 Forecasting discussion](https://www.kaggle.com/c/m5-forecasting-accuracy/discussion/163664)）。**Lag / Rollingは本数が多いほど良いわけではない**という失敗Evidenceとして重要です。

### ASHRAE Energy Prediction — 1位

ASHRAE Energy Prediction 1位解法では、raw weatherだけでなく**lag temperature features、smoothed temperature、1次・2次差分**をfeature engineeringへ採用しています（[1st Place Solution Team Isamu & Matt](https://www.kaggle.com/competitions/ashrae-energy-prediction/writeups/isamu-matt-1st-place-solution-team-isamu-matt)）。

これはtarget自身のlagだけでなく、**時間変化する説明変数のlag / smooth / differenceも有効候補になる**ことを示す事例です。target履歴がtest期間に利用できないCompetitionでも、観測可能なcovariate履歴なら使える場合があります。

### Evidence整理

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>Competition</th><th>Rank</th><th>利用例</th><th>Evidence</th></tr></thead>
  <tbody>
    <tr><td>MITSUI Commodity Prediction</td><td>3rd</td><td>lag / rolling mean / max / difference</td><td>B</td></tr>
    <tr><td>MITSUI Commodity Prediction</td><td>25th Silver</td><td>label lag 1–4をinferenceで活用</td><td>B</td></tr>
    <tr><td>M5 Forecasting</td><td>3rd</td><td>lag 1 + moving average 7 / 28</td><td>B</td></tr>
    <tr><td>M5 Forecasting</td><td>7th</td><td>lagged rolling mean 7 / 14 / 28</td><td>B</td></tr>
    <tr><td>ASHRAE Energy Prediction</td><td>1st</td><td>lag / smooth / difference of temperature</td><td>B</td></tr>
  </tbody>
</table></div>

複数の独立した上位解法で同傾向が確認できるため、「履歴が利用可能な時系列taskでLag / Rollingが再利用可能なfeature familyである」という一般化はEvidence C相当と判断できます。ただし、どのlag/windowが効くかはCompetitionごとに異なります。

<h2 id="pitfalls">注意点</h2>

### 1. Rolling前にshiftしないと現在targetが混ざる

時点`t`のtargetを予測するのに、`rolling(7).mean()`をそのまま計算すると実装によっては`t`自身をwindowへ含めます。

conceptualには次の順序です。

```python
past = target.shift(1)
feature = past.rolling(7).mean()
```

**shiftして未来との境界を作ってからrollingする**と覚える方が安全です。

### 2. Groupごとに履歴を作る

店舗Aの前日の売上を店舗Bのlagとして使ってはいけません。複数entityのpanel dataでは、store / user / machine / itemなど**履歴が連続する単位でgroup化してからshift / rolling**します。

### 3. Validation horizonとfeature availabilityを一致させる

1日先予測ではlag 1が自然でも、28日を一括予測すると途中の日の真値は未知です。M5のようなmulti-step forecastingでは、recursive prediction、direct prediction、利用可能lagをどこまで固定するかでfeature availabilityが変わります。

関連するsplit設計は[Time Series Split]({{ '/wiki/validation/time-series-split.html' | relative_url }})を参照します。

### 4. Test期間で更新できるfeatureか確認する

「昨日のtarget」をlagにしたくても、test期間の昨日targetが非公開なら使えません。逆にweatherやpriceなどtest期間にも提供されるcovariateなら、その履歴を作れる場合があります。

**Trainで作れたかではなく、実際のinference時点で同じ方法で作れるか**を確認します。

### 5. 同じようなLagを増やしすぎない

lag 1〜100、rolling 3〜100を全投入すると、強い相関を持つ列が大量に増えます。tree modelでもmemory・training time・selection noiseが増え、Validationへ過適合しやすくなります。M5でも類似lagの過剰追加が悪化要因として報告されています。

### 6. Windowがregimeをまたぐ

長すぎるrolling windowは、現在とは異なる古いregimeを平均へ混ぜます。MITSUI 3位解法がmoderate windowを選んだ理由も、volatile marketでのregime overfitを抑えるためでした。

<h2 id="quick-reference">Quick Reference</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>直近依存</h4><dl><dt>候補</dt><dd>lag 1 / 2 / 3</dd><dt>確認</dt><dd>inference時に同じ値を取得可能か</dd></dl></section>
  <section class="comparison-card"><h4>周期依存</h4><dl><dt>候補</dt><dd>lag 7 / 14 / 28など</dd><dt>決め方</dt><dd>業務周期・ACF・seasonalityから仮説化</dd></dl></section>
  <section class="comparison-card"><h4>局所水準</h4><dl><dt>候補</dt><dd>shift → rolling mean / median</dd><dt>注意</dt><dd>現在targetをwindowへ入れない</dd></dl></section>
  <section class="comparison-card"><h4>変動幅</h4><dl><dt>候補</dt><dd>rolling std / min / max</dd><dt>注意</dt><dd>windowを増やしすぎない</dd></dl></section>
  <section class="comparison-card"><h4>Panel data</h4><dl><dt>必須</dt><dd>entityごとにshift / rolling</dd><dt>確認</dt><dd>entity境界をまたいでいないか</dd></dl></section>
  <section class="comparison-card"><h4>Multi-step</h4><dl><dt>必須</dt><dd>forecast horizon全体のfeature availability確認</dd><dt>Validation</dt><dd>本番と同じhorizonで検証</dd></dl></section>
</div>

## 関連項目

- [Time Series Split]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [Aggregation Features]({{ '/wiki/training/aggregation-features.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})
- [Early Stopping]({{ '/wiki/training/early-stopping.html' | relative_url }})

## 参考文献

1. Kaggle, **Learn Time Series**, Kaggle Learn. https://www.kaggle.com/learn/time-series
2. **3 rd place solution - Directional Trends Over Volatile Noise**, MITSUI&CO. Commodity Prediction Challenge, Kaggle Solution Writeup, 2026. https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/3-rd-place-solution-directional-trends-over-vola
3. **25th Place Silver – MITSUI&CO. Commodity Prediction Challenge Writeup**, Kaggle Solution Writeup, 2026-01-20. https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/25th-place-silver-mitsui-commodity-prediction
4. **3rd place solution - NN approach**, M5 Forecasting - Accuracy, Kaggle Solution Writeup, 2020. https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/mf-3rd-place-solution-nn-approach
5. **7th place solution**, M5 Forecasting - Accuracy, Kaggle Solution Writeup, 2020. https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/randomlearner-7th-place-solution
6. **1st Place Solution Team Isamu & Matt**, ASHRAE - Great Energy Predictor III, Kaggle Solution Writeup, 2019. https://www.kaggle.com/competitions/ashrae-energy-prediction/writeups/isamu-matt-1st-place-solution-team-isamu-matt
7. **M5 Forecasting - Accuracy discussion / solution notes**, Kaggle, 2020. https://www.kaggle.com/c/m5-forecasting-accuracy/discussion/163664
8. soranjiro, **時系列分析・予測のための基礎知識とKaggle実装例**, Qiita, 2026-01-14 / updated 2026-01-15. https://qiita.com/soranjiro/items/f18bf11db47f972f4c6d

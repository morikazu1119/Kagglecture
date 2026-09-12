---
layout: default
title: Purged / Embargo Cross-Validation
summary: label期間の重なりと時系列相関によるリークを、purgingとembargoで除く時系列Validation。
type: reference
domain: kaggle
topic: purged-embargo-cv
created: 2026-09-13
updated: 2026-09-13
source_count: 8
tags:
  - kaggle
  - validation
  - time-series
  - finance
  - leakage
---

# Purged / Embargo Cross-Validation

**Purged / Embargo Cross-Validationは、Validation期間と情報を共有するTrain行を除外して、時系列リークを減らす分割です。**

特に「今日のrowのlabelが、翌5日間の価格から決まる」のように**1行のlabelが未来区間を使う**場合、単純なTimeSeriesSplitの境界だけではTrain/Validationのlabel期間が重なります。Purgingは重なったTrain行を削り、EmbargoはValidation直後に追加のbufferを置きます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

- forward returnなど、**labelが複数時点の未来値から計算される**。
- event開始時刻と終了時刻があり、sample同士の情報区間が重なる。
- 価格・需要・センサ系列などで、Validation境界付近の自己相関が強い。
- 金融系Competitionで通常KFoldや単純TimeSeriesSplitのCVが過度に高く見える。
- 複数の時間bucketを組み替えて、1本のbacktest pathだけでなく安定性も確認したい。

単に「時系列だからpurged CV」ではありません。**予測対象の情報区間がTrain/Validationをまたいで重なるか**が最初の判断軸です。

## 仕組み {#mechanism}

最も分かりにくい点は、**rowのtimestampが分かれていても、labelが参照する時間区間は重なり得る**ことです。

たとえば時点 `t` のlabelが `t+3` までのforward returnなら、Validation開始直前のTrain rowもValidation期間の価格を使ってlabel化されています。このTrain rowを残すと、Validation期間の情報が学習labelへ入ります。

<div class="static-viz html-diagram" aria-label="PurgingとEmbargoの模式図">
  <div class="viz-heading">
    <div>
      <div class="viz-title">境界のrowではなく、labelが使う時間区間を見る</div>
      <p class="viz-subtitle">模式例。実測値ではありません。</p>
    </div>
    <span class="viz-badge">past → future</span>
  </div>
  <div class="html-matrix" style="--matrix-cols: 9">
    <div class="matrix-cell is-header"></div><div class="matrix-cell is-header">t1</div><div class="matrix-cell is-header">t2</div><div class="matrix-cell is-header">t3</div><div class="matrix-cell is-header">t4</div><div class="matrix-cell is-header">t5</div><div class="matrix-cell is-header">t6</div><div class="matrix-cell is-header">t7</div><div class="matrix-cell is-header">t8</div><div class="matrix-cell is-header">t9</div>
    <div class="matrix-cell is-header">Naive</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div>
    <div class="matrix-cell is-header">Purged</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell">Train</div><div class="matrix-cell is-bad">Purge</div><div class="matrix-cell is-bad">Purge</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell is-good">Valid</div><div class="matrix-cell is-bad">Embargo</div><div class="matrix-cell">Train</div>
  </div>
  <p class="viz-caption">PurgingはValidationのlabel区間と重なるTrain sampleを除去。EmbargoはValidation直後にも追加bufferを置き、近接期間の依存を弱めます。</p>
</div>

### Purging

Purgingは、**Validation sampleのlabel情報区間と重なるTrain sampleを削除**します。forward horizonが長いほど、境界から離れたrowまで除外対象になり得ます。

「Train末尾から固定で3行削る」と同義ではありません。本来は各sampleの`label_start`と`label_end`を基準にoverlapを判定します。近年のpurged CV実装でも、purgingは「test期間のlabelと時間的にoverlapするtraining labelを除く処理」と定義されています（[purgedcv documentation](https://eslazarev.github.io/purged-cross-validation/)、[ML4T Diagnostic](https://www.ml4trading.io/docs/diagnostic/methods/cpcv/)）。

### Embargo

Embargoは、Validation期間の直後に**追加のno-train buffer**を置く処理です。Purgingが明示的なlabel overlapを対象にするのに対し、Embargoは近接時点のserial correlationや遅延影響を保守的に遮断するために使います（[skfolio documentation](https://skfolio.org/generated/skfolio.model_selection.CombinatorialPurgedCV.html)）。

### CPCV: Combinatorial Purged Cross-Validation

CPCVは、時系列を複数groupへ分け、**複数groupの組み合わせをtestとして評価**します。Purging / Embargoを適用しながら複数のout-of-sample pathを作れるため、1本のwalk-forwardだけに依存した評価より、regimeごとのばらつきを観察しやすくなります（[ML4T Diagnostic](https://www.ml4trading.io/docs/diagnostic/methods/cpcv/)）。

ただし組み合わせ数は急増します。6 groupから2 groupをtestに選ぶだけでも15組なので、modelが重い場合は通常のpurged splitの方が実用的です。

## 使い分け {#comparison}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>方法</th><th>守るもの</th><th>向く状況</th><th>主な弱点</th></tr></thead>
  <tbody>
    <tr><td>TimeSeriesSplit</td><td>過去→未来の順序</td><td>通常の未来予測</td><td>label horizon overlapまでは自動で防がない</td></tr>
    <tr><td>Gap付きTimeSeriesSplit</td><td>境界buffer</td><td>固定gapで十分な系列</td><td>sampleごとにlabel終了時刻が違う場合は粗い</td></tr>
    <tr><td><strong>Purged CV</strong></td><td>label情報区間</td><td>forward return、event label、重複horizon</td><td>Train量が減る</td></tr>
    <tr><td>Purged + Embargo</td><td>overlap + 近接依存</td><td>金融など自己相関が強い</td><td>buffer過大でunderfitしやすい</td></tr>
    <tr><td>CPCV</td><td>overlap + 複数OOS path</td><td>regime依存とbacktest安定性を見たい</td><td>計算量が大きい</td></tr>
  </tbody>
</table>
</div>

**未来のデータで学習して過去を評価してよいか**はCompetitionの本番設定次第です。通常のforecastingで本番が「過去→未来」の一方向なら、walk-forward / rolling validationを第一候補にし、必要な境界だけpurgeする方が本番再現性は高くなります。

## Kaggleでの実例 {#kaggle-examples}

### MITSUI&CO. Commodity Prediction Challenge — 15th place, 2026

15位解法はinitial trainingで**CombinatorialPurgedGroupKFold、5 splits / 1 test split**を使用し、Purgingで隣接期間のリークを防ぎ、Embargoで自己相関を考慮したbufferを置いたと説明しています（[15th Place Solution Writeup](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/mitsui-and-co-commodity-prediction-challenge-15th)）。

最終解法の中心は7日ごとのonline retrainingで、purged CV単独のablation値は公開されていません。そのためEvidenceは**B: 上位解法本人が採用・必要性を明示**として扱います。

### DRW - Crypto Market Prediction — 1st place, 2025

1位解法は**Purged Group Time Series Split**を採用し、6 group（およそ各2か月）、`gap=1`としてtest group前後の近接期間を除外しています（[1st Place Solution](https://www.kaggle.com/competitions/drw-crypto-market-prediction/writeups/drw-solution-1st)）。

この解法でもCV方式単独のablationは示されていませんが、最終1位解法で明示的に採用されています。金融データで時間順序と近接依存を同時に意識した例としてEvidence Bです。

### Jane Street Market Prediction — 1st / 10th place

1位解法は**5-fold 31-gap purged group time-series split**を使用しています（[1st Place Solution](https://www.kaggle.com/competitions/jane-street-market-prediction/writeups/cats-trading-yirun-s-solution-1st-place-training-s)）。さらに10位解法でも、partnerが**k-fold purged cross validation**でneural networkを選択したと記載しています（[10th Place Solution](https://www.kaggle.com/competitions/jane-street-market-prediction/writeups/float-10th-place-solution-geometric-brownian-motio)）。

独立した上位解法で同系統のValidationが使われているため、**金融時系列でpurged validationが繰り返し採用されている**という点はEvidence Cです。

## 注意点 {#pitfalls}

### Purge幅を「なんとなく」で決める

forward 5日returnなら、最低限どのsampleのlabelがどこまで未来を参照するかを確認します。featureのrolling window、label horizon、データ公開遅延を混同しないようにします。

### Embargoを大きくしすぎる

bufferを広げれば安全になる一方、Train dataが減り、古いregimeしか学習できなくなることがあります。**安全性とeffective sample sizeのtrade-off**です。

### feature側のリークを放置する

Purged CVが守るのはsplit境界です。rolling mean、target encoding、normalization、feature selectionを全期間で先に計算すれば別のリークが残ります。

### 本番方向と逆のCVを使う

KFold型のpurged CVでは、あるtest groupより未来のgroupがTrainに入る構成もあり得ます。本番が純粋なfuture forecastingなら、それが許されるかを必ず確認します。Kaggle上でもPurged KFoldに対し「futureでtrainしpastをvalidateすることへの懸念」が議論されています（[Jane Street discussion](https://www.kaggle.com/competitions/jane-street-real-time-market-data-forecasting/discussion/546392)）。

### CPCVを目的化する

CPCVは強力ですが、重いmodelで全組み合わせを回すとexperiment速度が落ちます。まずTimeSeriesSplit / rolling splitでCV-LB整合を確認し、**評価分散そのものが問題になったとき**にCPCVを検討する方が実践的です。

## Quick Reference {#quick-reference}

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>label期間が重なる</h4><dl><dt>第一候補</dt><dd>Purging</dd><dt>確認</dt><dd>sampleごとのlabel end</dd></dl></section>
  <section class="comparison-card"><h4>近接時点も強く依存</h4><dl><dt>追加</dt><dd>Embargo</dd><dt>注意</dt><dd>Train量減少</dd></dl></section>
  <section class="comparison-card"><h4>未来予測が本番</h4><dl><dt>基本</dt><dd>Walk-forward / rolling</dd><dt>併用</dt><dd>必要境界だけpurge</dd></dl></section>
  <section class="comparison-card"><h4>regime別安定性を見たい</h4><dl><dt>候補</dt><dd>CPCV</dd><dt>代償</dt><dd>計算量増加</dd></dl></section>
</div>

## 関連項目

- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [Data Leakage]({{ '/wiki/validation/data-leakage.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [Lag / Rolling Features]({{ '/wiki/training/lag-rolling-features.html' | relative_url }})

## 参考文献

1. Lonnie, “MITSUI&CO. Commodity Prediction Challenge - 15th Place Solution Writeup”, Kaggle, 2026. https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/writeups/mitsui-and-co-commodity-prediction-challenge-15th
2. “DRW solution 1st”, DRW - Crypto Market Prediction, Kaggle, 2025. https://www.kaggle.com/competitions/drw-crypto-market-prediction/writeups/drw-solution-1st
3. VECTOR, Yirun Zhang, Mingjie Wang, Colton Smith, yuanzhe zhou, “Yirun's Solution (1st place): Training Supervised Autoencoder with MLP”, Jane Street Market Prediction, Kaggle, 2021. https://www.kaggle.com/competitions/jane-street-market-prediction/writeups/cats-trading-yirun-s-solution-1st-place-training-s
4. Neil Hazra, Amartya Ranganathan, Daniel Cheng, “10th Place Solution: Geometric Brownian Motion and Mixture Density Networks”, Jane Street Market Prediction, Kaggle, 2021. https://www.kaggle.com/competitions/jane-street-market-prediction/writeups/float-10th-place-solution-geometric-brownian-motio
5. ML4T Diagnostic, “Combinatorial Purged Cross-Validation”, documentation, 2026. https://www.ml4trading.io/docs/diagnostic/methods/cpcv/
6. skfolio, “CombinatorialPurgedCV”, documentation. https://skfolio.org/generated/skfolio.model_selection.CombinatorialPurgedCV.html
7. eslazarev, “purgedcv”, documentation, 2026. https://eslazarev.github.io/purged-cross-validation/
8. ymd, “CPCV(Combinatorial Purged Cross-Validation)法”, Zenn, 2021. https://zenn.dev/ymd/articles/fd08fb46bc868c

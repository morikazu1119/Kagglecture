---
layout: default
title: TabM
summary: 1つのMLP内に複数memberをparameter-efficientに持たせ、複数予測をまとめて平均するtabular deep learning architecture。
type: reference
domain: kaggle
topic: tabm
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, tabular, mlp, tabm, ensemble]
---

# TabM

**TabMは、複数の独立MLPを完全に別々に持つ代わりに、大部分のweightを共有しつつmemberごとの差分parameterを持たせ、1つのnetwork内で複数predictionを作るtabular modelです。**

狙いは**Parameter-Efficient Ensembling**です。単一MLPの不安定さをensembleで減らしたい一方、8個のMLPをそのまま8倍のparameter/計算で持つのは重い。その間を狙います（[TabM paper](https://arxiv.org/abs/2410.24210)）。

<nav class="article-jump-nav"><a href="#members">複数member</a><a href="#architecture">全体構造</a><a href="#why">なぜ効くか</a><a href="#comparison">RealMLPとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 rowから複数predictionを同時に出す {#members}

普通のensembleなら、Model A/B/Cへ同じrowを3回入れて3 predictionを作ります。TabMは**1つの共有networkの中にK memberの差分を持ち、K個のpredictionを同じforward frameworkで作ります**。

<div class="model-architecture" aria-label="TabM multiple members">
  <div class="model-architecture__header"><div><div class="model-architecture__title">共有weight + member-specific modulationでK個の予測を作る</div><p class="model-architecture__subtitle">完全独立Kモデルよりparameterを共有しながらensemble効果を狙います。</p></div><span class="model-architecture__badge">parameter-efficient ensemble</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>1 Row</span></div></div><div class="model-stage"><div class="model-op-box"><span>Shared<br>MLP weights</span></div></div><div class="model-stage"><div class="model-op-box"><span>Member 1<br>modulation</span></div></div><div class="model-stage"><div class="model-op-box"><span>Member 2</span></div></div><div class="model-stage"><div class="model-op-box"><span>… Member K</span></div></div><div class="model-stage"><div class="model-tensor"><span>ŷ₁ … ŷₖ</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Mean /<br>Aggregate</span></div></div></div>
</div>

論文ではBatchEnsemble系のrank-1 factorを応用し、layer weightをmemberごとに丸ごと複製せず差を作ります。

## TabM全体 {#architecture}

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">Tabular representation → TabM layer stack → K heads → ensemble prediction</div><p class="model-architecture__subtitle">各member単体は弱くても、集合として強いという挙動が報告されています。</p></div><span class="model-architecture__badge">full architecture</span></div><div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Table Row</span></div></div><div class="model-stage"><div class="model-op-box"><span>Feature<br>Encoding</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>TabM Layer<br>× L</span></div></div><div class="model-stage"><div class="model-tensor"><span>K member<br>representations</span></div></div><div class="model-stage"><div class="model-op-box"><span>K predictions</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Average<br>ŷ</span></div></div></div></div>

## なぜ複数memberが効くか {#why}

同じdata・同じMLP architectureでも、parameterやfeature modulationが少し違えばerrorが完全には一致しません。平均すると個々のrandom errorを相殺できます。

<div class="comparison-board"><section class="comparison-card"><h4>Single MLP</h4><dl><dt>Prediction</dt><dd>1本</dd><dt>Variance</dt><dd>seedやoptimizationの影響を直接受ける</dd></dl></section><section class="comparison-card"><h4>K independent MLPs</h4><dl><dt>Prediction</dt><dd>K本平均</dd><dt>Cost</dt><dd>parameter/computeがほぼK倍</dd></dl></section><section class="comparison-card is-primary"><h4>TabM</h4><dl><dt>Prediction</dt><dd>K member平均</dd><dt>Cost</dt><dd>共有parameterでK独立modelより軽くする</dd></dl></section></div>

TabM論文ではmember個別predictionは弱くても、集合として強いというensemble-like behaviorを分析しています。

## RealMLPとの違い {#comparison}

RealMLPも強いMLPですが、主眼が違います。

- **RealMLP**: 強いpreprocessing・training defaultsを持つ単体MLP baseline。
- **TabM**: MLP内部にparameter-efficientな複数memberを持たせるensemble architecture。

実際のKaggleでは両方を別model familyとしてensembleする例があります。

## Kaggleでの実例 {#kaggle-examples}

Predict Customer Churn 2026の17位解法では`tabm_61`がfinal Hill Climbing weight +0.15を取り、RealMLPやXGBoostと並ぶ主要memberになっています（[17th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)）。

同Competitionの9位解法でもTabM、RealMLP、FT-Transformer等を同じstrict Stratified K-Fold上で大量比較しています（[9th place solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution)）。

Prediction Interval Competition II 2025の3位解法は**TabM + RealMLP + ensembling**を非常に短いpipelineで組み合わせています（[3rd place solution](https://www.kaggle.com/competitions/prediction-interval-competition-ii-house-price/discussion/591534)）。

## 注意点 {#pitfalls]

### member数を増やせば無限に良くなるわけではない

member間predictionが高相関なら限界効用は下がります。KとruntimeをOOFで比較します。

### 外部seed ensembleとの重複

TabM自体がensemble-likeでも、複数seedのTabMをさらにensembleする価値はtask次第です。prediction correlationを測ります。

### TabM内部平均とCompetition ensembleを区別する

TabMのK members平均は1 model family内部のaggregationです。さらにLightGBM/RealMLP等とblendする外部ensembleは別レイヤです。

## Quick Reference

- 1 model内にK member。
- shared weight + member-specific modulation。
- K predictionsを平均。
- 独立Kモデルよりparameter-efficientなensembleを狙う。
- RealMLPとは目的が違い、両方をensembleできる。

## 関連項目

- [RealMLP]({{ '/wiki/modeling/realmlp.html' | relative_url }})
- [FT-Transformer]({{ '/wiki/modeling/ft-transformer.html' | relative_url }})
- [TabPFN]({{ '/wiki/modeling/tabpfn.html' | relative_url }})
- [Fold / Seed Ensemble]({{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }})

## 参考文献

1. Gorishniy et al., “TabM: Advancing Tabular Deep Learning with Parameter-Efficient Ensembling”, 2024. https://arxiv.org/abs/2410.24210
2. pytabkit repository. https://github.com/dholzmueller/pytabkit
3. Kaggle, “Predict Customer Churn: 17th Place Solution”, 2026. https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution
4. Kaggle, “Predict Customer Churn: 9th place solution”, 2026. https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution
5. Kaggle, “Prediction Interval Competition II: 3rd place solution”, 2025. https://www.kaggle.com/competitions/prediction-interval-competition-ii-house-price/discussion/591534

---
layout: default
title: RealMLP
summary: tabular向け前処理・numeric embedding・regularization・training defaultsをmeta-tuningし、強いdefault性能を狙うMLP。
type: reference
domain: kaggle
topic: realmlp
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, tabular, mlp, realmlp]
---

# RealMLP

**RealMLPは、単純なMulti-Layer Perceptron（MLP）を土台にしながら、tabular data向けの前処理・embedding・activation・regularization・learning-rate設定をまとめて最適化したモデルです。**

新しいAttention mechanismを発明するタイプではなく、**「普通のMLPを本気で強くするとどこまで行けるか」**を追求します。多数datasetでmeta-tuningしたdefault設定により、毎回大規模HPOをしなくても強いbaselineを狙います（[RealMLP paper](https://arxiv.org/abs/2407.04491)）。

<nav class="article-jump-nav"><a href="#row">1 rowの処理</a><a href="#architecture">全体構造</a><a href="#defaults">何がRealか</a><a href="#comparison">他Tabular DLとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 rowをどう処理するか {#row}

基本は、数値・カテゴリfeatureをNNへ入れやすい表現に変え、すべてを1つのvectorへまとめてMLPへ通します。

<div class="model-architecture" aria-label="RealMLP one row processing">
  <div class="model-architecture__header"><div><div class="model-architecture__title">数値とカテゴリを整え、1本のfeature vectorとしてResidual MLPへ</div><p class="model-architecture__subtitle">複雑なfeature-to-feature Attentionではなく、強いencoding + MLPを重視します。</p></div><span class="model-architecture__badge">tabular MLP</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Numeric<br>features</span></div></div><div class="model-stage"><div class="model-op-box"><span>Scaling /<br>Embeddings</span></div></div><div class="model-stage"><div class="model-tensor"><span>Categorical<br>features</span></div></div><div class="model-stage"><div class="model-op-box"><span>Category<br>Embeddings</span></div></div><div class="model-stage"><div class="model-op-box"><span>Concat</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Dense<br>Vector</span></div></div></div>
</div>

数値featureを生値1個のまま入れるだけでなく、piecewise/periodic的なnumeric embeddingなど、非線形関係を学びやすいrepresentationを使う構成があります。

## RealMLP全体 {#architecture}

<div class="model-architecture" aria-label="RealMLP full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Preprocess → Feature representation → MLP blocks → Output</div><p class="model-architecture__subtitle">architecture自体は比較的単純で、training recipeとdefaultsまで含めてmodelとして扱います。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Table Row</span></div></div><div class="model-stage"><div class="model-op-box"><span>Robust<br>Preprocess</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Numeric + Cat<br>Representations</span></div></div><div class="model-stage"><div class="model-op-box"><span>MLP Blocks<br>+ Regularization</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Hidden<br>Representation</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Class / Value</span></div></div></div>
</div>

## 「強いdefault」が中心 {#defaults}

RealMLPの論文は、architectureを複雑化するだけでなく**default設定そのものを別dataset群でmeta-tune**する考え方を重視しています。

<div class="comparison-board"><section class="comparison-card"><h4>Naive MLP</h4><dl><dt>前処理</dt><dd>標準化 + OHE程度</dd><dt>HP</dt><dd>datasetごとに手探り</dd><dt>risk</dt><dd>弱いbaselineになりやすい</dd></dl></section><section class="comparison-card is-primary"><h4>RealMLP</h4><dl><dt>前処理</dt><dd>tabular向け設計を統合</dd><dt>HP</dt><dd>meta-tuned defaults</dd><dt>狙い</dt><dd>HPOなしでも強いtime-accuracy tradeoff</dd></dl></section></div>

このため「RealMLP = 特定の1層」ではなく、**MLP + preprocessing + optimization recipeのpackage**として理解する方が正確です。

## 他Tabular DLとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>RealMLP</h4><dl><dt>interaction</dt><dd>dense MLP内部</dd><dt>特色</dt><dd>strong defaults / efficiency</dd></dl></section><section class="comparison-card"><h4>FT-Transformer</h4><dl><dt>interaction</dt><dd>feature Self-Attention</dd><dt>特色</dt><dd>feature token architecture</dd></dl></section><section class="comparison-card"><h4>TabM</h4><dl><dt>interaction</dt><dd>MLP</dd><dt>特色</dt><dd>1 network内のparameter-efficient ensemble</dd></dl></section><section class="comparison-card"><h4>TabPFN</h4><dl><dt>interaction</dt><dd>pretrained ICL</dd><dt>特色</dt><dd>dataset-specific fitを基本不要にする</dd></dl></section></div>

## Kaggleでの実例 {#kaggle-examples}

Predict Customer Churn 2026の9位解法では**RealMLPがmodel pool内で最高OOF 0.919389**を示し、XGBoostやTabM等とHill Climbing ensembleされています（[9th place solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution)）。

同Competitionの17位解法では最終Hill Climbing weightで`realmlp_90`が+0.18を取り、TabM等と補完的に使われています（[17th place solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)）。

Prediction Interval Competition II 2025の3位解法ではRealMLP作者自身が**RealMLP + Caruana ensembling**を中心に、TabMも含む短いsolutionを公開しています（[3rd place solution](https://www.kaggle.com/competitions/prediction-interval-competition-ii-house-price/discussion/591534)）。

## 注意点 {#pitfalls}

### GBDTより常に強いわけではない

元論文もGBDTとの組合せを強く評価しています。Kaggleでは単体winnerよりensemble memberとしての価値を含めて判断します。

### preprocessing込みで再現する

「同じhidden layer数のMLP」を自作してRealMLPと呼ぶのは不正確です。pytabkit側のfeature transformsやdefaultsを確認します。

### seed variance

NNなのでinitializationやbatch順による揺れがあります。seed ensemble、fold score分散を確認します。

## Quick Reference

- 強いtabular MLP baseline。
- architectureよりpreprocessing/training recipeも重要。
- meta-tuned defaultsでHPOなしの強さを狙う。
- 2026 Kaggle tabularでGBDTと並ぶensemble memberとして実使用。
- TabMはRealMLPとは別の「ensembleを内部化」する発想。

## 関連項目

- [FT-Transformer]({{ '/wiki/modeling/ft-transformer.html' | relative_url }})
- [TabM]({{ '/wiki/modeling/tabm.html' | relative_url }})
- [TabPFN]({{ '/wiki/modeling/tabpfn.html' | relative_url }})
- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})

## 参考文献

1. Holzmüller et al., “Better by Default: Strong Pre-Tuned MLPs and Boosted Trees on Tabular Data”, 2024. https://arxiv.org/abs/2407.04491
2. pytabkit repository. https://github.com/dholzmueller/pytabkit
3. Kaggle, “Predict Customer Churn: 9th place solution”, 2026. https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution
4. Kaggle, “Predict Customer Churn: 17th Place Solution”, 2026. https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution
5. Kaggle, “Prediction Interval Competition II: 3rd place solution”, 2025. https://www.kaggle.com/competitions/prediction-interval-competition-ii-house-price/discussion/591534

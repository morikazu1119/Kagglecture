---
layout: default
title: FT-Transformer
summary: 各tabular featureをtokenへ変換し、feature同士の相互作用をTransformer Encoderで学習するtabular deep learning model。
type: reference
domain: kaggle
topic: ft-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, tabular, transformer, ft-transformer]
---

# FT-Transformer

**FT-Transformer（Feature Tokenizer + Transformer）は、表形式データの各列を1つのtokenへ変換し、列同士の関係をSelf-Attentionで学習するモデルです。**

文章のtokenが単語なら、FT-Transformerでは**Age、Income、Cityのようなfeatureがtoken**になります。数値列とカテゴリ列をembedding空間へ揃えた後、Transformer Encoderでfeature interactionを学びます（[paper](https://arxiv.org/abs/2106.11959)）。

<nav class="article-jump-nav"><a href="#tokenizer">Feature Tokenizer</a><a href="#attention">Feature Attention</a><a href="#architecture">全体構造</a><a href="#comparison">GBDTとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 各列をtokenへする {#tokenizer}

1行が`Age=42, Income=6.2M, City=Tokyo`なら、3列をそのまま1本のvectorへ連結するのではなく、**featureごとにD次元token**へ変換します。

<div class="model-architecture" aria-label="FT-Transformer feature tokenizer">
  <div class="model-architecture__header"><div><div class="model-architecture__title">1 rowの各featureを同じD次元のtokenへ揃える</div><p class="model-architecture__subtitle">numerical featureは値をlearnable vectorへ掛け、categorical featureはembedding lookupでtoken化します。</p></div><span class="model-architecture__badge">feature tokenizer</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Age<br>42</span></div></div><div class="model-stage"><div class="model-op-box"><span>Numeric<br>Embedding</span></div></div><div class="model-stage"><div class="model-tensor"><span>Income<br>6.2</span></div></div><div class="model-stage"><div class="model-op-box"><span>Numeric<br>Embedding</span></div></div><div class="model-stage"><div class="model-tensor"><span>City<br>Tokyo</span></div></div><div class="model-stage"><div class="model-op-box"><span>Category<br>Embedding</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Feature Tokens<br>F×D</span></div></div></div>
  <p class="model-architecture__caption">値は理解用の人工例です。</p>
</div>

FT-Transformerの`FT`はこの**Feature Tokenizer**を指します。

## feature同士をAttentionで見る {#attention}

token化した後は、Age tokenがIncome/City tokenをどれだけ参照するかをSelf-Attentionで計算できます。これにより手作業で`Age × Income`のようなinteraction featureを全部列挙せず、interactionをrepresentation内で学習します。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">row内のfeature token同士で情報交換する</div><p class="model-architecture__subtitle">sample間attentionではなく、基本的には同じ1 rowのfeature間attentionです。</p></div><span class="model-architecture__badge">feature attention</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Age token</span></div></div><div class="model-stage"><div class="model-tensor"><span>Income token</span></div></div><div class="model-stage"><div class="model-tensor"><span>City token</span></div></div><div class="model-stage"><div class="model-op-box"><span>Multi-Head<br>Self-Attention</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Interaction-aware<br>tokens</span></div></div></div></div>

## FT-Transformer全体 {#architecture}

<div class="model-architecture" aria-label="FT-Transformer full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Row → Feature Tokens → Transformer Encoder → CLS → Prediction</div><p class="model-architecture__subtitle">feature tokenizerの後はencoder-only Transformerに近い構造です。</p></div><span class="model-architecture__badge">tabular transformer</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>1 Row<br>F features</span></div></div><div class="model-stage"><div class="model-op-box"><span>Feature<br>Tokenizer</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>[CLS] +<br>F tokens</span></div></div><div class="model-stage"><div class="model-op-box"><span>Transformer<br>Encoder × L</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>CLS<br>representation</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>MLP Head<br>ŷ</span></div></div></div>
</div>

## GBDTとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>GBDT</h4><dl><dt>基本操作</dt><dd>feature threshold split</dd><dt>カテゴリ</dt><dd>encoding/native処理</dd><dt>強み</dt><dd>小〜中規模tabularで非常に強い</dd><dt>interaction</dt><dd>tree pathで表現</dd></dl></section><section class="comparison-card"><h4>FT-Transformer</h4><dl><dt>基本操作</dt><dd>feature token attention</dd><dt>カテゴリ</dt><dd>learned embedding</dd><dt>強み</dt><dd>DL特有のrepresentation / ensemble diversity</dd><dt>interaction</dt><dd>attentionで直接学習</dd></dl></section></div>

元論文自身もGBDTに普遍的に勝つとは結論づけていません。Kaggleでは**単体winnerというより、GBDTと異なる誤差を持つensemble member**として価値が出ることも多いです。

## Kaggleでの実例 {#kaggle-examples}

Predict Customer Churn 2026の9位解法ではRealMLP、TabM、TabTransformer、**FT-Transformer**、ResNet系tabular NNなどを大規模model poolへ入れ、rank-based Hill Climbingでensembleしています（[9th place solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution)）。

Mercor Cheating Detection 2026の5位解法では13 model ensembleのneural componentとして**FT-Transformer / TabPFN / TabM / RealMLP**を採用し、GBDTより単体AUCは少し低くてもdiversityが有用だったと述べています（[5th place solution](https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup)）。

## 注意点 {#pitfalls}

### row数よりfeature数がcostに効く

FT-TransformerのAttention対象はfeature tokenなので、非常にwideなtableではF×F attention costが増えます。

### target encodingとのLeakage

外部でTarget Encodingした列を入れる場合、FT-TransformerだからLeakageが消えるわけではありません。fold内計算が必要です。

### preprocessing差を揃えて比較する

GBDTはscale不要なことが多い一方、NNはnumerical scaling/embedding設計に影響されます。architecture差とpreprocessing差を混同しないようablationします。

## Quick Reference

- 1 feature = 1 token。
- numerical/categoricalをD次元embeddingへ揃える。
- feature間Self-Attentionでinteractionを学ぶ。
- [CLS] representationから予測。
- KaggleではGBDTとのensemble diversity候補。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [TabPFN]({{ '/wiki/modeling/tabpfn.html' | relative_url }})
- [RealMLP]({{ '/wiki/modeling/realmlp.html' | relative_url }})
- [TabM]({{ '/wiki/modeling/tabm.html' | relative_url }})
- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})

## 参考文献

1. Gorishniy et al., “Revisiting Deep Learning Models for Tabular Data”, 2021. https://arxiv.org/abs/2106.11959
2. rtdl-revisiting-models repository. https://github.com/yandex-research/rtdl-revisiting-models
3. Kaggle, “Predict Customer Churn: 9th place solution”, 2026. https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution
4. Kaggle, “Mercor Cheating Detection: 5th place solution”, 2026. https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup

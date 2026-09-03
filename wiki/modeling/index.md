---
layout: default
title: Modeling
description: Kaggleで使うモデルを、データ種類とモデル固有の原理から調べるカテゴリ索引。
summary: Tree、Vision、Transformer、Sequence、Tabular DL、Multimodal、GNNをモデル単位で整理する。
type: category-index
nav_order: 3
permalink: /wiki/modeling/
---

# Modeling

Modelingは、**入力データをどんな単位で読み、どんな演算を繰り返して予測へ変えるか**を決める部分です。

Kagglectureでは、原則として**1つのmodel / architecture familyを1記事**にします。総論記事で共通原理を理解し、ResNet・BERT・Mambaのような固有設計は個別記事で確認できます。

## まずモデルfamilyを選ぶ

<div class="comparison-board" aria-label="Kaggleで使われる主要モデルfamily">
  <section class="comparison-card"><h4>Tree Ensemble</h4><dl><dt>主な入力</dt><dd>表形式</dd><dt>核</dt><dd>条件分岐 + tree加算</dd><dt>代表</dt><dd>LightGBM / XGBoost / CatBoost</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Vision</h4><dl><dt>主な入力</dt><dd>画像 / spectrogram</dd><dt>核</dt><dd>Convolution / Attention / SSL feature</dd><dt>代表</dt><dd>ResNet / ConvNeXt / Swin / DINOv3</dd></dl></section>
  <section class="comparison-card"><h4>Text / Sequence</h4><dl><dt>主な入力</dt><dd>token / 時系列</dd><dt>核</dt><dd>Attention / recurrent state / SSM</dd><dt>代表</dt><dd>BERT / LLM / GRU / Mamba</dd></dl></section>
  <section class="comparison-card"><h4>Tabular DL</h4><dl><dt>主な入力</dt><dd>表形式</dd><dt>核</dt><dd>feature embedding / MLP / Attention / ICL</dd><dt>代表</dt><dd>FT-Transformer / TabPFN / RealMLP / TabM</dd></dl></section>
  <section class="comparison-card"><h4>Multimodal</h4><dl><dt>主な入力</dt><dd>画像 + text等</dd><dt>核</dt><dd>共通embedding空間</dd><dt>代表</dt><dd>CLIP</dd></dl></section>
  <section class="comparison-card"><h4>Graph</h4><dl><dt>主な入力</dt><dd>node + edge</dd><dt>核</dt><dd>neighbor aggregation</dd><dt>代表</dt><dd>GNN / GraphSAGE</dd></dl></section>
</div>

## Tree Ensemble

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}"><h3>LightGBM</h3><p>1行のtree path、Histogram、leaf-wise growth、boosting全体。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/xgboost.html' | relative_url }}"><h3>XGBoost</h3><p>treeのleaf scoreを加算し、gradient / hessianで補正treeを学ぶ。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/catboost.html' | relative_url }}"><h3>CatBoost</h3><p>ordered statisticsとOrdered Boostingでcategory leakageを抑える。</p></a>
</div>

## Vision — CNN / Transformer Backbone

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/cnn-backbones.html' | relative_url }}"><h3>CNN</h3><p>kernel、receptive field、feature map、channel、downsamplingというCNN共通原理。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/resnet.html' | relative_url }}"><h3>ResNet</h3><p>Residual Blockで入力をshortcutし、深いCNNを学習しやすくする。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/efficientnet.html' | relative_url }}"><h3>EfficientNet</h3><p>MBConvとcompound scalingでdepth・width・resolutionをまとめて設計する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/convnext.html' | relative_url }}"><h3>ConvNeXt</h3><p>large kernel、depthwise convolution、LayerNorm等でCNNをmodernizeする。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/vision-transformer.html' | relative_url }}"><h3>Vision Transformer</h3><p>画像をpatch tokenへ変換し、global Self-Attentionで表現を更新する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/swin-transformer.html' | relative_url }}"><h3>Swin Transformer</h3><p>window attentionとshifted windowで局所性と階層構造を持たせる。</p></a>
</div>

## Vision — Foundation / Self-Supervised Pretraining

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/dinov3.html' | relative_url }}"><h3>DINOv3</h3><p>大量unlabeled imageからglobal / dense visual featureを学ぶself-supervised vision foundation model。</p></a>
</div>

## Vision — Segmentation / Detection

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/unet.html' | relative_url }}"><h3>U-Net</h3><p>encoderで縮め、decoderで戻し、skip connectionで位置情報を復元する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/yolo.html' | relative_url }}"><h3>YOLO</h3><p>画像からbox・classをsingle-stageでまとめて予測するobject detector。</p></a>
</div>

## Transformer — 共通原理 / Encoder-only

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/transformer.html' | relative_url }}"><h3>Transformer</h3><p>Self-Attention + FFN + residualをstackするsequence modelの共通原理。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/bert.html' | relative_url }}"><h3>BERT</h3><p>Transformer Encoderを双方向contextで事前学習するencoder-only model。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/roberta.html' | relative_url }}"><h3>RoBERTa</h3><p>BERTのpretraining recipeを再設計し、より強いencoderを作る。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/deberta.html' | relative_url }}"><h3>DeBERTa</h3><p>contentとpositionを分離したAttentionでtoken関係を表現する。</p></a>
</div>

## Transformer — 生成 / Encoder-Decoder

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/decoder-only-transformer.html' | relative_url }}"><h3>Decoder-only Transformer / LLM</h3><p>Causal Self-Attentionで次tokenを予測する、Qwen・Gemma・Llama・Mistral等の共通family。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/t5.html' | relative_url }}"><h3>T5</h3><p>Encoderが入力を読み、DecoderがCross-Attentionでtext outputを生成するtext-to-text model。</p></a>
</div>

## Transformer — Embedding / Retrieval

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/sentence-transformer.html' | relative_url }}"><h3>Sentence Transformer</h3><p>文章をdense vectorへ変換し、semantic search・retrieval・類似度計算に使うbi-encoder。</p></a>
</div>

## Sequence — RNN / State Space Model

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/gru.html' | relative_url }}"><h3>GRU</h3><p>hidden stateを時刻ごとに更新し、必要な過去情報をgateで保持・更新する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/mamba.html' | relative_url }}"><h3>Mamba</h3><p>Selective State Spaceで入力内容に応じてstateを更新し、長sequenceを処理する。</p></a>
</div>

## Tabular Deep Learning

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/ft-transformer.html' | relative_url }}"><h3>FT-Transformer</h3><p>各featureをtoken化し、feature同士をSelf-Attentionで相互作用させる。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/tabpfn.html' | relative_url }}"><h3>TabPFN</h3><p>synthetic taskで事前学習し、train tableをcontextとして推論するtabular foundation model。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/realmlp.html' | relative_url }}"><h3>RealMLP</h3><p>tabular向け前処理・numeric representation・training defaultsを詰めた強いMLP。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/tabm.html' | relative_url }}"><h3>TabM</h3><p>1つのMLP内部で複数memberを効率よく持つparameter-efficient ensemble。</p></a>
</div>

## Multimodal / Graph

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/clip.html' | relative_url }}"><h3>CLIP</h3><p>image encoderとtext encoderをcontrastive learningで同じembedding空間へ揃える。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/graph-neural-network.html' | relative_url }}"><h3>Graph Neural Network</h3><p>各nodeがneighborの情報を集約し、graph構造を予測へ利用する。</p></a>
</div>

## モデル記事の読み方

各記事は、**1サンプルで何が起きるか → モデル全体でどう積み上がるか**の2段階で説明します。model名だけではなく、input shape、主要演算、intermediate representation、connection、最終outputを図で追うのがこのカテゴリの基準です。

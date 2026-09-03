---
layout: default
title: Modeling
description: Kaggleのモデル・アーキテクチャを調べるためのカテゴリ索引。
summary: GBDT、CNN、Vision Transformerを、入力・主要演算・全体構造から比較する。
type: category-index
nav_order: 3
permalink: /wiki/modeling/
---

# Modeling

Modelingは、**入力データを受け取り、そこから予測に必要な特徴を作り、最終的な予測値へ変換する仕組み**です。

最初にモデル名を覚える必要はありません。まず **「何を1単位として見るモデルか」** を押さえると、GBDT・CNN・Vision Transformerの違いが見えます。

## まず全体像

<div class="comparison-board" aria-label="GBDT CNN Vision Transformerの直感的な比較">
  <section class="comparison-card is-primary">
    <h4>GBDT</h4>
    <dl>
      <dt>主な入力</dt><dd>表形式の1行</dd>
      <dt>見る単位</dt><dd>featureの条件</dd>
      <dt>基本演算</dt><dd>「年齢 &lt; 30?」のような分岐</dd>
      <dt>全体</dt><dd>複数treeの補正値を足す</dd>
    </dl>
  </section>
  <section class="comparison-card">
    <h4>CNN</h4>
    <dl>
      <dt>主な入力</dt><dd>画像</dd>
      <dt>見る単位</dt><dd>小さな局所領域</dd>
      <dt>基本演算</dt><dd>kernelとの積和</dd>
      <dt>全体</dt><dd>feature mapを何層も変換</dd>
    </dl>
  </section>
  <section class="comparison-card">
    <h4>Vision Transformer</h4>
    <dl>
      <dt>主な入力</dt><dd>画像</dd>
      <dt>見る単位</dt><dd>patch token</dd>
      <dt>基本演算</dt><dd>Self-Attention + MLP</dd>
      <dt>全体</dt><dd>token表現をblockごとに更新</dd>
    </dl>
  </section>
</div>

<div class="model-architecture" aria-label="代表モデルが入力から予測を作る全体構造">
  <div class="model-architecture__header">
    <div>
      <div class="model-architecture__title">どのモデルも「入力 → 表現を更新 → 予測」という大枠は同じ</div>
      <p class="model-architecture__subtitle">違うのは、入力をどう分解し、どんな演算で情報を更新するかです。</p>
    </div>
    <span class="model-architecture__badge">model family map</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Input<br>表 / 画像</span></div><span class="model-stage__label">入力</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>単位へ分ける</strong><br>feature / patch / local region</span></div><span class="model-stage__label">表現化</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree split<br>Conv<br>Attention</span></div><span class="model-stage__label">主要演算</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>特徴を<br>何段も更新</span></div><span class="model-stage__label">深い表現</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Score / Probability<br>Mask / Class</span></div><span class="model-stage__label">Task output</span></div>
  </div>
  <p class="model-architecture__caption">各記事では、この全体構造に加えて「1サンプルが内部でどう処理されるか」も図で追います。</p>
</div>

## モデル記事の見方

モデル記事では、次の3点を順に確認すると理解しやすくなります。

1. **入力がどんな形で入るか** — 1行、画像、patch、feature mapなど。
2. **1回の主要演算で何が起きるか** — split、convolution、attentionなど。
3. **その演算をどう積み重ねて最終予測にするか** — boosting、stage stack、encoder block stackなど。

モデル名だけを比較するのではなく、**内部表現がどう変化するか**まで見るのがこのカテゴリの目的です。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}" aria-label="LightGBM を開く"><h3>LightGBM</h3><p>1行がtreeを通る仕組み、Histogram、leaf-wise成長、boosting全体を順に見る。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/xgboost.html' | relative_url }}" aria-label="XGBoost を開く"><h3>XGBoost</h3><p>1本のtreeの分岐から、複数treeを足して誤差を補正する全体構造まで見る。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/catboost.html' | relative_url }}" aria-label="CatBoost を開く"><h3>CatBoost</h3><p>カテゴリを数値化するときのカンニングをどう防ぎ、tree ensembleへつなぐかを見る。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/cnn-backbones.html' | relative_url }}" aria-label="CNN Backbones を開く"><h3>CNN Backbones</h3><p>kernelの積和、feature map、stage、Residual connectionを目で追う。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/vision-transformer.html' | relative_url }}" aria-label="Vision Transformer を開く"><h3>Vision Transformer</h3><p>画像patch → token → Attention → Encoder stack → task headまで追う。</p></a>
</div>

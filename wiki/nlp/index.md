---
layout: default
title: NLP
description: Kaggleの自然言語処理で使うテキスト表現・長さ設計・Pooling・Transformer・古典的疎特徴量を調べるカテゴリ索引。
summary: TF-IDF、N-gram、Transformer、Pooling、sequence lengthなど、テキストを予測へつなぐ設計を整理する。
type: category-index
nav_order: 11
permalink: /wiki/nlp/
---

# NLP

NLPでは、**文章をどの単位で数値化し、どの範囲の文脈をモデルへ見せ、どの表現から予測するか**を扱います。

KaggleではTransformerが強力な一方、語彙・定型句・綴り・文字パターンが強い問題ではTF-IDFやword / character N-gramが非常に競争力を持つことがあります。まずデータ量、text length、語彙signal、計算制約を見て表現を選びます。

## Sparse Text Features

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/nlp/tfidf-ngram.html' | relative_url }}"><h3>TF-IDF / Word・Character N-gram</h3><p>単語・文字の出現patternを疎ベクトル化し、LinearSVCやLogistic Regression等で高速に強いtext baselineを作る。</p></a>
</div>

## Neural / Transformer Models

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/bert.html' | relative_url }}"><h3>BERT</h3><p>左右両方向のcontextを使うencoder-only Transformer。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/deberta.html' | relative_url }}"><h3>DeBERTa</h3><p>contentとpositionを分離したAttentionでBERT系を強化する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/sentence-transformer.html' | relative_url }}"><h3>Sentence Transformer</h3><p>文章embeddingを作り、検索・類似度・retrievalへ使う。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>語彙・定型句が強い</h4><dl><dt>最初に見る</dt><dd>TF-IDF + N-gram</dd><dt>利点</dt><dd>CPUでも高速、解釈しやすい</dd></dl></section>
  <section class="comparison-card"><h4>文脈・意味が重要</h4><dl><dt>最初に見る</dt><dd>BERT / DeBERTa</dd><dt>注意</dt><dd>sequence lengthと計算量</dd></dl></section>
  <section class="comparison-card"><h4>類似度・検索</h4><dl><dt>最初に見る</dt><dd>Sentence Transformer</dd><dt>注意</dt><dd>分類lossとは目的が異なる</dd></dl></section>
</div>

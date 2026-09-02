---
layout: default
title: Kagglecture
description: Kaggleの手法・評価指標・Validation・上位解法を調べるためのリファレンスWiki
---

# Kagglecture

Kaggleで使われる概念・手法・評価指標・コンペ戦略を、**必要な項目から直接調べるためのリファレンス**です。

## Categories {#categories}

{% assign category_pages = site.pages | where: "type", "category-index" | sort: "nav_order" %}
<div class="learning-grid">
{% for category in category_pages %}
  <a class="learning-card learning-card-link" href="{{ category.url | relative_url }}" aria-label="{{ category.title }} を開く">
    <h3>{{ category.title }}</h3>
    <p>{{ category.summary }}</p>
  </a>
{% endfor %}
</div>

## データ種別

<div class="comparison-board" aria-label="Kaggleのデータ種別と主要トピック">
  <section class="comparison-card"><h4>Tabular</h4><dl><dt>主要項目</dt><dd>GBDT、Feature Engineering、Encoding、Aggregation、CV</dd></dl></section>
  <section class="comparison-card"><h4>Computer Vision</h4><dl><dt>主要項目</dt><dd>Augmentation、Pretraining、Loss、TTA、Ensemble</dd></dl></section>
  <section class="comparison-card"><h4>NLP</h4><dl><dt>主要項目</dt><dd>Transformer、Pooling、Length設計、Pseudo Label</dd></dl></section>
  <section class="comparison-card"><h4>Time Series</h4><dl><dt>主要項目</dt><dd>Time-based Split、Lag、Rolling、Leakage</dd></dl></section>
  <section class="comparison-card"><h4>Audio</h4><dl><dt>主要項目</dt><dd>Spectrogram、Augmentation、CV設計</dd></dl></section>
  <section class="comparison-card"><h4>Multimodal</h4><dl><dt>主要項目</dt><dd>Fusion、Pretraining、Cross-modal modeling、Ensemble</dd></dl></section>
  <section class="comparison-card"><h4>Ranking / Recommendation</h4><dl><dt>主要項目</dt><dd>Ranking metric、negative sampling、candidate generation</dd></dl></section>
  <section class="comparison-card"><h4>Optimization</h4><dl><dt>主要項目</dt><dd>Search、Simulation、Heuristics、RL、Evaluation design</dd></dl></section>
</div>

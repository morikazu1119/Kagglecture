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

| データ | 主な項目 |
|---|---|
| **Tabular** | GBDT、Feature Engineering、Encoding、Aggregation、CV |
| **Computer Vision** | Augmentation、Pretraining、Loss、TTA、Ensemble |
| **NLP** | Transformer、Pooling、Length設計、Pseudo Label |
| **Time Series** | Time-based Split、Lag、Rolling、Leakage |
| **Audio** | Spectrogram、Augmentation、CV設計 |
| **Multimodal** | Fusion、Pretraining、Cross-modal modeling、Ensemble |
| **Ranking / Recommendation** | Ranking metric、negative sampling、candidate generation |
| **Optimization** | Search、Simulation、Heuristics、RL、Evaluation design |

---
layout: default
title: Advanced Methods
description: Kaggleの発展的な学習・推論手法を調べるためのカテゴリ索引。
summary: Pseudo Label、External Data、TTA、Calibration、Post-processing、Test-time adaptation。
type: category-index
nav_order: 5
permalink: /wiki/advanced-methods/
---

# Advanced Methods

Advanced Methodsでは、**基本モデルにもう一段工夫を足して性能を伸ばす手法**を扱います。

追加の学習信号、推論時の工夫、予測確率の補正など、強力だがValidation設計が重要な手法を整理します。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }}" aria-label="Pseudo Labeling を開く">
    <h3>Pseudo Labeling</h3>
    <p>高信頼な未ラベル予測を仮ラベルとして再学習へ利用する。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/test-time-augmentation.html' | relative_url }}" aria-label="Test-Time Augmentation を開く">
    <h3>Test-Time Augmentation</h3>
    <p>推論時に複数変換した入力の予測を平均し、変換依存の揺れを減らす。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/advanced-methods/probability-calibration.html' | relative_url }}" aria-label="Probability Calibration を開く">
    <h3>Probability Calibration</h3>
    <p>OOFを使って予測確率のscaleを実際の発生率へ近づける。</p>
  </a>
</div>

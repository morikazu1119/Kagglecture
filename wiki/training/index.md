---
layout: default
title: Training
description: Kaggleの学習手法を調べるためのカテゴリ索引。
summary: Feature Engineering、Augmentation、Loss、Sampling、Pretraining、Fine-tuning。
type: category-index
nav_order: 4
permalink: /wiki/training/
---

# Training

Trainingは、**「モデルをどう学習させるか」**に関する手法です。

学習停止、target由来特徴、augmentation、lossなど、モデル性能とValidationの信頼性を左右する設計を扱います。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/early-stopping.html' | relative_url }}" aria-label="Early Stopping を開く">
    <h3>Early Stopping</h3>
    <p>Validation改善が止まった時点で学習を止め、best checkpointを使う。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/target-encoding.html' | relative_url }}" aria-label="Target Encoding を開く">
    <h3>Target Encoding</h3>
    <p>カテゴリごとのtarget統計を特徴量化する。fold内計算によるLeakage対策が必須。</p>
  </a>
</div>

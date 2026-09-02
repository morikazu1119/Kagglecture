---
layout: default
title: Kagglecture
description: Kaggleの手法・評価指標・Validation・上位解法を調べるためのリファレンスWiki
---

# Kagglecture

Kaggleで使われる概念・手法・評価指標・コンペ戦略を、**必要な項目から直接調べるためのリファレンス**です。

## Categories {#categories}

<div class="learning-grid">
  <a class="learning-card learning-card-link" href="{{ '/wiki/validation/' | relative_url }}" aria-label="Validation & Split を開く">
    <h3>Validation & Split</h3>
    <p>Hold-out、KFold、Stratified、Group、Time Series、Adversarial Validation、Leakage。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/metrics/' | relative_url }}" aria-label="Metrics を開く">
    <h3>Metrics</h3>
    <p>Accuracy、Precision、Recall、F1、AUC、LogLoss、RMSE、MAE、Ranking指標。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/modeling/' | relative_url }}" aria-label="Modeling を開く">
    <h3>Modeling</h3>
    <p>GBDT、CNN、Transformer、Foundation Model、モデル選択。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/training/' | relative_url }}" aria-label="Training を開く">
    <h3>Training</h3>
    <p>Feature Engineering、Augmentation、Loss、Sampling、Pretraining、Fine-tuning。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/advanced-methods/' | relative_url }}" aria-label="Advanced Methods を開く">
    <h3>Advanced Methods</h3>
    <p>Pseudo Label、External Data、TTA、Calibration、Post-processing、Test-time adaptation。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/ensemble/' | relative_url }}" aria-label="Ensemble を開く">
    <h3>Ensemble</h3>
    <p>Averaging、Weighted Blend、Rank Average、Stacking、Fold/Seed Ensemble。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/competition-strategy/' | relative_url }}" aria-label="Competition Strategy を開く">
    <h3>Competition Strategy</h3>
    <p>CV-LB correlation、Leaderboard overfitting、Shake-up、Inference budget、再現性。</p>
  </a>
  <a class="learning-card learning-card-link" href="{{ '/wiki/winning-solutions/' | relative_url }}" aria-label="Winning Solutions を開く">
    <h3>Winning Solutions</h3>
    <p>上位解法、一般的な勝ち筋、コンペ固有のユニークな工夫。</p>
  </a>
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

---
layout: default
title: Kagglecture
description: Kaggleの手法・評価指標・Validation・上位解法を調べるためのリファレンスWiki
---

# Kagglecture

Kaggleで使われる概念・手法・評価指標・コンペ戦略を、**必要な項目から直接調べるためのリファレンス**です。

## Categories {#categories}

<div class="learning-grid">
  <div class="learning-card">
    <h3>Validation & Split</h3>
    <p>Hold-out、KFold、Stratified、Group、Time Series、Adversarial Validation、Leakage。</p>
    <p><a href="wiki/validation/group-kfold.md">GroupKFold →</a></p>
  </div>
  <div class="learning-card">
    <h3>Metrics</h3>
    <p>Accuracy、Precision、Recall、F1、AUC、LogLoss、RMSE、MAE、Ranking指標。</p>
  </div>
  <div class="learning-card">
    <h3>Modeling</h3>
    <p>GBDT、CNN、Transformer、Foundation Model、モデル選択。</p>
  </div>
  <div class="learning-card">
    <h3>Training</h3>
    <p>Feature Engineering、Augmentation、Loss、Sampling、Pretraining、Fine-tuning。</p>
  </div>
  <div class="learning-card">
    <h3>Advanced Methods</h3>
    <p>Pseudo Label、External Data、TTA、Calibration、Post-processing、Test-time adaptation。</p>
  </div>
  <div class="learning-card">
    <h3>Ensemble</h3>
    <p>Averaging、Weighted Blend、Rank Average、Stacking、Fold/Seed Ensemble。</p>
  </div>
  <div class="learning-card">
    <h3>Competition Strategy</h3>
    <p>CV-LB correlation、Leaderboard overfitting、Shake-up、Inference budget、再現性。</p>
  </div>
  <div class="learning-card">
    <h3>Winning Solutions</h3>
    <p>上位解法、一般的な勝ち筋、コンペ固有のユニークな工夫。</p>
  </div>
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

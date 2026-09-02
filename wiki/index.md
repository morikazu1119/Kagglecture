---
layout: default
title: Kaggle Wiki
---

# Kaggle Wiki

Kaggleで必要になる考え方と手法を、**基礎 → 実戦 → 上位解法**の順に学べます。

<div class="hero-actions">
  <a class="primary-button" href="#learning-path">順番に学ぶ</a>
  <a class="secondary-button" href="#topics">テーマから探す</a>
</div>

## Learning Path {#learning-path}

```mermaid
flowchart TD
    A[1. 評価指標を理解する] --> B[2. Validationを設計する]
    B --> C[3. Baselineを作る]
    C --> D[4. 特徴量・モデルを改善する]
    D --> E[5. Ensemble・後処理]
    E --> F[6. 上位解法を比較する]
```

<div class="callout tip">
  <div class="callout-title">最初に重視すること</div>
  強いモデルを探す前に、評価指標とValidationが正しいかを確認する。
</div>

## Topics {#topics}

<div class="learning-grid">
  <div class="learning-card">
    <h3>Validation & Split</h3>
    <p>Hold-out、KFold、Stratified、Group、Time Series、Leakage。</p>
  </div>
  <div class="learning-card">
    <h3>Metrics</h3>
    <p>Accuracy、F1、AUC、LogLoss、RMSE、MAE、Ranking指標。</p>
  </div>
  <div class="learning-card">
    <h3>Modeling</h3>
    <p>GBDT、CNN、Transformer、Foundation Model、モデル選択。</p>
  </div>
  <div class="learning-card">
    <h3>Training</h3>
    <p>Augmentation、Loss、Sampling、Pretraining、Fine-tuning。</p>
  </div>
  <div class="learning-card">
    <h3>Strong Methods</h3>
    <p>Pseudo Label、External Data、TTA、Calibration、Post-processing。</p>
  </div>
  <div class="learning-card">
    <h3>Ensemble</h3>
    <p>Averaging、Weighted Blend、Rank Average、Stacking、Fold/Seed Ensemble。</p>
  </div>
  <div class="learning-card">
    <h3>Competition Strategy</h3>
    <p>CV-LB correlation、Leaderboard overfitting、Shake-up、再現性。</p>
  </div>
  <div class="learning-card">
    <h3>Winning Solutions</h3>
    <p>上位解法から、一般的な勝ち筋とコンペ固有の工夫を比較する。</p>
  </div>
</div>

## データ種別から学ぶ

| データ | 特に重要なテーマ |
|---|---|
| **Tabular** | GBDT、Feature Engineering、Target Encoding、CV |
| **Computer Vision** | Augmentation、Pretraining、TTA、Ensemble |
| **NLP** | Transformer、Length設計、Pooling、Pseudo Label |
| **Time Series** | 時系列Split、Lag、Rolling、Leakage |
| **Audio** | Spectrogram、Augmentation、CV設計 |
| **Multimodal** | 複数モダリティの融合、Pretraining、Ensemble |

## 記事の読み方

各記事では、必要に応じて次の順で整理します。

1. **結論** — 何が重要か
2. **直感** — なぜそうなるか
3. **使い分け** — どんな条件で選ぶか
4. **Kaggle実例** — 実際にどのコンペで使われたか
5. **注意点** — Leakageや過学習など
6. **参考文献** — Writeup・Notebook・GitHub・論文

<div class="next-step">
  <strong>基本方針:</strong> 読むための説明より、コンペで判断できる知識を優先します。
</div>

---
layout: default
title: Kagglecture
---

# Kagglecture

Kaggle を題材に、機械学習コンペで必要になる **データ分割・評価指標・Cross Validation・データリーク対策・ベースライン構築・モデル改善** を体系的に学ぶための教材サイトです。

## 学習ロードマップ

1. [Kaggle と機械学習コンペの基本](docs/01_kaggle_basics.md)
2. [データセット分割](docs/02_data_split.md)
3. [評価指標](docs/03_metrics.md)
4. [Cross Validation](docs/04_cross_validation.md)
5. [Data Leakage](docs/05_data_leakage.md)
6. [Baseline とモデル選択](docs/06_baseline_and_modeling.md)
7. [Kaggle の実践ワークフロー](docs/07_kaggle_workflow.md)

## 最重要ポイント

Kaggle では、モデル選択より前に **Validation の設計** が重要です。

```text
問題理解
  ↓
評価指標を理解
  ↓
データの生成過程を理解
  ↓
Validation strategy を決める
  ↓
Baseline
  ↓
Cross Validation
  ↓
特徴量・モデル改善
  ↓
Ensemble
```

### 特に重要な3点

- Validation が本番データを再現しているか
- Competition Metric を正しく理解しているか
- Data Leakage が発生していないか

## 対象

- Kaggle をこれから始める人
- 機械学習の基礎は学んだが、コンペ経験が少ない人
- Hold-out / CV / Group Split / Time Series Split を整理したい人
- Kaggle のスコア改善を再現可能な形で行いたい人

## GitHub Repository

[Kagglecture Repository](https://github.com/morikazu1119/Kagglecture)

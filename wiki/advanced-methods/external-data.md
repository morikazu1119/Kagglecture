---
layout: default
title: External Data
description: Competition配布Train以外の公開・許可データを学習、pretraining、特徴量生成へ利用する方法。
summary: Rulesを守って追加label・domain coverage・pretraining signalを増やす強力なKaggle手法。
type: reference
domain: kaggle
topic: external-data
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - advanced-methods
  - external-data
  - distribution-shift
---

# External Data

**External Dataは、Competitionが配布したTrain以外の公開・利用許可されたデータを、学習・事前学習・特徴量生成へ使う方法です。**

特にrare positiveが少ない医療画像、domain coverageが不足する科学データ、大規模pretrainingが効く画像/NLPで大きな改善要因になります。一方、Rules・license・duplicate leakage・domain mismatchの確認が必須です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#uses">使い方</a>
  <a href="#validation">Validation設計</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使い方 {#uses}

- labeled external sampleをTrainへ追加する。
- unlabeled dataへpseudo labelを付ける。
- related taskでpretrainingする。
- external database/APIからmetadataを作る。
- simulation dataを生成し補助特徴へ使う。

## Validation設計 {#validation}

External dataをValidationへ混ぜると、Competition本番分布での改善か分からなくなります。基本は、**Validationはhost/original dataの独立sampleに固定し、External dataはTrain側だけへ追加**して差分を見る方法です。

NeurIPS Open Polymer Prediction 2025の1位解法も、external configurationを比較するときCV test foldはoriginal host dataだけにし、external dataは各Train foldへ100%追加しています（[1st Place Solution](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)）。

## Kaggleでの実例 {#kaggle-examples}

RSNA Breast Cancer Detectionの1位解法では複数の外部mammography datasetを追加し、同一pipelineで**OOF F1 0.4921→0.5161、Private 0.53→0.56**（label smoothing条件）と報告しています（[1st place solution](https://www.kaggle.com/competitions/rsna-breast-cancer-detection/discussion/392449)）。

RANZCR CLiPの1位解法ではNIH ChestXの外部画像からtubeを含む28k画像をpseudo-label候補として抽出し、patient IDを使ってoriginal/externalの同一患者がfoldをまたがないようにしています（[1st Place Solution](https://www.kaggle.com/competitions/ranzcr-clip-catheter-line-classification/writeups/all-data-are-ext-1st-place-solution)）。

Linking Writing Processes to Writing Qualityの1位解法もtitle通りData Cleaning + Feature Engineering + External Data + Model Ensembleを主要構成にしています（[1st place solution](https://www.kaggle.com/competitions/linking-writing-processes-to-writing-quality/writeups/tomoo-inubushi-1st-place-solution-data-cleaning-fe)）。

## 注意点 {#pitfalls}

### Competition Rules

外部データ禁止、全参加者が取得可能であること、license条件などCompetitionごとに違います。最初にRulesを確認します。

### Duplicate / near-duplicate

ExternalにtestやValidationとほぼ同一sampleがあるとLeakageになります。ID、hash、embedding/similarityで重複を確認します。

### Domain mismatch

量が多くてもtarget definitionや収集装置が違うと悪化します。sourceごとのsample weight、pretraining-only利用、source ablationを検討します。

## Quick Reference {#quick-reference}

- Rulesとlicenseを最初に確認する。
- Validationはhost dataに固定する。
- sourceごとにablationする。
- duplicate/near-duplicateを除く。
- external data由来の改善をCVとLB両方で確認する。

## 関連項目

- [Pseudo Labeling]({{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})
- [Data Leakage]({{ '/wiki/validation/data-leakage.html' | relative_url }})

## 参考文献

1. [Kaggle, “RSNA Breast Cancer Detection: 1st place solution”, 2023](https://www.kaggle.com/competitions/rsna-breast-cancer-detection/discussion/392449)
2. [Kaggle, “RANZCR CLiP: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/ranzcr-clip-catheter-line-classification/writeups/all-data-are-ext-1st-place-solution)
3. [Kaggle, “NeurIPS Open Polymer Prediction 2025: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)
4. [Kaggle, “Linking Writing Processes to Writing Quality: 1st place solution”, 2024](https://www.kaggle.com/competitions/linking-writing-processes-to-writing-quality/writeups/tomoo-inubushi-1st-place-solution-data-cleaning-fe)
5. [Kaggle, “HuBMAP Kidney Segmentation: 1st place solution”, 2021](https://www.kaggle.com/competitions/hubmap-kidney-segmentation/writeups/tom-1st-place-solution)

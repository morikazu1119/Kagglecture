---
layout: default
title: Pretraining / Transfer Learning
description: 大規模または関連taskで事前学習したweightをKaggle taskへ転移し、少ないlabelと計算で強い初期表現を使う方法。
summary: ImageNet・self-supervised・domain-specific等のpretrained weightをfine-tuneして性能と収束を改善する。
type: reference
domain: kaggle
topic: pretraining-transfer-learning
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - training
  - pretraining
  - transfer-learning
---

# Pretraining / Transfer Learning

**Pretraining / Transfer Learningは、別の大規模データや関連taskで学習したweightを初期値として、Competitionのtargetへfine-tuneする方法です。**

画像KaggleではImageNet、DINO/CLIP等のself-supervised・vision-language weight、医療では関連segmentation/classification taskのweightが使われます。少量データでscratch学習するより、強い表現を初期値にできることが多いです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#types">事前学習の種類</a>
  <a href="#strategy">Fine-tuning戦略</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 事前学習の種類 {#types}

- **Generic supervised**: ImageNet等。
- **Self-supervised**: DINO系など、labelなしで表現学習。
- **Vision-language**: CLIP等、大規模image-text pair。
- **Domain-specific**: 血管segmentation→aneurysm classificationなど関連task。
- **Competition内pretraining**: auxiliary taskやpseudo-labeled dataで先に学習。

## Fine-tuning戦略 {#strategy}

1. pretrained backbone + 新しいheadから始める。
2. 小さめlearning rateで全層fine-tuneをbaselineにする。
3. head/backboneでLRを分ける場合はOOF比較する。
4. domain gapが大きければ段階的pretrainingも試す。
5. foldごとに同じpretraining sourceを固定する。

## Kaggleでの実例 {#kaggle-examples}

RSNA Intracranial Aneurysm Detectionの1位解法では、backboneをvessel segmentation taskで事前学習することが最大の要因だったとablationで報告しています。96×192×192設定で、pretrainingありのfinal model score 0.902に対し、**without backbone pretrainingは0.794**でした（[1st Place Solution](https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/1st-place-solution)）。

Google Universal Image Embeddingの1位解法では大規模pretrained ViT/CLIP系weightを探索し、ImageNet-22K weightより大規模データで学習したCLIP系weightを強い出発点として利用しています（[1st place solution](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)）。

Happywhaleの1位解法も複数のImageNet-pretrained EfficientNet/EfficientNetV2を使っています（[1st Place Solution](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)）。

## 注意点 {#pitfalls}

### Pretraining data leakage

事前学習datasetにCompetition testのlabel相当情報や重複sampleが含まれる可能性がある場合はRulesとprovenanceを確認します。

### Domain gap

自然画像ImageNet→特殊医療画像などで、pretrainingが弱い/逆効果の可能性もあります。scratchやdomain-specific weightを同じCVで比較します。

### Weight名だけ記録する

同じViT-Bでもpretraining data、objective、resolutionが違えば性能は大きく変わります。checkpoint由来まで実験logへ残します。

## Quick Reference {#quick-reference}

- まず強いpretrained checkpointをbaselineにする。
- architectureとpretraining sourceを分けて比較する。
- domain-specific pretrainingは高価値候補。
- scratchとの差をablationする。
- Rules上利用可能なexternal/pretrained dataか確認する。

## 関連項目

- [CNN Backbones]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [External Data]({{ '/wiki/advanced-methods/external-data.html' | relative_url }})

## 参考文献

1. [Kaggle, “RSNA Intracranial Aneurysm Detection: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/1st-place-solution)
2. [Kaggle, “Google Universal Image Embedding: 1st place solution”, 2022](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)
3. [Kaggle, “Happywhale: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)
4. [Dosovitskiy et al., “An Image is Worth 16x16 Words”, 2020](https://arxiv.org/abs/2010.11929)
5. [Tan & Le, “EfficientNet”, 2019](https://arxiv.org/abs/1905.11946)

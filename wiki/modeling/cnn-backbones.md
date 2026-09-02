---
layout: default
title: CNN Backbones
description: ResNetやEfficientNetなど、画像Kaggleで特徴抽出器として使われるConvolutional Neural Network。
summary: Local receptive fieldとweight sharingを使い、画像の局所パターンを階層的に抽出する定番backbone。
type: reference
domain: kaggle
topic: cnn-backbones
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - cnn
  - computer-vision
---

# CNN Backbones

**CNN（Convolutional Neural Network）は、局所的なfilterを画像全体へ共有し、edge→texture→shapeのように階層的な特徴を抽出する画像モデルです。**

KaggleではResNet、EfficientNet、ConvNeXt、RegNetなどをclassification backboneやU-Net/FPN encoderとして使います。Transformerが普及した現在も、計算効率・小中規模データ・segmentationで強い選択肢です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#families">代表family</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 代表family {#families}

| Family | 特徴 |
|---|---|
| ResNet | residual connectionで深いCNNを学習しやすくする |
| EfficientNet | depth/width/resolutionをcompound scaling |
| ConvNeXt | Transformer時代の設計を取り込んだmodern CNN |
| RegNet | 規則的なdesign spaceから効率的architectureを作る |

EfficientNetはdepth・width・resolutionをバランスよく拡大するcompound scalingを提案しています（[EfficientNet paper](https://arxiv.org/abs/1905.11946)）。

## 使う場面 {#use-cases}

- 画像classificationの強いbaselineが欲しい。
- segmentation encoderを選ぶ。
- pretrained weightを利用したい。
- GPU/推論時間が限られ、ViTより軽いmodelが欲しい。

## Kaggleでの実例 {#kaggle-examples}

BirdCLEF 2024の1位解法は`efficientnet_b0`と`regnety_008`を採用し、同チームの条件ではViT系が大きく劣ったと報告しています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。**モデルfamilyの優劣はtask依存**だと分かる例です。

Happywhale 2022の1位解法では複数のImageNet-pretrained EfficientNet/EfficientNetV2をensembleし、single modelではEfficientNet-B7が最良だったと報告しています（[1st Place Solution](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)）。

Severstal Steel Defect Detectionの1位解法ではEfficientNet-B3をU-Net/FPN encoderとしてsegmentationに使っています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。

## 注意点 {#pitfalls}

### 大きいbackboneが必ず強いわけではない

resolution、batch size、pretraining、augmentationまで含めて比較します。計算budgetを食い尽くしてfold/seed数を減らすと最終性能が下がることもあります。

### Input channelが違う

医療・衛星・顕微鏡などで3chでない場合、first convolutionの変更やchannel projectionが必要です。pretrained weightの再利用方法を決めます。

### Pretraining domain

ImageNet pretrainingが常に最適とは限りません。同domain pretraining、foundation model、self-supervised weightも比較します。

## Quick Reference {#quick-reference}

- EfficientNet/ConvNeXt等をbaselineにする。
- input resolutionとbackbone sizeをセットで比較する。
- pretrained weightを優先して試す。
- inference budgetまで含めて選ぶ。
- ViTとのOOF差だけでなくensemble diversityも見る。

## 関連項目

- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})
- [Data Augmentation]({{ '/wiki/training/data-augmentation.html' | relative_url }})

## 参考文献

1. [Tan & Le, “EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks”, 2019](https://arxiv.org/abs/1905.11946)
2. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)
3. [Kaggle, “Happywhale: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)
4. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
5. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)

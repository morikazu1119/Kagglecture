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
  <a href="#mechanism">仕組み</a>
  <a href="#families">代表family</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

画像の縦横サイズはstageが進むほど小さくなり、channel方向の特徴表現は豊かになります。ここでは**奥行きがfeature channelの概念理解に役立つため、定量グラフではなく2.5DのHTML layer stack**で示します。

<div class="static-viz html-diagram" aria-label="CNNで画像から高次特徴へ変換する模式図">
  <div class="viz-heading">
    <div><div class="viz-title">局所特徴を段階的に抽象化する</div><p class="viz-subtitle">空間解像度を圧縮しながら、edge → texture → part → semantic featureへ変換します。</p></div>
    <span class="viz-badge">architecture模式図</span>
  </div>
  <div class="layer-scene" style="--layer-count: 4">
    <div class="layer-block"><strong>Input / Stem</strong><span>RGB image<br>局所filterでedge・contrastを抽出</span></div>
    <div class="layer-block"><strong>Early stages</strong><span>高解像度<br>texture・細かいpattern</span></div>
    <div class="layer-block"><strong>Deep stages</strong><span>低解像度・多channel<br>part・shapeを統合</span></div>
    <div class="layer-block is-accent"><strong>Task head / Encoder output</strong><span>Classification head、FPN、U-Net decoder等へ渡す</span></div>
  </div>
  <p class="viz-caption">この奥行き表現はfeature-mapの層構造を示すための模式図で、channel数やtensor sizeの実測値ではありません。</p>
</div>

## 代表family {#families}

<div class="comparison-board" aria-label="代表的なCNN familyの比較">
  <section class="comparison-card"><h4>ResNet</h4><dl><dt>核</dt><dd>Residual connection</dd><dt>特徴</dt><dd>深いCNNを安定して学習しやすい</dd></dl></section>
  <section class="comparison-card"><h4>EfficientNet</h4><dl><dt>核</dt><dd>Compound scaling</dd><dt>特徴</dt><dd>depth / width / resolutionをバランスよく拡大</dd></dl></section>
  <section class="comparison-card is-primary"><h4>ConvNeXt</h4><dl><dt>核</dt><dd>Modern CNN design</dd><dt>特徴</dt><dd>Transformer時代の設計知見をCNNへ反映</dd></dl></section>
  <section class="comparison-card"><h4>RegNet</h4><dl><dt>核</dt><dd>Regular design space</dd><dt>特徴</dt><dd>規則的な設計から効率的architectureを作る</dd></dl></section>
</div>

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

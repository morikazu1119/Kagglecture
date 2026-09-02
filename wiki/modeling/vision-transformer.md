---
layout: default
title: Vision Transformer
description: 画像をpatch sequenceとしてTransformerへ入力し、self-attentionでglobal interactionを学習するVision model。
summary: 画像patchをtoken化し、CNNのconvolutionではなくself-attention中心で特徴を学習するarchitecture。
type: reference
domain: kaggle
topic: vision-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - transformer
  - computer-vision
---

# Vision Transformer

**Vision Transformer（ViT）は、画像を小さなpatchへ分割してtoken列とみなし、Transformerのself-attentionで特徴を学習するモデルです。**

原論文では16×16などのpatchをsequenceへ変換し、大規模事前学習後のtransferでCNNと競争力のある性能を示しました（[ViT paper](https://arxiv.org/abs/2010.11929)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">CNNとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

```text
Image -> Patchify -> Linear projection -> Patch tokens
      -> Transformer blocks -> pooled/CLS feature -> Head
```

self-attentionにより離れたpatch同士を早い層から直接関連付けられます。一方でCNNほど強い局所inductive biasを持たないため、pretrainingやaugmentationの影響が大きいことがあります。

## CNNとの比較 {#comparison}

| 観点 | CNN | ViT |
|---|---|---|
| 局所性 | convolutionで強い | patch/self-attentionで学習 |
| Global interaction | 深い層で広がる | attentionで直接扱いやすい |
| 小データ | 比較的安定 | pretraining依存が大きい場合あり |
| 計算量 | architecture依存 | token数増加でattention cost増 |

どちらか一方へ決め打ちせず、同じCVでpretrained CNN/ViTを比較します。

## Kaggleでの実例 {#kaggle-examples}

Cassava Leaf Disease Classificationの1位解法ではImageNet weightのViT-B/16を384×384で5-fold学習し、EfficientNet-B4 NoisyStudent modelと併用しています（[1st Place Solution](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/discussion/221957)）。

26-shinnen-3Dpathologyの1位解法ではDINOv3 ViT-Baseの中間Transformer blockからmulti-scale featureを取り出し、custom FPN decoderへ渡すsegmentation modelがsingle bestの一つになっています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

一方、BirdCLEF 2024の1位チームではViT系がEfficientNet/RegNetより明確に悪かったと報告しています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。**ViTが新しいから常に強いわけではありません。**

## 注意点 {#pitfalls}

### Patch sizeとresolution

resolutionを上げるとtoken数が増え、memoryと計算量が急増します。backbone sizeだけでなくpatch sizeまでbudgetに影響します。

### Pretraining差をarchitecture差と誤認する

ImageNet-1K CNNとLAION/DINO等で大規模事前学習したViTを比べると、architectureだけの差ではありません。pretraining sourceを記録します。

### Segmentation decoder

plain ViTは単一scale featureが中心なので、FPN/U-Net的decoderへ接続するときは中間block抽出やfeature pyramid設計が必要になる場合があります。

## Quick Reference {#quick-reference}

- pretrained weight込みで比較する。
- resolution × patch size × batch sizeで計算量を見積もる。
- small dataではCNN baselineも残す。
- segmentationはmulti-scale feature取得方法を設計する。
- CNNとのensemble diversityも評価する。

## 関連項目

- [CNN Backbones]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})

## 参考文献

1. [Dosovitskiy et al., “An Image is Worth 16x16 Words”, 2020](https://arxiv.org/abs/2010.11929)
2. [Kaggle, “Cassava Leaf Disease Classification: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/discussion/221957)
3. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)
4. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)
5. [Kaggle, “Google Universal Image Embedding: 1st place solution”, 2022](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)

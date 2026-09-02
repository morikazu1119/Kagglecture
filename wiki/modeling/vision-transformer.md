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

ViTでは画像をgrid状のpatchへ分け、各patchをtokenへ変換します。下は**画像の2D空間がtoken列へ変わること**を直接見せるHTML模式図です。

<div class="static-viz html-diagram" aria-label="Vision Transformerのpatch token化模式図">
  <div class="viz-heading">
    <div><div class="viz-title">Image → patch → token → Transformer</div><p class="viz-subtitle">空間上の小領域をtokenへ変換し、self-attentionで離れた領域も直接関連付けます。</p></div>
    <span class="viz-badge">2D + layer構造</span>
  </div>
  <div class="patch-token-layout">
    <div>
      <div class="patch-grid" aria-label="4×4に分割された画像patch">
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
      </div>
      <p class="viz-note">Imageを同じ大きさのpatchへ分割</p>
    </div>
    <div>
      <div class="token-row" aria-label="Patch token列">
        <span class="token-chip is-cls">CLS</span><span class="token-chip">P1</span><span class="token-chip">P2</span><span class="token-chip">P3</span><span class="token-chip">P4</span><span class="token-chip">P5</span><span class="token-chip">…</span><span class="token-chip">P16</span>
      </div>
      <div class="html-flow" style="--flow-columns: 3; margin-top: 16px">
        <div class="flow-node"><strong>Linear projection</strong><span>patchをembeddingへ変換</span></div>
        <div class="flow-node"><strong>Transformer blocks</strong><span>self-attentionでglobal interaction</span></div>
        <div class="flow-node is-accent"><strong>Head / Decoder</strong><span>classification / segmentationへ接続</span></div>
      </div>
    </div>
  </div>
  <p class="viz-caption">patch数・token数は理解用の模式例です。実際のtoken数はresolutionとpatch sizeで変わります。</p>
</div>

self-attentionにより離れたpatch同士を早い層から直接関連付けられます。一方でCNNほど強い局所inductive biasを持たないため、pretrainingやaugmentationの影響が大きいことがあります。

## CNNとの比較 {#comparison}

<div class="comparison-board" aria-label="CNNとVision Transformerの比較">
  <section class="comparison-card"><h4>CNN</h4><dl><dt>局所性</dt><dd>convolutionで強く組み込む</dd><dt>Global interaction</dt><dd>深い層でreceptive fieldが広がる</dd><dt>小データ</dt><dd>比較的安定</dd><dt>計算</dt><dd>architecture依存</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Vision Transformer</h4><dl><dt>局所性</dt><dd>patch / attentionから学習</dd><dt>Global interaction</dt><dd>attentionで直接扱いやすい</dd><dt>小データ</dt><dd>pretraining依存が大きい場合あり</dd><dt>計算</dt><dd>token数増加でattention costが増える</dd></dl></section>
</div>

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

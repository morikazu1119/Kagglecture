---
layout: default
title: CNN Backbones
description: ResNetやEfficientNetなど、画像Kaggleで特徴抽出器として使われるConvolutional Neural Network。
summary: 局所filterを画像上で走査し、feature mapを積み重ねながらedge・texture・shape・semantic featureを抽出する画像backbone。
type: reference
domain: kaggle
topic: cnn-backbones
created: 2026-09-03
updated: 2026-09-03
source_count: 6
tags:
  - kaggle
  - modeling
  - cnn
  - computer-vision
---

# CNN Backbones

**CNN（Convolutional Neural Network）は、小さなkernelを画像上で滑らせながら局所パターンを検出し、そのfeature mapを何層も重ねて高次特徴へ変換する画像モデルです。**

KaggleではResNet、EfficientNet、ConvNeXt、RegNetなどをclassification backboneやU-Net/FPN encoderとして使います。CNNを理解するうえで重要なのは、単に「画像を層へ通す」ことではなく、**kernelが局所領域へ作用し、feature mapが次の層の入力になる**という演算の連鎖です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#convolution">畳み込み</a>
  <a href="#architecture">構造</a>
  <a href="#families">代表family</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## 畳み込みを目で追う {#convolution}

Convolutionでは、kernelと呼ばれる小さな重み行列を入力画像の一部へ重ね、対応する値を掛けて足し合わせます。その**1回の積和がfeature mapの1セル**になります。kernelを少しずつ移動すると、出力feature map全体が埋まります。

下は理解用の5×5入力と3×3 kernelです。Positionを動かすと、現在kernelが見ている**receptive field（受容野）**と、対応する出力位置が変わります。

<div class="interactive-viz" data-model-interactive="cnn-convolution">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">3×3 kernelが画像上を走査してfeature mapを作る</div>
      <p class="interactive-viz__subtitle">緑の9セルが現在のreceptive fieldです。各位置で積和を1回計算し、その値を右のfeature mapへ書き込みます。</p>
    </div>
    <span class="interactive-status" data-cnn-status data-state="safe">位置 (1, 1)</span>
  </div>
  <p class="interactive-note">模式例。入力値・kernel値は畳み込み演算を理解するための人工値です。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Kernel位置</span>
    <button class="interactive-button" type="button" data-cnn-prev>前</button>
    <label class="interactive-range">
      <input type="range" min="0" max="8" step="1" value="0" data-cnn-position aria-label="畳み込みkernelの位置">
      <span class="interactive-range-labels"><span>左上</span><span>右下</span></span>
    </label>
    <button class="interactive-button" type="button" data-cnn-next>次</button>
  </div>
  <div class="conv-board">
    <section class="conv-panel">
      <div class="conv-panel__title">Input 5×5</div>
      <div class="conv-grid" style="--grid-size:5" data-cnn-input-grid aria-label="5×5 input feature map"></div>
    </section>
    <section class="conv-panel conv-kernel">
      <div class="conv-panel__title">Kernel 3×3</div>
      <div class="conv-grid" style="--grid-size:3" data-cnn-kernel-grid aria-label="3×3 convolution kernel"></div>
    </section>
    <section class="conv-panel">
      <div class="conv-panel__title">Output feature map 3×3</div>
      <div class="conv-grid" style="--grid-size:3" data-cnn-output-grid aria-label="3×3 output feature map"></div>
    </section>
  </div>
  <div class="conv-equation" data-cnn-equation>選択領域とkernelの積和がここに表示されます。</div>
  <p class="interactive-explanation">実際のCNNではkernelを多数持つため、1枚ではなく複数channelのfeature mapが生成されます。次の層はそのstack全体を入力としてさらに特徴を抽出します。</p>
  <noscript><p class="interactive-explanation">Convolutionはkernelを局所領域へ重ねて積和を取り、その値をfeature mapの対応位置へ記録する処理です。</p></noscript>
</div>

strideを大きくするとkernelの移動幅が広がり、出力の縦横サイズは小さくなります。paddingを入れると端の情報を扱いやすくなります。深いCNNでは、この**局所演算 → feature map → 次の局所演算**を繰り返します。

## CNNの構造 {#architecture}

CNN backbone全体では、stageが進むほど空間解像度を下げ、channel数を増やす設計がよく使われます。浅い層はedgeやtexture、深い層はpartやobject-level featureを表現します。

<div class="model-architecture" aria-label="CNN backboneでfeature mapの解像度とchannelが変化する模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">画像を小さくしながら、feature channelを厚くする</div><p class="model-architecture__subtitle">奥行きはchannel stackのイメージです。実際のtensor sizeはarchitectureと入力resolutionで変わります。</p></div>
    <span class="model-architecture__badge">2.5D architecture</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>RGB<br>H×W×3</span></div><span class="model-stage__label">Input</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Conv / Stem<br>局所edge</span></div><span class="model-stage__label">Stem</span></div>
    <div class="model-stage"><div class="model-tensor"><span>高解像度<br>texture</span></div><span class="model-stage__label">Early stage</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>低解像度<br>多channel</span></div><span class="model-stage__label">Deep stage</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Semantic feature</span></div><span class="model-stage__label">Head / Decoderへ</span></div>
  </div>
  <p class="model-architecture__caption">ClassificationではGlobal Pooling + Linear head、segmentationではFPN/U-Net decoderなどへ接続します。</p>
</div>

### ResNetでは何が違うか

ResNetは、複数のconvolutionを通った変換結果 $F(x)$ に、元の入力 $x$ を**skip connection**で足し戻します。原論文の中心はこのResidual Learningで、深いnetworkを学習しやすくする設計です（[ResNet paper](https://arxiv.org/abs/1512.03385)）。

<div class="model-architecture" aria-label="ResNet residual blockの構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Residual Block: main pathとidentity pathを最後に加算する</div><p class="model-architecture__subtitle">入力xを変換するmain pathとは別に、x自身をshortcutでAddへ運びます。</p></div>
    <span class="model-architecture__badge">skip connection</span>
  </div>
  <div class="residual-architecture">
    <div class="residual-node">Input<br>x</div>
    <div class="residual-node">Conv<br>局所演算</div>
    <div class="residual-node">Activation / Conv<br>F(x)</div>
    <div class="residual-node is-add">Add<br>F(x)+x</div>
    <div class="residual-node">Output</div>
  </div>
  <p class="model-architecture__caption">channel数や解像度が変わるblockではshortcut側にもprojectionを入れる場合があります。</p>
</div>

## 代表family {#families}

<div class="comparison-board" aria-label="代表的なCNN familyの比較">
  <section class="comparison-card"><h4>ResNet</h4><dl><dt>核</dt><dd>Residual connection</dd><dt>見る点</dt><dd>skip pathとblock depth</dd></dl></section>
  <section class="comparison-card"><h4>EfficientNet</h4><dl><dt>核</dt><dd>Compound scaling</dd><dt>見る点</dt><dd>depth / width / resolutionを同時に拡大</dd></dl></section>
  <section class="comparison-card is-primary"><h4>ConvNeXt</h4><dl><dt>核</dt><dd>Modern CNN design</dd><dt>見る点</dt><dd>large kernel、stage設計、Transformer由来の設計知見</dd></dl></section>
  <section class="comparison-card"><h4>RegNet</h4><dl><dt>核</dt><dd>Regular design space</dd><dt>見る点</dt><dd>規則的なwidth/depth設計</dd></dl></section>
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

## Quick Reference

- Convolutionはkernelを局所領域へ重ねた積和でfeature mapを作る。
- 深いstageほど空間解像度を下げ、channel表現を増やす構成が多い。
- ResNetはmain pathにidentity shortcutを足す。
- input resolutionとbackbone sizeをセットで比較する。
- ViTとのOOF差だけでなくensemble diversityも見る。

## 関連項目

- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})
- [Data Augmentation]({{ '/wiki/training/data-augmentation.html' | relative_url }})

## 参考文献

1. [He et al., “Deep Residual Learning for Image Recognition”, 2015](https://arxiv.org/abs/1512.03385)
2. [Tan & Le, “EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks”, 2019](https://arxiv.org/abs/1905.11946)
3. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)
4. [Kaggle, “Happywhale: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)
5. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
6. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)

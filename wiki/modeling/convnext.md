---
layout: default
title: ConvNeXt
summary: Transformer時代の設計知見を取り込み、large-kernel depthwise convolutionやLayerNormで再設計したmodern CNN。
type: reference
domain: kaggle
topic: convnext
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, cnn, convnext, computer-vision]
---

# ConvNeXt

**ConvNeXtは、ResNet系CNNを土台にしつつ、Vision Transformer時代に有効だった設計をCNNへ取り込み直したmodern CNNです。**

Self-Attentionへ置き換えたモデルではありません。中心演算はあくまでConvolutionですが、**large kernelのdepthwise convolution、LayerNorm、inverted bottleneck的なchannel変換**などを組み合わせ、CNNのまま強いbackboneを作ります（[ConvNeXt paper](https://arxiv.org/abs/2201.03545)）。

<nav class="article-jump-nav"><a href="#block">ConvNeXt Block</a><a href="#architecture">全体構造</a><a href="#why">何がmodernか</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 blockで何が起きるか {#block}

ConvNeXt blockでは、まず**7×7 depthwise convolution**で各channelの空間patternを広めに見ます。その後channel方向をLayerNormとpointwise変換で処理します。

<div class="model-architecture" aria-label="ConvNeXt block">
  <div class="model-architecture__header"><div><div class="model-architecture__title">large-kernelで空間を見る → channelを広げて混ぜる → residualで戻す</div><p class="model-architecture__subtitle">Transformer blockの「token mixing / channel mixing」に似た役割分担をConvolutionで作ります。</p></div><span class="model-architecture__badge">ConvNeXt block</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Input<br>H×W×C</span></div></div><div class="model-stage"><div class="model-op-box"><span>7×7<br>Depthwise Conv</span></div></div><div class="model-stage"><div class="model-op-box"><span>LayerNorm</span></div></div><div class="model-stage"><div class="model-op-box"><span>1×1 / Linear<br>C → 4C</span></div></div><div class="model-stage"><div class="model-op-box"><span>GELU<br>4C → C</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>+ Input<br>Residual</span></div></div></div>
  <p class="model-architecture__caption">概念図。実装ではtensor layoutやLinear/1×1 Convの表現がlibraryにより異なります。</p>
</div>

7×7 kernelにしたから「画像全体を一気に見る」わけではありません。ただし3×3より1 blockの受容野が広く、stageを重ねることで広いcontextを扱いやすくなります。

## ConvNeXt全体 {#architecture}

ConvNeXtは4 stageのhierarchical backboneです。Stemで画像をpatchifyするようにdownsampleし、その後各stageでConvNeXt Blockを繰り返します。

<div class="model-architecture" aria-label="ConvNeXt full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">4×4 Stemの後に4つのhierarchical stage</div><p class="model-architecture__subtitle">stage間でresolutionを半分、channelを増やしながらsemantic featureを深めます。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>4×4 Stem<br>stride 4</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Stage 1<br>ConvNeXt Blocks</span></div></div><div class="model-stage"><div class="model-tensor"><span>Stage 2</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Stage 3 / 4</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pool / Decoder<br>Task output</span></div></div></div>
</div>

Classificationだけでなく、各stage featureをU-Net/FPN decoderへ渡すsegmentation backboneとしても使われます。

## ResNetから何を変えたか {#why}

<div class="comparison-board"><section class="comparison-card"><h4>ResNet</h4><dl><dt>空間kernel</dt><dd>主に3×3</dd><dt>Norm</dt><dd>BatchNorm</dd><dt>Activation</dt><dd>ReLU中心</dd><dt>Stem</dt><dd>7×7 + Pool</dd></dl></section><section class="comparison-card is-primary"><h4>ConvNeXt</h4><dl><dt>空間kernel</dt><dd>7×7 depthwise</dd><dt>Norm</dt><dd>LayerNorm</dd><dt>Activation</dt><dd>GELU</dd><dt>Stem</dt><dd>patchify風4×4 stride 4</dd></dl></section></div>

重要なのは「Transformerに似せたから強い」という暗記ではなく、**空間mixingとchannel mixingを明確に分け、training recipeも含めてCNN設計を再評価した**ことです。

## 使う場面 {#use-cases}

- ViTとCNNの両方を比較したい画像task。
- segmentation encoderとしてmulti-scale featureが欲しい。
- timm等のpretrained weightを利用したい。
- spectrogramやsensor-to-imageのようにCNN inductive biasが効きそうなtask。

## Kaggleでの実例 {#kaggle-examples}

Blood Vessel Segmentation 2023の1位解法では**U-Net + ConvNeXt Tiny**を使用し、BatchNorm/ReLUをGroupNorm/GELUへ変更するなどbackboneをtaskへ調整しています（[1st place solution](https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated)）。

CMI Sensor Data 2025の7位解法では時系列を2D imageとして並べ、IMU-only branchに**ConvNeXt-base**を使用しています（[7th place solution](https://www.kaggle.com/competitions/cmi-detect-behavior-with-sensor-data/writeups/7th-place-solution)）。

ISIC 2024の11位解法ではConvNeXt Small/BaseとSwinV2 Tinyを同じimage model poolで比較・ensembleしています（[11th place solution](https://www.kaggle.com/competitions/isic-2024-challenge/writeups/sukeponta-11th-place-solution)）。

## 注意点 {#pitfalls}

### ConvNeXtとConvNeXt V2を混同しない

ConvNeXt V2はFCMAE pretrainingとGRN（Global Response Normalization）など追加変更があります。checkpoint名に`convnextv2`がある場合は別variantです。

### large kernelの計算量

Depthwiseなので通常7×7 Convより軽いものの、input resolutionが大きいとactivation memoryは増えます。高解像度segmentationではcrop sizeとbatch sizeを同時に調整します。

### CNN/ViTの二択ではない

Swinのようなhierarchical Transformerやhybrid modelもあります。OOF性能だけでなくensemble時のprediction correlationも見ます。

## Quick Reference

- 中心は7×7 depthwise convolution。
- LayerNorm + GELU + inverted bottleneck的channel変換。
- 4 stageのhierarchical CNN。
- multi-scale featureが取りやすくsegmentation encoderにも向く。
- ConvNeXt V2は別の追加設計を持つ。

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [ResNet]({{ '/wiki/modeling/resnet.html' | relative_url }})
- [Swin Transformer]({{ '/wiki/modeling/swin-transformer.html' | relative_url }})
- [U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})

## 参考文献

1. Liu et al., “A ConvNet for the 2020s”, 2022. https://arxiv.org/abs/2201.03545
2. Woo et al., “ConvNeXt V2: Co-designing and Scaling ConvNets with Masked Autoencoders”, 2023. https://arxiv.org/abs/2301.00808
3. Kaggle, “Blood Vessel Segmentation: 1st Place Solution”, 2023. https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated
4. Kaggle, “CMI - Detect Behavior with Sensor Data: 7th Place Solution”, 2025. https://www.kaggle.com/competitions/cmi-detect-behavior-with-sensor-data/writeups/7th-place-solution
5. Kaggle, “ISIC 2024: 11th place solution”, 2024. https://www.kaggle.com/competitions/isic-2024-challenge/writeups/sukeponta-11th-place-solution

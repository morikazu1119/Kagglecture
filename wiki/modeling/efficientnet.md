---
layout: default
title: EfficientNet
summary: MBConvを基本blockにし、depth・width・input resolutionをまとめて拡大するcompound scalingで効率を高めたCNN family。
type: reference
domain: kaggle
topic: efficientnet
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, cnn, efficientnet, computer-vision]
---

# EfficientNet

**EfficientNetは、CNNを大きくするときに「層だけ深くする」「channelだけ太くする」のではなく、depth・width・画像resolutionをバランスよく一緒に拡大するモデルfamilyです。**

内部の中心blockはMobileNetV2由来の**MBConv（Mobile Inverted Bottleneck Convolution）**で、depthwise convolutionとSqueeze-and-Excitationを使い、計算量を抑えながら特徴を抽出します（[EfficientNet paper](https://arxiv.org/abs/1905.11946)）。

<nav class="article-jump-nav"><a href="#mbconv">MBConv</a><a href="#architecture">全体構造</a><a href="#scaling">Compound Scaling</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 blockで何が起きるか {#mbconv}

通常のConvolutionは「空間」と「channel」を一度に混ぜます。MBConvは処理を分けます。

1. 1×1 Convでchannelを一度増やす。
2. **Depthwise Conv**でchannelごとに空間方向のpatternを見る。
3. Squeeze-and-Excitation（SE）でchannelごとの重要度を調整する。
4. 1×1 Convで必要なchannel数へ戻す。
5. shapeが同じならshortcutを足す。

<div class="model-architecture" aria-label="EfficientNet MBConv block">
  <div class="model-architecture__header"><div><div class="model-architecture__title">空間処理とchannel混合を分離して計算を軽くする</div><p class="model-architecture__subtitle">Expansion → Depthwise Conv → SE → Projectionという流れです。</p></div><span class="model-architecture__badge">MBConv</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Input<br>H×W×C</span></div></div><div class="model-stage"><div class="model-op-box"><span>1×1 Expand<br>C → tC</span></div></div><div class="model-stage"><div class="model-op-box"><span>k×k<br>Depthwise</span></div></div><div class="model-stage"><div class="model-op-box"><span>SE<br>channel gate</span></div></div><div class="model-stage"><div class="model-op-box"><span>1×1 Project<br>tC → C'</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>+ shortcut<br>Output</span></div></div></div>
</div>

Depthwise convolutionでは「1 filterが全channelをまとめて見る」のではなく、基本的に各channelへ別々の空間filterを適用します。その後1×1 Convでchannel間を混ぜるため、通常Convより計算を抑えやすくなります。

## EfficientNet全体 {#architecture}

<div class="model-architecture" aria-label="EfficientNet full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Stemの後にMBConv stageを積み、最後にpoolingして予測する</div><p class="model-architecture__subtitle">stageごとにresolutionを下げ、channel数とblock数を増やします。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>Stem Conv</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>MBConv<br>early</span></div></div><div class="model-stage"><div class="model-tensor"><span>MBConv<br>middle</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>MBConv<br>deep</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pool + Head</span></div></div></div>
</div>

## Compound Scaling {#scaling}

EfficientNet-B0を基準に、B1、B2、…と大きくするとき、**depth・width・resolutionの3軸を同時に拡大**します。

<div class="comparison-board"><section class="comparison-card"><h4>Depthだけ増やす</h4><dl><dt>変化</dt><dd>block数が増える</dd><dt>問題</dt><dd>空間情報量やchannel capacityとのバランスが崩れることがある</dd></dl></section><section class="comparison-card"><h4>Widthだけ増やす</h4><dl><dt>変化</dt><dd>channel数が増える</dd><dt>問題</dt><dd>receptive fieldや表現の階層は増えない</dd></dl></section><section class="comparison-card is-primary"><h4>Compound scaling</h4><dl><dt>変化</dt><dd>depth + width + resolution</dd><dt>狙い</dt><dd>3軸のバランスを保って拡大</dd></dl></section></div>

Kaggleでは「B7がB0より必ず強い」という意味ではありません。大きいvariantは高resolution・小batchになりやすく、fold数やseed数を減らすコストがあります。

## 使う場面 {#use-cases}

- GPU制約下で強い画像baselineが欲しい。
- spectrogram/audio画像分類。
- U-Net等のencoderとしてpretrained CNNを使う。
- model sizeとresolutionを複数variantで探索したい。

## Kaggleでの実例 {#kaggle-examples}

BirdCLEF 2024の1位解法は`efficientnet_b0`と`regnety_008`を採用しました。同チームではViT系が大きく劣り、larger modelは計算資源の都合で深追いしなかったと報告しています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。

2026年の3D pathology competitionの1位team solutionでは**EfficientNet-B5 + U-Net**を5-foldで学習し、別architectureとのensemble diversityにも利用しています（[solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

HuBMAP + HPA 2022の7位解法では、best single encoderとしてEfficientNet-B5を使ったU-Net系modelを採用しています（[solution](https://www.kaggle.com/competitions/hubmap-organ-segmentation/writeups/q-takka-7th-place-solution)）。

## 注意点 {#pitfalls}

### variant名だけを比較しない

B0/B3/B5/B7では想定resolutionや計算量も違います。backboneだけ変えてinput sizeを固定した比較と、推奨resolutionごと変える比較は意味が違います。

### BatchNormとsmall batch

高resolution・大型variantではbatch sizeが小さくなり、BatchNorm統計が不安定になる場合があります。freeze、SyncBN、GroupNorm等も検討します。

### EfficientNetV2は別設計を含む

EfficientNetV2はFused-MBConvやprogressive learningなど追加変更があります。初代EfficientNetと完全に同じarchitectureではありません。

## Quick Reference

- blockの核はMBConv。
- Depthwise Convで空間処理、1×1 Convでchannel混合。
- SEでchannel重要度を調整。
- compound scaling = depth・width・resolutionをまとめて拡大。
- KaggleではB0〜B7を計算budgetとOOFで選ぶ。

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})

## 参考文献

1. Tan & Le, “EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks”, 2019. https://arxiv.org/abs/1905.11946
2. Sandler et al., “MobileNetV2: Inverted Residuals and Linear Bottlenecks”, 2018. https://arxiv.org/abs/1801.04381
3. Kaggle, “BirdCLEF 2024: 1st place solution”, 2024. https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution
4. Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026. https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614
5. Kaggle, “HuBMAP + HPA: 7th place solution”, 2022. https://www.kaggle.com/competitions/hubmap-organ-segmentation/writeups/q-takka-7th-place-solution

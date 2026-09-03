---
layout: default
title: U-Net
summary: Encoderで画像を圧縮し、Decoderで解像度を戻しながらskip connectionで位置情報を再利用するSegmentation architecture。
type: reference
domain: kaggle
topic: unet
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, segmentation, unet, computer-vision]
---

# U-Net

**U-Netは、画像を小さくしながら意味を抽出するEncoderと、再び大きくしながらpixel単位の予測を作るDecoderを、skip connectionでつないだSegmentationモデルです。**

Classificationが「画像全体は何？」を答えるのに対し、Segmentationは**各pixelが何か**を答える必要があります。U-Netは深い層の意味情報と浅い層の細かい位置情報を両方使います（[U-Net paper](https://arxiv.org/abs/1505.04597)）。

<nav class="article-jump-nav"><a href="#skip">Skip Connection</a><a href="#architecture">全体構造</a><a href="#encoder">Encoder選択</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1つのskipで何が起きるか {#skip}

Encoderを深く進むと「これは血管らしい」「これは臓器らしい」といった意味は強くなりますが、feature mapの縦横は小さくなります。Decoderだけで元解像度へ戻すと、**境界の細かい位置を復元しにくい**問題があります。

そこでU-Netは、Encoderの同じ解像度にあるfeature mapをDecoderへ直接渡します。

<div class="model-architecture" aria-label="U-Net skip connection">
  <div class="model-architecture__header"><div><div class="model-architecture__title">深い意味情報に、浅い位置情報をconcatして戻す</div><p class="model-architecture__subtitle">DecoderはupsampleしたfeatureとEncoder側のfeatureを同じ解像度で結合します。</p></div><span class="model-architecture__badge">skip connection</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor is-wide"><span>Encoder feature<br>H/4×W/4×C</span></div></div><div class="model-stage"><div class="model-op-box"><span>Skip<br>copy</span></div></div><div class="model-stage"><div class="model-tensor"><span>Decoder upsample<br>H/4×W/4×C'</span></div></div><div class="model-stage"><div class="model-op-box"><span>Concat<br>C + C'</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Refined<br>feature</span></div></div></div>
</div>

ResNetのResidual Addと違い、典型的なU-Net skipは**Encoder featureをDecoder featureへconcat**します。

## U-Net全体 {#architecture}

形がU字に見えるためU-Netと呼ばれます。左側でdownsample、中央にbottleneck、右側でupsampleします。

<div class="model-architecture" aria-label="U-Net full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Encoderで縮め、Decoderで戻し、同じscale同士をskipで結ぶ</div><p class="model-architecture__subtitle">最終出力は入力画像と同じ、または近いH×Wのpixel-wise predictionです。</p></div><span class="model-architecture__badge">encoder-decoder</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Image<br>H×W</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Encoder 1<br>H/2</span></div></div><div class="model-stage"><div class="model-tensor"><span>Encoder 2<br>H/4</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Bottleneck<br>H/16</span></div></div><div class="model-stage"><div class="model-tensor"><span>Decoder 2<br>+ skip</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Decoder 1<br>+ skip</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Mask<br>H×W×K</span></div></div></div>
  <p class="model-architecture__caption">図ではskip線を簡略化しています。実際は複数scaleのEncoder featureが対応するDecoder stageへ渡ります。</p>
</div>

## Encoderは別モデルへ交換できる {#encoder}

U-Netの重要な特徴は、Encoderを固定せず**ResNet / EfficientNet / ConvNeXt / Swin等のpretrained backboneへ交換できる**ことです。

<div class="comparison-board"><section class="comparison-card"><h4>Original U-Net</h4><dl><dt>Encoder</dt><dd>独自CNN</dd><dt>利点</dt><dd>構造が単純</dd></dl></section><section class="comparison-card is-primary"><h4>Pretrained Encoder U-Net</h4><dl><dt>Encoder</dt><dd>ResNet / EfficientNet / ConvNeXt等</dd><dt>利点</dt><dd>ImageNet等のfeatureをtransferできる</dd></dl></section><section class="comparison-card"><h4>UNet++ / FPN / SegFormer</h4><dl><dt>違い</dt><dd>Decoder接続やfusion方式を変更</dd><dt>意味</dt><dd>同じEncoderでも結果が変わる</dd></dl></section></div>

## 使う場面 {#use-cases}

- 医療画像で臓器・病変・血管maskを予測。
- 衛星画像の道路・建物・土地被覆。
- 工業画像の欠陥領域。
- 2D/2.5D slice segmentation。

## Kaggleでの実例 {#kaggle-examples}

HuBMAP Kidney Segmentationの1位解法では**U-Net + SE-ResNeXt101**を中心に、CBAM・hypercolumns・deep supervision等を追加しています（[1st place solution](https://www.kaggle.com/competitions/hubmap-kidney-segmentation/writeups/tom-1st-place-solution)）。

Blood Vessel Segmentation 2023の1位解法は**U-Net + ConvNeXt Tiny**を採用しています（[1st place solution](https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated)）。

2026年の3D pathology competitionの1位team solutionでもEfficientNet-B5 + U-NetやResNet34 + U-Netが使われています（[solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

## 注意点 {#pitfalls}

### Encoderだけでモデルを評価しない

同じEncoderでもDecoder、skipの取り方、loss、input resolutionで性能は大きく変わります。Medical AI Contest 2025の1位解法では、U-NetよりUNet++やSegFormer decoderとの組合せが良かったと報告されています（[1st place solution](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)）。

### pixel imbalance

背景が99%のtaskではBCEだけで背景予測に偏る場合があります。Dice/Focal/Boundary系lossをOOFで比較します。

### cropとfull imageの分布差

高解像度画像ではtile学習が必要ですが、tile borderやcontext不足が本番推論とずれることがあります。

## Quick Reference

- Encoder = 意味を抽出しながらdownsample。
- Decoder = upsampleしてpixel予測へ戻す。
- skip = Encoderの細かい位置情報をDecoderへ渡す。
- EncoderはResNet/EfficientNet/ConvNeXt等へ交換可能。
- segmentationではEncoderだけでなくDecoder/loss/resolutionもセットで比較する。

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [ResNet]({{ '/wiki/modeling/resnet.html' | relative_url }})
- [EfficientNet]({{ '/wiki/modeling/efficientnet.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})
- [Dice / IoU]({{ '/wiki/metrics/dice-iou.html' | relative_url }})

## 参考文献

1. Ronneberger et al., “U-Net: Convolutional Networks for Biomedical Image Segmentation”, 2015. https://arxiv.org/abs/1505.04597
2. Kaggle, “HuBMAP Kidney Segmentation: 1st place solution”, 2021. https://www.kaggle.com/competitions/hubmap-kidney-segmentation/writeups/tom-1st-place-solution
3. Kaggle, “Blood Vessel Segmentation: 1st Place Solution”, 2023. https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated
4. Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026. https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614
5. Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026. https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution

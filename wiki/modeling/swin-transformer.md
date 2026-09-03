---
layout: default
title: Swin Transformer
summary: Attentionを局所window内に限定し、layerごとにwindow位置をずらして階層的な画像特徴を作るVision Transformer。
type: reference
domain: kaggle
topic: swin-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, transformer, swin, computer-vision]
---

# Swin Transformer

**Swin Transformerは、画像全体の全patch同士でAttentionを取る代わりに、小さなwindow内だけでSelf-Attentionを計算し、次のblockでwindowをずらすVision Transformerです。**

局所windowに限定することで計算量を抑えつつ、**Shifted Window**で隣のwindow同士にも情報を渡します。さらにstageごとにpatchをまとめて解像度を下げるため、CNNのようなmulti-scale featureを作れます（[Swin paper](https://arxiv.org/abs/2103.14030)）。

<nav class="article-jump-nav"><a href="#window">Window Attention</a><a href="#shift">Shifted Window</a><a href="#architecture">全体構造</a><a href="#comparison">ViTとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## まずwindow内だけを見る {#window}

たとえば8×8個のpatch tokenがあるとします。通常のglobal attentionなら64 tokenすべての組合せを比較します。Swinでは4×4などのwindowへ分け、各tokenはまず**同じwindowのtokenだけ**を参照します。

<div class="model-architecture" aria-label="Swin window attention">
  <div class="model-architecture__header"><div><div class="model-architecture__title">画像をwindowへ分け、Attentionの相手を局所範囲へ限定する</div><p class="model-architecture__subtitle">同じwindow内ではSelf-Attention、windowをまたぐ直接参照は次のshifted blockで行います。</p></div><span class="model-architecture__badge">W-MSA</span></div>
  <div class="html-matrix" style="--matrix-cols:8"><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell is-good">A</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div><div class="matrix-cell">B</div></div>
  <p class="model-architecture__caption">模式図では上部2行だけ表示。A/Bは別windowを示します。</p>
</div>

## 次のblockでwindowをずらす {#shift}

windowを固定したままだとAのtokenは永遠にBのtokenと直接情報交換できません。そこで次のblockでは境界を半window分ずらします。

<div class="comparison-board"><section class="comparison-card"><h4>Block 1: W-MSA</h4><dl><dt>window</dt><dd>固定grid</dd><dt>通信</dt><dd>同じwindow内</dd></dl></section><section class="comparison-card is-primary"><h4>Block 2: SW-MSA</h4><dl><dt>window</dt><dd>半windowずらす</dd><dt>通信</dt><dd>前blockで別windowだったtokenが同じwindowへ入る</dd></dl></section></div>

この交互構造で、global attentionほど重くせず徐々に広い範囲へ情報を伝えます。

## Swin全体 {#architecture}

Swinはstage型のhierarchical Transformerです。Patch Mergingで隣接patchをまとめ、縦横を半分にしながらchannel dimensionを増やします。

<div class="model-architecture" aria-label="Swin Transformer full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Patch → Window Attention → Patch Mergingを繰り返す</div><p class="model-architecture__subtitle">CNNと同じように複数scaleのfeatureを得られるため、classification以外にも使いやすい設計です。</p></div><span class="model-architecture__badge">hierarchical transformer</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>Patch<br>Embedding</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Stage 1<br>W/SW-MSA</span></div></div><div class="model-stage"><div class="model-op-box"><span>Patch<br>Merging</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Stage 2–4<br>repeat</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Head / Decoder</span></div></div></div>
</div>

## ViTとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card"><h4>ViT</h4><dl><dt>Attention</dt><dd>基本はglobal</dd><dt>解像度</dt><dd>token数を維持する構成が基本</dd><dt>特徴</dt><dd>全体関係を直接扱う</dd></dl></section><section class="comparison-card is-primary"><h4>Swin</h4><dl><dt>Attention</dt><dd>local window</dd><dt>解像度</dt><dd>Patch Mergingでhierarchical</dd><dt>特徴</dt><dd>CNN-likeなmulti-scale feature</dd></dl></section></div>

SwinV2では大規模化や高resolution向けにattention/normalization設計がさらに調整されています。

## 使う場面

- CNNとTransformerの両方を比較したい画像classification。
- detection/segmentationでmulti-scale featureが必要。
- global ViTのtoken数増加が重い高resolution画像。
- ConvNeXt等とのensemble diversityが欲しい。

## Kaggleでの実例 {#kaggle-examples}

Google Landmark Retrieval 2021の1位解法はDOLG系modelと**hybrid Swin Transformer**をensembleし、local/global descriptor統合に利用しています（[1st place solution](https://www.kaggle.com/competitions/landmark-retrieval-2021/discussion/277099)）。

ISIC 2024の11位解法ではConvNeXt Small/Baseと**SwinV2 Tiny**をimage model群として学習しています（[solution](https://www.kaggle.com/competitions/isic-2024-challenge/writeups/sukeponta-11th-place-solution)）。

## 注意点 {#pitfalls}

### window sizeとresolution

window sizeはpatch grid上の範囲です。input resolutionを変えると1 windowが元画像で覆う物理範囲も変わります。

### global contextが即時ではない

shiftでwindow間情報は伝わりますが、1 blockで全tokenが直接見えるわけではありません。taskによりglobal ViTとの違いが出ます。

### Swin / SwinV2のcheckpoint差

relative position biasやtraining scaleが異なります。timm checkpoint名だけで同じfamilyとして雑に比較せず、versionとpretrainingを記録します。

## Quick Reference

- W-MSA = window内Self-Attention。
- SW-MSA = windowをずらして境界越しに情報交換。
- Patch Mergingでresolutionを下げhierarchical featureを作る。
- ViTよりCNN-likeなmulti-scale backbone。
- segmentation/detectionにも使いやすい。

## 関連項目

- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})
- [U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})

## 参考文献

1. Liu et al., “Swin Transformer: Hierarchical Vision Transformer using Shifted Windows”, 2021. https://arxiv.org/abs/2103.14030
2. Liu et al., “Swin Transformer V2”, 2022. https://arxiv.org/abs/2111.09883
3. Kaggle, “Google Landmark Retrieval 2021: 1st place solution”, 2021. https://www.kaggle.com/competitions/landmark-retrieval-2021/discussion/277099
4. Kaggle, “ISIC 2024: 11th place solution”, 2024. https://www.kaggle.com/competitions/isic-2024-challenge/writeups/sukeponta-11th-place-solution

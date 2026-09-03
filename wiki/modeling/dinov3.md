---
layout: default
title: DINOv3
summary: 大規模unlabeled imageから高品質なdense visual featureを学習するself-supervised vision foundation model family。
type: reference
domain: kaggle
topic: dinov3
created: 2026-09-03
updated: 2026-09-03
source_count: 6
tags: [kaggle, modeling, vision, self-supervised-learning, foundation-model, dinov3]
---

# DINOv3

**DINOv3は、人手labelなしの大量画像から、classificationだけでなくsegmentation・matching・depthなどにも再利用できる高品質なvisual featureを学ぶSelf-Supervised Learning（SSL）のvision foundation model familyです。**

「DINOv3という新しい1種類のbackbone」ではありません。公開modelには**Vision Transformer（ViT）とConvNeXt**があり、DINOv3の核心はそれらをどう大規模SSLでpretrainし、dense featureを崩さず強くするかにあります（[DINOv3 paper](https://arxiv.org/abs/2508.10104)）。

<nav class="article-jump-nav"><a href="#ssl">Labelなし学習</a><a href="#dense">Dense Feature</a><a href="#architecture">全体構造</a><a href="#gram">Gram Anchoring</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 同じ画像の別viewを同じ意味へ寄せる {#ssl}

DINO系の直感は、1枚のunlabeled imageからcropやaugmentationで複数viewを作り、それぞれをencoderへ通したrepresentationが**同じ画像内容を表すよう整合させる**ことです。正解class labelは不要です。

<div class="model-architecture" aria-label="DINOv3 self supervised learning concept">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じ画像の違うviewから、一貫したvisual representationを学ぶ</div><p class="model-architecture__subtitle">StudentとTeacherの出力を整合させながら、labelなしでfeature extractorをpretrainします。</p></div><span class="model-architecture__badge">self-supervised</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Unlabeled<br>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>View A<br>Crop/Aug</span></div></div><div class="model-stage"><div class="model-op-box"><span>Student<br>Encoder</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Representation<br>A</span></div></div><div class="model-stage"><div class="model-op-box"><span>Teacher<br>Encoder</span></div></div><div class="model-stage"><div class="model-op-box"><span>View B<br>Crop/Aug</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Representation<br>B</span></div></div></div>
  <p class="model-architecture__caption">DINOv3 training全体を簡略化した直感図です。実際はDINO/iBOT系lossや複数crop、teacher update等を組み合わせます。</p>
</div>

Teacherは固定の人間教師ではなく、training中のmodelから更新されるteacher networkです。

## Classification用1 vectorだけでなくpatchごとのfeatureが強い {#dense}

ViT backboneなら画像をpatch tokenへ分けます。DINOv3はclass tokenだけでなく、**各patch tokenが位置ごとの意味を保ったdense feature**として使いやすいことを重視しています。

<div class="model-architecture" aria-label="DINOv3 dense patch features">
  <div class="model-architecture__header"><div><div class="model-architecture__title">画像全体のfeatureと、各patch位置のdense featureを両方取り出せる</div><p class="model-architecture__subtitle">classificationはglobal representation、segmentation/matchingはpatch featureを利用できます。</p></div><span class="model-architecture__badge">dense features</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>Patchify</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>DINOv3<br>Backbone</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>CLS / Global<br>Feature</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Patch Features<br>H'×W'×D</span></div></div><div class="model-stage"><div class="model-op-box"><span>Head / FPN /<br>Matching</span></div></div></div>
</div>

このためKaggleでは単純classifier headだけでなく、intermediate block featureをFPN decoderへ渡すsegmentation構成や、global embeddingによるclustering/matchingにも使われます。

## DINOv3をdownstream taskへ使う全体像 {#architecture}

<div class="model-architecture" aria-label="DINOv3 downstream architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">大量unlabeled imageでPretrain → Competitionでは小さなhead追加またはFine-tune</div><p class="model-architecture__subtitle">Kaggle参加者が7B modelを最初からpretrainするのではなく、公開pretrained backboneを利用するのが基本です。</p></div><span class="model-architecture__badge">foundation model</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Large unlabeled<br>image corpus</span></div></div><div class="model-stage"><div class="model-op-box"><span>DINOv3<br>SSL Pretrain</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Pretrained<br>ViT / ConvNeXt</span></div></div><div class="model-stage"><div class="model-op-box"><span>Freeze / Partial<br>Fine-tune</span></div></div><div class="model-stage"><div class="model-op-box"><span>Classification /<br>FPN / Regression</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Competition<br>Output</span></div></div></div>
</div>

Metaのmodel cardではViT系とConvNeXt系を公開し、classification、retrieval、semantic segmentation、depth、tracking等への利用を想定しています（[official model card](https://github.com/facebookresearch/dinov3/blob/main/MODEL_CARD.md)）。

## Gram Anchoringは何を守るのか {#gram}

DINOv3では長時間・大規模trainingを続けると**dense feature mapの局所的な質が劣化する問題**へ対処するため、Gram Anchoringを導入しています（[Meta research](https://ai.meta.com/research/publications/dinov3/)）。

直感的には、強いteacher/reference representationが持っていた**patch同士の関係構造**を、長いtrainingの途中で壊しすぎないようanchorします。

<div class="comparison-board"><section class="comparison-card"><h4>Global featureだけ強い</h4><dl><dt>Classification</dt><dd>使いやすい</dd><dt>Dense task</dt><dd>局所featureが崩れると不利</dd></dl></section><section class="comparison-card is-primary"><h4>DINOv3の狙い</h4><dl><dt>Global</dt><dd>強いrepresentation</dd><dt>Dense</dt><dd>patch間構造も高品質に維持</dd></dl></section></div>

## Kaggleでの実例 {#kaggle-examples}

CSIRO Image2Biomass 2026の4位解法は**DINOv3 ViT-Hugeを主backbone**にし、image featureとtabular metadataをfusionしています（[4th place solution](https://www.kaggle.com/competitions/csiro-biomass/writeups/vit-huge-dinov3-and-multi-modal-feature-fusion)）。同Competitionの10位解法もDINOv3 ViT-Lをfine-tuneしています（[10th place solution](https://www.kaggle.com/competitions/csiro-biomass/writeups/10th-place-solution)）。

26-shinnen-3Dpathology 2026の1位team solutionでは**DINOv3 ViT-Base + custom FPN**がsingle best componentとして使われ、Transformer Block [3,5,8,11]の中間featureをmulti-scale decoderへ渡しています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

Multi-view Pig Posture Recognition 2026の1位writeupでは`vit_huge_plus_patch16_dinov3`をfine-tuneし、single / ensembleの両方で使用しています（[1st place solution](https://www.kaggle.com/competitions/multi-view-pig-posture-recognition/writeups/public-1st-place-solution-dinov3-vit-huge-llrd)）。

## 注意点 {#pitfalls}

### DINOv3とViTを同義にしない

ViTはbackbone architecture、DINOv3は主にself-supervised pretraining/model familyです。DINOv3にはConvNeXt backboneもあります。

### Huge backboneでfold数を削らない

ViT-Huge+等は非常に重いです。single modelのCV改善よりfold/seed/TTAを減らす損失が大きくないか総budgetで比較します。

### Intermediate featureのshape

ViTはCNNのように自然なmulti-scale stage出力を持たないため、segmentationでFPN/U-Netへ入れる場合は複数block hook、reshape、projection等が必要です。

### Pretraining domain

大規模web pretrainingが強くても、衛星・医療・顕微鏡等ではdomain-specific pretrainingや他foundation modelとの比較が必要です。

## Quick Reference

- label不要の大規模vision SSL。
- ViT / ConvNeXt backboneをpretrainするfamily。
- global featureだけでなくdense patch featureが強い。
- DINOv3固有の重要点の1つがGram Anchoring。
- 2026 Kaggle Visionでclassification/regression/segmentation backboneとして実使用が多い。

## 関連項目

- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})
- [U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})

## 参考文献

1. Siméoni et al., “DINOv3”, 2025. https://arxiv.org/abs/2508.10104
2. Meta AI, “DINOv3: Self-supervised learning for vision at unprecedented scale”, 2025. https://ai.meta.com/blog/dinov3-self-supervised-vision-model/
3. facebookresearch/dinov3 official repository and Model Card. https://github.com/facebookresearch/dinov3
4. Kaggle, “CSIRO Image2Biomass: 4th Place Solution”, 2026. https://www.kaggle.com/competitions/csiro-biomass/writeups/vit-huge-dinov3-and-multi-modal-feature-fusion
5. Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026. https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614
6. Kaggle, “Multi-view Pig Posture Recognition: 1st place solution”, 2026. https://www.kaggle.com/competitions/multi-view-pig-posture-recognition/writeups/public-1st-place-solution-dinov3-vit-huge-llrd

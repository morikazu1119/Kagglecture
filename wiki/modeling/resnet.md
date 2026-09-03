---
layout: default
title: ResNet
summary: 入力をshortcutで足し戻すResidual Learningにより、深いCNNを学習しやすくしたarchitecture。
type: reference
domain: kaggle
topic: resnet
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, cnn, resnet, computer-vision]
---

# ResNet

**ResNet（Residual Network）は、Convolutionで変換した結果へ元の入力をshortcutで足し戻すCNNです。**

普通のblockが「入力から新しい表現を全部作る」のに対し、ResNetは**入力からどこを変えるかという差分（residual）を学ぶ**形にします。これにより非常に深いnetworkでもgradientが通りやすくなりました（[ResNet paper](https://arxiv.org/abs/1512.03385)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション"><a href="#block">Residual Block</a><a href="#architecture">全体構造</a><a href="#variants">Blockの種類</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 blockで何が起きるか {#block}

入力を $x$ とします。main pathはConvolutionで $F(x)$ を作りますが、block出力は $F(x)$ ではなく **$F(x)+x$** です。

<div class="model-architecture" aria-label="ResNet Residual Block">
  <div class="model-architecture__header"><div><div class="model-architecture__title">main pathで変更分を作り、shortcutから元の入力を戻す</div><p class="model-architecture__subtitle">shortcutは情報とgradientが深い層まで通る別経路になります。</p></div><span class="model-architecture__badge">residual block</span></div>
  <div class="residual-architecture"><div class="residual-node">Input<br>x</div><div class="residual-node">Conv<br>3×3</div><div class="residual-node">Conv<br>3×3<br>F(x)</div><div class="residual-node is-add">Add<br>F(x)+x</div><div class="residual-node">Output</div></div>
  <p class="model-architecture__caption">Basic Blockの模式図。実際にはNormalizationやActivationも入ります。</p>
</div>

もし最適な変換が「ほぼ何もしない」なら、main pathは $F(x)\approx0$ を学べばよく、outputは $x$ のままです。深くした層が必ず大きく入力を書き換える必要がない点が重要です。

## ResNet全体 {#architecture}

ResNetはResidual Blockをstageごとに積み重ねます。stage境界ではstride付きConvolutionなどで空間解像度を下げ、channel数を増やします。

<div class="model-architecture" aria-label="ResNet全体構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Stemの後にResidual Stageを何段もstackする</div><p class="model-architecture__subtitle">各block内部にはshortcutがあり、stageが進むほどfeature mapは小さく・厚くなります。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image<br>H×W×3</span></div><span class="model-stage__label">Input</span></div><div class="model-stage"><div class="model-op-box"><span>7×7 Conv<br>+ Pool</span></div><span class="model-stage__label">Stem</span></div><div class="model-stage"><div class="model-tensor is-wide"><span>Residual<br>Stage 1</span></div></div><div class="model-stage"><div class="model-tensor"><span>Residual<br>Stage 2</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Residual<br>Stage 3/4</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pool + Head</span></div><span class="model-stage__label">Prediction</span></div></div>
</div>

Classificationでは最後をGlobal Average Pooling + Linearへ、segmentationでは途中stageのfeatureもdecoderへ渡します。

## Basic BlockとBottleneck {#variants}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Basic Block</h4><dl><dt>代表</dt><dd>ResNet-18 / 34</dd><dt>main path</dt><dd>3×3 → 3×3</dd><dt>特徴</dt><dd>構造が単純</dd></dl></section><section class="comparison-card"><h4>Bottleneck</h4><dl><dt>代表</dt><dd>ResNet-50 / 101 / 152</dd><dt>main path</dt><dd>1×1 → 3×3 → 1×1</dd><dt>特徴</dt><dd>channelを一度圧縮して計算を抑える</dd></dl></section></div>

入力とmain pathのshapeが違う場合、shortcut側にも1×1 projectionを入れてshapeを合わせます。

## 使う場面 {#use-cases}

- 画像classificationの堅牢なbaseline。
- U-Net/FPN等のencoder。
- pretrained backboneが豊富な環境。
- 強い新architectureの比較基準を作りたいとき。

## Kaggleでの実例 {#kaggle-examples}

2026年の3D pathology competitionの1位team componentでは、**U-Net + ResNet34**を2.5D入力のencoder-decoderとして使用しています（[solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/writeups/1st-place-solution-kohecchi)）。

RSNA Intracranial Aneurysm Detection 2025の15位解法では`fasterrcnn_resnet50_fpn_v2`をdetector backboneとして採用しています（[solution](https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/15th-place-solution)）。ResNetは単独classifierだけでなく、detection/segmentationのfeature extractorとしても使われます。

## 注意点 {#pitfalls}

### 深ければ必ず強いわけではない

ResNet-152がResNet-50より常に有利とは限りません。画像枚数、resolution、pretraining、fold数と計算budgetのトレードオフがあります。

### shortcutは「別モデルの予測を足す」ものではない

Residual connectionは同じnetwork内部のfeature tensorを足すconnectionです。Ensembleとは別概念です。

### modern backboneとの比較

ImageNet pretrained ResNetはbaselineとして強力ですが、ConvNeXt/Swin/EfficientNet等と同じresolution・training recipeでOOF比較します。

## Quick Reference

- 核は $F(x)+x$。
- shortcutで入力を深い層へ直接運ぶ。
- ResNet-18/34はBasic Block、50以上は主にBottleneck。
- stage境界ではprojection shortcutを使うことがある。
- classifierだけでなくsegmentation/detection encoderとしても有用。

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})

## 参考文献

1. He et al., “Deep Residual Learning for Image Recognition”, 2015. https://arxiv.org/abs/1512.03385
2. He et al., “Identity Mappings in Deep Residual Networks”, 2016. https://arxiv.org/abs/1603.05027
3. Kaggle, “26-shinnen-3Dpathology: 1st Place Solution (kohecchi part)”, 2026. https://www.kaggle.com/competitions/26-shinnen-3-dp/writeups/1st-place-solution-kohecchi
4. Kaggle, “RSNA Intracranial Aneurysm Detection: 15th Place Solution”, 2025. https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/15th-place-solution

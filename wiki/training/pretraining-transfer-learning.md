---
layout: default
title: Pretraining / Transfer Learning
description: 大規模または関連taskで事前学習したweightをKaggle taskへ転移し、少ないlabelと計算で強い初期表現を使う方法。
summary: ImageNet・self-supervised・domain-specific等のpretrained weightをbackboneへ読み込み、headを付け替えてCompetitionへfine-tuneする。
type: reference
domain: kaggle
topic: pretraining-transfer-learning
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - training
  - pretraining
  - transfer-learning
---

# Pretraining / Transfer Learning

**Pretraining / Transfer Learningは、別の大規模データや関連taskで学習済みのbackbone weightを初期値として使い、Competition用のheadを付けてfine-tuneする方法です。**

重要なのは「モデル名」だけではなく、**どのdata・objective・resolutionで事前学習されたcheckpointか**です。同じViT-BやConvNeXtでもpretraining sourceが違えば性能は大きく変わります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#types">事前学習の種類</a>
  <a href="#strategy">Fine-tuning戦略</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 何を引き継いでいるのか {#mechanism}

画像modelなら、pretrainingによって浅い層にはedge/texture、深い層にはshapeやsemantic patternを扱うweightが既に入っています。Competitionではそのweightを捨てず、task固有labelへ適応させます。

<div class="model-architecture" aria-label="PretrainingからFine-tuningへのweight transfer構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">大規模dataでbackboneを先に学習し、Competitionではheadを付け替えて微調整する</div><p class="model-architecture__subtitle">「ゼロから特徴抽出を覚える」のではなく、既に獲得した表現を初期値として再利用します。</p></div>
    <span class="model-architecture__badge">weight transfer</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Pretraining data<br>大規模 / 関連domain</span></div><span class="model-stage__label">Source data</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Backbone<br>feature extractor</span></div><span class="model-stage__label">Pretrain</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-thin"><span>Learned weights<br>checkpoint</span></div><span class="model-stage__label">Transfer</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>New task head</strong><br>class / mask / regression</span></div><span class="model-stage__label">Replace head</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Competition model<br>fine-tuned</span></div><span class="model-stage__label">Target task</span></div>
  </div>
  <p class="model-architecture__caption">模式図。実際にはbackbone全層を更新する方法、途中までfreezeする方法、layerごとにlearning rateを変える方法などがあります。</p>
</div>

Scratch学習では最初のweightがrandomなので、edgeのような基本featureからCompetition dataだけで覚える必要があります。Pretrainingはその探索を強い初期点から始められるため、少量dataや計算budgetが限られる状況で特に価値があります。

## 事前学習の種類 {#types}

<div class="comparison-board" aria-label="Pretraining sourceの種類">
  <section class="comparison-card"><h4>Generic supervised</h4><dl><dt>例</dt><dd>ImageNet</dd><dt>強み</dt><dd>汎用的なvisual feature</dd><dt>注意</dt><dd>domain gap</dd></dl></section>
  <section class="comparison-card"><h4>Self-supervised</h4><dl><dt>例</dt><dd>DINO系</dd><dt>学習</dt><dd>labelなしで表現学習</dd><dt>強み</dt><dd>大規模dataを利用しやすい</dd></dl></section>
  <section class="comparison-card"><h4>Vision-language</h4><dl><dt>例</dt><dd>CLIP系</dd><dt>学習</dt><dd>image-text relation</dd><dt>強み</dt><dd>semantic representation</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Domain-specific</h4><dl><dt>例</dt><dd>医療画像task間転移</dd><dt>強み</dt><dd>撮影条件・構造が近い</dd><dt>候補</dt><dd>domain gapが小さい場合</dd></dl></section>
</div>

## Fine-tuning戦略 {#strategy}

<div class="model-architecture" aria-label="Fine-tuning戦略の違い">
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-op-box"><span><strong>Head only</strong><br>backbone freeze</span></div><span class="model-stage__label">最小更新</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Partial unfreeze<br>deep layers中心</span></div><span class="model-stage__label">中間</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Full fine-tune<br>all layers</span></div><span class="model-stage__label">一般的baseline</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Layer-wise LR</strong><br>backbone小 / head大</span></div><span class="model-stage__label">高度な調整</span></div>
  </div>
  <p class="model-architecture__caption">どれが最適かはdataset size・domain gap・checkpoint・計算budget依存です。同じOOFで比較します。</p>
</div>

実務上は、まずpretrained backbone + 新しいheadを作り、小さめlearning rateで全層fine-tuneする構成をbaselineにしやすいです。domain gapが大きい場合や極端にsampleが少ない場合はfreeze範囲や段階的unfreezeを比較します。

## Kaggleでの実例 {#kaggle-examples}

RSNA Intracranial Aneurysm Detectionの1位解法では、backboneをvessel segmentation taskで事前学習することが最大の要因だったとablationで報告しています。96×192×192設定で、pretrainingありのfinal model score 0.902に対し、**without backbone pretrainingは0.794**でした（[1st Place Solution](https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/1st-place-solution)）。

Google Universal Image Embeddingの1位解法では大規模pretrained ViT/CLIP系weightを探索し、ImageNet-22K weightより大規模データで学習したCLIP系weightを強い出発点として利用しています（[1st place solution](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)）。

Happywhaleの1位解法も複数のImageNet-pretrained EfficientNet/EfficientNetV2を使っています（[1st Place Solution](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)）。

## 注意点 {#pitfalls}

### Pretraining data leakage

事前学習datasetにCompetition testのlabel相当情報や重複sampleが含まれる可能性がある場合はRulesとprovenanceを確認します。

### Domain gap

自然画像ImageNet→特殊医療画像などで、pretrainingが弱い/逆効果の可能性もあります。scratchやdomain-specific weightを同じCVで比較します。

### Architecture差とcheckpoint差を混同する

CNNとViTを比較しているつもりでも、一方だけ桁違いのdataでpretrainingされていれば公平なarchitecture比較ではありません。model family、pretraining data、objective、resolutionを別々に記録します。

## Quick Reference {#quick-reference}

- pretrained checkpointは「学習済みbackbone weight」。
- Competitionではheadを付け替えてfine-tuneする。
- architecture名だけでなくpretraining sourceまで記録する。
- domain-specific pretrainingは高価値候補。
- scratchとの差をablationし、Rulesも確認する。

## 関連項目

- [CNN Backbones]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [External Data]({{ '/wiki/advanced-methods/external-data.html' | relative_url }})

## 参考文献

1. [Kaggle, “RSNA Intracranial Aneurysm Detection: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/writeups/1st-place-solution)
2. [Kaggle, “Google Universal Image Embedding: 1st place solution”, 2022](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)
3. [Kaggle, “Happywhale: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/happy-whale-and-dolphin/writeups/preferred-dolphin-1st-place-solution)
4. [Dosovitskiy et al., “An Image is Worth 16x16 Words”, 2020](https://arxiv.org/abs/2010.11929)
5. [Tan & Le, “EfficientNet”, 2019](https://arxiv.org/abs/1905.11946)

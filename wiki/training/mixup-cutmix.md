---
layout: default
title: Mixup / CutMix
description: 複数sampleとlabelを混ぜ、新しい中間sampleを作ってNeural Networkのmemorizationと過学習を抑えるaugmentation。
summary: Mixupは入力全体とlabelを線形混合し、CutMixは領域を貼り替えて面積比でlabelを混合する。
type: reference
domain: kaggle
topic: mixup-cutmix
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - training
  - augmentation
  - mixup
  - cutmix
---

# Mixup / CutMix

**MixupとCutMixは、2つの学習sampleを混ぜて新しいsampleを作り、入力を混ぜた割合に合わせてlabelも混ぜるNeural Network向けData Augmentationです。**

Mixupは画像全体を線形補間し、CutMixは一方の画像領域をもう一方へ貼り付けます。重要なのは、**入力だけを混ぜず、教師labelも同じ割合で変える**ことです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#overview">違い</a>
  <a href="#mixup">Mixup</a>
  <a href="#cutmix">CutMix</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず見た目の違い {#overview}

<div class="model-architecture" aria-label="MixupとCutMixの入力の混ぜ方">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">同じ2 sampleを使っても、MixupとCutMixでは混ぜ方が違う</div><p class="model-architecture__subtitle">Mixupは全pixelを重ね、CutMixは局所領域だけを別sampleへ置き換えます。</p></div>
    <span class="model-architecture__badge">input mixing</span>
  </div>
  <div class="sample-visual-pair">
    <div class="sample-tile"><strong>Sample A</strong><br><br>Class A<br>label = [1, 0]<br><br>画像全体がA</div>
    <div class="sample-tile"><strong>Sample B</strong><br><br>Class B<br>label = [0, 1]<br><br>画像全体がB</div>
    <div class="sample-tile is-mixed"><strong>Mixup</strong><br><br>AとBを全体で重ねる<br>λ=0.7なら<br>label = [0.7, 0.3]</div>
  </div>
  <div class="sample-visual-pair" style="margin-top:14px">
    <div class="sample-tile"><strong>Sample A</strong><br><br>背景として残る領域</div>
    <div class="sample-tile"><strong>Sample B</strong><br><br>貼り付けるpatch</div>
    <div class="sample-tile is-cutmix"><strong>CutMix</strong><br><br>矩形だけBへ置換<br>B面積30%なら<br>label ≈ [0.7, 0.3]</div>
  </div>
  <p class="model-architecture__caption">模式例。実際の画像内容ではなく、混合方法とlabelの対応を示しています。</p>
</div>

## Mixup {#mixup}

2 sample $(x_i,y_i)$, $(x_j,y_j)$を係数$\lambda$で混ぜます。先に直感を書くと、**入力を70:30で混ぜたら正解labelも70:30にする**処理です。

$$
\tilde{x}=\lambda x_i+(1-\lambda)x_j
$$

$$
\tilde{y}=\lambda y_i+(1-\lambda)y_j
$$

<div class="model-architecture" aria-label="Mixupの演算プロセス">
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor is-wide"><span>Image A<br>label A</span></div><span class="model-stage__label">Sample i</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>× λ</strong><br>例: 0.7</span></div><span class="model-stage__label">weight</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Image B<br>label B</span></div><span class="model-stage__label">Sample j</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>× (1−λ)</strong><br>例: 0.3</span></div><span class="model-stage__label">weight</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Mixed input<br>soft label</span></div><span class="model-stage__label">Train sample</span></div>
  </div>
</div>

原論文は、sample間でより線形な振る舞いを促しmemorizationを抑えるregularizationとしてMixupを提案しています（[mixup paper](https://arxiv.org/abs/1710.09412)）。

## CutMix {#cutmix}

CutMixでは画像全体を透明に重ねず、**矩形領域を別sampleへ置換**します。labelの混合比は通常、その矩形が占める面積比から決めます。

<div class="model-architecture" aria-label="CutMixの領域置換とlabel混合">
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Image A</span></div><span class="model-stage__label">Base image</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Image B<br>random rectangle</span></div><span class="model-stage__label">Patch source</span></div>
    <div class="model-stage"><div class="sample-tile is-cutmix" style="min-height:92px"><strong>Paste region</strong><br>局所だけB</div><span class="model-stage__label">Mixed image</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Area ratioで<br>label mix</span></div><span class="model-stage__label">Soft target</span></div>
  </div>
</div>

Mixupより元画像の局所textureやobject partが残りやすいため、画像taskで強いregularizationとして使われます（[CutMix paper](https://arxiv.org/abs/1905.04899)）。

## Kaggleでの実例 {#kaggle-examples}

ASL Fingerspellingの1位解法ではCutMixがablationで**+0.005**と報告され、final pipelineの主要augmentationの一つでした。一方hidden-layer Mixupは「効かなかったこと」に分類されています（[1st Place Solution](https://www.kaggle.com/competitions/asl-fingerspelling/writeups/darragh-dieter-1st-place-solution-improved-squeeze)）。

Recursion Cellular Image Classificationの1位解法はsingle final modelでCutMixを使い、ensembleではMixupを使ったDenseNet/ResNeXtも含めています（[1st Place Solution](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)）。

Birdsong Recognitionの1位解法もfinal ensembleにMixupあり/なし双方のfold modelを含めています（[1st Place Solution](https://www.kaggle.com/competitions/birdsong-recognition/writeups/ryan-wong-1st-place-solution)）。

## 注意点 {#pitfalls}

### Labelを混ぜられないtask

Detection/segmentation/sequence generationではlabel構造も整合的に変換する必要があります。classification用実装をそのまま使えません。

### Validationへ適用する

通常はTrain augmentationです。ValidationをMixup/CutMixするとCompetition条件と異なるMetricになります。

### 強度過多

小さなobjectや細粒度classでは重要部分を消す可能性があります。`alpha`やCutMix areaをOOFでablationします。

## Quick Reference {#quick-reference}

- Mixupは入力全体とlabelを同じ比率で線形混合。
- CutMixは領域を貼り替え、面積比でlabelを混合。
- Trainだけに適用する。
- taskのlabel構造を壊さない実装にする。
- 「強いaugmentationだから採用」ではなくOOFでablationする。

## 関連項目

- [Data Augmentation]({{ '/wiki/training/data-augmentation.html' | relative_url }})
- [CNN Backbones]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})

## 参考文献

1. [Zhang et al., “mixup: Beyond Empirical Risk Minimization”, 2017](https://arxiv.org/abs/1710.09412)
2. [Yun et al., “CutMix: Regularization Strategy to Train Strong Classifiers with Localizable Features”, 2019](https://arxiv.org/abs/1905.04899)
3. [Kaggle, “ASL Fingerspelling: 1st Place Solution”, 2023](https://www.kaggle.com/competitions/asl-fingerspelling/writeups/darragh-dieter-1st-place-solution-improved-squeeze)
4. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)
5. [Kaggle, “Birdsong Recognition: 1st Place Solution”, 2020](https://www.kaggle.com/competitions/birdsong-recognition/writeups/ryan-wong-1st-place-solution)

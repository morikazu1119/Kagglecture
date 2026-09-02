---
layout: default
title: Mixup / CutMix
description: 複数sampleとlabelを混ぜ、新しい中間sampleを作ってNeural Networkのmemorizationと過学習を抑えるaugmentation。
summary: Mixupは画像・labelを線形混合し、CutMixは領域を貼り替えて面積比でlabelを混合する。
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

**MixupとCutMixは、2つの学習sampleを混ぜて新しいsampleを作り、labelも混合するNeural Network向けData Augmentationです。**

Mixupは入力全体を線形補間し、CutMixは画像の矩形領域を別sampleへ置き換えます。単なる幾何変換より強いregularizationとして使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mixup">Mixup</a>
  <a href="#cutmix">CutMix</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## Mixup {#mixup}

2 sample $(x_i,y_i)$, $(x_j,y_j)$を係数$\lambda$で混ぜます。

$$
\tilde{x}=\lambda x_i+(1-\lambda)x_j
$$

$$
\tilde{y}=\lambda y_i+(1-\lambda)y_j
$$

原論文は、sample間でより線形な振る舞いを促しmemorizationを抑えるregularizationとして提案しています（[mixup paper](https://arxiv.org/abs/1710.09412)）。

## CutMix {#cutmix}

CutMixでは画像全体を透明に混ぜず、一方の画像patchをもう一方へ貼り付け、貼り付け面積に応じてlabelを混ぜます。局所情報を保ちながらstrong augmentationを作りやすい方法です。

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

- Mixupは入力とlabelを線形混合。
- CutMixは領域を貼り替えてlabelを面積比で混合。
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

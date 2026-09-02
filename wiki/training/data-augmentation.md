---
layout: default
title: Data Augmentation
summary: ラベルの意味を保つ変換で学習sampleを増やし、モデルが不要な見た目や表現へ過適合するのを抑える手法。
type: reference
domain: kaggle
topic: data-augmentation
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - training
  - augmentation
  - regularization
---

# Data Augmentation

**Data Augmentationは、ラベルの意味を保つ変換をTrain sampleへ加え、同じ正解を持つ別バリエーションを作る手法です。**

画像ならflip/crop/color変換、音声ならnoise/time shift、テキストなら意味保存変換などがあります。目的は単純なデータ水増しではなく、**本番で変わってもよい要素にモデルを鈍感にすること**です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#principle">原則</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 原則 {#principle}

良いaugmentationは「現実に起こり得る変化」かつ「targetを変えない変化」です。

```text
画像の明るさが少し変わる -> defect classは同じ: 妥当
左右が診断上重要な画像をflip -> target解釈が変わる可能性: 要注意
```

## 使う場面 {#use-cases}

- Train sampleが少ない。
- 画像・音声・テキストに自然な変換がある。
- Train scoreだけ高くValidationが伸びない。
- testの撮影/表現条件にvariationがある。

## Kaggleでの実例 {#kaggle-examples}

Severstal Steel Defect Detectionの1位解法ではRandomCrop、HFlip、VFlip、RandomBrightnessContrastに加え、defect領域をblackoutしてラベルも整合的に変更するcustom augmentationを使い、local CVとPublic LBで有効だったと報告しています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。

Medical AI Contest 7th 2025の1位解法ではTranspose、Vertical/Horizontal Flip、Affineを採用した一方、Blur/Noise/BrightnessContrast等のpixel-value augmentationは「効かなかったこと」に分類しています（[1st Place Solution](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)）。

Recursion Cellular Image Classificationの1位解法でもrandom resized crop、horizontal/vertical flip、90° rotation、channel scaling/shifting等を使っています（[1st Place Solution](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)）。

## 注意点 {#pitfalls}

### target semanticsを壊す

augmentationは強ければ良いわけではありません。左右・向き・色・時間がtargetに意味を持つかを先に確認します。

### Validationにもrandom augmentationを入れる

Validationは通常、安定した本番条件で評価します。Train augmentationとTest-Time Augmentationは役割を分けます。

### augmented duplicateがfoldをまたぐ

元画像の派生sampleを事前生成してからrandom splitすると、ほぼ同じ画像がTrain/Validationへ分かれます。split後にTrain側だけaugmentationします。

## Quick Reference {#quick-reference}

- targetを保つ変換だけ使う。
- splitしてからTrainへaugmentationする。
- 1種類ずつablationする。
- 強度をCVで選ぶ。
- Test-Time Augmentationとは分けて評価する。

## 関連項目

- [Test-Time Augmentation]({{ '/wiki/advanced-methods/test-time-augmentation.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
2. [Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)
3. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution Write-up & Code”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)
4. [Albumentations Documentation](https://albumentations.ai/docs/)

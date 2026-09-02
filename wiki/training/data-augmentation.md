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

**Data Augmentationは、targetの意味を変えない範囲でTrain sampleを変形し、「見た目が少し変わっても同じもの」とモデルへ教える手法です。**

画像ならflip/crop/color変換、音声ならnoise/time shift、テキストなら意味保存変換などがあります。目的は単純なデータ水増しではなく、**本番で変わってもよい要素にモデルを鈍感にすること**です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#principle">原則</a>
  <a href="#strength">強度</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 何を変えてよいのか {#principle}

良いaugmentationは、**入力は変わるがtarget semanticsは変わらない**変換です。逆に、変換後に正解labelまで変わるなら、そのまま同じlabelを付けて学習すると誤教師になります。

<div class="model-architecture" aria-label="Data Augmentationで妥当な変換と危険な変換の比較">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">「見た目だけ変わる」のか、「正解の意味まで変わる」のかを分ける</div><p class="model-architecture__subtitle">augmentationを選ぶ基準はライブラリにあるかではなく、taskの生成過程でその変化が起こり得るかです。</p></div>
    <span class="model-architecture__badge">concept example</span>
  </div>
  <div class="sample-visual-pair">
    <div class="sample-tile"><strong>Original</strong><br><br>部品画像<br>class = defect A<br><br>基準となるsample</div>
    <div class="sample-tile is-mixed"><strong>Valid transform</strong><br><br>明るさ・cropが少し変化<br>class = defect A<br><br>targetは維持</div>
    <div class="sample-tile is-cutmix"><strong>Potentially invalid</strong><br><br>左右反転で意味が変わるtask<br>同じlabelのままは危険</div>
  </div>
  <p class="model-architecture__caption">模式例です。左右反転が妥当かどうかはtask依存です。自然画像では妥当でも、左右・向き・文字が意味を持つtaskでは不適切な場合があります。</p>
</div>

たとえば胸部画像で左右が診断上重要ならhorizontal flipを無条件で入れるべきではありません。一方、撮影照明が本番で揺れるならbrightness/contrast変換は現実的なvariationを再現できる可能性があります。

## Augmentation強度の考え方 {#strength}

弱すぎると元sampleとほぼ同じでregularization効果が小さく、強すぎるとtargetを壊します。重要なのは「強いほど良い」ではなく、**本番分布にあり得る範囲を広げる**ことです。

<div class="model-architecture" aria-label="Data Augmentation強度の模式図">
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-op-box"><span><strong>弱すぎる</strong><br>ほぼ元画像</span></div><span class="model-stage__label">効果小</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>自然なvariation<br>crop / color / noise</span></div><span class="model-stage__label">狙う範囲</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Train distribution<br>を適切に拡張</span></div><span class="model-stage__label">generalization</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>強すぎる</strong><br>target semantics破壊</span></div><span class="model-stage__label">誤教師risk</span></div>
  </div>
</div>

実験ではaugmentationを一気に多数追加するより、1種類ずつ、または意味の近いgroup単位でablationしてOOFへの寄与を確認します。

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
- 「現実に起こるvariationか」で選ぶ。
- splitしてからTrainへaugmentationする。
- 1種類ずつablationする。
- 強度はOOFで選ぶ。

## 関連項目

- [Mixup / CutMix]({{ '/wiki/training/mixup-cutmix.html' | relative_url }})
- [Test-Time Augmentation]({{ '/wiki/advanced-methods/test-time-augmentation.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
2. [Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)
3. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution Write-up & Code”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)
4. [Albumentations Documentation](https://albumentations.ai/docs/)

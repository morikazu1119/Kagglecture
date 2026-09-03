---
layout: default
title: CLIP
summary: Image EncoderとText Encoderをcontrastive learningで同じembedding空間へ揃え、画像と言語の類似度を直接比較できるmultimodal model。
type: reference
domain: kaggle
topic: clip
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, multimodal, clip, vision-language]
---

# CLIP

**CLIP（Contrastive Language–Image Pre-training）は、画像とtextを別encoderでvectorへ変換し、「正しい画像-caption pairは近く、間違ったpairは遠く」なるように同じembedding空間へ揃えるmultimodal modelです。**

通常のimage classifierが固定class IDを直接学ぶのに対し、CLIPは**画像と自然言語の対応関係**を事前学習します。そのためzero-shot classification、image retrieval、embedding feature抽出などへ使えます（[CLIP paper](https://arxiv.org/abs/2103.00020)）。

<nav class="article-jump-nav"><a href="#pair">1 pairの処理</a><a href="#contrastive">Contrastive Learning</a><a href="#architecture">全体構造</a><a href="#zeroshot">Zero-shot</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 画像とcaptionをvectorへする {#pair}

画像`犬の写真`とtext`a photo of a dog`を入力すると、Image EncoderとText EncoderがそれぞれD次元vectorを出します。正しいpairならcosine similarityが高くなるように学習します。

<div class="model-architecture" aria-label="CLIP image text pair">
  <div class="model-architecture__header"><div><div class="model-architecture__title">ImageとTextを別encoderで同じ座標系へ</div><p class="model-architecture__subtitle">画像vectorとtext vectorの内積/類似度をそのまま比較できます。</p></div><span class="model-architecture__badge">dual encoder</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Image<br>🐕</span></div></div><div class="model-stage"><div class="model-op-box"><span>Image<br>Encoder</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Image<br>Embedding</span></div></div><div class="model-stage"><div class="model-op-box"><span>Cosine<br>Similarity</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Text<br>Embedding</span></div></div><div class="model-stage"><div class="model-op-box"><span>Text<br>Encoder</span></div></div><div class="model-stage"><div class="model-tensor"><span>"a dog"</span></div></div></div>
</div>

## Batch全体で正しいpairを当てる {#contrastive}

1 pairだけでなく、batch内にN imagesとN captionsを置き、N×Nのsimilarity matrixを作ります。対角線が正しいpairです。

<div class="model-architecture" aria-label="CLIP contrastive similarity matrix">
  <div class="model-architecture__header"><div><div class="model-architecture__title">正しいimage-text pairだけsimilarityを高くする</div><p class="model-architecture__subtitle">同じbatchの他caption/imageがnegative exampleになります。</p></div><span class="model-architecture__badge">contrastive loss</span></div>
  <div class="html-matrix" style="--matrix-cols:3"><div class="matrix-cell is-good">I1·T1<br>high</div><div class="matrix-cell">I1·T2</div><div class="matrix-cell">I1·T3</div><div class="matrix-cell">I2·T1</div><div class="matrix-cell is-good">I2·T2<br>high</div><div class="matrix-cell">I2·T3</div><div class="matrix-cell">I3·T1</div><div class="matrix-cell">I3·T2</div><div class="matrix-cell is-good">I3·T3<br>high</div></div>
  <p class="model-architecture__caption">模式図。対角線が正しいpairです。</p>
</div>

## CLIP全体 {#architecture}

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">Image EncoderとText Encoderを並列に持つdual-encoder architecture</div><p class="model-architecture__subtitle">original CLIPではImage側にResNet/ViT、Text側にTransformerを使います。</p></div><span class="model-architecture__badge">full architecture</span></div><div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-op-box"><span>ResNet / ViT<br>Image Encoder</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Shared<br>Embedding Space</span></div></div><div class="model-stage"><div class="model-op-box"><span>Similarity /<br>Retrieval</span></div></div><div class="model-stage"><div class="model-op-box"><span>Transformer<br>Text Encoder</span></div></div><div class="model-stage"><div class="model-tensor"><span>Text</span></div></div></div></div>

## Zero-shot classification {#zeroshot}

classごとに`a photo of a dog`、`a photo of a cat`のようなpromptを作り、それぞれtext embeddingへします。query imageとのsimilarityが最も高いtext classを予測すれば、task-specific classifier headなしでclassificationできます。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Zero-shot CLIP</h4><dl><dt>Class</dt><dd>自然言語prompt</dd><dt>Training</dt><dd>downstream labelでheadをfitしない</dd><dt>利点</dt><dd>新classへ柔軟</dd></dl></section><section class="comparison-card"><h4>Fine-tuned classifier</h4><dl><dt>Class</dt><dd>fixed output head</dd><dt>Training</dt><dd>Competition labelsでfit</dd><dt>利点</dt><dd>domain-specific adaptation</dd></dl></section></div>

Kaggleではzero-shot単独より、pretrained embedding、retrieval、fine-tuning、feature generationとして使うことが多いです。

## Kaggleでの実例 {#kaggle-examples}

Google Universal Image Embedding 2022の4位解法ではOpenCLIPをbaseに**ViT-L-14-336 / ViT-H-14 CLIP models**をtrainingし、model soupとembedding concatで1024D descriptorを作っています（[4th place solution](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359487)）。

Stable Diffusion - Image to Prompts 2023では画像からprompt embeddingを予測するtaskがあり、CLIP系embedding空間やVision/Text representationの理解が重要でした。5位解法は直接prompt embeddingを画像modelから回帰する方針を採用しています（[5th place solution](https://www.kaggle.com/competitions/stable-diffusion-image-to-prompts/writeups/kydrt-5th-place-solution)）。

## 注意点 {#pitfalls]

### similarityは確率ではない

cosine similarity 0.8を「80%正しい」と解釈しません。classification probabilityが必要ならtemperature/softmax/calibrationを別途考えます。

### prompt依存

zero-shot class scoreは`a photo of ...`等のprompt wordingで変わります。prompt ensembleもValidation対象です。

### domain shift

web image-text pretrainingが医療画像や特殊センサーにそのまま適合する保証はありません。domain-specific encoderとの比較が必要です。

## Quick Reference

- Image Encoder + Text Encoderのdual encoder。
- 正しいpairを近づけるcontrastive learning。
- image/textを同じembedding空間で比較。
- zero-shot classification / retrieval / embeddingに利用。
- similarityとcalibrated probabilityは別物。

## 関連項目

- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})

## 参考文献

1. Radford et al., “Learning Transferable Visual Models From Natural Language Supervision”, 2021. https://arxiv.org/abs/2103.00020
2. OpenCLIP repository. https://github.com/mlfoundations/open_clip
3. Kaggle, “Google Universal Image Embedding: 4th Place Solution”, 2022. https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359487
4. Kaggle, “Stable Diffusion - Image to Prompts: 5th place solution”, 2023. https://www.kaggle.com/competitions/stable-diffusion-image-to-prompts/writeups/kydrt-5th-place-solution

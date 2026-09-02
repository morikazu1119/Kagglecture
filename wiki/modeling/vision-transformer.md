---
layout: default
title: Vision Transformer
description: 画像をpatch sequenceとしてTransformerへ入力し、self-attentionでglobal interactionを学習するVision model。
summary: 画像patchをtoken化し、position情報を加え、Self-AttentionとMLPを積み重ねて画像全体の関係を学習するarchitecture。
type: reference
domain: kaggle
topic: vision-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - transformer
  - computer-vision
---

# Vision Transformer

**Vision Transformer（ViT）は、画像を小さなpatchへ分割してtoken列へ変換し、Transformer EncoderのSelf-Attentionでpatch同士の関係を学習するモデルです。**

CNNがkernelで近傍を順番に見るのに対し、ViTでは1つのtokenが離れたtokenへも直接attentionを向けられます。原論文では画像patch列へpure Transformerを適用し、大規模事前学習後のtransferで高い画像認識性能を示しました（[ViT paper](https://arxiv.org/abs/2010.11929)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#patch-embedding">Patch化</a>
  <a href="#attention">Self-Attention</a>
  <a href="#encoder">Encoder構造</a>
  <a href="#comparison">CNNとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## ImageからTokenへ {#patch-embedding}

ViTでは、まず画像を同じ大きさのpatchへ分割します。たとえば224×224画像を16×16 patchへ切ると14×14=196 patchです。各patchを1本のvectorへ変換し、Linear Projectionでembedding dimensionへ写像します。

<div class="model-architecture" aria-label="Vision Transformerで画像をpatch tokenへ変換する構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">2D imageをpatch列へほどき、embeddingへ変換する</div><p class="model-architecture__subtitle">画像の位置関係はpatch分割後に消えやすいため、position情報をtokenへ加えます。</p></div>
    <span class="model-architecture__badge">patch embedding</span>
  </div>
  <div class="patch-token-layout">
    <div>
      <div class="patch-grid" aria-label="4×4に分割された画像patch">
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
        <span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span><span class="patch-cell"></span>
      </div>
      <p class="model-architecture__caption">Imageを固定サイズpatchへ分割</p>
    </div>
    <div>
      <div class="model-stage-row" style="--model-cols:3; padding-top:0">
        <div class="model-stage"><div class="model-tensor is-wide"><span>Flatten patch<br>P1...PN</span></div><span class="model-stage__label">Patch vectors</span></div>
        <div class="model-stage"><div class="model-op-box"><span><strong>Linear Projection</strong><br>D次元embeddingへ</span></div><span class="model-stage__label">Patch embedding</span></div>
        <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>[CLS] + P1...PN<br>+ Position</span></div><span class="model-stage__label">Token sequence</span></div>
      </div>
    </div>
  </div>
  <p class="model-architecture__caption">patch数・token数は理解用の模式例です。classificationではCLS tokenを使う構成が代表的ですが、実装によってpooling方法は異なります。</p>
</div>

Position Embeddingは「P1は左上、P16は右下」のような位置情報をtokenへ与える役割です。これがないと、同じpatch集合でも並び方を区別しづらくなります。

## Self-Attentionを目で追う {#attention}

Self-Attentionでは、各tokenから**Query（何を探すか）・Key（自分が何を持つか）・Value（実際に渡す情報）**を作ります。QueryとKeyの相性からattention weightを計算し、Valueを重み付きで混ぜます。

下の図ではQuery patchを切り替えられます。強く表示されるpatchほど、そのQueryが多く参照している模式例です。実際のViTではheadごと・layerごとにattention patternが異なります。

<div class="interactive-viz" data-model-interactive="vit-attention">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">1つのpatchが画像全体のどこを見るか</div>
      <p class="interactive-viz__subtitle">Query patchを変えると参照先が変わります。離れたpatchにも直接attentionを向けられる点がCNNの局所convolutionとの大きな違いです。</p>
    </div>
    <span class="interactive-status" data-vit-status data-state="safe">Query P1</span>
  </div>
  <p class="interactive-note">模式例。attention weightは理解用の人工値で、学習済みViTの実測値ではありません。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Query patch</span>
    <label class="interactive-range">
      <input type="range" min="1" max="16" step="1" value="1" data-vit-query aria-label="Self-AttentionのQuery patch">
      <span class="interactive-range-labels"><span>P1</span><span>P16</span></span>
    </label>
  </div>
  <div class="vit-operation-board">
    <div class="vit-patch-scene">
      <div class="vit-patch-grid" data-vit-patches aria-label="Attention対象の4×4 patch grid"></div>
    </div>
    <div>
      <div class="conv-panel__title">Attention weight上位</div>
      <div class="vit-attention-bars" data-vit-bars></div>
      <p class="interactive-explanation" data-vit-explanation aria-live="polite">Queryを切り替えると参照先が変わります。</p>
    </div>
  </div>
  <noscript><p class="interactive-explanation">Self-Attentionでは各patch tokenが画像内の他tokenを重み付きで参照し、局所距離に縛られず情報を集約できます。</p></noscript>
</div>

Attentionの中心計算は次です。まず直感として、$QK^T$が「どのtokenをどれだけ見るか」、その重みで$V$を混ぜると考えます。

$$
Attention(Q,K,V)=softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

Multi-Head Self-Attentionではこの計算を複数headで並列に行い、異なる関係を同時に捉えます。

## Transformer Encoderの内部 {#encoder}

ViTは「Attentionを1回して終わり」ではありません。原論文のEncoder blockでは、LayerNorm、Multi-Head Self-Attention、Residual connection、MLPを繰り返します。

<div class="model-architecture" aria-label="Vision Transformer Encoder blockの内部構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Encoder Block: Attentionで混ぜ、MLPで各tokenを変換する</div><p class="model-architecture__subtitle">2本のResidual pathにより、block入力をAttention後・MLP後へ足し戻します。</p></div>
    <span class="model-architecture__badge">Transformer block</span>
  </div>
  <div class="transformer-encoder">
    <div class="transformer-block"><strong>Tokens</strong>N×D</div>
    <div class="transformer-block"><strong>LayerNorm + MHA</strong>Q/K/Vを作りtoken間を混合</div>
    <div class="transformer-add" aria-label="Residual add">+</div>
    <div class="transformer-block"><strong>LayerNorm + MLP</strong>各token内部のfeatureを変換</div>
    <div class="transformer-add" aria-label="Residual add">+</div>
    <div class="transformer-block"><strong>Output</strong>N×D</div>
    <div class="transformer-encoder__skip" aria-hidden="true"></div>
    <div class="transformer-encoder__skip is-second" aria-hidden="true"></div>
  </div>
  <p class="model-architecture__caption">このblockをL層stackします。token数Nは基本的に維持され、embedding dimension Dの表現が更新されます。</p>
</div>

<div class="model-architecture" aria-label="Vision Transformer全体のarchitecture">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">ViT全体: Patch Embedding → Encoder stack → Head</div><p class="model-architecture__subtitle">Encoderを深く積み重ねることで、patch表現を段階的に更新します。</p></div>
    <span class="model-architecture__badge">2.5D layer stack</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Image<br>H×W×3</span></div><span class="model-stage__label">Input</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Patch Embedding<br>N×D</span></div><span class="model-stage__label">Tokenize</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Encoder<br>Block × L</span></div><span class="model-stage__label">Attention + MLP</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Deep token<br>representation</span></div><span class="model-stage__label">Global features</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>CLS / Pool<br>Head / Decoder</span></div><span class="model-stage__label">Task output</span></div>
  </div>
</div>

## CNNとの比較 {#comparison}

<div class="comparison-board" aria-label="CNNとVision Transformerの比較">
  <section class="comparison-card"><h4>CNN</h4><dl><dt>基本演算</dt><dd>局所convolution</dd><dt>Global関係</dt><dd>層を重ねreceptive fieldを広げる</dd><dt>Inductive bias</dt><dd>局所性・平行移動へ強い</dd><dt>小データ</dt><dd>比較的安定しやすい</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Vision Transformer</h4><dl><dt>基本演算</dt><dd>Self-Attention + MLP</dd><dt>Global関係</dt><dd>遠いtokenへ直接attention可能</dd><dt>Inductive bias</dt><dd>CNNより弱く、data/pretraining依存が大きい場合</dd><dt>計算</dt><dd>token数増加でattention costが増える</dd></dl></section>
</div>

どちらか一方へ決め打ちせず、同じCVでpretrained CNN/ViTを比較します。

## Kaggleでの実例 {#kaggle-examples}

Cassava Leaf Disease Classificationの1位解法ではImageNet weightのViT-B/16を384×384で5-fold学習し、EfficientNet-B4 NoisyStudent modelと併用しています（[1st Place Solution](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/discussion/221957)）。

26-shinnen-3Dpathologyの1位解法ではDINOv3 ViT-Baseの中間Transformer blockからmulti-scale featureを取り出し、custom FPN decoderへ渡すsegmentation modelがsingle bestの一つになっています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

一方、BirdCLEF 2024の1位チームではViT系がEfficientNet/RegNetより明確に悪かったと報告しています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。**ViTが新しいから常に強いわけではありません。**

## 注意点 {#pitfalls}

### Patch sizeとresolution

resolutionを上げる、またはpatch sizeを小さくするとtoken数が増えます。標準Self-Attentionはtoken間の組み合わせを扱うため、memoryと計算量が大きくなります。

### Pretraining差をarchitecture差と誤認する

ImageNet-1K CNNと大規模self-supervised/vision-language pretraining済みViTを比べると、architectureだけの差ではありません。checkpointの学習dataとobjectiveまで記録します。

### Segmentationでmulti-scaleが必要

plain ViTはCNNのような自然なfeature pyramidを持たないため、中間block抽出、hierarchical Transformer、FPN等でmulti-scale featureを作る設計が必要になる場合があります。

## Quick Reference

- Imageをpatchへ切り、Linear Projectionでtokenへ変える。
- Position情報を加えてpatchの場所を保持する。
- Self-Attentionは離れたpatch同士を直接関連付けられる。
- EncoderはAttentionだけでなくLayerNorm・Residual・MLPを含む。
- resolution × patch size × batch sizeで計算budgetを見る。

## 関連項目

- [CNN Backbones]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})

## 参考文献

1. [Dosovitskiy et al., “An Image is Worth 16x16 Words”, 2020](https://arxiv.org/abs/2010.11929)
2. [Kaggle, “Cassava Leaf Disease Classification: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/discussion/221957)
3. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)
4. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)
5. [Kaggle, “Google Universal Image Embedding: 1st place solution”, 2022](https://www.kaggle.com/competitions/google-universal-image-embedding/discussion/359316)

---
layout: default
title: CNN
summary: 小さなkernelを画像上で共有しながら走査し、局所特徴をfeature mapとして階層的に抽出するConvolutional Neural Network。
type: reference
domain: kaggle
topic: cnn
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - modeling
  - cnn
  - computer-vision
---

# CNN

**CNN（Convolutional Neural Network）は、画像の小さな領域へ同じkernelを繰り返し当て、edge・texture・shapeのような局所特徴をfeature mapへ変換するモデルです。**

このページはCNN共通の原理だけを扱います。Residual connection、compound scaling、modern CNN blockなどは、それぞれ[ResNet]({{ '/wiki/modeling/resnet.html' | relative_url }})、[EfficientNet]({{ '/wiki/modeling/efficientnet.html' | relative_url }})、[ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})の記事で分けて説明します。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#convolution">畳み込み</a><a href="#channels">Channel</a><a href="#architecture">全体構造</a><a href="#use-cases">使う場面</a><a href="#comparison">使い分け</a><a href="#pitfalls">注意点</a>
</nav>

## 1回のConvolutionを目で追う {#convolution}

3×3 kernelなら、画像の3×3領域とkernelの9個の重みを掛け合わせて足します。**この積和1回でoutput feature mapの1セル**ができます。kernelを1マスずつ動かすと、同じ重みで画像全体を調べられます。

<div class="interactive-viz" data-model-interactive="cnn-convolution">
  <div class="interactive-viz__header"><div><div class="interactive-viz__title">3×3 kernelからfeature mapの1セルができる</div><p class="interactive-viz__subtitle">位置を動かすと、kernelが現在見ているreceptive fieldとoutput位置が対応して変わります。</p></div><span class="interactive-status" data-cnn-status data-state="safe">位置 (1, 1)</span></div>
  <p class="interactive-note">模式例。入力値・kernel値は演算理解用の人工値です。</p>
  <div class="interactive-control-row"><span class="interactive-control-label">Kernel位置</span><button class="interactive-button" type="button" data-cnn-prev>前</button><label class="interactive-range"><input type="range" min="0" max="8" step="1" value="0" data-cnn-position aria-label="畳み込みkernelの位置"><span class="interactive-range-labels"><span>左上</span><span>右下</span></span></label><button class="interactive-button" type="button" data-cnn-next>次</button></div>
  <div class="conv-board"><section class="conv-panel"><div class="conv-panel__title">Input 5×5</div><div class="conv-grid" style="--grid-size:5" data-cnn-input-grid></div></section><section class="conv-panel conv-kernel"><div class="conv-panel__title">Kernel 3×3</div><div class="conv-grid" style="--grid-size:3" data-cnn-kernel-grid></div></section><section class="conv-panel"><div class="conv-panel__title">Output 3×3</div><div class="conv-grid" style="--grid-size:3" data-cnn-output-grid></div></section></div>
  <div class="conv-equation" data-cnn-equation>選択領域とkernelの積和がここに表示されます。</div>
  <p class="interactive-explanation">同じkernel weightを場所ごとに共有するため、「左上専用のedge detector」「右下専用のedge detector」を別々に学ぶ必要がありません。</p>
  <noscript><p class="interactive-explanation">Convolutionは小さな領域とkernelの積和を取り、その結果をfeature mapの対応セルへ書き込む処理です。</p></noscript>
</div>

### stride / padding / receptive field

- **stride**: kernelを何マスずつ動かすか。大きいほどoutputの縦横が小さくなる。
- **padding**: 入力の外側へ値を足し、端の情報やoutput sizeを制御する。
- **receptive field**: あるfeatureが元画像のどこまでを見ているか。層を重ねるほど実質的な受容野は広がる。

## 1枚ではなく複数channelを作る {#channels}

実際のCNNはkernelを1個だけ持ちません。複数filterが同じ入力を見ることで、**同じH×W位置に異なる種類の特徴**を並べます。

<div class="model-architecture" aria-label="複数filterからfeature channel stackができる図">
  <div class="model-architecture__header"><div><div class="model-architecture__title">1つの画像位置に、複数種類の特徴量を持たせる</div><p class="model-architecture__subtitle">filter A/B/Cが別のpatternへ反応し、outputはH×W×Cのtensorになります。</p></div><span class="model-architecture__badge">channel stack</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>RGB<br>H×W×3</span></div><span class="model-stage__label">Input</span></div><div class="model-stage"><div class="model-op-box"><span>Filter A<br>edge</span></div></div><div class="model-stage"><div class="model-op-box"><span>Filter B<br>texture</span></div></div><div class="model-stage"><div class="model-op-box"><span>Filter C<br>pattern</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Feature maps<br>H'×W'×C</span></div><span class="model-stage__label">次層へ</span></div></div>
  <p class="model-architecture__caption">edge / texture等の名前は直感用です。実際のfilterが学ぶpatternはtrainingから自動的に決まります。</p>
</div>

## CNN全体では何が起きるか {#architecture}

CNNは**局所演算 → feature map → 次の局所演算**を何段も繰り返します。典型的なbackboneではstageが進むほど縦横を小さくし、channelを増やします。

<div class="model-architecture" aria-label="CNN全体のfeature map変化">
  <div class="model-architecture__header"><div><div class="model-architecture__title">空間を圧縮しながら、特徴の種類を増やす</div><p class="model-architecture__subtitle">浅い層の局所patternから、深い層のより広いcontextを使う表現へ変わります。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Image<br>H×W×3</span></div><span class="model-stage__label">Input</span></div><div class="model-stage"><div class="model-tensor is-wide"><span>H/2×W/2<br>× C</span></div><span class="model-stage__label">Stage 1</span></div><div class="model-stage"><div class="model-tensor"><span>H/4×W/4<br>× 2C</span></div><span class="model-stage__label">Stage 2</span></div><div class="model-stage"><div class="model-tensor is-thin"><span>H/16×W/16<br>× 8C</span></div><span class="model-stage__label">Deep feature</span></div><div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Class / Mask / Box</span></div><span class="model-stage__label">Task head</span></div></div>
</div>

Classificationならdeep featureをpoolingしてclass headへ、segmentationなら[U-Net]({{ '/wiki/modeling/unet.html' | relative_url }})のようなdecoderへ、detectionなら[YOLO]({{ '/wiki/modeling/yolo.html' | relative_url }})のようなdetection headへ渡します。

## 使う場面 {#use-cases}

- 画像classificationやspectrogram分類のbaseline。
- segmentation / detectionのencoder・backbone。
- pretrained weightを使って少量データへtransfer learningする。
- 局所patternが重要で、画像resolutionを比較的柔軟に扱いたい。

## CNNとTransformerの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>CNN</h4><dl><dt>最初に見る範囲</dt><dd>局所kernel</dd><dt>共有</dt><dd>同じkernelを全位置で使う</dd><dt>長距離関係</dt><dd>層を重ねて広げる</dd></dl></section><section class="comparison-card"><h4>Vision Transformer</h4><dl><dt>単位</dt><dd>patch token</dd><dt>共有</dt><dd>Attention projection</dd><dt>長距離関係</dt><dd>global attentionなら早い段階から直接参照</dd></dl></section></div>

Kaggleでは優劣を固定せずOOFで比較します。BirdCLEF 2024の1位解法ではEfficientNet/RegNet系CNNが採用され、同チームではViT系が大きく劣ったと報告されています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。

## 注意点 {#pitfalls}

### resolutionと計算量

画像の縦横を2倍にするとpixel数は約4倍です。backbone名だけでなくinput resolution・batch size・augmentationをセットで比較します。

### channel意味を固定して考えない

中間channelは人間が指定した「edge channel」ではありません。可視化は直感であり、実際の表現は学習で決まります。

### backbone固有の設計をCNN一般論と混ぜない

Residual connection、MBConv、large-kernel ConvNeXt blockはCNNそのものの定義ではありません。各モデル記事で分けて理解します。

## Quick Reference

- kernelの積和1回 → feature map 1セル。
- 複数filter → 複数channel。
- stageが深くなるほど空間を縮小しchannelを増やす設計が多い。
- CNNは局所性とweight sharingを強いinductive biasとして持つ。
- ResNet / EfficientNet / ConvNeXtは別記事でモデル固有設計を見る。

## 関連項目

- [ResNet]({{ '/wiki/modeling/resnet.html' | relative_url }})
- [EfficientNet]({{ '/wiki/modeling/efficientnet.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})
- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})

## 参考文献

1. LeCun et al., “Gradient-Based Learning Applied to Document Recognition”, 1998.
2. Dumoulin & Visin, “A guide to convolution arithmetic for deep learning”, 2016. https://arxiv.org/abs/1603.07285
3. Kaggle, “BirdCLEF 2024: 1st place solution”, 2024. https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution
4. PyTorch, “Conv2d”. https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html

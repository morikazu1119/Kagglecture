---
layout: default
title: BERT
summary: Transformer Encoderを使い、左右両方向のcontextからmasked tokenを予測する事前学習を行うencoder-only language model。
type: reference
domain: kaggle
topic: bert
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, transformer, bert, nlp]
---

# BERT

**BERT（Bidirectional Encoder Representations from Transformers）は、Transformer Encoderを何層も重ね、文章の左側と右側の両方を見ながらtoken表現を作るencoder-only language modelです。**

事前学習では一部tokenを隠し、周囲のcontextから元tokenを当てる**Masked Language Modeling（MLM）**を使います。Fine-tuning時は上に小さなtask headを足すだけで分類・token classification・QAなどへ転用できます（[BERT paper](https://arxiv.org/abs/1810.04805)）。

<nav class="article-jump-nav"><a href="#mlm">Masked LM</a><a href="#input">入力表現</a><a href="#architecture">全体構造</a><a href="#finetune">Fine-tuning</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## Masked tokenを左右contextから当てる {#mlm}

例として「患者は昨日[MASK]を受診した」を考えます。BERTは[MASK]の左側だけでなく「を受診した」という右側も同時に使って、隠れたtokenを推定します。

<div class="model-architecture" aria-label="BERT masked language modeling">
  <div class="model-architecture__header"><div><div class="model-architecture__title">一部tokenを隠し、左右の文脈から元tokenを復元する</div><p class="model-architecture__subtitle">decoder-only LMのような「次token予測」ではなく、Encoderでbidirectional contextを作ります。</p></div><span class="model-architecture__badge">MLM</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>患者は</span></div></div><div class="model-stage"><div class="model-tensor"><span>昨日</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>[MASK]</span></div></div><div class="model-stage"><div class="model-tensor"><span>を</span></div></div><div class="model-stage"><div class="model-tensor"><span>受診した</span></div></div><div class="model-stage"><div class="model-op-box"><span>Predict<br>病院?</span></div></div></div>
  <p class="model-architecture__caption">文は理解用の人工例です。実際はsubword tokenizerで分割されます。</p>
</div>

## BERTへ入る3つのembedding {#input}

元BERTでは各位置のinput embeddingは主に3要素の和です。

- **Token embedding**: tokenそのもの。
- **Position embedding**: 何番目のtokenか。
- **Segment embedding**: sentence A / Bなど、どちらのsegmentか。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">token情報 + 順序 + segmentを足してEncoderへ</div><p class="model-architecture__subtitle">[CLS]はsequence全体のclassification representationとして使われることがあります。</p></div><span class="model-architecture__badge">input representation</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>[CLS] text [SEP]</span></div></div><div class="model-stage"><div class="model-op-box"><span>Token Emb.</span></div></div><div class="model-stage"><div class="model-op-box"><span>Position Emb.</span></div></div><div class="model-stage"><div class="model-op-box"><span>Segment Emb.</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Sum<br>N×D</span></div></div></div></div>

## BERT全体 {#architecture}

<div class="model-architecture" aria-label="BERT full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Embedding → Transformer Encoder × L → task head</div><p class="model-architecture__subtitle">BERT-baseは12層、BERT-largeは24層のEncoderを持つ代表構成です。</p></div><span class="model-architecture__badge">encoder-only</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Tokenized<br>text</span></div></div><div class="model-stage"><div class="model-op-box"><span>Embedding<br>sum</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Encoder<br>Block 1</span></div></div><div class="model-stage"><div class="model-tensor"><span>Encoder<br>× L</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Contextual<br>tokens</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>CLS / Token<br>Task Head</span></div></div></div>
</div>

元論文ではMLMに加えてNext Sentence Prediction（NSP）も事前学習objectiveに使いました。後発のRoBERTaはNSPを外すなどtraining recipeを変更しています。

## Fine-tuningでは何を変えるか {#finetune}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Text Classification</h4><dl><dt>使う表現</dt><dd>[CLS]やpooling</dd><dt>Head</dt><dd>Linear classifier</dd></dl></section><section class="comparison-card"><h4>Token Classification</h4><dl><dt>使う表現</dt><dd>各token hidden state</dd><dt>Head</dt><dd>tokenごとのclass</dd></dl></section><section class="comparison-card"><h4>Span QA</h4><dl><dt>使う表現</dt><dd>各token</dd><dt>Head</dt><dd>start/end位置</dd></dl></section></div>

Kaggleでは長文に対するpooling、max_length、layer freezing、differential learning rateなどがmodel名と同じくらい効く場合があります。

## Kaggleでの実例 {#kaggle-examples}

SPR 2026 Mammography Report Classificationの1位解法では`neuralmind/bert-base-portuguese-cased`を7-class classificationへfine-tuneし、Stratified 5-fold + Focal Loss + fold ensembleを使用しています（[1st place solution](https://www.kaggle.com/competitions/spr-2026-mammography-report-classification/writeups/1st-place-solution)）。

Feedback Prize - English Language Learning 2022の1位解法ではDeBERTaやRoBERTaに加えて**DistilBERT**もensemble候補として使われています（[1st place solution](https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution)）。

## 注意点 {#pitfalls}

### max_lengthで文章を切り捨てる

BERT系の代表checkpointは512 token制約が多く、長文では末尾情報を失います。truncation位置・chunking・poolingをValidationします。

### [CLS]だけが常に最適ではない

回帰やessay評価ではmean pooling、weighted layer pooling、LSTM pooling等が上回ることがあります。

### BERTとRoBERTa/DeBERTaを同一視しない

同じEncoder-only familyでもpretraining recipe、position表現、attention構造が異なります。個別記事で差を確認します。

## Quick Reference

- Encoder-only Transformer。
- MLMで左右contextを同時に学ぶ。
- [CLS] / token hidden stateをtask headへ渡す。
- 元BERTはMLM + NSP。
- Kaggleではmax_length/pooling/fold設計も重要。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [RoBERTa]({{ '/wiki/modeling/roberta.html' | relative_url }})
- [DeBERTa]({{ '/wiki/modeling/deberta.html' | relative_url }})

## 参考文献

1. Devlin et al., “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding”, 2018. https://arxiv.org/abs/1810.04805
2. Vaswani et al., “Attention Is All You Need”, 2017. https://arxiv.org/abs/1706.03762
3. Kaggle, “SPR 2026 Mammography Report Classification: 1st place solution”, 2026. https://www.kaggle.com/competitions/spr-2026-mammography-report-classification/writeups/1st-place-solution
4. Kaggle, “Feedback Prize ELL: 1st Place Solution”, 2022. https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution
5. Hugging Face Transformers, BERT documentation. https://huggingface.co/docs/transformers/model_doc/bert

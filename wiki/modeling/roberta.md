---
layout: default
title: RoBERTa
summary: BERTのEncoder構造をほぼ保ちながら、pretraining data・batch・masking・objectiveを見直して強化したlanguage model。
type: reference
domain: kaggle
topic: roberta
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, transformer, roberta, nlp]
---

# RoBERTa

**RoBERTaは、BERTのTransformer Encoder構造を大きく変えるのではなく、「どう事前学習するか」を徹底的に見直して強くしたモデルです。**

中心的な変更は、**より多いdataで長く学習、大きいbatch、Next Sentence Predictionを削除、dynamic masking**などです。つまりRoBERTaは「新しいattention block」というより、BERTのtraining recipeが性能へどれほど効くかを示した代表例です（[RoBERTa paper](https://arxiv.org/abs/1907.11692)）。

<nav class="article-jump-nav"><a href="#difference">BERTとの差</a><a href="#masking">Dynamic Masking</a><a href="#architecture">全体構造</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## BERTから何を変えたか {#difference}

<div class="comparison-board"><section class="comparison-card"><h4>BERT original</h4><dl><dt>Pretraining</dt><dd>MLM + NSP</dd><dt>Mask</dt><dd>事前生成したmaskを使う構成</dd><dt>Data / batch</dt><dd>original recipe</dd></dl></section><section class="comparison-card is-primary"><h4>RoBERTa</h4><dl><dt>Pretraining</dt><dd>MLM中心、NSPなし</dd><dt>Mask</dt><dd>dynamic masking</dd><dt>Data / batch</dt><dd>より多いdata・large batch・longer training</dd></dl></section></div>

重要なのは、**architectureを変えなくてもtraining designだけで大幅に強くなり得る**という点です。

## Dynamic Masking {#masking}

BERT系は隠したtokenを当てるMLMで学習します。RoBERTaでは同じ文をepochごとに見たとき、隠す場所を変えられるようにします。

<div class="model-architecture" aria-label="RoBERTa dynamic masking">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じ文章でも、見るたびに別tokenを[MASK]できる</div><p class="model-architecture__subtitle">固定maskより多様なcontext recovery問題を学習できます。</p></div><span class="model-architecture__badge">dynamic masking</span></div>
  <div class="comparison-board"><section class="comparison-card"><h4>Pass A</h4><dl><dt>Input</dt><dd>患者は [MASK] 病院を受診</dd><dt>Target</dt><dd>昨日</dd></dl></section><section class="comparison-card is-primary"><h4>Pass B</h4><dl><dt>Input</dt><dd>患者は 昨日 [MASK] を受診</dd><dt>Target</dt><dd>病院</dd></dl></section></div>
  <p class="model-architecture__caption">文章は理解用の人工例です。</p>
</div>

## RoBERTa全体 {#architecture}

Fine-tuning時の見た目はBERTと非常に近いです。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">Tokenizer → Embedding → Transformer Encoder stack → Task Head</div><p class="model-architecture__subtitle">違いの中心はpretraining recipeであり、downstream architectureはBERT型Encoderとして扱えます。</p></div><span class="model-architecture__badge">encoder-only</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Text</span></div></div><div class="model-stage"><div class="model-op-box"><span>RoBERTa<br>Tokenizer</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Encoder<br>× L</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Contextual<br>tokens</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pooling<br>+ Head</span></div></div></div></div>

RoBERTaはBERTとtokenizer vocabularyやspecial tokenの扱いも異なるため、checkpointに対応したtokenizerを必ず使います。

## 使う場面 {#use-cases}

- English text classification / regression。
- BERT baselineより強いencoder checkpointを試す。
- essay / sentiment / toxicity等でDeBERTaとのdiversityを出す。
- sentence embedding modelのbackboneとして利用。

## Kaggleでの実例 {#kaggle-examples}

Feedback Prize - English Language Learning 2022の1位解法では**RoBERTa-large**をDeBERTa系列やDistilBERTとensembleし、Mean/Concat/WeightedLayer/GEM/LSTM等の複数poolingを比較しています（[1st place solution](https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution)）。

Tweet Sentiment Extractionの18位解法では**RoBERTa-baseのみの5-fold ensemble**を構築し、Multi-Sample Dropoutやinput shift等を組み合わせています（[18th place solution](https://www.kaggle.com/competitions/tweet-sentiment-extraction/writeups/max-18th-place-solution)）。

## 注意点 {#pitfalls}

### RoBERTaは「BERT + 大きいだけ」ではない

NSP削除、masking、data量、batch等のtraining recipeがセットです。checkpoint sizeだけで説明しないようにします。

### DeBERTaとの差

RoBERTaは主にpretraining recipe改善、DeBERTaはattention自体にcontent/position分離というarchitecture変更があります。

### domain mismatch

一般英語pretrainingが医療・法律・科学文書に最適とは限りません。domain-specific checkpointやcontinued pretrainingも比較します。

## Quick Reference

- architectureはBERT型Encoderに近い。
- NSPを削除。
- dynamic masking。
- more data / larger batch / longer training。
- KaggleではDeBERTaとのensemble diversityにも使いやすい。

## 関連項目

- [BERT]({{ '/wiki/modeling/bert.html' | relative_url }})
- [DeBERTa]({{ '/wiki/modeling/deberta.html' | relative_url }})
- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})

## 参考文献

1. Liu et al., “RoBERTa: A Robustly Optimized BERT Pretraining Approach”, 2019. https://arxiv.org/abs/1907.11692
2. Devlin et al., “BERT”, 2018. https://arxiv.org/abs/1810.04805
3. Kaggle, “Feedback Prize ELL: 1st Place Solution”, 2022. https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution
4. Kaggle, “Tweet Sentiment Extraction: 18th Place Solution”. https://www.kaggle.com/competitions/tweet-sentiment-extraction/writeups/max-18th-place-solution

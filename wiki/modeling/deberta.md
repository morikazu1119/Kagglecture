---
layout: default
title: DeBERTa
summary: token contentとrelative positionを別表現として扱うDisentangled AttentionでBERT/RoBERTaを強化したencoder-only Transformer。
type: reference
domain: kaggle
topic: deberta
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, transformer, deberta, nlp]
---

# DeBERTa

**DeBERTaは、tokenの「内容」と「位置」を別々のvectorとして持ち、Attention scoreを計算するときに両方の関係を分けて扱うencoder-only Transformerです。**

BERT/RoBERTaではtoken embeddingへposition情報を足し込んでからAttentionへ入れるのが基本ですが、DeBERTaは**Disentangled Attention**でcontent-to-content、content-to-position、position-to-contentの関係を明示的に扱います（[DeBERTa paper](https://arxiv.org/abs/2006.03654)）。

<nav class="article-jump-nav"><a href="#disentangled">Disentangled Attention</a><a href="#architecture">全体構造</a><a href="#versions">V2/V3</a><a href="#use-cases">使う場面</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 内容と位置を分けて考える {#disentangled}

「犬が猫を追う」と「猫が犬を追う」は同じ単語を含みますが、tokenの位置関係が変わると意味が変わります。DeBERTaはtoken contentだけでなく**相対的に何token離れているか**を別表現としてAttentionへ入れます。

<div class="model-architecture" aria-label="DeBERTa disentangled attention">
  <div class="model-architecture__header"><div><div class="model-architecture__title">token内容とrelative positionを別streamでscoreへ入れる</div><p class="model-architecture__subtitle">Query tokenとKey tokenの「意味の相性」だけでなく「位置関係」も独立に扱います。</p></div><span class="model-architecture__badge">disentangled attention</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Token i<br>content</span></div></div><div class="model-stage"><div class="model-op-box"><span>Content<br>projection</span></div></div><div class="model-stage"><div class="model-tensor"><span>Relative<br>position i-j</span></div></div><div class="model-stage"><div class="model-op-box"><span>Position<br>projection</span></div></div><div class="model-stage"><div class="model-op-box"><span>Disentangled<br>Attention score</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Contextual<br>token</span></div></div></div>
</div>

厳密には複数のcontent/position interaction termを組み合わせてscoreを作ります。初心者としては、**positionをtoken embeddingへ埋め込んで消してしまわず、Attention計算まで独立した情報として残す**と理解すると十分です。

## DeBERTa全体 {#architecture}

全体はBERT/RoBERTaと同じencoder-only familyです。違いの中心は各Encoder Block内のAttentionです。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">Input tokens → DeBERTa Encoder × L → Pooling / Task Head</div><p class="model-architecture__subtitle">各block内部でDisentangled Attentionを使い、token contentとpositionを更新します。</p></div><span class="model-architecture__badge">encoder-only</span></div><div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Tokens</span></div></div><div class="model-stage"><div class="model-op-box"><span>Content / Pos<br>Embeddings</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Disentangled<br>Attention</span></div></div><div class="model-stage"><div class="model-op-box"><span>FFN<br>+ Residual</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Encoder<br>× L</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Task Head</span></div></div></div></div>

元DeBERTaはpretraining時のmasked token predictionへabsolute positionを取り込むEnhanced Mask Decoderも提案しています。

## DeBERTa V2 / V3 {#versions}

Kaggleでよく見る`deberta-v3-base` / `deberta-v3-large`は元DeBERTaそのものではありません。

<div class="comparison-board"><section class="comparison-card"><h4>DeBERTa</h4><dl><dt>核</dt><dd>Disentangled Attention</dd><dt>Pretraining</dt><dd>MLM系</dd></dl></section><section class="comparison-card"><h4>DeBERTa V2</h4><dl><dt>変更</dt><dd>position / vocabulary / convolution等を改善</dd><dt>目的</dt><dd>より強いrepresentation</dd></dl></section><section class="comparison-card is-primary"><h4>DeBERTa V3</h4><dl><dt>変更</dt><dd>ELECTRA風のreplaced token detectionを導入</dd><dt>Kaggle</dt><dd>base / largeが非常に頻出</dd></dl></section></div>

V3の詳細pretrainingは元論文と別なので、checkpoint比較ではversionを必ず記録します。

## 使う場面 {#use-cases}

- essay scoring / text regression。
- toxicity・misinformation等のclassification。
- question-answer ranking / multiple choice。
- RoBERTa/BERTより強いencoder baselineが欲しい。

## Kaggleでの実例 {#kaggle-examples}

Feedback Prize - English Language Learning 2022の1位解法では**DeBERTa-v3-base / v3-large / v2-xlarge**をRoBERTaやDistilBERTと組み合わせ、複数poolingとfine-tuning trickを比較しています（[1st place solution](https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution)）。

Kaggle LLM Science Examの1位解法では、単純classificationでDeBERTaを試した後、retrieval contextを加えたmultiple-choice modelingへ進んでいます（[1st place solution](https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution)）。

同Competitionの41位solutionでも`deberta-v3-large`をseed/data違いで7本ensembleし、Private 0.909を報告しています（[solution](https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/mipypf-41st-place-solution-for-the-kaggle-llm-scie)）。

## 注意点 {#pitfalls}

### 「DeBERTaが常にBERTより強い」ではない

SPR 2026 Mammography Report Classificationの1位解法ではPortuguese BERTが最終採用され、DeBERTaはうまくいかなかったと報告されています。domain/language-specific pretrainingがarchitecture差を上回ることがあります。

### long sequence cost

標準Attention系なのでsequence長を増やすとmemory costが増えます。max_length、gradient checkpointing、poolingを含めて比較します。

### version混同

`deberta-v3`を元DeBERTa論文だけで説明すると不正確です。V2/V3のpretraining差を確認します。

## Quick Reference

- contentとpositionを分離してAttention。
- relative positionを強く扱うencoder-only Transformer。
- KaggleではDeBERTa V3が特に頻出。
- RoBERTaとの差はtraining recipeだけでなくAttention architectureにもある。
- language/domain-specific checkpointとの比較は必須。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [BERT]({{ '/wiki/modeling/bert.html' | relative_url }})
- [RoBERTa]({{ '/wiki/modeling/roberta.html' | relative_url }})

## 参考文献

1. He et al., “DeBERTa: Decoding-enhanced BERT with Disentangled Attention”, 2020. https://arxiv.org/abs/2006.03654
2. He et al., “DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing”, 2021. https://arxiv.org/abs/2111.09543
3. Kaggle, “Feedback Prize ELL: 1st Place Solution”, 2022. https://www.kaggle.com/competitions/feedback-prize-english-language-learning/writeups/autox-rohit-yevhenii-1st-place-solution
4. Kaggle, “LLM Science Exam: 1st Place Solution”, 2023. https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution
5. Kaggle, “LLM Science Exam: 41st Place Solution”, 2023. https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/mipypf-41st-place-solution-for-the-kaggle-llm-scie

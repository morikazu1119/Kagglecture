---
layout: default
title: Decoder-only Transformer / LLM
summary: 過去tokenだけを参照するCausal Self-Attentionをstackし、次token予測を繰り返して文章を生成するTransformer family。
type: reference
domain: kaggle
topic: decoder-only-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 6
tags: [kaggle, modeling, transformer, llm, decoder-only]
---

# Decoder-only Transformer / LLM

**Decoder-only Transformerは、現在位置より未来のtokenを見ないCausal Self-Attentionを使い、次に来るtokenを予測し続けるTransformerです。**

GPT、Llama、Mistral、Gemma、Qwenなど多くのLarge Language Model（LLM）がこのfamilyに属します。このページではfamily共通の原理だけを扱い、各LLM固有のattention・MoE・tokenizer設計は個別記事化が必要になった時点で分離します。

<nav class="article-jump-nav"><a href="#causal">Causal Attention</a><a href="#generation">次token予測</a><a href="#architecture">全体構造</a><a href="#classification">分類で使う</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 未来tokenを見ない {#causal}

sequenceが`私は Kaggle が 好き`なら、`Kaggle`位置のhidden stateは`私は`までを参照できますが、右側の`が 好き`は見られません。Attention matrixの未来側をmaskします。

<div class="model-architecture" aria-label="causal self attention mask">
  <div class="model-architecture__header"><div><div class="model-architecture__title">各tokenは自分より左側だけを見る</div><p class="model-architecture__subtitle">生成時にまだ存在しない未来tokenをtraining中だけ覗くLeakageを防ぎます。</p></div><span class="model-architecture__badge">causal mask</span></div>
  <div class="html-matrix" style="--matrix-cols:4"><div class="matrix-cell is-good">T1→T1</div><div class="matrix-cell">mask</div><div class="matrix-cell">mask</div><div class="matrix-cell">mask</div><div class="matrix-cell is-good">T2→T1</div><div class="matrix-cell is-good">T2→T2</div><div class="matrix-cell">mask</div><div class="matrix-cell">mask</div><div class="matrix-cell is-good">T3→T1</div><div class="matrix-cell is-good">T3→T2</div><div class="matrix-cell is-good">T3→T3</div><div class="matrix-cell">mask</div></div>
  <p class="model-architecture__caption">模式図。下三角側だけAttention可能です。</p>
</div>

BERTのようなencoder-only modelは左右contextを同時に見ます。decoder-only modelは**生成可能性を保つため左contextだけ**を使うのが基本です。

## 次tokenを1つずつ予測する {#generation}

<div class="model-architecture" aria-label="autoregressive generation">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Prompt → next-token distribution → 1 token追加 → もう一度predict</div><p class="model-architecture__subtitle">生成はautoregressiveに繰り返します。</p></div><span class="model-architecture__badge">autoregressive</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Prompt<br>"Kaggleは"</span></div></div><div class="model-stage"><div class="model-op-box"><span>Decoder<br>Blocks</span></div></div><div class="model-stage"><div class="model-op-box"><span>Vocabulary<br>Logits</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Next token<br>"データ"</span></div></div><div class="model-stage"><div class="model-op-box"><span>Append</span></div></div><div class="model-stage"><div class="model-tensor"><span>Repeat</span></div></div></div>
</div>

trainingではsequence中の各位置で「次token」を同時に教師信号として使えます。inferenceでは実際に1 tokenずつ生成します。

## 全体構造 {#architecture}

<div class="model-architecture" aria-label="decoder-only transformer architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Token Embedding → Causal Transformer Block × L → LM Head</div><p class="model-architecture__subtitle">各blockはCausal Self-AttentionとFFN/MLPをResidual connectionでstackします。</p></div><span class="model-architecture__badge">decoder-only</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Tokens</span></div></div><div class="model-stage"><div class="model-op-box"><span>Embedding +<br>Position</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Causal Attention<br>+ MLP</span></div></div><div class="model-stage"><div class="model-tensor"><span>Blocks<br>× L</span></div></div><div class="model-stage"><div class="model-op-box"><span>LM Head</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>P(next token)</span></div></div></div>
</div>

Llama、Gemma、Qwen、Mistral等はこの共通骨格を持ちつつ、RoPE、Grouped-Query Attention、Sliding Window、MoE等の細部がmodel/versionごとに異なります。

## 生成せず分類にも使える {#classification}

LLMをKaggleで使う場合、自由文生成だけとは限りません。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Generative classification</h4><dl><dt>方法</dt><dd>"A/B/Cのどれ？"とpromptしてtokenを生成</dd><dt>利点</dt><dd>zero/few-shotしやすい</dd></dl></section><section class="comparison-card"><h4>Logit classification</h4><dl><dt>方法</dt><dd>候補tokenのlogitを直接比較</dd><dt>利点</dt><dd>生成揺れを減らせる</dd></dl></section><section class="comparison-card"><h4>Sequence classification fine-tune</h4><dl><dt>方法</dt><dd>hidden stateへclassification head</dd><dt>利点</dt><dd>supervised taskへ直接最適化</dd></dl></section></div>

(Q)LoRAでbase weightを大きく更新せずfine-tuneする手法もKaggleで頻出しますが、これはTraining側で別記事化するのが適切です。

## Kaggleでの実例 {#kaggle-examples}

MAP - Charting Student Math Misunderstandings 2025の1位解法は**Qwen3-8B〜32B**やGLM-Z1をsuffix classificationとしてfine-tuneし、最終的にQwen3-32BとGLM-Z1-32Bを3-seedずつensembleしています（[1st place solution](https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/writeups/1st-place-solution)）。

Make Data Count 2025の1位解法では**Qwen2.5-Coder 32B**を0-shotでdataset mentionのPrimary/Secondary分類へ使い、出力をA/Bへ制約しています（[1st place solution](https://www.kaggle.com/competitions/make-data-count-finding-data-references/writeups/1st-place-solution)）。

LLM Detect AI Generated Text 2024の1位解法では**Mistral-7BをQLoRA fine-tuning**し、DeBERTaやLlama-based signal等とensembleしています（[1st place solution](https://www.kaggle.com/competitions/llm-detect-ai-generated-text/writeups/comprehensive-1st-place-write-up)）。

## 注意点 {#pitfalls]

### 自由生成はMetricへ直結しない場合がある

classificationなら生成文をparseするより候補logit比較の方が安定することがあります。Competition出力形式に合わせます。

### context lengthとmemory

KV cache、sequence length、model sizeでVRAM消費が大きくなります。4bit quantization、LoRA、flash attention等を計算budget込みで設計します。

### model固有差をfamily一般論へ混ぜない

Qwen/Gemma/Llama/Mistralはすべてdecoder-onlyでも同じmodelではありません。固有architecture差・license・context length・tokenizerは使用versionの公式情報を確認します。

### LLMが強い理由をarchitectureだけに帰属しない

Kaggleではdata construction、prompt、retrieval、label noise処理がmodel size以上に効くことがあります。LLM Detect AI Text 1位もdata mixの影響を大きく評価しています。

## Quick Reference

- future tokenをmaskするCausal Self-Attention。
- next-token predictionをautoregressiveに繰り返す。
- GPT/Llama/Mistral/Gemma/Qwen等の共通family。
- generationだけでなくclassification/logit scoringにも使える。
- 個別LLM固有の設計はversionごとに確認する。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [BERT]({{ '/wiki/modeling/bert.html' | relative_url }})
- [T5]({{ '/wiki/modeling/t5.html' | relative_url }})
- [Mamba]({{ '/wiki/modeling/mamba.html' | relative_url }})

## 参考文献

1. Vaswani et al., “Attention Is All You Need”, 2017. https://arxiv.org/abs/1706.03762
2. Brown et al., “Language Models are Few-Shot Learners”, 2020. https://arxiv.org/abs/2005.14165
3. Kaggle, “MAP - Charting Student Math Misunderstandings: 1st Place Solution”, 2025. https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/writeups/1st-place-solution
4. Kaggle, “Make Data Count: 1st Place Solution”, 2025. https://www.kaggle.com/competitions/make-data-count-finding-data-references/writeups/1st-place-solution
5. Kaggle, “LLM Detect AI Generated Text: 1st Place Write-Up”, 2024. https://www.kaggle.com/competitions/llm-detect-ai-generated-text/writeups/comprehensive-1st-place-write-up
6. Hugging Face Transformers causal language modeling documentation. https://huggingface.co/docs/transformers/tasks/language_modeling

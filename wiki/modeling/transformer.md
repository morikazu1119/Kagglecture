---
layout: default
title: Transformer
summary: Self-Attentionでtoken同士の関係を計算し、FFNとResidual connectionを重ねてsequence表現を更新するarchitecture。
type: reference
domain: kaggle
topic: transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, transformer, nlp, sequence]
---

# Transformer

**Transformerは、sequence中の各tokenが他tokenをどれだけ参照するかをSelf-Attentionで計算し、その情報を何層も更新するモデルです。**

RNNのように1 tokenずつ順番にhidden stateへ詰めるのではなく、training時にはtoken列をまとめて処理しやすい構造です。BERT、DeBERTa、Vision Transformer、LLMなど多くのモデルがTransformer blockを土台にしています（[Attention Is All You Need](https://arxiv.org/abs/1706.03762)）。

<nav class="article-jump-nav"><a href="#attention">Self-Attention</a><a href="#block">Transformer Block</a><a href="#architecture">Encoder / Decoder</a><a href="#mha">Multi-Head</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 tokenが他tokenから情報を集める {#attention}

「犬 が 公園 を 走る」というtoken列で「走る」を更新したいとします。Transformerは「走る」が他tokenをどれだけ見るべきかをscore化し、重要なtokenの情報を重み付きで集めます。

各tokenから3種類のvectorを作ります。

- **Query (Q)**: 自分が何を探しているか。
- **Key (K)**: 自分がどんな情報を持っているかを照合する鍵。
- **Value (V)**: 実際に相手へ渡す情報。

<div class="model-architecture" aria-label="Self-Attention operation">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Query tokenが全Keyと相性を比べ、Valueを重み付きで集める</div><p class="model-architecture__subtitle">「走る」のQueryが「犬」に高いweightを付ければ、犬のValueが更新後tokenへ強く入ります。</p></div><span class="model-architecture__badge">self-attention</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Token<br>走る</span></div></div><div class="model-stage"><div class="model-op-box"><span>Query<br>Q</span></div></div><div class="model-stage"><div class="model-op-box"><span>Q·K<br>scores</span></div></div><div class="model-stage"><div class="model-op-box"><span>Softmax<br>weights</span></div></div><div class="model-stage"><div class="model-op-box"><span>Weighted<br>ΣV</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Context-aware<br>token</span></div></div></div>
</div>

scaled dot-product attentionは次です。

$$
Attention(Q,K,V)=softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

式の本質は**QとKで参照weightを決め、そのweightでVを混ぜる**ことです。

## Transformer Block {#block}

Self-Attentionだけでは終わりません。token間で情報を交換した後、各tokenを個別のFeed-Forward Network（FFN / MLP）へ通します。各sub-layerの周囲にはResidual connectionとNormalizationがあります。

<div class="model-architecture" aria-label="Transformer encoder block">
  <div class="model-architecture__header"><div><div class="model-architecture__title">token間mixingとtoken内channel変換を交互に行う</div><p class="model-architecture__subtitle">Attentionが「他tokenから何をもらうか」、FFNが「受け取った表現をどう変換するか」を担当します。</p></div><span class="model-architecture__badge">encoder block</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Tokens<br>N×D</span></div></div><div class="model-stage"><div class="model-op-box"><span>Multi-Head<br>Attention</span></div></div><div class="model-stage"><div class="model-tensor"><span>+ Residual<br>+ Norm</span></div></div><div class="model-stage"><div class="model-op-box"><span>FFN / MLP<br>D→4D→D</span></div></div><div class="model-stage"><div class="model-tensor"><span>+ Residual<br>+ Norm</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Updated<br>Tokens</span></div></div></div>
</div>

## Encoder / Decoder / Encoder-Decoder {#architecture}

Transformerは用途によってattention maskとblock構成が変わります。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Encoder-only</h4><dl><dt>代表</dt><dd>BERT / RoBERTa / DeBERTa</dd><dt>参照</dt><dd>左右contextを見られる</dd><dt>向くtask</dt><dd>分類・token classification・embedding</dd></dl></section><section class="comparison-card"><h4>Decoder-only</h4><dl><dt>代表</dt><dd>GPT / Llama / Gemma</dd><dt>参照</dt><dd>基本は過去tokenのみ</dd><dt>向くtask</dt><dd>生成</dd></dl></section><section class="comparison-card"><h4>Encoder-Decoder</h4><dl><dt>代表</dt><dd>Original Transformer / T5</dd><dt>参照</dt><dd>Encoder文脈 + Decoder生成</dd><dt>向くtask</dt><dd>翻訳・要約・seq2seq</dd></dl></section></div>

## Multi-Head Attention {#mha}

1組のQ/K/Vだけでなく複数headを並列に持ちます。headごとに別projectionを使うため、異なる関係を同時に表現できます。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">同じtoken列を複数headが別の見方で読む</div><p class="model-architecture__subtitle">各headの結果をconcatしてprojectionし、1つのtoken表現へ戻します。</p></div><span class="model-architecture__badge">multi-head</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Tokens</span></div></div><div class="model-stage"><div class="model-op-box"><span>Head 1</span></div></div><div class="model-stage"><div class="model-op-box"><span>Head 2 … H</span></div></div><div class="model-stage"><div class="model-op-box"><span>Concat + Linear</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Multi-head<br>output</span></div></div></div></div>

## Kaggleでの実例 {#kaggle-examples}

BELKA 2024の5位解法はsequenceとして扱った化学表現に対して**CNN1D、Transformer、Mamba**の3architectureをensembleしています（[5th solution](https://www.kaggle.com/competitions/leash-BELKA/discussion/521894)）。同じsequenceでもinductive biasの異なるモデルを比較する好例です。

Kaggle LLM Science Exam 2023の1位解法ではDeBERTaやLLMをclassification/re-rankingへ使い、retrievalとの組合せを重視しています（[1st place solution](https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution)）。

## 注意点 {#pitfalls}

### Attentionは「説明可能な重要度」と同義ではない

attention weightが高いtokenをそのまま因果的な説明とみなすのは危険です。モデル内部の情報routingの一部として扱います。

### sequence lengthでmemoryが増える

標準Self-Attentionはtoken数Nに対してattention matrixがN×Nになります。長文・長sequenceではmemoryがボトルネックになります。

### Transformerという名前だけではモデルが決まらない

Encoder-only、decoder-only、position encoding、attention variant、pretraining objectiveが違えば挙動も用途も変わります。個別モデル記事へ分けて確認します。

## Quick Reference

- Q/Kで参照weight、Vで渡す情報。
- Attention → Residual/Norm → FFN → Residual/Normをstack。
- Encoder-onlyは理解系、decoder-onlyは生成系が代表。
- Multi-Headは複数のattention viewを並列に持つ。
- 長sequenceではN×N attention costに注意。

## 関連項目

- [BERT]({{ '/wiki/modeling/bert.html' | relative_url }})
- [DeBERTa]({{ '/wiki/modeling/deberta.html' | relative_url }})
- [Vision Transformer]({{ '/wiki/modeling/vision-transformer.html' | relative_url }})
- [Mamba]({{ '/wiki/modeling/mamba.html' | relative_url }})

## 参考文献

1. Vaswani et al., “Attention Is All You Need”, 2017. https://arxiv.org/abs/1706.03762
2. Devlin et al., “BERT”, 2018. https://arxiv.org/abs/1810.04805
3. Kaggle, “BELKA: 5th solution — Ensemble of CNN1d, Transformer, Mamba”, 2024. https://www.kaggle.com/competitions/leash-BELKA/discussion/521894
4. Kaggle, “LLM Science Exam: 1st Place Solution”, 2023. https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution

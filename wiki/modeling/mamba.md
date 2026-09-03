---
layout: default
title: Mamba
summary: 入力内容に応じて状態を選択的に保持・忘却するSelective State Space Modelで、長sequenceを線形時間に近い形で処理するarchitecture。
type: reference
domain: kaggle
topic: mamba
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, mamba, state-space-model, sequence]
---

# Mamba

**Mambaは、sequenceをtokenごとに内部stateへ取り込みながら、「この入力は覚える・この入力は流す」を入力依存で選択するSelective State Space Model（Selective SSM）です。**

TransformerのSelf-Attentionのように全token対をN×Nで比較せず、sequence長に対して線形にスケールする処理を目指します。特に長sequenceで計算・memoryを抑えやすい点が特徴です（[Mamba paper](https://arxiv.org/abs/2312.00752)）。

<nav class="article-jump-nav"><a href="#state">State Spaceの直感</a><a href="#selection">Selective SSM</a><a href="#architecture">全体構造</a><a href="#comparison">Transformerとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## State Space Modelの直感 {#state}

GRUと同じく「これまでの情報をstateとして持ちながらsequenceを進む」と考えると入りやすいです。ただしMambaは古典RNN cellそのものではなく、**連続系のState Space Modelをsequence modeling用に離散化・高速化した系統**です。

<div class="model-architecture" aria-label="State Space Model sequence update">
  <div class="model-architecture__header"><div><div class="model-architecture__title">各tokenを受け取り、内部stateを更新しながらoutputを出す</div><p class="model-architecture__subtitle">過去token全部を保存してattentionする代わりに、過去の情報をstateへ圧縮して前へ渡します。</p></div><span class="model-architecture__badge">state space</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>x₁</span></div></div><div class="model-stage"><div class="model-op-box"><span>State<br>s₁</span></div></div><div class="model-stage"><div class="model-tensor"><span>x₂</span></div></div><div class="model-stage"><div class="model-op-box"><span>State<br>s₂</span></div></div><div class="model-stage"><div class="model-tensor"><span>… xₜ</span></div></div><div class="model-stage"><div class="model-op-box"><span>State<br>sₜ</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Outputs<br>y₁…yₜ</span></div></div></div>
</div>

単純SSMの弱点は、入力内容に関係なく同じstate update ruleを適用すると「重要tokenだけ残す」ようなcontent-basedな処理が苦手なことです。

## Selective SSM — 入力に応じて残す情報を変える {#selection}

Mambaの中心は**SSM parameterの一部を現在inputの関数にする**ことです。これにより「句読点は軽く流す」「重要な識別tokenは強くstateへ残す」のように入力依存の選択ができます。

<div class="model-architecture" aria-label="Mamba selective state update">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じstate updateではなく、現在tokenから「通す/忘れる」を調整する</div><p class="model-architecture__subtitle">selectivityが、離れた重要情報を残し不要情報を捨てるcontent-awareなroutingを作ります。</p></div><span class="model-architecture__badge">selective SSM</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Input<br>xₜ</span></div></div><div class="model-stage"><div class="model-op-box"><span>Input-dependent<br>parameters</span></div></div><div class="model-stage"><div class="model-tensor"><span>Previous<br>state sₜ₋₁</span></div></div><div class="model-stage"><div class="model-op-box"><span>Selective<br>state update</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>New state<br>sₜ</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Output<br>yₜ</span></div></div></div>
</div>

ここが「ただのRNN」や古典的SSMと区別する最重要ポイントです。

## Mamba blockと全体構造 {#architecture}

Mambaはselective SSMだけを単体で置くのではなく、input projection、local convolution、gating、projection等を含むblockとしてstackします。

<div class="model-architecture" aria-label="Mamba full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Embedding → Mamba Block × L → sequence representation → task head</div><p class="model-architecture__subtitle">block内部ではlocal ConvとSelective SSMを組み合わせ、gatingされたoutputをresidual pathへ戻します。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Sequence</span></div></div><div class="model-stage"><div class="model-op-box"><span>Embedding /<br>Projection</span></div></div><div class="model-stage"><div class="model-op-box"><span>Local Conv</span></div></div><div class="model-stage"><div class="model-op-box"><span>Selective<br>SSM</span></div></div><div class="model-stage"><div class="model-op-box"><span>Gate +<br>Projection</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Mamba Blocks<br>× L</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pool / Head</span></div></div></div>
</div>

Mamba-2ではState Space Duality（SSD）の観点からblock/algorithmを再構成し、元Mambaより高速なcore layerを提案しています（[Mamba-2](https://arxiv.org/abs/2405.21060)）。

## Transformer / GRUとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card"><h4>GRU</h4><dl><dt>記憶</dt><dd>fixed-size hidden state</dd><dt>選択</dt><dd>gates</dd><dt>計算</dt><dd>逐次recurrent</dd></dl></section><section class="comparison-card"><h4>Transformer</h4><dl><dt>記憶</dt><dd>token representations</dd><dt>選択</dt><dd>Attentionでtoken対を直接比較</dd><dt>計算</dt><dd>標準attentionはN²要素</dd></dl></section><section class="comparison-card is-primary"><h4>Mamba</h4><dl><dt>記憶</dt><dd>SSM state</dd><dt>選択</dt><dd>input-dependent selective update</dd><dt>計算</dt><dd>sequence lengthへlinear scalingを狙う</dd></dl></section></div>

MambaがTransformerの完全上位互換という意味ではありません。小〜中sequence、pretraining資産、library成熟度、task特性でTransformerが強い場合も多いです。

## Kaggleでの実例 {#kaggle-examples}

BELKA 2024の5位解法では分子表現をcharacter sequenceとしてtokenizeし、**CNN1D / Transformer / Mamba (SSM)** の3architectureを最終ensembleに採用しています。Mambaはbatch 2000で学習され、異なるsequence inductive biasを提供しました（[5th solution](https://www.kaggle.com/competitions/leash-BELKA/discussion/521894)）。

LLM - Detect AI Generated Text 2024ではMambaをDeBERTa等と比較する参加解法があり、SSMがKaggle NLPでも実験対象になっています。ただし公開data・distribution shiftが強いcompetitionではarchitecture差よりdata constructionが支配的になるため、単独scoreだけで一般化しません。

## 使う場面

- token数が長いsequence。
- genomics / chemical string / sensor等、長い1D入力。
- Transformerとは異なるensemble diversityを狙う。
- Attention memoryがbudgetを圧迫する場合。

## 注意点 {#pitfalls}

### 「linearだから必ず速い」ではない

実runtimeはkernel実装、GPU、sequence length、batch sizeで変わります。短sequenceではTransformer最適化kernelの方が速い場合があります。

### pretrained ecosystem

BERT/DeBERTaほどtask-specific pretrained checkpointやfine-tuning recipeが成熟していない領域があります。from-scratch比較ではdata量差に注意します。

### bidirectional理解task

元Mambaはcausal sequence modelの文脈で設計されています。classificationで左右contextをどう集約するかは実装variantを確認します。

### Mamba / Mamba-2 / vision variantsを混同しない

SSM familyという共通点はありますがcore layerやscan方式が異なります。checkpoint名と論文versionを記録します。

## Quick Reference

- SSM stateへ過去情報を圧縮。
- Selective = inputに応じてstate updateを変える。
- Self-AttentionのN×N token pairを作らない。
- long sequenceで計算/memory上の利点を狙う。
- Mamba-2はSSDからcoreを再設計。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [GRU]({{ '/wiki/modeling/gru.html' | relative_url }})
- [DeBERTa]({{ '/wiki/modeling/deberta.html' | relative_url }})

## 参考文献

1. Gu & Dao, “Mamba: Linear-Time Sequence Modeling with Selective State Spaces”, 2023. https://arxiv.org/abs/2312.00752
2. Dao & Gu, “Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality”, 2024. https://arxiv.org/abs/2405.21060
3. Gu et al., “Efficiently Modeling Long Sequences with Structured State Spaces”, 2021. https://arxiv.org/abs/2111.00396
4. Kaggle, “BELKA: 5th solution — Ensemble of CNN1d, Transformer, Mamba”, 2024. https://www.kaggle.com/competitions/leash-BELKA/discussion/521894
5. Mamba GitHub repository. https://github.com/state-spaces/mamba

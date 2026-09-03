---
layout: default
title: GRU
summary: Update gateとReset gateで過去hidden stateをどれだけ保持・書き換えるか制御しながらsequenceを順番に処理するRNN。
type: reference
domain: kaggle
topic: gru
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags: [kaggle, modeling, gru, rnn, sequence]
---

# GRU

**GRU（Gated Recurrent Unit）は、sequenceを1 stepずつ読み、過去の情報を持つhidden stateを更新し続けるRecurrent Neural Networkです。**

単純RNNと違い、**Update gate**で「過去をどれだけ残すか」、**Reset gate**で「新しい候補状態を作るとき過去をどれだけ無視するか」を制御します。LSTMよりgateが少なく、比較的シンプルです。

<nav class="article-jump-nav"><a href="#step">1 step</a><a href="#gates">2つのgate</a><a href="#architecture">全体構造</a><a href="#comparison">Transformerとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 stepで何が起きるか {#step}

時刻$t$の入力$x_t$と、前時刻までの記憶$h_{t-1}$を受け取り、新しい$h_t$を作ります。次の時刻はこの$h_t$をまた使います。

<div class="model-architecture" aria-label="GRU one step">
  <div class="model-architecture__header"><div><div class="model-architecture__title">現在の入力と過去のhidden stateから、新しい記憶を作る</div><p class="model-architecture__subtitle">sequence全体を一度に比較するAttentionとは違い、stateを時間方向へ渡します。</p></div><span class="model-architecture__badge">recurrent step</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Previous<br>hₜ₋₁</span></div></div><div class="model-stage"><div class="model-tensor"><span>Input<br>xₜ</span></div></div><div class="model-stage"><div class="model-op-box"><span>Reset / Update<br>Gates</span></div></div><div class="model-stage"><div class="model-op-box"><span>Candidate<br>state</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>New<br>hₜ</span></div></div></div>
</div>

## Update gateとReset gate {#gates}

### Update gate

「新しい候補へどれだけ置き換えるか」を0〜1程度のgateで決めます。updateが小さければ古いstateを多く残し、大きければ現在入力を反映したstateへ更新します。

### Reset gate

新しい候補stateを作るとき、前のhidden stateをどれだけ使うかを調整します。resetが小さければ「過去をいったん忘れて現在入力を重視する」挙動を作れます。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Update gate z</h4><dl><dt>質問</dt><dd>古い記憶と新しい候補、どちらを残す？</dd><dt>作用</dt><dd>hₜのmix比率</dd></dl></section><section class="comparison-card"><h4>Reset gate r</h4><dl><dt>質問</dt><dd>候補stateを作るとき過去をどれだけ使う？</dd><dt>作用</dt><dd>candidate計算</dd></dl></section></div>

## Sequence全体 {#architecture}

<div class="model-architecture" aria-label="GRU sequence architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じGRU cellを各時刻で共有し、hidden stateを受け渡す</div><p class="model-architecture__subtitle">最後のstate、全時刻stateのpooling、bidirectional出力などをtask headへ渡します。</p></div><span class="model-architecture__badge">full sequence</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>x₁</span></div></div><div class="model-stage"><div class="model-op-box"><span>GRU<br>h₁</span></div></div><div class="model-stage"><div class="model-tensor"><span>x₂</span></div></div><div class="model-stage"><div class="model-op-box"><span>GRU<br>h₂</span></div></div><div class="model-stage"><div class="model-tensor"><span>… xₜ</span></div></div><div class="model-stage"><div class="model-op-box"><span>GRU<br>hₜ</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Pool / Head</span></div></div></div>
</div>

Bidirectional GRUではforwardとbackwardの2方向からhidden stateを作りconcatします。ただしfuture情報が利用できないonline forecastingではbidirectionalを使えない場合があります。

## Transformerとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>GRU</h4><dl><dt>情報伝播</dt><dd>hidden stateをstepごとに更新</dd><dt>計算</dt><dd>時間方向に逐次依存</dd><dt>長さ</dt><dd>state sizeは固定</dd><dt>向く例</dt><dd>sensor / event sequence / streaming</dd></dl></section><section class="comparison-card"><h4>Transformer</h4><dl><dt>情報伝播</dt><dd>Attentionでtoken同士を直接参照</dd><dt>計算</dt><dd>training時に並列化しやすい</dd><dt>長さ</dt><dd>Attention matrixが増える</dd><dt>向く例</dt><dd>text / sequence全般</dd></dl></section></div>

GRUが古いから無意味ということではありません。データ量・sequence length・runtimeによっては強いinductive biasになります。

## Kaggleでの実例 {#kaggle-examples}

Riiid Answer Correctness Prediction 2021の6位解法は**custom GRU**を中心にsequence length 256で学習し、7 seeds ensembleでValidation 0.8136→0.815と報告しています（[6th place solution](https://www.kaggle.com/competitions/riiid-test-answer-prediction/discussion/209581)）。

CMI Sensor Data 2025の8位解法ではCNNで時系列featureを抽出した後、**bidirectional GRU + attention pooling**へ渡すarchitectureを採用しています（[8th place solution](https://www.kaggle.com/competitions/cmi-detect-behavior-with-sensor-data/writeups/8th-place-solution-and-competition-walkthrough)）。

## 注意点 {#pitfalls}

### 時系列splitを守る

モデルがrecurrentでもValidationで未来情報を混ぜれば意味がありません。user/entity leakageやtime leakageを先に設計します。

### 長距離依存

hidden stateへ情報を圧縮し続けるため、非常に長いsequenceの遠い情報を保持しづらい場合があります。Transformer/Mamba等と比較します。

### paddingをそのまま読む

variable length batchではpadding位置をmask/packしないと、偽のstepとしてhidden stateへ影響します。

## Quick Reference

- hₜ₋₁ + xₜ → hₜ。
- Update gate = 古いstateと新しい候補のmix。
- Reset gate = candidate生成時に過去をどれだけ使うか。
- LSTMよりcell stateがなく構造が軽い。
- sensor/event sequenceでは今も実用的なbaseline。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [Mamba]({{ '/wiki/modeling/mamba.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. Cho et al., “Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation”, 2014. https://arxiv.org/abs/1406.1078
2. Chung et al., “Empirical Evaluation of Gated Recurrent Neural Networks on Sequence Modeling”, 2014. https://arxiv.org/abs/1412.3555
3. Kaggle, “Riiid: 6th Place Solution — Very Custom GRU”, 2021. https://www.kaggle.com/competitions/riiid-test-answer-prediction/discussion/209581
4. Kaggle, “CMI Sensor Data: 8th place solution”, 2025. https://www.kaggle.com/competitions/cmi-detect-behavior-with-sensor-data/writeups/8th-place-solution-and-competition-walkthrough

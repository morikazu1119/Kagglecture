---
layout: default
title: Graph Neural Network
summary: nodeがneighborからmessageを集約し、graph構造を使ってnode・edge・graph表現を更新するmodel family。
type: reference
domain: kaggle
topic: graph-neural-network
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, graph, gnn, graphsage]
---

# Graph Neural Network

**Graph Neural Network（GNN）は、各nodeが隣接nodeやedgeから情報を受け取り、自分のrepresentationを更新するモデルです。**

表形式の1行や画像gridではなく、**nodeとedgeのつながり自体が入力情報**になります。分子ならatom=node・bond=edge、推薦ならitem/user=node・interaction=edgeとして扱えます。

<nav class="article-jump-nav"><a href="#message">Message Passing</a><a href="#layers">複数layer</a><a href="#architecture">全体構造</a><a href="#graphsage">GraphSAGE</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1 nodeがneighborから情報を集める {#message}

node Aを更新するとき、A自身のfeatureだけでなく、edgeでつながったB/Cのfeatureを集めます。

<div class="model-architecture" aria-label="GNN message passing operation">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Neighborからmessageを集め、自分のfeatureと結合して更新する</div><p class="model-architecture__subtitle">Aggregationはmean/sum/max/attention等。edge featureもmessageへ入れられます。</p></div><span class="model-architecture__badge">message passing</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Neighbor B<br>hᵦ</span></div></div><div class="model-stage"><div class="model-tensor"><span>Neighbor C<br>h𝚌</span></div></div><div class="model-stage"><div class="model-op-box"><span>Message<br>function</span></div></div><div class="model-stage"><div class="model-op-box"><span>Aggregate<br>Σ / mean</span></div></div><div class="model-stage"><div class="model-tensor"><span>Self<br>hₐ</span></div></div><div class="model-stage"><div class="model-op-box"><span>Update<br>MLP</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>New node<br>h'ₐ</span></div></div></div>
</div>

一般形は「messageを作る → neighborhoodで集約 → self featureと合わせて更新」です。Graph Convolution、GraphSAGE、GAT等でmessage/aggregateの作り方が違います。

## layerを重ねると何hop先まで見えるか {#layers}

1 GNN layerでは基本1-hop neighbor、2 layerならneighborのneighborまで情報が届きます。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>1 layer</h4><dl><dt>見る範囲</dt><dd>1-hop neighbor</dd><dt>例</dt><dd>直接つながったatom/item</dd></dl></section><section class="comparison-card"><h4>2 layers</h4><dl><dt>見る範囲</dt><dd>2-hop</dd><dt>例</dt><dd>neighborのneighbor</dd></dl></section><section class="comparison-card"><h4>Deep GNN</h4><dl><dt>見る範囲</dt><dd>広い</dd><dt>risk</dt><dd>oversmoothing / over-squashing</dd></dl></section></div>

深くすれば無限に良いわけではなく、node representationが似すぎるoversmoothing等が起こります。

## GNN全体 {#architecture}

Taskによって最終出力の単位が変わります。

<div class="model-architecture" aria-label="GNN full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Graph → Message Passing × L → Node/Edge/Graph Head</div><p class="model-architecture__subtitle">node predictionなら各node、graph predictionならpoolingしたgraph embeddingをheadへ渡します。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Nodes + Edges</span></div></div><div class="model-stage"><div class="model-op-box"><span>Feature<br>Embedding</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Message Passing<br>Layer × L</span></div></div><div class="model-stage"><div class="model-tensor"><span>Node<br>Embeddings</span></div></div><div class="model-stage"><div class="model-op-box"><span>Pool / Edge<br>Readout</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Prediction</span></div></div></div>
</div>

## GraphSAGE {#graphsage}

GraphSAGEは、各node固有embeddingを丸暗記するのではなく、**neighbor featureをsample・aggregateする関数**を学びます。そのためtraining時に存在しなかったnodeへもinductiveにembeddingを作れます（[GraphSAGE paper](https://arxiv.org/abs/1706.02216)）。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">巨大graphでは全neighborを使わずsampleして集約できる</div><p class="model-architecture__subtitle">fanoutを固定すればmini-batch trainingしやすくなります。</p></div><span class="model-architecture__badge">GraphSAGE</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Target Node</span></div></div><div class="model-stage"><div class="model-op-box"><span>Sample<br>Neighbors</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Neighbor<br>Features</span></div></div><div class="model-stage"><div class="model-op-box"><span>Aggregate +<br>Combine</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Node<br>Embedding</span></div></div></div></div>

## Kaggleでの実例 {#kaggle-examples}

OTTO Recommender System 2023の7位解法はLightGBM partとGNN partをensembleし、GNNがteam scoreへ**+0.003**寄与したと報告しています。session内item transitionからglobal graphを作り、各session用subgraphを抽出してGNNで候補scoreを出しています（[7th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/jack-toshi-k-7th-place-solution)）。

CHAMPS Scalar Couplingの5位解法では分子をnode/edge/global representationを持つgraphとして扱い、複数GNN variant + stackingを使用しています（[5th place solution](https://www.kaggle.com/competitions/champs-scalar-coupling/writeups/dl-guys-5th-place-solution-dl-guys)）。

IceCube 2023の11位解法ではpulseをnodeとするGNNをTransformerとensembleし、GNN modelの改善過程も公開しています（[11th place solution](https://www.kaggle.com/competitions/icecube-neutrinos-in-deep-ice/writeups/qudata-11-th-place-solution-attention-gnn-ensemble)）。

## 使う場面

- molecule / material graph。
- recommender / session transition graph。
- social/network data。
- spatial interactionやevent graph。
- raw tableだけでは関係構造を表しにくいtask。

## 注意点 {#pitfalls}

### graphを作る時点でLeakageしない

Test future interactionやValidation期間のedgeをTrain graph constructionへ使えばleakageです。graph生成もfold/time split内へ閉じます。

### node ID丸暗記

transductive embeddingは未知nodeへgeneralizeできません。testに新nodeが出るならfeature-based inductive modelを検討します。

### neighbor explosion

layerを深くすると参照neighbor数が指数的に増えます。sampling、subgraph extraction、fanout設計が必要です。

### Graph Transformerとの境界

neighbor aggregationへAttentionを使うGATやglobal graph attention等、多くのhybridがあります。GNNは単一architecture名ではなくmodel familyです。

## Quick Reference

- node + edgeが入力。
- Message → Aggregate → Updateが基本。
- L layersでL-hop情報が届くイメージ。
- GraphSAGEはneighbor sampling + inductive aggregation。
- graph construction自体のLeakageに注意。

## 関連項目

- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [FT-Transformer]({{ '/wiki/modeling/ft-transformer.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})

## 参考文献

1. Gilmer et al., “Neural Message Passing for Quantum Chemistry”, 2017. https://arxiv.org/abs/1704.01212
2. Hamilton et al., “Inductive Representation Learning on Large Graphs”, 2017. https://arxiv.org/abs/1706.02216
3. Kaggle, “OTTO: 7th Place Solution”, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/jack-toshi-k-7th-place-solution
4. Kaggle, “CHAMPS: 5th Place Solution”, 2019. https://www.kaggle.com/competitions/champs-scalar-coupling/writeups/dl-guys-5th-place-solution-dl-guys
5. Kaggle, “IceCube: 11th Place Solution”, 2023. https://www.kaggle.com/competitions/icecube-neutrinos-in-deep-ice/writeups/qudata-11-th-place-solution-attention-gnn-ensemble

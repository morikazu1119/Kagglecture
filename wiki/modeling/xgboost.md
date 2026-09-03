---
layout: default
title: XGBoost
summary: 表の1行をDecision Treeで分岐させ、複数treeのleaf scoreを順番に足して前までの誤差を補正するGBDT。
type: reference
domain: kaggle
topic: xgboost
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - gbdt
  - xgboost
---

# XGBoost

**XGBoostは、表データの1行をDecision Treeへ通し、到達したleafの値を何本分も足して最終予測を作るGradient Boosted Decision Tree（GBDT）です。**

最初に1本のtreeで「1行がどこへ進み、何を受け取るか」を見て、その後に複数treeがどう誤差を補正するかを見ると理解しやすくなります。XGBoostらしさは、このboostingへ正則化・sampling・効率的なsplit探索を組み込んでいる点です（[XGBoost paper](https://arxiv.org/abs/1603.02754)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#tree">1本のTree</a>
  <a href="#mechanism">モデル全体</a>
  <a href="#training">どう学習するか</a>
  <a href="#parameters">主要Parameter</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## まず1行が1本のTreeを通る {#tree}

たとえば入力行が`age=28`, `visits=7`, `income=4.2`だとします。Treeはfeature条件を上から順に判定し、1つのleafへ到達させます。

<div class="model-architecture" aria-label="XGBoostで1サンプルがDecision Treeを通る模式図">
  <div class="model-architecture__header"><div><div class="model-architecture__title">質問に答えながら1つのleafまで進む</div><p class="model-architecture__subtitle">1つのsampleが通るのはtree全体のうち1本のpathです。</p></div><span class="model-architecture__badge">single tree</span></div>
  <p class="interactive-note">模式例。feature、threshold、leaf scoreは人工値です。</p>
  <div class="residual-architecture" style="grid-template-columns:repeat(5,minmax(0,1fr))">
    <div class="residual-node"><strong>Input row</strong><br>age=28<br>visits=7</div>
    <div class="residual-node"><strong>age &lt; 30?</strong><br>YES</div>
    <div class="residual-node"><strong>visits &lt; 5?</strong><br>NO</div>
    <div class="residual-node is-add"><strong>Leaf</strong><br>+0.14</div>
    <div class="residual-node"><strong>Tree output</strong><br>+0.14</div>
  </div>
  <p class="model-architecture__caption">classificationでも各treeが直接class labelを返すとは限らず、最終scoreへ加える連続値を返します。</p>
</div>

Tree全体で見ると、別のfeature値を持つsampleは別branchへ進み、別leaf scoreを受け取ります。

<div class="model-architecture" aria-label="XGBoostの1本のDecision Tree全体">
  <div class="model-architecture__header"><div><div class="model-architecture__title">1本のTreeは「条件の分岐」と「最後のscore」の集合</div><p class="model-architecture__subtitle">depthを増やすほど細かいfeature interactionを表現できますが、過学習riskも増えます。</p></div><span class="model-architecture__badge">tree structure</span></div>
  <div class="tree-ensemble" style="grid-template-columns:minmax(220px,1fr) minmax(160px,.75fr)">
    <section class="tree-card">
      <div class="tree-card__title">Decision Tree</div>
      <div class="mini-tree">
        <div class="tree-node is-root">age &lt; 30?</div>
        <div class="tree-node is-left">visits &lt; 5?</div><div class="tree-node is-right">income &lt; 5.0?</div>
        <div class="tree-node is-left is-leaf">−0.08</div><div class="tree-node is-right is-leaf">+0.14</div>
      </div>
    </section>
    <div class="boost-output">各sampleは<br>1つのleafだけに到達<br>→ そのscoreを返す</div>
  </div>
  <p class="model-architecture__caption">構造・値は模式例です。</p>
</div>

## モデル全体ではTreeを順番に足す {#mechanism}

XGBoostのpredictionは、複数treeの出力を**加算**して作ります。Tree 1だけで正解しようとせず、Tree 2、Tree 3と前までの不足を補正していきます。

<div class="model-architecture" aria-label="XGBoostで複数treeのleaf scoreを加算する構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じsampleを何本ものTreeへ通し、scoreを足す</div><p class="model-architecture__subtitle">各treeは前までのmodelが残した誤差を小さくする方向へ追加されます。</p></div><span class="model-architecture__badge">additive tree ensemble</span></div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Input<br>x</span></div><span class="model-stage__label">同じsample</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 1<br>+0.32</span></div><span class="model-stage__label">initial correction</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 2<br>−0.07</span></div><span class="model-stage__label">next correction</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Tree 3…N<br>+ / −</span></div><span class="model-stage__label">boost rounds</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Base + ηΣTree</span></div><span class="model-stage__label">final prediction</span></div>
  </div>
  <p class="model-architecture__caption">数値は模式例です。learning rate（eta）は新しいtreeの寄与を縮小します。</p>
</div>

learning rate（`eta`）を小さくすると、1本ごとの修正を慎重にし、その分より多くのboosting roundsで学習します。

## Treeをどう良くしていくか {#training}

ここからが少し厳密な説明です。XGBoostは「前までの予測をどう直せばlossが下がるか」をgradientから見積もり、さらに2階微分情報（hessian）も使ってsplit gainやleaf weightを近似的に最適化します。加えてtree complexityへの正則化項を持ちます（[XGBoost paper](https://arxiv.org/abs/1603.02754)）。

<div class="model-architecture" aria-label="XGBoost training loopの概念図">
  <div class="model-architecture__header"><div><div class="model-architecture__title">予測 → 誤差の方向を測る → 次のTreeで修正</div><p class="model-architecture__subtitle">gradient / hessianは「どちらへ、どれくらい修正するとlossが下がるか」を決めるために使われます。</p></div><span class="model-architecture__badge">training loop</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Current<br>prediction</span></div><span class="model-stage__label">現在の予測</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Objective</strong><br>gradient / hessian</span></div><span class="model-stage__label">修正方向を計算</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>New tree<br>leaf weights</span></div><span class="model-stage__label">補正を学習</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Updated<br>prediction</span></div><span class="model-stage__label">次roundへ</span></div>
  </div>
</div>

## 主要Parameter {#parameters}

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th scope="col">Parameter</th><th scope="col">何を変えるか</th><th scope="col">大きく/強くしたとき</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>max_depth</code></th><td>treeの深さ上限</td><td>表現力↑ / 過学習risk↑</td></tr>
    <tr><th scope="row"><code>min_child_weight</code></th><td>小さすぎるleafを抑える</td><td>大きいほど保守的</td></tr>
    <tr><th scope="row"><code>learning_rate</code> / <code>eta</code></th><td>1 treeの寄与</td><td>小さいほど多くのroundが必要</td></tr>
    <tr><th scope="row"><code>subsample</code></th><td>row sampling</td><td>小さくするとregularization / diversity</td></tr>
    <tr><th scope="row"><code>colsample_bytree</code></th><td>feature sampling</td><td>小さくするとfeature依存を抑える</td></tr>
    <tr><th scope="row"><code>reg_alpha</code>, <code>reg_lambda</code></th><td>L1/L2正則化</td><td>leaf weightを抑える方向</td></tr>
  </tbody>
</table></div>

## 使い分け {#comparison}

<div class="comparison-board" aria-label="XGBoostと他GBDTの使い分け">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>核</dt><dd>histogram + leaf-wise</dd><dt>直感</dt><dd>改善が大きいbranchを先に深くする</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/catboost.html' | relative_url }}">CatBoost</a></h4><dl><dt>核</dt><dd>ordered categorical processing</dd><dt>直感</dt><dd>カテゴリ統計の自己target参照を抑える</dd></dl></section>
  <section class="comparison-card is-primary"><h4>XGBoost</h4><dl><dt>核</dt><dd>regularized additive tree boosting</dd><dt>直感</dt><dd>depth・sampling・正則化を細かく制御</dd></dl></section>
</div>

同じtabularでも3者の誤差は完全一致しないため、同じfoldのOOFで比較し、ensemble候補としても評価します。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではXGBoostを主要base modelとして、3 hyperparameter settings × 20 seedsの計60モデルを平均しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

March Machine Learning Mania 2026の1位解法ではXGBRegressorを`n_estimators=4000`, `learning_rate=0.003`, `early_stopping_rounds=100`で使い、Leave-One-Season-Outで評価しています（[1st Place Solution](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)）。

Predicting Student Health Risk 2026の2位解法でも複数XGBoost予測が18 base predictorsのensembleへ含まれています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### tuningをPublic LBで行う

GBDTはparameter自由度が高く、Public差を追うとLeaderboard overfittingします。全trialを共通OOFで比較します。

### boosting roundsを固定する

learning rateやfoldごとに最適tree数は変わります。十分大きな上限 + Early Stoppingが扱いやすいです。

### category encoding leakage

Target Encodingなど外部encodingを使うなら、model自体が強くてもencoding pipelineのLeakageでCVは壊れます。

## Quick Reference

- 1行はfeature条件を通り、1本のtreeから1つのleaf scoreを受け取る。
- model全体は複数treeのscoreを加算する。
- 新しいtreeは前までの誤差を補正する方向へ追加される。
- `eta`は1本のtreeの寄与を縮める。
- depth・sampling・regularizationを同じOOFで調整する。

## 関連項目

- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }})
- [Early Stopping]({{ '/wiki/training/early-stopping.html' | relative_url }})
- [Fold / Seed Ensemble]({{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }})

## 参考文献

1. [Chen & Guestrin, “XGBoost: A Scalable Tree Boosting System”, 2016](https://arxiv.org/abs/1603.02754)
2. [XGBoost, “XGBoost Parameters”](https://xgboost.readthedocs.io/en/stable/parameter.html)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “March Machine Learning Mania 2026: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)
5. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)

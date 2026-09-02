---
layout: default
title: XGBoost
summary: 正則化されたDecision Treeを順番に追加し、前までの予測誤差を次のtreeで補正するGradient Boosted Decision Tree実装。
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

**XGBoostは、1本の大きなDecision Treeを作るのではなく、小〜中規模のtreeを順番に追加し、それぞれのleaf scoreを足し合わせて予測するGradient Boosted Decision Tree（GBDT）です。**

各iterationでは、これまでのpredictionが外している方向をgradient / hessianから見積もり、次のtreeを追加します。XGBoostはこのtree boostingへ正則化、sampling、効率的なsplit探索を組み込んだ実装です（[XGBoost paper](https://arxiv.org/abs/1603.02754)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#tree">Tree内部</a>
  <a href="#parameters">主要Parameter</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## Boostingの仕組み {#mechanism}

XGBoostのpredictionは、複数treeの出力を**加算**して作ります。最初のtreeだけで正解しようとせず、Tree 2、Tree 3と補正を追加していくのが中心です。

<div class="model-architecture" aria-label="XGBoostで複数treeのleaf scoreを加算する構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Treeを順番に追加し、leaf scoreを足して予測を更新する</div><p class="model-architecture__subtitle">同じsample xは各treeのsplit条件を通り、それぞれ1つのleaf scoreを受け取ります。</p></div>
    <span class="model-architecture__badge">additive tree ensemble</span>
  </div>
  <div class="tree-ensemble">
    <section class="tree-card">
      <div class="tree-card__title">Tree 1 · baseline correction</div>
      <div class="mini-tree">
        <div class="tree-node is-root">feature A &lt; 3.2?</div>
        <div class="tree-node is-left">yes</div><div class="tree-node is-right">no</div>
        <div class="tree-node is-left is-leaf">leaf +0.32</div><div class="tree-node is-right is-leaf">leaf −0.18</div>
      </div>
    </section>
    <section class="tree-card">
      <div class="tree-card__title">Tree 2 · residual correction</div>
      <div class="mini-tree">
        <div class="tree-node is-root">feature C &lt; 8?</div>
        <div class="tree-node is-left">yes</div><div class="tree-node is-right">no</div>
        <div class="tree-node is-left is-leaf">leaf −0.07</div><div class="tree-node is-right is-leaf">leaf +0.14</div>
      </div>
    </section>
    <section class="tree-card">
      <div class="tree-card__title">Tree 3 · smaller correction</div>
      <div class="mini-tree">
        <div class="tree-node is-root">feature B &lt; 1.5?</div>
        <div class="tree-node is-left">yes</div><div class="tree-node is-right">no</div>
        <div class="tree-node is-left is-leaf">leaf +0.05</div><div class="tree-node is-right is-leaf">leaf −0.03</div>
      </div>
    </section>
    <div class="tree-sum" aria-label="加算">+</div>
    <div class="boost-output">Base score + η·Tree1 + η·Tree2 + η·Tree3 + …<br>→ final prediction</div>
  </div>
  <p class="model-architecture__caption">数値・split条件は模式例です。実際には各treeの構造とleaf weightをtraining objectiveに基づいて学習します。</p>
</div>

learning rate（`eta`）は、新しく追加するtreeの補正量を縮小します。小さくすると1本あたりの更新が慎重になり、その分多くのboosting roundsが必要になります。

## 1本のTreeでは何をしているか {#tree}

1つのsampleは、feature条件を上から順に判定してleafへ到達します。leafに入っている連続値がそのtreeの出力です。classificationでも各tree自体はclass labelを直接返すというより、最終scoreへ加える値を返します。

<div class="model-architecture" aria-label="XGBoostの1本のDecision Tree内部">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Feature条件でsampleを分岐し、最後にleaf scoreを返す</div><p class="model-architecture__subtitle">depthを増やすほど細かいfeature interactionを表現できますが、過学習riskも増えます。</p></div><span class="model-architecture__badge">tree structure</span></div>
  <div class="residual-architecture" style="grid-template-columns:repeat(5,minmax(0,1fr))">
    <div class="residual-node">sample x</div>
    <div class="residual-node">A &lt; 3.2?</div>
    <div class="residual-node">C &lt; 8?</div>
    <div class="residual-node is-add">leaf<br>+0.14</div>
    <div class="residual-node">ensembleへ加算</div>
  </div>
  <p class="model-architecture__caption">この経路は1 sampleが通るpathだけを抜き出した模式図です。tree全体には他のbranch / leafも存在します。</p>
</div>

XGBoostはgradientだけでなく2階微分情報も用いた近似でsplit gainやleaf weightを最適化し、tree complexityへの正則化項を持ちます（[XGBoost paper](https://arxiv.org/abs/1603.02754)）。

## 主要Parameter {#parameters}

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th scope="col">Parameter</th><th scope="col">役割</th><th scope="col">大きく/強くしたときの主な方向</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>max_depth</code></th><td>treeの深さ上限</td><td>表現力↑ / 過学習リスク↑</td></tr>
    <tr><th scope="row"><code>min_child_weight</code></th><td>小さすぎるleafを抑える</td><td>大きいほど保守的</td></tr>
    <tr><th scope="row"><code>learning_rate</code> / <code>eta</code></th><td>1 treeの寄与を縮める</td><td>小さいほど多くのroundが必要</td></tr>
    <tr><th scope="row"><code>subsample</code></th><td>row sampling</td><td>小さくするとregularization / diversity</td></tr>
    <tr><th scope="row"><code>colsample_bytree</code></th><td>feature sampling</td><td>小さくするとfeature依存を抑える</td></tr>
    <tr><th scope="row"><code>reg_alpha</code>, <code>reg_lambda</code></th><td>L1/L2正則化</td><td>強くするとleaf weightを抑える</td></tr>
  </tbody>
</table></div>

## 使い分け {#comparison}

<div class="comparison-board" aria-label="XGBoostと他GBDTの使い分け">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>成長</dt><dd>leaf-wise</dd><dt>特徴</dt><dd>histogram / native categorical</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/catboost.html' | relative_url }}">CatBoost</a></h4><dl><dt>核</dt><dd>ordered boosting</dd><dt>特徴</dt><dd>categorical処理を組み込み</dd></dl></section>
  <section class="comparison-card is-primary"><h4>XGBoost</h4><dl><dt>核</dt><dd>regularized additive tree boosting</dd><dt>特徴</dt><dd>depth・sampling・正則化を細かく制御</dd></dl></section>
</div>

同じtabularでも3者の誤差は完全一致しないため、OOF比較してensemble候補にします。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではXGBoostを主要base modelとして、3 hyperparameter settings × 20 seedsの計60モデルを平均しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

March Machine Learning Mania 2026の1位解法ではXGBRegressorを`n_estimators=4000`, `learning_rate=0.003`, `early_stopping_rounds=100`で使い、Leave-One-Season-Outで評価しています（[1st Place Solution](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)）。

Predicting Student Health Risk 2026の2位解法でも複数XGBoost予測が18 base predictorsのensembleへ含まれています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### tuningをPublic LBで行う

GBDTはparameter自由度が高く、Public差を追うと簡単にLeaderboard overfittingします。全trialを共通OOFで比較します。

### boosting rounds固定

learning rateやfoldごとに最適tree数は変わります。十分大きな上限 + Early Stoppingが扱いやすいです。

### category encoding leakage

Target Encodingなど外部encodingを使うなら、model自体が強くてもencoding pipelineのLeakageでCVは壊れます。

## Quick Reference

- 予測は複数treeのleaf scoreの加算。
- 新しいtreeは前までの誤差を補正する方向へ追加される。
- `eta`は1本のtreeの寄与を縮める。
- depthと`min_child_weight`を対で見る。
- OOFを保存してLightGBM/CatBoostとも比較する。

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

---
layout: default
title: CatBoost
summary: カテゴリ特徴をtargetを使って数値化するときの自己参照をorderingで抑え、その特徴を対称treeのboostingへ使うGBDT。
type: reference
domain: kaggle
topic: catboost
created: 2026-09-03
updated: 2026-09-03
source_count: 6
tags:
  - kaggle
  - modeling
  - gbdt
  - catboost
  - categorical
---

# CatBoost

**CatBoostは、`city=Tokyo`のようなカテゴリ特徴を扱いやすくしつつ、Decision Treeを何本も足して予測するGBDTです。**

CatBoostの重要点は「カテゴリを使える」ことだけではありません。カテゴリからtargetに関する統計を作るときに、**その行自身の正解を見てしまうカンニングを避ける**ため、データに順番を作って過去の行だけを参照します。この考え方がordered categorical statisticsとOrdered Boostingにつながります（[CatBoost paper](https://arxiv.org/abs/1706.09516)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#problem">何が問題か</a>
  <a href="#categorical">カテゴリ処理</a>
  <a href="#ordered">Ordered Boosting</a>
  <a href="#tree">Tree構造</a>
  <a href="#architecture">モデル全体</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
</nav>

## まず「カテゴリをtargetで数値化する」と何が危ないか {#problem}

たとえば、`city`から「その都市では何割が購入したか」という数値を作るとします。

<div class="html-table-wrap">
<table class="html-table" aria-label="カテゴリ統計で自己target参照が起きる模式例">
  <thead><tr><th scope="col">Row</th><th scope="col">city</th><th scope="col">target</th><th scope="col">Tokyoの購入率を作るとき</th></tr></thead>
  <tbody>
    <tr><th scope="row">1</th><td>Tokyo</td><td>1</td><td>過去がない</td></tr>
    <tr><th scope="row">2</th><td>Osaka</td><td>0</td><td>対象外</td></tr>
    <tr><th scope="row">3</th><td>Tokyo</td><td class="status-good">0</td><td><strong>Row 3自身の0を入れると答えを見てしまう</strong></td></tr>
    <tr><th scope="row">4</th><td>Tokyo</td><td>1</td><td>Row 1, 3を過去として使える</td></tr>
  </tbody>
</table>
</div>
<p class="table-caption">模式例。実データではありません。</p>

Row 3の特徴を作るのにRow 3の`target=0`まで使うと、特徴量の中へ自分の答えが混ざります。これはTarget Encodingで起きる代表的なleakageです。

CatBoostはこの問題に対して、**「現在行より前の情報だけで現在行の統計を作る」**というordering principleを使います。

## Ordered categorical statistics {#categorical}

random permutationで行に順番を作り、現在行のcategory統計は、その順番上で前にあるrowだけから計算します（[CatBoost categorical feature processing](https://catboost.ai/docs/en/concepts/algorithm-main-stages_cat-to-numberic)）。

<div class="model-architecture" aria-label="CatBoostのordered categorical statistics模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Current rowは、自分より前にある同categoryだけを見る</div><p class="model-architecture__subtitle">「自分のtargetを見ない」という単純なルールが中心です。</p></div>
    <span class="model-architecture__badge">ordered statistics</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-op-box"><span><strong>Permutation</strong><br>Row 3 → Row 1 → Row 4 → Row 2</span></div><span class="model-stage__label">順序を作る</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Past rows<br>同categoryのみ</span></div><span class="model-stage__label">過去だけ参照</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>CTR / statistic</strong><br>過去targetを集約</span></div><span class="model-stage__label">数値特徴化</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Current row<br>自己targetなし</span></div><span class="model-stage__label">カンニングを抑える</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Tree split</strong><br>生成特徴を利用</span></div><span class="model-stage__label">GBDTへ</span></div>
  </div>
  <p class="model-architecture__caption">内部処理を単純化した模式図です。実際には複数permutationやさまざまなcategorical statisticsを扱います。</p>
</div>

## Ordered Boostingは何を防ぐか {#ordered}

ここまでのordered statisticsは**カテゴリ特徴を作るとき**の自己参照対策です。CatBoostにはもう1つ、boosting中のprediction shiftを抑えるための**Ordered Boosting**があります。

通常のgradient boostingでは、training sampleを学習したmodel自身のpredictionから次のgradientを作るため、有限sampleではprediction shiftが起き得ます。CatBoost論文は、各sampleについて「そのsampleより前のdataで学習したmodel」に相当するpredictionを使う方式を提案しています。

<div class="model-architecture" aria-label="CatBoost Ordered Boostingの概念構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Current rowをまだ見ていない状態に近いmodelで誤差を作る</div><p class="model-architecture__subtitle">カテゴリ統計と同じく、past-onlyという考え方をboostingにも使います。</p></div><span class="model-architecture__badge">ordered boosting</span></div>
  <div class="residual-architecture">
    <div class="residual-node">Past rows</div>
    <div class="residual-node">Past-only model</div>
    <div class="residual-node">Current row prediction</div>
    <div class="residual-node is-add">Gradient / residual</div>
    <div class="residual-node">Next tree</div>
  </div>
  <p class="model-architecture__caption">CatBoostの`boosting_type`は実行環境・dataset size・taskによって`Ordered`/`Plain`のdefaultが変わります。CatBoostを使えば常にOrdered Boostingになる、という意味ではありません。</p>
</div>

CatBoost公式の現行documentationでも`boosting_type`として`Ordered`と`Plain`があり、defaultはCPU/GPUやdata size等に依存するとされています（[training parameters](https://catboost.ai/docs/en/references/training-parameters/common)）。

## Tree自体はどういう形か {#tree}

CatBoostのdefault `grow_policy=SymmetricTree`では、同じdepthにあるすべてのleafへ**同じsplit条件**を適用する対称treeを作ります（[CatBoost parameter tuning](https://catboost.ai/docs/en/concepts/parameter-tuning)）。

<div class="model-architecture" aria-label="CatBoost symmetric treeの構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じlevelでは同じ質問を使う</div><p class="model-architecture__subtitle">branchごとに別の質問を選ぶtreeより、規則的な構造になります。</p></div><span class="model-architecture__badge">SymmetricTree</span></div>
  <div class="tree-ensemble" style="grid-template-columns:minmax(180px,1fr) minmax(180px,1fr) 52px minmax(140px,.8fr)">
    <section class="tree-card"><div class="tree-card__title">Depth 1</div><div class="mini-tree"><div class="tree-node is-root">A &lt; 3?</div><div class="tree-node is-left is-leaf">Leaf</div><div class="tree-node is-right is-leaf">Leaf</div></div></section>
    <section class="tree-card"><div class="tree-card__title">Depth 2 · 両branchで同じB&lt;5?</div><div class="mini-tree"><div class="tree-node is-root">A &lt; 3?</div><div class="tree-node is-left">B &lt; 5?</div><div class="tree-node is-right">B &lt; 5?</div><div class="tree-node is-left is-leaf">4 leaf outputs</div><div class="tree-node is-right is-leaf">same level rule</div></div></section>
    <div class="tree-sum">×</div><div class="boost-output">このtreeを複数本作り<br>scoreを加算</div>
  </div>
  <p class="model-architecture__caption">split条件と値は模式例です。`grow_policy`を変更すれば非対称treeも選べます。</p>
</div>

## CatBoost全体の構造 {#architecture}

<div class="model-architecture" aria-label="CatBoost全体のデータ処理とboosting構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">カテゴリを安全に数値化し、その特徴を使うTreeを何本も足す</div><p class="model-architecture__subtitle">ordered処理は前処理だけの話ではなく、CatBoostの学習設計とつながっています。</p></div><span class="model-architecture__badge">full architecture</span></div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Raw row<br>数値 + category</span></div><span class="model-stage__label">Input</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Ordered stats</strong><br>past-onlyで数値特徴化</span></div><span class="model-stage__label">Categorical processing</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 1<br>leaf score</span></div><span class="model-stage__label">Boosting</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Tree 2…N<br>corrections</span></div><span class="model-stage__label">Additive ensemble</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Σ tree scores</span></div><span class="model-stage__label">Prediction</span></div>
  </div>
</div>

## 使う場面

- 文字列カテゴリや高cardinalityカテゴリが多い。
- 外部Target Encoding pipelineを単純化したい。
- 数値+カテゴリのtabular baselineを素早く作りたい。
- LightGBM/XGBoostと異なる誤差を持つensemble候補が欲しい。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="CatBoost LightGBM XGBoostの比較">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>核</dt><dd>histogram + leaf-wise</dd><dt>直感</dt><dd>改善の大きいbranchを先に深くする</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/xgboost.html' | relative_url }}">XGBoost</a></h4><dl><dt>核</dt><dd>regularized additive tree boosting</dd><dt>直感</dt><dd>depth・sampling・正則化を細かく制御</dd></dl></section>
  <section class="comparison-card is-primary"><h4>CatBoost</h4><dl><dt>核</dt><dd>ordered categorical processing</dd><dt>直感</dt><dd>targetを使うcategory統計の自己参照を抑える</dd></dl></section>
</div>

カテゴリが多いからCatBoostが必ず勝つわけではありません。native categorical、Target Encoding + LightGBM、XGBoostを同一CVで比較します。

## Kaggleでの実例

30 Days of MLの1位解法ではCatBoostをLightGBM・XGBoost・HGBRとともにLevel 1/2 ensembleへ採用しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Predicting F1 Pit Stops 2026の11位解法はXGBoost、LightGBM、DART等とともにCatBoostを多数のOOF候補へ含め、CatBoostが特に良かった可能性としてOrdered Boostingに言及しています（[11th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/11th-place-in-the-midst-of-entrance-exams)）。

Predicting Student Health Risk 2026ではCatBoost・LightGBM・XGBoostなどのtree model同士の予測一致率が非常に高い分析もあり、**異なるlibrary名だけでは十分なensemble diversityにならない**場合があります（[analysis](https://www.kaggle.com/competitions/playground-series-s6e7/discussion/732538)）。

## 注意点 {#pitfalls}

### `CatBoost = 常にOrdered Boosting`ではない

現在の公式documentationでは`boosting_type`のdefaultはprocessing unit、dataset size、taskに依存します。experiment logには実際のparameterを残します。

### 数値IDをcategoryにすべきか自動で決まらない

整数だからnumericとは限らず、数字だからcategoryとも限りません。生成過程で判断します。

### Orderedな内部処理でもCV Leakageは防げない

モデル内部が自己参照を抑えていても、全Trainで特徴選択・外部Target Encoding・前処理をfitすればValidation leakageは起きます。pipeline全体はfold内に閉じます。

## Quick Reference

- CatBoostも複数Decision Treeを足すGBDT。
- category統計でcurrent row自身のtargetを直接使わないようorderingを使う。
- Ordered Boostingはprediction shiftを抑える別の仕組み。
- default grow policyはSymmetricTree。
- LightGBM/XGBoostと同じOOFで比較する。

## 関連項目

- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})

## 参考文献

1. [Prokhorenkova et al., “CatBoost: unbiased boosting with categorical features”, 2018](https://arxiv.org/abs/1706.09516)
2. [CatBoost, “Transforming categorical features to numerical features”](https://catboost.ai/docs/en/concepts/algorithm-main-stages_cat-to-numberic)
3. [CatBoost, “Common parameters”](https://catboost.ai/docs/en/references/training-parameters/common)
4. [CatBoost, “Parameter tuning — Tree growing policy”](https://catboost.ai/docs/en/concepts/parameter-tuning)
5. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
6. [Kaggle, “Predicting F1 Pit Stops: 11th Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/11th-place-in-the-midst-of-entrance-exams)

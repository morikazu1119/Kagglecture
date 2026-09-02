---
layout: default
title: CatBoost
summary: カテゴリ特徴のtarget statisticsとboosting時のprediction shiftを抑える設計を持ち、categorical-richな表形式データで扱いやすいGBDT。
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

**CatBoostは、カテゴリ特徴をモデル内部で数値化しながらGradient Boosted Decision Treeを学習できるGBDTです。**

重要なのは「categoryをそのままtreeへ入れる」ことではありません。CatBoostはカテゴリからtarget statistics等の数値特徴を作り、その際のtarget leakage / prediction shiftを抑えるためにordering principleを使います。CatBoost論文ではOrdered Boostingとordered categorical statisticsが主要技術として説明されています（[CatBoost paper](https://arxiv.org/abs/1706.09516)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#categorical">カテゴリ処理</a>
  <a href="#ordered">Ordered Boosting</a>
  <a href="#tree">Tree構造</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
</nav>

## カテゴリ特徴をどう数値化するか {#categorical}

たとえば`city=Tokyo`のような文字列カテゴリをtreeで使うには、split可能な数値表現へ変換する必要があります。CatBoostはカテゴリ単体や組み合わせから統計特徴を作ります（[CatBoost categorical feature processing](https://catboost.ai/docs/en/concepts/algorithm-main-stages_cat-to-numberic)）。

問題は、あるrowのカテゴリ統計を作るときに**そのrow自身のtarget**を入れると、答えを特徴量へ混ぜることになる点です。CatBoostのordering principleは、random permutation上で「そのrowより前にある情報」を使うことで自己target参照を避けます。

<div class="model-architecture" aria-label="CatBoostのordered categorical statistics模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Current rowの特徴は、permutation上で過去にあるrowだけから作る</div><p class="model-architecture__subtitle">同じcategoryでも、自分自身のtargetを統計へ直接混ぜないことが重要です。</p></div>
    <span class="model-architecture__badge">ordered statistics</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-op-box"><span><strong>Permutation</strong><br>Row 3 → Row 1 → Row 4 → Row 2</span></div><span class="model-stage__label">順序を作る</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Past rows<br>同categoryのtarget</span></div><span class="model-stage__label">過去だけ参照</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>CTR / statistic</strong><br>過去targetを集約</span></div><span class="model-stage__label">数値特徴化</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Current row<br>自己targetなし</span></div><span class="model-stage__label">Leakageを抑える</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Tree split</strong><br>生成した数値特徴を利用</span></div><span class="model-stage__label">GBDTへ</span></div>
  </div>
  <p class="model-architecture__caption">内部処理を単純化した模式図です。実際には複数permutationやさまざまなcategorical statisticsが使われます。</p>
</div>

## Ordered Boostingは何を防ぐか {#ordered}

通常のgradient boostingでは、同じtraining dataから作ったmodel predictionを使って次のgradientを計算するため、有限sampleではprediction shiftが起き得ます。CatBoost論文は、各sampleについて「そのsampleより前のdataで学習したmodel」に相当するpredictionを使うOrdered Boostingを提案しています。

<div class="model-architecture" aria-label="CatBoost Ordered Boostingの概念構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">各rowを学習するとき、自分自身を既に見たmodelのpredictionへ依存しにくくする</div><p class="model-architecture__subtitle">ordered categorical statisticsと同じく、permutation上のpast-onlyという考え方が中心です。</p></div><span class="model-architecture__badge">ordered boosting</span></div>
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

## Tree自体の構造 {#tree}

CatBoostのdefault `grow_policy=SymmetricTree`では、同じdepthにあるすべてのleafへ**同じsplit条件**を適用する対称treeを作ります。これによりtree structureが規則的になり、predictionを高速に行いやすい特徴があります（[CatBoost parameter tuning](https://catboost.ai/docs/en/concepts/parameter-tuning)）。

<div class="model-architecture" aria-label="CatBoost symmetric treeの構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Symmetric Tree: 同じlevelでは全leafを同じ条件でsplitする</div><p class="model-architecture__subtitle">branchごとに別条件を選ぶ一般的なtreeより規則的な構造になります。</p></div>
    <span class="model-architecture__badge">default grow policy</span>
  </div>
  <div class="tree-ensemble" style="grid-template-columns:minmax(180px,1fr) minmax(180px,1fr) 52px minmax(140px,.8fr)">
    <section class="tree-card">
      <div class="tree-card__title">Depth 1</div>
      <div class="mini-tree">
        <div class="tree-node is-root">A &lt; 3?</div>
        <div class="tree-node is-left is-leaf">Leaf</div><div class="tree-node is-right is-leaf">Leaf</div>
      </div>
    </section>
    <section class="tree-card">
      <div class="tree-card__title">Depth 2 · 両leafへ同じsplit B&lt;5?</div>
      <div class="mini-tree">
        <div class="tree-node is-root">A &lt; 3?</div>
        <div class="tree-node is-left">B &lt; 5?</div><div class="tree-node is-right">B &lt; 5?</div>
        <div class="tree-node is-left is-leaf">4 leaf outputs</div><div class="tree-node is-right is-leaf">same level rule</div>
      </div>
    </section>
    <div class="tree-sum">×</div>
    <div class="boost-output">このsymmetric treeを複数本boostingで加算<br>→ final prediction</div>
  </div>
  <p class="model-architecture__caption">split条件と値は模式例です。`grow_policy`を変更すれば非対称treeも選べます。</p>
</div>

## 使う場面 {#use-cases}

- 文字列カテゴリや高cardinalityカテゴリが多い。
- Target Encoding pipelineを単純化したい。
- 数値+カテゴリのtabular baselineを素早く作りたい。
- LightGBM/XGBoostと異なる誤差を持つensemble候補が欲しい。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="CatBoost LightGBM XGBoostの比較">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>核</dt><dd>histogram + leaf-wise</dd><dt>categorical</dt><dd>native対応あり</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/xgboost.html' | relative_url }}">XGBoost</a></h4><dl><dt>核</dt><dd>regularized additive tree boosting</dd><dt>強み</dt><dd>sampling/regularizationの制御</dd></dl></section>
  <section class="comparison-card is-primary"><h4>CatBoost</h4><dl><dt>核</dt><dd>ordered categorical processing</dd><dt>tree</dt><dd>SymmetricTreeがdefault grow policy</dd></dl></section>
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

モデル内部がleakageを抑えていても、全Trainで特徴選択・外部Target Encoding・前処理をfitすればValidation leakageは起きます。pipeline全体はfold内に閉じます。

## Quick Reference

- categorical featureを内部で数値統計へ変換できる。
- ordered statisticsはcurrent row自身のtarget参照を避ける。
- Ordered Boostingはprediction shiftを抑えるための方式だが、常にdefaultとは限らない。
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

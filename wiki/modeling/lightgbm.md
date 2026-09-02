---
layout: default
title: LightGBM
summary: Histogramでsplit候補を圧縮し、loss改善が大きいleafを優先して成長させる高速なGradient Boosted Decision Tree実装。
type: reference
domain: kaggle
topic: lightgbm
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - modeling
  - gbdt
  - lightgbm
---

# LightGBM

**LightGBMは、連続値をHistogramのbinへまとめてsplit探索を高速化し、最もlossを減らせるleafを優先して分割するleaf-wise GBDTです。**

XGBoostと同じく複数treeを順番に追加するboosting modelですが、**1本のtreeをどう作るか**にLightGBMらしさがあります。Histogram-based splitとleaf-wise growthにより高速・高表現力ですが、小データでは局所的に深くなりやすく、過学習制御が重要です（[LightGBM Features](https://lightgbm.readthedocs.io/en/stable/Features.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#histogram">Histogram</a>
  <a href="#leaf-wise">Leaf-wise</a>
  <a href="#boosting">Boosting全体</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
</nav>

## Histogramでsplit候補を作る {#histogram}

通常、連続値featureには非常に多くの候補thresholdがあります。LightGBMは値を離散binへまとめ、各binにgradient / hessian統計を集約してsplit gainを評価します。候補数を減らせるため、split探索とmemory利用を効率化できます（[LightGBM Features](https://lightgbm.readthedocs.io/en/stable/Features.html)）。

<div class="model-architecture" aria-label="LightGBMのHistogram-based split探索">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">連続値をbinへ圧縮し、bin境界ごとにsplit gainを見る</div><p class="model-architecture__subtitle">棒の高さはsample数・gradient統計をイメージした模式表現です。実測値ではありません。</p></div>
    <span class="model-architecture__badge">histogram split</span>
  </div>
  <div class="model-stage-row" style="--model-cols:3">
    <div class="model-stage">
      <div class="model-op-box"><span><strong>Raw feature</strong><br>1.2, 1.4, 1.7, 2.1, 2.2, 3.8, …</span></div>
      <span class="model-stage__label">Continuous values</span>
    </div>
    <div class="model-stage">
      <div class="histogram-split" aria-label="8個のhistogram bin">
        <span class="histogram-bin" style="--h:28"></span>
        <span class="histogram-bin" style="--h:48"></span>
        <span class="histogram-bin" style="--h:72"></span>
        <span class="histogram-bin is-split" style="--h:88"></span>
        <span class="histogram-bin" style="--h:64"></span>
        <span class="histogram-bin" style="--h:44"></span>
        <span class="histogram-bin" style="--h:31"></span>
        <span class="histogram-bin" style="--h:18"></span>
      </div>
      <span class="model-stage__label">Binned histogram</span>
      <span class="model-stage__note">緑の境界付近をsplit候補として評価</span>
    </div>
    <div class="model-stage">
      <div class="model-op-box"><span><strong>Best split</strong><br>gainが最大になるthresholdを選ぶ</span></div>
      <span class="model-stage__label">Node split</span>
    </div>
  </div>
  <p class="model-architecture__caption">実際にはfeatureごとのhistogramからgainを計算し、最も良いfeature / thresholdを選びます。</p>
</div>

## Leaf-wiseにTreeを成長させる {#leaf-wise}

多くのtree learnerは同じdepthのnodeを順に分割するlevel-wise成長を使います。一方LightGBMは、現在あるleafの中から**delta lossが最大になるleafだけを先に分割**します。

<div class="model-architecture" aria-label="LightGBMのleaf-wise成長構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">全leafを均等に深くせず、改善量が大きい場所へsplitを集中する</div><p class="model-architecture__subtitle">同じleaf数でも複雑な局所パターンを表現しやすい反面、一部branchだけ深くなりやすい構造です。</p></div>
    <span class="model-architecture__badge">leaf-wise growth</span>
  </div>
  <div class="tree-ensemble" style="grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) 52px minmax(150px,.9fr)">
    <section class="tree-card">
      <div class="tree-card__title">Step 1 · Root split</div>
      <div class="mini-tree">
        <div class="tree-node is-root">Root</div>
        <div class="tree-node is-left is-leaf">Leaf A<br>gain 0.12</div>
        <div class="tree-node is-right is-leaf">Leaf B<br>gain 0.31</div>
      </div>
    </section>
    <section class="tree-card">
      <div class="tree-card__title">Step 2 · Best leafだけsplit</div>
      <div class="mini-tree">
        <div class="tree-node is-root">Root</div>
        <div class="tree-node is-left is-leaf">Leaf A<br>そのまま</div>
        <div class="tree-node is-right">Leaf Bをsplit</div>
        <div class="tree-node is-left is-leaf">B1</div><div class="tree-node is-right is-leaf">B2</div>
      </div>
    </section>
    <div class="tree-sum">≠</div>
    <div class="boost-output">Level-wiseのように左右を同時に深くしない<br>→ asymmetrical tree</div>
  </div>
  <p class="model-architecture__caption">gain値は理解用の模式値です。LightGBM公式も、leaf-wiseは同じleaf数でlossを下げやすい一方、小データではoverfittingしやすいと説明しています。</p>
</div>

このため`num_leaves`はLightGBMの表現力を強く左右します。`min_data_in_leaf`や`max_depth`と組み合わせて、leafが細かくなりすぎないよう制約します。

## Boosting全体では複数Treeを足す {#boosting}

leaf-wiseは**各tree内部の作り方**です。モデル全体は他のGBDTと同様、複数treeのpredictionを順番に加算します。

<div class="model-architecture" aria-label="LightGBMのtree ensemble">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Histogram + leaf-wiseで作ったtreeをboostingで積み重ねる</div><p class="model-architecture__subtitle">Tree 1の誤差をTree 2が補正し、その残りをTree 3が補正します。</p></div><span class="model-architecture__badge">GBDT ensemble</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 1<br>leaf scores</span></div><span class="model-stage__label">Initial correction</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 2<br>residual</span></div><span class="model-stage__label">Next correction</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 3…N</span></div><span class="model-stage__label">Boost rounds</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Σ tree scores</span></div><span class="model-stage__label">Prediction</span></div>
  </div>
</div>

## 使う場面 {#use-cases}

- 数値・カテゴリ・欠損が混ざるtabular。
- 数十万〜数百万行を高速に試したい。
- feature engineeringを高速に反復したい。
- Neural Networkの補完モデルを作りたい。

## XGBoost/CatBoostとの比較 {#comparison}

<div class="comparison-board" aria-label="LightGBM XGBoost CatBoostの比較">
  <section class="comparison-card is-primary"><h4>LightGBM</h4><dl><dt>split探索</dt><dd>Histogram</dd><dt>tree growth</dt><dd>leaf-wise</dd><dt>最初に見る</dt><dd><code>num_leaves</code>、leaf size</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/xgboost.html' | relative_url }}">XGBoost</a></h4><dl><dt>核</dt><dd>regularized tree boosting</dd><dt>最初に見る</dt><dd>depth、child weight、sampling</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/catboost.html' | relative_url }}">CatBoost</a></h4><dl><dt>核</dt><dd>ordered boosting + categorical</dd><dt>最初に見る</dt><dd>cat指定、iterations / depth</dd></dl></section>
</div>

優劣はdataset依存です。同じfoldでOOFを作り、単体だけでなくerror diversityも比較します。

## Kaggleでの実例

30 Days of MLの1位解法ではLightGBM・XGBoost・CatBoost・HistGradientBoostingをLevel 1/2で組み合わせ、LightGBM単体も20 seeds平均しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Predicting Student Health Risk 2026の2位解法はLightGBM、XGBoost、CatBoost、FT-Transformer、RealMLPなど18 base predictorsをensembleし、LightGBMも主要tree componentとして含めています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### `num_leaves`を大きくしすぎる

leaf-wiseは局所的に深くなれるため、小データでは過学習しやすくなります。`min_data_in_leaf`, `max_depth`, feature/bagging fraction等とセットでCVします。

### categoryを雑に整数化する

カテゴリ値に偽の大小関係を与えるencodingは避け、native categoricalやleak-free encodingを比較します。

### seedだけ変えて多様性が出ると思う

強いGBDT同士は予測相関が高くなりがちです。別feature setやNN等を混ぜる価値も測ります。

## Quick Reference

- 連続値をbinへまとめてHistogramでsplit探索する。
- tree内部はgain最大のleafを先に割るleaf-wise成長。
- `num_leaves`とleaf minimum sizeをセットで調整。
- model全体は複数treeを加算するboosting。
- Early StoppingとOOF保存を前提に設計する。

## 関連項目

- [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }})
- [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }})
- [Early Stopping]({{ '/wiki/training/early-stopping.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})

## 参考文献

1. [LightGBM, “Features”](https://lightgbm.readthedocs.io/en/stable/Features.html)
2. [Ke et al., “LightGBM: A Highly Efficient Gradient Boosting Decision Tree”, 2017](https://proceedings.neurips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)
5. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)

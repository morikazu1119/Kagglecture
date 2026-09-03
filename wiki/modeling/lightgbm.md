---
layout: default
title: LightGBM
summary: 表の1行をDecision Treeで分岐させ、複数treeの補正値を足して予測するGBDT。Histogramとleaf-wise成長でtree構築を高速・高表現力にする。
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

**LightGBMは、表データの1行を「年齢 < 30?」のような条件で分けるDecision Treeを何本も作り、各treeが出す補正値を足して最終予測を作るモデルです。**

まず理解すべきなのは **1行が1本のtreeをどう通るか** と **複数treeをどう足すか** です。その上で、LightGBM独自の高速化であるHistogramと、改善量の大きいleafを優先して深くするleaf-wise成長を見ると全体像がつながります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#one-tree">1本のTree</a>
  <a href="#boosting">モデル全体</a>
  <a href="#histogram">Histogram</a>
  <a href="#leaf-wise">Leaf-wise</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
</nav>

## まず1行が1本のTreeを通る {#one-tree}

たとえば「あるユーザーが商品を買うか」を予測するとします。入力1行には年齢や利用回数などのfeatureがあります。Decision Treeは、その値を上から順に条件判定し、最後に1つのleafへ到達させます。

<div class="model-architecture" aria-label="LightGBMで1サンプルがDecision Treeを通る模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">1行のfeatureを質問にかけ、最後のleaf scoreを受け取る</div><p class="model-architecture__subtitle">この例では age=28、visits=7 の1行をtreeへ通します。</p></div>
    <span class="model-architecture__badge">single sample path</span>
  </div>
  <p class="interactive-note">模式例。feature、threshold、leaf scoreは説明用の人工値です。</p>
  <div class="residual-architecture" style="grid-template-columns:repeat(5,minmax(0,1fr))">
    <div class="residual-node"><strong>Input row</strong><br>age=28<br>visits=7</div>
    <div class="residual-node"><strong>age &lt; 30?</strong><br>YES</div>
    <div class="residual-node"><strong>visits &lt; 5?</strong><br>NO</div>
    <div class="residual-node is-add"><strong>Leaf</strong><br>+0.18</div>
    <div class="residual-node"><strong>Tree output</strong><br>補正 +0.18</div>
  </div>
  <p class="model-architecture__caption">実際のtreeには他のbranchもありますが、1つのsampleが通るのはrootから1つのleafまでの1経路です。</p>
</div>

この**条件分岐 → leaf score**がGBDTの最小単位です。classificationでも、1本のtreeが直接「買う / 買わない」を返すとは限らず、最終scoreへ足す連続値を返します。

## LightGBM全体ではTreeを何本も足す {#boosting}

1本目のtreeだけで完璧に当てようとはしません。前までの予測でまだ外している部分を、次のtreeが少しずつ補正します。これを**Gradient Boosting**と呼びます。

<div class="model-architecture" aria-label="LightGBM全体で複数treeの補正値を加算する構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">同じ1行を複数Treeへ通し、補正値を順番に足す</div><p class="model-architecture__subtitle">Tree 1の予測にTree 2、Tree 3…の修正を追加し、最終scoreへ近づけます。</p></div><span class="model-architecture__badge">GBDT ensemble</span></div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Input row<br>x</span></div><span class="model-stage__label">同じsample</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 1<br>+0.18</span></div><span class="model-stage__label">最初の補正</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 2<br>−0.04</span></div><span class="model-stage__label">誤差を補正</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Tree 3…N<br>+ / −</span></div><span class="model-stage__label">Boost rounds</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Base + Σ tree scores</span></div><span class="model-stage__label">Final prediction</span></div>
  </div>
  <p class="model-architecture__caption">数値は模式例です。各treeは前までのmodelが残したlossを下げる方向へ追加されます。</p>
</div>

ここまでがGBDTとしての全体構造です。**LightGBMらしさは、各treeを高速に作る方法**にあります。

## Histogramでsplit候補を絞る {#histogram}

連続値featureをそのまま扱うと、split候補が非常に多くなります。LightGBMは値を離散的な**bin（区間）**へまとめ、各binにgradient / hessian統計を集約してsplit gainを評価します。候補数を減らせるため、split探索とmemory利用を効率化できます（[LightGBM Features](https://lightgbm.readthedocs.io/en/stable/Features.html)）。

<div class="model-architecture" aria-label="LightGBMのHistogram-based split探索">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">細かい連続値をbinへまとめ、bin境界で分ける候補を探す</div><p class="model-architecture__subtitle">「値を全部1個ずつ比較」する代わりに、近い値を同じ箱へまとめて探索します。</p></div>
    <span class="model-architecture__badge">histogram split</span>
  </div>
  <p class="interactive-note">棒の高さ・値は理解用の模式表現で、実測値ではありません。</p>
  <div class="model-stage-row" style="--model-cols:3">
    <div class="model-stage"><div class="model-op-box"><span><strong>Raw feature</strong><br>1.2, 1.4, 1.7, 2.1, 2.2, 3.8, …</span></div><span class="model-stage__label">細かい連続値</span></div>
    <div class="model-stage"><div class="histogram-split" aria-label="8個のhistogram bin"><span class="histogram-bin" style="--h:28"></span><span class="histogram-bin" style="--h:48"></span><span class="histogram-bin" style="--h:72"></span><span class="histogram-bin is-split" style="--h:88"></span><span class="histogram-bin" style="--h:64"></span><span class="histogram-bin" style="--h:44"></span><span class="histogram-bin" style="--h:31"></span><span class="histogram-bin" style="--h:18"></span></div><span class="model-stage__label">値をbinへ圧縮</span><span class="model-stage__note">緑の境界付近をsplit候補として評価</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Best split</strong><br>lossを最も減らす境界を選ぶ</span></div><span class="model-stage__label">Treeの質問になる</span></div>
  </div>
  <p class="model-architecture__caption">実際にはfeatureごとのhistogramからgainを計算し、最も良いfeature / thresholdを選びます。</p>
</div>

## Leaf-wiseにTreeを成長させる {#leaf-wise}

Treeには途中でまだ分割できる**leaf**が複数あります。LightGBMは、すべてのleafを同じ深さへ揃えるのではなく、**いま分けるとlossが最も下がるleafを優先してsplit**します。

<div class="model-architecture" aria-label="LightGBMのleaf-wise成長構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">改善が大きいbranchへ計算を集中する</div><p class="model-architecture__subtitle">左右を均等に深くせず、次に一番効くleafを選びます。</p></div><span class="model-architecture__badge">leaf-wise growth</span></div>
  <div class="tree-ensemble" style="grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) 52px minmax(150px,.9fr)">
    <section class="tree-card"><div class="tree-card__title">Step 1 · Root split</div><div class="mini-tree"><div class="tree-node is-root">Root</div><div class="tree-node is-left is-leaf">Leaf A<br>gain 0.12</div><div class="tree-node is-right is-leaf">Leaf B<br>gain 0.31</div></div></section>
    <section class="tree-card"><div class="tree-card__title">Step 2 · gain最大だけsplit</div><div class="mini-tree"><div class="tree-node is-root">Root</div><div class="tree-node is-left is-leaf">Leaf A<br>そのまま</div><div class="tree-node is-right">Leaf Bをsplit</div><div class="tree-node is-left is-leaf">B1</div><div class="tree-node is-right is-leaf">B2</div></div></section>
    <div class="tree-sum">≠</div><div class="boost-output">左右を均等に育てない<br>→ asymmetrical tree</div>
  </div>
  <p class="model-architecture__caption">gain値は模式値です。LightGBM公式も、leaf-wiseは同じleaf数でlossを下げやすい一方、小データではoverfittingしやすいと説明しています。</p>
</div>

このため`num_leaves`は表現力を強く左右します。`min_data_in_leaf`や`max_depth`と組み合わせて、一部branchが細かくなりすぎないよう制約します。

## 使う場面 {#use-cases}

- 数値・カテゴリ・欠損が混ざるtabular data。
- 数十万〜数百万行を高速に試したい。
- feature engineeringを高速に反復したい。
- Neural Networkと異なる誤差を持つensemble候補を作りたい。

## XGBoost/CatBoostとの比較 {#comparison}

<div class="comparison-board" aria-label="LightGBM XGBoost CatBoostの比較">
  <section class="comparison-card is-primary"><h4>LightGBM</h4><dl><dt>tree構築</dt><dd>Histogram + leaf-wise</dd><dt>直感</dt><dd>改善の大きいbranchを先に深くする</dd><dt>最初に見る</dt><dd><code>num_leaves</code>、leaf size</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/xgboost.html' | relative_url }}">XGBoost</a></h4><dl><dt>核</dt><dd>regularized tree boosting</dd><dt>直感</dt><dd>depth・sampling・正則化を細かく制御</dd><dt>最初に見る</dt><dd>depth、child weight</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/catboost.html' | relative_url }}">CatBoost</a></h4><dl><dt>核</dt><dd>ordered categorical processing</dd><dt>直感</dt><dd>categoryからtargetを使うときの自己参照を防ぐ</dd><dt>最初に見る</dt><dd>cat指定、iterations / depth</dd></dl></section>
</div>

優劣はdataset依存です。同じfoldでOOFを作り、単体scoreだけでなくerror diversityも比較します。

## Kaggleでの実例

30 Days of MLの1位解法ではLightGBM・XGBoost・CatBoost・HistGradientBoostingをLevel 1/2で組み合わせ、LightGBM単体も20 seeds平均しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Predicting Student Health Risk 2026の2位解法はLightGBM、XGBoost、CatBoost、FT-Transformer、RealMLPなど18 base predictorsをensembleし、LightGBMも主要tree componentとして含めています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### `num_leaves`を大きくしすぎる

leaf-wiseは局所的に深くなれるため、小データでは過学習しやすくなります。`min_data_in_leaf`, `max_depth`, feature/bagging fraction等とセットでCVします。

### categoryを雑に整数化する

カテゴリ値に偽の大小関係を与えるencodingは避け、native categoricalやleak-free encodingを比較します。

### 「高速だから常に最良」ではない

速さは探索量を増やす利点ですが、datasetによってXGBoost/CatBoost/NNが勝つことがあります。同じValidationで比較します。

### seedだけ変えて多様性が出ると思う

強いGBDT同士は予測相関が高くなりがちです。別feature setやNN等を混ぜる価値も測ります。

## Quick Reference

- 1行はfeature条件を通って1つのleaf scoreを受け取る。
- 複数treeの補正値を足すのがGradient Boosting。
- LightGBMは連続値をbinへまとめてHistogramでsplit探索する。
- tree内部はgain最大のleafを先に割るleaf-wise成長。
- `num_leaves`とleaf minimum sizeをセットで調整する。

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

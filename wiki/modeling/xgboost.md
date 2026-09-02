---
layout: default
title: XGBoost
summary: 正則化されたGradient Boosted Decision Treeを高性能に学習する、表形式Kaggleの定番モデル。
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

**XGBoostは、前のtreeの誤差を次のtreeで修正していくGradient Boosted Decision Tree（GBDT）の代表的実装です。**

表形式データの強力なbaselineで、tree depth、row/column sampling、L1/L2正則化などを細かく制御できます。`learning_rate`は各boosting stepの寄与を縮小し、`max_depth`を大きくすると表現力と過学習リスクがともに増えます（[XGBoost documentation](https://xgboost.readthedocs.io/en/stable/parameter.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">特徴</a>
  <a href="#parameters">主要Parameter</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 特徴 {#mechanism}

XGBoostはgradientだけでなく2階微分情報も使ってtreeのsplitやleaf weightを最適化し、objectiveへ正則化項を持ちます。実務上は、**depth・minimum child・sampling・learning rate・boosting rounds**のバランスが重要です。

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

XGBoost公式も、深いtreeはmodel complexityとoverfittingを増やし、learning rateは更新を保守的にすると説明しています（[documentation](https://xgboost.readthedocs.io/en/latest/r_docs/R-package/docs/reference/xgboost.html)）。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="XGBoostと他GBDTの使い分け">
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></h4><dl><dt>重視</dt><dd>高速なleaf-wise探索</dd><dt>特徴</dt><dd>histogram / native categorical</dd></dl></section>
  <section class="comparison-card"><h4><a href="{{ '/wiki/modeling/catboost.html' | relative_url }}">CatBoost</a></h4><dl><dt>重視</dt><dd>categorical処理を減らす</dd><dt>特徴</dt><dd>ordered boosting</dd></dl></section>
  <section class="comparison-card is-primary"><h4>XGBoost</h4><dl><dt>重視</dt><dd>robustなGBDT baseline</dd><dt>特徴</dt><dd>正則化・samplingを細かく制御</dd></dl></section>
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

## Quick Reference {#quick-reference}

- tabularの強いbaseline。
- depthと`min_child_weight`を対で見る。
- row/feature samplingで正則化と多様性を作る。
- Early Stoppingを使う。
- OOFを保存してLightGBM/CatBoostとも比較する。

## 関連項目

- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }})
- [Early Stopping]({{ '/wiki/training/early-stopping.html' | relative_url }})
- [Fold / Seed Ensemble]({{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }})

## 参考文献

1. [XGBoost, “XGBoost Parameters”](https://xgboost.readthedocs.io/en/stable/parameter.html)
2. [XGBoost, “Fit XGBoost Model”](https://xgboost.readthedocs.io/en/latest/r_docs/R-package/docs/reference/xgboost.html)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “March Machine Learning Mania 2026: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)
5. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)

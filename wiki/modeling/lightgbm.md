---
layout: default
title: LightGBM
summary: Histogramとleaf-wise成長で高速に学習でき、表形式Kaggleで強力なGradient Boosted Decision Tree実装。
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

**LightGBMは、Decision Treeを順番に追加して前の誤差を修正するGradient Boosted Decision Tree（GBDT）の高速実装です。**

表形式データで強く、欠損・非線形関係・特徴間interactionを扱いやすいのが特徴です。Histogram-based splitとleaf-wise tree growthにより高速ですが、小データでは深いleafが過学習しやすいため制約が重要です（[LightGBM Features](https://lightgbm.readthedocs.io/en/stable/Features.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">特徴</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">XGBoost/CatBoostとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 特徴 {#mechanism}

LightGBMは連続値をbinへまとめるHistogram方式を使い、split探索を高速化します。またlevelごとではなく、最もlossを減らすleafを優先して分割する**leaf-wise**成長を使います（[公式](https://lightgbm.readthedocs.io/en/stable/Features.html)）。

このため同じleaf数なら強い表現力を持ちますが、`num_leaves`や`min_data_in_leaf`が緩すぎると細かい局所パターンへfitしやすくなります。

## 使う場面 {#use-cases}

- 数値・カテゴリ・欠損が混ざるtabular。
- 数十万〜数百万行を高速に試したい。
- feature engineeringを高速に反復したい。
- Neural Networkの補完モデルを作りたい。

## XGBoost/CatBoostとの比較 {#comparison}

| Model | 強み | 最初に意識する点 |
|---|---|---|
| **LightGBM** | 高速、leaf-wise、native categorical | `num_leaves`, leaf size |
| [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }}) | robustな正則化、成熟した実装 | depth, child weight, sampling |
| [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }}) | categorical処理、ordered boosting | cat指定、iterations/depth |

優劣はdataset依存です。同じfoldでOOFを作り、単体だけでなくerror diversityも比較します。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではLightGBM・XGBoost・CatBoost・HistGradientBoostingをLevel 1/2で組み合わせ、LightGBM単体も20 seeds平均しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Predicting Student Health Risk 2026の2位解法はLightGBM、XGBoost、CatBoost、FT-Transformer、RealMLPなど18 base predictorsをensembleし、LightGBMも主要tree componentとして含めています（[2nd Place Solution](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)）。

## 注意点 {#pitfalls}

### `num_leaves`を大きくしすぎる

leaf-wiseは局所的に深くなれるため、小データでは過学習しやすくなります。`min_data_in_leaf`, `max_depth`, feature/bagging fraction等とセットでCVします。

### categoryを雑に整数化する

カテゴリ値に偽の大小関係を与えるencodingは避け、native categoricalやleak-free encodingを比較します。

### seedだけ変えて多様性が出ると思う

強いGBDT同士は予測相関が高くなりがちです。別feature setやNN等を混ぜる価値も測ります。

## Quick Reference {#quick-reference}

- tabular baselineの第一候補。
- `num_leaves`とleaf minimum sizeをセットで調整。
- Early Stoppingを使う。
- categorical処理はOOFで比較する。
- OOF保存とfold/seed ensembleを前提に設計する。

## 関連項目

- [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }})
- [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }})
- [Early Stopping]({{ '/wiki/training/early-stopping.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})

## 参考文献

1. [LightGBM, “Features”](https://lightgbm.readthedocs.io/en/stable/Features.html)
2. [LightGBM, “Parameters”](https://lightgbm.readthedocs.io/en/stable/Parameters.html)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)
5. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)

---
layout: default
title: Fold / Seed Ensemble
summary: CV foldやrandom seedを変えて学習した同系統モデルを平均し、学習の偶然性による予測分散を減らすEnsemble。
type: reference
domain: kaggle
topic: fold-seed-ensemble
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - ensemble
  - seed
  - cross-validation
---

# Fold / Seed Ensemble

**Fold / Seed Ensembleは、異なるfoldやrandom seedで学習した同じ系統のモデルを平均し、学習の偶然性による予測の揺れを減らす方法です。**

新しいarchitectureを作らなくても安定性を上げられるため、Kaggleの最終推論で頻繁に使われます。ただし、同質モデルを増やすほど改善幅は逓減します。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#types">2種類</a>
  <a href="#mechanism">なぜ効くか</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 2種類 {#types}

### Fold Ensemble

K-fold CVで得たK個のモデルをすべてtest推論に使い、平均します。各モデルは異なるTrain subsetを見ているため分散が生まれます。

### Seed Ensemble

splitやhyperparameterは同じまま、weight initialization、row/feature sampling等のrandom seedだけを変えます。

## なぜ効くか {#mechanism}

各モデルの誤差が完全には一致しないなら、平均でrandom componentが相殺されます。

$$
\hat y = \frac{1}{M}\sum_{m=1}^{M}\hat y_m
$$

ただしerror correlationがほぼ1なら、モデル数を増やしてもほとんど変わりません。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではXGBoostを3種類のhyperparameter × 20 seedsで計60モデル平均し、単一設定でも20 seeds平均を使っています。XGBoostのCV RMSEは0.71629→0.71594へ改善したと報告しています。またLightGBMでも20 seeds平均を採用しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Open Problems - Multimodal Single-Cell Integrationの1位解法では5-fold予測の平均に加え、seedを変えたモデルもweighted ensembleへ含めています（[1st Place Solution Summary](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)）。

Predicting Student Health Risk 2026の分析ではLightGBM/XGBoost/CatBoost/HGBCが98.6〜99.5%の最終classで一致し、同質なtree seedを増やすだけでは新しいdecision boundaryが増えにくいと報告されています（[Writeup](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)）。

## 注意点 {#pitfalls}

### 数を増やせば必ず良いわけではない

seed 5→10→20のOOF改善を記録し、限界効用を見ます。推論コストが倍でも改善がnoise以下なら止めます。

### test平均とOOF評価の不一致

Fold ensembleのtestはKモデル平均ですが、通常のOOFは各行1モデル予測です。必要に応じてrepeated CVなどでvarianceを追加評価します。

### 多様性と弱さを混同する

弱いモデルが違う予測をするだけでは価値がありません。**競争力のある精度 + 補完的な誤差**が必要です。

## Quick Reference {#quick-reference}

- CVで学習したfoldモデルは捨てずにtest平均へ使う。
- seed追加の改善曲線を見る。
- error/prediction correlationを確認する。
- 同系統だけでなく異系統モデルとのblendも比較する。
- 推論budgetとの費用対効果で本数を決める。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
2. [Kaggle, “Open Problems - Multimodal Single-Cell Integration: 1st Place Solution Summary”, 2022](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)
3. [Kaggle, “Predicting Student Health Risk: Why shouldn't you even consider using LB probing”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)
4. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)

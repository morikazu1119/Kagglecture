---
layout: default
title: Hill Climbing Ensemble
description: OOF Metricが最も改善する予測を1本ずつ追加し、候補model群から小さく強いblendを貪欲に選ぶ方法。
summary: 多数のOOF候補からMetric改善量を基準にmodelを逐次追加するgreedy ensemble selection。
type: reference
domain: kaggle
topic: hill-climbing
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - ensemble
  - hill-climbing
  - oof
---

# Hill Climbing Ensemble

**Hill Climbing Ensembleは、多数の候補予測から「現在のblendへ追加したときOOF Metricが最も改善するモデル」を1本ずつ選ぶgreedyなEnsemble Selectionです。**

単体scoreだけで上位modelを平均するより、既存blendと補完的なpredictionを自動で拾いやすくなります。数十〜数百OOFを作るtabular competitionで特に有効です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#algorithm">アルゴリズム</a>
  <a href="#why">なぜ効くか</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## アルゴリズム {#algorithm}

基本形は次です。

1. 全候補のOOF predictionを揃える。
2. best single modelから開始する。
3. 各候補を一時的にblendへ追加してMetricを計算する。
4. 最も改善する候補を採用する。
5. 改善が止まるか、設定本数に達するまで繰り返す。

同じモデルを複数回選択可能にすると、選択回数が暗黙のweightになります。

## なぜ効くか {#why}

強いmodel同士でもpredictionがほぼ同じなら追加価値は小さく、少し弱くても既存blendが外すsampleを当てるmodelには価値があります。Hill Climbingはこの**marginal contribution**をCompetition Metricで直接評価します。

## Kaggleでの実例 {#kaggle-examples}

Playground Series S4E8の1位解法では72 OOFを含む多数候補にHill Climbingを使い、60 model超では2時間以上かかる規模までensemble探索しています。AutoGluonへ渡すOOFを8本へ絞る用途にもHill Climbingを使っています（[1st Place Solution](https://www.kaggle.com/competitions/playground-series-s4e8/writeups/optimistix-1st-place-solution-72-oofs-a-whole-lott)）。

30 Days of MLの1位解法ではLevel 2 modelを最終的にforward selectionでweighted ensembleし、CV RMSE 0.715437、Private 0.71533の最終solutionを構築しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Playground Series S6E3の1位解法も大規模model poolにGPU Hill Climbingを含むKGMON Playbookで候補選択を行っています（[1st Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/1st-place-gpt5-4-gemini3-1-claudeopus4-6-kgm)）。

## 注意点 {#pitfalls}

### OOFへの過適合

候補が数千本あると、greedy selection自体がOOF noiseを拾います。model familyごとの制限、outer holdout、複数seed/foldで再現性を確認します。

### ほぼduplicate予測を大量投入

計算量だけ増えます。prediction correlationやmodel metadataで事前にdeduplicateします。

### Test prediction alignment

OOFで選んだmodel IDとtest predictionの列順・前処理を完全に一致させます。

## Quick Reference {#quick-reference}

- 全候補のOOFを同一row順で保存する。
- best singleからgreedyに追加する。
- selection回数をweightとして扱える。
- prediction correlationで候補を整理する。
- 大規模探索ではOOF overfittingを監視する。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Playground Series S4E8: 1st Place Solution”, 2024](https://www.kaggle.com/competitions/playground-series-s4e8/writeups/optimistix-1st-place-solution-72-oofs-a-whole-lott)
2. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
3. [Kaggle, “Playground Series S6E3: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/1st-place-gpt5-4-gemini3-1-claudeopus4-6-kgm)
4. [Caruana et al., “Ensemble Selection from Libraries of Models”, 2004](https://www.cs.cornell.edu/~caruana/ctp/ct.papers/caruana.icml04.icdm06long.pdf)

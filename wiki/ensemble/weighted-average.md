---
layout: default
title: Weighted Average
summary: 複数モデルの予測をCVで決めた重み付き平均で統合し、単一モデルの誤差や分散を減らすEnsemble。
type: reference
domain: kaggle
topic: weighted-average
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - ensemble
  - blending
---

# Weighted Average

**Weighted Averageは、複数モデルの予測に重みを付けて平均するEnsembleです。**

強いモデルを大きく、補完的なモデルを適度に混ぜることで、単一モデルの誤差やseed依存を減らせます。Kaggleでは実装が単純で壊れにくく、最終提出の定番です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#use-cases">使う場面</a>
  <a href="#weight-selection">重みの決め方</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

2モデルなら、予測`p1`, `p2`と重み`w`を使って次のように作ります。

$$
p = w p_1 + (1-w)p_2
$$

重要なのは、**単体スコアだけでなく予測誤差の違い**です。ほぼ同じ予測をする2モデルより、少し弱くても失敗箇所が異なるモデルを混ぜた方が改善することがあります。

下の模式OOFではModel A/Bの重みを動かせます。重みを変えるとrowごとの補完関係と全体RMSEが同時に変わります。

<div class="interactive-viz" data-interactive="blend-weight">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">Model A / Bのblend weightを動かす</div>
      <p class="interactive-viz__subtitle">単体性能だけでなく、どのsampleで誤差を補い合うかを見るのがEnsembleの要点です。</p>
    </div>
    <span class="interactive-status" data-blend-status data-state="safe">A 50% / B 50%</span>
  </div>
  <p class="interactive-note">模式例。target・予測・RMSEは理解用の人工データです。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Aの重み</span>
    <label class="interactive-range">
      <input type="range" min="0" max="100" step="5" value="50" data-blend-weight aria-label="Model Aのblend weight">
      <span class="interactive-range-labels"><span>0%（Bのみ）</span><span>100%（Aのみ）</span></span>
    </label>
  </div>
  <div class="metric-grid">
    <div class="metric-card"><span>Blend RMSE</span><strong data-blend-rmse>0.000</strong></div>
    <div class="metric-card"><span>Model A</span><strong>weight = w</strong></div>
    <div class="metric-card"><span>Model B</span><strong>weight = 1-w</strong></div>
  </div>
  <div class="interactive-list" data-blend-rows></div>
  <p class="interactive-explanation" data-blend-explanation aria-live="polite">重みは同じfoldのOOF予測で決めます。</p>
  <noscript><p class="interactive-explanation">Weighted Averageの重みはPublic LBではなく、同じValidation splitのOOF予測で比較して決めます。</p></noscript>
</div>

## 使う場面 {#use-cases}

| 状況 | Weighted Average |
|---|---|
| 強いモデルが2〜10本程度ある | 向いている |
| seed違いを安定化したい | 向いている |
| 異なるGBDT/NN/Transformerを混ぜたい | 向いている |
| 予測スケールが大きく違う | Rank Averageや変換を検討 |
| 2段目モデルで非線形に組み合わせたい | Stackingを検討 |

## 重みの決め方 {#weight-selection}

原則は**OOF予測だけで決めます**。

1. 各モデルの同じfold構成のOOFを保存する。
2. Competition Metricでblendを評価する。
3. 単純平均を基準にする。
4. 少数の候補重みを比較するか、制約付き最適化を使う。
5. Public LBだけで重みを微調整しない。

重み探索を細かくしすぎると、OOFノイズへの過適合になります。差が小さいなら等重みの方が再現性が高いことがあります。

## Kaggleでの実例 {#kaggle-examples}

Open Problems - Multimodal Single-Cell Integrationの1位解法では、seed違いや一部batchだけでfine-tuneしたモデルを**weighted average**しています。Validationはdonorとdayでgroup化した5-foldでした（[1st Place Solution Summary](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)）。

30 Days of MLの1位解法では、2段目のXGBoost・Ridge・LightGBM・CatBoostをforward selectionで重み付けし、最終CV RMSE 0.715437、Private LB 0.71533を報告しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Grupo Bimbo Inventory Demandの1位解法も、2つのsecond-level modelを最終的にweighted averageしています（[1st Place Solution](https://www.kaggle.com/competitions/grupo-bimbo-inventory-demand/writeups/the-slippery-appraisals-1-place-solution-of-the-sl)）。

## 注意点 {#pitfalls}

### Public LBで重みを選ぶ

提出を繰り返して`0.42/0.58`のような重みを探すとPublic sliceへ過適合します。重み選択もモデル選択と同じくOOFで行います。

### OOFのfoldが揃っていない

異なるsplitのOOFをそのまま横比較すると、サンプルごとの学習条件が揃いません。可能なら共通foldを使います。

### 同質モデルを大量に混ぜる

同じ特徴・同じarchitecture・同じseed近傍だけを増やしても多様性は増えません。誤差相関を確認します。

## Quick Reference {#quick-reference}

- 最初は等重み平均を基準にする。
- 重みはOOFで決める。
- 単体性能だけでなく予測の多様性を見る。
- 探索自由度を増やしすぎない。
- 最終testでは各fold/seedの推論方法もOOF設計と対応させる。

## 関連項目

- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [Rank Averaging]({{ '/wiki/ensemble/rank-averaging.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Open Problems - Multimodal Single-Cell Integration: 1st Place Solution Summary”, Shuji Suzuki, 2022](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)
2. [Kaggle, “30 Days of ML: 1st Place Solution”, HungNT, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
3. [Kaggle, “Grupo Bimbo Inventory Demand: #1 Place Solution of The Slippery Appraisals team”, 2016](https://www.kaggle.com/competitions/grupo-bimbo-inventory-demand/writeups/the-slippery-appraisals-1-place-solution-of-the-sl)
4. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)

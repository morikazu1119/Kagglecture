---
layout: default
title: Focal Loss
description: Cross Entropyのeasy sampleへの寄与を下げ、hard exampleへ学習を集中させるLoss。
summary: 正しく分類できているsampleのlossを抑え、class imbalanceや大量のeasy negative下でhard sampleを重視する。
type: reference
domain: kaggle
topic: focal-loss
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - training
  - loss
  - imbalance
---

# Focal Loss

**Focal Lossは、Cross Entropyへ「簡単に正解できているsampleほど重みを小さくする係数」を掛け、hard exampleへ学習を集中させるLossです。**

大量のeasy negativeがlossを支配するdense object detection向けに提案されました（[Focal Loss paper](https://arxiv.org/abs/1708.02002)）。classificationやsegmentationでも不均衡対策候補として使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#formula">数式</a>
  <a href="#effect">何が変わるか</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず直感 {#intuition}

通常のCross Entropyでは、easy sampleもhard sampleもlossへ寄与します。Focal Lossでは、正解classへの予測確率$p_t$が高いeasy sampleほど$(1-p_t)^\gamma$が小さくなり、lossの重みが急速に下がります。

<div class="model-architecture" aria-label="Focal Lossでeasy sampleの重みが下がる模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">γ=2なら、confidenceが高いeasy sampleほどほぼ無視される</div><p class="model-architecture__subtitle">下はfocal factor $(1-p_t)^2$だけを比較しています。lossそのものの実測値ではありません。</p></div>
    <span class="model-architecture__badge">focal factor</span>
  </div>
  <div class="html-bar-chart" aria-label="p_tごとのfocal factor">
    <div class="html-bar-row"><span class="html-bar-label">Easy · pₜ=0.95</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:0.25"></span></span><span class="html-bar-value">0.0025</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Mostly correct · pₜ=0.70</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:9"></span></span><span class="html-bar-value">0.09</span></div>
    <div class="html-bar-row is-highlight"><span class="html-bar-label">Hard · pₜ=0.20</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:64"></span></span><span class="html-bar-value">0.64</span></div>
  </div>
  <p class="model-architecture__caption">同じγ=2でも、pₜ=0.95のsampleは係数0.0025、pₜ=0.20のhard sampleは0.64です。つまりhard sampleの相対的重要度が大きくなります。</p>
</div>

この仕組みは「少数classだから直接重くする」のとは少し違います。**現在のmodelが簡単に正解しているかどうか**で重みを変えるのがFocal Lossの特徴です。

## 数式 {#formula}

正解classに割り当てた確率を$p_t$とすると、基本形は次です。

$$
FL(p_t)=-(1-p_t)^\gamma\log(p_t)
$$

ここで$-\log(p_t)$が通常のCross Entropy部分、$(1-p_t)^\gamma$がeasy sampleを抑えるfocal factorです。

- $\gamma=0$: focal factorは1になり、通常のCross Entropyに近い。
- $\gamma$を大きくする: 高confidenceで正解しているsampleの寄与をさらに強く落とす。
- $\alpha$を併用する形: class imbalance自体へのclass weightingも追加できる。

## 学習時に何が変わるか {#effect}

<div class="model-architecture" aria-label="Focal Lossの学習プロセス">
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor is-wide"><span>Model prediction<br>pₜ</span></div><span class="model-stage__label">confidence</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Focal factor</strong><br>(1−pₜ)^γ</span></div><span class="model-stage__label">easyを抑制</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Cross Entropy</strong><br>−log(pₜ)</span></div><span class="model-stage__label">base loss</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Weighted loss<br>hard sample中心</span></div><span class="model-stage__label">backprop</span></div>
  </div>
</div>

結果として、easy negativeを大量に学習し続ける影響を減らし、misclassified / low-confidence sampleの相対的なgradient寄与を上げます。

ただしhard sampleには**本当に難しいsampleだけでなくlabel noiseも含まれる**点が重要です。誤annotationを強調すると逆効果になります。

## Kaggleでの実例 {#kaggle-examples}

HuBMAP - Hacking the Kidney 2023の1位解法では`1.0 focal + 1.0 dice + 0.01 boundary + custom loss`を組み合わせています（[1st Place Solution](https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated)）。

iMaterialist Fashion 2020の1位解法ではMask R-CNNに追加したattribute classification headへFocal Lossを使っています（[1st place solution](https://www.kaggle.com/competitions/imaterialist-fashion-2020-fgvc7/writeups/oleg-polosin-1st-place-solution)）。

一方BirdCLEF 2024の1位チームはCrossEntropyを採用し、task-specificな単純構成を重視しています（[1st place solution](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)）。**不均衡だからFocal Lossを自動採用するのではなく、CE/BCE + class weight等と比較します。**

## 注意点 {#pitfalls}

### Noisy labelを強調する

いつまでも間違えるsampleがannotation errorなら、そこへ強く学習して過学習します。

### `gamma`を上げすぎる

easy sampleのgradientがほぼ消え、学習が不安定になる場合があります。2前後を固定神話にせずCVします。

### MetricとLossは別

F1/Dice/AUCなどCompetition Metricに直接一致するわけではありません。Loss変更はOOF Metricで判断します。

## Quick Reference {#quick-reference}

- focal factorは$(1-p_t)^\gamma$。
- confidenceが高いeasy sampleほど重みが小さくなる。
- `gamma=0`はCEに近い。
- hard sampleを重視するためlabel noiseに弱くなることがある。
- BCE/CE + weightやsamplingと同じOOFで比較する。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [Dice / IoU]({{ '/wiki/metrics/dice-iou.html' | relative_url }})

## 参考文献

1. [Lin et al., “Focal Loss for Dense Object Detection”, 2017](https://arxiv.org/abs/1708.02002)
2. [Kaggle, “HuBMAP - Hacking the Kidney 2023: 1st Place Solution”, 2023](https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated)
3. [Kaggle, “iMaterialist Fashion 2020: 1st place solution”, 2021](https://www.kaggle.com/competitions/imaterialist-fashion-2020-fgvc7/writeups/oleg-polosin-1st-place-solution)
4. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)

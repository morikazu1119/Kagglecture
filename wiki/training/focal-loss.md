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

**Focal Lossは、Cross Entropyに「簡単に正解できているsampleの重みを下げる係数」を加え、hard exampleへ学習を集中させるLossです。**

大量のeasy negativeがlossを支配するdense object detection向けに提案されました（[Focal Loss paper](https://arxiv.org/abs/1708.02002)）。classificationやsegmentationでも不均衡対策候補として使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#effect">何が変わるか</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

正解classに割り当てた確率を$p_t$とすると、基本形は次です。

$$
FL(p_t)=-(1-p_t)^\gamma\log(p_t)
$$

$\gamma=0$なら通常のCross Entropyに近く、$\gamma$を大きくすると高confidenceで正解しているsampleの寄与が急速に小さくなります。class weight用の$\alpha$を併用する形も一般的です。

## 何が変わるか {#effect}

- easy negativeを大量に学習し続ける影響を減らす。
- hard/misclassified sampleの相対的な寄与を上げる。
- class imbalanceを**件数再配分ではなくloss weighting側**から扱える。

ただしhard sampleにはlabel noiseも含まれます。Focal Lossが常に不均衡問題の正解とは限りません。

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

- easy sampleのlossを抑えてhard sampleを重視する。
- `gamma=0`はCEに近い。
- class imbalance候補だが万能ではない。
- label noiseが多いと逆効果になり得る。
- BCE/CE + weightやsamplingと同じOOFで比較する。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [Dice / IoU]({{ '/wiki/metrics/dice-iou.html' | relative_url }})

## 参考文献

1. [Lin et al., “Focal Loss for Dense Object Detection”, 2017](https://arxiv.org/abs/1708.02002)
2. [Kaggle, “HuBMAP - Hacking the Kidney 2023: 1st Place Solution”, 2023](https://www.kaggle.com/competitions/blood-vessel-segmentation/writeups/clevert-1st-place-solution-code-updated)
3. [Kaggle, “iMaterialist Fashion 2020: 1st place solution”, 2021](https://www.kaggle.com/competitions/imaterialist-fashion-2020-fgvc7/writeups/oleg-polosin-1st-place-solution)
4. [Kaggle, “BirdCLEF 2024: 1st place solution”, 2024](https://www.kaggle.com/competitions/birdclef-2024/writeups/team-kefir-1st-place-solution)

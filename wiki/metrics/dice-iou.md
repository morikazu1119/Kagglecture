---
layout: default
title: Dice / IoU
description: Segmentationで予測maskと正解maskの重なりを測る代表的な評価指標。
summary: Diceは重なりを2倍して総面積で割り、IoUはIntersectionをUnionで割るSegmentation指標。
type: reference
domain: kaggle
topic: dice-iou
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - segmentation
  - dice
  - iou
---

# Dice / IoU

**DiceとIoU（Jaccard Index）は、Segmentationで予測maskと正解maskがどれだけ重なっているかを測る代表指標です。**

背景pixelが圧倒的に多い画像ではAccuracyが高くなりすぎるため、foregroundの重なりを直接測るDice/IoUが使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#relation">DiceとIoUの関係</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

正解maskを$A$、予測maskを$B$とすると、

$$
Dice = \frac{2|A \cap B|}{|A|+|B|}
$$

$$
IoU = \frac{|A \cap B|}{|A \cup B|}
$$

IoUはJaccard similarity coefficientとも呼ばれ、scikit-learnも「intersection / union」と定義しています（[jaccard_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.jaccard_score.html)）。

予測maskを左右へ動かし、重なりが減るとDice/IoUがどう下がるかを模式図で確認できます。

<div class="interactive-viz" data-interactive="dice-iou-overlap">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">予測maskをずらしてOverlapを比較</div>
      <p class="interactive-viz__subtitle">正解のみ、予測のみ、重なりを5×5 gridで表示します。</p>
    </div>
    <span class="interactive-status" data-mask-status data-state="safe">shift 0</span>
  </div>
  <p class="interactive-note">模式例。実画像・Competition maskではありません。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">横方向shift</span>
    <label class="interactive-range">
      <input type="range" min="-2" max="2" step="1" value="0" data-mask-shift aria-label="予測maskの横方向shift">
      <span class="interactive-range-labels"><span>-2</span><span>0</span><span>+2</span></span>
    </label>
  </div>
  <div class="mask-layout">
    <div class="mask-grid" data-mask-grid aria-label="正解maskと予測maskの重なり"></div>
    <div>
      <div class="metric-grid">
        <div class="metric-card"><span>Dice</span><strong data-mask-dice>1.00</strong></div>
        <div class="metric-card"><span>IoU</span><strong data-mask-iou>1.00</strong></div>
        <div class="metric-card"><span>最良</span><strong>1.00</strong></div>
      </div>
      <div class="mask-legend">
        <span><i class="is-ground-truth"></i>正解maskのみ</span>
        <span><i class="is-prediction"></i>予測maskのみ</span>
        <span><i class="is-both"></i>重なり</span>
      </div>
    </div>
  </div>
  <p class="interactive-explanation" data-mask-explanation aria-live="polite">予測maskをずらすとIntersectionが減り、DiceとIoUの両方が下がります。</p>
  <noscript><p class="interactive-explanation">DiceとIoUは予測maskと正解maskの重なりを測り、完全一致なら1です。</p></noscript>
</div>

## DiceとIoUの関係 {#relation}

同じbinary maskなら単調な変換関係があります。

$$
Dice = \frac{2IoU}{1+IoU}
$$

$$
IoU = \frac{Dice}{2-Dice}
$$

したがって単一sampleの順位関係は似ますが、**sampleごとに計算して平均する場合は平均Diceと平均IoUを単純変換できません**。

## Kaggleでの実例 {#kaggle-examples}

Severstal Steel Defect Detectionの1位解法ではU-Net/FPNのsegmentation modelをBCEや`0.75 BCE + 0.25 Dice`で学習し、pixel thresholdとcomponent removalまで最終Pipelineに含めています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。

26-shinnen-3Dpathologyの1位解法ではDice + BCEをlossとして使い、GroupKFoldで3D crop単位のLeakageを防ぎながらsegmentationを評価しています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。

## 注意点 {#pitfalls}

### Empty mask

正解も予測も空の場合を1とするか、0とするか、評価対象から除くかでscoreが変わります。Competition実装を確認します。

### Threshold依存

Probability maskをbinary maskへ変えるthresholdでDice/IoUは大きく変わります。OOFでthresholdを選びます。

### Macro / Micro

画像ごと・classごと・全pixelまとめて計算するかで値が変わります。公式Evaluation codeをローカルに再実装します。

### LossとMetricは同じとは限らない

Soft Dice Lossは連続確率で微分可能にした学習用近似です。Competitionのhard-mask Diceと完全同一ではありません。

## Quick Reference {#quick-reference}

- Dice/IoUはforeground overlapを見る。
- IoU = intersection / union。
- DiceはIoUより数値が高く見えやすい。
- Empty maskとaveraging定義を確認する。
- threshold/post-processingもOOFで最適化する。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [Data Augmentation]({{ '/wiki/training/data-augmentation.html' | relative_url }})
- [Post-processing]({{ '/wiki/advanced-methods/post-processing.html' | relative_url }})

## 参考文献

1. [scikit-learn, “jaccard_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.jaccard_score.html)
2. [scikit-learn, “Jaccard similarity coefficient score”](https://scikit-learn.org/stable/modules/model_evaluation.html#jaccard-similarity-coefficient-score)
3. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
4. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)

---
layout: default
title: Post-processing
description: Modelのraw predictionへthreshold、制約、smoothing、component除去などを適用し、Metricとtask構造へ合わせる最終処理。
summary: 学習済み予測をOOFで検証したruleやconstraintで変換し、Competition Metricに適した提出へ整える。
type: reference
domain: kaggle
topic: post-processing
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - advanced-methods
  - post-processing
  - inference
---

# Post-processing

**Post-processingは、モデルのraw predictionにthreshold、smoothing、rule、constraint、connected component処理などを加え、最終submissionへ変換する工程です。**

モデルを再学習せず改善できる一方、Leaderboardを見ながらruleを増やすと簡単にoverfitします。**原則はOOF/Validation上で決める**ことです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#patterns">代表パターン</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#validation">検証方法</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 代表パターン {#patterns}

| Task | Post-processing例 |
|---|---|
| Classification | threshold、class multiplier、prior correction |
| Segmentation | pixel threshold、small component removal、morphology |
| Time series | clipping、smoothing、monotonic constraint |
| Structured prediction | assignment、taxonomy、known impossible class除外 |
| Probability metric | calibration、極端値clipping |

## Kaggleでの実例 {#kaggle-examples}

Severstal Steel Defect Detectionの1位解法ではclass別pixel thresholdに加え、mask総pixel数が小さい場合の全mask削除と、150 pixel未満のconnected component除去を使っています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。

Vesuvius Challenge - Ink Detectionの1位解法ではconnected componentsで小さなspeckle/noiseを除去し、local validationでthresholdとcleanup量を検証しています（[1st place solution](https://www.kaggle.com/competitions/vesuvius-challenge-ink-detection/writeups/ryches-1st-place-solution)）。

Recursion Cellular Image Classificationの1位解法ではplate上に存在不可能なclassを除外し、Linear Sum Assignmentを適用するtask-specific constraintを使っています（[1st Place Solution](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)）。

NeurIPS Open Polymer Prediction 2025の1位解法ではdistribution shiftへ対応するpost-processingでensemble scoreがPublic 0.058→0.054、Private 0.089→0.075と改善しています（[1st Place Solution](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)）。

## 検証方法 {#validation}

1. raw OOFを保存する。
2. ruleをOOFだけでfit/tuneする。
3. fold別改善を確認する。
4. improvementが少数foldだけなら原因を調べる。
5. testへ同一ruleを一度適用する。

特にclass multiplierやthresholdは探索自由度が高いため、細かくチューニングしすぎるとOOFにも過適合します。

## 注意点 {#pitfalls}

### Public LB rule

「このclassだけ0.83倍」のようなruleをsubmission結果から足すとPublic slice専用になります。task knowledgeかOOF根拠を要求します。

### Hard constraintの誤り

本番で例外が起こり得る制約をhardにすると、そのsampleを必ず外します。確実な制約とsoft priorを区別します。

### Metric再現不足

Post-processingはMetric直前の処理なので、公式score計算をローカルで完全再現していないと判断できません。

## Quick Reference {#quick-reference}

- raw OOFを必ず保存する。
- threshold/ruleはOOFで決める。
- task構造に根拠がある処理を優先する。
- rule追加ごとにablationする。
- Public LBから細かいruleを逆算しない。

## 関連項目

- [Probability Calibration]({{ '/wiki/advanced-methods/probability-calibration.html' | relative_url }})
- [Dice / IoU]({{ '/wiki/metrics/dice-iou.html' | relative_url }})
- [CV vs Leaderboard]({{ '/wiki/competition-strategy/cv-vs-leaderboard.html' | relative_url }})

## 参考文献

1. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
2. [Kaggle, “Vesuvius Challenge - Ink Detection: 1st place solution”](https://www.kaggle.com/competitions/vesuvius-challenge-ink-detection/writeups/ryches-1st-place-solution)
3. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)
4. [Kaggle, “NeurIPS Open Polymer Prediction 2025: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)
5. [Kaggle, “BirdCLEF 2026: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/1st-place-solution-noisy-student-meets-distillati)

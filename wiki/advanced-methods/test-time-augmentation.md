---
layout: default
title: Test-Time Augmentation
summary: 推論時に入力へ複数の妥当な変換を加えて予測を平均し、変換に対する予測の揺れを減らす推論手法。
type: reference
domain: kaggle
topic: test-time-augmentation
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - advanced-methods
  - tta
  - inference
---

# Test-Time Augmentation

**Test-Time Augmentation（TTA）は、同じTest sampleを複数の妥当な形へ変換して推論し、その予測を平均する方法です。**

画像ならflip/crop/rotation、テキストなら意味を保つ変換などを使い、1回の推論で生じる変換依存の揺れを減らします。Training augmentationと違い、**学習済みモデルを変えず推論側で行う**のが基本です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#use-cases">使う場面</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

TTAは「どの変換を平均へ含めるか」と「その変換がtaskの意味を保つか」が本質です。下の模式例ではTTA構成を切り替え、平均予測と危険な変換を確認できます。

<div class="interactive-viz" data-interactive="tta-average">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">TTA構成と平均予測</div>
      <p class="interactive-viz__subtitle">妥当な変換だけを選び、複数predictionを同じ出力空間で平均します。</p>
    </div>
    <span class="interactive-status" data-tta-status data-state="safe">3 predictionを平均</span>
  </div>
  <p class="interactive-note">模式例。表示するpredictionは理解用の人工値です。</p>
  <div class="interactive-controls">
    <div class="interactive-control-row" role="group" aria-label="Taskの性質">
      <span class="interactive-control-label">Task</span>
      <button type="button" class="interactive-button is-active" data-tta-task="invariant" aria-pressed="true">左右反転しても意味が同じ</button>
      <button type="button" class="interactive-button" data-tta-task="directional" aria-pressed="false">左右・上下に意味がある</button>
    </div>
    <div class="interactive-control-row">
      <span class="interactive-control-label">Transforms</span>
      <label class="interactive-check"><input type="checkbox" value="original" data-tta-transform checked> Original</label>
      <label class="interactive-check"><input type="checkbox" value="hflip" data-tta-transform checked> HFlip</label>
      <label class="interactive-check"><input type="checkbox" value="vflip" data-tta-transform checked> VFlip</label>
      <label class="interactive-check"><input type="checkbox" value="rotate" data-tta-transform> Rotate90</label>
    </div>
  </div>
  <div class="metric-grid">
    <div class="metric-card"><span>平均prediction</span><strong data-tta-mean>0.707</strong></div>
    <div class="metric-card"><span>Segmentation</span><strong>逆変換して平均</strong></div>
    <div class="metric-card"><span>Classification</span><strong>prob/logitを平均</strong></div>
  </div>
  <div class="interactive-list" data-tta-rows></div>
  <p class="interactive-explanation" data-tta-explanation aria-live="polite">複数の妥当な変換で予測し、元座標・同じ出力空間へ戻して平均します。</p>
  <noscript><p class="interactive-explanation">TTAでは意味を保つ変換だけを使い、Segmentationはmaskを逆変換してから平均します。</p></noscript>
</div>

Segmentationではmaskを元座標へ逆変換してから平均します。Classificationなら確率やlogitを平均します。

## 使う場面 {#use-cases}

- ラベルがflip/rotation等に対して不変または可逆。
- 学習時augmentationと整合する変換がある。
- 推論時間を増やしてもよい。
- seed ensembleほど追加学習コストを掛けたくない。

## Kaggleでの実例 {#kaggle-examples}

Severstal Steel Defect Detectionの1位解法ではclassificationとsegmentationの両方で`None / Hflip / Vflip`のTTAを使っています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。

Jigsaw Toxic Comment Classificationの1位解法では、French/German/Spanishへ翻訳して英語へ戻す変換をtrain/test-time augmentationとして利用し、元commentと翻訳がsplitをまたがないようにリーク対策しています（[1st place solution overview](https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge/writeups/toxic-crusaders-1st-place-solution-overview)）。

Recursion Cellular Image Classificationの1位解法もTest-time augmentationsを最終推論へ組み込んでいます（[1st Place Solution Write-up & Code](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)）。

## 注意点 {#pitfalls}

### ラベルを変えてしまう変換

数字6/9、左右性が重要な医療画像、文字方向など、変換で意味が変わる問題にflipを使うと悪化します。

### CVでもTTAを再現していない

TestだけTTAしてCVは単発推論だと、改善量を正しく比較できません。OOF/Validationにも同じTTA pipelineを適用して評価します。

### 推論コスト

8 TTAなら概ね推論回数も8倍になります。提出時間・GPU制限と比較します。

## Quick Reference {#quick-reference}

- 意味を保つ変換だけ使う。
- Validationでも同じTTAを試す。
- Segmentationは逆変換してから平均。
- TTA数と推論コストは比例しやすい。
- 単純なflipから始める。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Pseudo Labeling]({{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }})

## 参考文献

1. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
2. [Kaggle, “Jigsaw Toxic Comment Classification: 1st place solution overview”](https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge/writeups/toxic-crusaders-1st-place-solution-overview)
3. [Kaggle, “Recursion Cellular Image Classification: 1st Place Solution Write-up & Code”, 2019](https://www.kaggle.com/competitions/recursion-cellular-image-classification/writeups/maciej-sypetkowski-1st-place-solution-write-up-cod)
4. [Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)

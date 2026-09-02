---
layout: default
title: Pseudo Labeling
summary: 高信頼な未ラベルデータ予測を仮ラベルとして再学習し、利用できる学習信号を増やすSemi-supervised手法。
type: reference
domain: kaggle
topic: pseudo-labeling
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - advanced-methods
  - semi-supervised
  - pseudo-label
---

# Pseudo Labeling

**Pseudo Labelingは、モデルが未ラベルデータへ出した予測を「仮の正解」としてTrainへ追加し、もう一度学習する方法です。**

Testやexternal unlabeled dataの構造を学習へ取り込める一方、間違ったpseudo labelを増幅すると性能が落ちます。**効く条件と効かない条件の差が大きい手法**です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#selection">選び方</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#failure-examples">効かなかった例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

Pseudo Labelingでは、Teacher modelの予測を全部そのまま使うのではなく、confidenceなどで採用範囲を制御します。下の模式例ではthresholdを動かし、**採用数と誤label混入のtrade-off**を確認できます。

<div class="interactive-viz" data-interactive="pseudo-label-threshold">
  <div class="interactive-viz__header"><div><div class="interactive-viz__title">Pseudo Labelのconfidence threshold</div><p class="interactive-viz__subtitle">thresholdを上げると採用数は減り、低confidence sampleを除外できます。</p></div><span class="interactive-status" data-pl-status data-state="safe">threshold 90% / 採用 3 / 誤り 0</span></div>
  <p class="interactive-note">模式例。confidenceと正誤は理解用の人工データで、Kaggle実測値ではありません。</p>
  <div class="interactive-control-row"><span class="interactive-control-label">Threshold</span><label class="interactive-range"><input type="range" min="60" max="98" step="1" value="90" data-pl-threshold aria-label="Pseudo Label confidence threshold"><span class="interactive-range-labels"><span>60%</span><span>98%</span></span></label></div>
  <div class="sample-grid" data-pl-grid aria-label="Pseudo label候補"></div>
  <p class="interactive-explanation" data-pl-explanation aria-live="polite">thresholdを上げるほど採用数は減ります。実データではOOFでnoiseとcoverageを比較します。</p>
  <noscript><p class="interactive-explanation">全件を採用せず、高confidenceや複数model一致などでpseudo labelのnoiseを制御します。</p></noscript>
</div>

全testへ一律にhard labelを付けるより、confidence、複数モデル一致、soft labelなどでノイズを制御する方が安全です。

## 選び方 {#selection}

<div class="comparison-board" aria-label="Pseudo Labelの選別方法">
  <section class="comparison-card is-primary"><h4>高confidenceのみ</h4><dl><dt>長所</dt><dd>ノイズを減らしやすい</dd><dt>リスク</dt><dd>易しいsampleへ偏る</dd></dl></section>
  <section class="comparison-card"><h4>複数モデル一致</h4><dl><dt>長所</dt><dd>信頼性を上げやすい</dd><dt>リスク</dt><dd>同じ誤りなら防げない</dd></dl></section>
  <section class="comparison-card"><h4>Soft label</h4><dl><dt>長所</dt><dd>不確実性を残せる</dd><dt>リスク</dt><dd>Loss設計が必要</dd></dl></section>
  <section class="comparison-card"><h4>複数round</h4><dl><dt>長所</dt><dd>徐々に対象を拡張</dd><dt>リスク</dt><dd>誤り増幅の危険</dd></dl></section>
</div>

## Kaggleでの実例 {#kaggle-examples}

Severstal Steel Defect Detectionの1位解法では、classifierとsegmentation networkの判定が一致し、classifier確率が0.95以上または0.05以下の画像を選択しました。1,135画像を追加し、Public LB 0.91985→0.92124、Private LB 0.90663→0.90883と報告しています（[1st Place Solution](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)）。これは定量根拠のある強い例です。

Jigsaw Toxic Comment Classificationの1位解法でも、TTAとPseudo Labelを含む100万件超のデータで8-fold OOF学習を行っています（[1st place solution overview](https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge/writeups/toxic-crusaders-1st-place-solution-overview)）。

## 効かなかった例 {#failure-examples}

30 Days of MLの1位解法ではPseudo LabelingでCV RMSEは0.715437→0.713614と改善した一方、Leaderboardは改善しなかったと明記されています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Medical AI Contest 7th 2025の1位解法でもPseudo LabelはLB改善なしとして「効かなかったこと」に挙げられています（[1st Place Solution](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)）。

**Pseudo Labelは「上位解法が使うから効く」のではなく、pseudo labelの精度・分布差・Validation設計で成否が決まります。**

## 注意点 {#pitfalls}

### Testへの過適合

Test pseudo labelを使うCompetitionではRulesを確認します。またPublic LBでpseudo label選択を反復するとPublic sliceへ過適合します。

### Confirmation bias

初期モデルの誤りを正解として再学習すると、同じ誤りにさらに自信を持ちます。異種モデル一致や高confidence選択で緩和します。

### CVが比較不能になる

Validation行へ由来する情報をpseudo label生成に使うとリークします。OOF設計やteacher生成範囲を明確にします。

## Quick Reference {#quick-reference}

- まず強いteacherを作る。
- 全件ではなく信頼度で選別する。
- 複数モデル一致は有力な選別条件。
- Pseudo Labelなし/ありを同じValidationで比較する。
- CV改善だけでなくLBとの整合も確認する。

## 関連項目

- [Test-Time Augmentation]({{ '/wiki/advanced-methods/test-time-augmentation.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle, “Severstal: Steel Defect Detection: 1st Place Solution”, 2019](https://www.kaggle.com/competitions/severstal-steel-defect-detection/writeups/1st-place-solution)
2. [Kaggle, “Jigsaw Toxic Comment Classification: 1st place solution overview”](https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge/writeups/toxic-crusaders-1st-place-solution-overview)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)
5. [Qiita, “Pseudo Labelingについて”](https://qiita.com/TS-0910/items/2706f13ece91e6179f8c)

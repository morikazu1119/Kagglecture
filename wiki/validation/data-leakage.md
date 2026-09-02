---
layout: default
title: Data Leakage
summary: 予測時には利用できない情報が学習・特徴量・Validationへ混ざり、CVを不当に高く見せる問題。
type: reference
domain: kaggle
topic: data-leakage
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - leakage
  - cross-validation
---

# Data Leakage

**Data Leakageは、本番の予測時には利用できない情報が学習や特徴量生成へ混ざり、Validation scoreを実力以上に高く見せる問題です。**

Kaggleでは強いモデルより先に潰すべき問題です。LeakageがあるとCV改善量、feature importance、threshold、ensemble weightまで全部が誤った基準で最適化されます（[scikit-learn: Data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#patterns">典型パターン</a>
  <a href="#prevention">防ぎ方</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#diagnosis">診断</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 典型パターン {#patterns}

<div class="comparison-board" aria-label="Data Leakageの典型パターン">
  <section class="comparison-card"><h4>Split leakage</h4><dl><dt>例</dt><dd>同一患者・ユーザー・重複画像がTrain/Validをまたぐ</dd></dl></section>
  <section class="comparison-card"><h4>Target leakage</h4><dl><dt>例</dt><dd>全TrainのtargetでTarget EncodingしてからCVする</dd></dl></section>
  <section class="comparison-card"><h4>Preprocessing leakage</h4><dl><dt>例</dt><dd>標準化・特徴選択・欠損補完を全データでfitする</dd></dl></section>
  <section class="comparison-card"><h4>Temporal leakage</h4><dl><dt>例</dt><dd>未来の売上を含むrolling featureで過去を予測する</dd></dl></section>
  <section class="comparison-card"><h4>Pseudo-label leakage</h4><dl><dt>例</dt><dd>Validationを学習したteacherのpseudo labelを同じValidation評価に使う</dd></dl></section>
  <section class="comparison-card"><h4>Duplicate leakage</h4><dl><dt>例</dt><dd>near-duplicateがTrain/Valid/Test間に存在する</dd></dl></section>
</div>

## 防ぎ方 {#prevention}

最も安全な原則は、**先にsplitし、その後の`fit`をすべてTrain fold内に閉じること**です。下で安全な順序と、split前にfitしてしまう順序を切り替えられます。

<div class="interactive-viz" data-interactive="leakage-pipeline">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">Splitとfitの順序を比較</div>
      <p class="interactive-viz__subtitle">前処理をどのデータでfitするかがLeakageの境界です。</p>
    </div>
    <span class="interactive-status" data-leak-status data-state="safe">Leakageなし</span>
  </div>
  <div class="interactive-control-row" role="group" aria-label="Pipelineの順序">
    <span class="interactive-control-label">Pipeline</span>
    <button type="button" class="interactive-button is-active" data-leak-mode="safe" aria-pressed="true">先にSplit</button>
    <button type="button" class="interactive-button" data-leak-mode="leaky" aria-pressed="false">先に全データでfit</button>
  </div>
  <div class="flow-strip" aria-label="処理フロー">
    <div class="flow-stage" data-leak-stage>Raw data</div>
    <div class="flow-stage" data-leak-stage>Split</div>
    <div class="flow-stage" data-leak-stage>Train fold</div>
    <div class="flow-stage" data-leak-stage>Trainだけでfit</div>
    <div class="flow-stage" data-leak-stage>Validationをtransform</div>
    <div class="flow-stage" data-leak-stage>Validation予測</div>
  </div>
  <p class="interactive-explanation" data-leak-explanation aria-live="polite">先にsplitし、標準化・欠損補完・特徴選択などのfitはTrain foldだけで行います。</p>
  <noscript><p class="interactive-explanation">安全な原則は、splitしてからTrain foldだけで前処理をfitし、Validationへはtransformだけを適用することです。</p></noscript>
</div>

scikit-learnも、test/validationを含めて`fit`や`fit_transform`しないこと、Pipelineを使ってCross Validation内で前処理を学習することを推奨しています（[Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html#how-to-avoid-data-leakage)）。

## Kaggleでの実例 {#kaggle-examples}

Google QUEST Q&A Labelingの1位解法では、pseudo label生成モデルのうちValidationを学習済みのモデルを使うとValidationが過度に楽観的になる問題を明示し、各splitで**現在のValidationを学習していないモデルだけ**からpseudo labelを生成しています（[1st place solution with code](https://www.kaggle.com/competitions/google-quest-challenge/writeups/bibimorph-1st-place-solution-with-code)）。

NeurIPS Open Polymer Prediction 2025の1位解法では、SMILESのcanonical化によるduplicate除去に加え、各test foldに対してTanimoto similarity > 0.99のTrain sampleを除外し、near-duplicate leakageを抑えています（[1st Place Solution](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)）。

## 診断 {#diagnosis}

- 単純baselineなのに異常に高いCVが出る。
- 特定ID、timestamp、集計特徴が極端に強い。
- Random splitだけ高くGroup/Time splitで崩れる。
- Public LBとCVの差が大きい。
- duplicate/near-duplicateを除くとscoreが急落する。

ただしCV-LB mismatchは分布差でも起きるため、[Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})と合わせて原因を分けます。

## Quick Reference {#quick-reference}

- split前にtarget由来特徴を作らない。
- 前処理の`fit`はTrain foldだけ。
- patient/user/session/timeなど本番の独立単位を守る。
- duplicate・near-duplicateを確認する。
- pseudo label teacherもValidationを見ていないか確認する。
- 異常に良いCVはまずLeakageを疑う。

## 関連項目

- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Common pitfalls and recommended practices: Data leakage”](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)
2. [Kaggle, “Google QUEST Q&A Labeling: 1st place solution with code”](https://www.kaggle.com/competitions/google-quest-challenge/writeups/bibimorph-1st-place-solution-with-code)
3. [Kaggle, “NeurIPS Open Polymer Prediction 2025: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)
4. [Kaggle, “SIIM-ISIC Melanoma Classification: 1st place solution”, 2020](https://www.kaggle.com/competitions/siim-isic-melanoma-classification/writeups/all-data-are-ext-1st-place-solution)

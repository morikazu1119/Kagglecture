---
layout: default
title: F1 Score
summary: PrecisionとRecallの調和平均で、誤検知と見逃しを同時に評価する分類指標。
type: reference
domain: kaggle
topic: f1-score
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - threshold
---

# F1 Score

**F1 Scoreは、Precision（陽性と予測した中の正解率）とRecall（本当の陽性を拾えた割合）のバランスを見る指標です。**

Accuracyだけでは少数クラスを無視しても高得点になる問題で使われます。F1は0〜1で、1が最良です（[scikit-learn: f1_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#threshold">Threshold</a>
  <a href="#averaging">平均方法</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

$$
F1 = \frac{2 \cdot Precision \cdot Recall}{Precision + Recall}
$$

同値な形では次です。

$$
F1 = \frac{2TP}{2TP + FP + FN}
$$

PrecisionかRecallの片方だけが高くてもF1は伸びにくいため、両方のバランスを求める指標です。

## Threshold {#threshold}

確率予測を0/1に変えるthresholdでF1は変化します。デフォルト0.5が最良とは限りません。

下の模式データでthresholdを動かすと、positive判定が増減し、Precision・Recall・F1が同時に変わります。

<div class="interactive-viz" data-interactive="f1-threshold">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">ThresholdでPrecision / Recall / F1がどう変わるか</div>
      <p class="interactive-viz__subtitle">緑 = True Positive、赤 = False Positive、薄色 = negative予測。</p>
    </div>
    <span class="interactive-status" data-f1-status data-state="safe">threshold 50%</span>
  </div>
  <p class="interactive-note">模式例。予測確率とlabelは理解用の人工データです。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Threshold</span>
    <label class="interactive-range">
      <input type="range" min="10" max="90" step="1" value="50" data-f1-threshold aria-label="F1を計算するthreshold">
      <span class="interactive-range-labels"><span>10%</span><span>90%</span></span>
    </label>
  </div>
  <div class="metric-grid">
    <div class="metric-card"><span>Precision</span><strong data-f1-precision>0.00</strong></div>
    <div class="metric-card"><span>Recall</span><strong data-f1-recall>0.00</strong></div>
    <div class="metric-card"><span>F1</span><strong data-f1-score>0.00</strong></div>
  </div>
  <div class="sample-grid" data-f1-grid aria-label="Threshold判定されたsample"></div>
  <p class="interactive-explanation" data-f1-explanation aria-live="polite">thresholdを動かすとPrecisionとRecallのtrade-offが変わります。</p>
  <noscript><p class="interactive-explanation">F1はthreshold依存です。OOF予測上でthresholdを評価し、Public LBだけで調整しないことが重要です。</p></noscript>
</div>

Kaggleでは、**OOF予測でthresholdを選び、そのthresholdをtestへ適用する**のが基本です。Leaderboardだけでthresholdを調整するとPublic LBへ過適合しやすくなります。

## 平均方法 {#averaging}

<div class="comparison-board" aria-label="F1 Scoreのaveraging方式">
  <section class="comparison-card"><h4>binary</h4><dl><dt>計算対象</dt><dd>指定positive class</dd><dt>向く問題</dt><dd>二値分類</dd></dl></section>
  <section class="comparison-card is-primary"><h4>macro</h4><dl><dt>計算対象</dt><dd>classごとのF1を等重み平均</dd><dt>特徴</dt><dd>少数classも同じ重さ</dd></dl></section>
  <section class="comparison-card"><h4>weighted</h4><dl><dt>計算対象</dt><dd>class件数で重み付け</dd><dt>特徴</dt><dd>大きいclassの影響が強い</dd></dl></section>
  <section class="comparison-card"><h4>micro</h4><dl><dt>計算対象</dt><dd>全TP/FP/FNを集約</dd><dt>特徴</dt><dd>全sampleをまとめて評価</dd></dl></section>
</div>

CompetitionのEvaluation定義と同じaverageを使います。

## Kaggleでの実例 {#kaggle-examples}

Kaggle Datafest Hackathonの1位解法はPrivate LBでF1=0.92682と報告し、不均衡データへのoversamplingとensembleを採用しています（[1st place solution](https://www.kaggle.com/competitions/kaggledatafest/writeups/muhammad-imran-zaman-1st-place-solution)）。

Make Data Count 2025の1位解法では、ラベル欠損の仕様を考慮したローカルF1を作り、DOI分類で6-foldのtype-stratified CatBoostをarticle_idでgroup化しています（[1st Place Solution](https://www.kaggle.com/competitions/make-data-count-finding-data-references/writeups/1st-place-solution)）。Metricだけでなく**Validationで同じF1定義を再現すること**が重要な例です。

## 注意点 {#pitfalls}

### threshold overfitting

同じOOFへ何百通りもthresholdを試すと、そのOOFノイズへ過適合します。fold別最適値の分散も確認します。

### macroとmicroを取り違える

同じ予測でも大きく順位が変わります。Competition式を実装してローカルで一致確認します。

### 確率品質は見ない

0.51と0.99が同じpositive判定ならF1上は同じです。確率の質が必要ならLogLoss等を併用します。

## Quick Reference {#quick-reference}

- 1が最良、0が最悪。
- PrecisionとRecallの調和平均。
- threshold依存。
- macro/micro/weightedの定義を確認。
- thresholdはOOFで選ぶ。

## 関連項目

- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [LogLoss]({{ '/wiki/metrics/log-loss.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})

## 参考文献

1. [scikit-learn, “f1_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html)
2. [Kaggle, “Kaggle Datafest Hackathon: 1st place solution”, 2023](https://www.kaggle.com/competitions/kaggledatafest/writeups/muhammad-imran-zaman-1st-place-solution)
3. [Kaggle, “Make Data Count: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/make-data-count-finding-data-references/writeups/1st-place-solution)
4. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

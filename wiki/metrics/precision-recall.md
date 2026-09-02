---
layout: default
title: Precision / Recall
summary: Precisionは誤検知の少なさ、Recallは見逃しの少なさを表し、threshold選択の基本になる分類指標。
type: reference
domain: kaggle
topic: precision-recall
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - metrics
  - classification
  - threshold
---

# Precision / Recall

**Precisionは「positiveと予測した中で本当にpositiveだった割合」、Recallは「本当のpositiveをどれだけ拾えたか」です。**

同じmodelでもthresholdを変えるだけで両者は動きます。thresholdを下げるとpositive判定が増え、一般にRecallは上がりやすくPrecisionは下がりやすくなります（[scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#formula">数式</a>
  <a href="#threshold">Threshold</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感 {#intuition}

<div class="model-architecture" aria-label="PrecisionとRecallが数えている集合の違い">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Precisionは「予測した側」、Recallは「本当の正解側」を分母にする</div><p class="model-architecture__subtitle">同じTPを使いますが、どの集合を基準に見るかが違います。</p></div>
    <span class="model-architecture__badge">set view</span>
  </div>
  <div class="comparison-board" style="margin-bottom:0">
    <section class="comparison-card"><h4>Precision</h4><dl><dt>分母</dt><dd>Positiveと予測した全件 = TP + FP</dd><dt>失敗</dt><dd>False Positive</dd><dt>意味</dt><dd>「陽性と言ったら当てたい」</dd><dt>例</dt><dd>正常メールをspam扱いしたくない</dd></dl></section>
    <section class="comparison-card is-primary"><h4>Recall</h4><dl><dt>分母</dt><dd>本当にPositiveの全件 = TP + FN</dd><dt>失敗</dt><dd>False Negative</dd><dt>意味</dt><dd>「本物の陽性を逃したくない」</dd><dt>例</dt><dd>screeningで疾患を見逃したくない</dd></dl></section>
  </div>
</div>

## 数式 {#formula}

$$
Precision = \frac{TP}{TP+FP}
$$

$$
Recall = \frac{TP}{TP+FN}
$$

Precisionを上げたいならFalse Positiveを減らす必要があり、Recallを上げたいならFalse Negativeを減らす必要があります。

## Thresholdを動かす {#threshold}

Probabilityを0/1へ変えるthresholdを下げると、より多くのsampleがpositive判定になります。するとTrue Positiveも増えやすい一方、False Positiveも増えやすくなります。

<div class="interactive-viz" data-interactive="f1-threshold">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">ThresholdだけでPrecisionとRecallはどう変わるか</div>
      <p class="interactive-viz__subtitle">緑 = True Positive、赤 = False Positive、薄色 = negative予測。F1も参考として同時表示します。</p>
    </div>
    <span class="interactive-status" data-f1-status data-state="safe">threshold 50%</span>
  </div>
  <p class="interactive-note">模式例。予測確率とlabelは理解用の人工データです。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">Threshold</span>
    <label class="interactive-range">
      <input type="range" min="10" max="90" step="1" value="50" data-f1-threshold aria-label="Precision Recallを計算するthreshold">
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
  <noscript><p class="interactive-explanation">thresholdを下げるとpositive判定が増え、一般にRecallは上がりやすくPrecisionは下がりやすくなります。</p></noscript>
</div>

このため「modelのPrecisionはいくつか」と言うときは、**どのthresholdで測ったか**が必要です。Precision-Recall curveはthresholdを連続的に変えたtrade-offをまとめて見ます（[scikit-learn Precision-Recall](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)）。

CompetitionがF1なら、PrecisionとRecallの両方からOOF thresholdを決めます。Recall単体やPrecision単体なら、Evaluationのaverage方法や制約も確認します。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Precision Recall関連Metricの使い分け">
  <section class="comparison-card"><h4>Precision</h4><dl><dt>重視</dt><dd>False Positiveを減らす</dd><dt>threshold</dt><dd>依存</dd></dl></section>
  <section class="comparison-card"><h4>Recall</h4><dl><dt>重視</dt><dd>False Negativeを減らす</dd><dt>threshold</dt><dd>依存</dd></dl></section>
  <section class="comparison-card is-primary"><h4>F1</h4><dl><dt>重視</dt><dd>Precision / Recall両方</dd><dt>用途</dt><dd>1つのoperating pointを評価</dd></dl></section>
  <section class="comparison-card"><h4>PR-AUC / AP</h4><dl><dt>重視</dt><dd>threshold全体のPR関係</dd><dt>用途</dt><dd>不均衡ranking</dd></dl></section>
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>重視</dt><dd>ranking全体</dd><dt>軸</dt><dd>FPR / TPR</dd></dl></section>
</div>

## 注意点 {#pitfalls}

### Positive classを取り違える

Precision/Recallは「どちらをpositiveと定義したか」で意味が変わります。Competitionのlabel定義を確認します。

### average方法を取り違える

multiclass / multilabelではmacro、micro、weighted等で値が変わります。公式Evaluation実装と合わせます。

### Public LBでthresholdを調整する

thresholdはOOF prediction上で決めます。Public LBだけに合わせるとLeaderboard overfittingしやすくなります。

## Quick Reference {#quick-reference}

- Precision = positive予測の正確さ。
- Recall = 本当のpositiveの回収率。
- thresholdで両者が変わる。
- false positive / false negativeのどちらを避けたいかで重視指標を決める。
- macro/micro/weightedをCompetition定義へ合わせる。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [PR-AUC / Average Precision]({{ '/wiki/metrics/pr-auc-average-precision.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})

## 参考文献

1. [scikit-learn, “precision_recall_curve”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)
2. [scikit-learn, “Precision-Recall”](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)
3. [scikit-learn, “precision_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_score.html)

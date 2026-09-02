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

thresholdを下げるとpositive判定が増え、一般にRecallは上がりやすくPrecisionは下がりやすくなります。どちらを重視するかは誤検知と見逃しのコストで決まります（[scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#intuition">直感</a>
  <a href="#threshold">Threshold</a>
  <a href="#comparison">使い分け</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

$$
Precision = \frac{TP}{TP+FP}
$$

$$
Recall = \frac{TP}{TP+FN}
$$

## 直感 {#intuition}

<div class="comparison-board" aria-label="PrecisionとRecallの直感的な違い">
  <section class="comparison-card"><h4>Precisionを重視</h4><dl><dt>避けたい失敗</dt><dd>False Positive</dd><dt>意味</dt><dd>positiveと言うなら外したくない</dd><dt>例</dt><dd>正常メールをspam扱いしたくない</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Recallを重視</h4><dl><dt>避けたい失敗</dt><dd>False Negative</dd><dt>意味</dt><dd>本当のpositiveを取りこぼしたくない</dd><dt>例</dt><dd>screeningで疾患を見逃したくない</dd></dl></section>
</div>

## Threshold {#threshold}

同じmodelでもthresholdを変えるとPrecision/Recallは変わります。Precision-Recall curveはthresholdを連続的に動かしたtrade-offを示します（[scikit-learn Precision-Recall](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)）。

CompetitionがF1なら、PrecisionとRecallの両方からOOF thresholdを決めます。Recall単体やPrecision単体なら制約や平均方法を確認します。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Precision Recall関連Metricの使い分け">
  <section class="comparison-card"><h4>Precision</h4><dl><dt>重視</dt><dd>False Positiveを減らす</dd><dt>threshold</dt><dd>依存</dd></dl></section>
  <section class="comparison-card"><h4>Recall</h4><dl><dt>重視</dt><dd>False Negativeを減らす</dd><dt>threshold</dt><dd>依存</dd></dl></section>
  <section class="comparison-card is-primary"><h4>F1</h4><dl><dt>重視</dt><dd>Precision / Recall両方</dd><dt>用途</dt><dd>1つのoperating pointを評価</dd></dl></section>
  <section class="comparison-card"><h4>PR-AUC / AP</h4><dl><dt>重視</dt><dd>threshold全体のPR関係</dd><dt>用途</dt><dd>不均衡ranking</dd></dl></section>
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>重視</dt><dd>ranking全体</dd><dt>軸</dt><dd>FPR / TPR</dd></dl></section>
</div>

## 注意点

multiclassではmacro/micro/weightedの平均方法で値が変わります。またpositive class定義を逆にすると意味も逆転します。

## Quick Reference {#quick-reference}

- Precision = positive予測の正確さ。
- Recall = positiveの回収率。
- thresholdで両者が変わる。
- class imbalanceではAccuracyより有益なことが多い。
- macro/micro/weightedをCompetition定義へ合わせる。

## 関連項目

- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})
- [PR-AUC / Average Precision]({{ '/wiki/metrics/pr-auc-average-precision.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})

## 参考文献

1. [scikit-learn, “precision_recall_curve”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)
2. [scikit-learn, “Precision-Recall”](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)
3. [scikit-learn, “precision_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_score.html)

---
layout: default
title: PR-AUC / Average Precision
summary: Precision-Recall curve全体を要約し、positiveが少ない分類でpositive側のranking品質を重点評価する指標。
type: reference
domain: kaggle
topic: pr-auc-average-precision
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - metrics
  - classification
  - imbalance
  - ranking
---

# PR-AUC / Average Precision

**Precision-Recall curveはthresholdを動かしたときのPrecisionとRecallのtrade-offを表し、Average Precision（AP）はそのcurveを1つの値へ要約する代表的指標です。**

positiveが非常に少ない問題ではROC-AUCだけではFalse Positiveの実務的な多さが見えにくいことがあり、PR系指標が有用です（[scikit-learn Precision-Recall](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#ap">Average Precision</a>
  <a href="#comparison">ROC-AUCとの違い</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感 {#intuition}

positiveを上位へ集めつつ、上位にnegativeを混ぜないモデルほどcurveが右上側になります。PrecisionとRecallの両方が高い領域が広いほど良いと考えます。

<div class="static-viz html-chart" aria-label="Precision Recall curveの模式図">
  <div class="viz-heading"><div><div class="viz-title">PrecisionとRecallを同時に高く保てる範囲を見る</div><p class="viz-subtitle">右へ行くほどRecallが高く、上にいるほどPrecisionが高い。右上に近いcurveほど良い模式例です。</p></div><span class="viz-badge">模式曲線</span></div>
  <svg viewBox="0 0 560 300" role="img" aria-label="Recallを横軸、Precisionを縦軸にした模式Precision Recall curve">
    <line x1="58" y1="250" x2="525" y2="250" stroke="var(--border-strong)" stroke-width="2" />
    <line x1="58" y1="250" x2="58" y2="28" stroke="var(--border-strong)" stroke-width="2" />
    <line x1="58" y1="205" x2="525" y2="205" stroke="var(--border)" stroke-width="1" />
    <line x1="58" y1="160" x2="525" y2="160" stroke="var(--border)" stroke-width="1" />
    <line x1="58" y1="115" x2="525" y2="115" stroke="var(--border)" stroke-width="1" />
    <line x1="58" y1="70" x2="525" y2="70" stroke="var(--border)" stroke-width="1" />
    <path d="M58,48 C120,49 175,58 225,72 C286,90 339,115 383,143 C433,175 477,210 525,236" fill="none" stroke="var(--success)" stroke-width="5" stroke-linecap="round" />
    <path d="M58,92 C122,103 179,122 229,144 C292,171 345,193 399,211 C452,228 490,239 525,244" fill="none" stroke="var(--text-secondary)" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 7" />
    <text x="292" y="286" text-anchor="middle" fill="var(--text-secondary)" font-size="13">Recall →</text>
    <text x="18" y="142" text-anchor="middle" fill="var(--text-secondary)" font-size="13" transform="rotate(-90 18 142)">Precision →</text>
    <text x="398" y="124" fill="var(--success)" font-size="12" font-weight="700">より良いranking</text>
    <text x="365" y="224" fill="var(--text-secondary)" font-size="12">弱い模式curve</text>
  </svg>
  <p class="viz-caption">曲線は概念説明用で実測値ではありません。CompetitionのAP/PR-AUCは公式実装で計算します。</p>
</div>

## Average Precision {#ap}

scikit-learnのAPは、各thresholdでRecallが増えた分をweightにしてPrecisionを平均します。

$$
AP = \sum_n (R_n-R_{n-1})P_n
$$

**APと、台形則で計算する単純なPR曲線下面積は同じとは限りません。** Competitionが`average_precision_score`なのか独自PR-AUCなのか確認します（[model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html)）。

## ROC-AUCとの違い {#comparison}

<div class="comparison-board" aria-label="ROC-AUCとPR Average Precisionの比較">
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>軸</dt><dd>FPR / TPR</dd><dt>negative</dt><dd>全negativeが分母</dd><dt>向く判断</dt><dd>ranking全体を広く見る</dd></dl></section>
  <section class="comparison-card is-primary"><h4>PR / Average Precision</h4><dl><dt>軸</dt><dd>Recall / Precision</dd><dt>positive</dt><dd>positive検出とFalse Positiveを直接見る</dd><dt>向く判断</dt><dd>positiveが希少な問題</dd></dl></section>
</div>

random predictorのAP baselineはpositive率です。positive率1%ならAP 0.01付近がrandom相当になるため、dataset間で生値を比較するときはclass prevalenceも見ます（[scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)）。

## 注意点 {#pitfalls}

### 「PR-AUC」の計算定義を確認する

AP、trapezoidal AUC、interpolated APなど実装差があります。Competition公式evaluation codeを最優先します。

### prevalenceでbaselineが変わる

ROC-AUCのrandom baseline 0.5と違い、AP baselineはpositive率に依存します。

### threshold選択は別

APが高くても最終F1 thresholdが自動で決まるわけではありません。hard-label MetricならOOFでoperating pointを選びます。

## Quick Reference {#quick-reference}

- positiveが少ない分類で重要。
- APは0〜1で高いほど良い。
- random APはpositive率。
- APと単純PR曲線面積を混同しない。
- Competition実装と同じ式を使う。

## 関連項目

- [Precision / Recall]({{ '/wiki/metrics/precision-recall.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Precision-Recall”](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)
2. [scikit-learn, “average_precision_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html)
3. [scikit-learn, “Metrics and scoring”](https://scikit-learn.org/stable/modules/model_evaluation.html)
4. [scikit-learn, “precision_recall_curve”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html)

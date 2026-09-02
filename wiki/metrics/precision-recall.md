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

- Precision重視: 「positiveと言うなら外したくない」
- Recall重視: 「本当のpositiveを取りこぼしたくない」

Spam検知で正常メールをspam扱いするコストが高ければPrecision、疾患screeningで見逃しが重ければRecallを強く意識する、と考えると分かりやすいです。

## Threshold {#threshold}

同じmodelでもthresholdを変えるとPrecision/Recallは変わります。Precision-Recall curveはthresholdを連続的に動かしたtrade-offを示します（[scikit-learn Precision-Recall](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html)）。

CompetitionがF1なら、PrecisionとRecallの両方からOOF thresholdを決めます。Recall単体やPrecision単体なら制約や平均方法を確認します。

## 使い分け {#comparison}

| 指標 | 重視する失敗 |
|---|---|
| Precision | False Positiveを減らす |
| Recall | False Negativeを減らす |
| F1 | 両者のbalance |
| PR-AUC / AP | threshold全体のPrecision/Recall |
| ROC-AUC | ranking全体 |

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

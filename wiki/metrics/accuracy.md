---
layout: default
title: Accuracy
summary: 全sampleのうち正しく分類できた割合。直感的だがクラス不均衡では多数派予測を過大評価しやすい。
type: reference
domain: kaggle
topic: accuracy
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - metrics
  - classification
  - accuracy
---

# Accuracy

**Accuracyは、全sampleのうち予測labelが正解した割合です。**

式は非常に単純ですが、class imbalanceでは「多数派classだけ当てるmodel」が高得点に見えるため、**scoreの高さだけではmodelが本当に役立っているか判断できません**（[scikit-learn: accuracy_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#imbalance">不均衡の罠</a>
  <a href="#use-cases">使う場面</a>
  <a href="#comparison">使い分け</a>
  <a href="#pitfalls">注意点</a>
</nav>

## 数式 {#formula}

$$
Accuracy = \frac{TP + TN}{TP + TN + FP + FN}
$$

multiclassでも「正解labelと一致したsample数 / 全sample数」と考えれば同じです。

## 不均衡だと何が起きるか {#imbalance}

たとえば100件中95件がNegative、5件がPositiveのdatasetを考えます。何も学習せず**全件Negativeと予測**しても95件は正解なのでAccuracyは95%です。

<div class="model-architecture" aria-label="クラス不均衡でAccuracyが高く見える模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Positiveを1件も拾えていなくてもAccuracy 95%</div><p class="model-architecture__subtitle">多数派classが95%を占めると、majority baselineだけで高いAccuracyが出ます。</p></div>
    <span class="model-architecture__badge">imbalance example</span>
  </div>
  <div class="html-bar-chart">
    <div class="html-bar-row is-highlight"><span class="html-bar-label">Negative 95件</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:95"></span></span><span class="html-bar-value">全件正解</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Positive 5件</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:5"></span></span><span class="html-bar-value">全件見逃し</span></div>
  </div>
  <div class="comparison-board" style="margin-bottom:0">
    <section class="comparison-card is-primary"><h4>Accuracy</h4><dl><dt>正解</dt><dd>95 / 100</dd><dt>Score</dt><dd>0.95</dd></dl></section>
    <section class="comparison-card"><h4>Positive Recall</h4><dl><dt>正解</dt><dd>0 / 5</dd><dt>Score</dt><dd>0.00</dd></dl></section>
  </div>
  <p class="model-architecture__caption">模式例です。このためAccuracyを見る前にclass shareとmajority baselineを確認する必要があります。</p>
</div>

「Accuracy 95%」だけを見ると強そうですが、少数classを検出する目的なら完全に失敗しています。**Accuracyは全sampleを同じ1票として数える**ので、件数の多いclassがscoreを支配します。

## 使う場面 {#use-cases}

- class比が大きく偏っていない。
- 各classの誤分類コストがほぼ同じ。
- hard labelの最終正解率が目的。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Accuracyと他の分類指標の比較">
  <section class="comparison-card"><h4>Accuracy</h4><dl><dt>不均衡</dt><dd>弱い</dd><dt>見るもの</dt><dd>全体正解率</dd><dt>出力</dt><dd>hard label</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Balanced Accuracy</h4><dl><dt>不均衡</dt><dd>強い</dd><dt>見るもの</dt><dd>classごとのRecall平均</dd><dt>向く状況</dt><dd>多数派classが支配的</dd></dl></section>
  <section class="comparison-card"><h4>F1</h4><dl><dt>不均衡</dt><dd>強い</dd><dt>見るもの</dt><dd>Precision / Recall balance</dd><dt>特徴</dt><dd>threshold依存</dd></dl></section>
  <section class="comparison-card"><h4>ROC-AUC</h4><dl><dt>不均衡</dt><dd>比較的強い</dd><dt>見るもの</dt><dd>ranking</dd><dt>特徴</dt><dd>threshold非依存</dd></dl></section>
</div>

## 注意点 {#pitfalls}

### Majority baselineを見ない

最大classが90%ならAccuracy 90%は、全件をmajority classへ出すだけで達成できます。model scoreだけでなくbaselineとの差を見ます。

### threshold依存

Probabilityをlabelへ変換するdecision ruleでAccuracyは変わります。Competition MetricがAccuracyならOOFでthreshold/class correctionも評価します。

### multilabelの定義

scikit-learnのmultilabel Accuracyはsample内のlabel setが完全一致するsubset accuracyです。Competition定義と一致するか確認します。

## Quick Reference

- Accuracy = 正解数 / 全sample数。
- class比を必ず確認する。
- majority baselineと比較する。
- 不均衡ならBalanced Accuracy/F1/PR系を検討する。
- probabilityの質を直接測るMetricではない。

## 関連項目

- [Balanced Accuracy]({{ '/wiki/metrics/balanced-accuracy.html' | relative_url }})
- [Precision / Recall]({{ '/wiki/metrics/precision-recall.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “accuracy_score”](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html)
2. [scikit-learn, “Metrics and scoring”](https://scikit-learn.org/stable/modules/model_evaluation.html)
3. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

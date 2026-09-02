---
layout: default
title: Probability Calibration
summary: 予測確率0.8が実際にも約80%当たるよう、モデルの確率スケールをOOFで補正する手法。
type: reference
domain: kaggle
topic: probability-calibration
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - advanced-methods
  - calibration
  - probability
---

# Probability Calibration

**Probability Calibrationは、モデルが出す確率を「0.8と予測した集団が実際にも約80%正例」のような確率へ補正する手法です。**

AUCのようなranking指標では重要度が低い一方、LogLossやBrier Scoreのように**確率の値そのもの**を採点するCompetitionでは大きく効くことがあります（[scikit-learn: Probability calibration](https://scikit-learn.org/stable/modules/calibration.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#methods">手法</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感 {#intuition}

モデルのrankingは正しくても、確率が過信気味なことがあります。

<div class="comparison-board" aria-label="Calibrationが必要な確率予測の模式例">
  <section class="comparison-card"><h4>モデルの予測</h4><dl><dt>予測確率</dt><dd>0.90</dd><dt>意味</dt><dd>モデルは90%程度の自信を表現</dd></dl></section>
  <section class="comparison-card is-primary"><h4>実際の正例率</h4><dl><dt>観測率</dt><dd>0.70</dd><dt>診断</dt><dd>20ポイント過信している</dd></dl></section>
</div>
<p class="viz-note">模式例。0.90 / 0.70は説明用の人工値です。</p>

この場合「誰が上か」は合っていても、0.9という確率は高すぎます。Calibrationはこのscaleを補正します。

下の模式Reliability表示で、補正前と補正後を切り替えられます。灰色が予測確率、緑がそのbinでの実際の正例率です。

<div class="interactive-viz" data-interactive="calibration-toggle">
  <div class="interactive-viz__header"><div><div class="interactive-viz__title">Calibration前後の確率gap</div><p class="interactive-viz__subtitle">予測確率と実測正例率の距離が小さいほど、確率として解釈しやすくなります。</p></div><span class="interactive-status" data-cal-status data-state="danger">平均gap</span></div>
  <p class="interactive-note">模式例。binごとの予測率・実測率は人工データです。</p>
  <div class="interactive-control-row" role="group" aria-label="Calibration状態"><span class="interactive-control-label">表示</span><button type="button" class="interactive-button is-active" data-cal-mode="raw" aria-pressed="true">補正前</button><button type="button" class="interactive-button" data-cal-mode="calibrated" aria-pressed="false">補正後</button></div>
  <div class="calibration-legend"><span><i></i>予測確率</span><span><i class="is-observed"></i>実測正例率</span></div>
  <div class="calibration-list" data-cal-rows></div>
  <p class="interactive-explanation" data-cal-explanation aria-live="polite">高確率binほど予測が実測率より高く、過信している模式例です。</p>
  <noscript><p class="interactive-explanation">CalibrationはOOFまたは独立setで学習し、予測確率と実際の発生率のズレを補正します。</p></noscript>
</div>

## 手法 {#methods}

<div class="comparison-board" aria-label="Probability Calibration手法の比較">
  <section class="comparison-card"><h4>Sigmoid / Platt</h4><dl><dt>特徴</dt><dd>滑らかな単調変換</dd><dt>注意</dt><dd>柔軟性は低め</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Isotonic</h4><dl><dt>特徴</dt><dd>非パラメトリックな単調変換</dd><dt>注意</dt><dd>小データで過学習しやすい</dd></dl></section>
  <section class="comparison-card"><h4>Temperature Scaling</h4><dl><dt>特徴</dt><dd>logit scaleを調整</dd><dt>注意</dt><dd>主にNNで使いやすい</dd></dl></section>
</div>

scikit-learnはIsotonicについて、十分なデータがあれば柔軟だが、小標本では過学習しやすいと説明しています。またIsotonicはtieを作るためAUCがわずかに変わる場合があります（[公式ドキュメント](https://scikit-learn.org/stable/modules/calibration.html)）。

## Kaggleでの実例 {#kaggle-examples}

March Machine Learning Mania 2026の1位解法では、Leave-One-Season-OutのOOF予測へIsotonic Regressionをfitしています。Brier ScoreはMen 0.1850→0.1822、Women 0.1390→0.1357、全体 0.1620→0.1590へ改善したと報告しています（[1st Place Solution](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)）。

この例の重要点は、**学習データへのin-sample予測ではなくOOF予測にcalibratorをfitしていること**です。

## 注意点 {#pitfalls}

### in-sampleでfitする

モデル自身のTrain予測は過度に自信が高くなりやすく、その上でcalibrationすると本番へ一般化しません。OOFか独立Calibration setを使います。

### Ranking Metricで不要な調整をする

AUCしか見ないCompetitionでは、monotonic calibrationで本質的なrankingはほぼ変わりません。Metricに合わせて使います。

### Isotonicの過学習

自由度が高いため、データが少ないfoldで細かい階段状mappingを学ぶと不安定になります。SigmoidとOOFで比較します。

## Quick Reference {#quick-reference}

- LogLoss/BrierなどProbability Metricで検討する。
- calibratorはOOFまたは独立setで学習する。
- SigmoidとIsotonicを比較する。
- Reliability diagramで過信/過小信頼を見る。
- AUC改善目的の手法ではない。

## 関連項目

- [LogLoss]({{ '/wiki/metrics/log-loss.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Probability calibration”](https://scikit-learn.org/stable/modules/calibration.html)
2. [scikit-learn, “sklearn.calibration”](https://scikit-learn.org/stable/api/sklearn.calibration.html)
3. [Kaggle, “March Machine Learning Mania 2026: 1st Place Solution”, Harrison Horan, 2026](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)
4. [Kaggle, “March Mania 2026: Under 50 Solution”, 2026](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-under-50-solut)

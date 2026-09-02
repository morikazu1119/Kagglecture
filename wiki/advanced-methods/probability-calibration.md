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

```text
予測0.9のsample群 -> 実際の正例率0.70
```

この場合「誰が上か」は合っていても、0.9という確率は高すぎます。Calibrationはこのscaleを補正します。

## 手法 {#methods}

| 方法 | 特徴 | 注意 |
|---|---|---|
| Sigmoid / Platt | 滑らかな単調変換 | 柔軟性は低め |
| Isotonic | 非パラメトリックな単調変換 | 小データで過学習しやすい |
| Temperature Scaling | logit scaleを調整 | 主にNNで使いやすい |

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

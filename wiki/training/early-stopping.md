---
layout: default
title: Early Stopping
summary: Validation指標が一定期間改善しなくなった時点で学習を止め、過学習と無駄な学習を抑える方法。
type: reference
domain: kaggle
topic: early-stopping
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - training
  - early-stopping
  - overfitting
---

# Early Stopping

**Early Stoppingは、Validation指標が一定回数改善しなくなったら学習を止め、最良時点のモデルを使う方法です。**

Epochやtree数を固定するより、foldごとに「改善が止まる場所」を使えるため、過学習抑制と計算節約の両方に役立ちます。LightGBMでは`stopping_rounds`、XGBoostでは`early_stopping_rounds`などで設定します（[LightGBM](https://lightgbm.readthedocs.io/en/v4.6.0/pythonapi/lightgbm.early_stopping.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#settings">設定</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

```text
epoch 1  -> val improves -> save
...
epoch 12 -> best score   -> save best
epoch 13 -> no improve
epoch 14 -> no improve
epoch 15 -> no improve -> patience到達なら停止
```

停止時点の重みではなく、**best iteration / best checkpoint**を推論に使う点が重要です。

## 設定 {#settings}

| Parameter | 意味 |
|---|---|
| patience / stopping_rounds | 何回改善なしを許すか |
| min_delta | 改善とみなす最小差 |
| monitor | 監視するValidation Metric |
| mode | maximize / minimize |

Metricのノイズが大きいほどpatienceを短くしすぎると、本来伸びる前に停止します。

## Kaggleでの実例 {#kaggle-examples}

松尾研 DS Dojo #4の1位解法ではGemma fine-tuningに`EarlyStoppingCallback`のpatience=3を設定しています（[1st Place Solution](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)）。

March Machine Learning Mania 2026の1位解法はXGBoostで`n_estimators=4000`と大きな上限を置き、`early_stopping_rounds=100`を使っています（[1st Place Solution](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)）。

## 注意点 {#pitfalls}

### Metricを間違える

CompetitionがAUCなのにtraining lossだけをmonitorすると、停止地点がCompetition Metricとずれることがあります。可能なら評価目的に近いValidation Metricを監視します。

### Validationを何度も使う

Early Stopping自体がValidationをモデル選択に使っています。その同じfoldで大量のhyperparameterも選ぶと、徐々にValidationへ過適合します。

### foldごとのbest iteration差

5-foldでbest iterationが100, 110, 95, 900, 105なら、1foldだけ異常です。データ分布やリーク、metricノイズを確認します。

### APIごとの推論仕様

Libraryによって`predict`がbest iterationを自動使用するか異なります。best checkpoint/iterationが本当に使われているか確認します。

## Quick Reference {#quick-reference}

- 最大epoch/tree数は十分大きめに置く。
- monitorするMetricをCompetitionへ合わせる。
- best checkpointを推論に使う。
- patienceは学習曲線のノイズに合わせる。
- fold間のbest iteration分布も診断材料にする。

## 関連項目

- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})
- [CV vs Leaderboard]({{ '/wiki/competition-strategy/cv-vs-leaderboard.html' | relative_url }})

## 参考文献

1. [LightGBM, “early_stopping”](https://lightgbm.readthedocs.io/en/v4.6.0/pythonapi/lightgbm.early_stopping.html)
2. [XGBoost, “Prediction”](https://xgboost.readthedocs.io/en/stable/prediction.html)
3. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)
4. [Kaggle, “March Machine Learning Mania 2026: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/march-machine-learning-mania-2026/writeups/march-machine-learning-mania-2026-1st-place-solut)
5. [Qiita, “LightGBMでearly stoppingを使う”](https://qiita.com/c60evaporator/items/2b7a2820d575e212bcf4/)

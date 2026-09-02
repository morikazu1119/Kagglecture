---
layout: default
title: Out-of-Fold Prediction
summary: 各Train行を、その行を学習していないfoldモデルで予測した値。公平なCV評価とStackingの基盤。
type: reference
domain: kaggle
topic: out-of-fold
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - competition-strategy
  - oof
  - validation
---

# Out-of-Fold Prediction

**Out-of-Fold（OOF）Predictionは、各Train行について「その行を学習に使っていないfoldモデル」が出した予測です。**

全Train行ぶんのOOFをつなぐと、Trainデータ全体に対して本番に近い未見予測を作れます。Kaggleでは**モデル比較、threshold選択、blend重み、Stacking、Calibration**の土台になります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#mechanism">仕組み</a>
  <a href="#uses">使い道</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 仕組み {#mechanism}

5-foldならFold 1の行はFold 2〜5相当のTrain部分で学習したモデル、Fold 2の行は別のTrain部分で学習したモデルから予測を受けます。

```text
row A in Fold 1 -> model trained without Fold 1 -> OOF pred A
row B in Fold 2 -> model trained without Fold 2 -> OOF pred B
...
全rowを元順序へ戻す -> complete OOF vector
```

scikit-learnの`cross_val_predict`も、各sampleが属さないTrain subsetでfitされたestimatorから予測を生成します（[cross_val_predict](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_predict.html)）。

## 使い道 {#uses}

| 用途 | なぜOOFが必要か |
|---|---|
| CV Metric | 未見予測として測るため |
| F1 threshold | Train全体の未見確率で選ぶため |
| Blend weight | 各モデルを同じ行で比較するため |
| Stacking | Meta modelのLeakageを防ぐため |
| Calibration | in-sample confidenceを避けるため |
| Error analysis | 失敗行を公平に見るため |

## Kaggleでの実例 {#kaggle-examples}

Predicting Student Health Risk 2026の4位解法は7-fold stratified OOFをモデル選択の中心にし、Public #414の最終候補を維持してPrivate #4となりました（[4th Place Solution](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)）。

30 Days of MLの1位解法はLevel 1/2のstacking評価と最終blendにOOF CVを使っています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

松尾研 DS Dojo #4の1位解法もGemmaのOOFを保存し、LightGBM Meta-Stackingの特徴へ使っています（[1st Place Solution](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)）。

## 注意点 {#pitfalls}

### 前処理がfold外

OOF予測だけfold化しても、Target Encodingや特徴選択を全Trainで先にfitすればリークします。**予測だけでなくpipeline全体をfold内に閉じる**必要があります。

### モデル間でsplitが違う

blend時に比較しにくくなります。可能なら共通fold IDを保存して全実験で再利用します。

### OOFも有限sample

OOFはLeaderboardより再利用しやすいですが、何千回も同じOOFで選択すれば過適合します。差の再現性、fold別差、複数seedも見ます。

## Quick Reference {#quick-reference}

- 各行は「自分を学習していないモデル」で予測する。
- fold IDを固定・保存する。
- preprocessingもfold内でfitする。
- OOF vectorを実験資産として保存する。
- Blend/Stacking/CalibrationはOOFを基準にする。

## 関連項目

- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [CV vs Leaderboard]({{ '/wiki/competition-strategy/cv-vs-leaderboard.html' | relative_url }})
- [Probability Calibration]({{ '/wiki/advanced-methods/probability-calibration.html' | relative_url }})

## 参考文献

1. [scikit-learn, “cross_val_predict”](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_predict.html)
2. [scikit-learn, “StackingRegressor”](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.StackingRegressor.html)
3. [Kaggle, “Predicting Student Health Risk: 4th Place - Trusting OOF”, 2026](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)
4. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
5. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)

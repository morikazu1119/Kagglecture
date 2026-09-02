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

Kaggleでは、**OOF予測でthresholdを選び、そのthresholdをtestへ適用する**のが基本です。Leaderboardだけでthresholdを調整するとPublic LBへ過適合しやすくなります。

## 平均方法 {#averaging}

| average | 意味 | 特徴 |
|---|---|---|
| binary | 指定positive classのみ | 二値分類 |
| macro | 各class F1を同じ重みで平均 | 少数classも重視 |
| weighted | class件数で重み付け | 大きいclassの影響が強い |
| micro | 全TP/FP/FNをまとめて計算 | 全体件数を重視 |

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

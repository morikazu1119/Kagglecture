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

Validation scoreが改善した地点を保存し、そこから`patience`回改善しなければ停止します。**停止した最後の重みではなく、best iteration / best checkpointを使う**のが要点です。

<div class="static-viz html-chart" aria-label="Early StoppingのValidation curve模式図">
  <div class="viz-heading"><div><div class="viz-title">best checkpointを保存し、改善が止まった後に停止する</div><p class="viz-subtitle">横軸=epoch、縦軸=Validation performance。模式例ではepoch 12付近がbestです。</p></div><span class="viz-badge">模式学習曲線</span></div>
  <svg viewBox="0 0 580 300" role="img" aria-label="epoch 12でbestになり、その後patience分改善せず停止する模式曲線">
    <line x1="58" y1="250" x2="540" y2="250" stroke="var(--border-strong)" stroke-width="2" />
    <line x1="58" y1="250" x2="58" y2="28" stroke="var(--border-strong)" stroke-width="2" />
    <path d="M65,220 C110,190 145,160 185,132 C230,100 270,76 312,66 C350,62 382,69 410,78 C445,89 480,101 530,115" fill="none" stroke="var(--text-secondary)" stroke-width="4" stroke-linecap="round" />
    <line x1="312" y1="42" x2="312" y2="250" stroke="var(--success)" stroke-width="2" stroke-dasharray="6 6" />
    <circle cx="312" cy="66" r="7" fill="var(--success)" />
    <line x1="455" y1="52" x2="455" y2="250" stroke="var(--danger)" stroke-width="2" stroke-dasharray="6 6" />
    <text x="312" y="34" text-anchor="middle" fill="var(--success)" font-size="12" font-weight="700">best checkpoint</text>
    <text x="455" y="44" text-anchor="middle" fill="var(--danger)" font-size="12" font-weight="700">stop</text>
    <text x="300" y="286" text-anchor="middle" fill="var(--text-secondary)" font-size="13">Epoch →</text>
    <text x="18" y="142" text-anchor="middle" fill="var(--text-secondary)" font-size="13" transform="rotate(-90 18 142)">Validation performance →</text>
  </svg>
  <p class="viz-caption">曲線とepoch番号は理解用の模式例です。実際のbest地点とpatienceはfold・metricごとに変わります。</p>
</div>

## 設定 {#settings}

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th scope="col">Parameter</th><th scope="col">意味</th><th scope="col">設計上の注意</th></tr></thead>
  <tbody>
    <tr><th scope="row">patience / stopping_rounds</th><td>何回改善なしを許すか</td><td>短すぎると伸びる前に止まる</td></tr>
    <tr><th scope="row">min_delta</th><td>改善とみなす最小差</td><td>metric noiseより小さすぎる差を追わない</td></tr>
    <tr><th scope="row">monitor</th><td>監視するValidation Metric</td><td>Competition目的へ近い指標を選ぶ</td></tr>
    <tr><th scope="row">mode</th><td>maximize / minimize</td><td>AUCとLossで方向が逆</td></tr>
  </tbody>
</table></div>

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

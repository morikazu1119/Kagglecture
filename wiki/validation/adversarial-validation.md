---
layout: default
title: Adversarial Validation
summary: TrainとTestを見分ける分類器を作り、分布差とCV mismatchを検出するValidation診断手法。
type: reference
domain: kaggle
topic: adversarial-validation
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - distribution-shift
  - leakage
---

# Adversarial Validation

**Adversarial Validationは、元のtargetを予測する代わりに「この行はTrainかTestか」を予測し、Train/Testの分布差を調べる方法です。**

TrainとTestを高精度で見分けられるなら、手元のCVがLeaderboard条件を再現できていない可能性があります。主用途はスコアを直接上げることではなく、**distribution shiftの診断**です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#interpretation">読み方</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

- CVは改善するのにPublic LBが悪化する。
- train/testの時期、地域、装置、取得元が異なる。
- 欠損率やカテゴリ出現率がtrain/testで違う。
- 特定特徴量がsplit識別器にだけ強く効く。

## 仕組み {#mechanism}

1. Trainに`is_test=0`、Testに`is_test=1`を付ける。
2. 元targetは使わず、`is_test`を予測する分類器を学習する。
3. OOF ROC-AUCなどで「見分けやすさ」を測る。
4. feature importanceやSHAPで分布差の原因を見る。

下の模式図では、Train/Testの分布差を大きくすると識別しやすくなる感覚を確認できます。数値は説明用で、実測AUCではありません。

<div class="interactive-viz" data-interactive="adversarial-shift">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">Train/Testの分布差を動かす</div>
      <p class="interactive-viz__subtitle">同じ特徴量でも分布が離れるほど、Train/Test識別器は手掛かりを得やすくなります。</p>
    </div>
    <span class="interactive-status" data-av-status data-state="safe">見分けにくい / shift 0</span>
  </div>
  <p class="interactive-note">模式例。実CompetitionのAUCや特徴分布ではありません。</p>
  <div class="interactive-control-row">
    <span class="interactive-control-label">分布差</span>
    <label class="interactive-range">
      <input type="range" min="0" max="60" step="5" value="10" data-av-shift aria-label="TrainとTestの分布差">
      <span class="interactive-range-labels"><span>小さい</span><span>大きい</span></span>
    </label>
  </div>
  <div class="distribution-board" aria-label="TrainとTestの模式分布">
    <div class="distribution-row"><span>Train</span><div class="distribution-track" data-av-train></div></div>
    <div class="distribution-row"><span>Test</span><div class="distribution-track" data-av-test></div></div>
  </div>
  <p class="interactive-explanation" data-av-explanation aria-live="polite">TrainとTestの模式分布が近く、識別器は特徴だけでは見分けにくい状態です。</p>
  <noscript><p class="interactive-explanation">Train/Testを高精度で識別できるほど分布差を疑います。ただしAUC値だけでなく、差を作る特徴を確認します。</p></noscript>
</div>

## 読み方 {#interpretation}

AUC=0.5付近なら識別器はほぼランダムです。AUCが高いほどTrain/Testを区別しやすいですが、**「0.6なら危険、0.8なら必ずCVを変更」のような普遍的閾値はありません**。識別に使われた特徴と、本番targetへの関係を確認します。

## Kaggleでの実例 {#kaggle-examples}

MWS Cup 2022の1位解法では、Train/Test識別の10-fold OOF AUCが0.848で、train=2020年、test=2022年という分布差に対応してAdversarial Validationを試しています。通常OOFよりPublic LBに近い場合もあった一方、相関は確実ではなかったと報告しています（[1st place solution](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)）。

IEEE-CIS Fraud Detectionの41位解法では、特徴ごとにTrainとprivate testを識別し、Adversarial Validation AUCが60%以下の特徴だけを残す分岐も作っています（[41st place solution](https://www.kaggle.com/competitions/ieee-fraud-detection/writeups/lets-try-not-to-drop-1000-places-41st-place-soluti)）。

## 注意点 {#pitfalls}

### AUCだけで特徴を消す

Train/Testを区別できる特徴が、元target予測にも本番で有効なことがあります。split識別力だけを理由に削除すると信号まで失う可能性があります。

### testを使った選択のしすぎ

Adversarial Validationを何度も見て特徴量や重みを最適化すると、test分布への間接的な過適合になります。診断と仮説検証に使い、選択自由度を増やしすぎない方が安全です。

### hidden private分布は見えない

公開test featuresが最終評価対象と完全に同じ分布とは限りません。特に時間進行型Competitionでは注意が必要です。

## Quick Reference {#quick-reference}

- targetではなくTrain/Testラベルを予測する。
- AUCが高いほど分布差を疑う。
- 重要なのはAUC値より「何が識別しているか」。
- 特徴削除は元targetのCVとセットで判断する。
- CV-LB mismatchの診断に使う。

## 関連項目

- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})

## 参考文献

1. [Kaggle, “MWS Cup 2022: 1st place solution”, 2022](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)
2. [Kaggle, “IEEE-CIS Fraud Detection: 41st place solution”](https://www.kaggle.com/competitions/ieee-fraud-detection/writeups/lets-try-not-to-drop-1000-places-41st-place-soluti)
3. [Kaggle, “Predicting Student Health Risk: Adversarial Validation Insight”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/discussion/718921)
4. [Qiita, “一流の「ものさし」職人になろう Cross Validationを深堀り”, 2019](https://qiita.com/Hatomugi/items/620c1bc757266b00e87f)

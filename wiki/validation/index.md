---
layout: default
title: Validation & Split
description: KaggleのValidationとデータ分割手法を調べるためのカテゴリ索引。
summary: Hold-out、KFold、Stratified、Group、Time Series、Adversarial Validation、Leakage。
type: category-index
nav_order: 1
permalink: /wiki/validation/
---

# Validation & Split

Validationは、**「このモデル、本番の知らないデータでもちゃんと当たる？」を手元で確かめる仕組み**です。

分け方を間違えると、手元では高スコアなのにLeaderboardでは全然ダメ、ということが起きます。データの作られ方に合わせてSplitを選ぶのが重要です。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/kfold.html' | relative_url }}" aria-label="KFold を開く">
    <h3>KFold</h3>
    <p>データをK個に分け、各foldを1回ずつValidationにする基本的なCross Validation。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/stratified-kfold.html' | relative_url }}" aria-label="StratifiedKFold を開く">
    <h3>StratifiedKFold</h3>
    <p>各foldのクラス比を元データに近づける、不均衡分類向けの分割。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/group-kfold.html' | relative_url }}" aria-label="GroupKFold を開く">
    <h3>GroupKFold</h3>
    <p>同じ患者・ユーザー・セッションなどをTrainとValidationにまたがせない分割。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/time-series-split.html' | relative_url }}" aria-label="TimeSeriesSplit を開く">
    <h3>TimeSeriesSplit</h3>
    <p>過去で学習し未来で評価する、時間順序を壊さない分割。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/adversarial-validation.html' | relative_url }}" aria-label="Adversarial Validation を開く">
    <h3>Adversarial Validation</h3>
    <p>Train/Testを見分ける分類器で分布差とCV mismatchを診断する。</p>
  </a>
</div>

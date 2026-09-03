---
layout: default
title: Validation & Split
description: KaggleのValidationとデータ分割手法を、守るべき構造ごとに調べるカテゴリ索引。
summary: 基本CV、class比、group、time、distribution shift、leakage。
type: category-index
nav_order: 1
permalink: /wiki/validation/
---

# Validation & Split

Validationは、**「このモデル、本番の知らないデータでもちゃんと当たる？」を手元で確かめる仕組み**です。

Splitは名前で選ぶのではなく、**何をTrainとValidationの間で分離しなければならないか**で選びます。

## まず確認: Leakage

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/data-leakage.html' | relative_url }}"><h3>Data Leakage</h3><p>予測時に利用できない情報が学習やValidationへ混ざり、CVを不当に高くする問題。</p></a>
</div>

## 基本のCross Validation

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/kfold.html' | relative_url }}"><h3>KFold</h3><p>データをK個に分け、各foldを1回ずつValidationにする基本形。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/stratified-kfold.html' | relative_url }}"><h3>StratifiedKFold</h3><p>各foldのclass比を元データに近づける、不均衡分類向けの分割。</p></a>
</div>

## Patient / User / Sessionなどを分離

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/group-kfold.html' | relative_url }}"><h3>GroupKFold</h3><p>同じ患者・ユーザー・セッションなどをTrainとValidationにまたがせない。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/stratified-group-kfold.html' | relative_url }}"><h3>StratifiedGroupKFold</h3><p>groupを完全分離しながらclass比もできるだけ揃える。</p></a>
</div>

## 時間・Train/Test分布を守る

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/time-series-split.html' | relative_url }}"><h3>TimeSeriesSplit</h3><p>過去で学習し未来で評価する、時間順序を壊さない分割。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/adversarial-validation.html' | relative_url }}"><h3>Adversarial Validation</h3><p>Train/Testを見分ける分類器で分布差とCV mismatchを診断する。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card"><h4>独立sample</h4><dl><dt>第一候補</dt><dd>KFold</dd><dt>不均衡分類</dt><dd>StratifiedKFold</dd></dl></section>
  <section class="comparison-card is-primary"><h4>同一entityが複数row</h4><dl><dt>第一候補</dt><dd>GroupKFold</dd><dt>class比も重要</dt><dd>StratifiedGroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>未来予測</h4><dl><dt>第一候補</dt><dd>TimeSeriesSplit</dd><dt>重要</dt><dd>feature生成も未来参照禁止</dd></dl></section>
  <section class="comparison-card"><h4>Train/Testが違いそう</h4><dl><dt>診断</dt><dd>Adversarial Validation</dd><dt>目的</dt><dd>CVと本番の分布差確認</dd></dl></section>
</div>

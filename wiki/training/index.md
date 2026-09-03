---
layout: default
title: Training
description: Kaggleの学習手法を、学習制御・data・loss・representationごとに調べるカテゴリ索引。
summary: Early Stopping、Augmentation、Loss、Target Encoding、Pretrainingを目的別に整理する。
type: category-index
nav_order: 4
permalink: /wiki/training/
---

# Training

Trainingは、**「モデルをどう学習させるか」**に関する手法です。

同じarchitectureでも、停止条件・入力変換・loss・pretraining・feature encodingで結果は大きく変わります。ここでは**何を変える手法か**で分けます。

## 学習を止める・安定させる

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/early-stopping.html' | relative_url }}"><h3>Early Stopping</h3><p>Validation改善が止まった時点で学習を止め、best checkpointを使う。</p></a>
</div>

## 入力を増やす・混ぜる

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/data-augmentation.html' | relative_url }}"><h3>Data Augmentation</h3><p>targetを保つ変換で学習sampleを増やし、不要な変化への過適合を抑える。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/mixup-cutmix.html' | relative_url }}"><h3>Mixup / CutMix</h3><p>sampleとlabelを混ぜて中間sampleを作るstrong augmentation。</p></a>
</div>

## Lossで学習対象の重みを変える

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/focal-loss.html' | relative_url }}"><h3>Focal Loss</h3><p>easy sampleのlossを抑え、hard exampleへ学習を集中させる。</p></a>
</div>

## Feature Representation / Encoding

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/target-encoding.html' | relative_url }}"><h3>Target Encoding</h3><p>categoryごとのtarget統計をfeature化する。fold内計算によるLeakage対策が必須。</p></a>
</div>

## Pretraining / Transfer

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }}"><h3>Pretraining / Transfer Learning</h3><p>大規模・関連taskのpretrained weightをCompetitionへ転移する。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card"><h4>過学習し始める</h4><dl><dt>見る記事</dt><dd>Early Stopping</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Dataが少ない</h4><dl><dt>画像等</dt><dd>Augmentation / Mixup / CutMix</dd><dt>既存weight</dt><dd>Transfer Learning</dd></dl></section>
  <section class="comparison-card"><h4>不均衡・easy negative過多</h4><dl><dt>候補</dt><dd>Focal Loss</dd><dt>注意</dt><dd>Metricとは別にOOF確認</dd></dl></section>
  <section class="comparison-card"><h4>Categoryを数値へ</h4><dl><dt>候補</dt><dd>Target Encoding</dd><dt>注意</dt><dd>fold内fit</dd></dl></section>
</div>

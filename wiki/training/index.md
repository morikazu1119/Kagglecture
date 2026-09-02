---
layout: default
title: Training
description: Kaggleの学習手法を調べるためのカテゴリ索引。
summary: Augmentation、Loss、Target Encoding、Pretraining、Early Stopping。
type: category-index
nav_order: 4
permalink: /wiki/training/
---

# Training

Trainingは、**「モデルをどう学習させるか」**に関する手法です。

学習停止、target由来特徴、augmentation、loss、pretrainingなど、モデル性能とValidationの信頼性を左右する設計を扱います。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/early-stopping.html' | relative_url }}" aria-label="Early Stopping を開く"><h3>Early Stopping</h3><p>Validation改善が止まった時点で学習を止め、best checkpointを使う。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/target-encoding.html' | relative_url }}" aria-label="Target Encoding を開く"><h3>Target Encoding</h3><p>カテゴリごとのtarget統計を特徴量化する。fold内計算によるLeakage対策が必須。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/data-augmentation.html' | relative_url }}" aria-label="Data Augmentation を開く"><h3>Data Augmentation</h3><p>targetを保つ変換で学習sampleを増やし、不要な変化への過適合を抑える。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/mixup-cutmix.html' | relative_url }}" aria-label="Mixup / CutMix を開く"><h3>Mixup / CutMix</h3><p>sampleとlabelを混ぜて中間sampleを作るstrong augmentation。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/focal-loss.html' | relative_url }}" aria-label="Focal Loss を開く"><h3>Focal Loss</h3><p>easy sampleのlossを抑え、hard exampleへ学習を集中させる。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }}" aria-label="Pretraining / Transfer Learning を開く"><h3>Pretraining / Transfer Learning</h3><p>大規模・関連taskのpretrained weightをCompetitionへ転移する。</p></a>
</div>

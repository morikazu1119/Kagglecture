---
layout: default
title: Ensemble
description: KaggleのEnsemble手法を調べるためのカテゴリ索引。
summary: Averaging、Weighted Blend、Rank Average、Stacking、Fold / Seed Ensemble。
type: category-index
nav_order: 6
permalink: /wiki/ensemble/
---

# Ensemble

Ensembleは、**複数モデルの予測を組み合わせて、1つのモデルより安定した予測を作る方法**です。

単体性能だけでなく、モデル同士の誤差の違いを利用してスコアと再現性を高めます。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/weighted-average.html' | relative_url }}" aria-label="Weighted Average を開く"><h3>Weighted Average</h3><p>複数モデルの予測をCVで選んだ重み付き平均で統合する基本Ensemble。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/stacking.html' | relative_url }}" aria-label="Stacking を開く"><h3>Stacking</h3><p>OOF予測を特徴量としてMeta modelに組合せ方を学習させる。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/rank-averaging.html' | relative_url }}" aria-label="Rank Averaging を開く"><h3>Rank Averaging</h3><p>予測を順位へ変換してから平均し、モデル間のscale差を吸収する。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }}" aria-label="Fold / Seed Ensemble を開く"><h3>Fold / Seed Ensemble</h3><p>foldやseed違いモデルを平均し、学習の偶然性による予測分散を減らす。</p></a>
</div>

---
layout: default
title: Recommendation & Ranking
description: Kaggleの推薦・ランキング問題を、候補生成・ranking・sampling・評価設計ごとに調べるカテゴリ索引。
summary: Candidate Generationを起点に、巨大なitem集合から予測対象を絞り、rankingへつなぐ設計を整理する。
type: category-index
nav_order: 9
permalink: /wiki/recommendation/
---

# Recommendation & Ranking

Recommendation & Rankingでは、**大量のitemから候補を絞り、その中をuser / sessionごとに順位付けする問題**を扱います。

特に大規模推薦では、最初から全itemを高コストmodelで採点せず、**retrieval / candidate generationとrankingを分ける2-stage設計**が重要です。

## 候補を絞る

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/recommendation/candidate-generation.html' | relative_url }}"><h3>Candidate Generation</h3><p>全itemから「正解を落とさず、rankerが処理できるサイズ」へ候補集合を絞る。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>item数が多すぎる</h4><dl><dt>最初に見る</dt><dd>Candidate Generation</dd><dt>評価</dt><dd>candidate Recall@K</dd></dl></section>
  <section class="comparison-card"><h4>候補はすでに与えられる</h4><dl><dt>主問題</dt><dd>Ranking / feature engineering</dd><dt>注意</dt><dd>人工的な候補生成を追加しない</dd></dl></section>
  <section class="comparison-card"><h4>学習negativeが多すぎる</h4><dl><dt>論点</dt><dd>Negative Sampling</dd><dt>注意</dt><dd>候補生成とsamplingを混同しない</dd></dl></section>
</div>

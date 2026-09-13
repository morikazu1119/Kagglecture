---
layout: default
title: Recommendation & Ranking
description: Kaggleの推薦・ランキング問題を、候補生成・ranking・sampling・評価設計ごとに調べるカテゴリ索引。
summary: Candidate Generation、Negative Sampling、Learning to Rankを軸に、候補を絞って学習データを作り、user / sessionごとに順位付けする設計を整理する。
type: category-index
nav_order: 9
permalink: /wiki/recommendation/
---

# Recommendation & Ranking

Recommendation & Rankingでは、**大量のitemから候補を絞り、その中をuser / sessionごとに順位付けする問題**を扱います。

大規模推薦では、まずCandidate Generationで高Recallな候補集合を作り、学習時は必要に応じてNegative Samplingで負例分布を制御し、その後Learning to Rankで候補内の順序を精密化する設計が頻出します。一方、test rows自体が既定候補ならCandidate Generationを省き、rankingから始めます。

## 候補を絞る

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/recommendation/candidate-generation.html' | relative_url }}"><h3>Candidate Generation</h3><p>全itemから「正解を落とさず、rankerが処理できるサイズ」へ候補集合を絞る。</p></a>
</div>

## 学習データを作る

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/recommendation/negative-sampling.html' | relative_url }}"><h3>Negative Sampling</h3><p>大量の負例を間引き、学習量と「どんな負例を見せるか」を制御する。</p></a>
</div>

## 候補を並べる

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/recommendation/learning-to-rank.html' | relative_url }}"><h3>Learning to Rank / LambdaMART</h3><p>同じuser / session / query内の候補を比較し、NDCGやMAPなどTop-Kの順位を意識してscoreを学習する。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>item数が多すぎる</h4><dl><dt>最初に見る</dt><dd>Candidate Generation</dd><dt>評価</dt><dd>candidate Recall@K</dd></dl></section>
  <section class="comparison-card"><h4>候補はあるが順序が弱い</h4><dl><dt>主問題</dt><dd>Learning to Rank</dd><dt>評価</dt><dd>NDCG / MAP / Recall等</dd></dl></section>
  <section class="comparison-card"><h4>候補はすでに与えられる</h4><dl><dt>主問題</dt><dd>Ranking / feature engineering</dd><dt>注意</dt><dd>人工的な候補生成を追加しない</dd></dl></section>
  <section class="comparison-card"><h4>学習negativeが多すぎる</h4><dl><dt>論点</dt><dd>Negative Sampling</dd><dt>注意</dt><dd>候補生成とsamplingを混同しない</dd></dl></section>
</div>

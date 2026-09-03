---
layout: default
title: Competition Strategy
description: KaggleのCV・Leaderboard・再現性など、model以外の競技戦略を調べるカテゴリ索引。
summary: OOF基盤とCV-LB判断を分けて整理する。
type: category-index
nav_order: 7
permalink: /wiki/competition-strategy/
---

# Competition Strategy

Competition Strategyでは、**modelそのもの以外でscoreを正しく伸ばすための考え方**を扱います。

現状の記事は少ないため、無理に細分化しすぎず、**実験基盤**と**Leaderboard判断**の2群に分けます。

## 実験・評価の基盤

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }}"><h3>Out-of-Fold Prediction</h3><p>各Train rowを、そのrowを学習していないfold modelでpredictした値。公平なmodel比較・blend・stackingの基盤。</p></a>
</div>

## CVとLeaderboardの判断

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/competition-strategy/cv-vs-leaderboard.html' | relative_url }}"><h3>CV vs Leaderboard</h3><p>Local CVを選択の主軸、Public LBを整合性確認として使い分け、shake-upやLB overfittingを避ける。</p></a>
</div>

## このカテゴリで今後扱う範囲

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>Experiment foundation</h4><dl><dt>例</dt><dd>OOF / fold固定 / reproducibility</dd><dt>目的</dt><dd>比較可能な実験資産を作る</dd></dl></section>
  <section class="comparison-card"><h4>Selection strategy</h4><dl><dt>例</dt><dd>CV-LB correlation / shake-up</dd><dt>目的</dt><dd>Public LB noiseへ過適合しない</dd></dl></section>
  <section class="comparison-card"><h4>Budget strategy</h4><dl><dt>今後</dt><dd>Inference budget / experiment prioritization</dd><dt>目的</dt><dd>限られた時間・GPUを配分する</dd></dl></section>
</div>

---
layout: default
title: Competition Strategy
description: KaggleのCV・Leaderboard・再現性などのコンペ戦略を調べるためのカテゴリ索引。
summary: CV-LB correlation、Leaderboard overfitting、Shake-up、Inference budget、再現性。
type: category-index
nav_order: 7
permalink: /wiki/competition-strategy/
---

# Competition Strategy

Competition Strategyでは、**モデルそのもの以外でスコアを正しく伸ばすための考え方**を扱います。

OOFを中心に再現可能な実験を作り、Public Leaderboardのsampling noiseへ過適合しないための判断方法を整理します。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }}" aria-label="Out-of-Fold Prediction を開く">
    <h3>Out-of-Fold Prediction</h3>
    <p>各Train行を、その行を学習していないfoldモデルで予測した値。</p>
  </a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/competition-strategy/cv-vs-leaderboard.html' | relative_url }}" aria-label="CV vs Leaderboard を開く">
    <h3>CV vs Leaderboard</h3>
    <p>Local CVを選択の主軸、Public LBを整合性確認として使い分ける。</p>
  </a>
</div>

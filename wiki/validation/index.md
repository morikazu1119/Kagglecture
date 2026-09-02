---
layout: default
title: Validation & Split
description: KaggleのValidationとデータ分割手法を調べるためのカテゴリ索引。
type: category-index
permalink: /wiki/validation/
---

# Validation & Split

Validationは、**「このモデル、本番の知らないデータでもちゃんと当たる？」を手元で確かめる仕組み**です。

分け方を間違えると、手元では高スコアなのにLeaderboardでは全然ダメ、ということが起きます。データの作られ方に合わせてSplitを選ぶのが重要です。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/validation/group-kfold.html' | relative_url }}" aria-label="GroupKFold を開く">
    <h3>GroupKFold</h3>
    <p>同じ患者・ユーザー・セッションなどをTrainとValidationにまたがせない分割。</p>
  </a>
</div>

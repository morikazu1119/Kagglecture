---
layout: default
title: Modeling
description: Kaggleのモデル・アーキテクチャを調べるためのカテゴリ索引。
summary: GBDT、CNN、Transformer、Foundation Model、モデル選択。
type: category-index
nav_order: 3
permalink: /wiki/modeling/
---

# Modeling

Modelingは、**「入力データからどう予測を作るか」**を決める部分です。

まず表形式Kaggleで頻出するGBDTを、実装差と使い分けまで含めて整理します。

## Articles

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}" aria-label="LightGBM を開く"><h3>LightGBM</h3><p>Histogramとleaf-wise成長で高速な、表形式データの定番GBDT。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/xgboost.html' | relative_url }}" aria-label="XGBoost を開く"><h3>XGBoost</h3><p>正則化とsamplingを細かく制御できる、成熟したGBDT実装。</p></a>
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/modeling/catboost.html' | relative_url }}" aria-label="CatBoost を開く"><h3>CatBoost</h3><p>Ordered Boostingとカテゴリ特徴処理を備えたGBDT。</p></a>
</div>

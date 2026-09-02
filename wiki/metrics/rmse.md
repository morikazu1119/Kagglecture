---
layout: default
title: RMSE
summary: 誤差を二乗して平均し平方根を取ることで、大きな予測ミスを強く罰する回帰指標。
type: reference
domain: kaggle
topic: rmse
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - metrics
  - regression
  - rmse
---

# RMSE

**RMSE（Root Mean Squared Error）は、予測誤差を二乗して平均し、その平方根を取る回帰指標です。**

大きな誤差ほど二乗で強く効くため、巨大な外れミスを減らしたい問題に向きます。値は小さいほど良く、単位はtargetと同じです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#formula">数式</a>
  <a href="#intuition">直感</a>
  <a href="#comparison">MAEとの比較</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 数式 {#formula}

$$
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat{y}_i)^2}
$$

誤差2と誤差10では、二乗後は4と100になるため、大きなミスがスコアを支配しやすくなります。

## 直感 {#intuition}

「平均的にどの程度外しているか」をtargetと同じ単位で見られますが、MAEより**大外しへの罰が強い**のが特徴です。

## MAEとの比較 {#comparison}

| 指標 | 大きな誤差への罰 | 外れ値への敏感さ |
|---|---|---|
| **RMSE** | 強い | 高い |
| MAE | 線形 | 低め |

大きな誤差自体が重要な失敗ならRMSEが自然です。外れ値がノイズで、全誤差を同じ重みで扱いたいならMAEが合いやすくなります。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLはRMSEで評価されます（[Competition Evaluation](https://www.kaggle.com/competitions/30-days-of-ml)）。1位解法はCVとPublic LBの相関を確認し、最終OOF CV 0.715437、Public LB 0.71694、Private LB 0.71533を報告しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

この例は、RMSE最適化そのものだけでなく、**同じRMSEをOOFで安定して測れるValidation**が重要であることを示します。

## 注意点 {#pitfalls}

### target scale

targetが対数変換されている場合、log-space RMSEと元単位RMSEは別物です。Competitionがどの空間で採点するか確認します。

### 外れ値に引っ張られる

少数の巨大誤差でCVが大きく動く場合、fold別RMSEとerror distributionを確認します。

### fold平均と全OOF RMSE

foldサイズが違うと単純平均と全OOFから計算したRMSEは一致しません。Competition比較では計算方法を固定します。

## Quick Reference {#quick-reference}

- 小さいほど良い。
- targetと同じ単位。
- 大きな誤差を強く罰する。
- 外れ値の影響を受けやすい。
- CVもCompetitionと同じ変換・式で計算する。

## 関連項目

- [MAE]({{ '/wiki/metrics/mae.html' | relative_url }})
- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. [Kaggle, “30 Days of ML: Evaluation”, 2021](https://www.kaggle.com/competitions/30-days-of-ml)
2. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
3. [Qiita, “Kaggleコンペで出されるタスクと評価指標まとめてみた”, 2022](https://qiita.com/charles_gs/items/96dc8eeea22f3acd01ad)

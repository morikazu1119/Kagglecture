---
layout: default
title: KFold
summary: データをK個に分け、各foldを1回ずつValidationにして汎化性能を測る基本的なCross Validation。
type: reference
domain: kaggle
topic: kfold
created: 2026-09-03
updated: 2026-09-03
source_count: 3
tags:
  - kaggle
  - validation
  - cross-validation
---

# KFold

**KFoldは、学習データをK個のfoldに分け、1個をValidation、残りをTrainとしてK回評価するCross Validationです。**

1回のHold-outより多くのデータを評価に使えるため、モデル変更の良し悪しを安定して比較しやすくなります。ただし、行同士が独立でないデータや時系列では、そのまま使うとリークすることがあります（[scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board" aria-label="KFoldが向く状況と代替Split">
  <section class="comparison-card is-primary"><h4>各行がほぼ独立</h4><dl><dt>判断</dt><dd>KFoldが向いている</dd><dt>例</dt><dd>単純な表形式回帰</dd></dl></section>
  <section class="comparison-card"><h4>クラス不均衡が強い</h4><dl><dt>判断</dt><dd>StratifiedKFoldを優先</dd><dt>守るもの</dt><dd>class比率</dd></dl></section>
  <section class="comparison-card"><h4>同一患者・userが複数行</h4><dl><dt>判断</dt><dd>GroupKFoldを優先</dd><dt>守るもの</dt><dd>group境界</dd></dl></section>
  <section class="comparison-card"><h4>未来を予測する時系列</h4><dl><dt>判断</dt><dd>Time-based splitを優先</dd><dt>守るもの</dt><dd>時間順序</dd></dl></section>
</div>

## 仕組み {#mechanism}

5-foldなら、各サンプルは**4回Trainに使われ、1回Validationに使われます**。下の模式図でValidation foldを切り替えると、同じsampleが順番に評価側へ回ることを確認できます。

<div class="interactive-viz" data-interactive="kfold-basic">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">5-foldでValidationを切り替える</div>
      <p class="interactive-viz__subtitle">緑 = Validation。各sampleは5回のうち1回だけValidationになります。</p>
    </div>
    <span class="interactive-status" data-kfold-status data-state="safe">Fold 1 / Train 12 / Validation 3</span>
  </div>
  <div class="interactive-control-row" role="group" aria-label="Validation fold">
    <span class="interactive-control-label">Validation</span>
    <button type="button" class="interactive-button is-active" data-kfold-fold="1" aria-pressed="true">Fold 1</button>
    <button type="button" class="interactive-button" data-kfold-fold="2" aria-pressed="false">Fold 2</button>
    <button type="button" class="interactive-button" data-kfold-fold="3" aria-pressed="false">Fold 3</button>
    <button type="button" class="interactive-button" data-kfold-fold="4" aria-pressed="false">Fold 4</button>
    <button type="button" class="interactive-button" data-kfold-fold="5" aria-pressed="false">Fold 5</button>
  </div>
  <div class="sample-grid" data-kfold-grid aria-label="TrainとValidationのsample">
    <span class="sample-chip is-validation">S1</span><span class="sample-chip is-train">S2</span><span class="sample-chip is-train">S3</span><span class="sample-chip is-train">S4</span><span class="sample-chip is-train">S5</span>
    <span class="sample-chip is-validation">S6</span><span class="sample-chip is-train">S7</span><span class="sample-chip is-train">S8</span><span class="sample-chip is-train">S9</span><span class="sample-chip is-train">S10</span>
    <span class="sample-chip is-validation">S11</span><span class="sample-chip is-train">S12</span><span class="sample-chip is-train">S13</span><span class="sample-chip is-train">S14</span><span class="sample-chip is-train">S15</span>
  </div>
  <p class="interactive-explanation" data-kfold-explanation aria-live="polite">Fold 1では3 sampleだけをValidationにし、残り12 sampleで学習します。</p>
  <noscript><p class="interactive-explanation">KFoldでは各sampleが1回ずつValidationになり、残りの回ではTrainに使われます。</p></noscript>
</div>

最終的には各foldのスコア平均や、全行のOut-of-Fold予測から計算したスコアでモデルを比較します。

## 使い分け {#comparison}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th scope="col">手法</th><th scope="col">守るもの</th><th scope="col">主な用途</th></tr></thead>
  <tbody>
    <tr><th scope="row">Hold-out</th><td>1回だけ分離</td><td>高速な初期実験</td></tr>
    <tr><th scope="row">KFold</th><td>各行を均等に評価</td><td>独立サンプル</td></tr>
    <tr><th scope="row">StratifiedKFold</th><td>クラス比</td><td>不均衡分類</td></tr>
    <tr><th scope="row"><a href="{{ '/wiki/validation/group-kfold.html' | relative_url }}">GroupKFold</a></th><td>group境界</td><td>患者・user等</td></tr>
    <tr><th scope="row">TimeSeriesSplit</th><td>時間順序</td><td>時系列</td></tr>
  </tbody>
</table>
</div>

## Kaggleでの実例 {#kaggle-examples}

UOS AIBA 2202 Competition1の1位解法では、LightGBMのベースラインを5-fold KFoldで評価しています（[1st place solution](https://www.kaggle.com/competitions/uos-aiba-2202-competition1/writeups/kentak0928-appreciate-the-host-and-sharing-my-appr)）。

一方、上位解法ではデータ生成構造に応じてKFoldをそのまま使わず、Stratified、Group、時間分割へ置き換える例も多くあります。**KFoldはデフォルトではなく、独立性を確認した上で選ぶ基本形**と考えるのが安全です。

## 注意点 {#pitfalls}

### 同一主体がfoldをまたぐ

同じ患者の複数画像や同じユーザーの複数ログが別foldに入ると、Validationが本番より簡単になります。この場合は[GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})を使います。

### 時系列をshuffleする

未来の情報で過去を予測する評価になり、本番条件と逆転することがあります。未来予測では時間軸を壊さない分割が必要です。

### foldごとに前処理をfitしていない

標準化、特徴選択、Target Encoding、欠損補完などを全データでfitしてからKFoldすると、Validationの情報がTrainへ混ざります。前処理もfold内でfitします。

## Quick Reference {#quick-reference}

- 行が独立しているかを最初に確認する。
- 5-fold前後は計算量と安定性のバランスを取りやすい。
- 分類でクラス偏りがあるならStratifiedを検討する。
- group・時間・重複があるなら通常KFoldを使わない。
- 前処理は各foldのTrainだけでfitする。

## 関連項目

- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Cross-validation: evaluating estimator performance”](https://scikit-learn.org/stable/modules/cross_validation.html)
2. [Kaggle, “UOS AIBA 2202 Competition1: 1st place solution”, 2023](https://www.kaggle.com/competitions/uos-aiba-2202-competition1/writeups/kentak0928-appreciate-the-host-and-sharing-my-appr)
3. [Qiita, “一流の「ものさし」職人になろう Cross Validationを深堀り”, 2019](https://qiita.com/Hatomugi/items/620c1bc757266b00e87f)

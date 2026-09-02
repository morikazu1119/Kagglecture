---
layout: default
title: StratifiedKFold
summary: 各foldのクラス比を元データに近づけながらKFoldする分類向けCross Validation。
type: reference
domain: kaggle
topic: stratified-kfold
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - classification
  - imbalance
---

# StratifiedKFold

**StratifiedKFoldは、各foldに含まれるクラスの比率を元データとできるだけ近く保ちながらKFoldする方法です。**

陽性が少ない分類で、あるfoldに陽性がほとんど入らず評価指標が不安定になる問題を抑えます（[scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html#stratified-k-fold)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board" aria-label="StratifiedKFoldを選ぶ状況">
  <section class="comparison-card is-primary"><h4>二値分類でpositiveが少ない</h4><dl><dt>選択</dt><dd>StratifiedKFold</dd></dl></section>
  <section class="comparison-card"><h4>多クラスで少数classがある</h4><dl><dt>選択</dt><dd>StratifiedKFold</dd></dl></section>
  <section class="comparison-card"><h4>groupも守る必要がある</h4><dl><dt>選択</dt><dd>StratifiedGroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>時系列分類</h4><dl><dt>優先</dt><dd>時間分割</dd></dl></section>
  <section class="comparison-card"><h4>回帰</h4><dl><dt>基本</dt><dd>KFold</dd><dt>補足</dt><dd>target bin化は設計を慎重に検討</dd></dl></section>
</div>

## 仕組み {#mechanism}

たとえば全体が「class 0 = 90%、class 1 = 10%」なら、各foldもおおむね90:10になるように分割します。通常KFoldでは偶然、少数クラスが一部foldへ偏ることがあります。

<div class="static-viz html-chart" aria-label="StratifiedKFoldで各foldのpositive比率を揃える模式グラフ">
  <div class="viz-heading"><div><div class="viz-title">少数classの比率をfold間で揃える</div><p class="viz-subtitle">棒の長さはpositive率。模式例では全体10%に対して各foldも10%へ近づけます。</p></div><span class="viz-badge">模式例</span></div>
  <div class="html-bar-chart">
    <div class="html-bar-row is-highlight"><span class="html-bar-label">全体</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Fold 1</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Fold 2</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Fold 3</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Fold 4</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Fold 5</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:10"></span></span><span class="html-bar-value">10%</span></div>
  </div>
  <p class="viz-caption">比率は仕組みを説明する人工例です。実データでは整数制約やgroup制約により完全一致しない場合があります。</p>
</div>

scikit-learnも、StratifiedKFoldは各foldでクラス比をおおむね維持すると説明しています。ただしこれは**クラス比を守るための工学的な分割**で、データの独立性や本番分布を保証するものではありません（[scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html#stratified-k-fold)）。

## 使い分け {#comparison}

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th scope="col">手法</th><th scope="col">クラス比</th><th scope="col">group</th><th scope="col">時間順序</th></tr></thead>
  <tbody>
    <tr><th scope="row">KFold</th><td>×</td><td>×</td><td>×</td></tr>
    <tr><th scope="row">StratifiedKFold</th><td class="status-good">○</td><td>×</td><td>×</td></tr>
    <tr><th scope="row"><a href="{{ '/wiki/validation/group-kfold.html' | relative_url }}">GroupKFold</a></th><td>×</td><td class="status-good">○</td><td>×</td></tr>
    <tr><th scope="row">StratifiedGroupKFold</th><td class="status-good">○に近づける</td><td class="status-good">○</td><td>×</td></tr>
    <tr><th scope="row">Time-based split</th><td>設計次第</td><td>設計次第</td><td class="status-good">○</td></tr>
  </tbody>
</table></div>

## Kaggleでの実例 {#kaggle-examples}

Tabular Playground Series Nov 2022の1位解法は、モデルにより10-foldまたは20-foldのStratifiedKFoldを使い、stackingとblendをCVで選択しています（[1st Place Solution](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)）。

Medical AI Contest 7th 2025の1位解法でも、カテゴリで層化した5-fold StratifiedKFoldが使われています（[1st Place Solution](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)）。

## 注意点 {#pitfalls}

### group leakageは防げない

同じ患者の画像がTrainとValidationに分かれても、クラス比だけはきれいに揃います。見た目のfold品質に騙されず、groupがあるならGroup系を優先します。

### fold間のスコア分散を小さく見せることがある

scikit-learnは、stratificationによりfoldが均質化され、少数クラスに由来する不確実性が見えにくくなる場合があると注意しています（[scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html#stratified-k-fold)）。平均値だけでなくfold別スコアも確認します。

### multilabelは別設計

通常のStratifiedKFoldは単一targetのクラス比を対象にします。複数ラベルの組合せを維持したい場合は、iterative stratification等を別途検討します。

## Quick Reference {#quick-reference}

- 不均衡分類の第一候補。
- class比を守るだけで、group・時間は守らない。
- foldごとのクラス件数を必ず確認する。
- 少数クラス件数がfold数より少ない場合はfold数を見直す。
- groupがあるならStratifiedGroupKFoldを検討する。

## 関連項目

- [KFold]({{ '/wiki/validation/kfold.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [ROC-AUC]({{ '/wiki/metrics/roc-auc.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “Stratified K-Fold”](https://scikit-learn.org/stable/modules/cross_validation.html#stratified-k-fold)
2. [Kaggle, “Tabular Playground Series Nov 2022: 1st Place Solution”](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)
3. [Kaggle, “Medical AI Contest 7th 2025: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/medical-ai-contest-7th-2025/writeups/1st-place-solution)
4. [Qiita, “一流の「ものさし」職人になろう Cross Validationを深堀り”, 2019](https://qiita.com/Hatomugi/items/620c1bc757266b00e87f)

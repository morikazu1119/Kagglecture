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

| データ | 選択 |
|---|---|
| 二値分類でpositiveが少ない | StratifiedKFold |
| 多クラス分類で少数クラスがある | StratifiedKFold |
| groupも守る必要がある | StratifiedGroupKFold |
| 時系列分類 | 時間分割を優先 |
| 回帰 | 通常はKFold。必要ならtargetをbin化する設計を慎重に検討 |

## 仕組み {#mechanism}

たとえば全体が「class 0 = 90%、class 1 = 10%」なら、各foldもおおむね90:10になるように分割します。通常KFoldでは偶然、少数クラスが一部foldへ偏ることがあります。

scikit-learnも、StratifiedKFoldは各foldでクラス比をおおむね維持すると説明しています。ただしこれは**クラス比を守るための工学的な分割**で、データの独立性や本番分布を保証するものではありません（[scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html#stratified-k-fold)）。

## 使い分け {#comparison}

| 手法 | クラス比 | group | 時間順序 |
|---|---:|---:|---:|
| KFold | × | × | × |
| **StratifiedKFold** | ○ | × | × |
| [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }}) | × | ○ | × |
| StratifiedGroupKFold | ○に近づける | ○ | × |
| Time-based split | 設計次第 | 設計次第 | ○ |

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

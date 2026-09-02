---
layout: default
title: StratifiedGroupKFold
summary: groupをTrain/Validationで完全分離しながら、各foldのクラス比もできるだけ揃えるCross Validation。
type: reference
domain: kaggle
topic: stratified-group-kfold
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - validation
  - cross-validation
  - grouping
  - imbalance
---

# StratifiedGroupKFold

**StratifiedGroupKFoldは、同じ患者・ユーザーなどのgroupをfold間で分離しつつ、各foldのクラス比も元データへ近づけるCross Validationです。**

`GroupKFold`が必要なデータで、groupごとのラベル偏りが大きくfoldごとのpositive率まで崩れる場合に使います。group境界が最優先で、stratificationはその制約内で「可能な範囲」で行われます（[scikit-learn](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

| 状況 | 選択 |
|---|---|
| 患者ごとに複数画像 + 疾患率が偏る | StratifiedGroupKFold |
| authorごとに複数音声 + species偏り | StratifiedGroupKFold |
| groupはあるがtarget比は安定 | GroupKFold |
| groupなしの不均衡分類 | StratifiedKFold |
| 時間順序が本質 | 時間分割を優先 |

## 仕組み {#mechanism}

通常のStratifiedKFoldはsampleを自由に移動できますが、StratifiedGroupKFoldでは**groupを分割できません**。

```text
Patient A: positive, positive, positive -> 全部同じfold
Patient B: negative, negative          -> 全部同じfold
Patient C: positive, negative          -> 全部同じfold
```

このgroup単位の配置を調整して、各foldのclass distributionをできるだけ近づけます。group構造が極端なら完全なstratificationは不可能です。

## 使い分け {#comparison}

| 手法 | group分離 | class比維持 |
|---|---:|---:|
| KFold | × | × |
| StratifiedKFold | × | ○ |
| GroupKFold | ○ | × |
| **StratifiedGroupKFold** | ○ | ○に近づける |

**group leakageを防ぐ方がclass比をきれいにするより重要**です。group制約を外してまでstratifyしません。

## Kaggleでの実例 {#kaggle-examples}

BirdCLEF 2022の23位解法では、録音authorをgroupとしてStratifiedGroupKFoldを使っています（[23th Place Solution](https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution)）。同じ録音者由来の音響条件がTrainとValidationへまたがるのを避けながら、鳥種の偏りも抑える設計です。

26-shinnen-3Dpathologyの1位team solutionではpatient由来画像をGroupKFoldで分離しています（[1st place solution](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)）。このような医療データでclass imbalanceまで大きい場合がStratifiedGroupKFoldの典型候補です。

## 注意点 {#pitfalls}

### 「stratifiedだから各fold完全一致」と思う

groupが大きいほど比率調整の自由度が下がります。foldごとの件数・positive率を実際に出して確認します。

### groupを細かく設定する

患者単位が必要なのに画像IDをgroupにすると意味がありません。**本番で独立して現れる単位**をgroupにします。

### rare classが特定groupにしかない

少数classが3患者にしか存在しないのに5-foldへ均等配置することはできません。fold数を減らす判断も必要です。

## Quick Reference {#quick-reference}

- group境界を最優先で守る。
- class比は「可能な範囲」で揃える。
- foldごとのclass件数を必ず可視化する。
- rare classを持つdistinct group数と`n_splits`を確認する。
- 時系列制約があれば別途考慮する。

## 関連項目

- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [StratifiedKFold]({{ '/wiki/validation/stratified-kfold.html' | relative_url }})
- [F1 Score]({{ '/wiki/metrics/f1-score.html' | relative_url }})

## 参考文献

1. [scikit-learn, “StratifiedGroupKFold”](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)
2. [scikit-learn, “StratifiedGroupKFold API”](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html)
3. [Kaggle, “BirdCLEF 2022: 23th Place Solution”](https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution)
4. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)

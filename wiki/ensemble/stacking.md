---
layout: default
title: Stacking
summary: 複数Base modelのOOF予測を新しい特徴量としてMeta modelへ渡し、モデル間の補完関係を2段目で学習するEnsemble。
type: reference
domain: kaggle
topic: stacking
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - ensemble
  - stacking
  - oof
---

# Stacking

**Stackingは、複数モデルの予測値を「新しい特徴量」にして、もう1つのモデルに最終予測を学習させる2段構えのEnsembleです。**

たとえばLightGBM・CatBoost・Neural Networkが同じ1行に`0.72 / 0.61 / 0.80`と予測したら、その3値をMeta modelへ入力します。Meta modelは「どのBase modelをどの場面で信用するか」を学べます。

ただし、2段目を正しく学習するには**Train側のBase model予測をOut-of-Fold（OOF）で作る**ことが最重要です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#overview">全体構造</a>
  <a href="#mechanism">OOFが必要な理由</a>
  <a href="#test-flow">Test予測</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まずStacking全体を見る {#overview}

<div class="model-architecture" aria-label="StackingのBase modelからMeta modelまでの全体構造">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">Base modelの予測を並べて、Meta modelの入力にする</div><p class="model-architecture__subtitle">元のfeatureではなく「各モデルがどう予測したか」を2段目が学びます。</p></div>
    <span class="model-architecture__badge">2-level ensemble</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Input row<br>x</span></div><span class="model-stage__label">同じsample</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Base models</strong><br>LightGBM<br>CatBoost<br>NN</span></div><span class="model-stage__label">Level 1</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>0.72<br>0.61<br>0.80</span></div><span class="model-stage__label">予測を特徴量化</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Meta model</strong><br>Ridge / Logistic / GBDT</span></div><span class="model-stage__label">Level 2</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Final<br>prediction</span></div><span class="model-stage__label">Output</span></div>
  </div>
  <p class="model-architecture__caption">数値は模式例です。Meta modelには元featureを追加する構成もあります。</p>
</div>

単純平均が「全モデルを決めた重みで混ぜる」のに対して、Stackingは**混ぜ方自体をmodelに学習させる**方法です。

## なぜOOF予測が必要か {#mechanism}

Meta modelが見るTrain特徴に、Base modelが**自分で学習した同じ行への予測**を入れると、その予測は不自然にtargetへ近くなります。2段目は「本番では再現できない簡単すぎる予測」を学んでしまいます。

下でOOF予測とin-sample予測を切り替えると違いを確認できます。

<div class="interactive-viz" data-interactive="stacking-oof">
  <div class="interactive-viz__header"><div><div class="interactive-viz__title">Meta modelへ渡すTrain予測を比較</div><p class="interactive-viz__subtitle">OOFでは、そのrowを学習していないfold modelの予測だけを使います。</p></div><span class="interactive-status" data-stack-status data-state="safe">Meta model用に安全</span></div>
  <p class="interactive-note">模式例。targetと予測値は理解用の人工データです。</p>
  <div class="interactive-control-row" role="group" aria-label="Meta modelへ渡す予測"><span class="interactive-control-label">Train特徴</span><button type="button" class="interactive-button is-active" data-stack-mode="oof" aria-pressed="true">OOF予測</button><button type="button" class="interactive-button" data-stack-mode="train" aria-pressed="false">in-sample予測</button></div>
  <div class="interactive-list" data-stack-rows></div>
  <p class="interactive-explanation" data-stack-explanation aria-live="polite">各rowは、そのrowを学習していないfoldモデルの予測をMeta modelへ渡します。</p>
  <noscript><p class="interactive-explanation">Meta modelのTrain特徴には、自分を学習していないBase modelから得たOOF予測を使います。</p></noscript>
</div>

scikit-learnのStackingも、final estimatorをcross-validated predictionsで学習します（[StackingRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.StackingRegressor.html)）。

<div class="model-architecture" aria-label="StackingでOOF特徴を作るfold構造">
  <div class="model-architecture__header"><div><div class="model-architecture__title">各fold modelは「見ていない行」だけを予測してOOF列を埋める</div><p class="model-architecture__subtitle">全rowのOOFが揃ったら、その列をMeta modelのTrainデータにします。</p></div><span class="model-architecture__badge">OOF feature generation</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Fold 1<br>Train 2-5<br>Predict 1</span></div><span class="model-stage__label">OOF part 1</span></div>
    <div class="model-stage"><div class="model-tensor"><span>Fold 2<br>Train 1,3-5<br>Predict 2</span></div><span class="model-stage__label">OOF part 2</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>…全fold</span></div><span class="model-stage__label">各rowを1回予測</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>OOF column<br>全Train row</span></div><span class="model-stage__label">Meta Train feature</span></div>
  </div>
</div>

## Test側はどう作るか {#test-flow}

Train側はOOFですが、Test rowには正解がなく、全fold modelで予測できます。一般的には各fold modelのTest予測を平均し、その平均値をMeta modelへ渡します。

<div class="model-architecture" aria-label="StackingのTest prediction flow">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Testは各fold modelの予測を平均してMeta featureを作る</div><p class="model-architecture__subtitle">TrainのOOF列とTestのfold平均列が対応するようにします。</p></div><span class="model-architecture__badge">inference flow</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Test row</span></div><span class="model-stage__label">Input</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Fold models</strong><br>p1, p2, p3…</span></div><span class="model-stage__label">Base inference</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>mean(p1…pK)</span></div><span class="model-stage__label">Meta feature</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Meta model<br>final prediction</span></div><span class="model-stage__label">Output</span></div>
  </div>
</div>

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Ensemble手法の使い分け">
  <section class="comparison-card"><h4>Weighted Average</h4><dl><dt>混ぜ方</dt><dd>手動/最適化した重み</dd><dt>複雑さ</dt><dd>低</dd><dt>過学習risk</dt><dd>低〜中</dd></dl></section>
  <section class="comparison-card is-primary"><h4>Stacking</h4><dl><dt>混ぜ方</dt><dd>Meta modelが学習</dd><dt>複雑さ</dt><dd>高</dd><dt>過学習risk</dt><dd>中〜高</dd></dl></section>
  <section class="comparison-card"><h4>Rank Average</h4><dl><dt>混ぜ方</dt><dd>順位へ変換して平均</dd><dt>複雑さ</dt><dd>低</dd><dt>向く状況</dt><dd>scale差が大きい</dd></dl></section>
</div>

データ量が小さい、候補モデルが少ない、OOF差が微小ならWeighted Averageの方が安全なことがあります。

## Kaggleでの実例 {#kaggle-examples}

Tabular Playground Series Nov 2022の1位解法は10/20-fold StratifiedKFoldを使い、`scipy.minimize`によるstackingを主要改善点として挙げています（[1st Place Solution](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)）。

30 Days of MLの1位解法は、複数のLevel 1予測からLevel 2のXGBoost・Ridge・LightGBM・CatBoostを作り、さらにblendしています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

松尾研 DS Dojo #4の1位解法では、Gemma-2-9BのOOF予測をLightGBMへ特徴量として渡すMeta-Stackingを使い、最終的にGemma 0.75 + LightGBM 0.25でblendしています（[1st Place Solution](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)）。

## 注意点 {#pitfalls}

### in-sample予測をMeta modelへ渡す

Base modelが学習した同じ行への予測は過度に良く、Meta modelが本番で再現できない関係を学びます。最重要ルールは**Train側はOOF**です。

### Stacking自体を同じOOFで過剰探索する

Meta model、特徴、重みを何百通りも同じOOFで選ぶと、OOFへ過適合します。必要ならnested CVやouter holdoutを使います。

### test予測の作り方がTrainと不整合

Base modelのtest予測は通常、各fold modelの平均などで作ります。Meta modelが見たOOF分布とtest予測の分布が大きく変わらないようにします。

### 似たmodelだけを大量に積む

予測相関がほぼ同じBase modelを増やしてもMeta modelへ新しい情報が増えません。OOF scoreだけでなくprediction correlationやerror diversityも見ます。

## Quick Reference {#quick-reference}

- Base model予測をMeta modelの特徴量にする2段Ensemble。
- Meta modelのTrain特徴は必ずOOF予測。
- Test特徴は各fold model予測の平均などで作る。
- 最初はRidge / Logistic Regressionなど単純なMeta modelが安全。
- Weighted Averageをbaselineにして、本当にStackingが必要か比較する。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Rank Averaging]({{ '/wiki/ensemble/rank-averaging.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [scikit-learn, “StackingRegressor”](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.StackingRegressor.html)
2. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)
3. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
4. [Kaggle, “松尾研 DS Dojo #4: 1st Place Solution”, 2026](https://www.kaggle.com/competitions/matsuo-institute-ds-dojo-4/writeups/1st-place-solution)
5. [Qiita, “Kaggleで使われるStackingを理解する”](https://qiita.com/zumitan/items/690a5ac3def649ea2a1f)

---
layout: default
title: GroupKFold
summary: 同じ患者・ユーザー・セッションなどをTrainとValidationにまたがせないCross Validation。
type: reference
domain: kaggle
topic: group-kfold
created: 2026-09-02
updated: 2026-09-02
source_count: 7
tags:
  - kaggle
  - validation
  - cross-validation
  - leakage
---

# GroupKFold

**GroupKFoldは、同じ患者・ユーザー・セッションなどの「同一グループ」がTrainとValidationの両方に入らないように分割するCross Validationです。**

同じ主体から複数サンプルが生成されるデータでは、通常のKFoldで似たサンプルがTrainとValidationに分かれ、CVを過大評価することがあります。GroupKFoldはそのリークを防ぐために使います（[scikit-learn: GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

判断基準は、**本番で未知になる単位をgroupにする**ことです。

<div class="comparison-board" aria-label="データ種別ごとのgroup設計">
  <section class="comparison-card is-primary"><h4>医療画像</h4><dl><dt>group</dt><dd><code>patient_id</code></dd><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>行動ログ</h4><dl><dt>group</dt><dd><code>user_id</code></dd><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>検索・推薦</h4><dl><dt>group</dt><dd><code>session_id</code> / <code>search_id</code></dd><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>音声・画像投稿</h4><dl><dt>group</dt><dd>author / speaker</dd><dt>選択</dt><dd>GroupKFold系</dd></dl></section>
  <section class="comparison-card"><h4>group + クラス不均衡</h4><dl><dt>group</dt><dd>patient / user等</dd><dt>選択</dt><dd>StratifiedGroupKFold候補</dd></dl></section>
  <section class="comparison-card"><h4>未来予測</h4><dl><dt>独立軸</dt><dd>timestamp</dd><dt>選択</dt><dd>Time-based splitを優先</dd></dl></section>
</div>

<div class="callout tip">
  <div class="callout-title">groupの決め方</div>
  「同じIDがあるか」ではなく、TrainからValidationへ情報が伝わってはいけない独立単位を考える。
</div>

## 仕組み {#mechanism}

下の図で **通常のKFold / GroupKFold** と **Fold 1〜3** を切り替えると、同じpatientがTrainとValidationにまたがるかを確認できます。

<div class="interactive-viz" data-interactive="group-kfold">
  <div class="interactive-viz__header">
    <div>
      <div class="interactive-viz__title">同じpatientを分離できているか</div>
      <p class="interactive-viz__subtitle">緑 = Validation。赤い左線 = 同じpatientがTrain / Validationの両方に存在。</p>
    </div>
    <span class="interactive-status" data-gkf-status data-state="safe">group leakage: 0 / 6</span>
  </div>

  <div class="interactive-controls">
    <div class="interactive-control-row" role="group" aria-label="分割方法">
      <span class="interactive-control-label">分割方法</span>
      <button type="button" class="interactive-button" data-gkf-mode="kfold" aria-pressed="false">通常のKFold</button>
      <button type="button" class="interactive-button is-active" data-gkf-mode="group" aria-pressed="true">GroupKFold</button>
    </div>

    <div class="interactive-control-row" role="group" aria-label="Validation fold">
      <span class="interactive-control-label">Validation</span>
      <button type="button" class="interactive-button is-active" data-gkf-fold="1" aria-pressed="true">Fold 1</button>
      <button type="button" class="interactive-button" data-gkf-fold="2" aria-pressed="false">Fold 2</button>
      <button type="button" class="interactive-button" data-gkf-fold="3" aria-pressed="false">Fold 3</button>
    </div>
  </div>

  <div class="gkf-legend" aria-label="凡例">
    <span class="gkf-legend-item"><span class="gkf-legend-dot"></span>Train</span>
    <span class="gkf-legend-item"><span class="gkf-legend-dot is-validation"></span>Validation</span>
  </div>

  <div class="gkf-grid" data-gkf-grid>
    <div class="gkf-row"><div class="gkf-group-label">Patient A</div><div class="gkf-samples"><span class="gkf-sample is-validation">A1</span><span class="gkf-sample is-validation">A2</span><span class="gkf-sample is-validation">A3</span></div></div>
    <div class="gkf-row"><div class="gkf-group-label">Patient B</div><div class="gkf-samples"><span class="gkf-sample is-train">B1</span><span class="gkf-sample is-train">B2</span></div></div>
    <div class="gkf-row"><div class="gkf-group-label">Patient C</div><div class="gkf-samples"><span class="gkf-sample is-train">C1</span><span class="gkf-sample is-train">C2</span><span class="gkf-sample is-train">C3</span></div></div>
    <div class="gkf-row"><div class="gkf-group-label">Patient D</div><div class="gkf-samples"><span class="gkf-sample is-validation">D1</span><span class="gkf-sample is-validation">D2</span></div></div>
    <div class="gkf-row"><div class="gkf-group-label">Patient E</div><div class="gkf-samples"><span class="gkf-sample is-train">E1</span><span class="gkf-sample is-train">E2</span><span class="gkf-sample is-train">E3</span></div></div>
    <div class="gkf-row"><div class="gkf-group-label">Patient F</div><div class="gkf-samples"><span class="gkf-sample is-train">F1</span><span class="gkf-sample is-train">F2</span></div></div>
  </div>

  <p class="interactive-explanation" data-gkf-explanation aria-live="polite">Fold 1: Validationに入ったpatientは丸ごと分離され、同じpatientのsampleはTrain側に残りません。</p>
  <noscript><p class="interactive-explanation">GroupKFoldではpatient単位で丸ごとTrain / Validationを分離するため、同じpatientが両側にまたがりません。</p></noscript>
</div>

GroupKFoldでは、各groupは全foldを通じてちょうど1回Validation側に現れます（[scikit-learn: GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html)）。重要なのは、**sampleではなくgroupの境界を守ること**です。

## 使い分け {#comparison}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th scope="col">手法</th><th scope="col">group分離</th><th scope="col">クラス比</th><th scope="col">主な用途</th></tr></thead>
  <tbody>
    <tr><th scope="row">KFold</th><td>×</td><td>×</td><td>各sampleが独立</td></tr>
    <tr><th scope="row">StratifiedKFold</th><td>×</td><td class="status-good">○</td><td>独立sample + クラス不均衡</td></tr>
    <tr><th scope="row">GroupKFold</th><td class="status-good">○</td><td>×</td><td>同一主体の重複を防ぐ</td></tr>
    <tr><th scope="row">StratifiedGroupKFold</th><td class="status-good">○</td><td class="status-good">○に近づける</td><td>group分離 + クラス比維持</td></tr>
    <tr><th scope="row">Time-based split</th><td>設計次第</td><td>×</td><td>未来予測・時系列</td></tr>
  </tbody>
</table>
</div>

`StratifiedGroupKFold`はgroupを分離しながら、各foldのクラス比も可能な限り揃えます。groupごとのラベル偏りが大きい分類問題で候補になります（[scikit-learn: StratifiedGroupKFold](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)）。

## Kaggleでの実例 {#kaggle-examples}

Kaggleでは、**何をgroupと定義したか**がValidation設計そのものになります。

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th scope="col">Competition</th><th scope="col">Rank</th><th scope="col">group</th><th scope="col">Validation設計</th><th scope="col">Source</th></tr></thead>
  <tbody>
    <tr><th scope="row">FlightRank 2025</th><td>2nd</td><td>search session</td><td>10-fold GroupKFoldで同一検索内の候補をまとめて分離</td><td><a href="https://www.kaggle.com/competitions/aeroclub-recsys-2025/writeups/flightrank-2025-2nd-place-solution">2nd Place Solution</a></td></tr>
    <tr><th scope="row">March Machine Learning Mania 2026</th><td>4th</td><td>season</td><td>season単位でGroupKFold</td><td><a href="https://www.kaggle.com/c/march-machine-learning-mania-2026/writeups/4th-place-solution-for-the-march-machine-learning">4th Place Solution</a></td></tr>
    <tr><th scope="row">BirdCLEF 2022</th><td>23rd</td><td>author</td><td>authorをgroupにしたStratifiedGroupKFold</td><td><a href="https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution">23th Place Solution</a></td></tr>
    <tr><th scope="row">26-shinnen-3Dpathology</th><td>1st team solution</td><td>crop_id / patient</td><td>5-fold GroupKFoldで同一患者由来画像を分離</td><td><a href="https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614">1st place solution</a></td></tr>
  </tbody>
</table>
</div>
<p class="table-caption">横幅が足りない場合は表の内部だけ横スクロールします。ページ全体はoverflowしません。</p>

共通しているのは、**検索候補・録音・画像などのsampleそのものではなく、そのsampleを生み出した独立単位をgroupにしていること**です。

## 注意点 {#pitfalls}

### groupが細かすぎる

患者ごとに複数画像があるのに`image_id`をgroupにすると、ほぼ各画像が別groupになり、患者リークを防げません。予測対象の独立単位より細かいIDをgroupにしないことが重要です。

### 時間方向のリークは別問題

GroupKFoldはgroup分離を保証しますが、時間順序は保証しません。未来データがTrain、過去データがValidationになると問題ならTime-based splitやPurged系CVが必要です。Ubiquant Market Predictionの1位解法でも、用途に応じてPurgedGroupTimeSeries / TimeSeriesSplit等を使い分けています（[Ubiquant Market Prediction: 1st Place Solution](https://www.kaggle.com/competitions/ubiquant-market-prediction/writeups/k-i-y-1st-place-solution-our-betting-strategy)）。

### ラベル比が崩れる

groupごとにラベル分布が偏ると、fold間のpositive比率などが大きく変わることがあります。その場合はStratifiedGroupKFoldを候補にします。ただしgroup制約が強いほど完全なstratificationは難しくなります（[scikit-learn: StratifiedGroupKFold](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)）。

### group数が少なすぎる

Distinct group数は`n_splits`以上必要です（[scikit-learn: GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html)）。group数が少ない場合はfold数を減らすか、評価設計そのものを見直します。

## Quick Reference {#quick-reference}

<div class="comparison-board" aria-label="GroupKFoldのQuick Reference">
  <section class="comparison-card is-primary"><h4>同一患者から複数sample</h4><dl><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>同一user / sessionから複数行</h4><dl><dt>選択</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>group + クラス不均衡</h4><dl><dt>選択</dt><dd>StratifiedGroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>行が独立 + クラス不均衡</h4><dl><dt>選択</dt><dd>StratifiedKFold</dd></dl></section>
  <section class="comparison-card"><h4>時系列で未来予測</h4><dl><dt>選択</dt><dd>Time-based split</dd></dl></section>
  <section class="comparison-card"><h4>groupの意味が不明</h4><dl><dt>最初にすること</dt><dd>データ生成過程を確認</dd></dl></section>
</div>

**迷ったら「本番テストで初めて現れる独立単位は何か？」を考え、その単位がfoldをまたがないようにします。**

## 参考文献 {#references}

1. [scikit-learn, “GroupKFold”](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html)
2. [scikit-learn, “Cross-validation: StratifiedGroupKFold”](https://scikit-learn.org/stable/modules/cross_validation.html#stratifiedgroupkfold)
3. [Kaggle, “FlightRank 2025: 2nd Place Solution”](https://www.kaggle.com/competitions/aeroclub-recsys-2025/writeups/flightrank-2025-2nd-place-solution)
4. [Kaggle, “4th Place Solution for the March Machine Learning Mania 2026 Competition”](https://www.kaggle.com/c/march-machine-learning-mania-2026/writeups/4th-place-solution-for-the-march-machine-learning)
5. [Kaggle, “BirdCLEF 2022: 23th Place Solution”](https://www.kaggle.com/competitions/birdclef-2022/writeups/bilzard-23th-place-solution)
6. [Kaggle, “26-shinnen-3Dpathology: 1st place solution”, 2026](https://www.kaggle.com/competitions/26-shinnen-3-dp/discussion/671614)
7. [Kaggle, “Ubiquant Market Prediction: 1st Place Solution - Our Betting Strategy”](https://www.kaggle.com/competitions/ubiquant-market-prediction/writeups/k-i-y-1st-place-solution-our-betting-strategy)

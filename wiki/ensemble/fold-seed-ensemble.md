---
layout: default
title: Fold / Seed Ensemble
summary: CV foldやrandom seedを変えて学習した複数モデルの予測を平均し、1モデル固有の予測の揺れを減らすEnsemble。
type: reference
domain: kaggle
topic: fold-seed-ensemble
created: 2026-09-03
updated: 2026-09-03
source_count: 4
tags:
  - kaggle
  - ensemble
  - seed
  - cross-validation
---

# Fold / Seed Ensemble

**Fold / Seed Ensembleは、「ほぼ同じモデルを条件だけ少し変えて複数回学習し、その予測を平均する」ことで、1回の学習にたまたま生じた予測の揺れを減らす方法です。**

たとえば同じTest rowに対して5-foldのモデルが`0.62 / 0.68 / 0.65 / 0.71 / 0.64`と少しずつ違う予測をしたら、最終予測はそれらの平均にします。新しいarchitectureを作らなくても安定性を上げやすいため、Kaggleの最終推論で頻繁に使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#overview">全体像</a>
  <a href="#types">FoldとSeed</a>
  <a href="#mechanism">なぜ効くか</a>
  <a href="#limits">どこで頭打ちか</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まず1つのTest rowで見る {#overview}

<div class="model-architecture" aria-label="Fold Ensembleで複数fold modelのtest予測を平均する模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">同じTest rowを複数モデルへ通し、最後に平均する</div><p class="model-architecture__subtitle">各モデルは学習に使ったrowや初期値が少し違うため、予測も少し揺れます。</p></div>
    <span class="model-architecture__badge">variance reduction</span>
  </div>
  <p class="interactive-note">予測値は理解用の人工例です。</p>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Test row<br>x</span></div><span class="model-stage__label">同じ入力</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Fold models</strong><br>F1 0.62<br>F2 0.68</span></div><span class="model-stage__label">異なるTrain subset</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>More models</strong><br>F3 0.65<br>F4 0.71<br>F5 0.64</span></div><span class="model-stage__label">予測が少し違う</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Average</strong><br>(Σ prediction) / 5</span></div><span class="model-stage__label">揺れを相殺</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>0.66</span></div><span class="model-stage__label">Final prediction</span></div>
  </div>
  <p class="model-architecture__caption">classification probabilityなら確率を平均し、regressionなら予測値を平均するのが基本形です。</p>
</div>

平均が効く条件は、各モデルの誤差が**完全には同じでないこと**です。同じ方向へ同じだけ外すモデルを100本平均しても、そのズレは消えません。

## Fold EnsembleとSeed Ensembleの違い {#types}

<div class="comparison-board" aria-label="Fold EnsembleとSeed Ensembleの比較">
  <section class="comparison-card is-primary"><h4>Fold Ensemble</h4><dl><dt>何を変える</dt><dd>Train / Validationに入るrow</dd><dt>得られる違い</dt><dd>学習dataの違い</dd><dt>典型</dt><dd>K-foldで作ったK modelをtest平均</dd></dl></section>
  <section class="comparison-card"><h4>Seed Ensemble</h4><dl><dt>何を変える</dt><dd>random seed</dd><dt>得られる違い</dt><dd>初期重み・sampling等の違い</dd><dt>典型</dt><dd>同じsplit / parameterでseedだけ変える</dd></dl></section>
  <section class="comparison-card"><h4>Model-family Ensemble</h4><dl><dt>何を変える</dt><dd>architecture / algorithm</dd><dt>得られる違い</dt><dd>より大きなerror diversity</dd><dt>典型</dt><dd>GBDT + NNなど</dd></dl></section>
</div>

Fold EnsembleはCVで既に学習したmodelをそのまま再利用できるため、追加学習なしでTest平均まで持っていけることが多いです。Seed Ensembleは追加学習コストと引き換えに、同じ設定の偶然性を平均します。

## なぜ平均すると安定するか {#mechanism}

1モデルの予測誤差を「共通して残るズレ」と「学習ごとに揺れる部分」に分けて考えると直感的です。

<div class="model-architecture" aria-label="Ensemble平均でrandom errorが相殺される概念図">
  <div class="model-architecture__header"><div><div class="model-architecture__title">共通のズレは残るが、モデルごとに逆向きの揺れは平均で小さくなる</div><p class="model-architecture__subtitle">Ensembleは魔法ではなく、主にvarianceを減らす操作です。</p></div><span class="model-architecture__badge">bias vs variance</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>True<br>0.66</span></div><span class="model-stage__label">模式上の正解</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Model A</strong><br>0.61<br>−0.05</span></div><span class="model-stage__label">低めに揺れる</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Model B</strong><br>0.71<br>+0.05</span></div><span class="model-stage__label">高めに揺れる</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Average<br>0.66</span></div><span class="model-stage__label">揺れが相殺</span></div>
  </div>
  <p class="model-architecture__caption">理解用の理想化例です。実際の誤差は完全対称ではありません。</p>
</div>

数式では、M個の予測を単純平均する基本形は次です。

$$
\hat y = \frac{1}{M}\sum_{m=1}^{M}\hat y_m
$$

## どこで頭打ちになるか {#limits}

同系統modelを増やすと、最初は安定しても改善幅は徐々に小さくなります。重要なのは**本数ではなく、追加modelが新しい誤差を持っているか**です。

<div class="comparison-board" aria-label="Ensemble追加価値の判断">
  <section class="comparison-card is-primary"><h4>追加価値が高い</h4><dl><dt>単体性能</dt><dd>十分強い</dd><dt>相関</dt><dd>既存blendと少し違う</dd><dt>結果</dt><dd>OOFが再現性を持って改善</dd></dl></section>
  <section class="comparison-card"><h4>追加価値が低い</h4><dl><dt>単体性能</dt><dd>同程度</dd><dt>相関</dt><dd>ほぼ1</dd><dt>結果</dt><dd>本数だけ増え推論cost増</dd></dl></section>
  <section class="comparison-card"><h4>危険な多様性</h4><dl><dt>単体性能</dt><dd>かなり弱い</dd><dt>相関</dt><dd>違う</dd><dt>結果</dt><dd>単に間違い方が違うだけ</dd></dl></section>
</div>

seed 1→3→5→10などでOOF改善と推論costを記録し、改善がnoise以下になったら止めます。

## Kaggleでの実例 {#kaggle-examples}

30 Days of MLの1位解法ではXGBoostを3種類のhyperparameter × 20 seedsで計60モデル平均し、単一設定でも20 seeds平均を使っています。XGBoostのCV RMSEは0.71629→0.71594へ改善したと報告しています。またLightGBMでも20 seeds平均を採用しています（[1st Place Solution](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)）。

Open Problems - Multimodal Single-Cell Integrationの1位解法では5-fold予測の平均に加え、seedを変えたモデルもweighted ensembleへ含めています（[1st Place Solution Summary](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)）。

Predicting Student Health Risk 2026の分析ではLightGBM/XGBoost/CatBoost/HGBCが98.6〜99.5%の最終classで一致し、同質なtree seedを増やすだけでは新しいdecision boundaryが増えにくいと報告されています（[Writeup](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)）。

## 注意点 {#pitfalls}

### 数を増やせば必ず良いわけではない

seed 5→10→20のOOF改善を記録し、限界効用を見ます。推論コストが倍でも改善がnoise以下なら止めます。

### Test平均とOOF評価の不一致

Fold ensembleのTestはKモデル平均ですが、通常のOOFは各行1モデル予測です。必要に応じてrepeated CVなどでvarianceを追加評価します。

### 多様性と弱さを混同する

弱いモデルが違う予測をするだけでは価値がありません。**競争力のある精度 + 補完的な誤差**が必要です。

## Quick Reference {#quick-reference}

- Fold Ensemble = CVでできたfold model全部でTestを予測して平均。
- Seed Ensemble = split/parameterを保ちseedだけ変えて平均。
- 主な効果は予測varianceの低減。
- prediction/error correlationを確認する。
- 本数ではなくOOF改善 / 推論costで止め時を決める。

## 関連項目

- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})

## 参考文献

1. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)
2. [Kaggle, “Open Problems - Multimodal Single-Cell Integration: 1st Place Solution Summary”, 2022](https://www.kaggle.com/competitions/open-problems-multimodal/discussion/366961)
3. [Kaggle, “Predicting Student Health Risk: Why shouldn't you even consider using LB probing”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)
4. [Kaggle, “Predicting Student Health Risk: 2nd Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/2nd-place-solution)

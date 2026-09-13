---
layout: default
title: Frequency / Count Encoding
summary: categoryや離散値を「どれくらい頻繁に現れるか」という1列の数値へ変換する、軽量な特徴量Encoding。
type: reference
domain: kaggle
topic: frequency-encoding
created: 2026-09-06
updated: 2026-09-06
source_count: 9
tags:
  - kaggle
  - feature-engineering
  - tabular
  - encoding
---

# Frequency / Count Encoding

**Frequency Encoding / Count Encodingは、categoryや離散値そのものではなく「その値がデータ中に何回・何割合で現れるか」を特徴量にする手法です。**

高cardinalityのcategoryを1列のまま数値化でき、targetを使わないためTarget Encodingより構造が単純です。特に「rareかcommonか」に意味があるtabular dataや、同じ値の出現頻度が生成過程を反映するsynthetic dataで候補になります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

<h2 id="use-cases">使う場面</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>高cardinality category</h4><dl><dt>狙い</dt><dd>one-hotで列数を増やさず、rare / commonを1値へ圧縮する</dd><dt>例</dt><dd>Driver、店舗ID、商品ID、地域コード</dd></dl></section>
  <section class="comparison-card"><h4>数値だが実質ID・離散値</h4><dl><dt>狙い</dt><dd>値の大小ではなく、同じ値が何度現れるかを追加情報にする</dd><dt>例</dt><dd>Age、丸められた計測値、synthetic feature</dd></dl></section>
  <section class="comparison-card"><h4>Target Encodingの補助</h4><dl><dt>狙い</dt><dd>target平均とは別に「そのcategoryのsupport量」をモデルへ渡す</dd><dt>利点</dt><dd>同じtarget meanでもsample数の違いを区別できる</dd></dl></section>
  <section class="comparison-card"><h4>Distribution shiftの手掛かり</h4><dl><dt>狙い</dt><dd>未知値そのものではなく「rareな値」として表現する</dd><dt>注意</dt><dd>train / testをどこまで集計に使うかはValidationと用途に合わせる</dd></dl></section>
</div>

Frequency Encodingは万能なcategory encoderではありません。**category identityそのものが重要なら、頻度だけへ潰すと情報を失います。** したがって、元のcategoryを残したまま補助列として追加する、またはnative categorical handlingと併用する使い方が実務的です。

<h2 id="mechanism">仕組み</h2>

たとえば `Driver` が次のように現れるとします。

<div class="static-viz html-diagram" role="img" aria-label="Driverカテゴリを出現回数へ変換するFrequency Encodingの模式図">
  <div class="html-flow">
    <div class="html-flow-node"><strong>元の値</strong><br>A, A, B, C, A, B</div>
    <div class="html-flow-node"><strong>数える</strong><br>A = 3<br>B = 2<br>C = 1</div>
    <div class="html-flow-node"><strong>Count Encoding</strong><br>3, 3, 2, 1, 3, 2</div>
  </div>
  <p class="viz-note">模式例。実在Competitionの値ではありません。</p>
</div>

Count Encodingは出現回数をそのまま使います。

$$
\mathrm{count}(c)=\sum_{i=1}^{N}\mathbf{1}(x_i=c)
$$

Frequency Encodingは全体件数で割り、出現割合にします。

$$
\mathrm{freq}(c)=\frac{\mathrm{count}(c)}{N}
$$

同じデータ集合から作るならcountとfrequencyは定数倍なので、tree modelではほぼ同じ情報です。一方、**foldごとに件数が違う、trainとtestを別々に集計する、複数datasetを比較する**場合はfrequencyの方がscaleを合わせやすくなります。

### 何がモデルへ追加されるか

元categoryが `A` と `D` で意味的には別物でも、両方が10回出ていればFrequency Encoding後は同じ値になります。これは欠点でもあり、狙いでもあります。

<div class="comparison-board">
  <section class="comparison-card"><h4>保持する情報</h4><dl><dt>分かる</dt><dd>rare / common、support量、出現密度</dd><dt>分からない</dt><dd>category固有の意味やtargetとの方向</dd></dl></section>
  <section class="comparison-card"><h4>Collision</h4><dl><dt>起きること</dt><dd>異なるcategoryが同じ頻度なら同じ数値になる</dd><dt>対策</dt><dd>元categoryを残す、複数表現を併用する</dd></dl></section>
  <section class="comparison-card"><h4>Log Count</h4><dl><dt>式</dt><dd><code>log1p(count)</code></dd><dt>使い所</dt><dd>head categoryだけ極端に多いlong-tail分布を圧縮する</dd></dl></section>
</div>

2026年のPredicting F1 Pit Stops 5位解法でも、`log1p`したfrequency encodingがfeature representationの1つとして使われ、writeupでは「Useful baseline」と整理されています（[5th place solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/5th-place-solution-a-99-model-logit-stack)）。

### どのデータで数えるか

ここがFrequency Encodingで最も重要な設計点です。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>集計範囲</th><th>向いている目的</th><th>注意</th></tr></thead>
  <tbody>
    <tr><td>Train foldのみ</td><td>deploy時に未知dataへ適用するhonest validation</td><td>Validation foldの頻度は学習時に見ない</td></tr>
    <tr><td>Train全体</td><td>full-data retraining後のtest推論</td><td>OOF時と計算条件を合わせないとCV mismatchになる</td></tr>
    <tr><td>Train + Test</td><td>Kaggleでtest distributionを使うtransductive feature</td><td>Competition ruleと本番想定を確認。通常のproduction評価とは別物</td></tr>
    <tr><td>Train + Original data</td><td>Playground等で元datasetの分布情報を利用</td><td>外部data利用可否、重複、分布差を確認</td></tr>
  </tbody>
</table></div>

Predicting Heart Disease 25位解法では、numeric columnsのFrequency Encodingを**training fold内だけで計算**しています（[25th place solution](https://www.kaggle.com/competitions/playground-series-s6e2/writeups/25th-place-solution)）。一方、Predicting F1 Pit Stops 5位解法では`train ∪ original`でfitしたfrequency encodingが使われています（[5th place solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/5th-place-solution-a-99-model-logit-stack)）。同じ手法名でも、**どの集合からfrequencyを作ったか**まで確認する必要があります。

<h2 id="comparison">使い分け</h2>

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>手法</th><th>使う情報</th><th>強み</th><th>主なリスク</th></tr></thead>
  <tbody>
    <tr><td><strong>Frequency / Count</strong></td><td>出現回数・割合</td><td>1列、target-free、high-cardinalityに軽い</td><td>category identityを失う</td></tr>
    <tr><td>One-Hot</td><td>category identity</td><td>categoryを明示的に分離</td><td>high-cardinalityで次元爆発</td></tr>
    <tr><td>Ordinal / Label</td><td>category ID</td><td>1列で保持できる</td><td>人工的な大小関係を作る</td></tr>
    <tr><td><a href="{{ '/wiki/training/target-encoding.html' | relative_url }}">Target Encoding</a></td><td>categoryごとのtarget統計</td><td>目的変数との関係を直接圧縮</td><td>Leakage / overfit対策が必須</td></tr>
    <tr><td><a href="{{ '/wiki/training/aggregation-features.html' | relative_url }}">Aggregation Features</a></td><td>group内の他feature統計</td><td>count以外のmean / std / nunique等まで表現</td><td>組合せ爆発、time/group leakage</td></tr>
  </tbody>
</table></div>

### Target Encodingと何が違うか

Frequency Encodingはtargetを見ません。`A`が1000回出るなら1000という事実だけを渡します。Target Encodingは`A`のtarget平均などを渡します。

そのため、Frequency EncodingはTarget Encodingほど直接的なsignalを持たない一方、**target leakageを起こしにくく、support量という別の軸を追加できます。** Predicting Heart Disease 1位解法ではfrequency encodingとtarget由来の表現を両方用意し、異なるfeature representationをensemble diversityへ使っています（[1st place solution](https://www.kaggle.com/competitions/playground-series-s6e2/writeups/1st-place-solution-diversity-selection-and-t)）。

<h2 id="kaggle-examples">Kaggleでの実例</h2>

### 最新: Predicting Smartphone Addiction — S6E8の定量ablation

2026年9月時点で進行中のPlayground Series S6E8では、同一`StratifiedKFold(5, shuffle=True, random_state=42)`・同一LightGBM条件で、3列のfrequency featureと`max_bin`を切り替えた比較が公開されています（[max_bin is worth +0.0024 or +0.0005 here](https://www.kaggle.com/competitions/playground-series-s6e8/discussion/737422)）。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>条件</th><th>Frequency追加前</th><th>追加後</th><th>差</th></tr></thead>
  <tbody>
    <tr><td><code>max_bin=255</code></td><td>0.96541</td><td>0.96717</td><td><strong>+0.0018</strong></td></tr>
    <tr><td><code>max_bin=2047</code></td><td>0.96746</td><td>0.96767</td><td><strong>+0.0002</strong></td></tr>
  </tbody>
</table></div>

これは「Frequency Encodingは常に同じだけ効く」という見方への重要な反例です。元featureのdistinct valueをLightGBMのbinningが粗く潰している場合、frequency列が別の順序で値を分離するためgainが出やすい一方、`max_bin`をdistinct-value数付近まで上げて元値を細かく識別できると追加gainがほぼ消えています。**feature engineeringとmodel hyperparameterは独立に足し算できない**というEvidence Aの事例です（[Kaggle Discussion](https://www.kaggle.com/competitions/playground-series-s6e8/discussion/737422)）。

### Predicting Heart Disease — 1位 / 10位 / 25位

2026年2月終了のPlayground Series S6E2では、独立した複数の上位解法でFrequency / Count Encodingが採用されています。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>Rank</th><th>使い方</th><th>Evidence</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td>1st</td><td>各featureのfrequencyを追加。rare valueのsignalとTarget Encodingとの補完性を説明</td><td>B</td><td><a href="https://www.kaggle.com/competitions/playground-series-s6e2/writeups/1st-place-solution-diversity-selection-and-t">Solution Writeup</a></td></tr>
    <tr><td>10th</td><td>NN向けにcategorical列とpairwise combination計136列をCount Encoding</td><td>B</td><td><a href="https://www.kaggle.com/competitions/playground-series-s6e2/writeups/10th-rank-solution-playground-series-s6e2">Solution Writeup</a></td></tr>
    <tr><td>25th</td><td>numeric columnsのFrequency Encodingをtraining foldのみで計算</td><td>B</td><td><a href="https://www.kaggle.com/competitions/playground-series-s6e2/writeups/25th-place-solution">Solution Writeup</a></td></tr>
  </tbody>
</table></div>

1位解法は最終submissionでCV `0.9557801`、Private LB `0.95535`を報告していますが、**Frequency Encoding単独のablation値は公開されていません。** したがって「何点改善した」とは扱わず、最終feature representationに採用されたEvidence Bとして扱います（[1st place solution](https://www.kaggle.com/competitions/playground-series-s6e2/writeups/1st-place-solution-diversity-selection-and-t)）。

### Predicting F1 Pit Stops — 5位 / 7位

2026年5月のPlayground Series S6E5でも、Frequency / Count Encodingは別々の上位解法で採用されました。

5位解法は99-modelのlogit stackを構成し、LightGBMのfeature variantとしてfrequency-encoded版を含めています。writeupでは`Frequency encoding (log1p, fit on train ∪ original)`を**Useful baseline**と評価しています。一方で、単独AUC gainは提示されていないため効果量は推測しません（[5th place solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/5th-place-solution-a-99-model-logit-stack)）。

7位解法では、AutoGluonへ渡すbaseline 18 featuresの中に`Driver`と`Race`のcount encodingを含めています。176 modelをstackし、stack CV `0.95453`、別blendとのequal weightでCV `0.95463`を報告しています。ただし、この改善はensemble全体の値でありCount Encoding単独の効果ではありません（[7th place solution](https://www.kaggle.com/competitions/playground-series-s6e5/writeups/7th-place-solution)）。

### ここから一般化できること

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>General</h4><dl><dt>傾向</dt><dd>高cardinality categoryや離散値へ「rare / common」の軸を安価に追加できる</dd><dt>Evidence</dt><dd>2026年の複数上位解法で独立採用</dd></dl></section>
  <section class="comparison-card"><h4>Situational</h4><dl><dt>効きやすい</dt><dd>頻度がentity popularityや生成過程を反映するdataset、元値がmodel内部で粗く離散化される条件</dd><dt>確認</dt><dd>OOFで単独性能とensemble diversityの両方を見る</dd></dl></section>
  <section class="comparison-card"><h4>Competition-specific</h4><dl><dt>Playground</dt><dd>original datasetをfrequency集計に含める解法がある</dd><dt>注意</dt><dd>他Competitionへそのまま移植しない</dd></dl></section>
</div>

<h2 id="pitfalls">注意点</h2>

### 1. Frequencyが同じcategoryは区別できない

`A=20回`、`B=20回`なら両方20です。category identityが重要な問題では、Frequency Encodingだけへ置換せず、元categoryや別Encodingを残します。

### 2. rareだからtargetが特定方向とは限らない

Frequency Encodingは「rare / common」を表すだけです。rareほどpositive、という関係を仮定しているわけではありません。tree modelなら非単調な関係を学べますが、linear modelへ単独投入すると強い仮定になりやすいためOOFで確認します。

### 3. fold境界を無視するとValidation条件が変わる

Targetを使わないため典型的なtarget leakageではありませんが、Validation foldまで含めてfrequencyを作れば、そのfoldの分布情報をfeature constructionで見ています。productionを模したhonest validationが必要なら、**各foldのtrain部分でcount mapをfitし、validationへmap**します。Predicting Heart Disease 25位解法はこの方式です（[25th place solution](https://www.kaggle.com/competitions/playground-series-s6e2/writeups/25th-place-solution)）。

### 4. Train + Test集計はtransductive learning

Kaggleではlabelなしtest dataの分布を使うfeature engineeringが許されるCompetitionもあります。しかし、それを通常のdeploymentへそのまま持ち込むと「将来test batch全体を事前に見られる」という前提になります。Competition ruleと本番要件を分けて考えます。

### 5. 数値列への適用はcardinalityを確認する

連続値がほぼ全行uniqueならcountはほぼ1で、情報を追加しません。丸め・quantization・synthetic generationにより同一値が繰り返されるnumeric columnでは候補になります。2026年S6E2の25位解法はnumeric columnsにFrequency Encodingを使っています（[25th place solution](https://www.kaggle.com/competitions/playground-series-s6e2/writeups/25th-place-solution)）。

### 6. Model側が同じ情報を解像できるとgainは縮む

S6E8のablationでは、LightGBMの`max_bin`を255から2047へ増やすとfrequency featureの追加gainが`+0.0018`から`+0.0002`へ縮みました。Frequency Encodingを「modelと無関係に効くfeature」と考えず、**元値がmodel内部でどう表現されるか**まで含めてablationします（[Kaggle Discussion](https://www.kaggle.com/competitions/playground-series-s6e8/discussion/737422)）。

<h2 id="quick-reference">Quick Reference</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>まず試す</h4><dl><dt>条件</dt><dd>category / discrete featureに繰り返し値が多い</dd><dt>形</dt><dd>元feature + count / frequency</dd></dl></section>
  <section class="comparison-card"><h4>long-tail</h4><dl><dt>候補</dt><dd><code>log1p(count)</code></dd><dt>理由</dt><dd>head categoryのscaleを圧縮</dd></dl></section>
  <section class="comparison-card"><h4>Validation</h4><dl><dt>厳密</dt><dd>fold-trainでfitしfold-validへmap</dd><dt>Kaggle</dt><dd>transductive集計はruleとCV条件を確認</dd></dl></section>
  <section class="comparison-card"><h4>Ablation</h4><dl><dt>見るもの</dt><dd>Encoding追加だけでなくbinning / native categorical条件も変えて比較</dd><dt>理由</dt><dd>同じsignalがmodel側と重複することがある</dd></dl></section>
</div>

## 関連項目

- [Aggregation Features]({{ '/wiki/training/aggregation-features.html' | relative_url }})
- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})

## 参考文献

1. kito_pl, **max_bin is worth +0.0024 or +0.0005 here - it depends on whether you already encode the values**, Predicting Smartphone Addiction, Kaggle Discussion, 2026-09. https://www.kaggle.com/competitions/playground-series-s6e8/discussion/737422
2. Masaya Kawamata, **1st Place Solution — Diversity, Selection, and Trusting the CV–LB Relation**, Predicting Heart Disease, Kaggle Solution Writeup, 2026-02-28. https://www.kaggle.com/competitions/playground-series-s6e2/writeups/1st-place-solution-diversity-selection-and-t
3. **10th Rank solution - Playground Series S6E2**, Predicting Heart Disease, Kaggle Solution Writeup, 2026-03-01. https://www.kaggle.com/competitions/playground-series-s6e2/writeups/10th-rank-solution-playground-series-s6e2
4. **25th Place Solution**, Predicting Heart Disease, Kaggle Solution Writeup, 2026-02-28. https://www.kaggle.com/competitions/playground-series-s6e2/writeups/25th-place-solution
5. **5th place solution — a 99-model logit stack**, Predicting F1 Pit Stops, Kaggle Solution Writeup, 2026-06-01. https://www.kaggle.com/competitions/playground-series-s6e5/writeups/5th-place-solution-a-99-model-logit-stack
6. **7th place solution**, Predicting F1 Pit Stops, Kaggle Solution Writeup, 2026-05-31. https://www.kaggle.com/competitions/playground-series-s6e5/writeups/7th-place-solution
7. shivan kumar, **Feature Engineering — deep dive into Encoding and Binning techniques**, Kaggle Getting Started, 2020. https://www.kaggle.com/getting-started/183076
8. k-dm.work, **Count / Frequency Encoding**, 2024-06-01. https://k-dm.work/prep/categorical/countencoder/
9. Taigo Kuriyama, **Kaggle テーブルデータコンペで使うスニペット・Tips 集**, Qiita, 2019. https://qiita.com/TaigoKuriyama/items/8f9286b5c882819adebb

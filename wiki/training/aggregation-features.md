---
layout: default
title: Aggregation Features
summary: groupby・履歴・関連テーブルをmean/count/std等で集約し、行単位モデルへ「周囲の文脈」を渡す特徴量設計。Leakageと過剰生成を避けるのが重要。
type: reference
domain: kaggle
topic: aggregation-features
created: 2026-09-05
updated: 2026-09-05
source_count: 5
tags:
  - kaggle
  - training
  - feature-engineering
  - aggregation
  - tabular
  - leakage
---

# Aggregation Features

**Aggregation Features（集約特徴量）は、同じcustomer・item・category・sessionなどに属する複数行をまとめ、mean / count / std / min / max / quantileなどの統計量へ圧縮した特徴量です。**

1行だけでは見えない「その行が所属する集団の典型」「履歴の多さ」「ばらつき」をモデルへ渡せるため、tabular competition、とくに履歴・transaction・relationを含むデータで強力です。一方で、**Validationや未来の情報を集約に混ぜると簡単にLeakageする**ため、どの行から統計量を作ったかをCVと一致させる必要があります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board" aria-label="Aggregation Featuresを使う代表場面">
  <section class="comparison-card is-primary"><h4>1 entityに複数履歴がある</h4><dl><dt>例</dt><dd>customerに複数transaction</dd><dt>候補</dt><dd>count / mean / std / recency</dd></dl></section>
  <section class="comparison-card"><h4>category内の位置を知りたい</h4><dl><dt>例</dt><dd>契約種別ごとのtenure</dd><dt>候補</dt><dd>group mean / median / quantile</dd></dl></section>
  <section class="comparison-card"><h4>relationをflat tableへ落とす</h4><dl><dt>例</dt><dd>user × item、merchant × card</dd><dt>候補</dt><dd>pair count / ratio / unique count</dd></dl></section>
  <section class="comparison-card"><h4>時系列の履歴を要約する</h4><dl><dt>例</dt><dd>直近7/30/90日の購入</dd><dt>候補</dt><dd>window別count / mean / max</dd></dl></section>
</div>

特に、**1行のraw featureだけではtargetに必要な文脈が欠けているとき**に効きます。逆に、各行が完全に独立し、group自体に意味がないデータでは候補を大量生成してもnoiseになりやすいです。

## 仕組み {#mechanism}

たとえば次の4行があるとします。

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>customer</th><th>amount</th><th>raw rowだけで見えること</th></tr></thead>
  <tbody>
    <tr><td>A</td><td class="numeric">1,000</td><td>今回の購入額</td></tr>
    <tr><td>A</td><td class="numeric">3,000</td><td>今回の購入額</td></tr>
    <tr><td>A</td><td class="numeric">2,000</td><td>今回の購入額</td></tr>
    <tr><td>B</td><td class="numeric">8,000</td><td>今回の購入額</td></tr>
  </tbody>
</table>
</div>

customer単位で集約すると、Aには`count=3`、`mean=2,000`、`max=3,000`のような特徴を戻せます。これにより各行は、**自分自身の値だけでなく「このcustomerは普段どのくらい取引するか」**を持てます。

<div class="static-viz html-diagram" aria-label="Aggregation Featuresの処理">
  <div class="html-flow">
    <div class="html-flow__node"><strong>Raw rows</strong><span>A: 1000 / 3000 / 2000</span></div>
    <div class="html-flow__connector" aria-hidden="true">＋</div>
    <div class="html-flow__node"><strong>Group key</strong><span>customer = A</span></div>
    <div class="html-flow__connector" aria-hidden="true">→</div>
    <div class="html-flow__node"><strong>Aggregate</strong><span>count / mean / std / max</span></div>
    <div class="html-flow__connector" aria-hidden="true">→</div>
    <div class="html-flow__node"><strong>Join back</strong><span>各rowへgroup contextを付与</span></div>
  </div>
  <p class="interactive-note">模式例。数値は理解用でありKaggle実測値ではありません。</p>
</div>

### よく使う統計量

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>統計量</th><th>拾える情報</th><th>向く例</th></tr></thead>
  <tbody>
    <tr><td>count / nunique</td><td>量・活動頻度・多様性</td><td>購入回数、merchant数</td></tr>
    <tr><td>mean / median</td><td>典型的な水準</td><td>平均購入額、平均tenure</td></tr>
    <tr><td>std / IQR</td><td>ばらつき・安定性</td><td>支払額の変動</td></tr>
    <tr><td>min / max</td><td>極端値・range</td><td>最大利用額、最終/最初の値</td></tr>
    <tr><td>quantile</td><td>distributionの形</td><td>外れ値に強い位置情報</td></tr>
    <tr><td>ratio / difference</td><td>group基準からのずれ</td><td>row値 ÷ group mean</td></tr>
  </tbody>
</table>
</div>

Kaggle Learnでも、categoryでgroup化し別featureをmeanなどで要約する**Group Transforms**がFeature Engineeringの基本パターンとして扱われています（[Kaggle Learn: Feature Engineering](https://www.kaggle.com/learn/feature-engineering)）。

## 使い分け {#comparison}

<div class="comparison-board" aria-label="Aggregation Featuresと近い手法の使い分け">
  <section class="comparison-card is-primary"><h4>Aggregation Features</h4><dl><dt>使う情報</dt><dd>input featureだけ</dd><dt>目的</dt><dd>groupの文脈を数値化</dd><dt>例</dt><dd>契約種別ごとのtenure平均</dd></dl></section>
  <section class="comparison-card"><h4>Target Encoding</h4><dl><dt>使う情報</dt><dd>target</dd><dt>目的</dt><dd>categoryとtargetの関係を圧縮</dd><dt>注意</dt><dd>inner OOF等が必須</dd></dl></section>
  <section class="comparison-card"><h4>Frequency Encoding</h4><dl><dt>使う情報</dt><dd>category出現数</dd><dt>目的</dt><dd>rare / commonを表現</dd><dt>関係</dt><dd>count aggregationの特殊例</dd></dl></section>
  <section class="comparison-card"><h4>Rolling / Window Features</h4><dl><dt>使う情報</dt><dd>過去window</dd><dt>目的</dt><dd>時間変化を保った集約</dd><dt>注意</dt><dd>未来を混ぜない</dd></dl></section>
</div>

**targetを集約対象にした瞬間、それは通常のAggregation FeaturesではなくTarget Encoding系として扱う**のが安全です。Leakage対策も別物になります。詳細は[Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})を参照してください。

## Kaggleでの実例 {#kaggle-examples}

### 2026: Predict Customer Churn — groupby集約が最上位weightの特徴群

Playground Series S6E3の17位解法では、800超のzero-leakage feature poolを作り、その中でも**category → numeric aggregation（CATNUM）を「single most powerful feature family」と説明**しています。最終hill climbingでは、`groupby category → numeric統計`を使うXGBoost候補が**weight +0.34で最大**でした。例として`Contract`別`tenure`のmean / std / min / max / median / quantile / IQRなどを利用しています（[17th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)）。

一方で同解法は、**800超の特徴を1つのGBDTへ全部入れるとoverfittingした**とも報告しています。大量生成そのものではなく、異なるfeature subsetをモデルごとに使い、ensemble diversityとして活用した点が重要です。これは「Aggregation Featuresは多いほど良い」ではない強い反例です。

### 2025: Backpack Prediction Challenge — 1位のsingle model

1位解法では、最終single XGBoostに500 featuresを使い、より軽い138-feature版でも1位相当を達成しています。主要feature engineeringとして`groupby(COL1)[COL2].agg(STAT)`を挙げ、mean / std / count / min / max / nunique / skewに加えてquantileやhistogram binsまで展開しています（[1st Place Solution](https://www.kaggle.com/competitions/playground-series-s5e2/discussion/565539)）。

ただしこのCompetitionはsynthetic artifactの影響が強く、解法者自身も「competition固有のweird data」であることを明記しています。したがって、個々の組合せをそのまま一般化するより、**group distributionを多面的に要約する発想**を再利用するのが適切です。

### Optiver Realized Volatility Prediction — 1位、近傍を集約

Optiver Realized Volatility Predictionの1位解法では、通常のcategory groupbyだけでなく、**Nearest Neighborで似たtime / stockを作り、その近傍をaggregationする特徴**を導入しています。Writeupでは、このNearest Neighbor aggregationによりscoreが**0.21から0.19へ改善**したと報告しています（[1st Place Solution](https://www.kaggle.com/competitions/optiver-realized-volatility-prediction/discussion/274970)）。

これはAggregationのgroup keyが必ずしも既存categoryである必要はなく、**「意味のある近傍集合を先に作り、その集合を要約する」**形にも拡張できる例です。

## 注意点 {#pitfalls}

### Validation行を使って統計量を作らない

Validationを評価するとき、Validation側の行まで含めてgroup meanやcountを計算すると、実運用時には得られない分布情報を使うことがあります。基本は**Train foldだけでaggregateをfitし、Validationへmap / joinする**設計です。

input featureだけの集約はtarget leakageではない場合もありますが、CVと本番のinformation boundaryが崩れるとValidation mismatchになります。

### targetを集約したらTarget Encodingとして扱う

`groupby(category)[target].mean()`は答えを直接使います。全Trainで作ってからCVするとValidation targetが特徴量へ混入します。outer fold内、必要ならさらにinner OOFで作ります。

### 時系列では未来を混ぜない

「customerの平均購入額」を全期間で作ると、過去rowの特徴へ未来transactionが入る可能性があります。time-aware competitionでは、**その時点より前の履歴だけ**、または明示されたpast windowだけで集約します。

### group sizeが小さいと不安定

件数1〜2のgroupでstdやquantileを大量に作っても情報は安定しません。countを併記し、rare groupをまとめる、global統計へfallbackするなどを検討します。

### 組合せ爆発

`group column × value column × statistic × category pair`を総当たりすると特徴数は急増します。2026年S6E3の事例のように、全特徴を1モデルへ投入するとoverfittingすることがあります。**OOF差、model diversity、計算コスト**を見ながら残します。

### groupとsplit単位が矛盾していないか

同じpatient / customer / deviceがTrainとValidationへまたがる問題なら、Aggregation Featuresより先に[GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})などでsplitを正しく設計する必要があります。誤ったsplitの上で高度な集約をしてもCVは信用できません。

## Quick Reference {#quick-reference}

<div class="comparison-board" aria-label="Aggregation Features Quick Reference">
  <section class="comparison-card is-primary"><h4>まず試す</h4><dl><dt>group</dt><dd>entity / category</dd><dt>stats</dt><dd>count, mean, std, min, max, nunique</dd></dl></section>
  <section class="comparison-card"><h4>distributionまで欲しい</h4><dl><dt>追加</dt><dd>median, quantile, IQR</dd><dt>注意</dt><dd>小sample group</dd></dl></section>
  <section class="comparison-card"><h4>rowとの相対位置</h4><dl><dt>追加</dt><dd>difference / ratio</dd><dt>例</dt><dd>amount ÷ customer mean</dd></dl></section>
  <section class="comparison-card"><h4>必ず確認</h4><dl><dt>CV</dt><dd>fold内でfit</dd><dt>time</dt><dd>未来を含めない</dd></dl></section>
</div>

- まず「何を同じgroupとみなすとtargetに意味があるか」を決める。
- input-only aggregationとTarget Encodingを混同しない。
- group countを一緒に持ち、統計量の信頼度を判断する。
- 大量生成後はOOFで削る。全投入をデフォルトにしない。
- time / group / entityのinformation boundaryをValidationと一致させる。

## 関連項目

- [Target Encoding]({{ '/wiki/training/target-encoding.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [Time Series Split]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [Kaggle Learn, “Feature Engineering” — Creating Features / Group Transforms](https://www.kaggle.com/learn/feature-engineering)
2. [Kaggle, “Predict Customer Churn: 17th Place Solution”, 2026](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)
3. [Kaggle, Chris Deotte, “Backpack Prediction Challenge: 1st Place - Single Model - Feature Engineering”, 2025](https://www.kaggle.com/competitions/playground-series-s5e2/discussion/565539)
4. [Kaggle, “Optiver Realized Volatility Prediction: 1st Place Solution - Nearest Neighbors”, 2022](https://www.kaggle.com/competitions/optiver-realized-volatility-prediction/discussion/274970)
5. [Zenn, “Kaggle入門: 特徴エンジニアリング 3. 特徴量の作成”, 2026](https://zenn.dev/rg687076/articles/6523714297acd2)

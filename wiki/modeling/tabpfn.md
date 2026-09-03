---
layout: default
title: TabPFN
summary: 合成tabular taskで予測アルゴリズム自体を事前学習し、train tableをcontextとして新しい表データを予測するtabular foundation model。
type: reference
domain: kaggle
topic: tabpfn
created: 2026-09-03
updated: 2026-09-04
source_count: 10
tags: [kaggle, modeling, tabular, transformer, foundation-model, tabpfn]
---

# TabPFN

**TabPFN（Tabular Prior-data Fitted Network）は、表データ向けの予測アルゴリズムそのものを大量のsynthetic taskで事前学習したtabular foundation modelです。**

普通のLightGBMやMLPはCompetitionのtrain dataでmodel parameterを学習します。TabPFNは、すでに学習済みのTransformerへ**ラベル付きtrain rowsをcontextとして見せ、その場でtest rowを予測する**In-Context Learning（ICL）を使います。つまり`fit()`というAPIはあっても、通常のNNのようにCompetitionごとに重みをgradient updateすることが本質ではありません（[Nature 2025](https://doi.org/10.1038/s41586-024-08328-6), [official repository](https://github.com/PriorLabs/TabPFN)）。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション"><a href="#use-cases">使う場面</a><a href="#operation">1行をどう予測するか</a><a href="#architecture">全体構造</a><a href="#versions">Version差</a><a href="#comparison">GBDTとの使い分け</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 使う場面 {#use-cases}

TabPFNは「GBDTを全部置き換えるmodel」ではなく、**小〜中規模tabularで短時間に強い別familyの予測を追加したいとき**に特に有力です。

<div class="comparison-board" aria-label="TabPFNを使う場面">
  <section class="comparison-card is-primary"><h4>小〜中規模の表データ</h4><dl><dt>向く</dt><dd>行数・特徴量数がTabPFNのcontextへ収まりやすい</dd><dt>価値</dt><dd>重いHPOなしで強いbaseline / ensemble memberを得やすい</dd></dl></section>
  <section class="comparison-card"><h4>Ensembleのdiversityが欲しい</h4><dl><dt>向く</dt><dd>LightGBM / XGBoost / CatBoost / RealMLPがすでに強い</dd><dt>価値</dt><dd>treeや通常MLPとは異なるICL型modelを追加できる</dd></dl></section>
  <section class="comparison-card"><h4>大量データ・超低latency</h4><dl><dt>注意</dt><dd>context size・GPU memory・推論時間が効く</dd><dt>候補</dt><dd>GBDT、distillation、sampling / extensionも比較する</dd></dl></section>
  <section class="comparison-card"><h4>Competitionのmetricが特殊</h4><dl><dt>注意</dt><dd>学習時lossを自由に書き換えるmodelではない</dd><dt>対応</dt><dd>probability補正、threshold、stacking等をvalidationで選ぶ</dd></dl></section>
</div>

Nature論文のTabPFNv2評価は主に**最大10,000 samples・500 features**の範囲です。後継のTabPFN-2.5 model reportは対象を**最大50,000 data points・2,000 features**へ拡張したと報告しています（[Nature 2025](https://doi.org/10.1038/s41586-024-08328-6), [TabPFN-2.5 Model Report](https://priorlabs.ai/technical-reports/tabpfn-2-5-model-report)）。Versionによって想定scaleが違うため、「TabPFNは何行まで」と固定値で覚えない方が安全です。

## 1行をどう予測するか {#operation}

最初に、通常のtabular modelとの最大の違いを1サンプルで見ます。

たとえばtrain tableに次のような3人がいるとします。

<div class="html-table-wrap"><table class="html-table"><thead><tr><th>Age</th><th>BP</th><th>Exercise</th><th>Target</th></tr></thead><tbody><tr><td>45</td><td>120</td><td>Yes</td><td>0</td></tr><tr><td>67</td><td>155</td><td>No</td><td>1</td></tr><tr><td>52</td><td>138</td><td>Yes</td><td>0</td></tr><tr><td>61</td><td>149</td><td>No</td><td><strong>?</strong></td></tr></tbody></table></div>

通常のGBDTなら上3行からtree parameterを学び、その学習済みtreeへ4行目を通します。TabPFNは発想が違います。**上3行の「特徴量 + label」と、4行目の特徴量を同じcontextへ入れ、事前学習済みTransformerがこのtable内の関係をその場で読み取って予測します。**

<div class="model-architecture" aria-label="TabPFN single sample in-context prediction">
  <div class="model-architecture__header"><div><div class="model-architecture__title">train rowsが「今回の問題を説明する例」になる</div><p class="model-architecture__subtitle">Competitionごとに重みを一から学び直す代わりに、ラベル付きrowsをcontextとしてtest rowを解きます。</p></div><span class="model-architecture__badge">in-context learning</span></div>
  <div class="model-stage-row" style="--model-cols:6">
    <div class="model-stage"><div class="model-tensor"><span>Train Rows<br>X + y</span></div></div>
    <div class="model-stage"><div class="model-tensor"><span>Test Row<br>X*</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Feature / Row<br>Representation</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Pretrained<br>Transformer</span></div></div>
    <div class="model-stage"><div class="model-tensor is-accent"><span>Context-aware<br>Representation</span></div></div>
    <div class="model-stage"><div class="model-tensor is-accent"><span>Prediction<br>p(y | X*, D)</span></div></div>
  </div>
  <p class="model-architecture__caption">模式図。Dはラベル付きtrain datasetです。実際のTabPFNはversionごとに入力表現・attention構造・ensemble preprocessing等が異なります。</p>
</div>

この「train dataそのものがcontext」という点が重要です。**重みを更新しない = train dataを使わない**ではありません。むしろpredict時にもtrain dataがpredictionへ直接関与します。

## なぜ事前学習だけで新しい表を解けるのか

TabPFNは事前学習時に、1つの巨大tableを暗記するのではなく、**異なる生成過程を持つ大量のsynthetic datasetsを何度も解きます。** Nature論文では構造的因果モデル（Structural Causal Model; SCM）等から多様なsynthetic tabular taskを生成し、1 model trainingあたり約1億のsynthetic datasetsを作ると説明されています（[Nature 2025](https://doi.org/10.1038/s41586-024-08328-6)）。

<div class="model-architecture" aria-label="TabPFN pretraining operation">
  <div class="model-architecture__header"><div><div class="model-architecture__title">「この表の正解関係は何か」を大量のsynthetic taskで練習する</div><p class="model-architecture__subtitle">Datasetごとに異なるfeature-target関係を解くことで、新しいdatasetをcontextから解くalgorithmをnetwork内部へ学びます。</p></div><span class="model-architecture__badge">prior-data pretraining</span></div>
  <div class="model-stage-row" style="--model-cols:6">
    <div class="model-stage"><div class="model-op-box"><span>Sample<br>Data-generating Process</span></div></div>
    <div class="model-stage"><div class="model-tensor"><span>Synthetic<br>Dataset A</span></div></div>
    <div class="model-stage"><div class="model-tensor"><span>Synthetic<br>Dataset B ... N</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Predict held-out<br>targets</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Update shared<br>Transformer weights</span></div></div>
    <div class="model-stage"><div class="model-tensor is-accent"><span>Learned Tabular<br>Prediction Algorithm</span></div></div>
  </div>
</div>

直感的には、LLMが「文章をどう続けるか」を大量textから事前学習するのに対し、TabPFNは「この小さな表では、どのfeature-target関係を信じるべきか」を大量のsynthetic taskから学びます。

## Full architecture: Competitionでは何が起きるか {#architecture}

Kaggle participantが毎回TabPFN本体をpretrainするわけではありません。公開checkpointを読み、Competition datasetをcontextとして使います。

<div class="model-architecture" aria-label="TabPFN full competition workflow">
  <div class="model-architecture__header"><div><div class="model-architecture__title">事前学習済みalgorithmをCompetition tableへ適用する</div><p class="model-architecture__subtitle">train rowsをcontextにし、複数のpreprocessing / permutation / ensemble memberを通してtest probabilityを得るのが実運用に近い形です。</p></div><span class="model-architecture__badge">competition inference</span></div>
  <div class="model-stage-row" style="--model-cols:7">
    <div class="model-stage"><div class="model-tensor"><span>Competition<br>Train X,y</span></div></div>
    <div class="model-stage"><div class="model-tensor"><span>Competition<br>Test X</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Encoding /<br>Preprocessing</span></div></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Pretrained<br>TabPFN</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Permutation /<br>Ensemble variants</span></div></div>
    <div class="model-stage"><div class="model-tensor is-accent"><span>Class probability /<br>Regression output</span></div></div>
    <div class="model-stage"><div class="model-op-box"><span>Blend / Stack /<br>Post-process</span></div></div>
  </div>
  <p class="model-architecture__caption">Nature論文のdefault inferenceも複数のpre/post-processingを変えたsmall ensembleを利用します。KaggleではさらにGBDTやRealMLP等とのstackingが候補になります。</p>
</div>

TabPFNv2の論文では、feature order shuffle、classification label permutation、quantile変換、SVD等を組み合わせたensemble inferenceを説明しています。したがって**「1 checkpointを1回forwardしただけ」がTabPFNの実力を常に表すわけではありません**（[Nature 2025](https://doi.org/10.1038/s41586-024-08328-6)）。

## Version差を混同しない {#versions}

TabPFNは更新が速く、論文・Kaggle Notebook・current packageでversion名が異なります。

<div class="html-table-wrap"><table class="html-table"><thead><tr><th>系統</th><th>確認できる位置づけ</th><th>規模の目安</th><th>Kaggleでの読み方</th></tr></thead><tbody><tr><td>TabPFNv2</td><td>Nature 2025の中心</td><td>評価は主に≤10K rows / 500 features</td><td>論文のarchitecture・benchmarkを読む基準</td></tr><tr><td>TabPFN-2.5</td><td>2025-11 model report</td><td>≤50K rows / 2K featuresを対象に拡張</td><td>2026年Notebookでよく見かける世代</td></tr><tr><td>Current package</td><td>official GitHubのdefaultは更新される</td><td>READMEの推奨条件を都度確認</td><td>Competition開始時にversion固定してCVする</td></tr></tbody></table></div>

2026年9月4日時点のofficial repositoryはdefault modelとして**TabPFN-2.6**を案内しています（[PriorLabs/TabPFN](https://github.com/PriorLabs/TabPFN)）。一方、Kaggle上にはTabPFN-2.5 modelも公開されています（[Kaggle Models: Prior Labs TabPFN-2.5](https://www.kaggle.com/models/prior-labsai/tabpfn-2-5)）。

Version差で再現性が変わり得るため、Writeupにはpackage version・checkpoint・ensemble設定まで残す方が安全です。

## GBDT・RealMLP・FT-Transformerとの使い分け {#comparison}

<div class="html-table-wrap"><table class="html-table"><thead><tr><th>Model</th><th>Competition dataで何を学ぶか</th><th>強み</th><th>注意</th></tr></thead><tbody><tr><td><strong>TabPFN</strong></td><td>train rowsをcontextとして利用</td><td>小〜中規模で強いdefault、model diversity</td><td>context / memory / inference、version・license</td></tr><tr><td><a href="{{ '/wiki/modeling/lightgbm.html' | relative_url }}">LightGBM</a></td><td>tree structure / leaf score</td><td>大規模tabular、速度、自由なobjective</td><td>HPO・feature engineering依存</td></tr><tr><td><a href="{{ '/wiki/modeling/realmlp.html' | relative_url }}">RealMLP</a></td><td>MLP weight</td><td>tabular向けtraining recipeが強い</td><td>通常のNN trainingが必要</td></tr><tr><td><a href="{{ '/wiki/modeling/ft-transformer.html' | relative_url }}">FT-Transformer</a></td><td>Transformer weight</td><td>feature interactionをattentionで学ぶ</td><td>Competition dataset上でgradient training</td></tr></tbody></table></div>

Kaggleでは「どれか1つを信仰する」より、**honest OOFを作って単体性能とprediction correlationを確認する**方が重要です。2026 Playgroundの上位解法でも、TabPFN系artifactは単独winnerというより、RealMLP・GBDT・stackerと混ぜてdiversityを作る使い方が見られます。

## Kaggleでの実例 {#kaggle-examples}

### Predicting Stellar Class — Playground Series S6E6, 24th place

2026年6月終了のPredicting Stellar ClassはBalanced Accuracyで評価されたtabular classificationです（[Competition overview](https://www.kaggle.com/competitions/playground-series-s6e6/overview)）。24th place solutionでは最終ensembleが32 modelsで、最良single modelのOOF Balanced AccuracyはRealMLP / boostingとも約**0.9691**でした。

同WriteupではGPU logistic regression stacker等を追加して**0.97032**、さらに**TabPFN-3とlogistic regression stackerのweighted meanで0.97043**まで上がったと報告されています（[24th place solution](https://www.kaggle.com/competitions/playground-series-s6e6/writeups/24th-place-solution)）。

<div class="comparison-board"><section class="comparison-card"><h4>強いsingle family</h4><dl><dt>OOF BA</dt><dd>約0.9691</dd><dt>例</dt><dd>RealMLP / boosting</dd></dl></section><section class="comparison-card"><h4>Stacker拡張</h4><dl><dt>OOF BA</dt><dd>0.97032</dd><dt>役割</dt><dd>多modelのpredictionを統合</dd></dl></section><section class="comparison-card is-primary"><h4>TabPFN系を加えたblend</h4><dl><dt>OOF BA</dt><dd>0.97043</dd><dt>Evidence</dt><dd>A: OOF差が明記</dd></dl></section></div>

ここで重要なのは「TabPFNだけで勝った」ではなく、**すでに強いstackへ異なるfamilyのpredictionを足し、OOFで小さいが確認可能な改善を得た**点です。

### Predicting Stellar Class — 6th place

同Competitionの6th place solutionは、92 modelsのOOF probability stackで**OOF 0.970718 / Private 0.97054**を報告し、family mixに**TabPFN-style artifactsを2個**含めています。最大familyはRealMLP 24、XGBoost 19、CatBoost 12であり、TabPFNは巨大stack内のdiversity要員として使われました（[6th place solution](https://www.kaggle.com/competitions/playground-series-s6e6/writeups/6th-place-solution-trusting-the-oof-plateau)）。

この例ではTabPFN単独のablationは示されていないため、**「TabPFNが何点改善した」とは言えません**。Evidenceとしては「上位solutionの最終構成へ採用された」ことまでです。

### Predicting Stellar Class — 8th place: metric補正との組み合わせ

8th place solutionではBalanced Accuracyに合わせ、unweighted modelのclass probabilityを**class priorで割って再正規化**するpost-hoc correctionを使っています。Writeupはsample weightを直接扱わないmodelとしてRealMLPとTabPFNを挙げています（[8th place solution](https://www.kaggle.com/competitions/playground-series-s6e6/writeups/8th-place-solution)）。

これは重要な実戦例です。TabPFNのmodel familyが強くても、**Competition metricへprediction spaceを合わせる処理**が別途必要なことがあります。

### Borekat — 1st place writeup

2026年1月のBorekat 1st place writeupはTabPFNを中心にしたsolutionを公開しています（[1st place writeup](https://www.kaggle.com/competitions/borekat/writeups/1st-rainfall-binary-prediction)）。ただしBorekatはKudosのCommunity Prediction Competitionで、通常のKaggle Medal competitionとは条件が異なります。**「Kaggleで1位」という事実と、Medal competitionでの一般化可能な強さは分けて解釈**します。

## Kaggleでの実践判断

<div class="comparison-board"><section class="comparison-card is-primary"><h4>まず単体OOF</h4><dl><dt>見る</dt><dd>metric、fold安定性、推論時間</dd><dt>判断</dt><dd>default TabPFNがGBDT / RealMLPへどこまで迫るか</dd></dl></section><section class="comparison-card"><h4>次にdiversity</h4><dl><dt>見る</dt><dd>OOF correlation、error pattern</dd><dt>判断</dt><dd>単体が少し弱くてもblendで効くか</dd></dl></section><section class="comparison-card"><h4>最後にmetric整合</h4><dl><dt>見る</dt><dd>class imbalance、calibration、threshold</dd><dt>判断</dt><dd>raw probabilityのまま提出しない方がよいか</dd></dl></section></div>

TabPFNはHPOを減らせる可能性がありますが、**Validationを省略できるmodelではありません**。むしろversion、context size、ensemble設定、post-processingの違いをOOFで比較する必要があります。

## 注意点 {#pitfalls}

### `fit()`を普通のNN trainingと同じ意味で理解しない

scikit-learn互換API上は`fit(X_train, y_train)`を呼びますが、TabPFNの中心的な考え方はCompetition datasetでnetwork weightを一からgradient updateすることではありません。train rowsはpredict時のcontextとして使われます（[official repository](https://github.com/PriorLabs/TabPFN)）。

### OOFで自分自身のlabelをcontextへ入れない

Validation rowのlabelをcontextへ含めれば完全なLeakageです。各foldではfold外Train contextだけを使ってValidation rowsをpredictします。

### 大規模datasetでは計算budgetを先に測る

Nature論文はmemory usageがdataset sizeとともに増え、大規模datasetで制約になり得ることをLimitationsとして挙げています。current official READMEもGPUを推奨し、dataset sizeに応じた利用指針を示しています（[Nature 2025](https://doi.org/10.1038/s41586-024-08328-6), [PriorLabs/TabPFN](https://github.com/PriorLabs/TabPFN)）。

Competitionでは「全fold × 全seed × 全test inference」が締切内に収まるかで判断します。

### Scaling / One-hotを機械的に入れない

current official READMEは通常のTabPFN利用で**data scalingやone-hot encodingを避ける**よう案内しています。GBDT / MLP用pipelineをそのまま流用せず、TabPFN用input pipelineを別管理します（[PriorLabs/TabPFN](https://github.com/PriorLabs/TabPFN)）。

### Metricをmodel任せにしない

Balanced Accuracy、F1、Quadratic Weighted Kappa等では、raw class probabilityと最終metricの最適点が一致しないことがあります。OOF probabilityを保存し、prior correction、threshold、rank変換、stackingを**fold外predictionだけで**選びます。

### Licenseとcheckpoint accessを確認する

2026年9月時点のofficial repositoryではTabPFN-2.5 / 2.6 weightsをnon-commercial license、v2 weightsを別license条件として案内しています。Competition Rulesや再配布条件と合わせて**実際に使うcheckpointのlicenseを実行時点で確認**します（[PriorLabs/TabPFN](https://github.com/PriorLabs/TabPFN)）。

### Version名をWriteupだけで推測しない

Kaggleには`TabPFN-3 Stacker`や`TabPFN-style artifact`のような呼び方があり、official package versionと1対1で対応しない場合があります。再現したいときはNotebook、package version、checkpoint名まで辿ります。

## Quick Reference

<div class="comparison-board"><section class="comparison-card is-primary"><h4>何か</h4><dl><dt>Model</dt><dd>tabular foundation model</dd><dt>核心</dt><dd>synthetic tasksで予測algorithmを事前学習</dd></dl></section><section class="comparison-card"><h4>どう予測するか</h4><dl><dt>Train rows</dt><dd>contextとして渡す</dd><dt>Test row</dt><dd>ICLでtargetを推論</dd></dl></section><section class="comparison-card"><h4>Kaggleでの役割</h4><dl><dt>単体</dt><dd>強いtabular baseline候補</dd><dt>Ensemble</dt><dd>GBDT / RealMLPと異なるprediction diversity</dd></dl></section><section class="comparison-card"><h4>避ける誤解</h4><dl><dt>誤り</dt><dd>「学習なし = train data不要」</dd><dt>正しくは</dt><dd>weight更新をせずtrain dataをcontext利用</dd></dl></section></div>

## 関連項目

- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})
- [XGBoost]({{ '/wiki/modeling/xgboost.html' | relative_url }})
- [CatBoost]({{ '/wiki/modeling/catboost.html' | relative_url }})
- [FT-Transformer]({{ '/wiki/modeling/ft-transformer.html' | relative_url }})
- [RealMLP]({{ '/wiki/modeling/realmlp.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})

## 参考文献

1. Hollmann et al., “Accurate predictions on small data with a tabular foundation model”, Nature 637, 319–326, 2025. https://doi.org/10.1038/s41586-024-08328-6
2. Hollmann et al., “TabPFN: A Transformer That Solves Small Tabular Classification Problems in a Second”, arXiv, 2022. https://arxiv.org/abs/2207.01848
3. Prior Labs, `PriorLabs/TabPFN` official repository and documentation, accessed 2026-09-04. https://github.com/PriorLabs/TabPFN
4. Prior Labs Team, “TabPFN-2.5 Model Report”, 2025-11-06. https://priorlabs.ai/technical-reports/tabpfn-2-5-model-report
5. Prior Labs, “TabPFN-2.5”, Kaggle Models, 2025. https://www.kaggle.com/models/prior-labsai/tabpfn-2-5
6. Yao Yan, Walter Reade, Elizabeth Park, “Predicting Stellar Class”, Kaggle Playground Series S6E6, 2026. https://www.kaggle.com/competitions/playground-series-s6e6
7. cstdy, “24th Place Solution”, Predicting Stellar Class, Kaggle, 2026-06-30. https://www.kaggle.com/competitions/playground-series-s6e6/writeups/24th-place-solution
8. Kaggle user solution, “6th Place Solution: Trusting The OOF Plateau”, Predicting Stellar Class, Kaggle, 2026-07-01. https://www.kaggle.com/competitions/playground-series-s6e6/writeups/6th-place-solution-trusting-the-oof-plateau
9. Kaggle user solution, “8th Place Solution”, Predicting Stellar Class, Kaggle, 2026-06-30. https://www.kaggle.com/competitions/playground-series-s6e6/writeups/8th-place-solution
10. Antonoof, “1st Rainfall binary prediction”, Borekat, Kaggle, 2026-01-24. https://www.kaggle.com/competitions/borekat/writeups/1st-rainfall-binary-prediction

日本語ではZenn「TabPFN v2.5 完全解説 - なぜ学習なしで強いのか」（2026-01-28）、QiitaのTabPFN解説、2026年8月のGBDT比較記事も確認し、version・ICL・性能主張は上記の一次情報へ遡って照合しています。

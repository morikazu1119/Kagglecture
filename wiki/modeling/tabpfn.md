---
layout: default
title: TabPFN
summary: 多数のsynthetic tabular taskで事前学習し、train rowsをcontextとしてtest rowsを推論するtabular foundation model。
type: reference
domain: kaggle
topic: tabpfn
created: 2026-09-03
updated: 2026-09-03
source_count: 6
tags: [kaggle, modeling, tabular, foundation-model, tabpfn]
---

# TabPFN

**TabPFN（Tabular Prior-Data Fitted Network）は、新しいdatasetごとにmodel parameterを一から学習する代わりに、事前学習済みmodelへ「このTrain rowsとlabelsを見て、このTest rowを予測して」とcontextとして渡すtabular foundation modelです。**

事前学習では大量のsynthetic tabular datasetを生成し、その上で「与えられたTrain setから未知rowをどう予測するか」自体を学びます。推論時はGradient Boostingのようにそのdataset専用のtreeをfitするのではなく、**in-context learning**で予測します（[TabPFN paper](https://arxiv.org/abs/2207.01848)）。

<nav class="article-jump-nav"><a href="#icl">In-context Learning</a><a href="#pretraining">事前学習</a><a href="#architecture">全体構造</a><a href="#versions">v2 / 2.5</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## Train rowsをcontextとして渡す {#icl}

通常のtabular modelはTrain dataを使ってparameterを更新します。TabPFNでは、pretrained modelのweightは基本そのままに、**labeled Train rows + unlabeled Test rowを同じinput contextへ入れてprediction**します。

<div class="model-architecture" aria-label="TabPFN in-context learning">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Train examplesを「学習データ」ではなく「context」としてmodelへ見せる</div><p class="model-architecture__subtitle">model parameterをdatasetごとに最初から最適化する代わりに、forward pass内でdataset patternを読み取ります。</p></div><span class="model-architecture__badge">in-context learning</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Row A<br>x, y=1</span></div></div><div class="model-stage"><div class="model-tensor"><span>Row B<br>x, y=0</span></div></div><div class="model-stage"><div class="model-tensor"><span>Row C<br>x, y=1</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Test Row<br>x, y=?</span></div></div><div class="model-stage"><div class="model-op-box"><span>Pretrained<br>TabPFN</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>P(y|context)</span></div></div></div>
</div>

このため、TabPFNの「training time」がほぼないという説明を見かけますが、正確には**巨大なpretrainingはすでに別の場所で終わっている**という意味です。

## 何を事前学習しているか {#pretraining}

現実のKaggle datasetを何百万個も集めるのではなく、構造的なpriorからsynthetic datasetを大量生成し、「この種類のdatasetならどんなpredictive ruleがあり得るか」を学びます。

<div class="model-architecture"><div class="model-architecture__header"><div><div class="model-architecture__title">Synthetic task generator → millions of tasks → pretrained inference machine</div><p class="model-architecture__subtitle">事前学習でdataset-levelの推論能力をweightへ圧縮します。</p></div><span class="model-architecture__badge">prior-data fitting</span></div><div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-op-box"><span>Prior / SCM<br>Generator</span></div></div><div class="model-stage"><div class="model-tensor"><span>Synthetic<br>Dataset 1…M</span></div></div><div class="model-stage"><div class="model-op-box"><span>Offline<br>Pretraining</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>TabPFN<br>Weights</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>New dataset<br>ICL</span></div></div></div></div>

元TabPFNは小規模numerical classificationを中心に設計されましたが、その後のversionでは対象規模・feature type・regression等が拡張されています。

## 全体構造 {#architecture}

TabPFNはTransformer-basedですが、通常のFT-Transformerとは目的が違います。FT-Transformerは**1 row内のfeature interaction**を学びながらdataset専用にfitします。TabPFNは**Train examples自体をcontextとして読み、test predictionをin-contextで出す**のが中心です。

<div class="comparison-board"><section class="comparison-card"><h4>FT-Transformer</h4><dl><dt>fit</dt><dd>datasetごとにgradient training</dd><dt>主なattention</dt><dd>row内feature token</dd><dt>knowledge</dt><dd>そのdatasetから学ぶ</dd></dl></section><section class="comparison-card is-primary"><h4>TabPFN</h4><dl><dt>fit</dt><dd>pretrained weightでICL</dd><dt>主なcontext</dt><dd>Train rows + labels + query rows</dd><dt>knowledge</dt><dd>synthetic task pretraining + current context</dd></dl></section></div>

## v2 / TabPFN-2.5 {#versions}

TabPFNは2022年版から大きく進化しています。2025年以降のTabPFN v2系はsmall-to-medium tabular taskで広く使われ、2025年末の**TabPFN-2.5**は最大50,000 rows・2,000 featuresを対象範囲として掲げています（[TabPFN-2.5](https://arxiv.org/abs/2511.08667)）。

<div class="comparison-board"><section class="comparison-card"><h4>Original TabPFN</h4><dl><dt>得意</dt><dd>small numerical classification</dd><dt>制約</dt><dd>rows/features/classesが小さい</dd></dl></section><section class="comparison-card"><h4>TabPFN v2</h4><dl><dt>拡張</dt><dd>regression / mixed features / larger scale</dd><dt>位置付け</dt><dd>tabular foundation modelとして実用化</dd></dl></section><section class="comparison-card is-primary"><h4>TabPFN-2.5</h4><dl><dt>対象</dt><dd>最大50k rows / 2k featuresを掲げる</dd><dt>追加</dt><dd>distillation engine等</dd></dl></section></div>

Kaggle Notebookで使うpackage/versionによって制約が違うため、単に「TabPFN」とだけ記録せずversionを残します。

## Kaggleでの実例 {#kaggle-examples}

Borekat Rainfall Prediction 2026の1位solutionでは**TabPFN**を中心にsmall tabular classificationへ適用しています（[1st solution](https://www.kaggle.com/competitions/borekat/writeups/1st-rainfall-binary-prediction)）。

Mercor Cheating Detection 2026の5位solutionではFT-Transformer / TabPFN / TabM / RealMLPをGBDT群とensembleし、neural modelsは単体AUCがやや低くてもdiversityを提供したと説明しています（[5th place solution](https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup)）。

## 注意点 {#pitfalls}

### CVで自分自身をcontextに入れない

OOF predictionを作るとき、Validation rowのlabelをcontextへ含めれば完全なLeakageです。各foldのTrain contextだけでValidationをpredictします。

### dataset size制約

versionごとに推奨rows/features/classesが違います。大規模datasetを無理に全部contextへ入れるより、subsampling/ensemble/feature selectionを検討します。

### prior mismatch

pretraining priorが現実datasetを完全に表すわけではありません。特殊domain・極端なdistributionではGBDT等が上回ることがあります。

### runtimeの見え方

「fit不要」でもcontext sizeが増えるとinferenceは重くなります。CV folds・ensemble数・test rowsまで含めた総runtimeで判断します。

## Quick Reference

- synthetic tasksでoffline pretraining。
- new datasetではTrain rowsをcontextとしてICL。
- dataset-specific gradient fitが基本不要。
- FT-Transformerとは「どこで学習するか」が大きく違う。
- versionごとのdata-size制約を確認。

## 関連項目

- [FT-Transformer]({{ '/wiki/modeling/ft-transformer.html' | relative_url }})
- [RealMLP]({{ '/wiki/modeling/realmlp.html' | relative_url }})
- [TabM]({{ '/wiki/modeling/tabm.html' | relative_url }})
- [LightGBM]({{ '/wiki/modeling/lightgbm.html' | relative_url }})

## 参考文献

1. Hollmann et al., “TabPFN: A Transformer That Solves Small Tabular Classification Problems in a Second”, 2022. https://arxiv.org/abs/2207.01848
2. Hollmann et al., “Accurate predictions on small data with a tabular foundation model”, Nature, 2025. https://www.nature.com/articles/s41586-024-08328-6
3. Grinsztajn et al., “TabPFN-2.5”, 2025. https://arxiv.org/abs/2511.08667
4. Kaggle, “Borekat: 1st Rainfall binary prediction”, 2026. https://www.kaggle.com/competitions/borekat/writeups/1st-rainfall-binary-prediction
5. Kaggle, “Mercor Cheating Detection: 5th place solution”, 2026. https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup
6. TabPFN repository. https://github.com/PriorLabs/TabPFN

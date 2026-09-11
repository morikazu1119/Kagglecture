---
layout: default
title: Ensemble Diversity
summary: 単体scoreだけでなくOOF predictionの違い・誤差の違いを見て、blendで補完し合うmodelを選ぶ考え方。
type: reference
domain: kaggle
topic: ensemble-diversity
created: 2026-09-11
updated: 2026-09-11
source_count: 9
tags:
  - kaggle
  - ensemble
  - oof
  - diversity
---

# Ensemble Diversity

**Ensemble Diversityは、単体scoreが高いmodelだけを集めるのではなく、「既存modelと違う外し方をするmodel」を混ぜて、ensemble全体の誤差を減らす考え方です。**

単体で少し弱くても、強いmodelとpredictionや誤差の相関が低ければblendで価値を持つことがあります。逆に、単体scoreが高いmodelを何本増やしてもpredictionがほぼ同じなら、追加改善は小さくなりやすいです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#intuition">直感</a>
  <a href="#measure">測り方</a>
  <a href="#selection">候補選択</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 直感: 「強さ」と「違い」の両方を見る {#intuition}

3つのOOF modelがあるとします。AとBは単体scoreが高くても、ほぼ同じsampleを同じ順序で予測するなら、A+Bの追加情報は少ない可能性があります。一方Cが少し弱くてもAが外すsampleを当てるなら、A+Cの方がensembleで伸びることがあります。

<div class="model-architecture" aria-label="Ensemble Diversityの模式図">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">単体scoreだけではなく「誤差の重なり」を見る</div><p class="model-architecture__subtitle">模式例。数値は実測値ではありません。</p></div>
    <span class="model-architecture__badge">strength × diversity</span>
  </div>
  <div class="model-stage-row" style="--model-cols:3">
    <div class="model-stage"><div class="model-tensor is-accent"><span><strong>Model A</strong><br>OOF 0.920<br>基準model</span></div><span class="model-stage__label">強い</span></div>
    <div class="model-stage"><div class="model-tensor"><span><strong>Model B</strong><br>OOF 0.919<br>corr(A,B)=0.99</span></div><span class="model-stage__label">強いが似ている</span></div>
    <div class="model-stage"><div class="model-tensor"><span><strong>Model C</strong><br>OOF 0.916<br>corr(A,C)=0.88</span></div><span class="model-stage__label">少し弱いが違う</span></div>
  </div>
  <p class="model-architecture__caption">低相関なら必ず効くわけではありません。必要なのは「十分な単体性能」と「既存blendを補完する違い」の両立です。</p>
</div>

<div class="comparison-board" aria-label="Ensemble候補の判断軸">
  <section class="comparison-card"><h4>強い + 似ている</h4><dl><dt>単体score</dt><dd>高い</dd><dt>既存blendとの相関</dt><dd>非常に高い</dd><dt>典型</dt><dd>同一modelの近いparameter</dd></dl></section>
  <section class="comparison-card is-primary"><h4>強い + 違う</h4><dl><dt>単体score</dt><dd>十分高い</dd><dt>既存blendとの相関</dt><dd>低め</dd><dt>典型</dt><dd>GBDT + NN、別feature family</dd></dl></section>
  <section class="comparison-card"><h4>弱い + 違う</h4><dl><dt>単体score</dt><dd>低い</dd><dt>相関</dt><dd>低い</dd><dt>注意</dt><dd>diverseなだけでは不足</dd></dl></section>
</div>

## 何を測るか {#measure}

### 1. OOF predictionの相関

同じrow順に揃えたOut-of-Fold prediction同士の相関を見ます。二値分類でAUC中心なら、raw probabilityのscale差を受けにくいSpearman rank correlationも使いやすいです。確率値そのものを混ぜるLogLoss系ではPearson correlationも確認します。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>見るもの</th><th>何が分かるか</th><th>向く場面</th><th>注意</th></tr></thead>
  <tbody>
    <tr><th scope="row">Pearson correlation</th><td>prediction値が線形にどれだけ似るか</td><td>probability average、regression</td><td>scaleやcalibration差の影響を受ける</td></tr>
    <tr><th scope="row">Spearman correlation</th><td>predictionの順位がどれだけ似るか</td><td>AUC、rank blend</td><td>確率の距離情報は捨てる</td></tr>
    <tr><th scope="row">Residual / error correlation</th><td>同じsampleを同時に外しているか</td><td>regression、label付きOOF</td><td>metricに合うerror定義が必要</td></tr>
    <tr><th scope="row">Blend delta</th><td>実際に混ぜたときMetricが改善するか</td><td>最終判断</td><td>OOFへのselection overfitに注意</td></tr>
  </tbody>
</table></div>

相関は**候補を絞る診断**であり、最終的な採用基準はCompetition Metric上のOOF blend deltaです。

### 2. 誤差の重なり

classificationなら、各modelが誤るsample集合や高loss sampleを比較します。regressionならresidualの符号・大きさを比べます。

同じ平均scoreでも、同じ10%を外す2本より、異なる10%を外す2本の方がaverageで補完できる余地があります。

### 3. Model family / feature / data viewの違い

prediction correlationの結果だけでなく、**なぜ違うpredictionになるのか**も記録します。

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>Diversity source</th><th>例</th><th>期待する違い</th></tr></thead>
  <tbody>
    <tr><th scope="row">Algorithm</th><td>LightGBM / CatBoost / NN / linear</td><td>decision boundary、smoothness</td></tr>
    <tr><th scope="row">Feature view</th><td>raw / aggregation / graph / embedding</td><td>拾うsignalの種類</td></tr>
    <tr><th scope="row">Architecture</th><td>CNN / SED / Transformer / foundation embedding</td><td>表現とreceptive field</td></tr>
    <tr><th scope="row">Training recipe</th><td>loss、augmentation、pseudo label、sampling</td><td>error bias</td></tr>
    <tr><th scope="row">Seed / fold</th><td>同一recipeのrandomness違い</td><td>variance低減。通常は差は小さめ</td></tr>
  </tbody>
</table></div>

## 候補をどう選ぶか {#selection}

実務では「最強modelを10本」より、次の順で選ぶと管理しやすくなります。

1. すべての候補を**同じCV split**でOOF化する。
2. Competition Metricで単体scoreを計算する。
3. 明らかに弱い候補を除く。
4. 残った候補のOOF correlation / residual overlapを見る。
5. 似すぎた候補をdeduplicateする。
6. Weighted AverageまたはHill Climbingで**追加時のOOF delta**を測る。
7. fold別delta、別seed、outer holdoutでも同じ候補が残るか確認する。

<div class="comparison-board" aria-label="Ensemble Diversityと既存Ensemble手法の関係">
  <section class="comparison-card"><h4>Ensemble Diversity</h4><dl><dt>答える質問</dt><dd>何を混ぜるか</dd><dt>入力</dt><dd>OOF predictions / errors</dd></dl></section>
  <section class="comparison-card"><h4>Weighted Average</h4><dl><dt>答える質問</dt><dd>何%ずつ混ぜるか</dd><dt>入力</dt><dd>選んだprediction</dd></dl></section>
  <section class="comparison-card"><h4>Hill Climbing</h4><dl><dt>答える質問</dt><dd>追加価値が高い順はどれか</dd><dt>入力</dt><dd>多数のOOF候補</dd></dl></section>
  <section class="comparison-card"><h4>Fold / Seed Ensemble</h4><dl><dt>答える質問</dt><dd>同じrecipeのvarianceをどう減らすか</dd><dt>入力</dt><dd>fold / seed違いmodel</dd></dl></section>
</div>

## Kaggleでの実例 {#kaggle-examples}

### BirdCLEF+ 2026: 上位解法で「違う枝」を意図的に残す

2位解法はPublic Perch、distilled SED、自作CNN、Insecta specialistを組み合わせた**diverse ensemble**を最終構成にしています（[2nd Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/2nd-place-diverse-ensemble-with-pseudo-labeling-a)）。

5位解法もタイトル自体を`Diversity and Bug - Both Are All You Need`とし、単一architectureへ収束させず複数系統を残しています（[5th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/5th-place-solution-both-are-all-you-need)）。

14位解法では、主力SEDに加え、別neck・hop設定のSED smallを**mostly a diversity branch**として明示的に残し、さらにProtoSSM / Perch branchを組み合わせています。最終Privateは0.95531、14位でした（[14th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/14th-place-solo-gold-solution)）。

別チームのSilver解法では、Perch系ProtoSSMとSEDのpredictionが低相関であることを理由に併用し、候補約20本から**low OOF correlation**のmemberを優先したと明記しています。PublicではSED single 0.913〜0.928、ProtoSSM 0.931に対してensemble 0.955、Private ensemble 0.944でした（[BirdCLEF+ 2026 solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/137th-solution-protossm-3-sed-models-ensemblep)）。この例は相関をselectionへ直接使ったEvidenceですが、Public中心の選択だったため値の一般化には注意が必要です。

### Predict Customer Churn 2026: architecture / feature diversityを大量poolへ入れる

9位解法ではGBDT、RealMLP、TabM、TabTransformer、FT-Transformer、ResNet、GNN、linear系まで含むmodel libraryを作り、**maximum architectural diversity**を狙ったうえでOOFをrank化しGPU Hill Climbingしています。最終CV AUCは0.919911でした（[9th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution)）。

17位解法では138 modelのpoolに対し、CATNUM aggregation、distribution features、clustering、frequency combinations、periodic embeddings、residual boostingなど**異なるfeature family**を持つmodelが最終Hill Climbingで高weightを取っています。最終OOF AUCは0.91974でした（[17th Place Solution](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)）。

### Mercor Cheating Detection 2025/2026: 単体が弱くても残す

5位解法では13-model ensembleに7 GBDT、5 NN、Logistic Regressionを採用しています。NNは単体AUCが約0.85でGBDTの約0.86より低く、Logistic Regressionは0.816でしたが、作者は**valuable diversity**を理由に最終ensembleへ残しています（[5th Place Solution Writeup](https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup)）。

これは「単体score順に上位だけ残す」と取りこぼすcandidateがあることを示すEvidence Bです。個々のmemberの単独blend ablationは公開されていないため、効果量は推測しません。

## 注意点 {#pitfalls}

### 低相関なら何でもよいわけではない

ランダムmodelは強いmodelと低相関ですが役に立ちません。まず最低限の単体性能を満たし、その上でdiversityを見る必要があります。

### 相関だけでselectionを完結しない

Pearson 0.85のmodelがPearson 0.95のmodelより必ずensembleへ効くとは限りません。metric、calibration、class imbalance、error magnitudeを反映するため、最後はOOF blend deltaを測ります。

### CVが違うOOFを比較しない

fold splitやrow subsetが違うOOF同士の相関は、そのまま候補選択へ使えません。同じsample・同じrow順・同じvalidation設計で揃えます。

### AUCとLogLossでは見る相関が違う

AUCは順位が中心なのでSpearmanやrank-spaceでの比較が自然です。一方LogLossではprediction scaleとcalibrationが重要なので、rank correlationだけでは情報が足りません。

### Model poolを増やしすぎるとOOFへ過適合する

100〜1000本から最良組合せを探索すると、selection自体がOOF noiseを拾います。familyごとの重複除去、outer holdout、fold別delta、複数seedで再現性を確認します。

### Inference costを無視しない

Diversityを増やすためにarchitectureを増やすとruntime・memoryが増えます。BirdCLEF+ 2026のようにCPU inference制限が強いCompetitionでは、1本追加のscore gainと推論costをセットで判断します。

## Quick Reference {#quick-reference}

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>残したいcandidate</h4><dl><dt>単体</dt><dd>十分強い</dd><dt>OOF</dt><dd>既存blendと違う</dd><dt>最終確認</dt><dd>blend deltaが再現</dd></dl></section>
  <section class="comparison-card"><h4>削りたいcandidate</h4><dl><dt>単体</dt><dd>既存modelと同等以下</dd><dt>OOF</dt><dd>ほぼduplicate</dd><dt>結果</dt><dd>costだけ増えやすい</dd></dl></section>
  <section class="comparison-card"><h4>要注意candidate</h4><dl><dt>単体</dt><dd>かなり弱い</dd><dt>OOF</dt><dd>低相関</dd><dt>判断</dt><dd>低相関だけで採らない</dd></dl></section>
</div>

- OOFは同じfold・同じrow順で揃える。
- 単体Metricとprediction / residual correlationを両方見る。
- AUC系ではSpearman、probability系ではPearsonも確認する。
- 最終判断はCompetition Metric上のOOF blend delta。
- model family、feature family、data viewの違いをmetadataとして残す。
- 候補が多いときは[Hill Climbing Ensemble]({{ '/wiki/ensemble/hill-climbing.html' | relative_url }})と組み合わせる。

## 関連項目

- [Hill Climbing Ensemble]({{ '/wiki/ensemble/hill-climbing.html' | relative_url }})
- [Weighted Average]({{ '/wiki/ensemble/weighted-average.html' | relative_url }})
- [Fold / Seed Ensemble]({{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }})
- [Stacking]({{ '/wiki/ensemble/stacking.html' | relative_url }})
- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})

## 参考文献

1. [tennogh, “2nd Place: Diverse Ensemble with Pseudo-Labeling and a Taxon Specialist”, BirdCLEF+ 2026, Kaggle, 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/2nd-place-diverse-ensemble-with-pseudo-labeling-a)
2. [Kaggle, “5th Place Solution: Diversity and Bug - Both Are All You Need”, BirdCLEF+ 2026, 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/5th-place-solution-both-are-all-you-need)
3. [Kaggle, “14th place solo gold solution”, BirdCLEF+ 2026, 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/14th-place-solo-gold-solution)
4. [payanotty et al., “137th place solution, ProtoSSM + 3 SED models ensemble”, BirdCLEF+ 2026, Kaggle, 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/137th-solution-protossm-3-sed-models-ensemblep)
5. [Mert Bayraktar, “9th place solution”, Predict Customer Churn, Kaggle, 2026](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/9th-place-solution)
6. [Kaggle, “17th Place Solution”, Predict Customer Churn, 2026](https://www.kaggle.com/competitions/playground-series-s6e3/writeups/17th-place-solution)
7. [Yew Jin Lim, “Somehow 5th place Solution Writeup”, Mercor Cheating Detection, Kaggle, 2026](https://www.kaggle.com/competitions/mercor-cheating-detection/writeups/5th-place-solution-writeup)
8. [SciPy, `scipy.stats.pearsonr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html)
9. [SciPy, `scipy.stats.spearmanr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html)

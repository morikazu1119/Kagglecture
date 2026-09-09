---
layout: default
title: Negative Sampling
summary: 推薦・ランキング学習で大量の負例を間引き、計算量を抑えながら「何を負例として学ばせるか」を設計する。
type: reference
domain: kaggle
topic: negative-sampling
created: 2026-09-09
updated: 2026-09-09
source_count: 8
tags:
  - kaggle
  - recommendation
  - ranking
  - sampling
---

# Negative Sampling

Negative Samplingは、**正例に対して圧倒的に多い負例の一部だけを学習に使う方法**です。

推薦では「userが選ばなかったitem」が大量に存在します。全部を学習へ入れると計算量が大きく、easy negativeばかりになりやすいため、**どの負例を・何件・どの分布から選ぶか**を設計します。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#strategies">選び方</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>負例が多すぎる</h4><dl><dt>典型</dt><dd>user-item / session-item ranking</dd><dt>目的</dt><dd>学習量を削る</dd></dl></section>
  <section class="comparison-card"><h4>easy negativeが多い</h4><dl><dt>問題</dt><dd>明らかに無関係なitemばかり</dd><dt>目的</dt><dd>判別が難しいnegativeを増やす</dd></dl></section>
  <section class="comparison-card"><h4>候補生成後にrankerを学習</h4><dl><dt>前提</dt><dd>candidate内で0/1 labelを作る</dd><dt>注意</dt><dd>候補生成とは別工程</dd></dl></section>
</div>

ただし、負例を減らせば必ず良くなるわけではありません。負例分布を変えるとmodelが見る問題自体が変わるため、**sampling後のOOF / ranking metricで確認する**必要があります。

## 仕組み {#mechanism}

最も重要なのは、Negative Samplingが単なる「データ削減」ではなく、**modelへ見せる負例分布の設計**だという点です。

<div class="static-viz html-diagram" role="img" aria-label="Negative Samplingの模式図">
  <div class="html-flow">
    <div class="html-flow__node"><strong>1 positive</strong><br>購入・clickなど</div>
    <div class="html-flow__connector" aria-hidden="true">+</div>
    <div class="html-flow__node"><strong>大量negative</strong><br>未購入・未click</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>Sampling rule</strong><br>random / hard / popularity等</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>学習集合</strong><br>positive + 選んだnegative</div>
  </div>
  <p class="viz-note">模式図。実際のpositive:negative比はtask・candidate数・modelで調整します。</p>
</div>

例えば1 userに正解itemが1つ、候補が200件あるとします。正解以外199件をすべてnegativeとして学習してもよいですが、そのうち「全く関係ないitem」が大半なら、modelは簡単な負例判定に多くの容量を使います。

一方で負例を減らしすぎると、本番で頻出する紛らわしいitemを十分に学べません。したがって調整対象は主に次の3つです。

<div class="comparison-board">
  <section class="comparison-card"><h4>量</h4><dl><dt>調整</dt><dd>negative fraction / ratio</dd><dt>見るもの</dt><dd>OOFと学習時間</dd></dl></section>
  <section class="comparison-card"><h4>分布</h4><dl><dt>調整</dt><dd>uniform / popularity / hard</dd><dt>見るもの</dt><dd>本番candidateとの一致</dd></dl></section>
  <section class="comparison-card"><h4>再現性</h4><dl><dt>調整</dt><dd>sampling seed</dd><dt>見るもの</dt><dd>seed間の分散</dd></dl></section>
</div>

## 負例の選び方 {#strategies}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>方法</th><th>特徴</th><th>向く場面</th><th>主なリスク</th></tr></thead>
  <tbody>
    <tr><td>Uniform random</td><td>負例から一様に選ぶ</td><td>高速baseline</td><td>easy negativeに偏る</td></tr>
    <tr><td>Popularity sampling</td><td>人気itemを多めに選ぶ</td><td>競争相手が人気itemになりやすい</td><td>tail itemを軽視</td></tr>
    <tr><td>Hard negative</td><td>modelが高scoreする誤りを選ぶ</td><td>精密なranking</td><td>label noiseを拾いやすい</td></tr>
    <tr><td>In-batch negative</td><td>同じbatch内の他正例を負例化</td><td>embedding / retrieval model</td><td>false negative</td></tr>
    <tr><td>Candidate-aware</td><td>実際のretrieval候補から負例を選ぶ</td><td>2-stage ranker</td><td>candidate generatorへ依存</td></tr>
  </tbody>
</table>
</div>

### Randomだけで終わらせない

Uniform randomは速い一方、推薦の本番では「人気item」「似たitem」「同じsessionで出やすいitem」が競合になりやすいため、random negativeだけでは簡単すぎることがあります。

H&Mの2位参加者Paweł Jankiewiczは、候補を増やしすぎた後、学習時にはnegativeの**5〜10%だけを使用**していたと説明しています。5% downsampling時にはpositive比率が約4%だったとしています（[Kaggle Discussion](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/307288)）。

## 使い分け {#comparison}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>概念</th><th>何を変えるか</th><th>推論時にも関係するか</th></tr></thead>
  <tbody>
    <tr><td><strong>Negative Sampling</strong></td><td>学習に使う負例</td><td>通常は直接は関係しない</td></tr>
    <tr><td><a href="{{ '/wiki/recommendation/candidate-generation.html' | relative_url }}">Candidate Generation</a></td><td>推論対象の候補集合</td><td>関係する</td></tr>
    <tr><td>Class Weight</td><td>loss内の重み</td><td>学習時のみ</td></tr>
    <tr><td>Hard Example Mining</td><td>難しいsampleの優先度</td><td>主に学習時</td></tr>
  </tbody>
</table>
</div>

Candidate Generationは**「何をrankするか」**を決め、Negative Samplingは**「その候補のうち何を学習へ見せるか」**を決めます。

H&M 9位解法では、Trainではcustomerごとに200候補を生成してpositiveを全保持し、negativeの半分をrandom samplingしています。一方Inferenceでは400候補を生成しています（[9th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution)）。この違いが両者を最も分かりやすく示します。

## Kaggleでの実例 {#kaggle-examples}

### OTTO 12位 — positive:negative = 1:20

OTTO 12位解法は、click / cart / orderごとに正例を持つsessionを残し、**positive:negative = 1:20**でnegative downsamplingを行っています（[12th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/buumoo-12th-place-solution)）。

最終解法に明示的に採用された実例ですが、sampling ratio単独のablationは公開されていないため、効果量は推測しません。**Evidence B**として扱います。

### OTTO 28位 — memberごとに15% / 30% / 20% / 独自比率

28位チームでは複数memberが異なるnegative samplingを採用し、15%、30%、20%、またはpositive比率を2.5%にする設定を使っています（[28th place solution](https://www.kaggle.com/competitions/otto-recommender-system/discussion/382812)）。

これは「唯一の正解ratio」があるのではなく、**model・fold・candidate集合ごとに調整されている**実例です。定量ablationはないためEvidence B相当です。

### OTTO 15位 — sampling seedをensemble diversityに使う

OTTO 15位解法は、同じ182 featuresを使う5つのLightGBM Rankerについて、**negative samplingとmodel trainingのseedを変えてensemble**しています。single modelはPublic 0.601 / Private 0.600、5-model ensembleはPublic 0.601 / Private 0.601と報告されています（[15th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution)）。

samplingだけのablationではありませんが、sampling seedがensemble diversityの一部として利用された具体例です。

### H&M 9位 — positiveは全保持、negativeだけ半分にする

H&M 9位解法ではTrain時に**positiveを全て保持し、negativeをrandomに半分だけ使用**しています（[9th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution)）。

推薦ではpositiveが希少なので、positiveまで同率で間引くのではなく、**negative側だけを制御する**設計が基本です。

### H&M 2位 — negativeを5〜10%までdownsample

H&M 2位参加者のDiscussionでは、candidateを増やしても改善しなくなり、学習時にnegativeの**5〜10%のみを使用**したと説明されています。5% downsamplingではpositive率が約4%でした（[Kaggle Discussion](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/307288)）。

これは上位参加者本人の実践報告ですが、5%と10%の定量比較は公開されていないためEvidence Bです。

### 2026 recsys_contest — 「負例生成」が不要な問題もある

2026年7月開始の`recsys_contest`は、test row自体が**実際に観測されたlisten**であるobserved-impression rankingです。公式説明では人工的なCandidate Generation stepはなく、既存rowへscoreを付ける設計と明記されています（[Competition overview](https://www.kaggle.com/competitions/recsys-contest)）。

このタイプでは「未観測user-itemを大量生成して負例にする」必要はありません。0 relevance rowをさらにdownsampleするかどうかは別途検証できますが、**推薦問題だから必ず人工negativeを作るわけではない**点が重要です。

## 注意点 {#pitfalls}

### 1. False Negative

未購入・未clickは「嫌い」の意味ではありません。単に表示されなかった、まだ見ていない可能性があります。特にhard negativeやin-batch negativeでは、本当はpositiveになり得るitemを負例として強く学習する危険があります。

### 2. TrainとInferenceの分布を離しすぎない

Trainではrandom negativeしか見せず、Inferenceではco-visitationやANNで集めた難しい候補ばかり、という状態だと分布がずれます。2-stage rankerでは**実際のcandidate generatorから負例を作る**方が自然なことが多いです。

### 3. Sampling ratioだけで判断しない

1:5、1:20、20%などの数字を他Competitionからコピーしません。同じratioでもcandidate qualityやpositive率が違えば難易度は変わります。

### 4. Validationにも同じsamplingを適用しない

学習用negativeを間引くのは構いませんが、評価側まで都合よくnegativeを減らすと、本番ranking分布を再現できなくなります。Validationは本番candidate生成・時系列・group構造を優先します。

### 5. Class probabilityの解釈が変わる

negativeを大幅にdownsampleすると学習データのclass priorが変わります。分類確率をそのまま実確率として解釈したい場合はcalibrationやprior correctionが必要になることがあります。ranking scoreとして使うだけでも、OOFで順位品質を確認します。

## Quick Reference

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>最初のbaseline</h4><dl><dt>方法</dt><dd>random negative</dd><dt>保持</dt><dd>positiveは原則全保持</dd><dt>確認</dt><dd>OOF / NDCG / MAP / Recall</dd></dl></section>
  <section class="comparison-card"><h4>伸びないとき</h4><dl><dt>確認1</dt><dd>negativeが簡単すぎないか</dd><dt>確認2</dt><dd>candidate分布と一致しているか</dd><dt>候補</dt><dd>hard / popularity / candidate-aware</dd></dl></section>
  <section class="comparison-card"><h4>危険信号</h4><dl><dt>False negative</dt><dd>多い</dd><dt>Train/Valid mismatch</dt><dd>大きい</dd><dt>ratio</dt><dd>他解法から無検証コピー</dd></dl></section>
</div>

## 関連項目

- [Candidate Generation]({{ '/wiki/recommendation/candidate-generation.html' | relative_url }}) — 推論候補を作る段階。Negative Samplingとは目的が異なる。
- [Focal Loss]({{ '/wiki/training/focal-loss.html' | relative_url }}) — easy negativeのloss寄与を下げる別アプローチ。

## 参考文献

1. Paweł Jankiewicz, H&M Personalized Fashion Recommendations, Kaggle Discussion, “Candidates / negative examples” discussion, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/307288
2. Saber, “9th place solution”, H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution
3. buumoo, “12th Place Solution”, OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/buumoo-12th-place-solution
4. Anil et al., “28th Place Solution”, OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/discussion/382812
5. hjam, “15th Place Solution”, OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution
6. Kaggle, “recsys_contest — Pafos AI Camp July 2026”, Competition Overview, 2026. https://www.kaggle.com/competitions/recsys-contest
7. rintaro121, “TRON: Transformerベースの推薦システムのためのNegative Sampling手法”, Zenn, 2024. https://zenn.dev/rintaro121/articles/be0e8ee1e4b93d
8. zerebom, “Kaggle H&Mコンペ参加記 (133rd/2952)”, Zenn, 2022. https://zenn.dev/zerebom/articles/9e6bad764d3f97

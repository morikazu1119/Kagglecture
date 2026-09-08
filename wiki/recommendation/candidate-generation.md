---
layout: default
title: Candidate Generation
summary: 推薦候補を全itemから絞り、正解Recallを保ちながら後段Rankerの計算量と学習難度を下げる。
type: reference
domain: kaggle
topic: candidate-generation
created: 2026-09-08
updated: 2026-09-08
source_count: 9
tags:
  - kaggle
  - recommendation
  - ranking
  - retrieval
---

# Candidate Generation

Candidate Generationは、**全itemを直接rankする代わりに、正解になりそうなitemだけを先に候補集合へ絞る処理**です。

推薦では数万〜数百万itemを毎user / sessionで精密modelへ入れるのは重いため、まず高Recallな候補を作り、その後にLightGBM RankerやNNで細かく順位付けします。重要なのは、**Candidate Generationで落とした正解は後段Rankerでは復活できない**ことです。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#strategies">候補の作り方</a>
  <a href="#evaluation">評価</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>全itemをrankできない</h4><dl><dt>典型</dt><dd>EC、広告、動画、音楽</dd><dt>候補数</dt><dd>全体より数桁小さくする</dd><dt>目的</dt><dd>計算量を削る</dd></dl></section>
  <section class="comparison-card"><h4>複数の推薦signalがある</h4><dl><dt>例</dt><dd>履歴、人気、共起、embedding</dd><dt>目的</dt><dd>異なる正解パターンを拾う</dd></dl></section>
  <section class="comparison-card"><h4>後段Rankerを使いたい</h4><dl><dt>候補</dt><dd>LightGBM / XGBoost / NN</dd><dt>前提</dt><dd>候補に正解が十分含まれる</dd></dl></section>
</div>

逆に、test rows自体が「userに表示されたitem」のような**既定候補集合**なら、Candidate Generationを新たに作る必要はありません。2026年の`recsys_contest`はobserved-impression rankingで、公式説明でも人工的なcandidate generation stepはないと明記されています（[Competition overview](https://www.kaggle.com/competitions/recsys-contest)）。

## 仕組み {#mechanism}

最も重要なのは、Candidate GenerationとRankingで目的が違うことです。

<div class="static-viz html-diagram" role="img" aria-label="Candidate GenerationとRankingの2段階推薦">
  <div class="html-flow">
    <div class="html-flow__node"><strong>全item</strong><br>10万〜100万+</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>Candidate Generation</strong><br>正解を落とさないことを優先</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>候補集合</strong><br>数十〜数千</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>Ranker</strong><br>候補内の順序を精密化</div>
    <div class="html-flow__connector" aria-hidden="true">›</div>
    <div class="html-flow__node"><strong>Top-K</strong><br>submission</div>
  </div>
  <p class="viz-note">模式図。候補数はtask・memory・latencyで変わります。</p>
</div>

Candidate Generationは「Top-Kを当て切るmodel」ではなく、**正解候補の取りこぼしを抑えるRecall stage**です。Rankingはその候補集合を入力として、user-item関係やcandidate scoreを使って最終順位を決めます。

正解itemをCandidate Generationで落とした場合、そのitemはRankerの入力に存在しません。したがって最終Recallには概念上、次の上限があります。

\[
\text{Final Recall@K} \leq \text{Candidate Recall}
\]

ただしcandidate recallを上げるために候補を無制限に増やすと、memory・inference cost・negative比率が増え、後段Rankerが難しくなります。**Recallと候補数のtrade-off**を見る必要があります。

## 候補の作り方 {#strategies}

1種類に固定するより、異なる失敗パターンを持つretrieval strategyをunionするのが基本です。

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>Strategy</th><th>拾いやすいsignal</th><th>弱点</th></tr></thead>
  <tbody>
    <tr><td>Recent / Repurchase</td><td>直近で見た・買ったitem</td><td>新規item、興味変化</td></tr>
    <tr><td>Popularity</td><td>cold userでも強い定番item</td><td>個人化が弱い</td></tr>
    <tr><td>Co-visitation / ItemCF</td><td>一緒に出現するitem</td><td>疎なitem、長期嗜好</td></tr>
    <tr><td>User-based CF</td><td>似たuserが選ぶitem</td><td>大規模計算、cold user</td></tr>
    <tr><td>Embedding / ANN</td><td>意味・行動表現が近いitem</td><td>embedding品質に依存</td></tr>
    <tr><td>Sequential model</td><td>session順序、次行動</td><td>学習・推論が重い</td></tr>
  </tbody>
</table>
</div>

H&M 8位解法は、repurchase、same product code、user-based CF、全体人気、年齢別人気、sales channel別人気をそれぞれ候補源として使っています（[8th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution)）。単一retrievalより、**履歴・協調・人気という異なるsignalを同時に候補へ入れる**設計です。

OTTO 1位解法でも、session内既出item、複数co-visitation matrix、複数NN modelを候補源として併用し、平均候補数は約1,200でした（[1st place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/mrkmakr-1st-place-solution)）。

### Candidate source自体もfeatureになる

候補生成は「候補を通すだけ」ではありません。どのstrategyから来たか、各strategy内rank、score、何個のstrategyに選ばれたかは、後段Rankerにとって有用なsignalになります。

OTTO 22位の日本語参加記では、複数Candidate Generation logicをouter joinし、各logicのscore・rank・選択回数をfeatureとして利用し、1 userあたり最大約300候補を作っています（[Zenn参加記](https://zenn.dev/zerebom/articles/91910acb0d9b93)）。

## 評価 {#evaluation}

Candidate Generationは、最終Leaderboard scoreだけでなく**候補集合単体のRecall**を測ります。

user / session \(u\) の正解集合を \(G_u\)、生成候補集合を \(C_u\) とすると、基本的なcandidate recallは次です。

\[
\text{Candidate Recall}_u = \frac{|G_u \cap C_u|}{|G_u|}
\]

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>まず見る</h4><dl><dt>Metric</dt><dd>Candidate Recall</dd><dt>横軸</dt><dd>候補数</dd><dt>目的</dt><dd>同じ候補数でRecallを上げる</dd></dl></section>
  <section class="comparison-card"><h4>次に見る</h4><dl><dt>Metric</dt><dd>最終OOF / CV</dd><dt>目的</dt><dd>Ranker込みで本当に改善するか</dd></dl></section>
  <section class="comparison-card"><h4>必ず分ける</h4><dl><dt>segment</dt><dd>cold / warm user</dd><dt>必要なら</dt><dd>action type、item freshness</dd></dl></section>
</div>

candidate recallだけを最大化すればよいわけではありません。候補を増やしてRecallが少し上がっても、Rankerの計算量やclass imbalanceが大きくなり、最終CVが悪化することがあります。

## 使い分け

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>概念</th><th>何をするか</th><th>主な評価</th></tr></thead>
  <tbody>
    <tr><td><strong>Candidate Generation</strong></td><td>全itemから候補集合を作る</td><td>Candidate Recall</td></tr>
    <tr><td>Negative Sampling</td><td>学習時に大量negativeの一部を選ぶ</td><td>最終OOF、学習安定性</td></tr>
    <tr><td>Ranking</td><td>候補集合の順位を決める</td><td>NDCG / MAP / Recall等</td></tr>
    <tr><td>Post-processing</td><td>最終scoreや制約を調整する</td><td>最終OOF / task metric</td></tr>
  </tbody>
</table>
</div>

Candidate GenerationとNegative Samplingは特に混同しやすいですが、前者は**推論対象の探索空間**、後者は主に**学習データ量・negative分布**を制御します。

## Kaggleでの実例 {#kaggle-examples}

### OTTO 1位 — 約1,200候補を複数retrievalで構成

OTTO 1位解法は、visited aids、複数設定のco-visitation matrix、NNによるnext-item predictionを候補生成へ使用し、**平均約1,200候補**を作っています。その後、約100 featuresを使うLGBMRankerへ渡し、single modelでLB 0.604、9 model ensembleで0.605と報告しています（[1st place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/mrkmakr-1st-place-solution)）。

候補生成単独のablationではないため、「1,200候補だからこのscoreになった」とは断定できません。一方、優勝解法の最終pipelineに複数retrieval sourceが明示的に採用されており、**Evidence B**として強い実例です。

### OTTO 15位 — 50 → 100候補で+0.0007

15位解法ではretrieval段階を50候補から100候補へ増やしたとき、**+0.0007**の改善を報告しています。100候補のretrieval Recall@20は0.585、rerank後のsingle LightGBMはPublic 0.601 / Private 0.600でした（[15th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution)）。

これは候補数変更の定量差があるため**Evidence A**です。ただし50→100の改善を他taskへそのまま移植せず、候補数とRecallのcurveを自分のCVで測ります。

### H&M 1位 — Candidate Generationがaccuracy ceilingを決める

H&M 1位解法は、Candidate Generation strategyをaccuracy上限を超えるためのkeyと明示しています（[1st place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/324070)）。同Competitionの上位解法ではCandidate Generation + feature engineering + rankingの構成が広く共通していました。

8位解法は各candidate typeからtop 100を選び、repurchaseの単体CV 0.029、user-based CF 0.024、全体人気 0.017など、候補源ごとのCVを比較しています（[8th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution)）。

### H&M 9位 — TrainとInferenceで候補数を変える

9位解法はTrainでcustomerごとに200候補を作り、positiveは保持しつつnegativeの半分をrandom sampling、Inferenceでは400候補を生成して4つのLightGBMでrankしています（[9th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution)）。

この例は、**推論Recallを確保する候補集合**と、**学習コストを抑えるnegative sampling**を分けて設計する実例です。

## 注意点 {#pitfalls}

### 1. Candidate Recallだけを追いすぎない

候補を増やせばRecallは上げやすい一方、後段Rankerのrow数も増えます。OTTO 15位のように候補追加が効くケースはありますが、改善幅は逓減します。最終OOFまで確認します。

### 2. Validation時点より未来の情報を候補生成へ混ぜない

時系列推薦では、validation target weekより後のpopularity、co-visitation、embedding学習データを使うとleakageです。H&M 9位解法もvalidationを時系列で切り、過去期間からcandidateを生成しています（[9th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution)）。

### 3. Cold userを1つのstrategyで扱わない

履歴ベースretrievalは履歴のないuserで候補を出せません。global popularity、segment popularity、content / embeddingなど別routeを用意します。

### 4. Candidate sourceの重複を無駄にしない

複数strategyで同じitemが選ばれたとき、単純dedupだけで終えると「複数signalが一致した」という情報を捨てます。source count、best rank、各source scoreをRanker featureにできます。

### 5. すでに候補が与えられるtaskでは不要

2026年7月開始の`recsys_contest`はobserved impressionsを直接rankする設計で、公式に「artificial candidate generation stepはない」と説明されています（[Competition overview](https://www.kaggle.com/competitions/recsys-contest)）。推薦taskだから必ず2-stageにする、という理解は誤りです。

## Quick Reference

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>目的</h4><dl><dt>最優先</dt><dd>正解を候補内に残す</dd><dt>同時に</dt><dd>候補数を抑える</dd></dl></section>
  <section class="comparison-card"><h4>候補源</h4><dl><dt>基本</dt><dd>Recent + Popularity + Co-visitation</dd><dt>追加</dt><dd>CF / Embedding / Sequential</dd></dl></section>
  <section class="comparison-card"><h4>評価</h4><dl><dt>Stage 1</dt><dd>Candidate Recall × 候補数</dd><dt>Stage 2</dt><dd>最終OOF / CV</dd></dl></section>
  <section class="comparison-card"><h4>失敗しやすい</h4><dl><dt>Leakage</dt><dd>未来dataで候補生成</dd><dt>Overhead</dt><dd>候補を増やしすぎる</dd></dl></section>
</div>

## 関連項目

- [Out-of-Fold]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [Time Series Split]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [Post-processing]({{ '/wiki/advanced-methods/post-processing.html' | relative_url }})

<div class="article-footer-nav">
  <a href="{{ '/wiki/recommendation/' | relative_url }}">Recommendation & Ranking</a>
  <a href="{{ '/' | relative_url }}">索引</a>
</div>

## 参考文献

1. mrkmakr. “1st place solution.” OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/mrkmakr-1st-place-solution
2. hjam. “15th Place Solution.” OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution
3. Jack, toshi_k. “7th Place Solution.” OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/jack-toshi-k-7th-place-solution
4. senkin13. “1st place solution.” H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/324070
5. kazuki. “8th place solution.” H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution
6. Saber. “9th place solution.” H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/saber-9th-place-solution
7. Paweł Jankiewicz. “Addressing common questions and what the competition is really about.” H&M Personalized Fashion Recommendations, Kaggle Discussion, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/discussion/307288
8. zerebom. “Kaggle OTTOコンペ参加記(22th/2587th).” Zenn, 2023. https://zenn.dev/zerebom/articles/91910acb0d9b93
9. Kaggle. “recsys_contest.” Pafos AI Camp July 2026, 2026. https://www.kaggle.com/competitions/recsys-contest

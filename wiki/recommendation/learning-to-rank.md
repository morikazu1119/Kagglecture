---
layout: default
title: Learning to Rank / LambdaMART
summary: user・queryごとの候補集合の中で順位を学習し、NDCGやMAPなど順位指標に合わせて上位候補を並べる。
type: reference
domain: kaggle
topic: learning-to-rank
created: 2026-09-10
updated: 2026-09-10
source_count: 11
tags:
  - kaggle
  - recommendation
  - ranking
  - lightgbm
  - xgboost
---

# Learning to Rank / LambdaMART

Learning to Rank（LTR）は、**候補1件ずつを独立に当てるのではなく、同じuser / queryに属する候補同士の順序を学習する方法**です。

推薦ではCandidate Generationで作った候補を「このuserに対してどれを上に置くか」で並べ直すときに使います。KaggleではLightGBMの`LGBMRanker`やXGBoostの`XGBRanker`が定番で、特にLambdaMART系objectiveがよく使われます。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#objectives">Objectiveの違い</a>
  <a href="#validation">Validation</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>

## 使う場面 {#use-cases}

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>候補の中で順番を決めたい</h4><dl><dt>典型</dt><dd>推薦、検索、広告</dd><dt>単位</dt><dd>user / session / query</dd><dt>出力</dt><dd>候補ごとのranking score</dd></dl></section>
  <section class="comparison-card"><h4>Top-Kが重要</h4><dl><dt>Metric</dt><dd>NDCG@K、MAP@K、Recall@K</dd><dt>狙い</dt><dd>上位の並びを直接改善する</dd></dl></section>
  <section class="comparison-card"><h4>候補集合が既にある</h4><dl><dt>例</dt><dd>Candidate Generation後、observed impressions</dd><dt>不要</dt><dd>全itemへの総当たりranking</dd></dl></section>
</div>

2026年の`recsys_contest`はobserved-impression rankingで、test row自体が実際に観測されたlistenです。人工的なCandidate Generationを作らず、与えられた候補行へscoreを付けるranking problemとして定義されています（[Competition overview](https://www.kaggle.com/competitions/recsys-contest)）。

## 仕組み {#mechanism}

最初に押さえるべき点は、**classificationとrankingでは「比較する範囲」が違う**ことです。

<div class="static-viz html-diagram" role="img" aria-label="ClassificationとLearning to Rankの違い">
  <div class="comparison-board">
    <section class="comparison-card"><h4>Classification</h4><p>各rowを独立に見て、購入確率やclick確率を当てる。</p><dl><dt>比較</dt><dd>dataset全体</dd><dt>典型loss</dt><dd>Logloss</dd></dl></section>
    <section class="comparison-card is-primary"><h4>Learning to Rank</h4><p>同じuser / query内の候補を比べ、正解候補を上へ押し上げる。</p><dl><dt>比較</dt><dd>query内</dd><dt>典型loss</dt><dd>LambdaRank / LambdaMART</dd></dl></section>
  </div>
  <p class="viz-note">模式図。ranking scoreそのものを確率として解釈する必要はありません。</p>
</div>

たとえばUser Aに候補`[item1, item2, item3]`、User Bに`[item4, item5]`があるとします。LTRではUser A内、User B内で順位関係を学びます。**User Aのitem1とUser Bのitem4のscore大小は、通常は直接の意味を持ちません。**

そのためrankerへは、どのrowが同じqueryに属するかを必ず渡します。LightGBMでは`group`、XGBoostでは`qid`がこの役割です。LightGBM公式ドキュメントでもranking taskではgroupが必須で、同じ候補集合に属する連続row数として指定します（[LightGBM Dataset group](https://lightgbm.readthedocs.io/en/latest/R/reference/get_field.html)）。XGBoostでもquery groupを`qid`で指定します（[XGBoost Learning to Rank](https://xgboost.readthedocs.io/en/latest/tutorials/learning_to_rank.html)）。

### LambdaRankとLambdaMART

NDCGやMAPのようなranking metricは、scoreの絶対値より**並び順**で決まるため、そのまま微分して学習しにくい性質があります。

LambdaRankは、候補pairの順序を入れ替えたときにranking metricがどれだけ変わるかを考え、その影響が大きいpairほど強く学習する考え方です（[Burges et al., 2007](https://www.microsoft.com/en-us/research/publication/learning-to-rank-with-non-smooth-cost-functions/)）。

LambdaMARTはそのLambdaRankの考え方をGradient Boosted Decision Treesへ組み合わせた手法です（[Burges, 2010](https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/)）。Tabular featureが強いKaggle推薦では、この組み合わせが扱いやすいため頻出します。

## Objectiveの違い {#objectives}

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>Objective</th><th>何を重視するか</th><th>使う場面</th></tr></thead>
  <tbody>
    <tr><td><strong>LightGBM lambdarank</strong></td><td>NDCGを意識したLambdaRank</td><td>定番のGBDT ranker</td></tr>
    <tr><td>LightGBM rank_xendcg</td><td>XE_NDCG_MART</td><td>高速化も試したいとき</td></tr>
    <tr><td>XGBoost rank:ndcg</td><td>NDCGを重視するLambdaMART</td><td>graded / binary relevance</td></tr>
    <tr><td>XGBoost rank:map</td><td>MAPを重視</td><td>binary relevance中心</td></tr>
    <tr><td>XGBoost rank:pairwise</td><td>pairwise ordering</td><td>metricとの直接対応を弱めた比較用</td></tr>
  </tbody>
</table>
</div>

LightGBMの現行ドキュメントではranking objectiveとして`lambdarank`と`rank_xendcg`があり、`rank_xendcg`は`lambdarank`より高速で同等程度の性能を狙うobjectiveとして案内されています（[LightGBM latest parameters](https://lightgbm.readthedocs.io/_/downloads/en/latest/pdf/)）。

日本語では2025年12月の検証記事で、MovieLensを使って`lambdarank`と`rank_xendcg`の差を比較しています。これはCompetition evidenceではありませんが、objectiveを固定せず実測で比較する補助材料になります（[Zenn: LightGBM ランク学習](https://zenn.dev/dev_commune/articles/15ff2c1ff94fea)）。

### Competition metricとobjectiveは完全一致とは限らない

H&Mの評価はMAP@12でした（[Competition overview](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/)）。2位解法では、通常の`lambdarank`よりMAPを意識したcustom `lambdarankmap` objectiveがわずかに良かったと報告しています（[2nd place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/hello-world-2nd-place-solution)）。

これは**Competition metricに近いobjectiveを試す価値がある**Evidence Bです。ただし改善量は公開されていないため、効果量は推測しません。

## Validation {#validation}

RankerのValidationでは、rowをランダム分割するだけでは不十分です。**同じuser / session / queryがTrainとValidationへ跨がないか、時間未来を見ていないか**を確認します。

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>query leakageを避ける</h4><dl><dt>分離単位</dt><dd>user / session / query</dd><dt>例</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>未来情報を避ける</h4><dl><dt>分離単位</dt><dd>observation date</dd><dt>例</dt><dd>過去で学習、未来週で検証</dd></dl></section>
  <section class="comparison-card"><h4>Metricを合わせる</h4><dl><dt>見るもの</dt><dd>NDCG@K / MAP@K / Recall@K</dd><dt>注意</dt><dd>row-level AUCだけで選ばない</dd></dl></section>
</div>

OTTOの公開ranker tutorialでは、候補tableを`GroupKFold`でsession / user group単位に分けてXGBoost rankerを学習する例が示されています（[Kaggle discussion](https://www.kaggle.com/competitions/otto-recommender-system/discussion/370210)）。

H&M 8位解法は、Validationをweek 98〜104の7 foldsとし、各foldで直前3週間をTrainに使う時間ベースの設計でした（[8th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution)）。推薦履歴は時間依存が強いため、random splitより実際の予測時点を再現することが重要です。

## Kaggleでの実例 {#kaggle-examples}

### H&M 2位 — ranking modelは最終pipelineの中心

H&M 2位解法は、約600の人気itemなどから候補を作り、LGB modelで130候補へ絞った後、より複雑なfeatureを持つ別のLGB modelで最終rankingしています。single modelはLeaderboard **0.0355**、team mateの候補追加で**0.0362**、ensembleで**0.0368**と報告しています（[2nd place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/hello-world-2nd-place-solution)）。

これはcandidate改善やensembleも含むためranker単独ablationではありません。ただし最終解法の2-stage ranking構成と定量scoreが確認できるため、採用Evidenceとして強い例です。

### H&M 8位 — LGBMRanker + 7-fold時間Validation

H&M 8位解法は、複数のCandidate Generation strategyから各top 100を作り、customer / article / customer×article featureを作成して`LGBMRanker`でrankingしています。Validationは7 folds、各foldのTrainはValidation直前3週間です（[8th place solution](https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution)）。

複数の候補源を1つのscoreへ統合する用途としてLTRが使われた代表例です。**Evidence B**。

### OTTO 15位 — retrieval 0.585からrerank 0.600へ

OTTO 15位解法は100 candidates / sessionを作り、182 featuresのLightGBM rankerでrerankしています。公開値ではretrieval Recall@20が**0.585**、single rankerがPrivate **0.600**、5-model ensembleがPrivate **0.601**でした（[15th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution)）。

retrievalと最終metricは同一pipeline上で比較されていますが、feature追加なども含むため純粋なranker-only ablationではありません。それでも**候補集合を作るだけではなく、後段rankingで順位を精密化する価値**を示す定量例です。

### OTTO 20位 — 複数rankerを比較

OTTO 20位解法は約200 featuresを使い、LightGBM Ranker（`lambdarank`）、CatBoost Classifier（Logloss）、CatBoost Ranker（YetiRank）を組み合わせました（[20th place solution](https://www.kaggle.com/competitions/otto-recommender-system/writeups/kicchotto-20th-place-solution)）。

同じcandidate / feature pipelineでも、**ranking objectiveとclassification objectiveの両方がensemble候補になる**実例です。単独ablationは公開されていないためEvidence Bとして扱います。

## 使い分け

<div class="html-table-wrap">
<table class="html-table">
  <thead><tr><th>手法</th><th>向いている条件</th><th>注意点</th></tr></thead>
  <tbody>
    <tr><td><strong>LTR / LambdaMART</strong></td><td>queryごとのTop-K順序が重要</td><td>group情報が必須</td></tr>
    <tr><td>Binary classifier</td><td>購入 / 非購入確率自体も使いたい</td><td>ranking metricとlossがずれることがある</td></tr>
    <tr><td>Heuristic score</td><td>候補数が少ない、強いrecency ruleがある</td><td>複数signalの統合が難しい</td></tr>
    <tr><td>Neural ranker</td><td>sequence / embedding interactionを強く使いたい</td><td>学習・推論コストが高い</td></tr>
  </tbody>
</table>
</div>

LTRが常にclassifierより勝つわけではありません。OTTO 20位のようにclassifierも最終ensembleへ残る例があり、**同じCV・同じcandidate集合で比較する**のが安全です。

## 注意点 {#pitfalls}

### 1. groupを壊す

最重要の失敗です。queryを指定せずrow単位で混ぜると、rankerが「どの候補同士を比較すべきか」を失います。LightGBMの`group`、XGBoostの`qid`を正しく作り、同じqueryのrowを連続させます。

### 2. Candidate Generationの上限をrankerで超えようとする

正解itemが候補集合に入っていなければrankerでは復活できません。ranker改善前にCandidate Recallが十分かを確認します。詳しくは[Candidate Generation]({{ '/wiki/recommendation/candidate-generation.html' | relative_url }})を参照してください。

### 3. row-level metricだけを見る

AUCやLoglossが改善しても、Top-Kの並びが改善するとは限りません。Competition metricがMAP@12ならMAP@12、NDCG@10ならNDCG@10のように、**query単位・cutoff込み**で評価します。

### 4. label gainとmetricの意味がずれる

graded relevanceで`0,1,2,3`のようなlabelを使う場合、上位labelをどれだけ重く扱うかでrankingが変わります。LightGBMでは`label_gain`を設定できます（[LightGBM parameters](https://lightgbm.readthedocs.io/_/downloads/en/latest/pdf/)）。Competitionのrelevance定義をそのまま整数labelへ置くだけでよいか確認します。

### 5. click dataのposition bias

上に表示されたitemほどclickされやすい場合、labelには表示位置biasが混ざります。XGBoostの現行LTR実装には`lambdarank_unbiased`によるposition debiasingがあり、公式exampleでもclick data向け設定が示されています（[XGBoost example](https://xgboost.readthedocs.io/en/latest/python/examples/learning_to_rank.html)）。

## Quick Reference

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>まず確認</h4><dl><dt>query</dt><dd>user / session / search queryは何か</dd><dt>候補</dt><dd>正解Recallは十分か</dd><dt>Metric</dt><dd>Top-K metricは何か</dd></dl></section>
  <section class="comparison-card"><h4>GBDTなら</h4><dl><dt>LightGBM</dt><dd>lambdarank / rank_xendcg</dd><dt>XGBoost</dt><dd>rank:ndcg / rank:map</dd></dl></section>
  <section class="comparison-card"><h4>Validation</h4><dl><dt>分離</dt><dd>query + time</dd><dt>評価</dt><dd>query単位のKaggle metric</dd></dl></section>
</div>

## 関連項目

- [Candidate Generation]({{ '/wiki/recommendation/candidate-generation.html' | relative_url }}) — rankerへ渡す候補集合を作る
- [Post-processing]({{ '/wiki/advanced-methods/post-processing.html' | relative_url }}) — ranking scoreから最終submissionを調整する

<div class="article-footer-nav">
  <a href="{{ '/wiki/recommendation/' | relative_url }}">Recommendation & Ranking</a>
  <a href="{{ '/' | relative_url }}">索引</a>
</div>

## 参考文献

1. Burges, C. J. C. et al. “Learning to Rank with Non-Smooth Cost Functions.” NeurIPS 2006 / Microsoft Research, 2007. https://www.microsoft.com/en-us/research/publication/learning-to-rank-with-non-smooth-cost-functions/
2. Burges, C. J. C. “From RankNet to LambdaRank to LambdaMART: An Overview.” Microsoft Research, 2010. https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/
3. LightGBM Documentation. Ranking objectives / Dataset group. https://lightgbm.readthedocs.io/_/downloads/en/latest/pdf/
4. XGBoost Documentation. “Learning to Rank.” 2026 current documentation. https://xgboost.readthedocs.io/en/latest/tutorials/learning_to_rank.html
5. Kaggle. “recsys_contest.” Pafos AI Camp July 2026. https://www.kaggle.com/competitions/recsys-contest
6. Kaggle. “H&M Personalized Fashion Recommendations.” Evaluation: MAP@12. 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/
7. wht1996, Paweł Jankiewicz. “2nd place solution.” H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/hello-world-2nd-place-solution
8. kazuki. “8th place solution.” H&M Personalized Fashion Recommendations, Kaggle, 2022. https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/writeups/kazuki-8th-place-solution
9. hjam. “15th Place Solution.” OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/hjam-15th-place-solution
10. kicchotto. “20th Place Solution.” OTTO – Multi-Objective Recommender System, Kaggle, 2023. https://www.kaggle.com/competitions/otto-recommender-system/writeups/kicchotto-20th-place-solution
11. suk1yak1. “LightGBM ランク学習: lambdarank vs rank_xendcg.” Zenn, 2025-12-24. https://zenn.dev/dev_commune/articles/15ff2c1ff94fea

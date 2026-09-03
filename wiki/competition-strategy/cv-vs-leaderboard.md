---
layout: default
title: CV vs Leaderboard
summary: 自分で再現できるLocal CVをモデル選択の主軸にし、Public Leaderboardは提出や大きなズレを確認する補助信号として扱う。
type: reference
domain: kaggle
topic: cv-vs-leaderboard
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - competition-strategy
  - validation
  - leaderboard
  - overfitting
---

# CV vs Leaderboard

**Kaggleでは、自分のTrainデータ内で作るLocal CVをモデル選択の主軸にし、Public Leaderboard（Public LB）は「提出が壊れていないか」「CVと大きく矛盾していないか」を見る補助信号として扱うのが基本です。**

理由は単純で、Public LBはTestデータの**一部だけ**で計算されるからです。Publicの小さな上下を何度も見ながらモデルを選ぶと、その見えている一部へ過適合し、最後に隠されていたPrivate LBで順位が大きく変わることがあります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#overview">全体像</a>
  <a href="#roles">役割分担</a>
  <a href="#mismatch">ズレる原因</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#decision-rule">判断ルール</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まずKaggleの評価構造を見る {#overview}

<div class="model-architecture" aria-label="KaggleでTrain CV Public LB Private LBがどう分かれるか">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">自分で見られる評価と、Kaggle側が持つ評価を分ける</div><p class="model-architecture__subtitle">Local CVはTrain内で自分が再現でき、Public/Private LBはTest側でKaggleが計算します。</p></div>
    <span class="model-architecture__badge">evaluation map</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Train data</span></div><span class="model-stage__label">正解あり</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Local split</strong><br>Fold 1…K</span></div><span class="model-stage__label">自分で作る</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>OOF / CV<br>score</span></div><span class="model-stage__label">主なselection signal</span></div>
    <div class="model-stage"><div class="model-tensor"><span>Test data<br>Public slice</span></div><span class="model-stage__label">Competition中に見える</span></div>
    <div class="model-stage"><div class="model-tensor is-thin"><span>Private slice<br>最終評価</span></div><span class="model-stage__label">終了後に確定</span></div>
  </div>
  <p class="model-architecture__caption">Public / Privateの具体的な分割方法・割合はCompetitionごとに異なります。公式Evaluationを確認します。</p>
</div>

<div class="comparison-board" aria-label="CVとLeaderboardを短く言い換えた比較">
  <section class="comparison-card is-primary"><h4>Local CV</h4><dl><dt>一言で</dt><dd>自分で何度でも再計算できる模擬本番</dd><dt>強み</dt><dd>同じ条件で候補を比較できる</dd></dl></section>
  <section class="comparison-card"><h4>Public LB</h4><dl><dt>一言で</dt><dd>本番Testの一部だけの途中採点</dd><dt>弱み</dt><dd>sample noiseと反復選択に弱い</dd></dl></section>
  <section class="comparison-card"><h4>Private LB</h4><dl><dt>一言で</dt><dd>Competition終了時の最終採点</dd><dt>制約</dt><dd>期間中は見えない</dd></dl></section>
</div>

## 役割分担 {#roles}

<div class="comparison-board" aria-label="CVとLeaderboardの役割分担">
  <section class="comparison-card is-primary"><h4>OOF / CV</h4><dl><dt>主な役割</dt><dd>モデル・特徴・blendの選択</dd><dt>見るもの</dt><dd>再現可能なlocal selection signal</dd></dl></section>
  <section class="comparison-card"><h4>fold別score</h4><dl><dt>主な役割</dt><dd>安定性・分布差の診断</dd><dt>見るもの</dt><dd>特定foldだけで効く改善</dd></dl></section>
  <section class="comparison-card"><h4>Public LB</h4><dl><dt>主な役割</dt><dd>提出形式、class mapping、大きな分布ズレ確認</dd><dt>注意</dt><dd>小差をselection signalにしすぎない</dd></dl></section>
  <section class="comparison-card"><h4>Private LB</h4><dl><dt>主な役割</dt><dd>最終評価</dd><dt>制約</dt><dd>Competition中は見えない</dd></dl></section>
</div>

### なぜPublicを何度も見ると危ないか

Public LBを1回見るだけならただの確認です。しかし「A/B/CのどれがPublicで高いか」を何十回も試すと、**Public score自体をValidationとして使っている**状態になります。

<div class="model-architecture" aria-label="Public Leaderboard overfittingが起きる反復ループ">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Publicの小差を追うほど、見えているTest sliceへ選択が寄る</div><p class="model-architecture__subtitle">modelを直接Publicにfitしなくても、選択を繰り返せば情報を使っています。</p></div><span class="model-architecture__badge">selection overfitting</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Candidate A/B/C</span></div><span class="model-stage__label">複数案</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Submit</strong><br>Public scoreを見る</span></div><span class="model-stage__label">Test情報を観測</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Public最高を採用</strong><br>また変更</span></div><span class="model-stage__label">反復選択</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Public sliceへ<br>selection overfit</span></div><span class="model-stage__label">Privateで崩れるrisk</span></div>
  </div>
</div>

## CV-LBがズレる原因 {#mismatch}

- splitが本番のgroup/時間構造を再現していない。
- Train/Testにdistribution shiftがある。
- Public sampleが小さく、Metric varianceが大きい。
- Public LBを見ながら特徴・threshold・重みを反復選択した。
- preprocessingやTarget EncodingにLeakageがある。

ズレを見たら「CVを捨ててLBへ合わせる」のではなく、**なぜValidationが本番を再現できないか**を調査します。

<div class="comparison-board" aria-label="CV-LB mismatchを見たときの診断">
  <section class="comparison-card"><h4>Group構造</h4><dl><dt>確認</dt><dd>同じ患者/user/sessionが跨いでいないか</dd><dt>候補</dt><dd>GroupKFold</dd></dl></section>
  <section class="comparison-card"><h4>時間</h4><dl><dt>確認</dt><dd>未来情報がTrainへ入っていないか</dd><dt>候補</dt><dd>Time-based split</dd></dl></section>
  <section class="comparison-card"><h4>Train/Test差</h4><dl><dt>確認</dt><dd>分布が別物になっていないか</dd><dt>候補</dt><dd>Adversarial Validation</dd></dl></section>
  <section class="comparison-card"><h4>Pipeline</h4><dl><dt>確認</dt><dd>split前にfitしていないか</dd><dt>候補</dt><dd>Data Leakage監査</dd></dl></section>
</div>

## Kaggleでの実例 {#kaggle-examples}

Predicting Student Health Risk 2026の4位解法は、最終submissionがPublic 0.95094で#414、Private 0.95084で#4でした。7-fold OOF 0.95063を信頼し、Publicの微小差でモデルを置き換えなかったことを主要lessonとして挙げています（[4th Place Solution](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)）。

同Competitionの別Writeupでは、固定100候補でPrivateとのSpearman相関がOOF 0.867、Public 0.768、Privateとのmedian absolute score gapがOOF 0.000074、Public 0.000220と報告されています（[Why shouldn't you even consider using LB probing](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)）。

<div class="static-viz html-chart" aria-label="OOFとPublic LeaderboardのPrivateへの相関比較">
  <div class="viz-heading"><div><div class="viz-title">同じ100候補ではOOFの方がPrivateとの整合が高かった</div><p class="viz-subtitle">Spearman correlation with Private。大きいほどcandidate rankingがPrivateと整合します。</p></div><span class="viz-badge">Kaggle Writeup実測値</span></div>
  <div class="html-bar-chart">
    <div class="html-bar-row is-highlight"><span class="html-bar-label">OOF</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:86.7"></span></span><span class="html-bar-value">0.867</span></div>
    <div class="html-bar-row"><span class="html-bar-label">Public LB</span><span class="html-bar-track"><span class="html-bar-fill" style="--value:76.8"></span></span><span class="html-bar-value">0.768</span></div>
  </div>
  <p class="viz-caption">出典: Alvin Li, “Why shouldn't you even consider using LB probing in Playground Competitions”, 2026。比較条件は同Writeupの固定100候補です。</p>
</div>

この例ではPrivateとのmedian absolute score gapもOOF 0.000074、Public 0.000220で、OOFの方が小さかったと報告されています。

Tabular Playground Series Nov 2022の1位解法も主要ポイントに“Trust your CV its easy to overfit”を挙げています（[1st Place Solution](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)）。

## 判断ルール {#decision-rule}

1. まずOOF pipelineがLeakage-freeか確認する。
2. fold別scoreとOOF全体scoreを見る。
3. 改善に「なぜ効くか」のmechanismがあるか確認する。
4. Public LBは方向が大きく矛盾しないかを見る。
5. `+0.0001`級のPublic差だけで採用を決めない。
6. CV-LB mismatchが続くならsplitや分布差を診断する。
7. 最終2枠は異なる仮説のsubmissionを残す。

## Quick Reference {#quick-reference}

- CV = Train内で自分が再現できる模擬本番。
- Public LB = Testの一部を使う途中採点。
- Private LB = 最後の隠れたTest sliceによる最終採点。
- model選択はOOF/CVを主軸にする。
- CV-LB mismatchはAdversarial Validationやsplit再設計で原因を探す。
- Leaderboardをhyperparameter optimizerにしない。

## 関連項目

- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})
- [Data Leakage]({{ '/wiki/validation/data-leakage.html' | relative_url }})

## 参考文献

1. [Kaggle, “Predicting Student Health Risk: 4th Place - Trusting OOF”, Ricky, 2026](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)
2. [Kaggle, “Why shouldn't you even consider using LB probing in Playground Competitions”, Alvin Li, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)
3. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)
4. [Kaggle, “MWS Cup 2022: 1st place solution”, 2022](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)
5. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)

---
layout: default
title: CV vs Leaderboard
summary: Local CVをモデル選択の主軸、Public Leaderboardを整合性確認に使い、Leaderboard Overfittingを避ける考え方。
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

**Kaggleでは、Local CVをモデル選択の主軸にし、Public Leaderboard（PLB）は「大きなズレやバグがないか」を確認する補助信号として扱うのが基本です。**

Public LBはTestの一部sampleだけで計算されるため、小差を追い続けるとそのsliceへ過適合します。Private LBで順位が大きく変わる**shake-up**の主因になります。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#roles">役割分担</a>
  <a href="#mismatch">CV-LBがズレる原因</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#decision-rule">判断ルール</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## 役割分担 {#roles}

<div class="comparison-board" aria-label="CVとLeaderboardの役割分担">
  <section class="comparison-card is-primary"><h4>OOF / CV</h4><dl><dt>主な役割</dt><dd>モデル・特徴・blendの選択</dd><dt>見えるもの</dt><dd>再現可能なlocal selection signal</dd></dl></section>
  <section class="comparison-card"><h4>fold別score</h4><dl><dt>主な役割</dt><dd>安定性・分布差の診断</dd><dt>見えるもの</dt><dd>特定fold依存の改善</dd></dl></section>
  <section class="comparison-card"><h4>Public LB</h4><dl><dt>主な役割</dt><dd>提出形式、class mapping、大きな分布ズレ確認</dd><dt>注意</dt><dd>小差をselection signalにしすぎない</dd></dl></section>
  <section class="comparison-card"><h4>Private LB</h4><dl><dt>主な役割</dt><dd>最終評価</dd><dt>制約</dt><dd>Competition中は見えない</dd></dl></section>
</div>

## CV-LBがズレる原因 {#mismatch}

- splitが本番のgroup/時間構造を再現していない。
- Train/Testにdistribution shiftがある。
- Public sampleが小さく、Metric varianceが大きい。
- Public LBを見ながら特徴・threshold・重みを反復選択した。
- preprocessingやTarget EncodingにLeakageがある。

ズレを見たら「CVを捨ててLBへ合わせる」のではなく、**なぜValidationが本番を再現できないか**を調査します。

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

この例ではPrivateとのmedian absolute score gapもOOF 0.000074、Public 0.000220で、OOFの方が小さかったと報告されています。Public LBの小差をselection signalにしすぎる危険を定量的に示す例です。

Tabular Playground Series Nov 2022の1位解法も主要ポイントに“Trust your CV its easy to overfit”を挙げています（[1st Place Solution](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)）。

## 判断ルール {#decision-rule}

1. OOF pipelineがLeakage-freeか確認する。
2. fold別scoreとOOF全体scoreを見る。
3. CV改善に明確なmechanismがあるか確認する。
4. Public LBは方向が大きく矛盾しないかを見る。
5. `+0.0001`級のPublic差だけで採用を決めない。
6. 最終2枠は異なる仮説のsubmissionを残す。

## Quick Reference {#quick-reference}

- Public rankよりscore差を見る。
- 小さいPublic差はsampling noiseの可能性を考える。
- OOFを固定し、同じMetricで比較する。
- CV-LB mismatchはAdversarial Validationやsplit再設計で診断する。
- Leaderboardをhyperparameter optimizerにしない。

## 関連項目

- [Out-of-Fold Prediction]({{ '/wiki/competition-strategy/out-of-fold.html' | relative_url }})
- [Adversarial Validation]({{ '/wiki/validation/adversarial-validation.html' | relative_url }})
- [TimeSeriesSplit]({{ '/wiki/validation/time-series-split.html' | relative_url }})

## 参考文献

1. [Kaggle, “Predicting Student Health Risk: 4th Place - Trusting OOF”, Ricky, 2026](https://www.kaggle.com/c/playground-series-s6e7/writeups/4th-place-from-414-to-4-trusting-oof-when-the)
2. [Kaggle, “Why shouldn't you even consider using LB probing in Playground Competitions”, Alvin Li, 2026](https://www.kaggle.com/competitions/playground-series-s6e7/writeups/why-you-shouldnt-even-consider-using-lb-probing-i)
3. [Kaggle, “Tabular Playground Series - Nov 2022: 1st Place Solution”, 2022](https://www.kaggle.com/competitions/tabular-playground-series-nov-2022/writeups/1st-place-solution)
4. [Kaggle, “MWS Cup 2022: 1st place solution”, 2022](https://www.kaggle.com/competitions/mws-cup-2022-3/discussion/362177)
5. [Kaggle, “30 Days of ML: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/30-days-of-ml/writeups/kaggle-swags-1st-place-solution)

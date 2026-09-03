---
layout: default
title: External Data
description: Competition配布Train以外の公開・許可データを学習、pretraining、特徴量生成へ利用する方法。
summary: Competition外の許可データをTrain側へ追加し、label数・domain coverage・pretraining signalを増やす方法。Rules・重複・分布差を先に確認する。
type: reference
domain: kaggle
topic: external-data
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags:
  - kaggle
  - advanced-methods
  - external-data
  - distribution-shift
---

# External Data

**External Dataは、Competitionから配られたTrain以外のデータを、Rulesの範囲内で追加学習・事前学習・特徴量生成に使う方法です。**

たとえばCompetition Trainに病変画像が少ないなら、利用可能な別の公開datasetをTrain側へ足して病変パターンを増やせます。ただし、**Externalを足したことで本当にCompetitionの未見データへ強くなったのか**を測るため、Validationは原則としてCompetition由来のhost/original dataに固定します。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#overview">全体像</a>
  <a href="#uses">使い方</a>
  <a href="#validation">Validation設計</a>
  <a href="#workflow">安全な流れ</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

## まずどこにExternalを入れるか {#overview}

<div class="model-architecture" aria-label="External DataをTrain側だけへ追加するValidation設計">
  <div class="model-architecture__header">
    <div><div class="model-architecture__title">ValidationはCompetition dataのまま、ExternalはTrain側へだけ追加する</div><p class="model-architecture__subtitle">「Externalを使うと本番分布で改善したか」を同じValidationで比較できるようにします。</p></div>
    <span class="model-architecture__badge">host-only validation</span>
  </div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-tensor"><span>Competition<br>Train</span></div><span class="model-stage__label">Host data</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Split first</strong><br>Train fold / Valid fold</span></div><span class="model-stage__label">評価軸を固定</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>Train fold<br>+ External</span></div><span class="model-stage__label">追加はTrain側のみ</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Fit model</strong><br>original + external</span></div><span class="model-stage__label">学習</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Original<br>Valid fold</span></div><span class="model-stage__label">同じ本番代理で比較</span></div>
  </div>
  <p class="model-architecture__caption">模式図。Competitionやexternal sourceの性質によって、group・time・source-aware splitなど追加制約が必要です。</p>
</div>

ExternalをValidationにも混ぜると、scoreが上がっても「External source自身を当てやすくなっただけ」かもしれません。**評価対象はCompetition本番に近いデータへ固定する**のが基本です。

## External Dataの使い方 {#uses}

<div class="comparison-board" aria-label="External Dataの代表的な利用方法">
  <section class="comparison-card is-primary"><h4>Labeled追加</h4><dl><dt>すること</dt><dd>正解label付きsampleをTrainへ追加</dd><dt>期待</dt><dd>rare classやdomain coverageを増やす</dd><dt>注意</dt><dd>label定義を揃える</dd></dl></section>
  <section class="comparison-card"><h4>Unlabeled追加</h4><dl><dt>すること</dt><dd>Pseudo Label / self-supervisedで利用</dd><dt>期待</dt><dd>入力分布を広く見る</dd><dt>注意</dt><dd>誤pseudo label</dd></dl></section>
  <section class="comparison-card"><h4>Pretraining</h4><dl><dt>すること</dt><dd>関連datasetで先に表現学習</dd><dt>期待</dt><dd>小さなCompetition Trainを補う</dd><dt>注意</dt><dd>domain mismatch</dd></dl></section>
  <section class="comparison-card"><h4>Metadata / API</h4><dl><dt>すること</dt><dd>外部DBから補助featureを取得</dd><dt>期待</dt><dd>元データにない情報を追加</dd><dt>注意</dt><dd>Rules・時点整合性</dd></dl></section>
  <section class="comparison-card"><h4>Simulation</h4><dl><dt>すること</dt><dd>物理・ルールから人工sample生成</dd><dt>期待</dt><dd>rare caseを増やす</dd><dt>注意</dt><dd>simulation gap</dd></dl></section>
</div>

「External Data = 外から画像を足す」だけではありません。目的は**Competition Trainだけでは不足する学習signalを追加すること**です。

## Validation設計 {#validation}

最も比較しやすいのは、同じhost-only Validationで以下の2条件を比べる方法です。

<div class="comparison-board" aria-label="External Data ablationの比較">
  <section class="comparison-card"><h4>Baseline</h4><dl><dt>Train</dt><dd>Original Train foldのみ</dd><dt>Valid</dt><dd>Original Valid fold</dd><dt>意味</dt><dd>Competition dataだけの性能</dd></dl></section>
  <section class="comparison-card is-primary"><h4>+ External</h4><dl><dt>Train</dt><dd>Original Train fold + External</dd><dt>Valid</dt><dd>同じOriginal Valid fold</dd><dt>意味</dt><dd>External追加の純粋な差を見る</dd></dl></section>
</div>

NeurIPS Open Polymer Prediction 2025の1位解法も、external configurationを比較するときCV test foldはoriginal host dataだけにし、external dataは各Train foldへ100%追加しています（[1st Place Solution](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)）。

### Sourceごとに分けてablationする

External source A/B/Cを最初から全部混ぜると、どれが効いたか分かりません。

<div class="model-architecture" aria-label="External Data sourceごとのablation設計">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Externalはsource単位で追加し、改善と悪化を分解する</div><p class="model-architecture__subtitle">量よりも「本番分布に役立つsourceか」を見ます。</p></div><span class="model-architecture__badge">source ablation</span></div>
  <div class="model-stage-row" style="--model-cols:4">
    <div class="model-stage"><div class="model-tensor"><span>Baseline</span></div><span class="model-stage__label">Original only</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>+ Source A</span></div><span class="model-stage__label">差分を測る</span></div>
    <div class="model-stage"><div class="model-tensor is-wide"><span>+ Source B</span></div><span class="model-stage__label">別に測る</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Useful sources<br>だけ統合</span></div><span class="model-stage__label">Final train pool</span></div>
  </div>
</div>

## 安全に使う流れ {#workflow}

<div class="model-architecture" aria-label="External Dataを安全に利用するチェックフロー">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Rules確認から始め、重複除去とsource ablationを通してから採用する</div><p class="model-architecture__subtitle">Externalを見つけたら即追加、ではありません。</p></div><span class="model-architecture__badge">external-data checklist</span></div>
  <div class="model-stage-row" style="--model-cols:5">
    <div class="model-stage"><div class="model-op-box"><span><strong>Rules / License</strong><br>利用可能か</span></div><span class="model-stage__label">最初に確認</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Definition</strong><br>label・時点・装置</span></div><span class="model-stage__label">意味を揃える</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Deduplicate</strong><br>ID / hash / similarity</span></div><span class="model-stage__label">Leakage確認</span></div>
    <div class="model-stage"><div class="model-op-box"><span><strong>Fold-safe add</strong><br>Train側だけ</span></div><span class="model-stage__label">Validation固定</span></div>
    <div class="model-stage"><div class="model-tensor is-accent is-wide"><span>Source-wise<br>ablation</span></div><span class="model-stage__label">採用判断</span></div>
  </div>
</div>

## Kaggleでの実例 {#kaggle-examples}

RSNA Breast Cancer Detectionの1位解法では複数の外部mammography datasetを追加し、同一pipelineで**OOF F1 0.4921→0.5161、Private 0.53→0.56**（label smoothing条件）と報告しています（[1st place solution](https://www.kaggle.com/competitions/rsna-breast-cancer-detection/discussion/392449)）。

RANZCR CLiPの1位解法ではNIH ChestXの外部画像からtubeを含む28k画像をpseudo-label候補として抽出し、patient IDを使ってoriginal/externalの同一患者がfoldをまたがないようにしています（[1st Place Solution](https://www.kaggle.com/competitions/ranzcr-clip-catheter-line-classification/writeups/all-data-are-ext-1st-place-solution)）。

Linking Writing Processes to Writing Qualityの1位解法もData Cleaning + Feature Engineering + External Data + Model Ensembleを主要構成にしています（[1st place solution](https://www.kaggle.com/competitions/linking-writing-processes-to-writing-quality/writeups/tomoo-inubushi-1st-place-solution-data-cleaning-fe)）。

## 注意点 {#pitfalls}

### Competition Rules

外部データ禁止、全参加者が取得可能であること、license条件などCompetitionごとに違います。最初にRulesを確認します。

### Duplicate / near-duplicate

ExternalにValidationやTestとほぼ同一sampleがあるとLeakageになります。ID、hash、embedding/similarityで重複を確認します。

### Domain mismatch

量が多くてもtarget definitionや収集装置が違うと悪化します。sourceごとのsample weight、pretraining-only利用、source ablationを検討します。

### 時点Leakage

予測対象時点より後に作られた外部情報をfeatureにすると、公開情報でも本番再現不能になる場合があります。取得可能時点まで確認します。

### External比率が大きすぎる

Externalがoriginalより圧倒的に多いと、modelが外部source固有の特徴へ引っ張られることがあります。sample weightやsampling ratioもablationします。

## Quick Reference {#quick-reference}

- まずCompetition Rulesとlicenseを確認する。
- Validationは原則host/original dataに固定する。
- ExternalはTrain側へ追加してbaselineとの差を見る。
- sourceごとにablationする。
- duplicate / near-duplicate / 時点Leakageを確認する。
- 「データ量が増えた」ではなく「同じOOFで改善した」で採用する。

## 関連項目

- [Pseudo Labeling]({{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }})
- [Pretraining / Transfer Learning]({{ '/wiki/training/pretraining-transfer-learning.html' | relative_url }})
- [Data Leakage]({{ '/wiki/validation/data-leakage.html' | relative_url }})
- [GroupKFold]({{ '/wiki/validation/group-kfold.html' | relative_url }})

## 参考文献

1. [Kaggle, “RSNA Breast Cancer Detection: 1st place solution”, 2023](https://www.kaggle.com/competitions/rsna-breast-cancer-detection/discussion/392449)
2. [Kaggle, “RANZCR CLiP: 1st Place Solution”, 2021](https://www.kaggle.com/competitions/ranzcr-clip-catheter-line-classification/writeups/all-data-are-ext-1st-place-solution)
3. [Kaggle, “NeurIPS Open Polymer Prediction 2025: 1st Place Solution”, 2025](https://www.kaggle.com/competitions/neurips-open-polymer-prediction-2025/writeups/1st-place-solution)
4. [Kaggle, “Linking Writing Processes to Writing Quality: 1st place solution”, 2024](https://www.kaggle.com/competitions/linking-writing-processes-to-writing-quality/writeups/tomoo-inubushi-1st-place-solution-data-cleaning-fe)
5. [Kaggle, “HuBMAP Kidney Segmentation: 1st place solution”, 2021](https://www.kaggle.com/competitions/hubmap-kidney-segmentation/writeups/tom-1st-place-solution)

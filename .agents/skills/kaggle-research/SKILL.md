---
name: kaggle-research
description: Kaggleの公開Writeup・Discussion・Notebook・GitHub・技術記事を日本語/英語で横断調査し、実際に有効だった手法・概念・評価方法をKagglectureの辞書記事として作成・更新する。
---

# Kaggle Research Skill

## Purpose

Kaggleで公開されている情報を調査し、一般的な手法からCompetition固有の工夫まで、再利用可能な知識として `wiki/` に整理する。

このSkillは以下の依頼で使用する。

- Kaggle手法・Validation・Metricの調査
- 過去Competitionの上位解法調査
- 特定手法がKaggleで実際に効いた事例の調査
- 既存Wiki記事の新規作成・更新
- 複数Competitionを横断した比較・整理

Pythonコード集を作るSkillではない。意味、使い分け、実例、効果、失敗条件を優先する。

## Required standards

記事を作成・更新する前に、以下を参照する。

- `../../standards/wiki/article-structure.md`
- `../../standards/wiki/citation-policy.md`
- `../../standards/wiki/visualization.md`

記事構成・Citation・可視化ルールは上記StandardがSSOT。Skill内へ重複定義しない。

## Research scope

毎回、日本語と英語の両方を確認する。

優先する情報源:

1. Kaggle Competition公式ページ
2. Kaggle DiscussionのSolution / Writeup
3. Kaggle Notebook
4. 上位入賞者本人のGitHub
5. 上位入賞者本人のブログ・スライド
6. Zenn / Qiita / はてな等の日本語記事
7. 論文・公式ドキュメント・技術ブログ

二次情報だけで一般化せず、可能な限り一次情報まで遡る。

テーマが広い場合は必要に応じて以下を確認する。

| 軸 | 観点 |
|---|---|
| Data | Tabular / CV / NLP / Time Series / Audio / Multimodal / Ranking / Optimization |
| Validation | Hold-out / KFold / Stratified / Group / Time-based / Purged / Adversarial Validation |
| Modeling | GBDT / CNN / Transformer / Foundation Model / simple model / specialized architecture |
| Training | Feature / Augmentation / Sampling / Loss / Pretraining / Fine-tuning / Pseudo Label |
| Inference | TTA / threshold / calibration / post-processing / test-time adaptation |
| Ensemble | averaging / weighted blend / rank average / stacking / fold・seed ensemble |
| Strategy | CV-LB correlation / leakage / shake-up / inference budget / reproducibility |

テーマが限定されている場合、無関係な領域を水増ししない。同一領域で複数Competition・複数上位解法を比較する。

## Research workflow

1. 調査対象を1文で定義する。
2. 日本語・英語で候補ソースを探す。
3. 二次記事から可能な限りKaggle Discussion / Notebook / GitHub等の一次情報へ遡る。
4. 上位解法ごとに手法、Validation、Metric、順位、効果を抽出する。
5. 同じ手法を複数Competition・複数解法でクロスチェックする。
6. General / Situational / Competition-specific に整理する。
7. 効果主張のEvidenceを判定する。
8. Wiki記事を新規作成または更新する。
9. ルート `index.md` に記事リンクを追加する。
10. Standardに沿ってCitation・図表・関連リンクを最終確認する。

## Evidence

効果を判断するときは以下を使う。

| Grade | 根拠 |
|---|---|
| A | ablation、CV差、LB差、順位差などの定量根拠がある |
| B | 上位入賞者本人が有効性を明示し、最終解法に採用 |
| C | 複数の独立した上位解法で同傾向 |
| D | 単一記事・経験談・推測のみ |

数値がない場合は効果量を推測しない。

## Extraction schema

各手法について可能な範囲で以下を抽出する。

| Field | 内容 |
|---|---|
| Method | 手法名 |
| Competition | 使用されたCompetition |
| Rank / Medal | 順位またはMedal |
| Metric | 評価指標 |
| Validation | ローカル評価設計 |
| Effect | CV / LB / ablation差 |
| Why | なぜ効いたか |
| Use when | 適用条件 |
| Compare with | 比較対象 |
| Avoid when | 失敗条件・リスク |
| Evidence | A / B / C / D |
| Source | 一次情報を優先したURL |

確認できないFieldは埋めない。

## Generalization

調査結果は必要に応じて以下に分ける。

- **General** — 複数Competitionで再利用しやすい基本手法
- **Situational** — 条件が合えば強いが常に有効ではない手法
- **Competition-specific** — データ生成過程、Metric、制約を突いた固有解法

Competition-specificな実装を紹介するときは、他Competitionでも再利用できる原理があるかを分離して考える。

## Repository layout

```text
index.md                  # 唯一の公開索引
wiki/
  concepts/
  validation/
  metrics/
  methods/
  modalities/
  competitions/
  synthesis/

.agents/
  skills/
    kaggle-research/
      SKILL.md
  standards/
    wiki/
      article-structure.md
      citation-policy.md
      visualization.md
```

`wiki/index.md` のような重複ランディングページは作らない。

## Deliverables

調査タスクでは原則として以下を更新する。

1. `wiki/...` — 辞書・リファレンス記事
2. `index.md` — 記事への索引

既存記事と矛盾する新しい根拠が見つかった場合、古い記述を無言で消さず、条件・時期・Evidenceの違いを確認して更新する。

## Final checks

- 日本語と英語の両方を確認したか
- 一次情報を優先したか
- Public LBだけで効果を判断していないか
- Metric / Validation / leakageを確認したか
- 定量値に確認可能な出典があるか
- 適用条件と失敗条件を抽出したか
- GeneralとCompetition-specificを混同していないか
- `article-structure.md` に沿っているか
- `citation-policy.md` に沿っているか
- `visualization.md` に沿っているか
- 新規記事を `index.md` から参照できるか
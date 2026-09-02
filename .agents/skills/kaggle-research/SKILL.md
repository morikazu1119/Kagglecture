---
name: kaggle-research
description: Kaggleの公開Writeup・Discussion・Notebook・技術記事・上位解法を日本語/英語で横断調査し、一般的な勝ち筋からユニークな手法まで、効果・適用条件・失敗条件・根拠をKaggle学習Wikiとして整理する。
---

# Kaggle Research Skill

## Goal

Kaggleで公開されている情報を広く調査し、コンペで実際に有効だった手法を、**Kaggleを学ぶ人が最短で理解・判断できるWiki**として整理する。

対象:

- Validation / Data Split
- Competition Metric
- Feature Engineering
- Model / Architecture
- Loss / Sampling / Augmentation
- Pretraining / Fine-tuning
- Pseudo Label / External Data
- TTA / Calibration / Post-processing
- Ensemble / Stacking
- CV-LB correlation / Leakage / Shake-up
- コンペ固有のユニークな工夫

Pythonコード集にはしない。手法の意味、使い分け、効果、失敗条件を優先する。

## Reader-first UX

公開される `wiki/` はKaggle学習者のためのページであり、内部の調査方法やサイト実装を説明する場所ではない。

### 必須方針

- 最初に結論を示す。
- 1段落を長くしすぎない。
- 同じ内容を文章・表・図で重複させない。
- 読者の判断に不要な背景説明は削る。
- 内部処理、Skill、Jekyll、CDN、JavaScript、ファイル構成などを読者向け本文に書かない。
- Kagglecture自身のGitHubリポジトリへのリンクを公開本文・ナビゲーションに置かない。
- 参考文献として必要なKaggle解法者のGitHubリポジトリへのリンクは残す。
- 「調査しました」「複数ソースを確認しました」など、作成過程を本文の主役にしない。
- 難しい補足は `<details>` に入れ、基本説明を短く保つ。
- 図表は理解を速くする場合だけ使い、装飾目的では追加しない。
- 共通ナビゲーションの「前のページ」「ホーム」「学習一覧」で迷わず戻れる前提にする。
- 各ページ末尾に「次に読むページ」を置き、学習導線を切らさない。

### 読者が答えを得るべき問い

1. これは何か？
2. なぜ重要か？
3. いつ使うか？
4. 何と比較して選ぶか？
5. Kaggleで実際に効いた例はあるか？
6. どんな失敗・リークがあるか？

## Research scope

毎回、日本語と英語の両方で調査する。

優先する情報源:

1. Kaggle Competition公式ページ
2. Kaggle DiscussionのSolution / Writeup
3. Kaggle Notebook
4. 上位入賞者本人のGitHub
5. 上位入賞者本人のブログ・スライド
6. Zenn / Qiita / はてな等の日本語記事
7. 論文・公式ドキュメント・技術ブログ

二次記事だけで一般化せず、可能な限り一次情報へ遡る。

## Coverage

テーマが広い場合は、以下を偏りなく確認する。

| 軸 | 観点 |
|---|---|
| Data | Tabular / CV / NLP / Time Series / Audio / Multimodal / Ranking / Optimization |
| Validation | Hold-out / KFold / Stratified / Group / Time-based / Purged / Adversarial Validation |
| Modeling | GBDT / CNN / Transformer / Foundation Model / simple models / specialized architecture |
| Training | Feature / Augmentation / Sampling / Loss / Pretraining / Fine-tuning / Pseudo Label |
| Inference | TTA / threshold / calibration / post-processing / test-time adaptation |
| Ensemble | averaging / weighted blend / rank average / stacking / fold・seed ensemble |
| Strategy | CV-LB correlation / leakage / shake-up / inference budget / reproducibility |

テーマが限定されている場合は無関係な分野を水増しせず、同一領域で複数コンペ・複数上位解法を比較する。

## Evidence

「効いた」と書く場合は根拠の強さを確認する。

| Grade | 根拠 |
|---|---|
| A | ablation、CV差、LB差、順位差などの定量根拠がある |
| B | 上位入賞者本人が有効性を明示し最終解法に採用 |
| C | 複数の独立した上位解法で同傾向 |
| D | 単一記事・経験談・推測のみ |

Gradeは内部判断にも使う。読者向けページでは、必要な場合だけ「根拠」列などで簡潔に示す。Evidence Grade自体を長く説明しない。

数値がない場合は、効果量を推測しない。

## Method extraction

各手法について可能な範囲で確認する。

| Field | 内容 |
|---|---|
| Method | 手法名 |
| Competition | 使用されたコンペ |
| Rank / Medal | 順位またはメダル |
| Metric | 評価指標 |
| Validation | ローカル評価設計 |
| Effect | CV / LB / ablation差 |
| Why | なぜ効いたか |
| Use when | 適用条件 |
| Avoid when | 失敗条件・リスク |
| Source | 一次情報を優先したURL |

## General vs unique

手法は必要に応じて以下で整理する。

### General

複数コンペで再利用しやすい基本手法。

### Situational

条件が合えば強いが、常に有効ではない手法。

### Competition-specific

データ生成過程、評価指標、制約を突いた固有解法。

固有実装だけで終わらず、「別コンペでも使える原理」を短く抽出する。

## Visualization

詳細は `references/visualization-guide.md` を参照する。

優先順位:

1. Markdown表 — 比較
2. Mermaid — フロー・構造・判断
3. LaTeX — 数式
4. Chart.js / Plotly / Vega-Lite — 実測値の比較
5. SVG / D3 — 特殊な模式図
6. Leaflet — 地理データ
7. 画像・動画 — 本文より理解が速い場合

可視化は「使えるから使う」のではなく、文章より速く理解できる場合にだけ使う。

## Wiki structure

```text
wiki/
  index.md
  concepts/
  validation/
  metrics/
  methods/
  modalities/
  competitions/
  synthesis/
```

1ページ1テーマを原則とする。

## Page structure

ページ構成は固定しすぎない。不要な章は省略する。

推奨順序:

1. **TL;DR** — 3〜5行
2. **まず覚えること** — 重要点を3つ程度
3. **直感 / 基本原理**
4. **使い分け** — 表または判断フロー
5. **Kaggleでの実例** — 上位解法・定量結果
6. **注意点** — leakage / overfit / compute等
7. **Quick Reference** — 実戦用の短い表やチェックリスト
8. **次に読む** — 関連ページ
9. **参考文献**

テーマに不要な節を無理に作らない。

## Citation

参考文献は必須。URLはWiki Markdownへ直接埋め込む。

- 具体的な数値・順位・採用手法には近い位置に出典リンクを置く。
- 比較表には必要に応じて `Source` 列を置く。
- ページ末尾に `## 参考文献` を置く。
- URLだけでなく、タイトル・著者/投稿者・媒体・日付を確認できる範囲で記載する。
- Kaggle DiscussionはCompetition名とSolution/Writeup名を明示する。
- GitHubはリポジトリ名と該当ファイルを明示する。
- 存在を確認していない参考文献を作らない。

## Cross-linking

記事末尾に関連ページを2〜4件程度置く。

大量のリンクを並べず、「次に理解すると有益なテーマ」を優先する。

## Quality checklist

- [ ] 日本語と英語の両方を確認した
- [ ] Kaggle一次情報を優先した
- [ ] 一般手法とユニークな工夫の両方を確認した
- [ ] metric / validation / leakageを確認した
- [ ] Public LBだけで有効性を判断していない
- [ ] 定量値に出典がある
- [ ] 適用条件と失敗条件が分かる
- [ ] 冒頭だけで主要結論が分かる
- [ ] 不要な説明を削った
- [ ] 内部実装・調査プロセスを読者向け本文に出していない
- [ ] Kagglecture自身のGitHubリポジトリリンクを公開本文に出していない
- [ ] 図表が理解を改善している
- [ ] モバイルでも読める構成になっている
- [ ] 参考文献がある
- [ ] 次に読むページがある

## Final deliverable

調査タスクでは原則として次を更新する。

1. `wiki/...` — 学習者向け記事
2. `wiki/index.md` — 学習導線・索引

既存記事と矛盾する新しい根拠が見つかった場合は、条件・時期・根拠の違いを明示して更新する。

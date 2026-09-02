# Wiki Article Structure

KagglectureはKaggleの辞書・リファレンスであり、カリキュラムではない。各ページは単独で開いても目的の情報へすぐ到達できる構成にする。

## UX principles

- 最初に定義または結論を書く。
- タイトル直下の2〜4行だけで「何か」「何のためか」が分かるようにする。
- 長い導入、歴史、「この記事では〜を説明する」は原則不要。
- 1段落を長くしすぎない。
- 同じ内容を文章・表・図で繰り返さない。
- 読者の判断に不要な背景説明は削る。
- 難しい補足は `<details>` に入れる。
- 「学ぶ順番」「Step 1」「次に読む」などの順序付けをしない。
- 関連リンクは概念的な関連性だけで付ける。
- 内部処理、Skill、Jekyll、CDN、JavaScript、ディレクトリ構成を公開本文に書かない。
- Kagglecture自身のGitHubリポジトリへのリンクを公開本文に置かない。

## Standard structure

手法・概念の記事は原則として以下の順にする。不要な節は削除してよい。

### 1. `# 用語・手法名`

直下に2〜4行で定義を書く。

最低限、以下を答える。

- 何か
- 何のために使うか
- 最重要の前提条件

### 2. `## 使う場面`

「いつ使うか」を短時間で判断できる形にする。

文章より表が速い場合は表を優先する。

```markdown
| 状況 | 適するか | 理由 |
|---|---|---|
|  |  |  |
```

対象データ、前提条件、避ける条件を具体化する。

### 3. `## 仕組み`

なぜ機能するかを直感的に説明する。

- 関係・処理フロー → Mermaid
- 数式が本質 → LaTeX
- 単純な概念 → 短い文章

図と文章で同じ説明を重複させない。

### 4. `## 使い分け`

類似手法・代替手法との違いを示す。

```markdown
| 手法 | 強み | 弱み | 適用条件 |
|---|---|---|---|
|  |  |  |  |
```

「何と迷うか」「どう選ぶか」に答える。

### 5. `## Kaggleでの実例`

Kagglectureの中核となる節。

理論ではなく、実際のCompetition / Solution / Writeupでの使われ方を示す。

可能な範囲で以下を含める。

```markdown
| Competition | Rank / Medal | 使用方法 | Effect | Source |
|---|---:|---|---|---|
|  |  |  |  |  |
```

特に確認する項目:

- 具体的に何をgroup / feature / target / threshold等として使ったか
- fold数やValidation設計
- 組み合わせたモデル・パイプライン
- CV / LB / ablation差
- なぜそのコンペで有効だったか

確認できない数値は推測しない。

### 6. `## 注意点`

テーマ固有の失敗条件を優先する。

例:

- Data leakage
- Validation mismatch
- Overfitting
- Distribution shift
- class imbalance
- 計算コスト
- 推論時間
- group / split / threshold等の選択ミス

### 7. `## Quick Reference`

再訪時に数秒で判断できる表またはチェックリストにする。

本文の長い要約にはしない。

### 8. `## 関連項目`

概念的に近い実在ページを2〜6件程度置く。

- 推奨順序を付けない。
- 未作成ページへリンクしない。

### 9. `## 参考文献`

必須。詳細は `citation-policy.md` に従う。

## Article-type adaptations

### Validation / Split

`定義 → 使う場面 → split図 → 他splitとの比較 → Kaggle実例 → leakage / mismatch → Quick Reference`

特に「何を分離単位にするか」を明確にする。

### Metric

`定義 → 数式 → 値の意味 → 使う場面 → 他metricとの比較 → Kaggle実例 → 最適化上の注意`

数式だけでなく、予測をどう変えるとmetricが動くかを書く。

### Modeling / Training

`定義 → なぜ効くか → 使う条件 → 類似手法との比較 → Kaggle実例 / ablation → 失敗条件`

モデル名やライブラリ名の羅列にしない。

### Ensemble / Post-processing / Inference

`定義 → 入出力の仕組み → 使い分け → CV上の選択方法 → Kaggle実例 → overfit / leakage注意`

Public LBだけで重みやthresholdを決める設計を推奨しない。

### Competition article

個別コンペは以下を基本とする。

1. コンペ概要
2. Metric / Data / 制約
3. Validation
4. 上位解法比較
5. 共通して効いた手法
6. コンペ固有のユニークな手法
7. 効果・ablation比較
8. 他コンペへ一般化できる知見
9. 参考文献

順位順にWriteupを要約するだけの記事にはしない。

## Frontmatter

```yaml
---
layout: default
title: <title>
summary: <1行要約>
type: reference
domain: kaggle
topic: <slug>
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_count: 0
tags:
  - kaggle
---
```

## Index

- ルート `index.md` が唯一の索引。
- `wiki/index.md` のような重複ランディングページは作らない。
- 新規記事作成時は `index.md` の適切なカテゴリからリンクする。
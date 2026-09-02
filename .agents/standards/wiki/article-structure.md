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
- 内部処理、Skill、Jekyll、CDN、JavaScript、ディレクトリ構成を公開本文に書かない。
- Kagglecture自身のGitHubリポジトリへのリンクを公開本文に置かない。
- 長い記事はページ内リンクを置き、目的の節へ直接移動できるようにする。
- 既存の関連Wikiページがある用語は、初出または関連項目から参照できるようにする。

## Page navigation

主要セクションが4つ以上ある記事では、タイトル直後の定義の後に短いページ内ナビゲーションを置いてよい。

例:

```html
<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#使う場面">使う場面</a>
  <a href="#仕組み">仕組み</a>
  <a href="#使い分け">使い分け</a>
  <a href="#kaggleでの実例">Kaggle実例</a>
  <a href="#注意点">注意点</a>
</nav>
```

リンク数を増やしすぎず、4〜7件程度にする。

## Internal links

- ルート `index.md` が唯一の索引。
- `wiki/index.md` のような重複ランディングページは作らない。
- 新規記事作成時は `index.md` の適切なカテゴリから直接リンクする。
- 公開URLはGitHub Pagesのbase pathを考慮し、必要に応じてLiquidの `relative_url` を使う。
- `.md` のsource pathをそのまま公開リンクとして決め打ちしない。
- 関連項目は**実在するページだけ**リンクする。未作成ページをリンク風に見せない。
- 同じ用語へのリンクを1ページ中で何度も繰り返さない。
- 学習順序ではなく、概念上の関連性でcross-linkする。

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
- 状態や値を変えると理解が深まる → Interactive visualization
- 単純な概念 → 短い文章

可視化の詳細は `visualization.md` に従う。

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

概念的に近い**実在ページ**を2〜6件程度置く。

実在ページがない場合は節自体を省略する。

### 9. `## 参考文献`

必須。詳細は `citation-policy.md` に従う。

## Article-type adaptations

### Validation / Split

`定義 → 使う場面 → split図 / Interactive → 他splitとの比較 → Kaggle実例 → leakage / mismatch → Quick Reference`

特に「何を分離単位にするか」を明確にする。foldやsplitを切り替えることで理解が深まる場合はInteractiveを優先する。

### Metric

`定義 → 数式 → 値の意味 → 使う場面 → 他metricとの比較 → Kaggle実例 → 最適化上の注意`

thresholdやrankingを操作するとmetric変化を理解しやすい場合はInteractiveを検討する。

### Modeling / Training

`定義 → なぜ効くか → 使う条件 → 類似手法との比較 → Kaggle実例 / ablation → 失敗条件`

モデル名やライブラリ名の羅列にしない。

### Ensemble / Post-processing / Inference

`定義 → 入出力の仕組み → 使い分け → CV上の選択方法 → Kaggle実例 → overfit / leakage注意`

weightやthresholdの変化を理解する価値が高ければInteractiveを使う。Public LBだけで重みやthresholdを決める設計を推奨しない。

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

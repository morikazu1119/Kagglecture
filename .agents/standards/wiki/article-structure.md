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
- 長い記事はページ内リンクを置き、目的の節へ直接移動できるようにする。
- 既存の関連Wikiページがある用語はcross-linkする。
- 公開UIのカードや「戻る」などに、`→` / `←` のような装飾目的の矢印記号を付けない。リンクであることはカード全体のhover・focus・cursor等で示す。
- 内部処理、Skill、Jekyll、CDN、JavaScript、ディレクトリ構成を公開本文に書かない。
- Kagglecture自身のGitHubリポジトリへのリンクを公開本文に置かない。

## Navigation hierarchy

公開導線は原則として次の3階層にする。

```text
Home
Category
Article
```

例:

```text
Kagglecture
Validation & Split
GroupKFold
```

### Home

- ルート `index.md` が唯一のホーム・カテゴリ索引。
- ホームのカテゴリカードから個別記事へ直接飛ばさない。
- 実在するカテゴリページへリンクする。
- `wiki/index.md` のような全体索引の重複ページは作らない。

### Category index

各主要カテゴリは必要に応じて `wiki/<category>/index.md` を持つ。

Frontmatter例:

```yaml
---
layout: default
title: Validation & Split
type: category-index
permalink: /wiki/validation/
---
```

カテゴリページでは、そのカテゴリに属する**実在記事だけ**を一覧化する。未作成記事をリンク風に表示しない。

### Article

記事は `wiki/<category>/<slug>.md` に置く。

- カテゴリページから記事へ到達できること。
- 記事の「戻る」は所属カテゴリへ戻ること。
- 「索引」はホームへ戻ること。
- 関連項目は学習順ではなく概念上の関連性で付ける。

## URL rules

- `_config.yml` の `url` / `baseurl` をGitHub Pages公開先と一致させる。
- Liquid内では `relative_url` を使い、project siteのbase pathを落とさない。
- `.md` のsource pathを公開URLとして使わない。
- Categoryは `/wiki/<category>/`、記事はJekyllが生成する公開URLへリンクする。
- 新規ページ作成後は Home、Category、Article の全経路が404にならないことを確認する。

## Page navigation

主要セクションが4つ以上ある記事では、定義の後に4〜7件程度のページ内ナビゲーションを置いてよい。

```html
<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
</nav>
```

## Standard article structure

手法・概念の記事は原則として以下の順にする。不要な節は削除してよい。

### 1. `# 用語・手法名`

直下に2〜4行で、何か・何のためか・最重要の前提条件を書く。

### 2. `## 使う場面`

「いつ使うか」を短時間で判断できる形にする。文章より表が速いなら表を使う。

### 3. `## 仕組み`

なぜ機能するかを直感的に説明する。

- 値・状態・条件を変えると理解が深まる: Interactive visualizationを優先
- 固定された単純な関係・処理フロー: HTML / CSS / SVG
- 数式が本質: LaTeX
- 単純な概念: 短い文章
- Mermaidは、Interactive化しても理解が増えず、SVG/CSSより保守性が明確に高い複雑な静的関係に限る

可視化の詳細は `visualization.md` に従う。

### 4. `## 使い分け`

類似手法・代替手法と比較し、「何と迷うか」「どう選ぶか」に答える。

### 5. `## Kaggleでの実例`

実際のCompetition / Solution / Writeupでの使われ方を示す。

可能なら次を確認する。

- Rank / Medal
- Validation設計
- 具体的な使用方法
- CV / LB / ablation差
- なぜ有効だったか

確認できない数値は推測しない。

### 6. `## 注意点`

テーマ固有の失敗条件を優先する。Leakage、Validation mismatch、Overfitting、Distribution shift、計算量など。

### 7. `## Quick Reference`

再訪時に数秒で判断できる短い表またはチェックリストにする。

### 8. `## 関連項目`

概念的に近い**実在ページ**だけを2〜6件程度置く。存在しなければ節を省略する。

### 9. `## 参考文献`

必須。詳細は `citation-policy.md` に従う。

## Article-type adaptations

### Validation / Split

定義、使う場面、split Interactive / 静的図、比較、Kaggle実例、leakage / mismatch、Quick Reference の順を基本とする。

特に「何を分離単位にするか」を明確にする。foldやsplitを切り替えることで理解が深まる場合はInteractiveを優先する。

### Metric

定義、直感、数式、値の意味、使う場面、比較、Kaggle実例、最適化上の注意の順を基本とする。

threshold、ranking、overlap、outlierなどを操作すると理解しやすい場合はInteractiveを優先する。

### Modeling / Training

定義、なぜ効くか、使う条件、比較、Kaggle実例 / ablation、失敗条件の順を基本とする。

### Ensemble / Post-processing / Inference

定義、入出力の仕組み、使い分け、CV上の選択、Kaggle実例、overfit / leakage注意の順を基本とする。weight、threshold、TTA構成など操作対象がある場合はInteractiveを検討する。

### Competition article

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

## Article frontmatter

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

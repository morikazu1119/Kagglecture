---
name: kaggle-research
description: Kaggleの公開Writeup・Discussion・Notebook・GitHub・技術記事を日本語/英語で横断調査し、実際に有効だった手法・概念・評価方法をKagglectureの辞書記事として作成・更新する。
---

# Kaggle Research Skill

## Purpose

Kaggleで公開されている情報を調査し、一般手法からCompetition固有の工夫まで、再利用可能な知識として `wiki/` に整理する。

対象はKaggle手法、Validation、Metric、過去Competitionの上位解法、特定手法の実例、複数Competitionの横断比較など。

Pythonコード集にはしない。意味、使い分け、実例、効果、失敗条件を優先する。

## Required standards

記事を作成・更新する前に必ず読む。

- `../../standards/wiki/article-structure.md`
- `../../standards/wiki/citation-policy.md`
- `../../standards/wiki/visualization.md`

記事構成、ナビゲーション、Citation、可視化のSSOTは上記Standard。Skillへ重複定義しない。

## Beginner-first explanation requirement

Kagglectureの記事は、**機械学習やKaggleの前提知識が薄い人でも、最初の説明と図だけで意味をつかめること**を必須品質とする。

内部品質基準として「ギャルでもわかる」を使う。ただし公開文体をギャル語にする意味ではない。専門性を保ったまま理解コストを下げる。

原則:

- **直感 → 正式名称 → 具体例 → 必要なら厳密説明・数式** の順にする。
- 「なぜ必要か」を先に示す。
- 専門用語は初出時に1文で意味を説明する。
- 略語は初出時に意味または正式名称を補足する。
- 患者、ユーザー、画像、予測値など具体的な対象へ落とす。
- 1文に複数の新概念を詰め込まない。
- 数式を出す前に、その数式が何を表すか日本語で説明する。
- 難しい厳密性は `details` や後半へ回す。
- 比喩は便利でも、誤解を生むほど単純化しない。

最低限、読者が次を自分の言葉で説明できる状態を目指す。

1. これは何か
2. なぜ使うのか
3. どんなときに使うのか

## Research scope

毎回、日本語と英語の両方を確認する。

情報源の優先順位:

1. Kaggle Competition公式ページ
2. Kaggle DiscussionのSolution / Writeup
3. Kaggle Notebook
4. 上位入賞者本人のGitHub
5. 上位入賞者本人のブログ・スライド
6. Zenn / Qiita / はてな等の日本語記事
7. 論文・公式ドキュメント・技術ブログ

二次情報だけで一般化せず、可能な限り一次情報へ遡る。

## Research workflow

1. 調査対象を1文で定義する。
2. 日本語・英語で候補ソースを探す。
3. 一次情報へ遡る。
4. 手法、Validation、Metric、順位、効果を抽出する。
5. 複数Competition / 複数解法でクロスチェックする。
6. General / Situational / Competition-specific に整理する。
7. 効果主張のEvidenceを判定する。
8. 初見ユーザーがつまずく専門用語・前提知識を特定する。
9. 既存カテゴリ・既存記事・cross-link先を確認する。
10. 文章・表・静的図・Interactiveのどれが最短で理解できるか判断する。
11. 操作で理解が深まるならInteractive visualizationを設計する。
12. 記事を作成・更新する。
13. 所属カテゴリの `index.md` を更新する。
14. 新カテゴリならルート `index.md` からカテゴリページへリンクする。
15. **Home → Category → Article** の導線、ページ内リンク、Citation、図表、モバイル表示を確認する。

## Visual reasoning requirement

記事を書く前に、そのテーマで最も理解しづらい1点を特定する。

表現方法は次の基準で選ぶ。

1. 短い文章で十分 → 文章
2. 比較が本質 → 表
3. 関係・流れ → Mermaid / SVG
4. 値や状態を変えると理解が深まる → Interactive
5. hover / zoom / 実測値探索が重要 → Plotly / Chart.js / Vega / D3

Interactiveでも、JavaScriptなしで本文だけから最低限の結論が分かるようにする。

## Navigation requirement

公開導線は原則 **Home → Category → Article**。

- ホームのカテゴリカードから個別記事へ直接リンクしない。
- 主要カテゴリは `wiki/<category>/index.md` をカテゴリ索引として持てる。
- カテゴリページには実在記事だけを掲載する。
- 記事の「戻る」は所属カテゴリへ戻す。
- 「索引」はホームへ戻す。
- 未作成ページへのdead linkを作らない。
- `.md` を公開URLとして使わない。
- GitHub Pagesの`baseurl`を落とさない。

詳細は `article-structure.md` に従う。

## Evidence

| Grade | 根拠 |
|---|---|
| A | ablation、CV差、LB差、順位差など定量根拠あり |
| B | 上位入賞者本人が有効性を明示し最終解法に採用 |
| C | 複数の独立した上位解法で同傾向 |
| D | 単一記事・経験談・推測のみ |

数値がない場合は効果量を推測しない。

## Extraction schema

可能な範囲で次を抽出する。

| Field | 内容 |
|---|---|
| Method | 手法名 |
| Competition | 使用Competition |
| Rank / Medal | 順位・Medal |
| Metric | 評価指標 |
| Validation | ローカル評価設計 |
| Effect | CV / LB / ablation差 |
| Why | なぜ効いたか |
| Use when | 適用条件 |
| Compare with | 比較対象 |
| Avoid when | 失敗条件・リスク |
| Evidence | A / B / C / D |
| Source | 一次情報優先のURL |

確認できないFieldは埋めない。

## Repository layout

```text
index.md
wiki/
  validation/
    index.md
    group-kfold.md
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

`wiki/index.md` のような全体索引の重複ページは作らない。

## Deliverables

原則として更新するもの:

1. `wiki/.../<article>.md` — 辞書記事
2. `wiki/<category>/index.md` — カテゴリ内の記事索引
3. 新カテゴリの場合のみ `index.md` — ホームからカテゴリへの導線
4. 必要な場合のみ `assets/` — Interactive visualization等の共通UI資産

## Final checks

- 日本語と英語の両方を確認したか
- 一次情報を優先したか
- Public LBだけで効果を判断していないか
- Metric / Validation / leakageを確認したか
- 定量値に確認可能な出典があるか
- 適用条件と失敗条件を抽出したか
- 初見ユーザーが冒頭だけで「何か・なぜ使うか」を理解できるか
- 専門用語を説明なしで連鎖させていないか
- 数式より先に直感を説明したか
- 図で説明した方が速い箇所を文章だけにしていないか
- Interactiveにする価値を一度判断したか
- Interactiveなしでも最低限理解できるか
- Home → Category → Article の全リンクが404にならないか
- 記事の戻り先がカテゴリになっているか
- `article-structure.md` / `citation-policy.md` / `visualization.md` に沿っているか

# .agents

KagglectureでAIエージェントが参照する内部設定を管理する。

## Structure

```text
.agents/
├─ README.md
├─ skills/
│  └─ kaggle-research/
│     └─ SKILL.md
└─ standards/
   └─ wiki/
      ├─ article-structure.md
      ├─ citation-policy.md
      └─ visualization.md
```

## Responsibilities

### `skills/`

特定タスクを実行するためのSkillを置く。

Skillには以下だけを書く。

- いつ使うか
- 調査対象と情報源
- 調査フロー
- Evidenceの扱い
- 出力先
- 参照すべきStandard

記事テンプレートやサイト共通の表示仕様をSkill配下へ複製しない。

### `standards/`

複数回の調査・記事作成で共通して使う恒久ルールを置く。

`standards/wiki/` はKagglectureの公開Wikiに関するSSOT。

- `article-structure.md` — 記事構成・UX・記事タイプ別の構成
- `citation-policy.md` — 出典・Evidence・参考文献ルール
- `visualization.md` — 表・Mermaid・LaTeX・グラフ等の選択ルール

## SSOT

同じルールを複数ファイルへコピーしない。

SkillはStandardへのリンクを持ち、Standardの内容を重複定義しない。
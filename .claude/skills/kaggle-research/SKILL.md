---
name: kaggle-research
description: Kaggleの公開Writeup・Discussion・Notebook・技術記事・上位解法を日本語/英語で横断調査し、一般手法からユニークな手法までllm-wiki形式で整理する。Kaggle手法調査、Validation、データ分割、評価指標、上位解法の横断調査で使用する。
---

# Kaggle Research

このプロジェクトでは、Kaggle調査の正本を以下に置く。

`../../../.agents/skills/kaggle-research/SKILL.md`

実行時は最初に正本を全文読み、その指示を優先して従うこと。

Wikiページを新規作成・更新するときは、続けて以下も読むこと。

`../../../.agents/skills/kaggle-research/references/wiki-template.md`

重要事項:

- Pythonコード中心の教材にしない。
- 日本語・英語の両方を調査する。
- 一次情報を優先する。
- 比較表とMermaid等の可視化を積極的に使う。
- ソース保存専用ディレクトリは作らない。
- 各 `wiki/*.md` の具体的な主張に出典URLを直接埋め込む。
- 各ページ末尾に `## 参考文献` を置く。

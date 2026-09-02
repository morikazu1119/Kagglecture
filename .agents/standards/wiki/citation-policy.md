# Wiki Citation Policy

Kagglectureでは、手法の有効性・順位・数値・採用実績を追跡可能な形で記載する。

## Source priority

優先順位は以下。

1. Kaggle Competition公式ページ
2. Kaggle DiscussionのSolution / Writeup
3. Kaggle Notebook
4. 上位入賞者本人のGitHub
5. 上位入賞者本人のブログ・スライド
6. Zenn / Qiita / はてな等の日本語記事
7. 論文・公式ドキュメント・技術ブログ

二次情報だけで一般化せず、可能な限り一次情報へ遡る。

日本語と英語の両方を確認する。

## Inline citations

以下には、本文の近い位置に直接リンクを置く。

- 具体的なCV / LBスコア
- 順位・Medal
- fold数
- 使用したモデル・特徴量・後処理
- ablation結果
- 「効いた」「悪化した」などの効果主張
- Competition固有のデータ仕様や制約

例:

```markdown
1st place solutionではpatient単位でGroupKFoldを使用している（[1st place solution](https://...)）。
```

表では必要に応じて `Source` 列を設ける。

## Evidence grade

手法の「効果」は内部で以下の強度として扱う。

| Grade | 根拠 |
|---|---|
| A | ablation、CV差、LB差、順位差などの定量根拠がある |
| B | 上位入賞者本人が有効性を明示し、最終解法に採用 |
| C | 複数の独立した上位解法で同傾向 |
| D | 単一記事・経験談・推測のみ |

Grade自体を公開ページで長く説明する必要はない。必要な場合だけ表の `Evidence` 等で簡潔に示す。

数値がない場合、効果量を推測しない。

## References section

全記事末尾に `## 参考文献` を置く。

URLだけを列挙せず、確認できる範囲で以下を含める。

- タイトル
- 投稿者 / 著者
- Competition名
- 媒体
- 公開日 / 年

Kaggle DiscussionはCompetition名とSolution / Writeup名を明示する。

GitHubはリポジトリ名だけでなく、可能なら該当README / solution fileを明示する。

## Prohibited

- 存在を確認していない参考文献を作らない。
- Public LBだけで効果を断定しない。
- 二次記事の表現を一次情報で確認せず事実として扱わない。
- 出典にない数値を補間・推測してグラフ化しない。
- 順位やMedalを推測しない。

## Quantitative visualization

グラフに使う値は、出典から確認できる実測値だけに限定する。

グラフ直下または同じ節にデータ元リンクを置き、どの値をどこから取得したか追跡できるようにする。
# Model Architecture Visualization Standard

Kagglectureのモデル記事では、architecture図を単なる処理順の箱として描かない。**モデル内部で何が入力へ作用し、tensor / token / tree structureがどう変化するかを視覚的に追えること**を必須品質とする。

## Goal

読者が図だけを見ても、少なくとも次を説明できる状態を目指す。

1. 入力はどの形でモデルへ入るか
2. 主要演算はどこで行われるか
3. 演算後に表現の形・意味がどう変わるか
4. skip / residual / concat / attention / ensemble等の接続はどう働くか
5. 最終出力へどのようにつながるか

## Simple flow is not enough

`Input → Block → Output`のような単純なflowだけでモデル記事を完結させない。

モデル記事では、テーマに応じて次のうち必要なものを図へ含める。

- tensorの縦・横・channel方向
- patch / tokenの位置関係
- kernel / filterの適用範囲
- stride / downsamplingによる空間サイズ変化
- feature map stack
- residual / skip connection
- attentionで参照するtoken間関係
- MLP / projection / normalizationの位置
- tree splitとleaf
- boostingでtree predictionが加算される関係
- encoder / decoder / headの接続
- repeated blockの回数またはstack構造

## 2D / 2.5D / 3D

モデル構造では2.5D / 3Dを積極的に使ってよい。**装飾的な奥行き、影、layer stack表現も許容する。**

ただし装飾だけで構造を誤読させない。

- 奥行きがchannel / layer / volumeを表す場合はlabelを付ける。
- perspectiveでtensor sizeの定量比較をさせない。
- 重要なconnectionは線・矢印・labelでも明示する。
- mobileではflat表示へ落としても意味が残るようにする。
- dark modeでも前後関係とconnectorが読めるcontrastを保つ。

## Operation-first interactive

演算自体が理解の中心なら、architecture overviewに加えて**演算を追えるInteractive**を置く。

### CNN

最低限、次が理解できる図を優先する。

- input grid上をkernelが移動する
- 現在のreceptive fieldが強調される
- kernelと入力の積和から1つのfeature値が生成される
- 出力feature mapの対応位置へ値が入る
- 複数filterならchannel stackになることを補足する

### Vision Transformer

最低限、次が理解できる図を優先する。

- imageをpatchへ分割
- patchをembedding tokenへ変換
- positional informationを加える
- selected query tokenが他tokenをattentionで参照する
- Multi-Head Self-Attention → residual → MLP → residualのencoder block構造
- blockをstackした後にhead / decoderへ渡る

### GBDT

最低限、次が理解できる図を優先する。

- sampleがsplit条件でleafへ到達する
- leaf scoreが1本のtree predictionになる
- boostingでは前のpredictionへ次のtreeの補正値を加える
- LightGBMならhistogram binningとleaf-wise growth
- CatBoostならordered statistics / ordered boostingの自己target参照回避

## Interaction UX

- endless autoplayを前提にしない。
- slider、step button、click / tap等でユーザーが進行を制御できるようにする。
- 現在どの演算をしているかをstatus / captionで説明する。
- 数式を見せる場合も、選択中のcell / token / leafとの対応を視覚的に示す。
- JavaScriptなしでもoverview図と本文から本質が分かるfallbackを残す。
- synthetic valuesは「模式例」「理解用」と明記する。

## Decorative quality

論文のarchitecture figureのように、layer stack、depth、connector、highlight、shadow、perspectiveを使ってよい。装飾は次の目的に使う。

- 入力から出力への視線誘導
- channel / layer stackの奥行き表現
- repeated blocksのまとまり
- main pathとskip pathの区別
- active operationの強調

見た目を豊かにすること自体は問題ないが、labelを消したりhoverしないと意味が分からない構成にはしない。

## Model article review checklist

- 単純flowだけで終わっていないか
- architecture overviewと演算の説明が対応しているか
- CNNならconvolutionを目で追えるか
- Transformerならattentionとencoder block内部が追えるか
- GBDTならtree ensemble / boosting processが追えるか
- tensor / token / treeの形の変化が分かるか
- skip / residual / concat等がある場合、connectionが図に出ているか
- 装飾的な3Dを使っても意味を誤読しないか
- mobileでflat化しても情報が失われないか
- 操作可能な図はkeyboard / touchでも使えるか

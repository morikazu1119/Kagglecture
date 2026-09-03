# Model Architecture Visualization Standard

Kagglectureのモデル記事では、architecture図を単なる処理順の箱として描かない。**モデル内部で何が入力へ作用し、tensor / token / tree structureがどう変化するかを視覚的に追えること**を必須品質とする。

## Goal

読者が図だけを見ても、少なくとも次を説明できる状態を目指す。

1. 入力はどの形でモデルへ入るか
2. 主要演算はどこで行われるか
3. 演算後に表現の形・意味がどう変化するか
4. skip / residual / concat / attention / ensemble等の接続はどう働くか
5. 最終出力へどのようにつながるか

## Article granularity

モデル記事は原則として、**1つのmodel / architecture familyを1記事**として扱う。

総論記事はfamily共通の原理だけに限定し、個別model固有のblock・training design・scaling ruleまで詰め込まない。

例:

- `CNN` は convolution / receptive field / feature map / channel / downsamplingを扱う。
- `ResNet` は residual connection / Basic Block / Bottleneckを別記事で扱う。
- `EfficientNet` は MBConv / compound scalingを別記事で扱う。
- `ConvNeXt` は large-kernel depthwise convolution / modern CNN blockを別記事で扱う。
- `Transformer` は Self-Attention / FFN / Encoder-Decoderという共通原理を扱う。
- `BERT` / `RoBERTa` / `DeBERTa` はpretraining objectiveやattention設計が独立した判断単位なので別記事にする。
- `Mamba` のようにTransformerと異なるsequence modeling原理を持つfamilyも独立記事にする。

個別記事へ分離する判断基準:

1. Kaggleで独立したmodel選択候補として使われる
2. 固有の主要演算・block・inductive biasがある
3. 「なぜこのmodelを選ぶか」を独立して説明できる
4. Operation view / Full architecture viewが総論記事と実質的に異なる

逆にminor version違いだけで内容がほぼ重複する場合は、親model記事内の比較節に留める。version差がKaggle上のmodel選択を明確に変えるほど大きくなった場合だけ分離を再検討する。

## Required two-level explanation

モデル記事は原則として、**局所の原理**と**モデル全体**の2段階で説明する。どちらか一方だけでは十分としない。

### 1. Operation / single-sample view

最初に、1サンプルまたは1回の主要演算を具体的に追える図を置く。

- GBDT: 1 rowがsplit条件を通り、1つのleaf scoreを受け取る
- CNN: 1つのkernel位置でreceptive fieldと積和を見せ、output 1 cellができる
- Transformer: 1 patch/tokenが他tokenをattentionで参照する
- SSM / Mamba: 1 tokenでstateがどう選択的に更新されるか
- GNN: 1 nodeがneighbor messageをどうaggregateするか
- Ensemble: 1 rowに対する複数model predictionがどう結合されるか

ここではまず「何をしているか」を理解させる。gradient / hessian / matrix式 / optimization objective等の厳密説明は、その動作を理解した後へ置く。

### 2. Full architecture view

次に、その演算がモデル全体のどこにあり、何回・どのように積み重なるかを示す。

最低限、次を追えるようにする。

- Input
- 入力の表現化 / embedding / feature split
- repeated block / tree / stage
- intermediate representation
- head / decoder / additive sum
- final prediction

たとえばCNNでconvolutionだけを説明してbackbone全体を見せない、GBDTでboosting全体だけを見せて1本のtree内部を見せない、といった片側だけの説明は避ける。

## Beginner-first ordering

モデル記事の基本順序は次とする。

1. 2〜4行で「何を入力し、何を繰り返し、何を出すモデルか」
2. 身近な具体例または1 sample
3. Operation / single-sample visual
4. Full architecture visual
5. そのモデル固有の工夫
6. 必要なら数式・optimization・厳密説明
7. 類似modelとの比較
8. Kaggle実例・失敗条件

専門語を先に定義してから理解させるのではなく、**動作を見せてから正式名称を付ける**ことを優先する。

例:

- 「改善が一番大きいbranchを先に深くする」→ leaf-wise growth
- 「現在行のtargetを自分の特徴量作成に使わない」→ ordered categorical statistics
- 「画像の小領域へ同じ重みを重ねて積和する」→ convolution
- 「1 patchが他patchから情報を重み付きで集める」→ self-attention
- 「現在tokenに応じてstateへ残す情報量を変える」→ selective state space

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
- recurrent / SSM state update
- graph node / edge / neighborhood relation
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
- そのfeature mapが次stageへどう渡るかをfull architectureで示す

### Vision Transformer / Transformer

最低限、次が理解できる図を優先する。

- inputをtokenへ変換
- positional informationを加える
- selected query tokenが他tokenをattentionで参照する
- Multi-Head Self-Attention → residual → MLP → residualのblock構造
- blockをstackした後にhead / decoderへ渡る

### SSM / Mamba

最低限、次が理解できる図を優先する。

- sequenceをstateへ順番に取り込む
- previous state + current inputからnew stateができる
- selective modelではcurrent inputに応じてstate update parameterが変わる
- block stackとtask headまでの全体経路を示す
- TransformerのN×N Attentionとの違いを比較する

### GNN

最低限、次が理解できる図を優先する。

- target nodeとneighbor node / edge
- message生成
- aggregation
- node update
- layerを重ねると何hop先まで情報が届くか
- node / edge / graph readoutへどうつながるか

### GBDT

最低限、次が理解できる図を優先する。

- 1 sampleがfeature split条件でleafへ到達する
- leaf scoreが1本のtree predictionになる
- boostingでは前のpredictionへ次のtreeの補正値を加える
- LightGBMなら、その全体構造を理解した後にhistogram binningとleaf-wise growthを示す
- XGBoostなら、その全体構造を理解した後にgradient / hessian・regularizationへ進む
- CatBoostなら、categoryの自己target参照問題を具体例で示してからordered statistics / ordered boostingへ進む

### Ensemble

モデルを結合する記事では、最低限次を示す。

- 同じ1 sampleへ各base modelが何を出すか
- predictionをaverage / rank / meta feature等へどう変換するか
- 最終predictionまでの全体経路
- OOFが必要な手法ではTrain側とTest側のprediction生成の違い

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

- 1記事に複数model固有設計を詰め込んでいないか
- 総論記事がfamily共通原理に留まっているか
- 冒頭2〜4行で「入力・主要演算・出力」が分かるか
- Operation / single-sample viewがあるか
- Full architecture viewがあるか
- 単純flowだけで終わっていないか
- architecture overviewと演算の説明が対応しているか
- 厳密用語・数式より先に具体例と直感があるか
- CNNならconvolutionを目で追えるか
- Transformerならattentionとencoder block内部が追えるか
- SSMならstate updateとselectivityが追えるか
- GNNならmessage passingとneighbor relationが追えるか
- GBDTなら1 sampleのtree pathとtree ensemble / boosting processの両方が追えるか
- tensor / token / tree / state / graphの形の変化が分かるか
- skip / residual / concat等がある場合、connectionが図に出ているか
- 装飾的な3Dを使っても意味を誤読しないか
- mobileでflat化しても情報が失われないか
- 操作可能な図はkeyboard / touchでも使えるか

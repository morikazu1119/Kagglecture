---
layout: default
title: Mel Spectrogram
summary: 音声波形を時間×Mel周波数の2次元表現へ変換し、CNN・SED・Transformerが音の局所patternを学びやすくする。
type: reference
domain: kaggle
topic: mel-spectrogram
created: 2026-09-12
updated: 2026-09-12
source_count: 8
tags:
  - kaggle
  - audio
  - spectrogram
  - birdclef
  - feature-engineering
---

# Mel Spectrogram

**Mel Spectrogramは、1次元の音声波形を「横軸=時間、縦軸=周波数、明るさ=音の強さ」の2次元表現へ変換する方法です。**

音を画像に変えること自体が目的ではありません。鳴き声・機械音・環境音のような**時間と周波数にまたがる模様**を作り、CNNやSound Event Detection（SED）モデルが局所patternとして学びやすくするのが目的です。

Kaggleでは `n_fft`、`hop_length`、`n_mels`、`fmin / fmax` を固定値として暗記するより、**時間解像度・周波数解像度・計算量・モデル多様性のtrade-offとして設計する**ことが重要です。

<nav class="article-jump-nav" aria-label="ページ内ナビゲーション">
  <a href="#use-cases">使う場面</a>
  <a href="#mechanism">仕組み</a>
  <a href="#parameters">主要パラメータ</a>
  <a href="#comparison">使い分け</a>
  <a href="#kaggle-examples">Kaggle実例</a>
  <a href="#pitfalls">注意点</a>
  <a href="#quick-reference">Quick Reference</a>
</nav>

<h2 id="use-cases">使う場面</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>音声分類</h4><dl><dt>例</dt><dd>鳥種・環境音・機械音</dd><dt>狙い</dt><dd>周波数patternをCNNへ渡す</dd></dl></section>
  <section class="comparison-card"><h4>Sound Event Detection</h4><dl><dt>例</dt><dd>5秒区間の種・イベント検出</dd><dt>狙い</dt><dd>時間方向を残してframe単位の変化を見る</dd></dl></section>
  <section class="comparison-card"><h4>画像backboneを再利用</h4><dl><dt>例</dt><dd>EfficientNet / ConvNeXt / Swin</dd><dt>狙い</dt><dd>2D局所patternへ強いbackboneを使う</dd></dl></section>
  <section class="comparison-card"><h4>Ensemble diversity</h4><dl><dt>例</dt><dd>128 melと256 melを混ぜる</dd><dt>狙い</dt><dd>異なる音響表現の誤差差を作る</dd></dl></section>
</div>

Mel Spectrogramは特に、**何Hz付近にどの音が現れ、どれくらい続くか**が予測に効くタスクと相性が良いです。一方、raw waveform pretrained modelが非常に強い場合は、Mel frontendを自前で最適化するより、そのモデルの入力表現をそのまま使う方がよいこともあります。

<h2 id="mechanism">仕組み</h2>

最も理解しづらい点は、**「波形を画像へ変換する」のではなく、時間と周波数のresolutionを意図的に選び直している**ことです。

<div class="static-viz html-diagram" role="img" aria-label="波形から短時間フーリエ変換、Mel filter bank、log変換を経てMel Spectrogramを作る模式図">
  <div class="html-flow">
    <div class="html-flow-node"><strong>Waveform</strong><br>振幅 × 時間<br><small>1次元</small></div>
    <div class="html-flow-node"><strong>STFT</strong><br>短い窓ごとに周波数分解<br><small>時間 × 周波数</small></div>
    <div class="html-flow-node"><strong>Mel Filter Bank</strong><br>周波数binをMel帯域へ集約<br><small>n_mels本</small></div>
    <div class="html-flow-node"><strong>Log / dB</strong><br>強度rangeを圧縮<br><small>2次元入力</small></div>
  </div>
  <p class="viz-note">模式図。実測値ではない。横方向は時間、縦方向は低周波から高周波への帯域を表す。</p>
</div>

### 1. STFTで「いつ、何Hzが強いか」に分ける

音声波形は、時間ごとの振幅しか持ちません。そこでShort-Time Fourier Transform（STFT）では、波形を短いframeへ区切り、各frameを周波数成分へ分解します。

- frameを長くする: 周波数を細かく分けやすいが、瞬間的な変化はぼやける
- frameを短くする: 時間変化を細かく追えるが、周波数の区別は粗くなる

この**時間解像度と周波数解像度のtrade-off**が、`n_fft` とhop設計の中心です。

### 2. Mel scaleで周波数binを圧縮する

STFTの周波数binをそのまま使わず、複数binをMel filter bankでまとめます。`librosa.feature.melspectrogram`も、波形からpower spectrogramを作り、それをMel basisへ写像する処理として定義しています（[librosa公式ドキュメント](https://librosa.org/doc/main/api/generated/librosa.feature.melspectrogram.html)）。

出力shapeは概念的には次です。

$$
\mathrm{MelSpec}\in\mathbb{R}^{n_{mels}\times T}
$$

`n_mels` が縦方向の帯域数、`T` が時間frame数です。

### 3. log / dBで強い音だけに支配されにくくする

音のpowerはrangeが大きいため、log変換やdB変換でdynamic rangeを圧縮することが多くあります。BirdCLEF+ 2025の5位解法もMel Spectrogramへ `log(melspec + 1e-6)` を適用しています（[5th place solution](https://www.kaggle.com/competitions/birdclef-2025/writeups/noir-5th-place-solution-self-distillation-is-all-y)）。

<h2 id="parameters">主要パラメータ</h2>

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>パラメータ</th><th>大きくすると</th><th>主な判断</th><th>注意</th></tr></thead>
  <tbody>
    <tr><td><strong>sample_rate</strong></td><td>より高い周波数まで保持できる</td><td>対象音の帯域を残せるか</td><td>計算量・入力量も増える</td></tr>
    <tr><td><strong>n_fft</strong></td><td>周波数binが細かくなる</td><td>近い周波数を区別したいか</td><td>時間局在がぼやけやすい</td></tr>
    <tr><td><strong>hop_length</strong></td><td>時間frameが疎になる</td><td>短い音をどこまで追うか</td><td>大きすぎると短時間eventを落とす</td></tr>
    <tr><td><strong>n_mels</strong></td><td>縦方向の表現が細かくなる</td><td>周波数patternの細かさ</td><td>情報量と計算量が増える</td></tr>
    <tr><td><strong>fmin / fmax</strong></td><td>使用帯域が変わる</td><td>signalが存在するHz範囲</td><td>不要帯域だけでなく有効signalも切りうる</td></tr>
  </tbody>
</table></div>

### `n_fft` とhopは別物

`n_fft`は1frame内でどれだけ細かく周波数を分解するか、`hop_length`は隣のframeへ何sample進むかです。

<div class="static-viz html-diagram" role="img" aria-label="小さいhopではframeが密になり大きいhopではframeが疎になる比較模式図">
  <div class="comparison-board">
    <section class="comparison-card is-primary"><h4>小さいhop</h4><dl><dt>時間frame</dt><dd>多い</dd><dt>長所</dt><dd>短いeventを追いやすい</dd><dt>代償</dt><dd>入力幅・計算量が増える</dd></dl></section>
    <section class="comparison-card"><h4>大きいhop</h4><dl><dt>時間frame</dt><dd>少ない</dd><dt>長所</dt><dd>高速・小さい入力</dd><dt>代償</dt><dd>時間方向が粗くなる</dd></dl></section>
  </div>
  <p class="viz-note">模式比較。特定のKaggleスコアを表す図ではない。</p>
</div>

### `n_mels`は多ければよいわけではない

Mel binを増やすと縦方向が細かくなりますが、backboneが読むpixel数も増えます。また、複数の上位解法が128・192・256など異なる設定で成功しているため、唯一の正解値はありません。

<h2 id="comparison">使い分け</h2>

<div class="html-table-wrap"><table class="html-table">
  <thead><tr><th>表現</th><th>強み</th><th>向く場面</th><th>主な弱点</th></tr></thead>
  <tbody>
    <tr><td><strong>Mel Spectrogram</strong></td><td>時間×周波数patternを2Dで扱える</td><td>CNN / SED、環境音、bioacoustics</td><td>frontend設定がhyperparameterになる</td></tr>
    <tr><td>Linear-frequency Spectrogram</td><td>FFT周波数を直接保持</td><td>細かな周波数位置が重要</td><td>入力が冗長になりやすい</td></tr>
    <tr><td>MFCC</td><td>低次元に圧縮</td><td>古典ML・軽量特徴量</td><td>2D局所patternの情報を強く圧縮する</td></tr>
    <tr><td>Raw Waveform</td><td>frontendもmodelへ任せられる</td><td>強い音声pretrained modelがある</td><td>学習・推論costが高い場合がある</td></tr>
    <tr><td>Pretrained Audio Embedding</td><td>大規模事前学習済み表現を利用</td><td>label不足、domain transfer</td><td>埋め込みがtask固有情報を捨てる場合がある</td></tr>
  </tbody>
</table></div>

BirdCLEF+ 2026の10位解法はPerch v2のbuilt-in Mel frontendをそのまま使い、128 Mel bins・32kHzを入力しています（[10th solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/10th-solution-simple-model-as-always)）。これは、**pretrained modelのfrontend込みで強い場合は、Mel設定を独立に探索しない選択肢もある**ことを示します。

<h2 id="kaggle-examples">Kaggleでの実例</h2>

### BirdCLEF+ 2026 — 3位: Mel設定そのものをEnsemble diversityに使う

3位解法は、Perch KD branchで**256 Mel + z-score**、2025年2位recipeのfine-tuning branchで**128 Mel + z-score / min-max**を使っています。作者はbackbone・training recipeとともにfeature表現を意図的に変え、異なるfamilyの組み合わせが最もscoreを押し上げたと説明しています（[3rd Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/3rd-place-solution)）。

単独のMel差分ablationは公開されていないため、「256が128より強い」とは判断できません。一般化できるのは、**Mel設定はsingle-model tuningだけでなくensemble diversityの軸にもなる**という点です。Evidence B。

### BirdCLEF+ 2026 — 4位: frontend変更を含む定量改善

4位解法では、baselineから複数改善を積み上げた後、**`hop_len → 256`、`mel_bin → 128`、`mel_power → 2.5` をまとめて変更し、LB 0.935 → 0.938**と報告しています（[4th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/4-th-place-solution)）。

これはfrontend設定変更に定量差があるEvidence Aですが、3項目を同時変更しているため、**hop・Mel bin・powerのどれが何点効いたかは分離できません**。個別効果を推測しないことが重要です。

### BirdCLEF+ 2026 — 6位: 1つのMelを複数backboneで共有

6位解法は32kHz、`n_mels=128`、`n_fft=2048`、`hop_length=512`、`f_min=20`の共通Mel設定をECA-NFNet・EfficientNetV2・SwinV2で共有しました。SwinV2 branchではMelを256×256へresizeしています（[6th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/6th-place-solution)）。

さらに推論時はraw waveformからlog-Melを**一度だけ計算**し、各sub-modelへ分岐するOpenVINO graphにして約7〜8分を節約しています。これは、同じSpectrogramを共有できるensembleでは**特徴量計算を共通化してinference costを下げられる**実践例です。Evidence A/B。

### BirdCLEF+ 2026 — 16位: 別Mel branchで多様性を追加

16位解法のSED branch 2は `n_mels=256`、`n_fft=2048`、`hop=64`、`fmin=60`、`fmax=16000` を採用し、別backbone・loss・scoring procedureと組み合わせました。作者はこのbranch追加で**LB 0.955**へ到達したと説明しています（[16th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/16th-place-solution)）。

ただしMel変更だけのablationではありません。ここでも「設定差 + architecture差 + loss差」をまとめたbranch diversityとして扱います。

### BirdCLEF+ 2025 — 5位 / 11位: 強い解法でも設定は揃わない

5位解法は32kHz、192 Mel bins、`fmin=20`、`fmax=15000`、window 2048、hop 768を使用しました（[5th place solution](https://www.kaggle.com/competitions/birdclef-2025/writeups/noir-5th-place-solution-self-distillation-is-all-y)）。

11位解法は256 Mel binsを共通にしつつ、`n_fft=1536, fmin=90` と `n_fft=1024, fmin=50` の2設定を使っています（[11th solution](https://www.kaggle.com/competitions/birdclef-2025/discussion/583384)）。

複数年の上位解法を横断すると、**「32kHz + log-Mel + 画像/SED backbone」は強い共通patternでも、n_fft・hop・n_mels・周波数下限は固定値ではない**ことが分かります。Evidence C。

<h2 id="pitfalls">注意点</h2>

### 1. Public LBでMel設定を細かく最適化しない

BirdCLEF+ 2026の9位解法は、local validationがseedで約±0.02、Private LBも約±0.005揺れると報告し、改善を複数seedで再確認することを重視しています（[Private 9th / Public 2nd solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/private-9th-public-2nd-solution)）。

Mel設定は探索空間が広いため、LBだけを見て `n_fft=1536` と `2048` のような細差を選ぶとleaderboard overfittingになりやすくなります。

### 2. 比較するときは入力sizeも揃える

`n_mels`やhopを変えるとSpectrogram shapeが変わります。そのまま比較すると、Mel表現だけでなく画像resize・CNN receptive field・計算量まで変わる可能性があります。

**Mel parameterのablationなのか、model input resolutionのablationなのかを分ける**必要があります。

### 3. `fmax`をNyquist周波数より上に設定しても情報は増えない

sample rateが32kHzなら、離散信号で表現できる上限は16kHzです。対象音の帯域とsample rateを先に決め、その範囲で `fmin / fmax` を設計します。

### 4. Spectrogramを普通の自然画像として扱いすぎない

横軸は時間、縦軸は周波数なので、任意のcrop・flip・rotationが意味を保つとは限りません。画像augmentationをそのまま流用せず、時間mask・周波数mask・mixupなど音響的に妥当な変換か確認します。

### 5. raw waveform / pretrained embeddingとの比較を忘れない

BirdCLEF+ 2026ではPerchのような強いpretrained audio modelが上位解法の主要branchになっています。Mel-CNNが定番でも、問題によってはpretrained embedding branchの方が強いことがあります。

<h2 id="quick-reference">Quick Reference</h2>

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>最初のbaseline</h4><dl><dt>考え方</dt><dd>32kHz前後 + log-Mel + 128〜256 binsを候補にする</dd><dt>重要</dt><dd>値を暗記せずCVで比較</dd></dl></section>
  <section class="comparison-card"><h4>短いeventを落とす</h4><dl><dt>確認</dt><dd>hopが大きすぎないか</dd><dt>次</dt><dd>frame-wise predictionも検討</dd></dl></section>
  <section class="comparison-card"><h4>近い周波数を区別できない</h4><dl><dt>確認</dt><dd>n_fft / n_mels / 使用帯域</dd><dt>注意</dt><dd>計算量とのtrade-off</dd></dl></section>
  <section class="comparison-card"><h4>Ensembleが似すぎる</h4><dl><dt>候補</dt><dd>Mel設定・normalization・backboneを変える</dd><dt>確認</dt><dd>OOFで実際のdiversityを見る</dd></dl></section>
</div>

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }}) — Spectrogramを2D局所patternとして読む基本backbone。
- [EfficientNet]({{ '/wiki/modeling/efficientnet.html' | relative_url }}) — BirdCLEFで頻繁に使われるCNN family。
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }}) — Spectrogram入力にも使われるmodern CNN。
- [Pseudo Labeling]({{ '/wiki/advanced-methods/pseudo-labeling.html' | relative_url }}) — labeled focal audioとunlabeled soundscapeのdomain gapを埋める際に頻出。
- [Fold / Seed Ensemble]({{ '/wiki/ensemble/fold-seed-ensemble.html' | relative_url }}) — seed varianceを抑える基本ensemble。

## 参考文献

1. Cornell Lab of Ornithology. [BirdCLEF+ 2026](https://www.kaggle.com/competitions/birdclef-2026). Kaggle, 2026.
2. Katsuya Takenouchi (kapenon). [3rd Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/3rd-place-solution). BirdCLEF+ 2026, Kaggle, 2026.
3. BirdCLEF+ 2026 Team. [4th Place Solution: BirdCLEF+ 2026](https://www.kaggle.com/competitions/birdclef-2026/writeups/4-th-place-solution). Kaggle, 2026.
4. BirdCLEF+ 2026 6th place participant. [6th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/6th-place-solution). Kaggle, 2026.
5. goonew. [16th Place Solution](https://www.kaggle.com/competitions/birdclef-2026/writeups/16th-place-solution). BirdCLEF+ 2026, Kaggle, 2026.
6. NOIR team. [5th place solution: Self-Distillation is All You Need](https://www.kaggle.com/competitions/birdclef-2025/writeups/noir-5th-place-solution-self-distillation-is-all-y). BirdCLEF+ 2025, Kaggle, 2025.
7. librosa developers. [librosa.feature.melspectrogram](https://librosa.org/doc/main/api/generated/librosa.feature.melspectrogram.html). librosa documentation, 2026年参照.
8. Everyday Kaggle News. [音声コンペ](https://upura.github.io/everyday-kaggle-news/docs/wiki/concepts/audio.html). 日本語Kaggle概説, 2026年参照.

<nav class="article-footer-nav" aria-label="記事ナビゲーション">
  <a href="{{ '/wiki/audio/' | relative_url }}">Audioへ戻る</a>
  <a href="{{ '/' | relative_url }}">索引</a>
</nav>

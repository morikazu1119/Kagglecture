---
layout: default
title: Audio
description: Kaggleの音声コンペで使う表現変換・特徴量・学習設計を調べるカテゴリ索引。
summary: WaveformをMel Spectrogramなどの学習しやすい表現へ変え、音声分類・Sound Event Detectionへつなぐ設計を整理する。
type: category-index
nav_order: 10
permalink: /wiki/audio/
---

# Audio

Audioでは、**時間波形をモデルが扱いやすい表現へ変換し、音の種類・イベント・生物種などを予測する設計**を扱います。

Kaggleでは、raw waveformを直接扱う方法に加え、Mel Spectrogramへ変換してCNN / Transformerへ入力する構成が頻繁に使われます。特に音声コンペでは、sample rate、FFT窓、hop、Mel bin、周波数帯域がモデル性能と多様性の両方に影響します。

## 音声表現

<div class="dictionary-grid">
  <a class="dictionary-card dictionary-card-link" href="{{ '/wiki/audio/mel-spectrogram.html' | relative_url }}"><h3>Mel Spectrogram</h3><p>波形を時間×周波数の2次元表現へ変換し、CNN・SED・Transformerへ入力する。n_fft、hop、n_mels、fmin/fmaxの意味とKaggle実例を整理。</p></a>
</div>

## 迷ったときの判断軸

<div class="comparison-board">
  <section class="comparison-card is-primary"><h4>画像モデルを使いたい</h4><dl><dt>最初に見る</dt><dd>Mel Spectrogram</dd><dt>理由</dt><dd>時間×周波数へ変換し、CNNの局所pattern認識を使える</dd></dl></section>
  <section class="comparison-card"><h4>短い音が重要</h4><dl><dt>見る設定</dt><dd>hop / frame長</dd><dt>注意</dt><dd>時間解像度を粗くしすぎない</dd></dl></section>
  <section class="comparison-card"><h4>周波数構造が重要</h4><dl><dt>見る設定</dt><dd>n_fft / n_mels / fmin-fmax</dd><dt>注意</dt><dd>高解像度化は計算量と表現冗長性も増やす</dd></dl></section>
</div>

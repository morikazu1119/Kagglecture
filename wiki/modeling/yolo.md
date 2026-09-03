---
layout: default
title: YOLO
summary: 画像全体からbounding box・objectness・classをsingle-stageでまとめて予測するObject Detection model family。
type: reference
domain: kaggle
topic: yolo
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, detection, yolo, computer-vision]
---

# YOLO

**YOLO（You Only Look Once）は、画像から物体の位置とclassを1つのnetworkでまとめて予測するsingle-stage Object Detectorです。**

Classificationが「画像に何があるか」だけを答えるのに対し、Detectionでは**どこに・何があるか**を答えます。YOLO familyは高速なend-to-end detectionの代表で、Kaggleでも物体検出や2-stage pipelineの候補生成に使われます。

<nav class="article-jump-nav"><a href="#prediction">1予測の中身</a><a href="#architecture">全体構造</a><a href="#nms">NMS</a><a href="#comparison">Two-stageとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## 1つの候補で何を出すか {#prediction}

Detection headは1つの候補について、少なくとも**bounding boxの位置・その場所に物体がある確信度・class score**を出します。

<div class="model-architecture" aria-label="YOLO detection prediction">
  <div class="model-architecture__header"><div><div class="model-architecture__title">1つのfeature位置から「場所 + 物体らしさ + class」を予測</div><p class="model-architecture__subtitle">versionによりanchor-based / anchor-free等の違いはありますが、最終的にboxとclass predictionを作る点は共通です。</p></div><span class="model-architecture__badge">detection head</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Feature<br>location</span></div></div><div class="model-stage"><div class="model-op-box"><span>Box<br>x,y,w,h</span></div></div><div class="model-stage"><div class="model-op-box"><span>Object<br>score</span></div></div><div class="model-stage"><div class="model-op-box"><span>Class<br>scores</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Candidate<br>detection</span></div></div></div>
</div>

画像内の多数の位置から候補が出るため、そのままでは同じ物体にboxが何個も重なります。後段で重複を整理します。

## YOLO全体 {#architecture}

現代のYOLO familyは概ね**Backbone → Neck → Detection Head**の3部分として理解すると整理しやすいです。

<div class="model-architecture" aria-label="YOLO full architecture">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Backboneで特徴抽出、Neckで複数scaleを融合、Headでbox/class予測</div><p class="model-architecture__subtitle">小さい物体と大きい物体を扱うため、異なるresolutionのfeature mapを利用します。</p></div><span class="model-architecture__badge">single-stage detector</span></div>
  <div class="model-stage-row" style="--model-cols:6"><div class="model-stage"><div class="model-tensor"><span>Image</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Backbone<br>multi-scale features</span></div></div><div class="model-stage"><div class="model-op-box"><span>Neck<br>FPN/PAN-like fusion</span></div></div><div class="model-stage"><div class="model-tensor"><span>Small-scale<br>feature</span></div></div><div class="model-stage"><div class="model-tensor is-thin"><span>Large-scale<br>feature</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Boxes + Classes</span></div></div></div>
</div>

「YOLO」という名前だけでarchitectureが1種類あるわけではありません。YOLOv5/v8/YOLO11などでbackbone、head、loss、anchor方式は変わっています。このページではfamily共通のDetection原理を扱います。

## 重複boxをNMSで整理する {#nms}

同じ物体へ近いboxが複数出たら、confidenceが高いboxを残し、IoUが大きく重なるboxを削除する**Non-Maximum Suppression（NMS）**が代表的です。

<div class="comparison-board"><section class="comparison-card"><h4>低いNMS IoU threshold</h4><dl><dt>効果</dt><dd>重複を強く消す</dd><dt>risk</dt><dd>近接した別物体まで消す</dd></dl></section><section class="comparison-card is-primary"><h4>高いNMS IoU threshold</h4><dl><dt>効果</dt><dd>近いboxを残しやすい</dd><dt>risk</dt><dd>同一物体のduplicateが残る</dd></dl></section></div>

Competition MetricがmAP等ならconfidence thresholdとNMS設定もValidation上で評価します。

## Two-stage detectorとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>YOLO / single-stage</h4><dl><dt>流れ</dt><dd>featureから直接box/class</dd><dt>強み</dt><dd>高速・pipelineが単純</dd><dt>用途</dt><dd>高throughput detection</dd></dl></section><section class="comparison-card"><h4>Faster R-CNN / two-stage</h4><dl><dt>流れ</dt><dd>proposal → RoI classification/refinement</dd><dt>強み</dt><dd>候補ごとに詳細処理</dd><dt>用途</dt><dd>精密なproposal-based detection</dd></dl></section></div>

Kaggleでは片方が常に強いわけではなく、object size、annotation数、runtime制約で選びます。

## Kaggleでの実例 {#kaggle-examples}

Dal Shemagh Detection Challenge 2026の3位解法では、Stage 1に**YOLO11m**を使って物体を検出し、そのcropをStage 2のConvNeXt classifierへ渡す2-stage pipelineを構築しています（[3rd place solution](https://www.kaggle.com/competitions/dal-shemagh-detection-challenge/writeups/3rd-place-solution)）。

Ultra MNISTの1位解法ではYOLO detectorを高recall設定で使い、その後EfficientNetV2 classifierでdigitを分類しています（[1st place solution](https://www.kaggle.com/competitions/ultra-mnist/writeups/agpt-1st-place-solution)）。Detector単体で最終classを決めず、**candidate generationとしてYOLOを使う**例です。

一方Image Matching Challenge 2024の5位解法ではYOLOv8/YOLOWorldを試したものの対象物にgeneralizeせず、最終的にはsegmentation-based object localizationへ切り替えています（[5th place solution](https://www.kaggle.com/competitions/image-matching-challenge-2024/discussion/510603)）。

## 注意点 {#pitfalls}

### mAPだけでなくrecall用途を考える

後段classifierがある場合、YOLO自身のprecisionより「正しいcandidateを落とさないrecall」を優先する場合があります。

### 小物体とresolution

小さいobjectはdownsamplingで情報が消えやすいです。input resolution、tiling、multi-scale headをセットで検証します。

### YOLO version差

YOLOv8とYOLO11等では内部実装・head・training recipeが違います。記事やNotebookで「YOLO」とだけ書かれている場合はversionを確認します。

## Quick Reference

- single-stageでbox + classを予測。
- Backbone → Neck → Detection Headで理解する。
- multi-scale featureで大小のobjectを扱う。
- NMS/confidence thresholdもValidation対象。
- classifier前のcandidate generatorとして使うことも多い。

## 関連項目

- [CNN]({{ '/wiki/modeling/cnn-backbones.html' | relative_url }})
- [ConvNeXt]({{ '/wiki/modeling/convnext.html' | relative_url }})
- [Dice / IoU]({{ '/wiki/metrics/dice-iou.html' | relative_url }})

## 参考文献

1. Redmon et al., “You Only Look Once: Unified, Real-Time Object Detection”, 2016. https://arxiv.org/abs/1506.02640
2. Ultralytics YOLO Documentation. https://docs.ultralytics.com/
3. Kaggle, “Dal Shemagh Object Detection Challenge: 3rd place solution”, 2026. https://www.kaggle.com/competitions/dal-shemagh-detection-challenge/writeups/3rd-place-solution
4. Kaggle, “Ultra MNIST: 1st Place Solution”, 2022. https://www.kaggle.com/competitions/ultra-mnist/writeups/agpt-1st-place-solution
5. Kaggle, “Image Matching Challenge 2024: 5th Place Solution”, 2024. https://www.kaggle.com/competitions/image-matching-challenge-2024/discussion/510603

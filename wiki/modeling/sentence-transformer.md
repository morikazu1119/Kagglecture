---
layout: default
title: Sentence Transformer
summary: Text Encoderからsentence embeddingを作り、cosine similarityやcontrastive lossで検索・類似度・retrievalへ使うbi-encoder architecture。
type: reference
domain: kaggle
topic: sentence-transformer
created: 2026-09-03
updated: 2026-09-03
source_count: 5
tags: [kaggle, modeling, transformer, embedding, retrieval, sentence-transformer]
---

# Sentence Transformer

**Sentence Transformerは、文章を1本のdense vectorへ変換し、文章同士の意味の近さをcosine similarityなどで高速に比較できるようにするモデルfamilyです。**

BERTのようなencoderを各文章へ**別々に1回ずつ**通すbi-encoder構成が中心です。queryとdocumentのembeddingを先に保存できるため、大量候補からのretrievalに向きます（[Sentence-BERT paper](https://arxiv.org/abs/1908.10084)）。

<nav class="article-jump-nav"><a href="#embedding">Sentence Embedding</a><a href="#biencoder">Bi-Encoder</a><a href="#training">Contrastive Training</a><a href="#comparison">Cross-Encoderとの違い</a><a href="#kaggle-examples">Kaggle実例</a><a href="#pitfalls">注意点</a></nav>

## token列を1本のvectorへする {#embedding}

BERT系encoderは各tokenにhidden stateを出します。Sentence Transformerではそれをpoolingして、文章全体を表すfixed-size vectorへします。

<div class="model-architecture" aria-label="Sentence Transformer pooling">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Token embeddings → Pooling → Sentence embedding</div><p class="model-architecture__subtitle">Mean poolingやCLS pooling等でN×D token表現を1×Dへ圧縮します。</p></div><span class="model-architecture__badge">sentence embedding</span></div>
  <div class="model-stage-row" style="--model-cols:5"><div class="model-stage"><div class="model-tensor"><span>Text</span></div></div><div class="model-stage"><div class="model-op-box"><span>BERT /<br>RoBERTa等</span></div></div><div class="model-stage"><div class="model-tensor is-wide"><span>Token states<br>N×D</span></div></div><div class="model-stage"><div class="model-op-box"><span>Mean / CLS<br>Pooling</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>Sentence vec<br>D</span></div></div></div>
</div>

## QueryとDocumentを別々にencodeする {#biencoder}

retrievalではqueryと全documentを同じencoderへ通し、vector similarityを比較します。

<div class="model-architecture" aria-label="Sentence Transformer bi encoder retrieval">
  <div class="model-architecture__header"><div><div class="model-architecture__title">Document embeddingを事前計算し、query vectorと近いものを検索</div><p class="model-architecture__subtitle">候補ごとにquery+documentをTransformerへ再入力しないため、大規模retrievalへ使いやすい構造です。</p></div><span class="model-architecture__badge">bi-encoder</span></div>
  <div class="model-stage-row" style="--model-cols:7"><div class="model-stage"><div class="model-tensor"><span>Query</span></div></div><div class="model-stage"><div class="model-op-box"><span>Shared<br>Encoder</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>q vector</span></div></div><div class="model-stage"><div class="model-op-box"><span>Cosine /<br>Dot Product</span></div></div><div class="model-stage"><div class="model-tensor is-accent"><span>d vectors</span></div></div><div class="model-stage"><div class="model-op-box"><span>Shared<br>Encoder</span></div></div><div class="model-stage"><div class="model-tensor"><span>Documents</span></div></div></div>
</div>

FAISS等のApproximate Nearest Neighbor indexと組み合わせれば、数万〜数百万候補から近いvectorを高速に検索できます。

## 近いpairと遠いpairを学習する {#training}

Sentence Transformerは「同じ意味のpairは近く、違うpairは遠く」なるようcontrastive / ranking lossでfine-tuneできます。

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Positive Pair</h4><dl><dt>例</dt><dd>question ↔ relevant passage</dd><dt>学習</dt><dd>similarityを高くする</dd></dl></section><section class="comparison-card"><h4>Negative Pair</h4><dl><dt>例</dt><dd>question ↔ irrelevant passage</dd><dt>学習</dt><dd>similarityを低くする</dd></dl></section><section class="comparison-card"><h4>Hard Negative</h4><dl><dt>例</dt><dd>一見似ているが不正解のpassage</dd><dt>効果</dt><dd>ranking boundaryを精密化</dd></dl></section></div>

In-batch negativesを使うと、同じbatchの他documentをnegativeとして効率よく学習できます。

## Cross-Encoderとの違い {#comparison}

<div class="comparison-board"><section class="comparison-card is-primary"><h4>Bi-Encoder / Sentence Transformer</h4><dl><dt>入力</dt><dd>queryとdocumentを別々にencode</dd><dt>速度</dt><dd>候補embeddingをcache可能</dd><dt>用途</dt><dd>retrieval / candidate generation</dd></dl></section><section class="comparison-card"><h4>Cross-Encoder</h4><dl><dt>入力</dt><dd>[query, document]を一緒にTransformerへ</dd><dt>速度</dt><dd>候補ごとにforwardが必要</dd><dt>用途</dt><dd>top-K reranking</dd></dl></section></div>

Kaggleのretrieval taskでは**Bi-Encoderで広く候補を取る → Cross-Encoder/LLMでrerank**の2-stage構成がよく使われます。

## Kaggleでの実例 {#kaggle-examples}

Kaggle LLM Science Exam 2023の1位解法では、最初のcontext retrievalに`all-MiniLM-L6-v2`を使っただけでnon-context modelより大きく改善し、その後MTEB上位embedding modelを多数比較しました（[1st place solution](https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution)）。

2026-shinnen-promptの1位解法ではVLMが生成したpromptを**SentenceTransformerでembedding化**し、複数model/seed/promptをensembleしています（[1st place solution](https://www.kaggle.com/competitions/2026-shinnnen-prompt/writeups/1st-place-solution)）。

Learning Equalityの公開solutionではSentence-TransformersをBi-Encoder retrievalに使い、その後Cross-Encoderでrerankする2-stage pipelineが共有されています（[solution](https://www.kaggle.com/competitions/learning-equality-curriculum-recommendations/writeups/moro-32th-place-solution)）。

## 注意点 {#pitfalls}

### cosine similarityはtask Metricではない場合がある

retrieval recallを上げても最終MAP/F1等が上がるとは限りません。top-K recallとend-to-end Metricを両方追います。

### embedding modelのdomain差

一般英語、multilingual、code、scientific textで最適encoderは異なります。MTEB順位だけで決めずCompetition dataのOOF retrievalで比較します。

### hard negative Leakage

Validationの正解関係を使ってTrain hard negativesを作るとLeakageになる場合があります。foldごとにcandidate miningを閉じます。

### poolingだけ変えてもpretraining objectiveは同じではない

通常BERTへmean poolingを付けただけでもvectorは作れますが、semantic similarity用にcontrastive trainingされたSentence Transformerとはembedding geometryが異なります。

## Quick Reference

- Text → Encoder → Pooling → 1 vector。
- Bi-Encoderはquery/documentを別々にencode。
- cosine/dot-productで高速retrieval。
- Cross-Encoderより高速、rerank精度はCross-Encoderが有利な場合が多い。
- Kaggle RAG/retrievalではtop-K candidate generationの基盤。

## 関連項目

- [BERT]({{ '/wiki/modeling/bert.html' | relative_url }})
- [RoBERTa]({{ '/wiki/modeling/roberta.html' | relative_url }})
- [Transformer]({{ '/wiki/modeling/transformer.html' | relative_url }})
- [CLIP]({{ '/wiki/modeling/clip.html' | relative_url }})

## 参考文献

1. Reimers & Gurevych, “Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks”, 2019. https://arxiv.org/abs/1908.10084
2. Sentence Transformers Documentation. https://www.sbert.net/
3. Kaggle, “LLM Science Exam: 1st Place Solution”, 2023. https://www.kaggle.com/competitions/kaggle-llm-science-exam/writeups/team-h2o-llm-studio-1st-place-solution
4. Kaggle, “2026-shinnen-prompt: 1st place solution”, 2026. https://www.kaggle.com/competitions/2026-shinnnen-prompt/writeups/1st-place-solution
5. Kaggle, “Learning Equality: 32nd place solution”, 2023. https://www.kaggle.com/competitions/learning-equality-curriculum-recommendations/writeups/moro-32th-place-solution

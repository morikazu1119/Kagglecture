# Kagglecture

Kaggle を題材に、機械学習コンペで必要になる **データ分割・評価指標・Cross Validation・リーク対策・ベースライン構築・モデル改善** を体系的に学ぶための教材リポジトリです。

## このリポジトリで学ぶこと

- Kaggle コンペの基本的な進め方
- train / validation / test の役割
- Random Split / Stratified Split / Group Split / Time Series Split の使い分け
- Hold-out と Cross Validation の違い
- Accuracy / Precision / Recall / F1 / ROC-AUC / LogLoss / RMSE / MAE などの評価指標
- Public LB と Private LB、Leaderboard overfitting
- Data Leakage と Validation Leakage
- ベースラインモデルの作り方
- LightGBM / XGBoost / CatBoost などの代表的な表形式モデル
- 特徴量エンジニアリング
- OOF prediction と Ensemble / Stacking
- 再現可能な実験管理

## 学習ロードマップ

| Chapter | 内容 |
|---|---|
| 01 | Kaggle と機械学習コンペの基本 |
| 02 | データセット分割 |
| 03 | 評価指標 |
| 04 | Cross Validation |
| 05 | Data Leakage |
| 06 | Baseline とモデル選択 |
| 07 | Kaggle の実践ワークフロー |

## ディレクトリ構成

```text
Kagglecture/
├── README.md
├── requirements.txt
├── docs/
│   ├── 01_kaggle_basics.md
│   ├── 02_data_split.md
│   ├── 03_metrics.md
│   ├── 04_cross_validation.md
│   ├── 05_data_leakage.md
│   ├── 06_baseline_and_modeling.md
│   └── 07_kaggle_workflow.md
└── examples/
    └── tabular_classification.py
```

## 重要な考え方

Kaggle では、モデルを複雑にする前に **正しい Validation を作ること** が重要です。

```text
問題理解
  ↓
評価指標を理解
  ↓
データの生成過程を理解
  ↓
Validation strategy を決める
  ↓
Baseline を作る
  ↓
CV を安定させる
  ↓
特徴量・モデルを改善
  ↓
Ensemble
```

特に重要なのは次の3点です。

1. **Validation が本番データを再現しているか**
2. **評価指標を正しく最適化しているか**
3. **Data Leakage が発生していないか**

モデル精度が高くても、この3点が崩れていると Leaderboard のスコアを再現できないことがあります。

## 対象

- Kaggle をこれから始める人
- 機械学習の基本は知っているがコンペ経験が少ない人
- train / validation / test や CV を体系的に理解したい人
- Kaggle のスコア改善を再現可能な形で行いたい人

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 最初に読む順番

1. `docs/01_kaggle_basics.md`
2. `docs/02_data_split.md`
3. `docs/03_metrics.md`
4. `docs/04_cross_validation.md`
5. `docs/05_data_leakage.md`
6. `docs/06_baseline_and_modeling.md`
7. `docs/07_kaggle_workflow.md`
8. `examples/tabular_classification.py`

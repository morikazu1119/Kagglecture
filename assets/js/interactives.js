(() => {
  const registry = new Map();

  function register(name, init) {
    registry.set(name, init);
  }

  function boot(scope = document) {
    scope.querySelectorAll('[data-interactive]').forEach((root) => {
      if (root.dataset.interactiveReady === 'true') return;
      const init = registry.get(root.dataset.interactive);
      if (!init) return;
      root.dataset.interactiveReady = 'true';
      init(root);
    });
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const fmt = (value, digits = 2) => Number(value).toFixed(digits);

  register('group-kfold', (root) => {
    const groups = [
      { name: 'Patient A', count: 3, groupFold: 1 },
      { name: 'Patient B', count: 2, groupFold: 2 },
      { name: 'Patient C', count: 3, groupFold: 3 },
      { name: 'Patient D', count: 2, groupFold: 1 },
      { name: 'Patient E', count: 3, groupFold: 2 },
      { name: 'Patient F', count: 2, groupFold: 3 }
    ];

    let globalIndex = 0;
    groups.forEach((group) => {
      group.samples = Array.from({ length: group.count }, (_, index) => {
        const sample = {
          name: `${group.name.replace('Patient ', '')}${index + 1}`,
          kfold: (globalIndex % 3) + 1
        };
        globalIndex += 1;
        return sample;
      });
    });

    let mode = 'group';
    let fold = 1;

    const grid = root.querySelector('[data-gkf-grid]');
    const status = root.querySelector('[data-gkf-status]');
    const explanation = root.querySelector('[data-gkf-explanation]');
    const modeButtons = [...root.querySelectorAll('[data-gkf-mode]')];
    const foldButtons = [...root.querySelectorAll('[data-gkf-fold]')];

    const render = () => {
      grid.replaceChildren();
      let leakingGroups = 0;
      let validationSamples = 0;

      groups.forEach((group) => {
        const row = document.createElement('div');
        row.className = 'gkf-row';

        const label = document.createElement('div');
        label.className = 'gkf-group-label';
        label.textContent = group.name;
        row.appendChild(label);

        const samples = document.createElement('div');
        samples.className = 'gkf-samples';

        const states = group.samples.map((sample) => {
          const isValidation = mode === 'group'
            ? group.groupFold === fold
            : sample.kfold === fold;
          if (isValidation) validationSamples += 1;
          return isValidation;
        });

        const leaking = states.some(Boolean) && states.some((value) => !value);
        if (leaking) leakingGroups += 1;
        row.classList.toggle('is-leaking', leaking);

        group.samples.forEach((sample, index) => {
          const chip = document.createElement('span');
          const isValidation = states[index];
          chip.className = `gkf-sample ${isValidation ? 'is-validation' : 'is-train'}`;
          chip.textContent = sample.name;
          chip.title = `${group.name} / ${sample.name}: ${isValidation ? 'Validation' : 'Train'}`;
          samples.appendChild(chip);
        });

        row.appendChild(samples);
        grid.appendChild(row);
      });

      modeButtons.forEach((button) => {
        const active = button.dataset.gkfMode === mode;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });

      foldButtons.forEach((button) => {
        const active = Number(button.dataset.gkfFold) === fold;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });

      status.textContent = leakingGroups === 0
        ? `group leakage: 0 / ${groups.length}`
        : `group leakage: ${leakingGroups} / ${groups.length}`;
      status.dataset.state = leakingGroups === 0 ? 'safe' : 'danger';

      explanation.textContent = mode === 'group'
        ? `Fold ${fold}: Validationに入ったpatientは丸ごと分離され、同じpatientのsampleはTrain側に残りません。`
        : `Fold ${fold}: sample単位で分けるため、${leakingGroups}個のpatientがTrainとValidationの両方にまたがっています。`;

      root.dataset.validationSamples = String(validationSamples);
    };

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.gkfMode;
        render();
      });
    });

    foldButtons.forEach((button) => {
      button.addEventListener('click', () => {
        fold = Number(button.dataset.gkfFold);
        render();
      });
    });

    render();
  });

  register('kfold-basic', (root) => {
    const samples = Array.from({ length: 15 }, (_, index) => ({ name: `S${index + 1}`, fold: (index % 5) + 1 }));
    let fold = 1;
    const grid = root.querySelector('[data-kfold-grid]');
    const status = root.querySelector('[data-kfold-status]');
    const explanation = root.querySelector('[data-kfold-explanation]');
    const buttons = [...root.querySelectorAll('[data-kfold-fold]')];

    const render = () => {
      grid.replaceChildren();
      samples.forEach((sample) => {
        const chip = document.createElement('span');
        const validation = sample.fold === fold;
        chip.className = `sample-chip ${validation ? 'is-validation' : 'is-train'}`;
        chip.textContent = sample.name;
        chip.title = `${sample.name}: ${validation ? 'Validation' : 'Train'}`;
        grid.appendChild(chip);
      });
      buttons.forEach((button) => {
        const active = Number(button.dataset.kfoldFold) === fold;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      status.textContent = `Fold ${fold} / Train 12 / Validation 3`;
      status.dataset.state = 'safe';
      explanation.textContent = `Fold ${fold}では3 sampleだけをValidationにし、残り12 sampleで学習します。foldを切り替えると、全sampleが1回ずつValidationになります。`;
    };

    buttons.forEach((button) => button.addEventListener('click', () => { fold = Number(button.dataset.kfoldFold); render(); }));
    render();
  });

  register('leakage-pipeline', (root) => {
    let mode = 'safe';
    const buttons = [...root.querySelectorAll('[data-leak-mode]')];
    const status = root.querySelector('[data-leak-status]');
    const explanation = root.querySelector('[data-leak-explanation]');
    const stages = [...root.querySelectorAll('[data-leak-stage]')];
    const safeLabels = ['Raw data', 'Split', 'Train fold', 'Trainだけでfit', 'Validationをtransform', 'Validation予測'];
    const leakyLabels = ['Raw data', '全データでfit', 'Split', 'Train fold', 'Validation fold', 'Validation予測'];

    const render = () => {
      const labels = mode === 'safe' ? safeLabels : leakyLabels;
      stages.forEach((stage, index) => {
        stage.textContent = labels[index];
        stage.classList.toggle('is-danger', mode === 'leaky' && index === 1);
      });
      buttons.forEach((button) => {
        const active = button.dataset.leakMode === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      status.textContent = mode === 'safe' ? 'Leakageなし' : 'Validation情報が混入';
      status.dataset.state = mode === 'safe' ? 'safe' : 'danger';
      explanation.textContent = mode === 'safe'
        ? '先にsplitし、標準化・欠損補完・特徴選択などのfitはTrain foldだけで行います。'
        : 'split前に全データでfitすると、Validationの分布やtarget由来情報がTrain側の処理へ混ざる可能性があります。';
    };

    buttons.forEach((button) => button.addEventListener('click', () => { mode = button.dataset.leakMode; render(); }));
    render();
  });

  register('adversarial-shift', (root) => {
    const input = root.querySelector('[data-av-shift]');
    const trainLayer = root.querySelector('[data-av-train]');
    const testLayer = root.querySelector('[data-av-test]');
    const status = root.querySelector('[data-av-status]');
    const explanation = root.querySelector('[data-av-explanation]');
    const train = [18, 24, 29, 34, 39, 43, 48, 53];
    const testBase = [20, 25, 31, 36, 40, 45, 50, 55];

    const draw = (layer, values, className) => {
      layer.replaceChildren();
      values.forEach((value) => {
        const dot = document.createElement('span');
        dot.className = `distribution-dot ${className}`;
        dot.style.left = `${clamp(value, 4, 96)}%`;
        layer.appendChild(dot);
      });
    };

    const render = () => {
      const shift = Number(input.value);
      draw(trainLayer, train, 'is-train');
      draw(testLayer, testBase.map((value) => value + shift * 0.42), 'is-test');
      let label = '見分けにくい';
      let state = 'safe';
      if (shift >= 35) { label = '分布差が目立つ'; state = 'danger'; }
      else if (shift >= 15) label = '少し見分けやすい';
      status.textContent = `${label} / shift ${shift}`;
      status.dataset.state = state;
      explanation.textContent = shift < 15
        ? 'TrainとTestの模式分布が近く、識別器は特徴だけでは見分けにくい状態です。'
        : 'TrainとTestの模式分布が離れています。実データではAUCだけで結論を出さず、どの特徴が差を作っているか確認します。';
    };
    input.addEventListener('input', render);
    render();
  });

  register('target-encoding', (root) => {
    const rows = [
      { category: 'A', target: 1 }, { category: 'A', target: 0 },
      { category: 'B', target: 1 }, { category: 'A', target: 1 }
    ];
    let mode = 'safe';
    let rowIndex = 0;
    const modeButtons = [...root.querySelectorAll('[data-te-mode]')];
    const rowButtons = [...root.querySelectorAll('[data-te-row]')];
    const status = root.querySelector('[data-te-status]');
    const value = root.querySelector('[data-te-value]');
    const formula = root.querySelector('[data-te-formula]');
    const explanation = root.querySelector('[data-te-explanation]');

    const render = () => {
      const row = rows[rowIndex];
      const candidates = rows.filter((candidate, index) => candidate.category === row.category && (mode === 'leaky' || index !== rowIndex));
      const numerator = candidates.reduce((sum, candidate) => sum + candidate.target, 0);
      const denominator = candidates.length;
      const te = denominator ? numerator / denominator : 0.5;
      modeButtons.forEach((button) => {
        const active = button.dataset.teMode === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      rowButtons.forEach((button) => {
        const index = Number(button.dataset.teRow);
        const active = index === rowIndex;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
        button.textContent = `Row ${index + 1}: ${rows[index].category} / y=${rows[index].target}`;
      });
      value.textContent = fmt(te, 2);
      formula.textContent = denominator ? `${numerator} / ${denominator}` : 'fallback = 0.50';
      status.textContent = mode === 'safe' ? '自己targetを除外' : '自己targetを含む';
      status.dataset.state = mode === 'safe' ? 'safe' : 'danger';
      explanation.textContent = mode === 'safe'
        ? `Row ${rowIndex + 1}のtargetは、この行のTarget Encoding計算には入りません。`
        : `Row ${rowIndex + 1}自身のtarget=${row.target}が統計へ入っています。CVではこの自己参照がLeakageになります。`;
    };
    modeButtons.forEach((button) => button.addEventListener('click', () => { mode = button.dataset.teMode; render(); }));
    rowButtons.forEach((button) => button.addEventListener('click', () => { rowIndex = Number(button.dataset.teRow); render(); }));
    render();
  });

  register('pseudo-label-threshold', (root) => {
    const samples = [
      { name: 'U1', confidence: 0.98, correct: true }, { name: 'U2', confidence: 0.96, correct: true },
      { name: 'U3', confidence: 0.93, correct: true }, { name: 'U4', confidence: 0.89, correct: false },
      { name: 'U5', confidence: 0.84, correct: true }, { name: 'U6', confidence: 0.79, correct: false },
      { name: 'U7', confidence: 0.72, correct: true }, { name: 'U8', confidence: 0.65, correct: false }
    ];
    const input = root.querySelector('[data-pl-threshold]');
    const grid = root.querySelector('[data-pl-grid]');
    const status = root.querySelector('[data-pl-status]');
    const explanation = root.querySelector('[data-pl-explanation]');

    const render = () => {
      const threshold = Number(input.value) / 100;
      const selected = samples.filter((sample) => sample.confidence >= threshold);
      const mistakes = selected.filter((sample) => !sample.correct).length;
      grid.replaceChildren();
      samples.forEach((sample) => {
        const chip = document.createElement('span');
        const active = sample.confidence >= threshold;
        chip.className = `sample-chip ${active ? (sample.correct ? 'is-validation' : 'is-danger') : 'is-muted'}`;
        chip.textContent = `${sample.name} ${Math.round(sample.confidence * 100)}%`;
        chip.title = active ? `${sample.name}: pseudo labelに採用 / 模式上は${sample.correct ? '正しい' : '誤り'}` : `${sample.name}: threshold未満で除外`;
        grid.appendChild(chip);
      });
      status.textContent = `threshold ${Math.round(threshold * 100)}% / 採用 ${selected.length} / 誤り ${mistakes}`;
      status.dataset.state = mistakes === 0 ? 'safe' : 'danger';
      explanation.textContent = selected.length === 0
        ? 'thresholdが高すぎてpseudo labelを1件も使えません。'
        : 'thresholdを上げると採用数は減ります。この模式例では高confidence側ほど誤りが減りますが、実データで同じとは限らないためOOFで検証します。';
    };
    input.addEventListener('input', render);
    render();
  });

  register('tta-average', (root) => {
    const transforms = [
      { key: 'original', label: 'Original', prediction: 0.68 }, { key: 'hflip', label: 'HFlip', prediction: 0.74 },
      { key: 'vflip', label: 'VFlip', prediction: 0.70 }, { key: 'rotate', label: 'Rotate90', prediction: 0.61 }
    ];
    const checkboxes = [...root.querySelectorAll('[data-tta-transform]')];
    const taskButtons = [...root.querySelectorAll('[data-tta-task]')];
    const rows = root.querySelector('[data-tta-rows]');
    const meanNode = root.querySelector('[data-tta-mean]');
    const status = root.querySelector('[data-tta-status]');
    const explanation = root.querySelector('[data-tta-explanation]');
    let task = 'invariant';

    const render = () => {
      const selectedKeys = new Set(checkboxes.filter((box) => box.checked).map((box) => box.value));
      if (selectedKeys.size === 0) { checkboxes[0].checked = true; selectedKeys.add(checkboxes[0].value); }
      const selected = transforms.filter((transform) => selectedKeys.has(transform.key));
      rows.replaceChildren();
      transforms.forEach((transform) => {
        const row = document.createElement('div');
        row.className = `interactive-list-row ${selectedKeys.has(transform.key) ? '' : 'is-muted'}`;
        const label = document.createElement('span'); label.textContent = transform.label;
        const value = document.createElement('strong'); value.textContent = fmt(transform.prediction, 2);
        row.append(label, value); rows.appendChild(row);
      });
      taskButtons.forEach((button) => {
        const active = button.dataset.ttaTask === task;
        button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
      });
      const unsafeFlip = task === 'directional' && (selectedKeys.has('hflip') || selectedKeys.has('vflip'));
      meanNode.textContent = fmt(mean(selected.map((transform) => transform.prediction)), 3);
      status.textContent = unsafeFlip ? '意味を変える変換を含む' : `${selected.length} predictionを平均`;
      status.dataset.state = unsafeFlip ? 'danger' : 'safe';
      explanation.textContent = unsafeFlip
        ? '左右・上下に意味があるtaskではflipでlabel semanticsが変わる可能性があります。TTAは「妥当な変換」だけに限定します。'
        : '複数の妥当な変換で予測し、元座標・同じ出力空間へ戻して平均します。数値は理解用の模式例です。';
    };
    checkboxes.forEach((box) => box.addEventListener('change', render));
    taskButtons.forEach((button) => button.addEventListener('click', () => { task = button.dataset.ttaTask; render(); }));
    render();
  });

  register('stacking-oof', (root) => {
    let mode = 'oof';
    const buttons = [...root.querySelectorAll('[data-stack-mode]')];
    const status = root.querySelector('[data-stack-status]');
    const explanation = root.querySelector('[data-stack-explanation]');
    const rows = root.querySelector('[data-stack-rows]');
    const data = [
      { y: 1, oofA: 0.74, oofB: 0.61, trainA: 0.99, trainB: 0.97 },
      { y: 0, oofA: 0.35, oofB: 0.28, trainA: 0.01, trainB: 0.03 },
      { y: 1, oofA: 0.58, oofB: 0.71, trainA: 0.98, trainB: 0.96 },
      { y: 0, oofA: 0.46, oofB: 0.32, trainA: 0.02, trainB: 0.04 }
    ];
    const render = () => {
      buttons.forEach((button) => {
        const active = button.dataset.stackMode === mode;
        button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
      });
      rows.replaceChildren();
      data.forEach((rowData, index) => {
        const row = document.createElement('div'); row.className = 'interactive-list-row';
        const label = document.createElement('span'); label.textContent = `Row ${index + 1} / y=${rowData.y}`;
        const values = document.createElement('strong');
        values.textContent = mode === 'oof' ? `A ${fmt(rowData.oofA)} / B ${fmt(rowData.oofB)}` : `A ${fmt(rowData.trainA)} / B ${fmt(rowData.trainB)}`;
        row.append(label, values); rows.appendChild(row);
      });
      status.textContent = mode === 'oof' ? 'Meta model用に安全' : 'Leakage risk';
      status.dataset.state = mode === 'oof' ? 'safe' : 'danger';
      explanation.textContent = mode === 'oof'
        ? '各rowは、そのrowを学習していないfoldモデルの予測をMeta modelへ渡します。'
        : '自分を学習したBase modelの予測はtargetに近すぎます。Meta modelが本番で再現できない関係を学ぶ典型的なLeakageです。';
    };
    buttons.forEach((button) => button.addEventListener('click', () => { mode = button.dataset.stackMode; render(); }));
    render();
  });

  register('f1-threshold', (root) => {
    const data = [
      { p: 0.92, y: 1 }, { p: 0.84, y: 1 }, { p: 0.77, y: 0 }, { p: 0.69, y: 1 }, { p: 0.62, y: 0 },
      { p: 0.56, y: 1 }, { p: 0.43, y: 0 }, { p: 0.37, y: 1 }, { p: 0.25, y: 0 }, { p: 0.12, y: 0 }
    ];
    const input = root.querySelector('[data-f1-threshold]');
    const grid = root.querySelector('[data-f1-grid]');
    const status = root.querySelector('[data-f1-status]');
    const precisionNode = root.querySelector('[data-f1-precision]');
    const recallNode = root.querySelector('[data-f1-recall]');
    const f1Node = root.querySelector('[data-f1-score]');
    const explanation = root.querySelector('[data-f1-explanation]');
    const render = () => {
      const threshold = Number(input.value) / 100;
      let tp = 0; let fp = 0; let fn = 0; let tn = 0;
      grid.replaceChildren();
      data.forEach((sample, index) => {
        const positive = sample.p >= threshold;
        if (positive && sample.y === 1) tp += 1; else if (positive) fp += 1; else if (sample.y === 1) fn += 1; else tn += 1;
        const chip = document.createElement('span');
        let state = 'is-muted'; if (positive && sample.y === 1) state = 'is-validation'; else if (positive && sample.y === 0) state = 'is-danger';
        chip.className = `sample-chip ${state}`; chip.textContent = `${index + 1}: ${Math.round(sample.p * 100)}% / y=${sample.y}`; grid.appendChild(chip);
      });
      const precision = tp + fp ? tp / (tp + fp) : 0;
      const recall = tp + fn ? tp / (tp + fn) : 0;
      const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
      precisionNode.textContent = fmt(precision, 2); recallNode.textContent = fmt(recall, 2); f1Node.textContent = fmt(f1, 2);
      status.textContent = `threshold ${Math.round(threshold * 100)}% / TP ${tp} FP ${fp} FN ${fn} TN ${tn}`; status.dataset.state = 'safe';
      explanation.textContent = 'thresholdを下げるとpositive判定が増え、Recallは上がりやすくPrecisionは下がりやすくなります。模式データで関係を確認できます。';
    };
    input.addEventListener('input', render); render();
  });

  register('metric-outlier', (root) => {
    const input = root.querySelector('[data-outlier-error]');
    const status = root.querySelector('[data-outlier-status]');
    const maeNode = root.querySelector('[data-outlier-mae]');
    const rmseNode = root.querySelector('[data-outlier-rmse]');
    const bars = root.querySelector('[data-outlier-bars]');
    const explanation = root.querySelector('[data-outlier-explanation]');
    const render = () => {
      const outlier = Number(input.value); const errors = [1, 2, 1, 2, outlier];
      const mae = mean(errors.map(Math.abs)); const rmse = Math.sqrt(mean(errors.map((value) => value * value)));
      maeNode.textContent = fmt(mae, 2); rmseNode.textContent = fmt(rmse, 2);
      status.textContent = `最大誤差 ${outlier}`; status.dataset.state = outlier >= 10 ? 'danger' : 'safe';
      bars.replaceChildren();
      errors.forEach((error, index) => {
        const row = document.createElement('div'); row.className = 'bar-row';
        const label = document.createElement('span'); label.textContent = `e${index + 1}`;
        const track = document.createElement('span'); track.className = 'bar-track';
        const fill = document.createElement('span'); fill.className = 'bar-fill'; fill.style.width = `${clamp((error / 20) * 100, 0, 100)}%`; track.appendChild(fill);
        const value = document.createElement('strong'); value.textContent = String(error); row.append(label, track, value); bars.appendChild(row);
      });
      explanation.textContent = `同じ誤差列でも、外れ誤差が大きくなるほどRMSE ${fmt(rmse)}はMAE ${fmt(mae)}より速く増えます。`;
    };
    input.addEventListener('input', render); render();
  });

  register('blend-weight', (root) => {
    const truth = [0.10, 0.35, 0.60, 0.80, 0.95];
    const modelA = [0.12, 0.44, 0.55, 0.77, 0.88];
    const modelB = [0.24, 0.30, 0.68, 0.71, 0.98];
    const input = root.querySelector('[data-blend-weight]');
    const status = root.querySelector('[data-blend-status]');
    const score = root.querySelector('[data-blend-rmse]');
    const rows = root.querySelector('[data-blend-rows]');
    const explanation = root.querySelector('[data-blend-explanation]');
    const rmse = (pred) => Math.sqrt(mean(pred.map((value, index) => { const error = value - truth[index]; return error * error; })));
    const render = () => {
      const weight = Number(input.value) / 100;
      const blended = modelA.map((value, index) => weight * value + (1 - weight) * modelB[index]);
      rows.replaceChildren();
      blended.forEach((value, index) => {
        const row = document.createElement('div'); row.className = 'interactive-list-row';
        const label = document.createElement('span'); label.textContent = `Row ${index + 1} / y=${fmt(truth[index])}`;
        const prediction = document.createElement('strong'); prediction.textContent = `blend ${fmt(value)} · A ${fmt(modelA[index])} · B ${fmt(modelB[index])}`;
        row.append(label, prediction); rows.appendChild(row);
      });
      score.textContent = fmt(rmse(blended), 3);
      status.textContent = `A ${Math.round(weight * 100)}% / B ${Math.round((1 - weight) * 100)}%`; status.dataset.state = 'safe';
      explanation.textContent = '重みを動かすと各rowの補完関係と全体RMSEが変わります。実際の重み選択は同じfoldのOOF予測だけで行います。';
    };
    input.addEventListener('input', render); render();
  });

  register('calibration-toggle', (root) => {
    const actual = [0.08, 0.26, 0.48, 0.64, 0.72];
    const raw = [0.10, 0.30, 0.50, 0.70, 0.90];
    const calibrated = [0.08, 0.25, 0.48, 0.64, 0.73];
    let mode = 'raw';
    const buttons = [...root.querySelectorAll('[data-cal-mode]')];
    const rows = root.querySelector('[data-cal-rows]');
    const status = root.querySelector('[data-cal-status]');
    const explanation = root.querySelector('[data-cal-explanation]');
    const render = () => {
      const predicted = mode === 'raw' ? raw : calibrated;
      const gap = mean(predicted.map((value, index) => Math.abs(value - actual[index])));
      buttons.forEach((button) => {
        const active = button.dataset.calMode === mode; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
      });
      rows.replaceChildren();
      predicted.forEach((value, index) => {
        const row = document.createElement('div'); row.className = 'calibration-row';
        const label = document.createElement('span'); label.textContent = `Bin ${index + 1}`;
        const track = document.createElement('span'); track.className = 'calibration-track';
        const pred = document.createElement('span'); pred.className = 'calibration-marker is-prediction'; pred.style.left = `${value * 100}%`;
        const obs = document.createElement('span'); obs.className = 'calibration-marker is-observed'; obs.style.left = `${actual[index] * 100}%`; track.append(pred, obs);
        const values = document.createElement('strong'); values.textContent = `予測 ${fmt(value)} / 実測 ${fmt(actual[index])}`; row.append(label, track, values); rows.appendChild(row);
      });
      status.textContent = `平均gap ${fmt(gap, 3)}`; status.dataset.state = mode === 'calibrated' ? 'safe' : 'danger';
      explanation.textContent = mode === 'raw'
        ? '高確率binほど予測が実測率より高く、過信している模式例です。'
        : '単調な補正後は予測確率が実測率へ近づきます。実際のcalibratorはOOFまたは独立setでfitします。';
    };
    buttons.forEach((button) => button.addEventListener('click', () => { mode = button.dataset.calMode; render(); })); render();
  });

  register('dice-iou-overlap', (root) => {
    const input = root.querySelector('[data-mask-shift]');
    const grid = root.querySelector('[data-mask-grid]');
    const diceNode = root.querySelector('[data-mask-dice]');
    const iouNode = root.querySelector('[data-mask-iou]');
    const status = root.querySelector('[data-mask-status]');
    const explanation = root.querySelector('[data-mask-explanation]');
    const groundTruth = new Set();
    for (let row = 1; row <= 3; row += 1) for (let col = 1; col <= 3; col += 1) groundTruth.add(`${row}-${col}`);
    const render = () => {
      const shift = Number(input.value); const prediction = new Set();
      for (let row = 1; row <= 3; row += 1) for (let col = 1; col <= 3; col += 1) { const shifted = col + shift; if (shifted >= 0 && shifted <= 4) prediction.add(`${row}-${shifted}`); }
      let intersection = 0; groundTruth.forEach((key) => { if (prediction.has(key)) intersection += 1; });
      const union = groundTruth.size + prediction.size - intersection;
      const dice = (2 * intersection) / (groundTruth.size + prediction.size); const iou = union ? intersection / union : 1;
      grid.replaceChildren();
      for (let row = 0; row < 5; row += 1) for (let col = 0; col < 5; col += 1) {
        const key = `${row}-${col}`; const cell = document.createElement('span'); const inGt = groundTruth.has(key); const inPred = prediction.has(key); cell.className = 'mask-cell';
        if (inGt && inPred) cell.classList.add('is-both'); else if (inGt) cell.classList.add('is-ground-truth'); else if (inPred) cell.classList.add('is-prediction'); grid.appendChild(cell);
      }
      diceNode.textContent = fmt(dice, 2); iouNode.textContent = fmt(iou, 2);
      status.textContent = `shift ${shift > 0 ? '+' : ''}${shift} / intersection ${intersection}`; status.dataset.state = shift === 0 ? 'safe' : 'danger';
      explanation.textContent = '予測maskを左右へずらすとIntersectionが減り、DiceとIoUの両方が下がります。同じ重なりでもDiceはIoUより高い値になります。';
    };
    input.addEventListener('input', render); render();
  });

  window.KagglectureInteractive = { register, boot };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }
})();

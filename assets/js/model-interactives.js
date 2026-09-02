(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function initConvolution(root) {
    const inputValues = [
      0, 0, 0, 3, 4,
      0, 0, 1, 4, 4,
      0, 1, 3, 4, 4,
      0, 0, 1, 4, 4,
      0, 0, 0, 3, 4
    ];
    const kernel = [
      -1, 0, 1,
      -1, 0, 1,
      -1, 0, 1
    ];
    const inputSize = 5;
    const kernelSize = 3;
    const outputSize = inputSize - kernelSize + 1;

    const inputGrid = root.querySelector('[data-cnn-input-grid]');
    const kernelGrid = root.querySelector('[data-cnn-kernel-grid]');
    const outputGrid = root.querySelector('[data-cnn-output-grid]');
    const slider = root.querySelector('[data-cnn-position]');
    const status = root.querySelector('[data-cnn-status]');
    const equation = root.querySelector('[data-cnn-equation]');
    const prev = root.querySelector('[data-cnn-prev]');
    const next = root.querySelector('[data-cnn-next]');

    if (!inputGrid || !kernelGrid || !outputGrid || !slider || !status || !equation) return;

    const outputValues = Array.from({ length: outputSize * outputSize }, () => 0);
    for (let or = 0; or < outputSize; or += 1) {
      for (let oc = 0; oc < outputSize; oc += 1) {
        let sum = 0;
        for (let kr = 0; kr < kernelSize; kr += 1) {
          for (let kc = 0; kc < kernelSize; kc += 1) {
            const inputIndex = (or + kr) * inputSize + (oc + kc);
            const kernelIndex = kr * kernelSize + kc;
            sum += inputValues[inputIndex] * kernel[kernelIndex];
          }
        }
        outputValues[or * outputSize + oc] = sum;
      }
    }

    const makeCells = (container, values, className) => {
      container.replaceChildren();
      values.forEach((value, index) => {
        const cell = document.createElement('span');
        cell.className = `conv-cell ${className || ''}`.trim();
        cell.textContent = String(value);
        cell.dataset.index = String(index);
        container.appendChild(cell);
      });
    };

    makeCells(inputGrid, inputValues, '');
    makeCells(kernelGrid, kernel, '');
    makeCells(outputGrid, outputValues, '');

    const inputCells = [...inputGrid.querySelectorAll('.conv-cell')];
    const outputCells = [...outputGrid.querySelectorAll('.conv-cell')];

    const render = () => {
      const position = clamp(Number(slider.value), 0, outputSize * outputSize - 1);
      const row = Math.floor(position / outputSize);
      const col = position % outputSize;
      const activeInput = new Set();
      const terms = [];

      for (let kr = 0; kr < kernelSize; kr += 1) {
        for (let kc = 0; kc < kernelSize; kc += 1) {
          const inputIndex = (row + kr) * inputSize + (col + kc);
          const kernelIndex = kr * kernelSize + kc;
          activeInput.add(inputIndex);
          terms.push(`${inputValues[inputIndex]}×${kernel[kernelIndex]}`);
        }
      }

      inputCells.forEach((cell, index) => cell.classList.toggle('is-receptive', activeInput.has(index)));
      outputCells.forEach((cell, index) => cell.classList.toggle('is-output-active', index === position));

      const value = outputValues[position];
      status.textContent = `位置 (${row + 1}, ${col + 1}) → 出力 ${value}`;
      status.dataset.state = 'safe';
      equation.textContent = `${terms.join(' + ')} = ${value}`;

      if (prev) prev.disabled = position === 0;
      if (next) next.disabled = position === outputSize * outputSize - 1;
    };

    slider.addEventListener('input', render);
    if (prev) prev.addEventListener('click', () => { slider.value = String(clamp(Number(slider.value) - 1, 0, 8)); render(); });
    if (next) next.addEventListener('click', () => { slider.value = String(clamp(Number(slider.value) + 1, 0, 8)); render(); });
    render();
  }

  function initVitAttention(root) {
    const patchGrid = root.querySelector('[data-vit-patches]');
    const slider = root.querySelector('[data-vit-query]');
    const status = root.querySelector('[data-vit-status]');
    const bars = root.querySelector('[data-vit-bars]');
    const explanation = root.querySelector('[data-vit-explanation]');
    if (!patchGrid || !slider || !status || !bars || !explanation) return;

    const patchCount = 16;
    const coords = Array.from({ length: patchCount }, (_, index) => ({ row: Math.floor(index / 4), col: index % 4 }));

    patchGrid.replaceChildren();
    const patches = Array.from({ length: patchCount }, (_, index) => {
      const patch = document.createElement('button');
      patch.type = 'button';
      patch.className = 'vit-patch';
      patch.textContent = `P${index + 1}`;
      patch.setAttribute('aria-label', `Query patch P${index + 1}を選択`);
      patch.addEventListener('click', () => { slider.value = String(index + 1); render(); });
      patchGrid.appendChild(patch);
      return patch;
    });

    const weightsFor = (query) => {
      const q = coords[query];
      const raw = coords.map((coord, index) => {
        const distance = Math.abs(coord.row - q.row) + Math.abs(coord.col - q.col);
        let value = 0.42 / (1 + distance);
        if (coord.row === q.row) value += 0.18;
        if (coord.col === q.col) value += 0.12;
        if ((index + query) % 7 === 0 && index !== query) value += 0.34;
        if (index === query) value += 0.28;
        return value;
      });
      const total = raw.reduce((sum, value) => sum + value, 0);
      return raw.map((value) => value / total);
    };

    function render() {
      const query = clamp(Number(slider.value) - 1, 0, patchCount - 1);
      const weights = weightsFor(query);
      const ranked = weights
        .map((weight, index) => ({ weight, index }))
        .sort((a, b) => b.weight - a.weight);

      patches.forEach((patch, index) => {
        const weight = weights[index];
        patch.classList.toggle('is-query', index === query);
        patch.style.opacity = String(0.42 + Math.min(weight * 4.2, 0.58));
        patch.style.boxShadow = index === query ? '' : `0 0 0 ${Math.max(1, Math.round(weight * 10))}px color-mix(in srgb, var(--text-secondary) 10%, transparent)`;
        patch.title = `P${index + 1}: attention ${Math.round(weight * 100)}%（模式値）`;
      });

      bars.replaceChildren();
      ranked.slice(0, 6).forEach(({ weight, index }) => {
        const row = document.createElement('div');
        row.className = `vit-attention-row ${index === query ? 'is-query' : ''}`;
        const label = document.createElement('span');
        label.textContent = `P${index + 1}`;
        const track = document.createElement('span');
        track.className = 'vit-attention-track';
        const fill = document.createElement('span');
        fill.className = 'vit-attention-fill';
        fill.style.width = `${Math.min(100, weight * 420)}%`;
        track.appendChild(fill);
        const value = document.createElement('strong');
        value.textContent = `${Math.round(weight * 100)}%`;
        row.append(label, track, value);
        bars.appendChild(row);
      });

      const strongestOther = ranked.find((item) => item.index !== query) || ranked[0];
      status.textContent = `Query P${query + 1} / 強い参照 P${strongestOther.index + 1}`;
      status.dataset.state = 'safe';
      explanation.textContent = `P${query + 1}をQuery tokenとして見る模式例です。近いpatchだけでなく離れたP${strongestOther.index + 1}にも重みを置けるため、self-attentionは画像内のglobalな関係を直接扱えます。実際のattention weightではありません。`;
    }

    slider.addEventListener('input', render);
    render();
  }

  function boot(scope = document) {
    scope.querySelectorAll('[data-model-interactive]').forEach((root) => {
      if (root.dataset.modelInteractiveReady === 'true') return;
      const type = root.dataset.modelInteractive;
      root.dataset.modelInteractiveReady = 'true';
      if (type === 'cnn-convolution') initConvolution(root);
      if (type === 'vit-attention') initVitAttention(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }
})();

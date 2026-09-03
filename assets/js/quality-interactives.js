(() => {
  if (!window.KagglectureInteractive) return;

  const { register } = window.KagglectureInteractive;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const fmt = (value, digits = 3) => Number(value).toFixed(digits);

  register('logloss-confidence', (root) => {
    const input = root.querySelector('[data-logloss-probability]');
    const probabilityNode = root.querySelector('[data-logloss-prob]');
    const lossNode = root.querySelector('[data-logloss-value]');
    const hardNode = root.querySelector('[data-logloss-hard]');
    const status = root.querySelector('[data-logloss-status]');
    const bar = root.querySelector('[data-logloss-bar]');
    const explanation = root.querySelector('[data-logloss-explanation]');

    const render = () => {
      const p = clamp(Number(input.value) / 100, 0.01, 0.99);
      const loss = -Math.log(p);
      const correct = p >= 0.5;

      probabilityNode.textContent = p.toFixed(2);
      lossNode.textContent = fmt(loss);
      hardNode.textContent = correct ? '正解' : '誤答';
      status.textContent = `Positive ${Math.round(p * 100)}%`;
      status.dataset.state = p >= 0.8 ? 'safe' : (p >= 0.5 ? 'neutral' : 'danger');

      bar.replaceChildren();
      const row = document.createElement('div');
      row.className = 'bar-row';
      const label = document.createElement('span');
      label.textContent = 'LogLoss';
      const track = document.createElement('span');
      track.className = 'bar-track';
      const fill = document.createElement('span');
      fill.className = 'bar-fill';
      fill.style.width = `${clamp((loss / 4.605) * 100, 1, 100)}%`;
      const value = document.createElement('strong');
      value.textContent = fmt(loss);
      track.appendChild(fill);
      row.append(label, track, value);
      bar.appendChild(row);

      if (p >= 0.8) {
        explanation.textContent = '正解へ高い確率を出しているのでLossは小さい状態です。';
      } else if (p >= 0.5) {
        explanation.textContent = '0.5でlabel化すれば正解ですが、確率としては迷っているためLogLossはまだ大きめです。';
      } else if (p >= 0.2) {
        explanation.textContent = '正解と逆側へ予測しているため誤答です。確信が強くなるほどLossは急に大きくなります。';
      } else {
        explanation.textContent = '正解Positiveを強く否定する「自信を持った誤答」です。LogLossが最も強く罰する状態です。';
      }
    };

    input.addEventListener('input', render);
    render();
  });
})();

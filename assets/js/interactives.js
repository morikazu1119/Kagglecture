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

  window.KagglectureInteractive = { register, boot };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }
})();

(() => {
  const TABLE_SELECTOR = '.content-shell table';
  const VISUAL_SELECTOR = '.interactive-viz, .static-viz, .html-chart, .html-diagram, .html-table-wrap, .model-architecture';

  function enhanceTable(table) {
    table.classList.add('html-table');

    let wrapper = table.parentElement;
    if (!wrapper || !wrapper.classList.contains('html-table-wrap')) {
      wrapper = document.createElement('div');
      wrapper.className = 'html-table-wrap is-auto-enhanced';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

    const updateOverflow = () => {
      const scrollable = wrapper.scrollWidth > wrapper.clientWidth + 1;
      wrapper.classList.toggle('needs-horizontal-scroll', scrollable);
      if (scrollable) {
        wrapper.tabIndex = 0;
        if (!wrapper.getAttribute('aria-label')) {
          wrapper.setAttribute('aria-label', '横方向にスクロールできる表');
        }
      } else {
        wrapper.removeAttribute('tabindex');
      }
    };

    updateOverflow();
    return { wrapper, updateOverflow };
  }

  function audit(scope = document) {
    const issues = [];
    const rootWidth = document.documentElement.clientWidth;

    scope.querySelectorAll(VISUAL_SELECTOR).forEach((node) => {
      node.classList.remove('layout-audit-warning');
      const rect = node.getBoundingClientRect();
      const pageOverflow = rect.left < -1 || rect.right > rootWidth + 1;
      const internalOverflow = node.scrollWidth > node.clientWidth + 2;
      const allowedInternalOverflow = node.classList.contains('html-table-wrap') || node.classList.contains('needs-horizontal-scroll');

      if (pageOverflow || (internalOverflow && !allowedInternalOverflow)) {
        node.classList.add('layout-audit-warning');
        issues.push({
          type: pageOverflow ? 'page-overflow' : 'unhandled-internal-overflow',
          className: node.className,
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          left: rect.left,
          right: rect.right,
          viewport: rootWidth
        });
      }
    });

    return issues;
  }

  function boot() {
    const tableEnhancements = [...document.querySelectorAll(TABLE_SELECTOR)].map(enhanceTable);

    const run = () => {
      tableEnhancements.forEach(({ updateOverflow }) => updateOverflow());
      window.KagglectureLayout.lastAudit = audit();
    };

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(run);
      observer.observe(document.documentElement);
      document.querySelectorAll(VISUAL_SELECTOR).forEach((node) => observer.observe(node));
      window.KagglectureLayout.resizeObserver = observer;
    } else {
      window.addEventListener('resize', run, { passive: true });
    }

    requestAnimationFrame(run);
  }

  window.KagglectureLayout = { audit, lastAudit: [] };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

(() => {
  const scripts = new Map();
  const styles = new Map();

  function loadScript(src, globalName) {
    if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
    if (scripts.has(src)) return scripts.get(src);

    const promise = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = () => resolve(globalName ? window[globalName] : true);
      el.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(el);
    });

    scripts.set(src, promise);
    return promise;
  }

  function loadStyle(href) {
    if (styles.has(href)) return styles.get(href);

    const promise = new Promise((resolve, reject) => {
      const el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      el.onload = () => resolve(true);
      el.onerror = () => reject(new Error(`Failed to load ${href}`));
      document.head.appendChild(el);
    });

    styles.set(href, promise);
    return promise;
  }

  const viz = {
    chartjs() {
      return loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js', 'Chart');
    },

    plotly() {
      return loadScript('https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js', 'Plotly');
    },

    async vega() {
      await loadScript('https://cdn.jsdelivr.net/npm/vega@5.30.0/build/vega.min.js', 'vega');
      await loadScript('https://cdn.jsdelivr.net/npm/vega-lite@5.20.1/build/vega-lite.min.js', 'vegaLite');
      return loadScript('https://cdn.jsdelivr.net/npm/vega-embed@6.26.0/build/vega-embed.min.js', 'vegaEmbed');
    },

    d3() {
      return loadScript('https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', 'd3');
    },

    async leaflet() {
      await loadStyle('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css');
      return loadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js', 'L');
    }
  };

  window.KagglectureViz = viz;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-viz="chartjs"]')) viz.chartjs();
    if (document.querySelector('[data-viz="plotly"]')) viz.plotly();
    if (document.querySelector('[data-viz="vega"], [data-viz="vega-lite"]')) viz.vega();
    if (document.querySelector('[data-viz="d3"]')) viz.d3();
    if (document.querySelector('[data-viz="leaflet"]')) viz.leaflet();
  });
})();

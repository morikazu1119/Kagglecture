import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SITE_DIR = path.resolve(process.env.SITE_DIR || '_site');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const viewports = [
  { name: 'mobile-320', width: 320, height: 720 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
];

function walkHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function toUrl(file) {
  const rel = path.relative(SITE_DIR, file).split(path.sep).join('/');
  if (rel === 'index.html') return `${BASE_URL}/`;
  if (rel.endsWith('/index.html')) return `${BASE_URL}/${rel.slice(0, -'index.html'.length)}`;
  return `${BASE_URL}/${rel}`;
}

const browser = await chromium.launch({ headless: true });
const failures = [];
const pages = walkHtml(SITE_DIR).sort();

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();

  for (const file of pages) {
    const url = toUrl(file);
    const consoleErrors = [];
    page.removeAllListeners('console');
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    const result = await page.evaluate(({ width }) => {
      const tolerance = 2;
      const doc = document.documentElement;
      const body = document.body;
      const issues = [];
      const pageOverflow = Math.max(doc.scrollWidth, body?.scrollWidth || 0) - doc.clientWidth;
      if (pageOverflow > tolerance) {
        issues.push({ type: 'page-horizontal-overflow', detail: `${pageOverflow}px` });
      }

      const intendedScroll = (el) => Boolean(el.closest('.html-table-wrap, .matrix-scroll, [data-allow-horizontal-scroll="true"]'));
      const selectors = [
        '.static-viz', '.html-chart', '.html-diagram', '.interactive-viz', '.model-architecture',
        '.comparison-board', '.html-flow', '.layer-scene', '.model-stage-row', '.residual-architecture',
        '.transformer-encoder', '.conv-board', '.vit-operation-board', '.tree-ensemble', '.sample-visual-pair',
        '.flow-strip', '.distribution-board', '.calibration-list', '.mask-layout', '.gkf-grid',
        'svg', 'canvas', 'img', 'video', 'iframe', 'pre'
      ].join(',');

      for (const el of document.querySelectorAll(selectors)) {
        if (intendedScroll(el)) continue;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (rect.width > width + tolerance || rect.right > width + tolerance || rect.left < -tolerance) {
          issues.push({
            type: 'element-outside-viewport',
            tag: el.tagName.toLowerCase(),
            cls: el.className?.baseVal ?? el.className ?? '',
            detail: `left=${rect.left.toFixed(1)} right=${rect.right.toFixed(1)} width=${rect.width.toFixed(1)} overflowX=${style.overflowX}`
          });
        }
      }

      const figureSelectors = '.static-viz, .html-chart, .html-diagram, .interactive-viz, .model-architecture';
      for (const figure of document.querySelectorAll(figureSelectors)) {
        const fr = figure.getBoundingClientRect();
        const style = getComputedStyle(figure);
        if (style.overflowX !== 'hidden' && style.overflowX !== 'clip') continue;
        for (const child of figure.querySelectorAll('svg, canvas, .html-flow, .layer-scene, .model-stage-row, .residual-architecture, .transformer-encoder, .conv-board, .vit-operation-board, .tree-ensemble, .sample-visual-pair, .flow-strip, .mask-layout')) {
          if (intendedScroll(child)) continue;
          const cr = child.getBoundingClientRect();
          if (cr.left < fr.left - tolerance || cr.right > fr.right + tolerance) {
            issues.push({
              type: 'clipped-visual-child',
              tag: child.tagName.toLowerCase(),
              cls: child.className?.baseVal ?? child.className ?? '',
              detail: `child=[${cr.left.toFixed(1)},${cr.right.toFixed(1)}] figure=[${fr.left.toFixed(1)},${fr.right.toFixed(1)}]`
            });
          }
        }
      }

      // Check the actual text-bearing elements, not connector containers such as
      // .model-stage / .flow-node whose ::before/::after arrows intentionally extend
      // beyond the box and are included in scrollWidth by Chromium.
      const textElements = [
        '.flow-node strong', '.flow-node span',
        '.layer-block strong', '.layer-block span',
        '.comparison-card dt', '.comparison-card dd',
        '.metric-card span', '.metric-card strong',
        '.model-stage__label', '.model-stage__note',
        '.transformer-block', '.tree-node',
        '.sample-tile strong', '.sample-tile span',
        '.interactive-button', '.interactive-status',
        '.viz-badge', '.model-architecture__badge'
      ].join(',');

      for (const el of document.querySelectorAll(textElements)) {
        if (intendedScroll(el)) continue;
        if (el.scrollWidth > el.clientWidth + tolerance) {
          issues.push({
            type: 'text-horizontal-overflow',
            tag: el.tagName.toLowerCase(),
            cls: el.className ?? '',
            detail: `scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth}`
          });
        }
      }

      for (const svg of document.querySelectorAll('svg')) {
        if (svg.closest('mjx-container')) continue;
        const hasViewBox = Boolean(svg.getAttribute('viewBox'));
        const hasDimensions = Boolean(svg.getAttribute('width') || svg.getAttribute('height'));
        if (!hasViewBox && hasDimensions) {
          issues.push({
            type: 'svg-missing-viewbox',
            tag: 'svg',
            cls: svg.className?.baseVal ?? '',
            detail: `width=${svg.getAttribute('width') || ''} height=${svg.getAttribute('height') || ''}`
          });
        }
      }

      return { issues, viewportWidth: doc.clientWidth, scrollWidth: Math.max(doc.scrollWidth, body?.scrollWidth || 0) };
    }, { width: viewport.width });

    if (result.issues.length || consoleErrors.length) {
      failures.push({ viewport: viewport.name, url, issues: result.issues, consoleErrors });
      console.log(`FAIL ${viewport.name} ${url}`);
      for (const issue of result.issues) console.log(`  ${issue.type}: ${issue.tag || ''}.${issue.cls || ''} ${issue.detail}`);
      for (const err of consoleErrors) console.log(`  console-error: ${err}`);
    } else {
      console.log(`PASS ${viewport.name} ${url}`);
    }
  }

  await context.close();
}

await browser.close();
console.log(`Checked ${pages.length} pages × ${viewports.length} viewports = ${pages.length * viewports.length} renderings.`);
if (failures.length) {
  fs.writeFileSync('responsive-audit-failures.json', JSON.stringify(failures, null, 2));
  console.error(`Responsive audit failed on ${failures.length} page/viewport combinations.`);
  process.exit(1);
}
console.log('Responsive audit passed with no detected horizontal overflow, clipped visual structures, or visual text overflow.');

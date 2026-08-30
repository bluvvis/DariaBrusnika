import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const js = readFileSync(join(root, 'script.js'), 'utf8');

const errors = [];

function fail(msg) {
  errors.push(msg);
}

// No duplicate TOC nav in hero
if (html.includes('class="toc"') || html.includes('aria-label="Содержание"')) {
  fail('Hero TOC navigation should be removed');
}

// Guest list photo only in gallery strip
const guestMatches = html.match(/Работа_с_гест-листом/g) ?? [];
if (guestMatches.length !== 1) {
  fail(`Guest list photo should appear once in gallery, found ${guestMatches.length}`);
}
if (html.includes('case-photo')) {
  fail('Guest list photo should not remain in cases section');
}

// Wheel center must not use broken inset: 50%
if (/\.wheel-center[\s\S]*?inset:\s*50%/.test(css)) {
  fail('.wheel-center must not use inset: 50% (breaks centering)');
}
if (!/\.wheel-center[\s\S]*?top:\s*50%/.test(css) || !/\.wheel-center[\s\S]*?left:\s*50%/.test(css)) {
  fail('.wheel-center must use top/left 50% with translate');
}

// No настойчивость in wheel skills
if (/label:\s*['"]Настойч/.test(js)) {
  fail('Wheel should not include настойчивость segment');
}

// Alternating colors
if (!js.includes('COLORS[i % 2]')) {
  fail('Wheel colors must alternate via index');
}

// Scroll fill spacer for scroll room at page bottom
if (!html.includes('scroll-fill-spacer')) {
  fail('Finale needs scroll-fill-spacer for full fill animation');
}

// Reflect title uses flipped F markup
if (!html.includes('class="flip"') || !html.includes('лексим')) {
  fail('Reflect section title should use flipped F in flexim');
}

// No duplicate turn-grid rules
const turnGridCount = (css.match(/\.turn-grid\s*\{/g) ?? []).length;
if (turnGridCount > 1) {
  fail(`Duplicate .turn-grid CSS blocks: ${turnGridCount}`);
}

// All section ids linked from main nav
const navBlock = html.match(/<nav>[\s\S]*?<\/nav>/)[0];
const navIds = [...navBlock.matchAll(/href="#(\w+)"/g)].map(m => m[1]);
for (const id of navIds) {
  if (!html.includes(`id="${id}"`)) fail(`Nav link #${id} has no matching section id`);
}

// Required images exist
const imgDir = join(root, 'img');
for (const src of html.matchAll(/src="img\/([^"]+)"/g)) {
  const file = join(imgDir, src[1]);
  if (!existsSync(file)) fail(`Missing image: img/${src[1]}`);
}

// Wheel spin wrapper
if (!html.includes('id="wheelSpin"')) {
  fail('Wheel needs wheelSpin wrapper so center stays fixed');
}

if (errors.length) {
  console.error('FAILED checks:\n' + errors.map(e => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}

console.log(`OK — ${readdirSync(imgDir).length} images, ${navIds.length} nav links, all checks passed`);

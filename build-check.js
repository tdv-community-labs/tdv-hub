/**
 * TDV Hub Build & Production Verification Script
 * Validates HTML structures, PWA manifest, service worker syntax, and ecosystem integrity.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('⚡ Starting TDV Community Labs Hub verification...');

const rootDir = __dirname;
let errorCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errorCount++;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

// 1. Validate manifest.json
try {
  const manifestRaw = fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert(manifest.name && manifest.short_name, 'manifest.json contains name and short_name');
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest.json contains valid icons');
} catch (err) {
  assert(false, `manifest.json JSON validation failed: ${err.message}`);
}

// 2. Validate vercel.json
try {
  const vercelRaw = fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8');
  JSON.parse(vercelRaw);
  assert(true, 'vercel.json is valid JSON');
} catch (err) {
  assert(false, `vercel.json JSON validation failed: ${err.message}`);
}

// 3. Validate Service Worker (sw.js)
try {
  const swCode = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
  new vm.Script(swCode);
  assert(true, 'sw.js has valid JavaScript syntax');
} catch (err) {
  assert(false, `sw.js JavaScript syntax error: ${err.message}`);
}

// 4. Validate index.html
try {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert(indexHtml.includes('<!DOCTYPE html>'), 'index.html contains valid DOCTYPE');
  assert(indexHtml.includes('<html lang="az"'), 'index.html has Azerbaijani language tag');
  assert(indexHtml.includes('zinc-950') && indexHtml.includes('zinc-900'), 'index.html adheres to zinc dual-theme design system');
  assert(indexHtml.includes('toggleTheme()'), 'index.html includes theme switcher toggle');
  assert(indexHtml.includes('searchModal'), 'index.html includes Command Palette search modal');
  assert(indexHtml.includes('calcModal'), 'index.html includes Grade Calculator modal');
  assert(indexHtml.includes('scheduleModal'), 'index.html includes Bell Schedule & Timetable modal');
  assert(indexHtml.includes('formulaModal'), 'index.html includes Formula Bank modal');
  assert(indexHtml.includes('campusModal'), 'index.html includes Campus Cabinet Directory modal');
  assert(indexHtml.includes('shareModal'), 'index.html includes Share & QR modal');
  assert(indexHtml.includes('ideaModal'), 'index.html includes Game Idea modal');

  // Validate inline script syntax
  const scriptMatches = [...indexHtml.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  for (let i = 0; i < scriptMatches.length; i++) {
    const code = scriptMatches[i][1];
    if (code.trim()) {
      new vm.Script(code);
    }
  }
  assert(true, 'index.html inline JavaScript blocks parsed without syntax errors');
} catch (err) {
  assert(false, `index.html validation failed: ${err.message}`);
}

// 5. Validate games.html
try {
  const gamesHtml = fs.readFileSync(path.join(rootDir, 'games.html'), 'utf8');
  assert(gamesHtml.includes('<!DOCTYPE html>'), 'games.html contains valid DOCTYPE');
  assert(gamesHtml.includes('TDV Mafia'), 'games.html features TDV Mafia showcase');
  assert(gamesHtml.includes('zinc-950') && gamesHtml.includes('zinc-900'), 'games.html adheres to zinc dual-theme design system');

  // Validate inline script syntax
  const scriptMatches = [...gamesHtml.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  for (let i = 0; i < scriptMatches.length; i++) {
    const code = scriptMatches[i][1];
    if (code.trim()) {
      new vm.Script(code);
    }
  }
  assert(true, 'games.html inline JavaScript blocks parsed without syntax errors');
} catch (err) {
  assert(false, `games.html validation failed: ${err.message}`);
}

if (errorCount > 0) {
  console.error(`\n❌ Build verification failed with ${errorCount} error(s).`);
  process.exit(1);
} else {
  console.log('\n✨ Build verification successful! All systems and assets are production-ready.');
  process.exit(0);
}

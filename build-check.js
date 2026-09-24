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

// 6. Validate TDV Royal Purple Branding & Ecosystem Standards
try {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const gamesHtml = fs.readFileSync(path.join(rootDir, 'games.html'), 'utf8');
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

  // Favicon & Logo assets
  assert(fs.existsSync(path.join(rootDir, 'assets', 'tdv-logo.png')), 'Official TDV Logo crest exists in assets/tdv-logo.png');
  assert(indexHtml.includes('assets/tdv-logo.png'), 'index.html references official TDV crest logo');
  assert(gamesHtml.includes('assets/tdv-logo.png'), 'games.html references official TDV crest logo');

  // Early FOUC Prevention
  assert(indexHtml.includes('tdv_theme') && indexHtml.includes('prefers-color-scheme'), 'index.html contains early FOUC prevention script');
  assert(gamesHtml.includes('tdv_theme') && gamesHtml.includes('prefers-color-scheme'), 'games.html contains early FOUC prevention script');

  // TDV Royal Purple Branding (#9333ea / purple palette)
  assert(indexHtml.includes('#9333ea') && indexHtml.includes('#7e22ce'), 'index.html defines TDV Royal Purple brand palette');
  assert(gamesHtml.includes('#9333ea') && gamesHtml.includes('#7e22ce'), 'games.html defines TDV Royal Purple brand palette');

  // No obsolete indigo or broken domain links
  assert(!indexHtml.includes('indigo') && !gamesHtml.includes('indigo'), 'index.html and games.html have no lingering indigo accent classes');
  assert(!indexHtml.includes('school-minifootball-tournament-2') &&
         !gamesHtml.includes('school-minifootball-tournament-2') &&
         !readme.includes('school-minifootball-tournament-2'), 'all tournament URLs point to canonical school-minifootball-tournament.vercel.app');
} catch (err) {
  assert(false, `TDV branding validation failed: ${err.message}`);
}

if (errorCount > 0) {
  console.error(`\n❌ Build verification failed with ${errorCount} error(s).`);
  process.exit(1);
} else {
  console.log('\n✨ Build verification successful! All systems and assets are production-ready.');
  process.exit(0);
}

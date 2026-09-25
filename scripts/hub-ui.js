/**
 * TDV Hub — Main UI Script (hub-ui.js)
 * Extracted from index.html inline <script> blocks.
 * Contains: theme, bell chime, counters, ticker, bell tracker,
 * grade calculator, schedule, formula bank, campus, share, search,
 * task planner, FAQ accordion, idea modal, auth system, SSO client.
 */

// Initialize Lucide Icons
lucide.createIcons();

// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ============================================================
// MOBILE MENU
// ============================================================
function toggleMobileMenu() {
  const drawer = document.getElementById('mobileMenuDrawer');
  const icon = document.getElementById('mobileMenuIcon');
  if (!drawer) return;
  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    if (icon) icon.setAttribute('data-lucide', 'x');
  } else {
    drawer.classList.add('hidden');
    if (icon) icon.setAttribute('data-lucide', 'menu');
  }
  lucide.createIcons();
}

// ============================================================
// CLIPBOARD HELPERS
// ============================================================
function copyTextToClipboard(text, onSuccess) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (onSuccess) onSuccess();
    }).catch(() => {
      fallbackCopyText(text);
      if (onSuccess) onSuccess();
    });
  } else {
    fallbackCopyText(text);
    if (onSuccess) onSuccess();
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try { document.execCommand('copy'); } catch (err) {}
  document.body.removeChild(textArea);
}

// ============================================================
// BELL CHIME (Web Audio API)
// ============================================================
let bellAudioCtx = null;
function playBellChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!bellAudioCtx || bellAudioCtx.state === 'closed') {
      bellAudioCtx = new AudioCtx();
    }
    if (bellAudioCtx.state === 'suspended') {
      bellAudioCtx.resume();
    }
    const ctx = bellAudioCtx;

    // Authentic 4-harmonic bell chime frequencies (C5, E5, G5, C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }, idx * 180);
    });
  } catch (e) {
    console.debug('Audio chime info:', e);
  }
}

// ============================================================
// DUAL-THEME MANAGEMENT
// ============================================================
function applyTheme(theme) {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const metaTheme = document.getElementById('metaThemeColor');

  if (theme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (icon) icon.setAttribute('data-lucide', 'moon');
    if (metaTheme) metaTheme.setAttribute('content', '#fafafa');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    if (icon) icon.setAttribute('data-lucide', 'sun');
    if (metaTheme) metaTheme.setAttribute('content', '#09090b');
  }
  lucide.createIcons();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  localStorage.setItem('tdv_theme', newTheme);
  applyTheme(newTheme);
}

// Auto-detect system preference or load stored
const storedTheme = localStorage.getItem('tdv_theme');
if (storedTheme) {
  applyTheme(storedTheme);
} else {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

// Listen to OS preference changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('tdv_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounters() {
  const counters = document.querySelectorAll('.counter-number');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        counter.textContent = target + '+';
        clearInterval(timer);
      } else {
        counter.textContent = count + '+';
      }
    }, 25);
  });
}
setTimeout(animateCounters, 300);

// ============================================================
// CAMPUS ANNOUNCEMENTS TICKER
// ============================================================
const announcements = [
  "⚽ TDV Minifutbol turnirində növbəti tur oyunlarının canlı nəticələri yeniləndi!",
  "📚 TDV E-School: 10-cu sinif Riyaziyyat və Fizika BSQ sınaqları yükləndi.",
  "⚔️ E-School PvP Arenasında 1v1 bilik döyüşləri davam edir!",
  "🧮 KSQ və BSQ Bal Kalkulyatoru ilə yarımillik qiymətinizi cəld hesablayın.",
  "📖 Yeni: Məktəb Düstur Bankı — Riyaziyyat, Fizika və Kimya formulları əlavə edildi!",
  "🗺️ Məktəb Fənn Kabinetləri və Laboratoriyalar Bələdçisi aktivdir!",
  "🕵️‍♂️ TDV Mafia: 15 oyun formatı, Dante's Inferno və canlı masalar tdv-mafia.vercel.app ünvanında aktivdir!",
  "🎮 TDV Games: Şagirdlərin ilk interaktiv oyun layihələri üçün təkliflər qəbul olunur."
];
let tickerIdx = 0;
setInterval(() => {
  tickerIdx = (tickerIdx + 1) % announcements.length;
  const el = document.getElementById('tickerText');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = announcements[tickerIdx];
      el.style.opacity = '1';
    }, 300);
  }
}, 4500);

// ============================================================
// LIVE BELL SCHEDULE TRACKER
// ============================================================
const bellSchedule = [
  { name: '1-ci Dərs', start: '08:30', end: '09:15' },
  { name: '1-ci Tənəffüs', start: '09:15', end: '09:25' },
  { name: '2-ci Dərs', start: '09:25', end: '10:10' },
  { name: '2-ci Tənəffüs', start: '10:10', end: '10:20' },
  { name: '3-cü Dərs', start: '10:20', end: '11:05' },
  { name: 'Böyük Tənəffüs (Nahar)', start: '11:05', end: '11:20' },
  { name: '4-cü Dərs', start: '11:20', end: '12:05' },
  { name: '4-cü Tənəffüs', start: '12:05', end: '12:15' },
  { name: '5-ci Dərs', start: '12:15', end: '13:00' },
  { name: '5-ci Tənəffüs', start: '13:00', end: '13:10' },
  { name: '6-cı Dərs', start: '13:10', end: '13:55' },
  { name: '6-cı Tənəffüs', start: '13:55', end: '14:05' },
  { name: '7-ci Dərs', start: '14:05', end: '14:50' }
];

function toMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function updateLiveBell() {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();

  const text = document.getElementById('liveBellText');
  const currentNameEl = document.getElementById('bellCurrentName');
  const remainingEl = document.getElementById('bellRemainingTime');

  if (day === 0 || day === 6) {
    if (text) text.textContent = 'Həftəsonu (Tətil)';
    if (currentNameEl) currentNameEl.textContent = 'Həftəsonu İstirahəti';
    if (remainingEl) remainingEl.textContent = '--:--';
    return;
  }

  let activePeriod = null;
  for (const p of bellSchedule) {
    const s = toMinutes(p.start);
    const e = toMinutes(p.end);
    if (currentMin >= s && currentMin < e) {
      activePeriod = { ...p, remaining: e - currentMin };
      break;
    }
  }

  if (activePeriod) {
    if (text) text.textContent = `${activePeriod.name} (${activePeriod.remaining} dəq qalıb)`;
    if (currentNameEl) currentNameEl.textContent = activePeriod.name;
    if (remainingEl) remainingEl.textContent = `${activePeriod.remaining} dəqiqə`;
  } else if (currentMin < toMinutes('08:30')) {
    const rem = toMinutes('08:30') - currentMin;
    if (text) text.textContent = `Dərslərə ${rem} dəq qalıb`;
    if (currentNameEl) currentNameEl.textContent = 'Dərslər başlamayıb';
    if (remainingEl) remainingEl.textContent = `${rem} dəq`;
  } else {
    if (text) text.textContent = 'Dərslər bitdi';
    if (currentNameEl) currentNameEl.textContent = 'Dərslər başa çatdı';
    if (remainingEl) remainingEl.textContent = 'Sabahadək';
  }
}
updateLiveBell();
setInterval(updateLiveBell, 10000);

// ============================================================
// GRADE CALCULATOR
// ============================================================
const calcModal = document.getElementById('calcModal');
function openCalcModal() {
  calcModal.showModal();
  const ksqEl = document.getElementById('calcKsq');
  if (ksqEl) setTimeout(() => ksqEl.focus(), 80);
}
function closeCalcModal() { calcModal.close(); }
calcModal.addEventListener('click', (e) => { if (e.target === calcModal) closeCalcModal(); });

function toggleBsqInput(hasBsq) {
  const field = document.getElementById('bsqField');
  if (hasBsq) field.classList.remove('hidden');
  else field.classList.add('hidden');
  liveCalculateGrade();
}

function liveCalculateGrade() {
  const ksqInput = document.getElementById('calcKsq');
  const bsqInput = document.getElementById('calcBsq');
  const hasBsq = document.getElementById('hasBsq').checked;
  const resBox = document.getElementById('calcResult');
  const ksqBadge = document.getElementById('ksqShareBadge');
  const bsqBadge = document.getElementById('bsqShareBadge');
  const detailsText = document.getElementById('calcDetailsText');

  let ksqVal = ksqInput.value.trim();
  if (!ksqVal) {
    resBox.classList.add('hidden');
    if (ksqBadge) ksqBadge.classList.add('hidden');
    if (bsqBadge) bsqBadge.classList.add('hidden');
    return;
  }

  let ksq = parseFloat(ksqVal);
  if (isNaN(ksq)) return;
  if (ksq > 100) { ksq = 100; ksqInput.value = 100; }
  if (ksq < 0) { ksq = 0; ksqInput.value = 0; }

  let finalScore = ksq;
  if (hasBsq) {
    let bsqVal = bsqInput.value.trim();
    let bsq = bsqVal ? parseFloat(bsqVal) : 0;
    if (isNaN(bsq)) bsq = 0;
    if (bsq > 100) { bsq = 100; bsqInput.value = 100; }
    if (bsq < 0) { bsq = 0; bsqInput.value = 0; }

    const ksqShare = ksq * 0.4;
    const bsqShare = bsq * 0.6;
    finalScore = ksqShare + bsqShare;

    if (ksqBadge) {
      ksqBadge.textContent = `Pay (40%): ${ksqShare.toFixed(1)} bal`;
      ksqBadge.classList.remove('hidden');
    }
    if (bsqBadge) {
      bsqBadge.textContent = `Pay (60%): ${bsqShare.toFixed(1)} bal`;
      bsqBadge.classList.remove('hidden');
    }
    if (detailsText) {
      detailsText.textContent = `KSQ (40%): ${ksqShare.toFixed(1)} bal + BSQ (60%): ${bsqShare.toFixed(1)} bal`;
    }
  } else {
    if (ksqBadge) {
      ksqBadge.textContent = `Pay (100%): ${ksq.toFixed(1)} bal`;
      ksqBadge.classList.remove('hidden');
    }
    if (bsqBadge) bsqBadge.classList.add('hidden');
    if (detailsText) {
      detailsText.textContent = `Fənn üzrə yalnız KSQ əsasında (100% pay)`;
    }
  }

  finalScore = Math.round(finalScore * 10) / 10;
  let gradeText = '2 (Qeyri-kafi)';
  let gradeClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25';

  if (finalScore >= 80.5) {
    gradeText = '5 (Əla) 🎉';
    gradeClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25';
  } else if (finalScore >= 60.5) {
    gradeText = '4 (Yaxşı) 👍';
    gradeClass = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25';
  } else if (finalScore >= 30.5) {
    gradeText = '3 (Kafi)';
    gradeClass = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25';
  }

  resBox.classList.remove('hidden');
  document.getElementById('calcFinalScore').textContent = finalScore + ' Bal';
  const badgeEl = document.getElementById('calcGradeBadge');
  badgeEl.textContent = 'Qiymət: ' + gradeText;
  badgeEl.className = 'inline-block px-3.5 py-1 rounded-full text-xs font-bold mt-1 ' + gradeClass;
}

function calculateGrade(e) {
  if (e) e.preventDefault();
  liveCalculateGrade();
}

function resetCalculator() {
  const form = document.getElementById('gradeCalcForm');
  if (form) form.reset();
  document.getElementById('hasBsq').checked = true;
  document.getElementById('bsqField').classList.remove('hidden');
  const ksqBadge = document.getElementById('ksqShareBadge');
  const bsqBadge = document.getElementById('bsqShareBadge');
  if (ksqBadge) ksqBadge.classList.add('hidden');
  if (bsqBadge) bsqBadge.classList.add('hidden');
  document.getElementById('calcResult').classList.add('hidden');
  const ksqEl = document.getElementById('calcKsq');
  if (ksqEl) ksqEl.focus();
}

// ============================================================
// BELL SCHEDULE MODAL
// ============================================================
const scheduleModal = document.getElementById('scheduleModal');
function openScheduleModal() {
  scheduleModal.showModal();
  const today = new Date().getDay();
  const daySel = document.getElementById('daySelector');
  if (today >= 1 && today <= 5 && daySel) {
    daySel.value = String(today);
  }
  const savedClass = localStorage.getItem('tdv_preferred_class');
  const clsSel = document.getElementById('classSelector');
  if (savedClass && clsSel && classSchedules[savedClass]) {
    clsSel.value = savedClass;
  }
  renderClassTimetable();
}
function closeScheduleModal() { scheduleModal.close(); }
scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) closeScheduleModal(); });

function switchScheduleTab(tab) {
  const bellTab = document.getElementById('bellTabContent');
  const classTab = document.getElementById('classTabContent');
  const bellBtn = document.getElementById('tabBellBtn');
  const classBtn = document.getElementById('tabClassBtn');

  if (tab === 'bell') {
    bellTab.classList.remove('hidden');
    classTab.classList.add('hidden');
    bellBtn.className = 'flex-1 py-1.5 rounded-lg font-semibold bg-purple-600 text-white transition cursor-pointer';
    classBtn.className = 'flex-1 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer';
  } else {
    bellTab.classList.add('hidden');
    classTab.classList.remove('hidden');
    classBtn.className = 'flex-1 py-1.5 rounded-lg font-semibold bg-purple-600 text-white transition cursor-pointer';
    bellBtn.className = 'flex-1 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer';
    renderClassTimetable();
  }
}

const classSchedules = {
  '10A': {
    '1': ['Cəbr və Analizin Başlanğıcı', 'Həndəsə', 'Fizika', 'Azərbaycan Dili', 'İnformatika', 'Bədən Tərbiyəsi'],
    '2': ['Kimya', 'Biologiya', 'Xarici Dil (İngilis)', 'Tarix', 'Cəbr', 'Ədəbiyyat'],
    '3': ['Fizika', 'Həndəsə', 'İnformatika (Praktika)', 'Coğrafiya', 'Xarici Dil', 'Çağırışaqədər Hazırlıq'],
    '4': ['Cəbr', 'Kimya', 'Biologiya', 'Azərbaycan Dili', 'Tarix', 'Fizika'],
    '5': ['Həndəsə', 'Ədəbiyyat', 'İnformatika', 'Xarici Dil', 'Bədən Tərbiyəsi', 'Fakültativ Məşğələ']
  },
  '11H': {
    '1': ['Riyaziyyat (DİM Buraxılış)', 'Azərbaycan Dili', 'İngilis Dili', 'Fizika', 'Kimya', 'İmtahan Hazırlığı'],
    '2': ['Riyaziyyat', 'Fizika (Məsələ həlli)', 'Tarix', 'Biologiya', 'İngilis Dili', 'Ədəbiyyat'],
    '3': ['Azərbaycan Dili', 'Riyaziyyat', 'Fizika', 'İnformatika', 'İngilis Dili', 'Hərbi Hazırlıq'],
    '4': ['Riyaziyyat', 'Kimya', 'Biologiya', 'Tarix', 'İngilis Dili', 'Fizika'],
    '5': ['Sınaq İmtahanı (Blok)', 'Sınaq Müzakirəsi', 'Riyaziyyat', 'İngilis Dili', 'Bədən Tərbiyəsi', 'Məsləhət Saatı']
  },
  '9C': {
    '1': ['Riyaziyyat', 'Azərbaycan Dili', 'Fizika', 'İngilis Dili', 'Kimya', 'Bədən Tərbiyəsi'],
    '2': ['Həndəsə', 'Biologiya', 'Tarix', 'Coğrafiya', 'Ədəbiyyat', 'İnformatika'],
    '3': ['Riyaziyyat', 'Fizika', 'Azərbaycan Dili', 'İngilis Dili', 'Musiqi', 'Təsviri İncəsənət'],
    '4': ['Həndəsə', 'Kimya', 'Tarix', 'Biologiya', 'Ədəbiyyat', 'İnformatika'],
    '5': ['Riyaziyyat', 'Azərbaycan Dili', 'İngilis Dili', 'Fizika', 'Bədən Tərbiyəsi', 'Həyat Bilgisi']
  }
};

function renderClassTimetable() {
  const clsSel = document.getElementById('classSelector');
  const cls = clsSel ? clsSel.value : '10A';
  const daySel = document.getElementById('daySelector');
  const day = daySel ? daySel.value : '1';
  const list = document.getElementById('classTimetableList');
  if (!list) return;

  localStorage.setItem('tdv_preferred_class', cls);
  const lessons = (classSchedules[cls] && classSchedules[cls][day]) || [];

  list.innerHTML = lessons.map((les, i) => `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
      <span class="text-purple-600 dark:text-purple-400 font-bold w-16">${i + 1}-ci Dərs</span>
      <span class="text-zinc-800 dark:text-zinc-200 font-sans font-medium flex-1 text-left px-2">${les}</span>
      <span class="text-[10px] text-zinc-400 font-mono">45 dəq</span>
    </div>
  `).join('');
}

// ============================================================
// FORMULA BANK MODAL
// ============================================================
const formulaModal = document.getElementById('formulaModal');
let currentFormulaCat = 'all';
let currentFormulaQuery = '';

function openFormulaModal() {
  formulaModal.showModal();
  const sInput = document.getElementById('formulaSearchInput');
  if (sInput) sInput.value = '';
  currentFormulaQuery = '';
  currentFormulaCat = 'all';
  renderFormulas();
}
function closeFormulaModal() { formulaModal.close(); }
formulaModal.addEventListener('click', (e) => { if (e.target === formulaModal) closeFormulaModal(); });

const formulasData = [
  { cat: 'math', title: 'Pifaqor Teoremi', formula: 'a² + b² = c²', desc: 'Düzbucaqlı üçbucaqda katetlərin kvadratları cəmi hipotenuzun kvadratına bərabərdir.' },
  { cat: 'math', title: 'Kvadrat Tənliyin Diskriminantı', formula: 'D = b² - 4ac  ➔  x₁,₂ = (-b ± √D) / 2a', desc: 'D > 0 olduqda iki müxtəlif, D = 0 olduqda bir kökü var.' },
  { cat: 'math', title: 'Əsas Triqonometrik Eynilik', formula: 'sin²α + cos²α = 1', desc: 'İstənilən bucaq üçün sinus və kosinusun kvadratları cəmi 1-ə bərabərdir.' },
  { cat: 'math', title: 'Dairənin Sahəsi və Çevrənin Uzunluğu', formula: 'S = πr²  |  L = 2πr', desc: 'r radiuslu dairənin sahəsi və çevrəsinin uzunluq formulu.' },
  { cat: 'phys', title: 'Nyutonun II Qanunu', formula: 'F = m · a', desc: 'Cismə təsir edən əvəzləyici qüvvə onun kütləsi ilə təcilinin hasilinə bərabərdir.' },
  { cat: 'phys', title: 'Kinetik və Potensial Enerji', formula: 'E_k = (m · v²) / 2  |  E_p = m · g · h', desc: 'Mexaniki hərəkət enerjisi və cazibə sahəsindəki potensial enerji.' },
  { cat: 'phys', title: 'Dövrə Hissəsi üçün Om Qanunu', formula: 'I = U / R', desc: 'Cərəyan şiddəti gərginliklə düz, müqavimətlə tərs mütənasibdir.' },
  { cat: 'phys', title: 'Arximed Qüvvəsi (İtələmə qüvvəsi)', formula: 'F_A = ρ_maye · g · V_cisim', desc: 'Mayeyə batırılmış cismə təsir edən qaldırıcı qüvvə.' },
  { cat: 'chem', title: 'Maddə Miqdarı və Molyar Kütlə', formula: 'n = m / M  =  N / N_A', desc: 'Molyar kütlə və Avoqadro sabiti (N_A = 6.02 · 10²³ mol⁻¹).' },
  { cat: 'chem', title: 'Məhlulun Qatılığı (Kütlə payı)', formula: 'ω = (m_həll olan / m_məhlul) · 100%', desc: 'Həll olan maddənin məhluldakı faiz nisbəti.' }
];

function filterFormulas(cat) {
  currentFormulaCat = cat;
  document.querySelectorAll('.formula-tab').forEach(b => {
    b.className = 'formula-tab px-3 py-1.5 rounded-xl font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shrink-0 cursor-pointer';
  });
  if (window.event && window.event.target) {
    window.event.target.className = 'formula-tab px-3 py-1.5 rounded-xl font-semibold bg-emerald-600 text-white shrink-0 cursor-pointer';
  }
  renderFormulas();
}

function searchFormulas(query) {
  currentFormulaQuery = (query || '').trim().toLowerCase();
  const clearBtn = document.getElementById('clearFormulaSearchBtn');
  if (clearBtn) {
    if (currentFormulaQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderFormulas();
}

function clearFormulaSearch() {
  const input = document.getElementById('formulaSearchInput');
  if (input) input.value = '';
  searchFormulas('');
  if (input) input.focus();
}

function copyFormula(formulaText, btnEl) {
  copyTextToClipboard(formulaText, () => {
    const originalHtml = btnEl.innerHTML;
    btnEl.innerHTML = '<span class="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-1">Kopyalandı! ✓</span>';
    setTimeout(() => {
      btnEl.innerHTML = originalHtml;
    }, 1800);
  });
}

function renderFormulas() {
  const container = document.getElementById('formulaContainer');
  let filtered = currentFormulaCat === 'all' ? formulasData : formulasData.filter(f => f.cat === currentFormulaCat);

  if (currentFormulaQuery) {
    filtered = filtered.filter(f =>
      f.title.toLowerCase().includes(currentFormulaQuery) ||
      f.formula.toLowerCase().includes(currentFormulaQuery) ||
      f.desc.toLowerCase().includes(currentFormulaQuery) ||
      (f.cat === 'math' && 'riyaziyyat'.includes(currentFormulaQuery)) ||
      (f.cat === 'phys' && 'fizika'.includes(currentFormulaQuery)) ||
      (f.cat === 'chem' && 'kimya'.includes(currentFormulaQuery))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
        <i data-lucide="search-x" class="w-8 h-8 text-zinc-400 mx-auto"></i>
        <div class="font-semibold text-zinc-800 dark:text-zinc-200">Axtarışa uyğun düstur tapılmadı</div>
        <p class="text-xs text-zinc-400">Açar sözü dəyişərək yenidən yoxlayın və ya kateqoriyanı "Bütün" seçin.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(f => {
    const catLabel = f.cat === 'math' ? 'Riyaziyyat' : f.cat === 'phys' ? 'Fizika' : 'Kimya';
    const catColor = f.cat === 'math' ? 'text-blue-600 dark:text-blue-400' : f.cat === 'phys' ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400';
    const safeFormula = f.formula.replace(/"/g, '&quot;');
    return `
      <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 transition group">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-xs">${f.title}</span>
          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${catColor}">${catLabel}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-emerald-700 dark:text-emerald-400 font-bold text-sm tracking-wide mb-1.5 border border-zinc-200 dark:border-zinc-800">
          <span class="truncate pr-2">${f.formula}</span>
          <button type="button" onclick="copyFormula('${safeFormula}', this)" class="shrink-0 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer" title="Düsturu kopyala">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">${f.desc}</p>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

// ============================================================
// CAMPUS MODAL
// ============================================================
const campusModal = document.getElementById('campusModal');
function openCampusModal() {
  campusModal.showModal();
  clearCampusSearch();
  const sInput = document.getElementById('campusSearchInput');
  if (sInput) setTimeout(() => sInput.focus(), 80);
}
function closeCampusModal() { campusModal.close(); }
campusModal.addEventListener('click', (e) => { if (e.target === campusModal) closeCampusModal(); });

function filterCampusRooms(query) {
  const q = (query || '').trim().toLowerCase();
  const clearBtn = document.getElementById('clearCampusSearchBtn');
  if (clearBtn) {
    if (q) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const cards = document.querySelectorAll('.campus-room-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const searchData = card.getAttribute('data-room-search') || '';
    if (!q || searchData.includes(q)) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  const noMsg = document.getElementById('noCampusRoomsMsg');
  if (noMsg) {
    if (visibleCount === 0) noMsg.classList.remove('hidden');
    else noMsg.classList.add('hidden');
  }
}

function clearCampusSearch() {
  const sInput = document.getElementById('campusSearchInput');
  if (sInput) sInput.value = '';
  filterCampusRooms('');
  if (sInput) sInput.focus();
}

// ============================================================
// SHARE MODAL
// ============================================================
const shareModal = document.getElementById('shareModal');
function openShareModal() { shareModal.showModal(); }
function closeShareModal() { shareModal.close(); }
shareModal.addEventListener('click', (e) => { if (e.target === shareModal) closeShareModal(); });

function copyShareLink() {
  const url = window.location.href.split('#')[0] || 'https://tdv-community-labs.github.io/tdv-hub/';
  copyTextToClipboard(url, () => {
    const text = document.getElementById('copyLinkText');
    if (text) {
      text.textContent = 'Kopyalandı! ✓';
      setTimeout(() => { text.textContent = 'Linki Kopyala'; }, 2000);
    }
  });
}

// ============================================================
// ANTI-XSS HTML SANITIZER
// ============================================================
function escapeHTML(str) {
  return String(str || '').replace(/[&<>'"]/g, function (tag) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[tag] || tag;
  });
}

// ============================================================
// STUDENT HOMEWORK & TASK PLANNER
// ============================================================
let currentTaskFilter = 'all';

function getStudentTasks() {
  try {
    return JSON.parse(localStorage.getItem('tdv_student_tasks') || '[]');
  } catch (e) {
    return [];
  }
}

function saveStudentTasks(tasks) {
  localStorage.setItem('tdv_student_tasks', JSON.stringify(tasks));
  renderStudentTasks();
}

function addStudentTask(e) {
  e.preventDefault();
  const subject = (document.getElementById('taskSubject').value || 'Ümumi').trim().slice(0, 30);
  const text = document.getElementById('taskText').value.trim().slice(0, 200);
  const due = (document.getElementById('taskDue').value.trim() || 'Bu həftə').slice(0, 50);
  if (!text) return;

  const tasks = getStudentTasks();
  tasks.unshift({
    id: Date.now(),
    subject,
    text,
    due,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveStudentTasks(tasks);
  document.getElementById('taskText').value = '';
  document.getElementById('taskDue').value = '';
}

function toggleTaskComplete(id) {
  const tasks = getStudentTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveStudentTasks(tasks);
  }
}

function deleteTask(id) {
  let tasks = getStudentTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveStudentTasks(tasks);
}

function clearCompletedTasks() {
  let tasks = getStudentTasks();
  tasks = tasks.filter(t => !t.completed);
  saveStudentTasks(tasks);
}

function filterTasks(f) {
  currentTaskFilter = f;
  const filterBtns = {
    all: document.getElementById('taskFilterAll'),
    active: document.getElementById('taskFilterActive'),
    completed: document.getElementById('taskFilterCompleted')
  };

  Object.keys(filterBtns).forEach(key => {
    const btn = filterBtns[key];
    if (btn) {
      if (key === f) {
        btn.className = 'task-filter-btn px-2.5 py-1 rounded-lg bg-purple-600 text-white font-semibold flex items-center gap-1.5 cursor-pointer';
      } else {
        btn.className = 'task-filter-btn px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer';
      }
    }
  });
  renderStudentTasks();
}

function renderStudentTasks() {
  const container = document.getElementById('taskListContainer');
  let tasks = getStudentTasks();

  // Seed sample tasks on first launch
  if (tasks.length === 0 && !localStorage.getItem('tdv_student_tasks_initialized')) {
    tasks = [
      { id: 1, subject: 'Riyaziyyat', text: 'Səh 52, çalışma 14-20 (Kvadrat tənliklər)', due: 'Sabah', completed: false },
      { id: 2, subject: 'Fizika', text: 'Nyuton qanunları üzrə sınaq testinə hazırlaşmaq', due: 'Cümə axşamı', completed: true }
    ];
    localStorage.setItem('tdv_student_tasks', JSON.stringify(tasks));
    localStorage.setItem('tdv_student_tasks_initialized', 'true');
  }

  const allCount = tasks.length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const countAllEl = document.getElementById('taskCountAll');
  const countActiveEl = document.getElementById('taskCountActive');
  const countCompletedEl = document.getElementById('taskCountCompleted');
  const clearBtn = document.getElementById('clearCompletedTasksBtn');

  if (countAllEl) countAllEl.textContent = allCount;
  if (countActiveEl) countActiveEl.textContent = activeCount;
  if (countCompletedEl) countCompletedEl.textContent = completedCount;
  if (clearBtn) {
    if (completedCount > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  let filtered = tasks;
  if (currentTaskFilter === 'active') filtered = tasks.filter(t => !t.completed);
  if (currentTaskFilter === 'completed') filtered = tasks.filter(t => t.completed);

  if (filtered.length === 0) {
    const emptyMsg = currentTaskFilter === 'completed' ? 'Heç bir tamamlanmış tapşırıq yoxdur.' :
                     currentTaskFilter === 'active' ? 'Bütün tapşırıqlar tamamlanıb! 🎉' :
                     'Hələ heç bir tapşırıq əlavə edilməyib.';
    container.innerHTML = `<div class="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 font-medium">${emptyMsg}</div>`;
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 ${t.completed ? 'opacity-60' : ''} hover:border-zinc-300 dark:hover:border-zinc-700 transition">
      <div class="flex items-center gap-3 overflow-hidden">
        <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskComplete(${t.id})" class="rounded bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer w-4 h-4">
        <div class="overflow-hidden truncate">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">${escapeHTML(t.subject)}</span>
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-mono">${escapeHTML(t.due)}</span>
          </div>
          <div class="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-1 truncate ${t.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}">${escapeHTML(t.text)}</div>
        </div>
      </div>
      <button type="button" onclick="deleteTask(${t.id})" class="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg transition cursor-pointer" title="Sil">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}
renderStudentTasks();

// ============================================================
// FAQ ACCORDION
// ============================================================
function toggleFaq(index) {
  const content = document.getElementById(`faqContent-${index}`);
  const icon = document.getElementById(`faqIcon-${index}`);
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    icon.style.transform = 'rotate(0deg)';
  } else {
    content.classList.add('open');
    icon.style.transform = 'rotate(180deg)';
  }
}

// ============================================================
// COMMAND PALETTE & SEARCH (Ctrl + K)
// ============================================================
const searchModal = document.getElementById('searchModal');
function openSearchModal() {
  searchModal.showModal();
  document.getElementById('searchInput').focus();
  handleSearch('');
}
function closeSearchModal() { searchModal.close(); }
searchModal.addEventListener('click', (e) => { if (e.target === searchModal) closeSearchModal(); });

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (searchModal.open) closeSearchModal();
    else openSearchModal();
  }
});

const searchableItems = [
  { name: 'TDV E-School', desc: 'Məktəb tədris portalı, 100+ dərs və sınaqlar', url: 'https://tdv-e-school.vercel.app/', icon: '🎓' },
  { name: 'Riyaziyyat BSQ / KSQ', desc: '10-cu və 9-cu sinif Riyaziyyat imtahan arxivi', url: 'https://tdv-e-school.vercel.app/', icon: '📐' },
  { name: 'Fizika Dərsləri', desc: 'Mexanika, termodinamika və optika vəsaitləri', url: 'https://tdv-e-school.vercel.app/', icon: '⚡' },
  { name: 'PvP Bilik Arenası', desc: '1v1 sual-cavab intellektual döyüşü', url: 'https://tdv-e-school.vercel.app/', icon: '⚔️' },
  { name: 'TDV Sports — Turnir', desc: 'Canlı minifutbol nəticələri, xal cədvəli və oyunlar', url: 'https://school-minifootball-tournament.vercel.app/', icon: '⚽' },
  { name: 'Turnir Cədvəli (10A, 11H, 9C)', desc: 'Qrup mərhələsi xal vəziyyəti və qol fərqləri', url: 'https://school-minifootball-tournament.vercel.app/', icon: '🏆' },
  { name: 'Bombardirlər Siyahısı', desc: 'Turnirin ən çox qol vuran şagirdləri', url: 'https://school-minifootball-tournament.vercel.app/', icon: '🥇' },
  { name: 'TDV Mafia — Deduksiya Portalı', desc: 'Canlı sosial deduksiya oyunu, 15 rejim, real-vaxt masaları', url: 'https://tdv-mafia.vercel.app/', icon: '🕵️‍♂️' },
  { name: "Dante's Inferno (TDV Mafia)", desc: '9 Dairə Əzabları xüsusi 10-14 nəfərlik mafia rejimi', url: 'https://tdv-mafia.vercel.app/', icon: '🔥' },
  { name: 'Məktəb Düstur Bankı', desc: 'Riyaziyyat, Fizika və Kimya düsturları', action: 'formula', icon: '📖' },
  { name: 'Fənn Kabinetləri Bələdçisi', desc: 'Laboratoriyalar, STEAM mərkəzi və otaqlar', action: 'campus', icon: '📍' },
  { name: 'KSQ / BSQ Bal Kalkulyatoru', desc: 'Yarımillik qiyməti hesablama aləti', action: 'calc', icon: '🧮' },
  { name: 'Zəng & Sinif Dərs Cədvəli', desc: 'Standart dərs vaxtları və 10A, 11H cədvəli', action: 'schedule', icon: '⏰' },
  { name: 'Zəngi Çal (Audio)', desc: 'Məktəb zəngi səsini səsləndir', action: 'chime', icon: '🔔' },
  { name: 'Portalı Paylaş / QR Kod', desc: 'Sinif yoldaşlarınla portalı bölüş', action: 'share', icon: '📲' },
  { name: 'Gecə / Gündüz Rejimi', desc: 'Saytın rəng mövzusunu dəyiş', action: 'theme', icon: '🌗' },
  { name: 'TDV Games — Oyun Portalı', desc: 'TDV Mafia və interaktiv məktəb oyunları', url: 'games.html', icon: '🎮' }
];

let searchSelectedIndex = -1;
let currentSearchResults = [];

function handleSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();

  currentSearchResults = q ? searchableItems.filter(item =>
    item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  ) : searchableItems;

  searchSelectedIndex = currentSearchResults.length > 0 ? 0 : -1;

  if (currentSearchResults.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-6 text-center text-zinc-400 text-xs">
        Axtarışa uyğun heç bir alət və ya səhifə tapılmadı.
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = currentSearchResults.map((item, idx) => `
    <div id="search-item-${idx}" onclick="executeSearchItem(${idx})" class="search-result-item flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition group ${idx === 0 ? 'bg-zinc-100 dark:bg-zinc-800/70 border border-purple-500/40' : 'border border-transparent'}">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-base shrink-0">${item.icon}</div>
        <div>
          <div class="font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 text-xs">${item.name}</div>
          <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">${item.desc}</div>
        </div>
      </div>
      <i data-lucide="arrow-up-right" class="w-4 h-4 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"></i>
    </div>
  `).join('');
  lucide.createIcons();
}

function executeSearchItem(idx) {
  if (idx < 0 || idx >= currentSearchResults.length) return;
  const item = currentSearchResults[idx];

  closeSearchModal();
  if (item.action === 'calc') openCalcModal();
  else if (item.action === 'schedule') openScheduleModal();
  else if (item.action === 'formula') openFormulaModal();
  else if (item.action === 'campus') openCampusModal();
  else if (item.action === 'share') openShareModal();
  else if (item.action === 'chime') playBellChime();
  else if (item.action === 'theme') toggleTheme();
  else if (item.url) window.open(item.url, '_blank');
}

function updateSearchSelection() {
  document.querySelectorAll('.search-result-item').forEach((el, idx) => {
    if (idx === searchSelectedIndex) {
      el.className = 'search-result-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition group bg-zinc-100 dark:bg-zinc-800 border border-purple-500/50 shadow-sm';
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.className = 'search-result-item flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition group border border-transparent';
    }
  });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentSearchResults.length > 0) {
        searchSelectedIndex = (searchSelectedIndex + 1) % currentSearchResults.length;
        updateSearchSelection();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentSearchResults.length > 0) {
        searchSelectedIndex = (searchSelectedIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
        updateSearchSelection();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSearchItem(searchSelectedIndex);
    } else if (e.key === 'Escape') {
      closeSearchModal();
    }
  });
}

// ============================================================
// IDEA MODAL
// ============================================================
const ideaModal = document.getElementById('ideaModal');
let lastIdeaSubmitTime = 0;

function openIdeaModal() {
  ideaModal.showModal();
  const authorInput = document.getElementById('ideaAuthor');
  if (authorInput) setTimeout(() => authorInput.focus(), 80);
}
function closeIdeaModal() {
  ideaModal.close();
  document.getElementById('ideaFeedback').classList.add('hidden');
}
ideaModal.addEventListener('click', (e) => { if (e.target === ideaModal) closeIdeaModal(); });

function updateIdeaCharCount(el) {
  const countEl = document.getElementById('ideaCharCount');
  if (countEl) countEl.textContent = `${el.value.length} / 300`;
}

function submitIdea(e) {
  e.preventDefault();
  const now = Date.now();
  if (now - lastIdeaSubmitTime < 5000) {
    alert('Zəhmət olmasa yeni təklif göndərməzdən əvvəl bir neçə saniyə gözləyin.');
    return;
  }

  const author = escapeHTML(document.getElementById('ideaAuthor').value.trim().slice(0, 50));
  const text = escapeHTML(document.getElementById('ideaText').value.trim().slice(0, 300));
  if (!author || !text) return;

  lastIdeaSubmitTime = now;
  let ideas = [];
  try {
    ideas = JSON.parse(localStorage.getItem('tdv_game_ideas') || '[]');
  } catch (err) {
    ideas = [];
  }
  ideas.push({ author, text, date: new Date().toISOString() });
  localStorage.setItem('tdv_game_ideas', JSON.stringify(ideas));

  document.getElementById('ideaFeedback').classList.remove('hidden');
  setTimeout(() => {
    closeIdeaModal();
    document.getElementById('ideaForm').reset();
    const countEl = document.getElementById('ideaCharCount');
    if (countEl) countEl.textContent = '0 / 300';
  }, 1400);
}

// ============================================================
// TDV ECOSYSTEM SSO CLIENT & AUTH SYSTEM
// ============================================================
function openAuthModal(tab) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  const raw = localStorage.getItem('tdv_ecosystem_session_v1');
  let activeSession = null;
  if (raw) {
    try { activeSession = JSON.parse(raw); } catch (e) {}
  }

  const loggedInView = document.getElementById('authLoggedInView');
  const guestView = document.getElementById('authGuestView');

  if (activeSession && (activeSession.username || activeSession.fullName)) {
    if (loggedInView) loggedInView.classList.remove('hidden');
    if (guestView) guestView.classList.add('hidden');
    const nameEl = document.getElementById('authModalFullName');
    const userEl = document.getElementById('authModalUsername');
    const avatarEl = document.getElementById('authModalAvatar');
    const roleEl = document.getElementById('authModalRoleBadge');
    if (nameEl) nameEl.textContent = activeSession.fullName || activeSession.username;
    if (userEl) userEl.textContent = '@' + (activeSession.username || 'user');
    if (avatarEl) avatarEl.textContent = activeSession.avatar || '👤';
    if (roleEl) roleEl.textContent = activeSession.schoolClass || (activeSession.grade ? activeSession.grade + 'A' : 'Profil');
  } else {
    if (loggedInView) loggedInView.classList.add('hidden');
    if (guestView) guestView.classList.remove('hidden');
    switchAuthTab(tab || 'login');
  }

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  if (window.lucide) lucide.createIcons();
}
window.openAuthModal = openAuthModal;

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  if (typeof modal.close === 'function') {
    modal.close();
  } else {
    modal.removeAttribute('open');
  }
  const fb = document.getElementById('authFeedback');
  if (fb) {
    fb.className = 'hidden p-3 rounded-xl text-xs font-medium border';
    fb.textContent = '';
  }
}
window.closeAuthModal = closeAuthModal;

function switchAuthTab(tab) {
  const loggedInView = document.getElementById('authLoggedInView');
  const guestView = document.getElementById('authGuestView');
  if (loggedInView) loggedInView.classList.add('hidden');
  if (guestView) guestView.classList.remove('hidden');

  const loginBtn = document.getElementById('authTabLoginBtn');
  const regBtn = document.getElementById('authTabRegisterBtn');
  const loginForm = document.getElementById('authLoginForm');
  const regForm = document.getElementById('authRegisterForm');
  const fb = document.getElementById('authFeedback');
  if (fb) fb.classList.add('hidden');

  if (tab === 'register') {
    if (loginBtn) loginBtn.className = 'py-2 rounded-xl transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer';
    if (regBtn) regBtn.className = 'py-2 rounded-xl transition bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs cursor-pointer';
    if (loginForm) loginForm.classList.add('hidden');
    if (regForm) regForm.classList.remove('hidden');
  } else {
    if (loginBtn) loginBtn.className = 'py-2 rounded-xl transition bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs cursor-pointer';
    if (regBtn) regBtn.className = 'py-2 rounded-xl transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer';
    if (loginForm) loginForm.classList.remove('hidden');
    if (regForm) regForm.classList.add('hidden');
  }
  if (window.lucide) lucide.createIcons();
}
window.switchAuthTab = switchAuthTab;

function quickFillLogin(username, pin) {
  switchAuthTab('login');
  const u = document.getElementById('loginInputUsername');
  const p = document.getElementById('loginInputPin');
  if (u) u.value = username;
  if (p) p.value = pin;
}
window.quickFillLogin = quickFillLogin;

function getRegisteredEcosystemUsers() {
  const DEFAULT_USERS = [
    { userId: 'u_orxan', username: 'orxan', fullName: 'Orxan Əliyev', schoolClass: '10A', grade: 10, pin: '1000', role: 'student', avatar: '👨‍🎓' },
    { userId: 'u_elvin', username: 'elvin_coach', fullName: 'Elvin Müəllim', schoolClass: 'Məşqçi', grade: 0, pin: '2026', role: 'coach', avatar: '⚽' },
    { userId: 'u_admin', username: 'admin', fullName: 'TDV İnzibatçı', schoolClass: 'Rəhbərlik', grade: 0, pin: 'admin2026', role: 'admin', avatar: '🛡️' }
  ];
  try {
    const raw = localStorage.getItem('tdv_registered_users_v1');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {}
  try {
    localStorage.setItem('tdv_registered_users_v1', JSON.stringify(DEFAULT_USERS));
  } catch (e) {}
  return DEFAULT_USERS;
}

function dispatchSSOBrokerState(session, users) {
  try {
    const BROKER_URL = 'https://tdv-hub.vercel.app/sso-broker.html';
    let iframe = document.getElementById('tdv_sso_broker_bridge');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'tdv_sso_broker_bridge';
      iframe.src = BROKER_URL;
      iframe.style.display = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.onload = function () {
        try {
          iframe.contentWindow.postMessage({ type: 'TDV_SSO_SET', session: session, users: users }, '*');
        } catch (err) {}
      };
      document.body.appendChild(iframe);
    } else {
      iframe.contentWindow.postMessage({ type: 'TDV_SSO_SET', session: session, users: users }, '*');
    }
  } catch (e) {}
}

function showAuthFeedback(msg, isSuccess) {
  const fb = document.getElementById('authFeedback');
  if (!fb) return;
  fb.classList.remove('hidden');
  if (isSuccess) {
    fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center';
  } else {
    fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-center';
  }
  fb.textContent = msg;
}

function handleAuthLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const userIn = (document.getElementById('loginInputUsername')?.value || '').trim();
  const pinIn = (document.getElementById('loginInputPin')?.value || '').trim();
  if (!userIn) {
    showAuthFeedback('Zəhmət olmasa istifadəçi adı daxil edin.', false);
    return;
  }

  const users = getRegisteredEcosystemUsers();
  const matched = users.find(u =>
    (u.username && u.username.toLowerCase() === userIn.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase() === userIn.toLowerCase())
  );

  if (!matched) {
    showAuthFeedback("⚠️ '" + userIn + "' istifadəçi adı qeydiyyatda tapılmadı! Zəhmət olmasa 'Qeydiyyat' sekmesindən yeni vahid profil açın.", false);
    return;
  }

  if (matched.pin && String(matched.pin).trim() !== '') {
    if (!pinIn || pinIn !== String(matched.pin).trim()) {
      showAuthFeedback('❌ Daxil edilən PIN kod və ya şifrə yanlışdır!', false);
      return;
    }
  }

  const session = {
    userId: matched.userId || 'usr_' + Date.now().toString(36),
    username: matched.username,
    fullName: matched.fullName || matched.username,
    role: matched.role || (matched.schoolClass === 'Məşqçi' ? 'coach' : 'student'),
    schoolClass: matched.schoolClass || '10A',
    grade: matched.grade || 10,
    avatar: matched.avatar || '🎓',
    token: 'tdv_sec_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
  };

  localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(session));
  dispatchSSOBrokerState(session, users);
  showAuthFeedback('✓ Uğurla daxil oldunuz! Ekosistem sinxronlaşdırılır...', true);
  setTimeout(() => {
    closeAuthModal();
    if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
    if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
  }, 500);
}
window.handleAuthLoginSubmit = handleAuthLoginSubmit;

function handleAuthRegisterSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const fullName = (document.getElementById('regInputFullName')?.value || '').trim();
  const username = (document.getElementById('regInputUsername')?.value || '').trim();
  const schoolClass = document.getElementById('regInputClass')?.value || '10A';
  const avatar = document.getElementById('regInputAvatar')?.value || '🎓';
  const pin = (document.getElementById('regInputPin')?.value || '').trim();
  const confirmPin = (document.getElementById('regInputConfirmPin')?.value || '').trim();

  if (!fullName) { showAuthFeedback('Zəhmət olmasa ad və soyadınızı daxil edin.', false); return; }
  if (!username) { showAuthFeedback('Zəhmət olmasa istifadəçi adı seçin.', false); return; }
  if (pin && confirmPin && pin !== confirmPin) {
    showAuthFeedback('Daxil edilən şifrələr bir-birinə uyğun gəlmir.', false);
    return;
  }

  const users = getRegisteredEcosystemUsers();
  const exists = users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    showAuthFeedback("⚠️ '" + username + "' istifadəçi adı artıq tutulub! Zəhmət olmasa başqa ad seçin.", false);
    return;
  }

  const parsedGrade = parseInt(schoolClass) || 10;
  const newUser = {
    userId: 'usr_' + Date.now().toString(36),
    fullName: fullName,
    username: username,
    schoolClass: schoolClass,
    grade: parsedGrade,
    role: schoolClass === 'Məşqçi' ? 'coach' : schoolClass === 'Müəllim' ? 'teacher' : 'student',
    avatar: avatar,
    pin: pin,
    createdAt: Date.now()
  };

  users.push(newUser);
  localStorage.setItem('tdv_registered_users_v1', JSON.stringify(users));

  const session = {
    userId: newUser.userId,
    username: newUser.username,
    fullName: newUser.fullName,
    role: newUser.role,
    schoolClass: newUser.schoolClass,
    grade: newUser.grade,
    avatar: newUser.avatar,
    token: 'tdv_sec_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
  };

  localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(session));
  dispatchSSOBrokerState(session, users);
  showAuthFeedback('✨ Vahid profiliniz uğurla yaradıldı! Giriş edilir...', true);
  setTimeout(() => {
    closeAuthModal();
    if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
    if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
  }, 500);
}
window.handleAuthRegisterSubmit = handleAuthRegisterSubmit;

function logoutEcosystemUser() {
  localStorage.removeItem('tdv_ecosystem_session_v1');
  dispatchSSOBrokerState(null, getRegisteredEcosystemUsers());
  showAuthFeedback('Çıxış edildi.', true);
  setTimeout(() => {
    closeAuthModal();
    if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
    if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
  }, 400);
}
window.logoutEcosystemUser = logoutEcosystemUser;

(function initTDVEcosystemSSO() {
  const BROKER_URL = 'https://tdv-hub.vercel.app/sso-broker.html';
  const ECO_DOMAINS = [
    'school-minifootball-tournament.vercel.app',
    'tdv-e-school.vercel.app',
    'tdv-games.vercel.app',
    'tdv-mafia.vercel.app',
    'tdv-hub.vercel.app'
  ];

  // 1. Extract sso_ticket from URL parameter
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('sso_ticket');
    if (ticket) {
      const sessionData = JSON.parse(decodeURIComponent(escape(atob(ticket))));
      if (sessionData && (sessionData.username || sessionData.fullName)) {
        localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(sessionData));
        urlParams.delete('sso_ticket');
        const cleanSearch = urlParams.toString();
        const cleanUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  } catch (err) {
    console.warn('[SSO] Ticket parse error:', err);
  }

  // 2. Decorate all outbound ecosystem links
  function decorateEcosystemLinks() {
    try {
      const raw = localStorage.getItem('tdv_ecosystem_session_v1');
      if (!raw) return;
      const session = JSON.parse(raw);
      if (!session || (!session.username && !session.fullName)) return;
      const ticket = btoa(unescape(encodeURIComponent(JSON.stringify(session))));

      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        const isEco = ECO_DOMAINS.some(domain => href.includes(domain)) || href.endsWith('games.html');
        if (isEco && !href.includes('sso_ticket=')) {
          const sep = href.includes('?') ? '&' : '?';
          link.setAttribute('href', `${href}${sep}sso_ticket=${encodeURIComponent(ticket)}`);
        }
      });
    } catch (e) {
      console.warn('[SSO] Link decoration error:', e);
    }
  }

  // 3. Render User Badge
  function renderUserSessionBadge() {
    try {
      const raw = localStorage.getItem('tdv_ecosystem_session_v1');
      const loginBtn = document.getElementById('tdvLoginBtn');
      const badge = document.getElementById('tdvUserBadgeContainer');
      const nameEl = document.getElementById('tdvUserName');
      const avatarEl = document.getElementById('tdvUserAvatar');
      const roleEl = document.getElementById('tdvUserRoleBadge');
      const mobileText = document.getElementById('mobileAuthBtnText');

      if (!raw) {
        if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
        if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
        if (mobileText) mobileText.textContent = 'Daxil Ol / Qeydiyyat';
        return;
      }

      const sess = JSON.parse(raw);
      if (!sess || (!sess.username && !sess.fullName)) {
        if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
        if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
        if (mobileText) mobileText.textContent = 'Daxil Ol / Qeydiyyat';
        return;
      }

      // Ghost check against registered users
      const users = getRegisteredEcosystemUsers();
      const valid = users.some(u => u && u.username && u.username.toLowerCase() === sess.username?.toLowerCase());
      if (!valid) {
        localStorage.removeItem('tdv_ecosystem_session_v1');
        if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
        if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
        if (mobileText) mobileText.textContent = 'Daxil Ol / Qeydiyyat';
        return;
      }

      if (nameEl) nameEl.textContent = sess.fullName || sess.username;
      if (avatarEl) avatarEl.textContent = sess.avatar || '👤';
      if (roleEl) roleEl.textContent = sess.schoolClass || (sess.grade ? sess.grade + 'A' : 'Profil');
      if (loginBtn) { loginBtn.classList.add('hidden'); loginBtn.classList.remove('inline-flex'); }
      if (badge) { badge.classList.remove('hidden'); badge.classList.add('inline-flex'); }
      if (mobileText) mobileText.textContent = (sess.fullName || sess.username) + ' (Profil)';
    } catch (err) {}
  }

  // 4. Background broker sync
  function syncFromBroker() {
    if (window.location.pathname.endsWith('sso-broker.html')) return;
    try {
      const iframe = document.createElement('iframe');
      iframe.src = BROKER_URL;
      iframe.style.display = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('tabindex', '-1');

      window.addEventListener('message', function onBrokerMsg(e) {
        if (!e.data || e.data.type !== 'TDV_SSO_STATE') return;
        if (e.data.session) {
          localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(e.data.session));
          renderUserSessionBadge();
          decorateEcosystemLinks();
        }
        if (e.data.users && Array.isArray(e.data.users)) {
          try {
            const existing = JSON.parse(localStorage.getItem('tdv_registered_users_v1') || '[]');
            const map = new Map();
            existing.forEach(u => u && u.username && map.set(u.username.toLowerCase(), u));
            e.data.users.forEach(u => u && u.username && map.set(u.username.toLowerCase(), u));
            localStorage.setItem('tdv_registered_users_v1', JSON.stringify(Array.from(map.values())));
          } catch {}
        }
      });

      iframe.onload = function () {
        try {
          iframe.contentWindow.postMessage({ type: 'TDV_SSO_GET' }, '*');
        } catch {}
      };
      document.body.appendChild(iframe);
    } catch {}
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderUserSessionBadge();
      decorateEcosystemLinks();
      syncFromBroker();
    });
  } else {
    renderUserSessionBadge();
    decorateEcosystemLinks();
    syncFromBroker();
  }
})();

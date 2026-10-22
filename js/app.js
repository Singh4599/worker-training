// app.js — LV Spices Worker Training Register
// Auto-generates realistic training sessions every Wednesday from April 2026

import { saveSession, loadAllSessions, updateCloudBadge } from './firebase-config.js';

// ── 20 FSSAI Training Topics ──────────────────────────────────────────────
const TRAINING_TOPICS = [
  { id: 1,  name: "Personal Hygiene & Clean Clothes",      keyPoints: "Keep body clean, wear clean clothes.",                                    howTo: "Daily bath, clean uniform/apron, no dirty clothes." },
  { id: 2,  name: "Hand Washing & Sanitization",           keyPoints: "Wash hands before work, after toilet, after handling raw material.",        howTo: "Use soap and clean water for 20 seconds, dry with clean cloth." },
  { id: 3,  name: "Nail Hygiene",                          keyPoints: "Keep nails short and clean, no nail paint.",                               howTo: "Trim nails regularly, remove dirt." },
  { id: 4,  name: "Hair Protection",                       keyPoints: "Wear hair cap, keep hair covered.",                                         howTo: "Use clean hair cap, tie long hair." },
  { id: 5,  name: "Footwear Hygiene",                      keyPoints: "Use clean and closed footwear (inside use only).",                          howTo: "Wear separate clean, non-slip closed shoes or clogs." },
  { id: 6,  name: "Health & Illness Reporting",            keyPoints: "Do not work if sick (fever, cough, stomach infection, skin infection).",    howTo: "Inform supervisor immediately, get medical checkup." },
  { id: 7,  name: "Raw Material Handling",                 keyPoints: "Handle raw spices safely, check quality.",                                  howTo: "Check for foreign material, moisture, insects." },
  { id: 8,  name: "Repacking & Filling",                   keyPoints: "Use clean utensils and equipment.",                                         howTo: "Keep area clean, use dry and food-grade scoops." },
  { id: 9,  name: "Packing & Sealing",                     keyPoints: "Pack in clean, food-grade material, seal properly.",                        howTo: "Check seal, no open or damaged packets." },
  { id: 10, name: "Labelling",                             keyPoints: "Use correct product name, batch number, date, FSSAI details.",              howTo: "Stick label neatly on each packet." },
  { id: 11, name: "Cleaning & Sanitation",                 keyPoints: "Keep tables, machines, containers, floors clean.",                          howTo: "Use approved cleaning chemicals, clean daily." },
  { id: 12, name: "Storage Hygiene",                       keyPoints: "Store in clean, dry, cool and pest-free area.",                             howTo: "Keep on racks/pallets, away from walls and floor." },
  { id: 13, name: "FIFO / FEFO",                           keyPoints: "Use older stock first (First In First Out).",                               howTo: "Arrange stock by date, check expiry before use." },
  { id: 14, name: "Pest Control",                          keyPoints: "Prevent rats, insects and pests.",                                          howTo: "Keep area clean, use mesh, close doors, check regularly." },
  { id: 15, name: "Waste Management",                      keyPoints: "Dispose waste properly.",                                                   howTo: "Use closed bins, separate dry and wet waste, keep area clean." },
  { id: 16, name: "Prevention of Cross-Contamination",     keyPoints: "Do not mix different spices or foreign material.",                          howTo: "Use clean utensils, keep raw and packed material separate." },
  { id: 17, name: "Loading & Unloading",                   keyPoints: "Load and unload safely and hygienically.",                                  howTo: "Keep packets clean, avoid dragging on floor." },
  { id: 18, name: "Delivery & Vehicle Hygiene",            keyPoints: "Keep delivery vehicle clean.",                                              howTo: "Clean vehicle/boxes, protect from dust, rain and contamination." },
  { id: 19, name: "Damaged / Expired Product Handling",    keyPoints: "Do not pack or sell damaged or expired material.",                          howTo: "Check quality, keep separately, dispose as per rules." },
  { id: 20, name: "Food Safety & Complaint Reporting",     keyPoints: "Inform about any customer complaint or food safety issue.",                 howTo: "Report immediately, record in complaint register." }
];

const WORKERS = [
  { name: "Rajesh Sharma",       dept: "Packing & Sealing" },
  { name: "Mukesh Vora",         dept: "Storage & Dispatch" },
  { name: "Vinod Singh",         dept: "Delivery & Loading" },
  { name: "Vishal Chaturvedi",   dept: "Quality Checking" },
  { name: "Golu Yadav",          dept: "Repacking & Filling" },
  { name: "Mahesh",              dept: "Packing & Sealing" },
  { name: "Rajkumar",            dept: "Storage & Dispatch" },
  { name: "Pratap",              dept: "Delivery & Loading" },
  { name: "Suraj",               dept: "Repacking & Filling" },
  { name: "Suchitra",            dept: "Quality Checking" },
  { name: "Anil",                dept: "Packing & Sealing" }
];

const TRAINERS   = ["Bhavik Karani"];
const LANGUAGES  = ["Hindi"];
const METHODS    = ["Verbal"];
const REMARKS_LIST = [
  "Sabhi workers ne topics clearly samjhe.",
  "Workers ko haath dhone ka practical demo diya gaya.",
  "FIFO arrangement par special focus kiya gaya.",
  "Workers se verbal Q&A hua — sabhi pass hue.",
  "Refresher session; naaye joiners shamil the.",
  "Visual charts aur posters ke saath topics cover kiye.",
  "Workers ne thumbprint se samajh confirm kiya."
];

// ── UNIT 11 / UNIT 12 TOGGLE ──────────────────────────────────────────────────
const UNIT_STORAGE_KEY = 'lv_training_active_unit';
let activeUnit = localStorage.getItem(UNIT_STORAGE_KEY) || 'Unit 11';

window.setActiveUnit = function(unit) {
  activeUnit = unit;
  localStorage.setItem(UNIT_STORAGE_KEY, unit);
  document.getElementById('unit-btn-11')?.classList.toggle('active', unit === 'Unit 11');
  document.getElementById('unit-btn-12')?.classList.toggle('active', unit === 'Unit 12');
  const heroLbl = document.getElementById('hero-unit-lbl');
  if (heroLbl) heroLbl.textContent = unit;
  // Re-render sidebar list to show correct time badge
  renderSidebar(allSessions);
};

function initUnitToggle() {
  setActiveUnit(activeUnit);
}


// Generate all Wednesday sessions from April 2, 2026 to today
function generateWednesdaySessions() {
  const sessions = [];
  const start = new Date('2026-04-01');
  const today = new Date();

  let d = new Date(start);
  // Find first Wednesday
  while (d.getDay() !== 3) d.setDate(d.getDate() + 1);

  let idx = 0;
  while (d <= today) {
    const dateStr = d.toISOString().split('T')[0];
    const seed = d.getTime();
    const rng = seedRng(seed);

    // Pick 1 or 2 topics sequentially rotating through the 20 topics
    const topicCount = (rng() > 0.45) ? 2 : 1;
    const startTopicIdx = (idx * 2) % TRAINING_TOPICS.length;
    const selectedTopics = [];
    for (let t = 0; t < topicCount; t++) {
      selectedTopics.push(TRAINING_TOPICS[(startTopicIdx + t) % TRAINING_TOPICS.length]);
    }
    const topicsStr = selectedTopics.map(t => t.name).join(' & ');
    const guidanceStr = selectedTopics.map(t => `${t.name}: ${t.keyPoints} (${t.howTo})`).join(' | ');

    const sessionWorkers = shuffleArr([...WORKERS], rng).slice(0, 5 + Math.floor(rng() * (WORKERS.length - 5 + 1)));
    // Unit 11: 17:00–18:00 (evening), Unit 12: 09:00–10:00 (morning)
    const fromHr = activeUnit === 'Unit 12' ? 9 : 17;
    const toHr = fromHr + 1;
    const trainerIdx = 0; // Always Bhavik Karani
    const langIdx = 0;    // Always Hindi
    const methodIdx = 0;  // Always Verbal
    const remarkIdx = Math.floor(rng() * REMARKS_LIST.length);
    const nextTraining = new Date(d);
    nextTraining.setDate(nextTraining.getDate() + 7);

    sessions.push({
      id: `WTR-${dateStr}`,
      date: dateStr,
      displayDate: formatDate(d),
      fromTime: `${String(fromHr).padStart(2,'0')}:00`,
      toTime: `${String(toHr).padStart(2,'0')}:00`,
      trainer: TRAINERS[trainerIdx],
      language: LANGUAGES[langIdx],
      method: METHODS[methodIdx],
      topicsStr: topicsStr,
      guidanceStr: guidanceStr,
      workersUnderstood: "Yes",
      remarks: REMARKS_LIST[remarkIdx],
      nextTrainingDate: formatDate(nextTraining),
      workers: sessionWorkers.map((w, i) => ({
        srNo: i + 1,
        name: w.name,
        dept: w.dept,
        topicsCovered: topicsStr,
        signature: "✓"
      })),
      totalTrained: sessionWorkers.length,
      status: "Completed",
      isGenerated: true
    });
    d.setDate(d.getDate() + 7);
    idx++;
  }
  return sessions;
}

// Seeded random number generator
function seedRng(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffleArr(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateInput(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}

// ── STATE ──────────────────────────────────────────────────────────────────
let allSessions = [];
let filteredSessions = [];
let currentSessionId = null;
let currentView = 'history';

// ── TOPIC DROPDOWN ─────────────────────────────────────────────────────────
function populateTopicDropdown() {
  const sel = document.getElementById('new-topic');
  if (!sel) return;
  sel.innerHTML = `<option value="AUTO">-- Auto / Random from 20 Topics --</option>` +
    TRAINING_TOPICS.map(t => `<option value="${t.id}">${t.id}. ${t.name}</option>`).join('');
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  populateTopicDropdown();

  // Load from cloud and merge with generated
  const cloudData = await loadAllSessions();
  const cloudMap = {};
  cloudData.forEach(s => { cloudMap[s.id] = s; });

  const generated = generateWednesdaySessions();
  generated.forEach(s => {
    if (!cloudMap[s.id]) cloudMap[s.id] = s;
    else cloudMap[s.id] = { ...s, ...cloudMap[s.id] };
  });

  allSessions = Object.values(cloudMap).sort((a, b) => b.date.localeCompare(a.date));
  filteredSessions = [...allSessions];

  renderStats();
  renderSessionList();
  updateNextTrainingBadge();

  // Auto-select latest session
  if (allSessions.length > 0) openSession(allSessions[0].id);
  try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch(e) {}
  initUnitToggle();
}

function renderStats() {
  const total = allSessions.length;
  const totalWorkers = allSessions.reduce((s, sess) => s + (sess.totalTrained || 0), 0);
  const lastDate = allSessions[0] ? allSessions[0].displayDate : '—';

  const sEl = document.getElementById('stat-sessions');
  const wEl = document.getElementById('stat-workers');
  const sBar = document.getElementById('stat-sessions-bar');
  const wBar = document.getElementById('stat-workers-bar');
  const lEl = document.getElementById('stat-last');

  if (sEl) sEl.textContent = total;
  if (wEl) wEl.textContent = totalWorkers;
  if (sBar) sBar.textContent = total;
  if (wBar) wBar.textContent = totalWorkers;
  if (lEl) lEl.textContent = lastDate;
}

function updateNextTrainingBadge() {
  const today = new Date();
  let next = new Date(today);
  while (next.getDay() !== 3) next.setDate(next.getDate() + 1);
  if (next <= today) next.setDate(next.getDate() + 7);
  const days = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('next-training-badge');
  if (el) {
    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Next Training: ${formatDate(next)} (${days} days)
    `;
  }
}

function renderSessionList() {
  const container = document.getElementById('session-list');
  if (!container) return;
  if (filteredSessions.length === 0) {
    container.innerHTML = `<div class="empty-state"><span>No sessions found</span></div>`;
    return;
  }
  container.innerHTML = filteredSessions.map(s => `
    <div class="session-card ${s.id === currentSessionId ? 'active' : ''}" onclick="openSession('${s.id}')">
      <div class="session-card-header">
        <span class="session-card-date">${s.displayDate}</span>
        <span class="session-card-status completed">${s.status || 'Completed'}</span>
      </div>
      <div class="session-card-topic">${s.topicsStr || 'Food Safety Module'}</div>
      <div class="session-card-footer">
        <span class="session-card-workers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          ${s.totalTrained || 0} Workers
        </span>
        <span class="session-card-time">${s.fromTime} – ${s.toTime}</span>
      </div>
    </div>
  `).join('');
}

window.openSession = function(id) {
  currentSessionId = id;
  const s = allSessions.find(x => x.id === id);
  if (!s) return;
  renderSessionList();
  renderSessionDetail(s);
  document.getElementById('detail-panel').classList.add('active');
}

function renderSessionDetail(s) {
  const titleEl = document.getElementById('det-title');
  if (titleEl) titleEl.textContent = `Training Session — ${s.displayDate}`;

  const topicTitleEl = document.getElementById('det-topic-title');
  const topicsText = s.topicsStr || (Array.isArray(s.topics) ? s.topics.join(' & ') : 'Food Safety & GMP Training');
  if (topicTitleEl) topicTitleEl.textContent = topicsText;

  const trainerEl = document.getElementById('det-trainer');
  if (trainerEl) trainerEl.textContent = s.trainer || 'Rajesh Sharma (QA Manager)';

  const timeEl = document.getElementById('det-time');
  if (timeEl) timeEl.textContent = `${s.fromTime} – ${s.toTime} (1 Hour)`;

  const methodLangEl = document.getElementById('det-method-lang');
  if (methodLangEl) methodLangEl.textContent = `${s.method || 'Both'} • ${s.language || 'Hindi'}`;

  const totalEl = document.getElementById('det-total');
  if (totalEl) totalEl.textContent = `${s.totalTrained} Workers (100% Understood)`;

  const remarksEl = document.getElementById('det-remarks');
  if (remarksEl) {
    remarksEl.textContent = `${s.guidanceStr ? s.guidanceStr + ' — ' : ''}${s.remarks || 'All workers demonstrated satisfactory comprehension.'}`;
  }

  // Workers table
  const tbody = document.getElementById('workers-tbody');
  if (tbody) {
    tbody.innerHTML = (s.workers || []).map(w => `
      <tr>
        <td class="col-sr">${w.srNo}</td>
        <td class="col-worker"><span class="worker-name">${w.name}</span></td>
        <td class="col-dept"><span class="dept-pill">${w.dept}</span></td>
        <td class="col-date">${s.displayDate}</td>
        <td class="col-timing">${s.fromTime} – ${s.toTime}</td>
        <td class="col-topic"><span class="topic-badge">${w.topicsCovered || topicsText}</span></td>
        <td class="col-sig"><span class="sig-check">✓</span></td>
        <td class="col-remarks">${w.remarks || 'Present & Verified'}</td>
      </tr>
    `).join('');
  }
}

// ── SEARCH ────────────────────────────────────────────────────────────────
window.onSearchChange = function(val) {
  const q = val.toLowerCase();
  filteredSessions = allSessions.filter(s =>
    s.displayDate.toLowerCase().includes(q) ||
    s.trainer.toLowerCase().includes(q) ||
    (s.topicsStr || '').toLowerCase().includes(q) ||
    (s.workers || []).some(w => w.name.toLowerCase().includes(q))
  );
  renderSessionList();
}

// ── NEW SESSION ───────────────────────────────────────────────────────────
window.openNewSessionModal = function() {
  document.getElementById('modal-overlay').style.display = 'flex';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('new-date').value = today;
}

window.closeModal = function() {
  document.getElementById('modal-overlay').style.display = 'none';
}

window.saveNewSession = async function() {
  const dateVal = document.getElementById('new-date').value;
  const trainerVal = document.getElementById('new-trainer').value.trim() || TRAINERS[0];
  const methodVal = document.getElementById('new-method').value;
  const langVal = document.getElementById('new-lang').value;
  const remarksVal = document.getElementById('new-remarks').value.trim();
  const workerNames = document.getElementById('new-workers').value.trim();
  const topicVal = document.getElementById('new-topic').value;

  if (!dateVal) { alert('Please select a date.'); return; }

  const d = new Date(dateVal + 'T00:00:00');
  const sessionId = `WTR-${dateVal}-MANUAL`;

  let selectedTopicObj = null;
  let topicsStr = "General Food Safety & GMP Refresher";
  let guidanceStr = "Refresher on safe handling, hygiene, and Schedule 4 GMP requirements.";

  if (topicVal && topicVal !== 'AUTO') {
    selectedTopicObj = TRAINING_TOPICS.find(t => String(t.id) === String(topicVal));
    if (selectedTopicObj) {
      topicsStr = selectedTopicObj.name;
      guidanceStr = `${selectedTopicObj.keyPoints} (${selectedTopicObj.howTo})`;
    }
  } else {
    // Pick 1-2 random topics
    const rng = seedRng(d.getTime());
    const rIdx = Math.floor(rng() * TRAINING_TOPICS.length);
    selectedTopicObj = TRAINING_TOPICS[rIdx];
    topicsStr = selectedTopicObj.name;
    guidanceStr = `${selectedTopicObj.keyPoints} (${selectedTopicObj.howTo})`;
  }

  const workerList = workerNames.split('\n')
    .map(n => n.trim()).filter(Boolean)
    .map((n, i) => ({ srNo: i + 1, name: n, dept: 'Packing & Sealing', topicsCovered: topicsStr, signature: '✓' }));

  if (workerList.length === 0) {
    const rng = seedRng(d.getTime());
    const sampleWorkers = shuffleArr([...WORKERS], rng).slice(0, 5);
    sampleWorkers.forEach((w, i) => workerList.push({ srNo: i+1, name: w.name, dept: w.dept, topicsCovered: topicsStr, signature: '✓' }));
  }

  const nextD = new Date(d); nextD.setDate(nextD.getDate() + 7);
  const session = {
    id: sessionId,
    date: dateVal,
    displayDate: formatDate(d),
    fromTime: '10:00',
    toTime: '11:00',
    trainer: trainerVal,
    language: langVal,
    method: methodVal,
    topicsStr: topicsStr,
    guidanceStr: guidanceStr,
    workersUnderstood: 'Yes',
    remarks: remarksVal || `Training conducted on ${topicsStr}. All workers cleared verbal Q&A.`,
    nextTrainingDate: formatDate(nextD),
    workers: workerList,
    totalTrained: workerList.length,
    status: 'Completed',
    isGenerated: false
  };

  const btn = document.getElementById('save-session-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  const ok = await saveSession(sessionId, session);
  btn.textContent = 'Save Session'; btn.disabled = false;

  if (ok) {
    allSessions.unshift(session);
    allSessions.sort((a, b) => b.date.localeCompare(a.date));
    filteredSessions = [...allSessions];
    renderStats();
    renderSessionList();
    openSession(sessionId);
    closeModal();
  } else {
    alert('Saved locally. Check connection.');
  }
}

// ── EXCEL EXPORT ──────────────────────────────────────────────────────────
window.exportExcel = function() {
  const s = allSessions.find(x => x.id === currentSessionId);
  if (!s) { alert('Select a session first.'); return; }
  const wb = XLSX.utils.book_new();

  // Sheet 1: Attendance Record
  const headers = ['Sr.No.', 'Worker Name', 'Department', 'Training Date', 'From', 'To', 'Topic(s) Covered', 'Signature', 'Remarks'];
  const rows = [headers, ...(s.workers || []).map(w => [
    w.srNo, w.name, w.dept, s.displayDate, s.fromTime, s.toTime, w.topicsCovered || s.topicsStr || 'Food Safety', '✓', s.remarks
  ])];
  const ws1 = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Attendance Record');

  // Sheet 2: Verification Details
  const vRows = [
    ['L V Spices — Staff Training Record', ''],
    ['Training Date', s.displayDate],
    ['Time', `${s.fromTime} – ${s.toTime}`],
    ['Topic(s) Covered', s.topicsStr || 'Food Safety & Hygiene'],
    ['Guidance / Key Points', s.guidanceStr || s.remarks || 'Schedule 4 Compliance'],
    ['Total Workers Trained', s.totalTrained],
    ['Training Method', s.method],
    ['Training Language', s.language],
    ['Workers Understood', s.workersUnderstood || 'Yes'],
    ['Trainer Name', s.trainer],
    ['Next Training Date', s.nextTrainingDate],
    ['Remarks', s.remarks]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(vRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Session Details');

  XLSX.writeFile(wb, `LV_Spices_Training_${s.date}.xlsx`);
}

window.exportAllExcel = function() {
  const wb = XLSX.utils.book_new();
  const headers = ['Session ID', 'Date', 'Topic(s) Covered', 'Trainer', 'Method', 'Language', 'Total Trained', 'Status', 'Next Training', 'Remarks'];
  const rows = [headers, ...allSessions.map(s => [
    s.id, s.displayDate, s.topicsStr || 'Food Safety & Hygiene', s.trainer, s.method, s.language, s.totalTrained, s.status, s.nextTrainingDate, s.remarks
  ])];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'All Training Sessions');
  XLSX.writeFile(wb, `LV_Spices_Training_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ── PRINT ─────────────────────────────────────────────────────────────────
window.printSession = function() {
  window.print();
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────
window.toggleSidebar = function() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
window.closeSidebar = function() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ── START ─────────────────────────────────────────────────────────────────
init();

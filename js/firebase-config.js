// firebase-config.js — LV Spices Worker Training Register
// Project: workertraining-af5bf | Collection: training_sessions

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDrXf2fMkYkLEutwebfH3lq-QdJaSiFFuw",
  authDomain: "workertraining-af5bf.firebaseapp.com",
  projectId: "workertraining-af5bf",
  storageBucket: "workertraining-af5bf.firebasestorage.app",
  messagingSenderId: "958382416900",
  appId: "1:958382416900:web:9af9eba5620c9d90bec151"
};

export const COLLECTION_NAME = "training_sessions";

let db = null;

export function updateCloudBadge(connected) {
  const badge = document.getElementById('cloud-status-badge');
  const dot   = document.getElementById('cloud-status-dot');
  const text  = document.getElementById('cloud-status-text');
  if (!badge) return;
  badge.className = connected ? 'cloud-badge connected' : 'cloud-badge offline';
  text.textContent = connected ? 'Cloud Synced' : 'Local / Offline Mode';
}

export function initFirebase() {
  if (db) return db;
  try {
    const app = getApps().find(a => a.name === 'worker-training') || initializeApp(firebaseConfig, 'worker-training');
    db = getFirestore(app);
    updateCloudBadge(true);
    return db;
  } catch (err) {
    console.warn('[Firebase] Init error:', err);
    updateCloudBadge(false);
    return null;
  }
}

export async function saveSession(sessionId, data) {
  const database = initFirebase();
  if (!database) return false;
  try {
    await setDoc(doc(database, COLLECTION_NAME, sessionId), { ...data, updatedAt: Date.now() }, { merge: true });
    updateCloudBadge(true);
    return true;
  } catch (err) {
    console.error('[Firebase] Save error:', err);
    updateCloudBadge(false);
    return false;
  }
}

export async function loadSession(sessionId) {
  const database = initFirebase();
  if (!database) return null;
  try {
    const snap = await getDoc(doc(database, COLLECTION_NAME, sessionId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    return null;
  }
}

export async function loadAllSessions() {
  const database = initFirebase();
  if (!database) return [];
  try {
    const q = query(collection(database, COLLECTION_NAME), orderBy("date", "desc"), limit(300));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firebase] Load all error:', err);
    return [];
  }
}

try { initFirebase(); } catch (e) {}

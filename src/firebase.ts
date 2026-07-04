/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs, 
  writeBatch,
  Firestore,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';
import { AttendanceRecord, FirebaseConfigSchema, AttendanceStatus } from './types';

// Default config structure pointing to the requested project 'Thai01'
const DEFAULT_FIREBASE_CONFIG: FirebaseConfigSchema = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "thai01-attendance.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "thai01-attendance",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "thai01-attendance.appspot.com",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef"
};

// Check if a custom config has been saved in localStorage by the user
export function getSavedFirebaseConfig(): FirebaseConfigSchema | null {
  try {
    const saved = localStorage.getItem('firebase_config_thai01');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading custom Firebase config:", e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfigSchema) {
  localStorage.setItem('firebase_config_thai01', JSON.stringify(config));
}

export function clearSavedFirebaseConfig() {
  localStorage.removeItem('firebase_config_thai01');
}

// Global instances
let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isConnected = false;

// Initialize Firebase dynamically based on environment or saved credentials
export function initializeFirebase(): boolean {
  const customConfig = getSavedFirebaseConfig();
  const configToUse = customConfig || (DEFAULT_FIREBASE_CONFIG.apiKey ? DEFAULT_FIREBASE_CONFIG : null);

  if (!configToUse || !configToUse.apiKey || configToUse.apiKey.trim() === "") {
    console.log("⚠️ No active Firebase credentials. Running in local mock real-time simulator mode.");
    isConnected = false;
    db = null;
    auth = null;
    return false;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(configToUse);
    } else {
      firebaseApp = getApp();
    }
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    isConnected = true;
    console.log("🔥 Connected to Firebase project: " + configToUse.projectId);
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase with current credentials:", error);
    isConnected = false;
    db = null;
    auth = null;
    return false;
  }
}

// Try initial load
initializeFirebase();

export function isRealFirebaseConnected(): boolean {
  return isConnected;
}

// ==========================================
// MOCK SIMULATOR FOR LOCAL PREVIEW
// ==========================================
// This ensures the application is 100% interactive and beautiful in AI Studio
// even before the user puts in their custom client secrets!
const MOCK_STORAGE_KEY = 'attendance_records_mock';
const MOCK_USER_KEY = 'attendance_mock_user';

interface MockSubscription {
  id: string;
  callback: (records: AttendanceRecord[]) => void;
}
let mockSubscriptions: MockSubscription[] = [];

function notifyMockSubscriptions() {
  const records = getMockRecords();
  mockSubscriptions.forEach(sub => sub.callback(records));
}

function getMockRecords(): AttendanceRecord[] {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestampMillis)
      }));
    } catch {
      return getInitialMockData();
    }
  }
  const initial = getInitialMockData();
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function getInitialMockData(): AttendanceRecord[] {
  const today = new Date();
  return [
    {
      id: 'mock-1',
      studentId: '64010101',
      studentName: 'สมชาย รักเรียน',
      status: 'present',
      timestamp: new Date(today.getTime() - 15 * 60 * 1000),
      timestampMillis: today.getTime() - 15 * 60 * 1000,
      recordedByEmail: 'pak.pao11mee@gmail.com',
      recordedByName: 'ครูสมปอง (Admin)'
    },
    {
      id: 'mock-2',
      studentId: '64010102',
      studentName: 'สมหญิง จริงใจ',
      status: 'present',
      timestamp: new Date(today.getTime() - 12 * 60 * 1000),
      timestampMillis: today.getTime() - 12 * 60 * 1000,
      recordedByEmail: 'pak.pao11mee@gmail.com',
      recordedByName: 'ครูสมปอง (Admin)'
    },
    {
      id: 'mock-3',
      studentId: '64010103',
      studentName: 'วิชัย ชนะภัย',
      status: 'absent',
      timestamp: new Date(today.getTime() - 10 * 60 * 1000),
      timestampMillis: today.getTime() - 10 * 60 * 1000,
      recordedByEmail: 'pak.pao11mee@gmail.com',
      recordedByName: 'ครูสมปอง (Admin)'
    },
    {
      id: 'mock-4',
      studentId: '64010104',
      studentName: 'ปิยะมาศ รักงาม',
      status: 'leave',
      timestamp: new Date(today.getTime() - 8 * 60 * 1000),
      timestampMillis: today.getTime() - 8 * 60 * 1000,
      recordedByEmail: 'guest@example.com',
      recordedByName: 'ผู้ช่วยสอน'
    },
    {
      id: 'mock-5',
      studentId: '64010105',
      studentName: 'กิตติศักดิ์ มีสุข',
      status: 'sick',
      timestamp: new Date(today.getTime() - 5 * 60 * 1000),
      timestampMillis: today.getTime() - 5 * 60 * 1000,
      recordedByEmail: 'guest@example.com',
      recordedByName: 'ผู้ช่วยสอน'
    }
  ];
}

// Student database mock mapping
const STUDENT_DIRECTORY: Record<string, string> = {
  '64010101': 'สมชาย รักเรียน',
  '64010102': 'สมหญิง จริงใจ',
  '64010103': 'วิชัย ชนะภัย',
  '64010104': 'ปิยะมาศ รักงาม',
  '64010105': 'กิตติศักดิ์ มีสุข',
  '64010106': 'ธนาวุฒิ สายดี',
  '64010107': 'นพวรรณ ชื่นใจ',
  '64010108': 'อานนท์ รุ่งเรือง',
  '64010109': 'สิรินทร์ รักษ์สงบ',
  '64010110': 'เกียรติภูมิ มั่นคง'
};

export function lookupStudentName(studentId: string): string {
  return STUDENT_DIRECTORY[studentId] || `นักเรียนรหัส ${studentId}`;
}

// ==========================================
// PUBLIC API FOR AUTH & FIRESTORE
// ==========================================

// Google Sign-In
export async function signInWithGoogle(): Promise<{ user: any; error?: string }> {
  if (isConnected && auth) {
    try {
      const provider = new GoogleAuthProvider();
      // Configure to prompt for account selection
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      return { user: result.user };
    } catch (error: any) {
      console.error("Firebase auth error:", error);
      return { user: null, error: error.message };
    }
  } else {
    // Local mock sign-in with default email pak.pao11mee@gmail.com
    console.log("Mock Sign-In triggered");
    const mockUser = {
      uid: 'mock-admin-uid',
      email: 'pak.pao11mee@gmail.com',
      displayName: 'คุณครู Pak Pao (Admin)',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    // Trigger mock state changes immediately
    if (mockAuthListener) {
      mockAuthListener(mockUser as any);
    }
    return { user: mockUser };
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  if (isConnected && auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
    if (mockAuthListener) {
      mockAuthListener(null);
    }
  }
}

let mockAuthListener: ((user: User | null) => void) | null = null;

// Auth State Change listener
export function onAuthStateChangedListener(callback: (user: User | null) => void) {
  if (isConnected && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    mockAuthListener = callback;
    const stored = localStorage.getItem(MOCK_USER_KEY);
    if (stored) {
      try {
        callback(JSON.parse(stored) as any);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    // Return unsubscribe function
    return () => {
      mockAuthListener = null;
    };
  }
}

// Check if email is admin
export function checkIsAdmin(email: string | null): boolean {
  if (!email) return false;
  // User explicitly requested: "ให้เมล์นี้เป็น admin" (pak.pao11mee@gmail.com)
  return email.toLowerCase() === 'pak.pao11mee@gmail.com';
}

// Save attendance record
export async function saveAttendanceRecord(
  studentId: string, 
  status: AttendanceStatus,
  user: { email: string; displayName: string }
): Promise<string> {
  const studentName = lookupStudentName(studentId);
  const now = new Date();

  if (isConnected && db) {
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        studentId,
        studentName,
        status,
        timestamp: Timestamp.fromDate(now),
        timestampMillis: now.getTime(),
        recordedByEmail: user.email,
        recordedByName: user.displayName
      });
      return docRef.id;
    } catch (error) {
      console.error("Firestore save error:", error);
      throw error;
    }
  } else {
    // Mock Save
    const records = getMockRecords();
    const newRecord: AttendanceRecord = {
      id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      studentId,
      studentName,
      status,
      timestamp: now,
      timestampMillis: now.getTime(),
      recordedByEmail: user.email,
      recordedByName: user.displayName
    };
    
    // Add to beginning of array (newest first)
    records.unshift(newRecord);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(records));
    notifyMockSubscriptions();
    return newRecord.id;
  }
}

// Delete attendance record
export async function deleteAttendanceRecord(id: string): Promise<void> {
  if (isConnected && db) {
    try {
      await deleteDoc(doc(db, 'attendance', id));
    } catch (error) {
      console.error("Firestore delete error:", error);
      throw error;
    }
  } else {
    // Mock delete
    const records = getMockRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(filtered));
    notifyMockSubscriptions();
  }
}

// Real-time subscription to attendance list
export function subscribeToAttendance(callback: (records: AttendanceRecord[]) => void) {
  if (isConnected && db) {
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const records: AttendanceRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firebase Timestamp to JS Date safely
        let jsDate = new Date();
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            jsDate = data.timestamp.toDate();
          } else if (data.timestamp.seconds) {
            jsDate = new Date(data.timestamp.seconds * 1000);
          } else {
            jsDate = new Date(data.timestamp);
          }
        }
        records.push({
          id: doc.id,
          studentId: data.studentId || '',
          studentName: data.studentName || lookupStudentName(data.studentId),
          status: data.status as AttendanceStatus,
          timestamp: jsDate,
          timestampMillis: data.timestampMillis || jsDate.getTime(),
          recordedByEmail: data.recordedByEmail || 'unknown',
          recordedByName: data.recordedByName || 'Unknown User'
        });
      });
      callback(records);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
    });
  } else {
    // Mock Subscription
    const subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
    mockSubscriptions.push({ id: subscriptionId, callback });
    // Execute immediately
    callback(getMockRecords());
    
    // Return unsubscribe function
    return () => {
      mockSubscriptions = mockSubscriptions.filter(sub => sub.id !== subscriptionId);
    };
  }
}

// Clear all records (Admin tool)
export async function clearAllAttendance(): Promise<void> {
  if (isConnected && db) {
    try {
      const q = query(collection(db, 'attendance'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Firestore clear error:", error);
      throw error;
    }
  } else {
    // Mock clear
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify([]));
    notifyMockSubscriptions();
  }
}

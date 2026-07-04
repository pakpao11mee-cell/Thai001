/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'sick';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  status: AttendanceStatus;
  timestamp: Date; // For UI usage
  timestampMillis: number; // For clean Firebase storage and sorting
  recordedByEmail: string;
  recordedByName: string;
}

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

export interface FirebaseConfigSchema {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  onAuthStateChangedListener, 
  signInWithGoogle, 
  signOutUser, 
  checkIsAdmin,
  saveAttendanceRecord,
  deleteAttendanceRecord,
  subscribeToAttendance,
  clearAllAttendance,
  isRealFirebaseConnected,
  initializeFirebase,
  getSavedFirebaseConfig
} from './firebase';
import { AttendanceRecord, UserSession, AttendanceStatus } from './types';
import { 
  Database, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Settings, 
  Github, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  Chrome,
  AlertCircle
} from 'lucide-react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceTable from './components/AttendanceTable';
import StatsDashboard from './components/StatsDashboard';
import FirebaseConfigModal from './components/FirebaseConfigModal';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(isRealFirebaseConnected());
  const [authLoading, setAuthLoading] = useState(true);

  // Re-initialize firebase and subscriptions when configuration changes
  const handleConfigUpdated = () => {
    initializeFirebase();
    setFirebaseConnected(isRealFirebaseConnected());
  };

  // Subscribe to Authentication state Changes
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribeAuth = onAuthStateChangedListener((firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = checkIsAdmin(firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'ผู้ใช้ทั่วไป',
          photoURL: firebaseUser.photoURL,
          isAdmin: isAdmin
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, [firebaseConnected]);

  // Subscribe to real-time attendance changes
  useEffect(() => {
    const unsubscribeRecords = subscribeToAttendance((updatedRecords) => {
      setRecords(updatedRecords);
    });

    return () => {
      if (typeof unsubscribeRecords === 'function') {
        unsubscribeRecords();
      }
    };
  }, [firebaseConnected]);

  // Action: Save attendance
  const handleSaveRecord = async (studentId: string, status: AttendanceStatus) => {
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนทำการเช็คชื่อ');
    }
    
    await saveAttendanceRecord(studentId, status, {
      email: user.email || 'guest@example.com',
      displayName: user.displayName || 'Guest User'
    });
  };

  // Action: Delete attendance
  const handleDeleteRecord = async (id: string) => {
    if (!user?.isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลได้');
      return;
    }
    if (confirm('คุณต้องการลบประวัติเช็คชื่อนักเรียนรายการนี้ใช่หรือไม่?')) {
      await deleteAttendanceRecord(id);
    }
  };

  // Action: Clear all
  const handleClearAll = async () => {
    if (!user?.isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถล้างข้อมูลทั้งหมดได้');
      return;
    }
    await clearAllAttendance();
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-150 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-base md:text-xl tracking-tight leading-none">ระบบเช็คชื่อเข้าชั้นเรียน</h1>
              <p className="text-[11px] text-slate-400 font-medium">Classroom Attendance System</p>
            </div>
          </div>

          {/* User Session status & Actions */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="flex items-center gap-2.5 bg-slate-100/60 pl-2 pr-3 py-1.5 rounded-2xl border border-slate-200/50">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || ''} 
                    referrerPolicy="no-referrer"
                    className="w-7.5 h-7.5 rounded-full border border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-7.5 h-7.5 bg-indigo-100 text-indigo-700 font-semibold rounded-full flex items-center justify-center text-xs">
                    {(user.displayName || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* User email & Admin Badge */}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-700 leading-tight truncate max-w-[150px]">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none flex items-center gap-1">
                    {user.isAdmin && (
                      <span className="text-indigo-600 font-semibold inline-flex items-center gap-0.5 bg-indigo-50 px-1 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" /> แอดมิน
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">{user.email}</span>
                  </div>
                </div>

                {/* Sign out button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors ml-1"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
              >
                <Chrome className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}

            {/* Config connection button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className={`p-2.5 rounded-xl border transition-all ${
                firebaseConnected 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' 
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-250 hover:bg-slate-100'
              }`}
              title="ตั้งค่าเชื่อมต่อ Firebase"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Database Integration Alert banner */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${firebaseConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span className="text-xs font-medium text-slate-500">
              ฐานข้อมูล: {firebaseConnected ? (
                <>
                  กำลังออนไลน์บน <span className="font-bold text-slate-700">Firebase Firestore</span> (โปรเจกต์ Thai01)
                </>
              ) : (
                <>
                  <span className="font-semibold text-amber-700">โหมดจำลองสถานะชั่วคราว (Mock Database)</span> พร้อมบันทึกในเครื่อง
                </>
              )}
            </span>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline text-left"
          >
            {firebaseConnected ? 'ตรวจสอบข้อมูลเชื่อมต่อ' : '⚙️ คลิกที่นี่เพื่อเชื่อมโยง Firebase จริงของคุณ'}
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        
        {/* Dynamic banner if user is not logged in */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-base md:text-lg font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                ยินดีต้อนรับสู่ระบบเช็คชื่อเข้าชั้นเรียน Thai01
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อระบุตัวตนของคุณในฐานะคุณครูหรือผู้ช่วยสอน 
                เพื่อทำการบันทึกเวลาเรียน ติดตามรายบุคคล ส่งออกประวัติ และเรียกดูสถิตินักเรียนแบบเรียลไทม์
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-150 flex items-center justify-center gap-2 shrink-0 md:self-center"
            >
              <Chrome className="w-4 h-4" />
              <span>เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน</span>
            </button>
          </div>
        )}

        {/* Admin Reminder Banner */}
        {user && !user.isAdmin && (
          <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2.5xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-900">เข้าใช้งานในโหมดผู้ลงบันทึกทั่วไป:</h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                คุณสามารถบันทึกและส่งรายงานเวลาได้ แต่สิทธิ์ในการลบหรือเคลียร์สถิติจำกัดให้เฉพาะบัญชีแอดมินเท่านั้น 
                (เข้าสู่ระบบด้วยอีเมล <strong className="underline">pak.pao11mee@gmail.com</strong> เพื่อทดสอบสิทธิ์แอดมิน)
              </p>
            </div>
          </div>
        )}

        {/* Statistics Dashboard widgets */}
        <StatsDashboard records={records} />

        {/* Workspace Split Layout: Forms & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form container: Upper part (4 columns on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <AttendanceForm 
              onSaveRecord={handleSaveRecord} 
              user={user} 
            />

            {/* Project description card */}
            <div className="bg-slate-100/50 border border-slate-200/40 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">เกี่ยวกับโปรเจกต์:</h4>
              <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4.5">
                <li>เชื่อมโยงระบบเข้ากับฐานข้อมูล <strong>Cloud Firestore</strong> แบบ Real-time synchronization</li>
                <li>สตรีมข้อมูลอัตโนมัติเมื่อเกิดการบันทึกรายการโดยไม่มีดีเลย์</li>
                <li>ออกแบบมาเพื่อให้ทำงานร่วมกับบัญชีผู้ดูแลระบบอย่างสมบูรณ์</li>
                <li>ตารางรองรับ Responsive Viewports สามารถใช้งานบนอุปกรณ์พกพา แท็บเล็ต และเดสก์ท็อปอย่างราบรื่น</li>
              </ul>
            </div>
          </div>

          {/* Table container: Lower part (7 columns on desktop) */}
          <div className="lg:col-span-7">
            <AttendanceTable 
              records={records} 
              isAdmin={!!user?.isAdmin} 
              onDeleteRecord={handleDeleteRecord} 
              onClearAll={handleClearAll} 
            />
          </div>

        </div>

      </main>

      {/* Footer copyright */}
      <footer className="mt-12 border-t border-slate-100 py-6 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} ระบบเช็คชื่อเข้าชั้นเรียน Thai01. สงวนลิขสิทธิ์ทั้งหมด.
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <span>โหมดการทำงาน: {firebaseConnected ? 'Firebase Live' : 'Local Storage Simulator'}</span>
            <span>&bull;</span>
            <button onClick={() => setIsConfigOpen(true)} className="hover:text-indigo-600 transition-colors">
              ตั้งค่าฐานข้อมูล
            </button>
          </div>
        </div>
      </footer>

      {/* Firebase Configurations Popup */}
      <FirebaseConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onConfigUpdated={handleConfigUpdated}
      />

    </div>
  );
}

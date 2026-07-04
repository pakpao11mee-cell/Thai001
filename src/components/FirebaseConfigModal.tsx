/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearSavedFirebaseConfig, 
  isRealFirebaseConnected 
} from '../firebase';
import { FirebaseConfigSchema } from '../types';
import { Database, Settings, RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export default function FirebaseConfigModal({ isOpen, onClose, onConfigUpdated }: FirebaseConfigModalProps) {
  const [config, setConfig] = useState<FirebaseConfigSchema>({
    apiKey: '',
    authDomain: '',
    projectId: 'Thai01', // Set default name as requested
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [jsonPaste, setJsonPaste] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setConfig(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process JSON Paste
  const handleJsonPasteChange = (val: string) => {
    setJsonPaste(val);
    if (!val.trim()) return;

    try {
      // Look for config object inside the snippet
      let cleaned = val.trim();
      // If it looks like a script tag or object declaration, try to extract the JSON-like part
      if (cleaned.includes('{') && cleaned.includes('}')) {
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        cleaned = cleaned.substring(startIdx, endIdx + 1);
      }
      
      // Clean up common JS object properties to make it valid JSON if pasted directly as JS object
      // e.g. apiKey: "..." -> "apiKey": "..."
      cleaned = cleaned
        .replace(/([a-zA-Z0-9]+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        // remove trailing commas before closing braces
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');

      const parsed = JSON.parse(cleaned);
      const extracted: FirebaseConfigSchema = {
        apiKey: parsed.apiKey || '',
        authDomain: parsed.authDomain || '',
        projectId: parsed.projectId || 'Thai01',
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || ''
      };

      setConfig(extracted);
      setStatusMsg({ type: 'success', text: 'ถอดรหัสรูปแบบข้อมูล Firebase Config สำเร็จ!' });
    } catch (e) {
      // Silently try to find matches using regex
      try {
        const apiKeyMatch = val.match(/apiKey\s*:\s*["']([^"']+)["']/);
        const authDomainMatch = val.match(/authDomain\s*:\s*["']([^"']+)["']/);
        const projectIdMatch = val.match(/projectId\s*:\s*["']([^"']+)["']/);
        const storageBucketMatch = val.match(/storageBucket\s*:\s*["']([^"']+)["']/);
        const messagingSenderIdMatch = val.match(/messagingSenderId\s*:\s*["']([^"']+)["']/);
        const appIdMatch = val.match(/appId\s*:\s*["']([^"']+)["']/);

        if (apiKeyMatch) {
          setConfig({
            apiKey: apiKeyMatch ? apiKeyMatch[1] : '',
            authDomain: authDomainMatch ? authDomainMatch[1] : '',
            projectId: projectIdMatch ? projectIdMatch[1] : 'Thai01',
            storageBucket: storageBucketMatch ? storageBucketMatch[1] : '',
            messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
            appId: appIdMatch ? appIdMatch[1] : ''
          });
          setStatusMsg({ type: 'success', text: 'ตรวจจับข้อมูลจากข้อความคัดลอกสำเร็จ!' });
          return;
        }
      } catch (err) {
        // Fallback
      }
      setStatusMsg({ type: 'error', text: 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบหรือกรอกผ่านฟอร์มแมนนวล' });
    }
  };

  const handleSave = () => {
    if (!config.apiKey || !config.projectId) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกข้อมูลสำคัญอย่างน้อย API Key และ Project ID' });
      return;
    }

    saveFirebaseConfig(config);
    setStatusMsg({ type: 'success', text: 'บันทึกการตั้งค่าแล้ว! กำลังโหลดเพื่อเชื่อมต่อฐานข้อมูลของคุณ...' });
    
    setTimeout(() => {
      onConfigUpdated();
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    clearSavedFirebaseConfig();
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: 'Thai01',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    setJsonPaste('');
    setStatusMsg({ type: 'success', text: 'ยกเลิกการเชื่อมต่อ และเปลี่ยนกลับสู่โหมดจำลอง (Mock Simulator)' });
    
    setTimeout(() => {
      onConfigUpdated();
      onClose();
    }, 1200);
  };

  const isConnected = isRealFirebaseConnected();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 text-indigo-600 bg-indigo-50 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">ตั้งค่าการเชื่อมต่อ Firebase</h3>
              <p className="text-xs text-slate-500">เชื่อมต่อกับฐานข้อมูล Firestore และ Google Auth ของคุณ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">สถานะระบบฐานข้อมูล:</span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งาน Firebase จริง
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> โหมดจำลอง (Mock Engine)
              </span>
            )}
          </div>
          {isConnected && (
            <button 
              onClick={handleDisconnect}
              className="text-xs text-red-600 hover:underline hover:text-red-700 font-medium"
            >
              รีเซ็ตค่าเชื่อมต่อ
            </button>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Message */}
          {statusMsg.type && (
            <div className={`p-3.5 rounded-xl border text-sm flex items-start gap-3 ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                : 'bg-rose-50 border-rose-150 text-rose-800'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Quick Guide */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
              <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
              วิธีการตั้งค่าในฐานข้อมูลหลักของคุณ:
            </h4>
            <ol className="text-xs text-blue-800 list-decimal pl-4.5 space-y-1">
              <li>ไปที่คอนโซล <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-medium hover:text-blue-900">Firebase Console</a></li>
              <li>สร้างหรือเปิดโปรเจกต์ <strong>Thai01</strong> (หรือโปรเจกต์ของคุณ)</li>
              <li>เปิดใช้งานบริการ <strong>Cloud Firestore</strong> และ <strong>Authentication (เลือก Google Sign-In)</strong></li>
              <li>คัดลอกโค้ดสคริปต์การตั้งค่า Web App Config จากหน้าเว็บควบคุม มาวางที่แถบด้านล่างนี้</li>
            </ol>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 text-center transition-colors ${
                activeTab === 'form' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ระบุทีละฟิลด์
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 text-center transition-colors ${
                activeTab === 'json' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              วางโค้ด Config ตรงๆ (สะดวกที่สุด)
            </button>
          </div>

          {activeTab === 'form' ? (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">API Key *</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({...config, apiKey: e.target.value})}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Project ID *</label>
                  <input
                    type="text"
                    value={config.projectId}
                    onChange={e => setConfig({...config, projectId: e.target.value})}
                    placeholder="thai01-attendance"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={config.authDomain}
                    onChange={e => setConfig({...config, authDomain: e.target.value})}
                    placeholder="thai01-attendance.firebaseapp.com"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">App ID</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={e => setConfig({...config, appId: e.target.value})}
                  placeholder="1:1234567890:web:abcdef"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">วางสคริปต์ตั้งค่า Firebase Config จากหน้าเว็บควบคุม</label>
              <textarea
                rows={5}
                value={jsonPaste}
                onChange={e => handleJsonPasteChange(e.target.value)}
                placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "thai01.firebaseapp.com",
  projectId: "Thai01",
  storageBucket: "thai01.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};`}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono bg-slate-50 text-slate-700"
              />
              <p className="text-[10px] text-slate-400">ระบบจะทำการสกัดค่าต่างๆ (Extract) ออกมาใส่ฟิลด์ให้อัตโนมัติเมื่อวาง</p>
            </div>
          )}

          {/* Admin Rule Reminder */}
          <div className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-amber-900">การเข้าถึงแอดมิน:</h5>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                อีเมล <strong className="underline text-indigo-700">pak.pao11mee@gmail.com</strong> จะได้รับสิทธิ์เป็นแอดมินโดยอัตโนมัติ ซึ่งจะสามารถลบ ล้างข้อมูล และดูแลสถิติการเข้าเรียนทั้งหมดได้
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            บันทึกการเชื่อมต่อ
          </button>
        </div>
      </div>
    </div>
  );
}

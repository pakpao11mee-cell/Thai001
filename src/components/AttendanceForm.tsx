/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AttendanceStatus } from '../types';
import { lookupStudentName } from '../firebase';
import { Check, ClipboardList, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface AttendanceFormProps {
  onSaveRecord: (studentId: string, status: AttendanceStatus) => Promise<void>;
  user: { displayName: string; email: string } | null;
}

export default function AttendanceForm({ onSaveRecord, user }: AttendanceFormProps) {
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-detect or look up name when studentId updates
  useEffect(() => {
    const trimmed = studentId.trim();
    if (trimmed.length >= 4) {
      const name = lookupStudentName(trimmed);
      setStudentName(name);
    } else {
      setStudentName('');
    }
    setErrorMsg('');
  }, [studentId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanId = studentId.trim();
    if (!cleanId) {
      setErrorMsg('กรุณากรอกรหัสนักเรียน');
      return;
    }

    if (cleanId.length < 4) {
      setErrorMsg('รหัสนักเรียนควรมีความยาวอย่างน้อย 4 หลัก');
      return;
    }

    if (!user) {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนทำการเช็คชื่อ');
      return;
    }

    try {
      setLoading(true);
      await onSaveRecord(cleanId, status);
      
      // Show success message
      setSuccessMsg(`บันทึกสถานะของ ${lookupStudentName(cleanId)} เรียบร้อยแล้ว!`);
      
      // Reset student ID field but preserve chosen status for convenient next clicks
      setStudentId('');
      setStudentName('');
      
      // Auto dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (error: any) {
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured list of sample student buttons for incredibly easy demo testing!
  const SAMPLE_STUDENTS = [
    { id: '64010101', name: 'สมชาย' },
    { id: '64010102', name: 'สมหญิง' },
    { id: '64010103', name: 'วิชัย' },
    { id: '64010104', name: 'ปิยะมาศ' },
    { id: '64010105', name: 'กิตติศักดิ์' },
    { id: '64010106', name: 'ธนาวุฒิ' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-md p-5 md:p-6 space-y-5">
      
      {/* Header section */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <ClipboardList className="w-5.5 h-5.5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base md:text-lg">บันทึกเวลาเรียนใหม่</h3>
          <p className="text-xs text-slate-500">กรอกรหัสนักเรียนและเลือกสถานะเพื่อเช็คชื่อเข้าเรียน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error and Success alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2 animate-pulse">
            <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Student ID block */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600">รหัสนักเรียน *</label>
          <div className="relative">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={12}
              value={studentId}
              onChange={e => setStudentId(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="ตัวอย่าง 64010101"
              className="w-full pl-3.5 pr-24 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium tracking-wide placeholder:text-slate-400"
            />
            {studentName && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {studentName}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic sample student Quick Select */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400">คลิกเลือกนักเรียนจำลองด่วน:</span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_STUDENTS.map(sample => (
              <button
                key={sample.id}
                type="button"
                onClick={() => setStudentId(sample.id)}
                className={`text-[11px] px-2.5 py-1 rounded-xl transition-all border ${
                  studentId === sample.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 font-medium' 
                    : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                {sample.name} ({sample.id.slice(-3)})
              </button>
            ))}
          </div>
        </div>

        {/* Radio Button Statuses Container */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600">สถานะเข้าชั้นเรียน *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            
            {/* Status Option 1: Present (มา) */}
            <label className={`relative flex items-center gap-2 px-3.5 py-3 rounded-2xl border cursor-pointer transition-all ${
              status === 'present' 
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-100' 
                : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="status"
                value="present"
                checked={status === 'present'}
                onChange={() => setStatus('present')}
                className="sr-only"
              />
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                status === 'present' 
                  ? 'border-emerald-600 bg-emerald-600' 
                  : 'border-slate-300'
              }`}>
                {status === 'present' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm">มาเรียน</span>
            </label>

            {/* Status Option 2: Absent (ขาด) */}
            <label className={`relative flex items-center gap-2 px-3.5 py-3 rounded-2xl border cursor-pointer transition-all ${
              status === 'absent' 
                ? 'bg-rose-50/70 border-rose-500 text-rose-950 font-semibold ring-2 ring-rose-100' 
                : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="status"
                value="absent"
                checked={status === 'absent'}
                onChange={() => setStatus('absent')}
                className="sr-only"
              />
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                status === 'absent' 
                  ? 'border-rose-600 bg-rose-600' 
                  : 'border-slate-300'
              }`}>
                {status === 'absent' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm">ขาดเรียน</span>
            </label>

            {/* Status Option 3: Leave (ลา) */}
            <label className={`relative flex items-center gap-2 px-3.5 py-3 rounded-2xl border cursor-pointer transition-all ${
              status === 'leave' 
                ? 'bg-amber-50/70 border-amber-500 text-amber-950 font-semibold ring-2 ring-amber-100' 
                : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="status"
                value="leave"
                checked={status === 'leave'}
                onChange={() => setStatus('leave')}
                className="sr-only"
              />
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                status === 'leave' 
                  ? 'border-amber-600 bg-amber-600' 
                  : 'border-slate-300'
              }`}>
                {status === 'leave' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm">ลากิจ</span>
            </label>

            {/* Status Option 4: Sick (ป่วย) */}
            <label className={`relative flex items-center gap-2 px-3.5 py-3 rounded-2xl border cursor-pointer transition-all ${
              status === 'sick' 
                ? 'bg-sky-50/70 border-sky-500 text-sky-950 font-semibold ring-2 ring-sky-100' 
                : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="status"
                value="sick"
                checked={status === 'sick'}
                onChange={() => setStatus('sick')}
                className="sr-only"
              />
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                status === 'sick' 
                  ? 'border-sky-600 bg-sky-600' 
                  : 'border-slate-300'
              }`}>
                {status === 'sick' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm">ลาป่วย</span>
            </label>

          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !user}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide text-white transition-all shadow-md flex items-center justify-center gap-2 ${
            !user 
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : loading 
                ? 'bg-indigo-450 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-[0.99]'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>กำลังบันทึกข้อมูล...</span>
            </>
          ) : (
            <>
              <span>{user ? 'บันทึกการเข้าเรียน' : 'กรุณาเข้าสู่ระบบเพื่อเช็คชื่อ'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}

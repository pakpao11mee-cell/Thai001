/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AttendanceRecord, AttendanceStatus } from '../types';
import { Users, CheckCircle, XCircle, FileText, Activity, Award } from 'lucide-react';

interface StatsDashboardProps {
  records: AttendanceRecord[];
}

export default function StatsDashboard({ records }: StatsDashboardProps) {
  const total = records.length;

  const countByStatus = (status: AttendanceStatus) => {
    return records.filter(r => r.status === status).length;
  };

  const presentCount = countByStatus('present');
  const absentCount = countByStatus('absent');
  const leaveCount = countByStatus('leave');
  const sickCount = countByStatus('sick');

  const presentPercent = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const absentPercent = total > 0 ? Math.round((absentCount / total) * 100) : 0;
  const leavePercent = total > 0 ? Math.round((leaveCount / total) * 100) : 0;
  const sickPercent = total > 0 ? Math.round((sickCount / total) * 100) : 0;

  // Let's create a beautiful helper to render statistic cards
  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">ภาพรวมสถิติวันนี้</h4>
          <p className="text-[11px] text-slate-400">คำนวณจากบันทึกเวลาจริงตามข้อมูลล่าสุด</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Award className="w-3.5 h-3.5" />
            <span>อัตราเข้าเรียน: {presentPercent}%</span>
          </div>
        )}
      </div>

      {/* Grid containing statistical summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total */}
        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">บันทึกทั้งหมด</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <p className="text-[10px] text-slate-400">จำนวนการเช็คชื่อทั้งหมด</p>
          </div>
        </div>

        {/* Card 2: Present (มา) */}
        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">มาเรียน</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">{presentCount}</span>
              <span className="text-xs font-medium text-emerald-600">({presentPercent}%)</span>
            </div>
            {/* Minimal visual bar indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${presentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Absent (ขาด) */}
        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ขาดเรียน</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">{absentCount}</span>
              <span className="text-xs font-medium text-rose-600">({absentPercent}%)</span>
            </div>
            {/* Minimal visual bar indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${absentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Leave (ลา) */}
        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ลากิจ</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">{leaveCount}</span>
              <span className="text-xs font-medium text-amber-600">({leavePercent}%)</span>
            </div>
            {/* Minimal visual bar indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${leavePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Sick (ป่วย) */}
        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ลาป่วย</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">{sickCount}</span>
              <span className="text-xs font-medium text-sky-600">({sickPercent}%)</span>
            </div>
            {/* Minimal visual bar indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${sickPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

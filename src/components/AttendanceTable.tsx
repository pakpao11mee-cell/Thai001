/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { 
  Search, 
  Trash2, 
  Clock, 
  User, 
  Filter, 
  X, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Activity, 
  Download,
  AlertCircle
} from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isAdmin: boolean;
  onDeleteRecord: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export default function AttendanceTable({ records, isAdmin, onDeleteRecord, onClearAll }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter records based on both Search text and Status Filter
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.studentId.includes(searchTerm) || 
      (record.studentName && record.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Helpers to render status badges
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            มาเรียน
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ขาดเรียน
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ลากิจ
          </span>
        );
      case 'sick':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            ลาป่วย
          </span>
        );
    }
  };

  // Human readable date formatting
  const formatDateTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' น. (' + date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      }) + ')';
    } catch {
      return 'ไม่ระบุเวลา';
    }
  };

  // Excel/CSV simple export handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    
    // Add UTF-8 BOM so Thai characters open correctly in Excel
    let csvContent = "\uFEFF";
    csvContent += "รหัสนักเรียน,ชื่อนักเรียน,สถานะ,เวลาที่บันทึก,ผู้เช็คชื่อ\n";
    
    filteredRecords.forEach(r => {
      const statusText = 
        r.status === 'present' ? 'มาเรียน' : 
        r.status === 'absent' ? 'ขาดเรียน' : 
        r.status === 'leave' ? 'ลากิจ' : 'ลาป่วย';
      
      const timeStr = formatDateTime(r.timestamp).replace(/,/g, '');
      csvContent += `${r.studentId},${r.studentName || ''},${statusText},${timeStr},${r.recordedByName}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `รายงานการเข้าเรียน_${new Date().toLocaleDateString('th-TH')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete wrapper
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDeleteRecord(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-md p-5 md:p-6 space-y-5">
      
      {/* Header and tools */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-base md:text-lg">ประวัติการลงเวลาเรียนประจำวันนี้</h3>
          <p className="text-xs text-slate-500">แสดงผลข้อมูลบันทึกทั้งหมดแบบเรียลไทม์</p>
        </div>
        
        {/* Export and clear actions */}
        <div className="flex items-center gap-2">
          {filteredRecords.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          {isAdmin && records.length > 0 && (
            <div className="relative">
              {showClearConfirm ? (
                <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 z-20 w-56 space-y-2.5">
                  <p className="text-[11px] font-semibold text-rose-800 leading-tight">คุณแน่ใจหรือไม่ที่จะล้างประวัติการเข้าเรียนทั้งหมดของวันนี้?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClearAll();
                        setShowClearConfirm(false);
                      }}
                      className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                    >
                      ใช่ ล้างเลย
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : null}
              <button
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
              >
                ล้างข้อมูลทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search student ID */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยรหัสนักเรียน หรือ ชื่อ..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/40"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick status filter select buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="text-[11px] font-bold text-slate-400 mr-1.5 shrink-0">ตัวกรอง:</div>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'present', label: 'มาเรียน' },
            { id: 'absent', label: 'ขาดเรียน' },
            { id: 'leave', label: 'ลากิจ' },
            { id: 'sick', label: 'ลาป่วย' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                statusFilter === opt.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid wrapper */}
      <div className="overflow-hidden border border-slate-100 rounded-2xl">
        
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500">รหัสนักเรียน</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500">ชื่อนักเรียน</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500">สถานะ</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500">เวลาบันทึก (Timestamp)</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500">ผู้บันทึก</th>
                {isAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-center">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-700 tracking-wider">
                      {record.studentId}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
                      {record.studentName || 'ไม่พบบันทึกชื่อ'}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(record.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[120px]" title={record.recordedByEmail}>
                          {record.recordedByName}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="ลบรายการ"
                        >
                          {deletingId === record.id ? (
                            <svg className="animate-spin h-4.5 w-4.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <Trash2 className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-full inline-block">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-700">ไม่พบประวัติการลงเวลา</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'ไม่มีรายการใดตรงกับการค้นหาหรือการกรองของคุณ' 
                          : 'เริ่มกรอกข้อมูลที่ฟอร์มเช็คชื่อด้านบนเพื่อบันทึกประวัติ'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Layout (Super Clean Cards) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors">
                
                {/* ID & Status badge */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-indigo-950 tracking-wider">
                    {record.studentId}
                  </div>
                  <div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>

                {/* Name */}
                <div className="text-xs font-semibold text-slate-700">
                  {record.studentName || 'ไม่พบบันทึกชื่อ'}
                </div>

                {/* Footer details: Time & User */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(record.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[100px] truncate">{record.recordedByName}</span>
                  </div>
                </div>

                {/* Admin action inside card */}
                {isAdmin && (
                  <div className="flex justify-end pt-2 border-t border-slate-100/60">
                    <button
                      onClick={() => handleDelete(record.id)}
                      disabled={deletingId === record.id}
                      className="px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบประวัติ</span>
                    </button>
                  </div>
                )}

              </div>
            ))
          ) : (
            <div className="py-12 text-center p-4">
              <div className="max-w-xs mx-auto space-y-2">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-full inline-block">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">ไม่พบประวัติการลงเวลา</h4>
                <p className="text-xs text-slate-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'ไม่มีรายการตรงเงื่อนไขตัวกรอง' 
                    : 'ทดลองบันทึกข้อมูลเพื่อแสดงรายงานผลลัพธ์'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

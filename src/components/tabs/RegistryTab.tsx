'use client';

import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Student } from '../../app/mockData';
import { SpecialDuty } from '../../app/store';
import { Panel } from '../ui';

interface RegistryTabProps {
  data: {
    students: Student[];
    specialDuties: SpecialDuty[];
    processionTitle?: string;
  };
  currentUser: Student;
  isController: boolean;
  isModerator: boolean;
  registryTab: 'all_members' | 'requests';
  setRegistryTab: (val: 'all_members' | 'requests') => void;
  registryCategoryFilter: 'all' | 'stand' | 'athlete' | 'procession' | 'special' | 'no_duty';
  setRegistryCategoryFilter: (
    val: 'all' | 'stand' | 'athlete' | 'procession' | 'special' | 'no_duty'
  ) => void;
  registrySearch: string;
  setRegistrySearch: (val: string) => void;
  registryDuty: string;
  setRegistryDuty: (val: string) => void;
  registryClassroom: string;
  setRegistryClassroom: (val: string) => void;
  dutyOptions: { id: string; label: string }[];
  classrooms: string[];
  selectedStudentIds: string[];
  setSelectedStudentIds: React.Dispatch<React.SetStateAction<string[]>>;
  isCheckboxDragActive: boolean;
  setIsCheckboxDragActive: (val: boolean) => void;
  checkboxDragMode: 'select' | 'deselect' | null;
  setCheckboxDragMode: (val: 'select' | 'deselect' | null) => void;
  filteredRegistry: Student[];
  updateStudent: (
    id: string,
    updates: Partial<Student>,
    byUser?: Student,
    actionDesc?: string
  ) => void;
  updateMultipleStudents: (
    ids: string[],
    updates: Partial<Student>,
    byUser?: Student,
    actionDesc?: string
  ) => void;
  deleteStudent: (id: string, byUser?: Student) => void;
  setIsAddMemberOpen: (val: boolean) => void;
  setIsExportModalOpen: (val: boolean) => void;
  setIsImportModalOpen: (val: boolean) => void;
  setNewMemberName: (val: string) => void;
  setNewMemberNickname: (val: string) => void;
  setNewMemberRoom: (val: string) => void;
  setNewMemberNum: (val: string) => void;
  setNewMemberId: (val: string) => void;
  setNewMemberError: (val: string) => void;
  setImportError: (val: string) => void;
  setImportSuccess: (val: string) => void;
  setImportText: (val: string) => void;
}

export function RegistryTab({
  data,
  currentUser,
  isController,
  isModerator,
  registryTab,
  setRegistryTab,
  registryCategoryFilter,
  setRegistryCategoryFilter,
  registrySearch,
  setRegistrySearch,
  registryDuty,
  setRegistryDuty,
  registryClassroom,
  setRegistryClassroom,
  dutyOptions,
  classrooms,
  selectedStudentIds,
  setSelectedStudentIds,
  isCheckboxDragActive,
  setIsCheckboxDragActive,
  checkboxDragMode,
  setCheckboxDragMode,
  filteredRegistry,
  updateStudent,
  updateMultipleStudents,
  deleteStudent,
  setIsAddMemberOpen,
  setIsExportModalOpen,
  setIsImportModalOpen,
  setNewMemberName,
  setNewMemberNickname,
  setNewMemberRoom,
  setNewMemberNum,
  setNewMemberId,
  setNewMemberError,
  setImportError,
  setImportSuccess,
  setImportText,
}: RegistryTabProps) {
  // Local Modal States
  const [showSpecialDutiesStatsModal, setShowSpecialDutiesStatsModal] = useState(false);
  const [addDutyConfirmStudent, setAddDutyConfirmStudent] = useState<Student | null>(null);
  const [addDutyConfirmDutyId, setAddDutyConfirmDutyId] = useState<string>('');

  const [editStudentTarget, setEditStudentTarget] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editStudentNickname, setEditStudentNickname] = useState<string>('');
  const [editStudentRoom, setEditStudentRoom] = useState<string>('');
  const [editStudentNum, setEditStudentNum] = useState<string>('');
  const [editStudentId, setEditStudentId] = useState<string>('');

  const [resetStudentTarget, setResetStudentTarget] = useState<Student | null>(null);
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<Student | null>(null);

  const dutyLabel = (duty: string) => {
    const dynamic = data.specialDuties.find((item: SpecialDuty) => item.id === duty);
    if (dynamic) return dynamic.title;
    switch (duty) {
      case 'none':
        return 'ยังไม่มีหน้าที่';
      case 'stand':
        return 'สแตนเชียร์';
      case 'athlete':
        return 'นักกีฬา';
      case 'procession':
        return data.processionTitle || 'ขบวนพาเหรด';
      default:
        return duty;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">รายชื่อทะเบียนการทำงานของสีชมพูทั้งหมด</h2>
          <p className="text-sm text-text-secondary">ค้นหา กรองหน้าที่ และดูจำนวนของแต่ละหน้าที่ได้ทันที</p>
        </div>

        {/* Sub-tabs: All Members vs Pending Requests (คำขออนุมัติ) */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap font-sans">
          <div className="flex bg-carbon-card border border-pink-primary/10 rounded-full p-1 w-max">
            <button
              onClick={() => setRegistryTab('all_members')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                registryTab === 'all_members'
                  ? 'bg-pink-primary text-white shadow-md shadow-pink-primary/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              สมาชิกทั้งหมด ({data.students.length} คน)
            </button>
            <button
              onClick={() => setRegistryTab('requests')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                registryTab === 'requests'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              📥 คำขออนุมัติ ({data.students.filter((s: Student) => Object.values(s.duties || {}).some(status => status === 'pending_selection')).length} คน)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isModerator && (
              <button
                onClick={() => {
                  setNewMemberName('');
                  setNewMemberNickname('');
                  setNewMemberRoom('');
                  setNewMemberNum('');
                  setNewMemberId('');
                  setNewMemberError('');
                  setIsAddMemberOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold border border-green-500/20 shadow-md shadow-green-600/10"
              >
                <Plus size={13} /> เพิ่มสมาชิก
              </button>
            )}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-carbon-card hover:bg-carbon-light text-pink-accent px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold border border-pink-primary/20"
            >
              📤 ส่งออกข้อมูล
            </button>
            {!isModerator && (
              <button
                onClick={() => {
                  setImportError('');
                  setImportSuccess('');
                  setImportText('');
                  setIsImportModalOpen(true);
                }}
                className="bg-pink-primary hover:bg-pink-accent text-white px-4.5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/10 active:scale-95 cursor-pointer font-bold border border-pink-primary/20"
              >
                📥 นำเข้าสมาชิก
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Separated Category filters (แยกตามหมวดหมู่หน้าที่) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-sans">
        {[
          { id: 'all', label: '🗂️ ทุกหมวดหมู่', count: data.students.length },
          { id: 'stand', label: '📣 สแตนเชียร์', count: data.students.filter((s: Student) => s.duties?.['stand'] === 'approved').length },
          { id: 'athlete', label: '🏃 นักกีฬา', count: data.students.filter((s: Student) => s.duties?.['athlete'] === 'approved').length },
          { id: 'procession', label: `🚶 ${data.processionTitle || 'ขบวนพาเหรด'}`, count: data.students.filter((s: Student) => s.duties?.['procession'] === 'approved').length },
          { id: 'special', label: '✨ หน้าที่พิเศษ', count: data.students.filter((s: Student) => Object.keys(s.duties || {}).some(k => k !== 'stand' && k !== 'athlete' && k !== 'procession' && s.duties?.[k] === 'approved')).length },
          { id: 'no_duty', label: '❌ ไม่มีหน้าที่', count: data.students.filter((s: Student) => !Object.values(s.duties || {}).some(v => v === 'approved')).length },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setRegistryCategoryFilter(cat.id as any);
              if (cat.id === 'special') {
                setShowSpecialDutiesStatsModal(true);
              }
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              registryCategoryFilter === cat.id
                ? 'bg-pink-primary/15 border-pink-primary text-pink-accent'
                : 'bg-carbon-card border-pink-primary/5 text-text-secondary hover:text-white hover:border-pink-primary/10'
            }`}
          >
            <span className="block font-semibold text-xs sm:text-sm">{cat.label}</span>
            <span className="block text-lg font-bold text-white mt-1">{cat.count} คน</span>
          </button>
        ))}
      </div>

      <Panel title="ตัวกรองรายชื่อ">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              placeholder="ค้นหาชื่อ รหัส ห้อง หรือเลขที่"
              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
            />
          </div>
          <select value={registryDuty} onChange={(e) => setRegistryDuty(e.target.value)} className="bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer font-semibold">
            <option value="all">ทุกหน้าที่ย่อย</option>
            <option value="has_duty">✅ มีหน้าที่แล้ว</option>
            <option value="pending">⏳ รออนุมัติ</option>
            {dutyOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <select value={registryClassroom} onChange={(e) => setRegistryClassroom(e.target.value)} className="bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer font-semibold">
            <option value="all">ทุกห้อง</option>
            {classrooms.map((classroom) => <option key={classroom} value={classroom}>{classroom}</option>)}
          </select>
        </div>

        {/* สถิติรายห้อง — แสดงเมื่อเลือกห้องที่เจาะจง */}
        {registryClassroom !== 'all' && (() => {
          const roomStudents = data.students.filter((s: Student) => s.classroom === registryClassroom);
          const roomDutyCounts: { label: string; count: number; color: string }[] = [
            { label: 'แสตนด์เชียร์', count: roomStudents.filter((s: Student) => s.duties?.['stand'] === 'approved').length, color: 'text-pink-accent' },
            { label: 'นักกีฬา', count: roomStudents.filter((s: Student) => s.duties?.['athlete'] === 'approved').length, color: 'text-green-400' },
            { label: data.processionTitle || 'ขบวนพาเหรด', count: roomStudents.filter((s: Student) => s.duties?.['procession'] === 'approved').length, color: 'text-blue-400' },
            ...data.specialDuties.map((sd: SpecialDuty) => ({
              label: sd.title,
              count: roomStudents.filter((s: Student) => s.duties?.[sd.id] === 'approved').length,
              color: 'text-yellow-400',
            })),
          ].filter(d => d.count > 0);
          const noduty = roomStudents.filter((s: Student) => !Object.values(s.duties || {}).some(v => v === 'approved')).length;
          return (
            <div className="mt-3 p-3 bg-carbon-dark/40 rounded-xl border border-pink-primary/10 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans">
              <span className="text-xs font-bold text-text-secondary whitespace-nowrap">📊 {registryClassroom} ({roomStudents.length} คน):</span>
              {roomDutyCounts.length === 0 && noduty === roomStudents.length ? (
                <span className="text-xs text-text-tertiary">ยังไม่มีใครได้รับหน้าที่</span>
              ) : (
                <>
                  {roomDutyCounts.map(d => (
                    <span key={d.label} className={`text-xs font-semibold ${d.color} whitespace-nowrap`}>
                      {d.label} <span className="text-white">{d.count} คน</span>
                    </span>
                  ))}
                  {noduty > 0 && (
                    <span className="text-xs font-semibold text-text-tertiary whitespace-nowrap">
                      ยังไม่มีหน้าที่ <span className="text-white">{noduty} คน</span>
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </Panel>

      {isController && !isModerator && selectedStudentIds.length > 0 && (
        <div className="bg-carbon-card border border-pink-primary/30 rounded-2xl p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg animate-fade-in font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-primary animate-ping" />
            <p className="text-sm font-semibold text-white">
              เลือกสมาชิกอยู่ <span className="text-pink-primary text-base font-bold">{selectedStudentIds.length}</span> คน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">ยัดหน้าที่:</span>
              <select
                id="bulk-duty-select"
                defaultValue="none"
                className="bg-carbon-dark border border-pink-primary/20 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-pink-primary text-text-primary cursor-pointer font-semibold"
              >
                <option value="none">-- เลือกหน้าที่ --</option>
                {dutyOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const selectEl = document.getElementById('bulk-duty-select') as HTMLSelectElement;
                  const targetDuty = selectEl ? selectEl.value : 'none';
                  if (targetDuty === 'none') {
                    alert('กรุณาเลือกหน้าที่ก่อนยัดครับ!');
                    return;
                  }
                  const status = targetDuty === 'none' ? 'none' : 'approved';
                  if (confirm(`คุณต้องการยัดหน้าที่ "${dutyLabel(targetDuty)}" ให้กับนักเรียนทั้ง ${selectedStudentIds.length} คนใช่หรือไม่?`)) {
                    updateMultipleStudents(
                      selectedStudentIds,
                      { assigned_duty: targetDuty, duty_status: status },
                      currentUser || undefined,
                      `แต่งตั้งหน้าที่กลุ่ม "${dutyLabel(targetDuty)}"`
                    );
                    setSelectedStudentIds([]);
                  }
                }}
                className="bg-pink-primary hover:bg-pink-accent text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md shadow-pink-primary/10 cursor-pointer"
              >
                มอบหมายหน้าที่
              </button>
              <button
                onClick={() => {
                  const selectEl = document.getElementById('bulk-duty-select') as HTMLSelectElement;
                  const targetDuty = selectEl ? selectEl.value : 'none';
                  if (targetDuty === 'none') {
                    alert('กรุณาเลือกหน้าที่ก่อนยัดครับ!');
                    return;
                  }
                  if (confirm(`คุณต้องการยัดหน้าที่ "${dutyLabel(targetDuty)}" แบบรออนุมัติ ให้กับนักเรียนทั้ง ${selectedStudentIds.length} คนใช่หรือไม่?`)) {
                    updateMultipleStudents(
                      selectedStudentIds,
                      { assigned_duty: targetDuty, duty_status: 'pending_selection' },
                      currentUser || undefined,
                      `เสนอชื่อหน้าที่กลุ่ม "${dutyLabel(targetDuty)}" (รออนุมัติ)`
                    );
                    setSelectedStudentIds([]);
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md shadow-yellow-500/10 cursor-pointer"
              >
                มอบแบบรออนุมัติ
              </button>
            </div>
            <div className="h-6 w-[1px] bg-pink-primary/10 hidden md:block" />
            <button
              onClick={() => {
                if (confirm(`คุณต้องการอนุมัติคำขอหน้าที่ให้กับนักเรียนที่เลือกทั้ง ${selectedStudentIds.length} คนใช่หรือไม่?`)) {
                  updateMultipleStudents(
                    selectedStudentIds,
                    { duty_status: 'approved', rejection_reason: undefined },
                    currentUser || undefined,
                    'อนุมัติหน้าที่กลุ่ม'
                  );
                  setSelectedStudentIds([]);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              อนุมัติทั้งหมด
            </button>
            <button
              onClick={() => {
                const reason = prompt(`กรุณาระบุเหตุผลการปฏิเสธหน้าที่สำหรับนักเรียนทั้ง ${selectedStudentIds.length} คน:`);
                if (reason === null) return;
                if (!reason.trim()) {
                  alert('ต้องใส่เหตุผลการปฏิเสธด้วยครับ');
                  return;
                }
                updateMultipleStudents(
                  selectedStudentIds,
                  { assigned_duty: 'none', duty_status: 'none', rejection_reason: reason.trim(), seat: undefined },
                  currentUser || undefined,
                  `ปฏิเสธหน้าที่กลุ่ม (เหตุผล: ${reason.trim()})`
                );
                setSelectedStudentIds([]);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              ปฏิเสธทั้งหมด
            </button>
            <button
              onClick={() => {
                if (confirm(`ต้องการรีเซ็ตหน้าที่ของนักเรียนทั้ง ${selectedStudentIds.length} คนใช่หรือไม่? (จะกลายเป็นไม่มีหน้าที่)`)) {
                  updateMultipleStudents(
                    selectedStudentIds,
                    { assigned_duty: 'none', duty_status: 'none', seat: undefined, rejection_reason: undefined },
                    currentUser || undefined,
                    'รีเซ็ตหน้าที่กลุ่ม'
                  );
                  setSelectedStudentIds([]);
                }
              }}
              className="border border-red-500/20 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              รีเซ็ตทั้งหมด
            </button>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="text-text-secondary hover:text-white px-2 py-2 text-xs cursor-pointer font-semibold"
            >
              ยกเลิกเลือก
            </button>
          </div>
        </div>
      )}

      <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-4 overflow-x-auto shadow font-sans">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-pink-primary/10 text-text-secondary">
              {isController && !isModerator && (
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredRegistry.length > 0 && filteredRegistry.every((s: Student) => selectedStudentIds.includes(s.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const ids = filteredRegistry.map((s: Student) => s.id);
                        setSelectedStudentIds(ids);
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-pink-primary/30 text-pink-primary bg-carbon-dark focus:ring-0 cursor-pointer"
                  />
                </th>
              )}
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ชื่อจริง</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ชื่อเล่น</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ห้อง</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">เลขที่</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">หน้าที่</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">สถานะ</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ที่นั่ง</th>
              {isController && !isModerator && <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">จัดการ</th>}
            </tr>
          </thead>
          <tbody
            onMouseLeave={() => {
              setIsCheckboxDragActive(false);
              setCheckboxDragMode(null);
            }}
            onMouseUp={() => {
              setIsCheckboxDragActive(false);
              setCheckboxDragMode(null);
            }}
          >
            {filteredRegistry.map((student: Student, idx: number) => {
              const nicknameMatch = student.fullname.match(/\(([^)]+)\)/);
              const nickname = nicknameMatch ? nicknameMatch[1] : '-';
              const realName = nicknameMatch ? student.fullname.replace(/\s*\([^)]+\)/g, '').trim() : student.fullname;
              return (
                <tr key={`${student.id}_${idx}`} className="border-b border-pink-primary/5 hover:bg-carbon-light/20 transition-colors">
                  {isController && !isModerator && (
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => {
                          // Handled by onMouseDown for click and drag
                        }}
                        onMouseDown={() => {
                          const isCurrentlySelected = selectedStudentIds.includes(student.id);
                          const nextMode = isCurrentlySelected ? 'deselect' : 'select';
                          setIsCheckboxDragActive(true);
                          setCheckboxDragMode(nextMode);
                          setSelectedStudentIds(prev =>
                            nextMode === 'select'
                              ? (prev.includes(student.id) ? prev : [...prev, student.id])
                              : prev.filter(id => id !== student.id)
                          );
                        }}
                        onMouseEnter={() => {
                          if (isCheckboxDragActive && checkboxDragMode) {
                            setSelectedStudentIds(prev =>
                              checkboxDragMode === 'select'
                                ? (prev.includes(student.id) ? prev : [...prev, student.id])
                                : prev.filter(id => id !== student.id)
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-pink-primary/30 text-pink-primary bg-carbon-dark focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-3 px-4 font-semibold">
                    {realName}
                    <span className="block text-[11px] text-text-tertiary font-normal">{student.id}</span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{nickname}</td>
                  <td className="py-3 px-4 text-text-secondary">{student.classroom}</td>
                  <td className="py-3 px-4 text-text-secondary">{student.number}</td>
                  <td className="py-3 px-4 text-pink-primary font-semibold">
                    <div className="flex flex-wrap gap-1.5 items-center max-w-[280px]">
                      {Object.entries(student.duties || {})
                        .filter(([_, status]) => status === 'approved')
                        .map(([dutyId, _]) => (
                          <span key={dutyId} className="inline-flex items-center gap-1 bg-pink-primary/15 border border-pink-primary/20 text-pink-accent text-xs font-semibold px-2 py-0.5 rounded-full">
                            {dutyLabel(dutyId)}
                            {isController && !isModerator && (
                              <button
                                onClick={() => {
                                  const nextDuties = { ...student.duties, [dutyId]: 'none' as any };
                                  updateStudent(student.id, { duties: nextDuties }, currentUser || undefined, `ถอดถอนหน้าที่ "${dutyLabel(dutyId)}"`);
                                }}
                                className="hover:text-red-500 font-bold ml-1 text-[10px] text-text-secondary transition-colors cursor-pointer"
                                title="ถอดหน้าที่นี้"
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        ))
                      }
                      {isController && !isModerator && (
                        <select
                          value=""
                          onChange={(e) => {
                            const dutyToAdd = e.target.value;
                            if (dutyToAdd) {
                              setAddDutyConfirmStudent(student);
                              setAddDutyConfirmDutyId(dutyToAdd);
                            }
                          }}
                          className="bg-carbon-dark/80 hover:bg-carbon-dark text-text-secondary border border-dashed border-pink-primary/30 text-[11px] px-2 py-0.5 rounded-full cursor-pointer focus:outline-none focus:border-pink-primary max-w-[90px] outline-none font-bold"
                        >
                          <option value="" disabled>+ เพิ่ม</option>
                          {dutyOptions
                            .filter(opt => opt.id !== 'none' && !student.duties?.[opt.id])
                            .map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))
                          }
                        </select>
                      )}
                      {Object.keys(student.duties || {}).filter(k => student.duties?.[k] === 'approved').length === 0 && (
                        <span className="text-xs text-text-tertiary font-normal">ไม่มีหน้าที่</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      {/* Approved duties status indicators */}
                      {Object.entries(student.duties || {})
                        .filter(([_, status]) => status === 'approved')
                        .map(([dutyId, _]) => (
                          <div key={dutyId} className="inline-flex items-center bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold mr-1">
                            ✓ {dutyLabel(dutyId)}
                          </div>
                        ))
                      }

                      {/* Pending duties status indicators with Approve/Reject actions */}
                      {Object.entries(student.duties || {})
                        .filter(([_, status]) => status === 'pending_selection')
                        .map(([dutyId, _]) => (
                          <div key={dutyId} className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-xl text-xs font-semibold mb-1 w-max">
                            <span>⏳ รออนุมัติ: {dutyLabel(dutyId)}</span>
                            {isController && !isModerator && registryTab === 'requests' && (
                              <div className="flex gap-1 ml-0.5">
                                <button
                                  onClick={() => {
                                    const nextDuties = { ...(student.duties || {}), [dutyId]: 'approved' as const };
                                    updateStudent(student.id, { duties: nextDuties, rejection_reason: undefined }, currentUser || undefined, `อนุมัติหน้าที่ "${dutyLabel(dutyId)}"`);
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-all shadow cursor-pointer"
                                >
                                  อนุมัติ
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt(`กรุณาระบุเหตุผลการปฏิเสธหน้าที่ "${dutyLabel(dutyId)}" ของ ${student.fullname}:`);
                                    if (reason === null) return;
                                    if (!reason.trim()) {
                                      alert('ต้องใส่เหตุผลการปฏิเสธด้วยครับ');
                                      return;
                                    }
                                    const nextDuties = { ...(student.duties || {}), [dutyId]: 'none' as any };
                                    updateStudent(student.id, { duties: nextDuties, rejection_reason: reason.trim() }, currentUser || undefined, `ปฏิเสธหน้าที่ "${dutyLabel(dutyId)}" (เหตุผล: ${reason.trim()})`);
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-all shadow cursor-pointer"
                                >
                                  ปฏิเสธ
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      }

                      {/* No duty fallback */}
                      {Object.keys(student.duties || {}).filter(k => student.duties?.[k] === 'approved' || student.duties?.[k] === 'pending_selection').length === 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400">
                          ❌ ไม่มีหน้าที่
                        </span>
                      )}
                      {student.rejection_reason && (
                        <span className="block text-[10px] text-red-400 mt-1 font-medium">เหตุผลปฏิเสธ: {student.rejection_reason}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-bold">{student.seat || '-'}</td>
                  {isController && !isModerator && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2.5 items-center">
                        <button
                          onClick={() => {
                            const nameOnly = student.fullname.replace(/\s*\([^)]+\)/g, '').trim();
                            setEditStudentTarget(student);
                            setEditStudentName(nameOnly);
                            setEditStudentNickname(nickname !== '-' ? nickname : '');
                            setEditStudentRoom(student.classroom || '');
                            setEditStudentNum(student.number || '');
                            setEditStudentId(student.id || '');
                          }}
                          className="text-pink-accent hover:text-pink-primary text-xs font-semibold cursor-pointer"
                          title="แก้ไขชื่อ ห้อง เลขที่"
                        >
                          แก้ไข
                        </button>
                        {Object.keys(student.duties || {}).length > 0 && (
                          <button
                            onClick={() => {
                              setResetStudentTarget(student);
                            }}
                            className="text-yellow-500 hover:text-yellow-400 text-xs font-semibold cursor-pointer"
                            title="ล้างหน้าที่ทั้งหมด"
                          >
                            รีเซ็ต
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteStudentTarget(student);
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold cursor-pointer"
                          title="ลบออกจากระบบ"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Modal for Adding Duty */}
      {addDutyConfirmStudent && addDutyConfirmDutyId && (() => {
        const dutyName = dutyLabel(addDutyConfirmDutyId);
        const studentName = addDutyConfirmStudent.fullname;
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
            <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative text-white">
              <button
                onClick={() => {
                  setAddDutyConfirmStudent(null);
                  setAddDutyConfirmDutyId('');
                }}
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-white mb-2">➕ เลือกสถานะการแต่งตั้งหน้าที่</h3>
              <p className="text-sm text-text-secondary mb-5">
                คุณกำลังเพิ่มหน้าที่ <span className="text-pink-accent font-bold">"{dutyName}"</span> ให้กับ <span className="text-white font-bold">{studentName}</span>
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const nextDuties = { ...(addDutyConfirmStudent.duties || {}), [addDutyConfirmDutyId]: 'approved' as const };
                    updateStudent(addDutyConfirmStudent.id, { duties: nextDuties }, currentUser || undefined, `แต่งตั้งหน้าที่ "${dutyName}" (อนุมัติทันที)`);
                    setAddDutyConfirmStudent(null);
                    setAddDutyConfirmDutyId('');
                  }}
                  className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-primary/10 text-center cursor-pointer"
                >
                  อนุมัติทันที
                </button>
                <button
                  onClick={() => {
                    const nextDuties = { ...(addDutyConfirmStudent.duties || {}), [addDutyConfirmDutyId]: 'pending_selection' as const };
                    updateStudent(addDutyConfirmStudent.id, { duties: nextDuties }, currentUser || undefined, `แต่งตั้งหน้าที่ "${dutyName}" (รออนุมัติ/รอคัดเลือก)`);
                    setAddDutyConfirmStudent(null);
                    setAddDutyConfirmDutyId('');
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md shadow-yellow-500/10 text-center cursor-pointer"
                >
                  รอคัดเลือก / รออนุมัติ
                </button>
                <button
                  onClick={() => {
                    setAddDutyConfirmStudent(null);
                    setAddDutyConfirmDutyId('');
                  }}
                  className="w-full bg-carbon-dark hover:bg-carbon-light text-text-secondary py-3 px-4 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Custom Modal for Special Duties Stats */}
      {showSpecialDutiesStatsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowSpecialDutiesStatsModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">✨ สถิติหน้าที่พิเศษทั้งหมด</h3>
            <p className="text-xs text-text-secondary mb-4">
              แสดงจำนวนคนในแต่ละหน้าที่พิเศษที่ได้รับอนุมัติแล้ว
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {data.specialDuties.map((sd: SpecialDuty) => {
                const count = data.students.filter((s: Student) => s.duties?.[sd.id] === 'approved').length;
                return (
                  <div key={sd.id} className="flex items-center justify-between p-3 bg-carbon-dark/60 border border-pink-primary/5 rounded-xl hover:border-pink-primary/20 transition-all">
                    <span className="text-sm font-medium text-text-primary">{sd.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pink-accent">{count} คน</span>
                      <button
                        onClick={() => {
                          setRegistryDuty(sd.id);
                          setRegistryCategoryFilter('special');
                          setShowSpecialDutiesStatsModal(false);
                        }}
                        className="bg-pink-primary/10 hover:bg-pink-primary/20 text-pink-accent text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        กรองตาราง
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSpecialDutiesStatsModal(false)}
              className="w-full mt-4 bg-carbon-dark hover:bg-carbon-light text-text-secondary py-2.5 px-4 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Custom Modal for Editing Student */}
      {editStudentTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setEditStudentTarget(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">📝 แก้ไขข้อมูลสมาชิก</h3>
            <p className="text-xs text-text-secondary mb-4">
              แก้ไขข้อมูลของ {editStudentTarget.fullname} จากระดับห้องและเลขที่
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อจริง</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  placeholder="ชื่อจริง และนามสกุล"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อเล่น</label>
                <input
                  type="text"
                  value={editStudentNickname}
                  onChange={(e) => setEditStudentNickname(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  placeholder="เช่น เดโช (ไม่ต้องใส่เล็บ)"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ห้องเรียน</label>
                <input
                  type="text"
                  value={editStudentRoom}
                  onChange={(e) => setEditStudentRoom(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  placeholder="เช่น ม.1/8"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เลขที่</label>
                <input
                  type="text"
                  value={editStudentNum}
                  onChange={(e) => setEditStudentNum(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  placeholder="เช่น 5"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เลขประจำตัวนักเรียน</label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-mono"
                  placeholder="เลขประจำตัว 5 หลัก"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditStudentTarget(null);
                  }}
                  className="flex-1 bg-carbon-dark hover:bg-carbon-light text-text-secondary py-2.5 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    const newId = editStudentId.trim();
                    if (!newId || newId === 'ยังไม่มี' || newId === 'undefined') {
                      alert('กรุณากรอกเลขประจำตัวนักเรียน');
                      return;
                    }
                    if (newId.length !== 5 || !/^\d+$/.test(newId)) {
                      alert('เลขประจำตัวต้องเป็นตัวเลข 5 หลัก');
                      return;
                    }
                    if (newId !== editStudentTarget.id && data.students.some((s: Student) => s.id === newId)) {
                      alert(`เลขประจำตัว ${newId} นี้มีในระบบอยู่แล้วครับ`);
                      return;
                    }

                    const cleanName = editStudentName.trim();
                    const cleanNick = editStudentNickname.trim();
                    const finalFullname = cleanNick ? `${cleanName} (${cleanNick})` : cleanName;

                    updateStudent(
                      editStudentTarget.id,
                      {
                        id: newId,
                        fullname: finalFullname || editStudentTarget.fullname,
                        classroom: editStudentRoom.trim() || editStudentTarget.classroom,
                        number: editStudentNum.trim() || editStudentTarget.number
                      },
                      currentUser || undefined,
                      `แก้ไขข้อมูลสมาชิก (${finalFullname})`
                    );
                    setEditStudentTarget(null);
                  }}
                  className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-primary/10 text-center cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal for Resetting Student Duties */}
      {resetStudentTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans text-white">
          <div className="w-full max-w-sm bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setResetStudentTarget(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">🔄 ยืนยันการรีเซ็ตหน้าที่</h3>
            <p className="text-sm text-text-secondary mb-6">
              ต้องการรีเซ็ตหน้าที่ทั้งหมดของ <span className="text-white font-bold">{resetStudentTarget.fullname}</span> ใช่หรือไม่?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setResetStudentTarget(null)}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light text-text-secondary py-2.5 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  updateStudent(resetStudentTarget.id, { duties: {} }, currentUser || undefined, 'รีเซ็ตหน้าที่ทั้งหมด');
                  setResetStudentTarget(null);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal for Deleting Student */}
      {deleteStudentTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans text-white">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setDeleteStudentTarget(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">🚨 ยืนยันการลบสมาชิก</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              ต้องการลบคุณ <span className="text-pink-accent font-bold">{deleteStudentTarget.fullname}</span> ออกจากทะเบียนระบบสีชมพูอย่างถาวรหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteStudentTarget(null)}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light text-text-secondary py-2.5 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  deleteStudent(deleteStudentTarget.id, currentUser || undefined);
                  setDeleteStudentTarget(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10 text-center cursor-pointer"
              >
                ยืนยันลบสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

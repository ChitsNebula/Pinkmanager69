'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Download, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { Student, DutyStatus } from '../../app/mockData';
import { SpecialDuty, getStoredData, updateStudent, updateMultipleStudents, deleteStudent, importStudentsData } from '../../app/store';
import { Panel } from '../ui';

interface RegistryTabProps {
  data: ReturnType<typeof getStoredData>;
  currentUser: Student;
  isController: boolean;
  isModerator: boolean;
}

const parseClassroom = (cls: string) => {
  const match = cls.match(/ม\.(\d+)\/(\d+)/);
  if (match) {
    return {
      grade: parseInt(match[1], 10),
      room: parseInt(match[2], 10)
    };
  }
  return { grade: 999, room: 999 };
};

export function RegistryTab({
  data,
  currentUser,
  isController,
  isModerator,
}: RegistryTabProps) {
  // Registry Filters and States moved from page.tsx to RegistryTab
  const [registryTab, setRegistryTab] = useState<'all_members' | 'requests'>('all_members');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<'all' | 'stand' | 'athlete' | 'procession' | 'special' | 'no_duty'>('all');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryDuty, setRegistryDuty] = useState('all');
  const [registryClassroom, setRegistryClassroom] = useState('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCheckboxDragActive, setIsCheckboxDragActive] = useState<boolean>(false);
  const [checkboxDragMode, setCheckboxDragMode] = useState<'select' | 'deselect' | null>(null);

  // Add Member form state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberRoom, setNewMemberRoom] = useState('');
  const [newMemberNum, setNewMemberNum] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberError, setNewMemberError] = useState('');

  // Import/Export Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-calculated fields
  const classrooms = useMemo(() => {
    const set = new Set<string>();
    data.students.forEach((s: Student) => {
      if (s.classroom) set.add(s.classroom);
    });
    return Array.from(set).sort((a, b) => {
      const classA = parseClassroom(a);
      const classB = parseClassroom(b);
      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
      return classA.room - classB.room;
    });
  }, [data.students]);

  const dutyOptions = useMemo(() => {
    const list = [
      { id: 'all', label: 'แสดงทั้งหมด' },
      { id: 'has_duty', label: 'มีหน้าที่แล้ว (Approved)' },
      { id: 'pending', label: 'รอพิจารณา/รอคัดเลือก' },
      { id: 'none', label: 'ยังไม่มีหน้าที่' },
      { id: 'stand', label: 'สแตนด์เชียร์' },
      { id: 'athlete', label: 'นักกีฬา' },
      { id: 'procession', label: data.processionTitle || 'ขบวนพาเหรด' },
    ];
    data.specialDuties.forEach((sd) => {
      list.push({ id: sd.id, label: sd.title });
    });
    return list;
  }, [data.specialDuties, data.processionTitle]);

  const filteredRegistry = useMemo(() => {
    const query = registrySearch.trim().toLowerCase();
    return data.students.filter((student: Student) => {
      // 1. Text Search
      let matchesText = !query;
      if (query) {
        const tokens = query.split(/[\s/]+/);
        
        if (tokens.length >= 2) {
          const hasClassroomMatch = tokens.some(tok => 
            student.classroom.toLowerCase().includes(tok) || 
            `ม.${tok}`.includes(student.classroom.toLowerCase())
          );
          const hasNumberMatch = tokens.some(tok => 
            student.number === tok || 
            `เลขที่${tok}`.includes(student.number)
          );
          
          if (hasClassroomMatch && hasNumberMatch) {
            matchesText = true;
          }
        }
        
        if (!matchesText) {
          const searchString = `${student.fullname} ${student.id} ${student.classroom} เลขที่ ${student.number} ${student.contact || ''}`.toLowerCase();
          matchesText = searchString.includes(query) || 
                        student.classroom.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '')) ||
                        `${student.classroom}/${student.number}`.toLowerCase().includes(query) ||
                        `${student.classroom.replace('ม.', '')}/${student.number}`.toLowerCase().includes(query);
        }
      }

      // 2. Classroom Selector
      const matchesClassroom = registryClassroom === 'all' || student.classroom === registryClassroom;

      // 3. Tab: all members vs pending requests
      let matchesTab = true;
      if (registryTab === 'requests') {
        matchesTab = Object.values(student.duties || {}).some(status => status === 'pending_selection');
      }

      // 4. Category Filter
      let matchesCategory = true;
      if (registryCategoryFilter === 'stand') {
        matchesCategory = student.duties?.['stand'] !== undefined;
      } else if (registryCategoryFilter === 'athlete') {
        matchesCategory = student.duties?.['athlete'] !== undefined;
      } else if (registryCategoryFilter === 'procession') {
        matchesCategory = student.duties?.['procession'] !== undefined;
      } else if (registryCategoryFilter === 'special') {
        const hasSpecial = Object.keys(student.duties || {}).some(k => k !== 'stand' && k !== 'athlete' && k !== 'procession');
        matchesCategory = hasSpecial;
      } else if (registryCategoryFilter === 'no_duty') {
        matchesCategory = !student.duties || !Object.values(student.duties).some(v => v === 'approved');
      }

      // 5. Normal Duty Selector
      let matchesDuty = true;
      if (registryDuty === 'has_duty') {
        matchesDuty = Object.values(student.duties || {}).some(s => s === 'approved');
      } else if (registryDuty === 'pending') {
        matchesDuty = Object.values(student.duties || {}).some(s => s === 'pending_selection');
      } else if (registryDuty === 'none') {
        matchesDuty = !student.duties || !Object.values(student.duties || {}).some(s => s === 'approved');
      } else if (registryDuty !== 'all') {
        matchesDuty = student.duties?.[registryDuty] !== undefined;
      }

      return matchesText && matchesClassroom && matchesTab && matchesCategory && matchesDuty;
    }).sort((a, b) => {
      const classA = parseClassroom(a.classroom || '');
      const classB = parseClassroom(b.classroom || '');
      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
      if (classA.room !== classB.room) return classA.room - classB.room;
      const numA = parseInt(a.number, 10) || 0;
      const numB = parseInt(b.number, 10) || 0;
      return numA - numB;
    });
  }, [data.students, registryClassroom, registryDuty, registrySearch, registryTab, registryCategoryFilter]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsCheckboxDragActive(false);
      setCheckboxDragMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [registrySearch, registryDuty, registryClassroom, registryTab, registryCategoryFilter]);

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
  const [editStudentContact, setEditStudentContact] = useState<string>('');
  const [editStudentError, setEditStudentError] = useState<string>('');

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

  const handleImportSubmit = () => {
    if (!currentUser || !isController) return;
    setImportError('');
    setImportSuccess('');

    const text = importText.trim();
    if (!text) {
      setImportError('กรุณากรอกหรือวางข้อมูลก่อนกดนำเข้าครับ!');
      return;
    }

    setIsImporting(true);

    setTimeout(() => {
      let parsedStudents: Student[] = [];

      // 1. ลอง Parse เป็น JSON
      if (text.startsWith('[') && text.endsWith(']')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsedStudents = parsed.map((item: any) => {
              if (!item.id || !item.fullname) {
                throw new Error('ข้อมูลนักเรียนต้องมีฟิลด์ รหัสประจำตัว (id) และชื่อ-นามสกุล (fullname)');
              }
              let role = item.role;
              if (!role && item.classroom) {
                const match = item.classroom.match(/ม\.(\d+)/);
                if (match) {
                  const grade = Number(match[1]);
                  role = grade <= 3 ? 'student_m13' : 'student_m46';
                } else {
                  role = 'student_m13';
                }
              }

              const assigned_duty = item.assigned_duty || 'none';
              const duty_status = item.duty_status || 'none';
              const duties = item.duties || {};
              if (assigned_duty !== 'none' && !duties[assigned_duty]) {
                duties[assigned_duty] = duty_status;
              }

              return {
                id: String(item.id),
                fullname: String(item.fullname),
                classroom: String(item.classroom || ''),
                number: String(item.number || ''),
                role: role || 'student_m13',
                assigned_duty,
                duty_status,
                duties,
                seat: item.seat || undefined,
                avatar: item.avatar || undefined,
              } as Student;
            });
          } else {
            setImportError('JSON ต้องเป็นอาร์เรย์ของข้อมูลสมาชิกเท่านั้น');
            setIsImporting(false);
            return;
          }
        } catch (e: unknown) {
          setImportError(`การอ่านข้อมูล JSON ผิดพลาด: ${e instanceof Error ? e.message : String(e)}`);
          setIsImporting(false);
          return;
        }
      } else {
        // 2. ลอง Parse เป็น CSV หรือ TSV
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) {
          setImportError('ไม่พบข้อมูลในระบบ');
          setIsImporting(false);
          return;
        }

        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        
        const parsedRows = lines.map(line => {
          const cells: string[] = [];
          let inQuotes = false;
          let currentCell = '';
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              cells.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell.trim());
          return cells.map(c => c.replace(/^["']|["']$/g, ''));
        });

        let idIdx = -1;
        let nameIdx = -1;
        let classIdx = -1;
        let numIdx = -1;
        let dutyIdx = -1;
        let statusIdx = -1;
        let seatIdx = -1;
        let standIdx = -1;
        let athleteIdx = -1;
        let processionIdx = -1;
        let specialIdx = -1;

        const headers = parsedRows[0].map(h => h.toLowerCase().trim());
        
        const idKeys = ['id', 'รหัส', 'ประจำตัว', 'student_id'];
        const nameKeys = ['fullname', 'name', 'ชื่อ', 'นามสกุล', 'ชื่อ-นามสกุล'];
        const classKeys = ['class', 'ห้อง', 'เรียน', 'classroom'];
        const numKeys = ['num', 'เลขที่', 'number', 'class_number', 'seat_no'];
        const dutyKeys = ['duty', 'หน้าที่', 'assigned_duty'];
        const statusKeys = ['status', 'สถานะ', 'duty_status'];
        const seatKeys = ['seat', 'ที่นั่ง'];

        headers.forEach((h, idx) => {
          if (idKeys.some(k => h.includes(k))) idIdx = idx;
          else if (nameKeys.some(k => h.includes(k))) nameIdx = idx;
          else if (classKeys.some(k => h.includes(k))) classIdx = idx;
          else if (numKeys.some(k => h.includes(k))) numIdx = idx;
          else if (h.includes('สแตนด์เชียร์') || h.includes('สแตนด์')) standIdx = idx;
          else if (h.includes('นักกีฬา')) athleteIdx = idx;
          else if (h.includes('ขบวนพาเหรด') || h.includes('ขบวน')) processionIdx = idx;
          else if (h.includes('หน้าที่พิเศษ')) specialIdx = idx;
          else if (dutyKeys.some(k => h.includes(k))) dutyIdx = idx;
          else if (statusKeys.some(k => h.includes(k))) statusIdx = idx;
          else if (seatKeys.some(k => h.includes(k))) seatIdx = idx;
        });

        let hasHeader = idIdx !== -1 && nameIdx !== -1;

        if (!hasHeader) {
          idIdx = 0;
          nameIdx = 1;
          classIdx = 2;
          numIdx = 3;
          dutyIdx = 4;
          statusIdx = 5;
          seatIdx = 6;
        }

        const isNewExportFormat = standIdx !== -1 || athleteIdx !== -1 || processionIdx !== -1 || specialIdx !== -1;
        const startIndex = hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < parsedRows.length; i++) {
          const cells = parsedRows[i];
          if (cells.length < 2 || !cells[idIdx] || !cells[nameIdx]) continue;

          const studentId = String(cells[idIdx]).trim();
          const fullname = String(cells[nameIdx]).trim();
          const classroom = classIdx !== -1 && cells[classIdx] ? String(cells[classIdx]).trim() : '';
          const number = numIdx !== -1 && cells[numIdx] ? String(cells[numIdx]).trim() : '';
          const seat = seatIdx !== -1 && cells[seatIdx] ? String(cells[seatIdx]).trim() : '';

          const match = classroom.match(/ม\.(\d+)/);
          const grade = match ? Number(match[1]) : 1;
          const role = grade <= 3 ? 'student_m13' : 'student_m46';

          let assigned_duty = 'none';
          let duty_status = 'none';
          const duties: Record<string, string> = {};

          if (isNewExportFormat) {
            if (standIdx !== -1 && cells[standIdx]) {
              const statusVal = String(cells[standIdx]).trim();
              if (statusVal !== '-' && statusVal !== '') {
                const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
                duties['stand'] = status;
                assigned_duty = 'stand';
                duty_status = status;
              }
            }
            if (athleteIdx !== -1 && cells[athleteIdx]) {
              const statusVal = String(cells[athleteIdx]).trim();
              if (statusVal !== '-' && statusVal !== '') {
                const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
                duties['athlete'] = status;
                assigned_duty = 'athlete';
                duty_status = status;
              }
            }
            if (processionIdx !== -1 && cells[processionIdx]) {
              const statusVal = String(cells[processionIdx]).trim();
              if (statusVal !== '-' && statusVal !== '') {
                const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
                duties['procession'] = status;
                assigned_duty = 'procession';
                duty_status = status;
              }
            }
            if (specialIdx !== -1 && cells[specialIdx]) {
              const specialVal = String(cells[specialIdx]).trim();
              if (specialVal !== '-' && specialVal !== '') {
                const parts = specialVal.split(',').map(p => p.trim()).filter(Boolean);
                parts.forEach(part => {
                  const subParts = part.split(':').map(sp => sp.trim());
                  if (subParts.length >= 1) {
                    const thDuty = subParts[0];
                    const rawStatus = subParts[1] || 'อนุมัติแล้ว';
                    
                    let engDuty = 'staff';
                    const thLower = thDuty.toLowerCase();
                    if (thLower.includes('หลีด') || thLower.includes('cheer')) engDuty = 'cheerleader';
                    else if (thLower.includes('ดรัม') || thLower.includes('drummer') || thLower.includes('major')) engDuty = 'drummer';
                    else if (thLower.includes('ดุริยางค์') || thLower.includes('band') || thLower.includes('วงโย')) engDuty = 'band';
                    else if (thLower.includes('กลอง') || thLower.includes('drum')) engDuty = 'drum';
                    else if (thLower.includes('ถือป้าย')) engDuty = 'drum';
                    else if (thLower.includes('สตาฟ') || thLower.includes('staff')) engDuty = 'staff';
                    
                    const status = rawStatus.includes('รอคัดเลือก') || rawStatus.includes('รออนุมัติ') ? 'pending_selection' : 'approved';
                    duties[engDuty] = status;
                    assigned_duty = engDuty;
                    duty_status = status;
                  }
                });
              }
            }
          } else {
            const rawDuty = dutyIdx !== -1 && cells[dutyIdx] ? String(cells[dutyIdx]).trim() : 'none';
            const rawStatus = statusIdx !== -1 && cells[statusIdx] ? String(cells[statusIdx]).trim() : 'none';

            const dutyLower = rawDuty.toLowerCase();
            if (dutyLower.includes('สแตน') || dutyLower.includes('stand')) assigned_duty = 'stand';
            else if (dutyLower.includes('หลีด') || dutyLower.includes('cheer')) assigned_duty = 'cheerleader';
            else if (dutyLower.includes('ดรัม') || dutyLower.includes('drummer') || dutyLower.includes('major')) assigned_duty = 'drummer';
            else if (dutyLower.includes('ดุริยางค์') || dutyLower.includes('band') || dutyLower.includes('ดนตรี')) assigned_duty = 'band';
            else if (dutyLower.includes('กลอง') || dutyLower.includes('drum')) assigned_duty = 'drum';
            else if (dutyLower.includes('นักกีฬา') || dutyLower.includes('athlete')) assigned_duty = 'athlete';
            else if (dutyLower.includes('staff') || dutyLower.includes('สตาฟ') || dutyLower.includes('ผู้ดูแล')) assigned_duty = 'staff';

            const statusLower = rawStatus.toLowerCase();
            if (statusLower.includes('อนุมัติ') || statusLower.includes('approve') || statusLower.includes('ใช่') || statusLower === 'y') duty_status = 'approved';
            else if (statusLower.includes('รอ') || statusLower.includes('pending')) duty_status = 'pending_selection';

            if (assigned_duty !== 'none' && duty_status === 'none') {
              duty_status = 'approved';
            }
            if (assigned_duty !== 'none') {
              duties[assigned_duty] = duty_status;
            }
          }

          parsedStudents.push({
            id: studentId,
            fullname: fullname,
            classroom: classroom,
            number: number,
            role: role,
            assigned_duty: assigned_duty,
            duty_status: duty_status,
            duties: duties,
            seat: (seat !== '-' && seat !== '') ? seat : undefined,
          } as Student);
        }
      }

      if (parsedStudents.length === 0) {
        setImportError('ไม่พบข้อมูลนักเรียนที่ถูกต้อง กรุณาตรวจสอบฟอร์แมตข้อมูลอีกครั้งครับ');
        setIsImporting(false);
        return;
      }

      importStudentsData(parsedStudents, importMode, currentUser);
      setImportSuccess(`นำเข้าข้อมูลสมาชิกสำเร็จจำนวน ${parsedStudents.length} คน เรียบร้อยแล้ว!`);
      setImportText('');
      setIsImporting(false);
      
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportSuccess('');
      }, 1500);
    }, 500);
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
        {([
          { id: 'all', label: '🗂️ ทุกหมวดหมู่', count: data.students.length },
          { id: 'stand', label: '📣 สแตนเชียร์', count: data.students.filter((s: Student) => s.duties?.['stand'] === 'approved').length },
          { id: 'athlete', label: '🏃 นักกีฬา', count: data.students.filter((s: Student) => s.duties?.['athlete'] === 'approved').length },
          { id: 'procession', label: `🚶 ${data.processionTitle || 'ขบวนพาเหรด'}`, count: data.students.filter((s: Student) => s.duties?.['procession'] === 'approved').length },
          { id: 'special', label: '✨ หน้าที่พิเศษ', count: data.students.filter((s: Student) => Object.keys(s.duties || {}).some(k => k !== 'stand' && k !== 'athlete' && k !== 'procession' && s.duties?.[k] === 'approved')).length },
          { id: 'no_duty', label: '❌ ไม่มีหน้าที่', count: data.students.filter((s: Student) => !Object.values(s.duties || {}).some(v => v === 'approved')).length },
        ] as const).map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setRegistryCategoryFilter(cat.id);
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
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ช่องทางติดต่อ</th>
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
                                  const nextDuties = { ...student.duties, [dutyId]: 'none' as DutyStatus };
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
                                    const nextDuties = { ...(student.duties || {}), [dutyId]: 'none' as DutyStatus };
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
                  <td className="py-3 px-4 text-text-secondary text-xs">{student.contact || '-'}</td>
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
                            setEditStudentContact(student.contact || '');
                            setEditStudentError('');
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
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ช่องทางติดต่อ (Line ID / IG)</label>
                <input
                  type="text"
                  value={editStudentContact}
                  onChange={(e) => setEditStudentContact(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  placeholder="เช่น Line: line_id หรือ IG: ig_username"
                />
              </div>

              {editStudentError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{editStudentError}</span>
                </div>
              )}

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
                    setEditStudentError('');
                    const newId = editStudentId.trim();
                    const cleanName = editStudentName.trim();
                    const cleanRoom = editStudentRoom.trim();
                    const cleanNum = editStudentNum.trim();
                    const cleanNick = editStudentNickname.trim();

                    if (!cleanName) { setEditStudentError('กรุณากรอกชื่อจริง'); return; }
                    if (!/^[a-zA-Zก-๙\s]+$/.test(cleanName)) { setEditStudentError('ชื่อจริงต้องประกอบด้วยตัวอักษรและช่องว่างเท่านั้น ไม่มีตัวเลขหรืออักขระพิเศษ'); return; }
                    if (cleanNick && !/^[a-zA-Zก-๙\s]+$/.test(cleanNick)) { setEditStudentError('ชื่อเล่นต้องประกอบด้วยตัวอักษรและช่องว่างเท่านั้น'); return; }
                    if (!cleanRoom) { setEditStudentError('กรุณากรอกห้องเรียน'); return; }
                    if (!/^ม\.\d+\/\d+$/.test(cleanRoom)) { setEditStudentError('ห้องเรียนต้องอยู่ในรูปแบบ ม.X/Y เช่น ม.1/8 หรือ ม.4/12'); return; }
                    if (!cleanNum) { setEditStudentError('กรุณากรอกเลขที่'); return; }
                    if (!/^\d+$/.test(cleanNum) || Number(cleanNum) <= 0 || Number(cleanNum) > 100) { setEditStudentError('เลขที่ต้องเป็นตัวเลขระหว่าง 1 ถึง 100'); return; }
                    
                    if (!newId || newId === 'ยังไม่มี' || newId === 'undefined') {
                      setEditStudentError('กรุณากรอกเลขประจำตัวนักเรียน');
                      return;
                    }
                    if (!/^\d{5}$/.test(newId)) {
                      setEditStudentError('เลขประจำตัวต้องเป็นตัวเลข 5 หลัก');
                      return;
                    }
                    if (newId !== editStudentTarget.id && data.students.some((s: Student) => s.id === newId)) {
                      setEditStudentError(`เลขประจำตัว ${newId} นี้มีในระบบอยู่แล้วครับ`);
                      return;
                    }

                    const finalFullname = cleanNick ? `${cleanName} (${cleanNick})` : cleanName;

                    updateStudent(
                      editStudentTarget.id,
                      {
                        id: newId,
                        fullname: finalFullname || editStudentTarget.fullname,
                        classroom: cleanRoom || editStudentTarget.classroom,
                        number: cleanNum || editStudentTarget.number,
                        contact: editStudentContact.trim() || undefined
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

      {/* Add New Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans text-text-primary">
          <div className="w-full max-w-md bg-carbon-card border border-green-500/20 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Plus size={20} className="text-green-400" /> เพิ่มสมาชิกใหม่
            </h3>
            <p className="text-xs text-text-secondary mb-5">กรอกข้อมูลสมาชิกที่ต้องการเพิ่มเข้าระบบ</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อจริง <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="ชื่อ นามสกุล"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อเล่น</label>
                  <input
                    type="text"
                    value={newMemberNickname}
                    onChange={(e) => setNewMemberNickname(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น เตโช"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ห้องเรียน <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberRoom}
                    onChange={(e) => setNewMemberRoom(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น ม.1/8"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เลขที่ <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberNum}
                    onChange={(e) => setNewMemberNum(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น 5"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">รหัสนักเรียน (5 หลัก) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  maxLength={5}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white font-mono"
                  placeholder="เช่น 42324"
                />
              </div>

              {newMemberError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{newMemberError}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light border border-pink-primary/10 text-text-secondary py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setNewMemberError('');
                  const name = newMemberName.trim();
                  const room = newMemberRoom.trim();
                  const num = newMemberNum.trim();
                  const id = newMemberId.trim();
                  const nick = newMemberNickname.trim();
                  
                  if (!name) { setNewMemberError('กรุณากรอกชื่อจริง'); return; }
                  if (!/^[a-zA-Zก-๙\s]+$/.test(name)) { setNewMemberError('ชื่อจริงต้องประกอบด้วยตัวอักษรและช่องว่างเท่านั้น ไม่มีตัวเลขหรืออักขระพิเศษ'); return; }
                  if (nick && !/^[a-zA-Zก-๙\s]+$/.test(nick)) { setNewMemberError('ชื่อเล่นต้องประกอบด้วยตัวอักษรและช่องว่างเท่านั้น'); return; }
                  if (!room) { setNewMemberError('กรุณากรอกห้องเรียน'); return; }
                  if (!/^ม\.\d+\/\d+$/.test(room)) { setNewMemberError('ห้องเรียนต้องอยู่ในรูปแบบ ม.X/Y เช่น ม.1/8 หรือ ม.4/12'); return; }
                  if (!num) { setNewMemberError('กรุณากรอกเลขที่'); return; }
                  if (!/^\d+$/.test(num) || Number(num) <= 0 || Number(num) > 100) { setNewMemberError('เลขที่ต้องเป็นตัวเลขระหว่าง 1 ถึง 100'); return; }
                  if (!id) { setNewMemberError('กรุณากรอกรหัสนักเรียน'); return; }
                  if (!/^\d{5}$/.test(id)) { setNewMemberError('รหัสนักเรียนต้องเป็นตัวเลข 5 หลักเท่านั้น'); return; }
                  
                  if (data.students.some((s: Student) => s.id === id)) {
                    setNewMemberError(`รหัส ${id} มีในระบบแล้ว`);
                    return;
                  }
                  
                  const fullname = nick ? `${name} (${nick})` : name;
                  const gradeMatch = room.match(/ม\.(\d+)/);
                  const grade = gradeMatch ? Number(gradeMatch[1]) : 1;
                  const newStudent: Student = {
                    id,
                    fullname,
                    classroom: room,
                    number: num,
                    role: grade <= 3 ? 'student_m13' : grade === 4 ? 'student_m4' : 'student_m5',
                    assigned_duty: 'none',
                    duty_status: 'none',
                    duties: {},
                  };
                  importStudentsData([newStudent], 'merge', currentUser || undefined);
                  setIsAddMemberOpen(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-600/20 cursor-pointer"
              >
                เพิ่มสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Members Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans text-text-primary">
          <div className="w-full max-w-lg bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
            {isExporting && (
              <div className="absolute inset-0 bg-black/75 z-50 flex flex-col items-center justify-center space-y-4 rounded-3xl backdrop-blur-sm animate-fadeIn">
                <div className="w-12 h-12 rounded-full border-4 border-t-pink-primary border-pink-primary/20 animate-spin" />
                <p className="text-sm font-bold text-white font-sans">กำลังจัดเตรียมไฟล์เพื่อส่งออก...</p>
                <p className="text-xs text-text-secondary font-sans">กรุณารอสักครู่ ระบบกำลังจัดฟอร์แมตข้อมูล</p>
              </div>
            )}
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">📤 ส่งออกข้อมูลสมาชิก</h3>
            <p className="text-xs text-text-secondary mb-5">เลือกรูปแบบที่ต้องการส่งออก — ครอบคลุมข้อมูลสมาชิกทั้ง {data.students.length} คน</p>

            <div className="space-y-3">
              {/* Export JSON */}
              <button
                onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => {
                    const sortedStudents = [...data.students].sort((a, b) => {
                      const classA = parseClassroom(a.classroom || '');
                      const classB = parseClassroom(b.classroom || '');
                      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
                      if (classA.room !== classB.room) return classA.room - classB.room;
                      const numA = parseInt(a.number, 10) || 0;
                      const numB = parseInt(b.number, 10) || 0;
                      return numA - numB;
                    });
                    const exportData = sortedStudents.map((s: Student) => ({
                      id: s.id,
                      fullname: s.fullname,
                      classroom: s.classroom,
                      number: s.number,
                      role: s.role,
                      duties: s.duties || {},
                      seat: s.seat || null,
                    }));
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pink69_members_${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setIsExporting(false);
                  }, 800);
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗂️</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">Export JSON</p>
                    <p className="text-xs text-text-tertiary mt-0.5">สำหรับนำเข้ากลับเข้าระบบ PINK69 หรือใช้กับเว็บแอปอื่น</p>
                  </div>
                  <Download size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => {
                    const labelMap: Record<string, string> = {
                      stand: 'สแตนด์เชียร์',
                      athlete: 'นักกีฬา',
                      procession: data.processionTitle || 'ขบวนพาเหรด',
                    };
                    (data.specialDuties || []).forEach((sd: { id: string; title: string }) => {
                      labelMap[sd.id] = sd.title;
                    });
                    const statusLabel: Record<string, string> = {
                      approved: 'อนุมัติแล้ว',
                      pending: 'รอพิจารณา',
                      pending_selection: 'รอคัดเลือก',
                      rejected: 'ถูกปฏิเสธ',
                      none: '-',
                    };
                    const headers = ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'ห้องเรียน', 'เลขที่', 'สแตนด์เชียร์', 'นักกีฬา', 'ขบวนพาเหรด', 'หน้าที่พิเศษ', 'หน้าที่ทั้งหมด', 'ที่นั่งแสตน'];
                    const sortedStudents = [...data.students].sort((a, b) => {
                      const classA = parseClassroom(a.classroom || '');
                      const classB = parseClassroom(b.classroom || '');
                      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
                      if (classA.room !== classB.room) return classA.room - classB.room;
                      const numA = parseInt(a.number, 10) || 0;
                      const numB = parseInt(b.number, 10) || 0;
                      return numA - numB;
                    });
                    const rows = sortedStudents.map((s: Student) => {
                      const nicknameMatch = s.fullname.match(/\(\s*([^)]+?)\s*\)\s*$/);
                      const nickname = nicknameMatch ? nicknameMatch[1] : '';
                      const realName = s.fullname.replace(/\s*\([^)]+\)\s*$/, '').trim();

                      const duties = s.duties || {};

                      const allDutiesSummary = Object.entries(duties)
                        .filter(([, v]) => v === 'approved' || v === 'pending_selection')
                        .map(([k, v]) => {
                          const name = labelMap[k] || k;
                          if (v === 'pending_selection') return `${name} (รอคัดเลือก)`;
                          return name;
                        })
                        .join(', ');

                      const specialDutiesSummary = Object.entries(duties)
                        .filter(([k]) => k !== 'stand' && k !== 'athlete' && k !== 'procession')
                        .map(([k, v]) => `${labelMap[k] || k}: ${statusLabel[v] || v}`)
                        .join(', ');

                      return [
                        s.id,
                        realName,
                        nickname,
                        s.classroom,
                        s.number,
                        statusLabel[duties['stand'] || 'none'] || '-',
                        statusLabel[duties['athlete'] || 'none'] || '-',
                        statusLabel[duties['procession'] || 'none'] || '-',
                        specialDutiesSummary || '-',
                        allDutiesSummary || '-',
                        s.seat || '-',
                      ];
                    });
                    const csvContent = [headers, ...rows].map(r => r.map((c: string) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
                    const BOM = '\uFEFF';
                    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pink69_members_${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setIsExporting(false);
                  }, 800);
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">Export CSV</p>
                    <p className="text-xs text-text-tertiary mt-0.5">เปิดด้วย Excel / Google Sheets ได้เลย รองรับภาษาไทย</p>
                  </div>
                  <Download size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>

              {/* Copy JSON to clipboard */}
              <button
                onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => {
                    const sortedStudents = [...data.students].sort((a, b) => {
                      const classA = parseClassroom(a.classroom || '');
                      const classB = parseClassroom(b.classroom || '');
                      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
                      if (classA.room !== classB.room) return classA.room - classB.room;
                      const numA = parseInt(a.number, 10) || 0;
                      const numB = parseInt(b.number, 10) || 0;
                      return numA - numB;
                    });
                    const exportData = sortedStudents.map((s: Student) => ({
                      id: s.id,
                      fullname: s.fullname,
                      classroom: s.classroom,
                      number: s.number,
                      role: s.role,
                      duties: s.duties || {},
                      seat: s.seat || null,
                    }));
                    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
                      setIsExporting(false);
                      alert('✅ คัดลอก JSON ไปยัง Clipboard แล้ว!');
                    });
                  }, 800);
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">คัดลอก JSON</p>
                    <p className="text-xs text-text-tertiary mt-0.5">Copy JSON ไปยัง Clipboard เพื่อวางที่อื่นได้เลย</p>
                  </div>
                  <Copy size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>
            </div>

            <p className="text-[11px] text-text-tertiary text-center mt-4">ข้อมูลที่ส่งออก ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      )}

      {/* Import Members Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans text-text-primary">
          <div className="w-full max-w-2xl bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {isImporting && (
              <div className="absolute inset-0 bg-black/75 z-50 flex flex-col items-center justify-center space-y-4 rounded-3xl backdrop-blur-sm animate-fadeIn">
                <div className="w-12 h-12 rounded-full border-4 border-t-pink-primary border-pink-primary/20 animate-spin" />
                <p className="text-sm font-bold text-white font-sans">กำลังนำเข้าข้อมูลสมาชิก...</p>
                <p className="text-xs text-text-secondary font-sans">กรุณารอสักครู่ ระบบกำลังจัดสรรข้อมูล</p>
              </div>
            )}
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              📥 นำเข้าข้อมูลสมาชิกสีชมพู (Google Sheets / CSV)
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              ปรับปรุงและลงทะเบียนข้อมูลนักเรียนทีละหลายๆ คนพร้อมกันอย่างสะดวก
            </p>

            <div className="space-y-4">
              <div className="bg-carbon-dark/50 border border-pink-primary/10 rounded-xl p-4 text-xs space-y-2">
                <p className="font-bold text-pink-accent">💡 รูปแบบคอลัมน์ใน Google Sheets / CSV ที่แนะนำ:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-text-secondary font-mono bg-carbon-dark/60 p-2.5 rounded-lg border border-pink-primary/5">
                  <div>A: รหัสประจำตัว (5 หลัก)</div>
                  <div>B: ชื่อ-นามสกุล</div>
                  <div>C: ห้องเรียน (เช่น ม.1/8)</div>
                  <div>D: เลขที่</div>
                  <div>E: หน้าที่ (เช่น stand, athlete)</div>
                  <div>F: สถานะ (เช่น approved)</div>
                  <div>G: ที่นั่ง (เช่น A1)</div>
                </div>
              </div>

              <div className="bg-carbon-dark/30 p-3.5 rounded-xl border border-pink-primary/5 space-y-3 text-sm">
                <span className="font-semibold text-text-secondary block">🔄 โหมดการนำเข้า:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      importMode === 'merge'
                        ? 'bg-pink-primary/15 border-pink-primary text-text-primary'
                        : 'bg-carbon-dark/40 border-pink-primary/10 text-text-secondary hover:border-pink-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${importMode === 'merge' ? 'border-pink-primary bg-pink-primary' : 'border-text-tertiary'}`} />
                      <span className="text-xs font-bold">ผสานข้อมูล (Merge)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed pl-5">
                      เพิ่มคนใหม่ และอัปเดตข้อมูลเฉพาะคนที่อยู่ในไฟล์ คนที่ไม่ได้อยู่ในไฟล์จะยังคงอยู่ในระบบเหมือนเดิม
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-red-500/15 border-red-500 text-text-primary'
                        : 'bg-carbon-dark/40 border-pink-primary/10 text-text-secondary hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${importMode === 'replace' ? 'border-red-500 bg-red-500' : 'border-text-tertiary'}`} />
                      <span className="text-xs font-bold">⚠️ เขียนทับทั้งหมด (Replace)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed pl-5">
                      ลบข้อมูลทุกคนออกก่อน แล้วใส่ข้อมูลจากไฟล์เข้ามาแทน เหมาะเมื่อต้องการรีเซ็ตรายชื่อใหม่ทั้งหมด
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  วางข้อมูลตาราง (TSV จาก Sheets/Excel) หรืออาร์เรย์ JSON:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`วางข้อมูลลงที่นี่ เช่น คลุมตารางใน Google Sheet แล้วกด Ctrl+C และมาวางในกล่องนี้ได้ทันที\n\nตัวอย่างข้อมูล:\nรหัสประจำตัว\tชื่อ-นามสกุล\tห้อง\tเลขที่\tหน้าที่\tสถานะ\tที่นั่ง\n42324\tกฤษณพล ถาวงค์ (เตโช)\tม.1/8\t1\tstand\tapproved\tA1`}
                  className="w-full h-40 bg-carbon-dark border border-pink-primary/10 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-primary text-white font-mono resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <label className="flex items-center gap-1.5 bg-carbon-light/80 hover:bg-carbon-light text-text-primary px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-pink-primary/10 active:scale-95">
                  📂 หรือเลือกไฟล์ข้อมูล (CSV / JSON)
                  <input
                    type="file"
                    accept=".csv,.tsv,.json,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImportText(event.target?.result as string || '');
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
                <div className="text-[11px] text-text-tertiary">
                  รองรับไฟล์ .csv, .tsv, .json และ .txt
                </div>
              </div>

              {importError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light border border-pink-primary/10 text-text-secondary py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleImportSubmit}
                className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-primary/20 cursor-pointer"
              >
                ยืนยันนำเข้าข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

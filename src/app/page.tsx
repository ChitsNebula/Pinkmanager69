'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Image as ImageIcon,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Announcement,
  SpecialDuty,
  addSportsEvent,
  assignAthleteToEvent,
  bookSeat,
  getStoredData,
  releaseSeat,
  removeAthleteFromEvent,
  removeSportsEvent,
  saveAnnouncements,
  saveSystemConfig,
  subscribe,
  updateStudent,
} from './store';
import { Duty, SportsEvent, Student } from './mockData';

type Tab = 'dashboard' | 'apply' | 'announcements' | 'registry' | 'admin';

const rows = ['J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
const columns = Array.from({ length: 18 }, (_, i) => i + 1);

const classroomSortKey = (classroom: string) => {
  const match = classroom.match(/ม\.(\d+)\/(\d+)/);
  if (!match) return [99, 99, classroom] as const;
  return [Number(match[1]), Number(match[2]), classroom] as const;
};

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Home() {
  const [data, setData] = useState(() => getStoredData());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = currentUserId
    ? data.students.find((s: Student) => s.id === currentUserId) ?? null
    : null;

  const [loginTab, setLoginTab] = useState<'member' | 'staff'>('member');
  const [loginClassroom, setLoginClassroom] = useState('');
  const [loginNumber, setLoginNumber] = useState('');
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState('');

  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryDuty, setRegistryDuty] = useState('all');
  const [registryClassroom, setRegistryClassroom] = useState('all');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [newAnnouncementImage, setNewAnnouncementImage] = useState('');
  const [newDutyTitle, setNewDutyTitle] = useState('');
  const [newDutyLimit, setNewDutyLimit] = useState('10');
  const [newDutyLineLink, setNewDutyLineLink] = useState('');
  const [newDutyQr, setNewDutyQr] = useState('');
  const [newAthleteLineLink, setNewAthleteLineLink] = useState(data.athleteQr.lineLink || '');
  const [newAthleteQr, setNewAthleteQr] = useState(data.athleteQr.qrCode || '');
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('กรีฑา');
  const [newEventSubcategory, setNewEventSubcategory] = useState('ลู่'); // ลู่ หรือ ลาน
  const [newEventGender, setNewEventGender] = useState('ชาย'); // ชาย, หญิง, ผสม
  const [newEventLimit, setNewEventLimit] = useState('1'); // จำนวนคน
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [registryTab, setRegistryTab] = useState<'all_members' | 'requests'>('all_members');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<'all' | 'stand' | 'athlete' | 'special'>('all');

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const next = getStoredData();
      setData(next);
      setNewAthleteLineLink(next.athleteQr.lineLink || '');
      setNewAthleteQr(next.athleteQr.qrCode || '');
    });
    return unsubscribe;
  }, []);

  const classrooms = useMemo(() => {
    return [...new Set(data.students.map((s: Student) => s.classroom).filter(Boolean) as string[])]
      .sort((a: string, b: string) => {
        const ak = classroomSortKey(a);
        const bk = classroomSortKey(b);
        return ak[0] - bk[0] || ak[1] - bk[1] || ak[2].localeCompare(bk[2], 'th');
      });
  }, [data.students]);

  useEffect(() => {
    if (!loginClassroom && classrooms.length > 0) {
      setLoginClassroom(classrooms[0]);
    }
  }, [classrooms, loginClassroom]);

  const isController = !!currentUser && (currentUser.role === 'admin_president' || currentUser.role === 'staff_m5');
  const isNormalStudent = !!currentUser && !isController;
  const standApplicants = data.students.filter((s: Student) => s.assigned_duty === 'stand');
  const seatedStudents = data.students.filter((s: Student) => s.seat);
  const unassignedStudents = data.students.filter((s: Student) => s.assigned_duty === 'none');

  const detectedStudent = data.students.find(
    (s: Student) => s.classroom === loginClassroom && s.number === loginNumber
  );

  const roleLabel = (student: Student) => {
    if (student.role === 'admin_president') return 'ประธานสี';
    if (student.role === 'staff_m5') return 'ผู้ควบคุม';
    if (student.role === 'student_m4') return 'ม.4';
    if (student.role === 'student_m5') return 'ม.5';
    return 'ม.1-3';
  };

  const dutyLabel = (duty: Duty) => {
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
        return 'เดินขบวนพาเหรด';
      case 'staff':
        return 'พี่คุมงาน / สตาฟ';
      default:
        return duty;
    }
  };

  const dutyOptions = useMemo(() => {
    return [
      { id: 'none', label: 'ยังไม่มีหน้าที่' },
      { id: 'stand', label: 'สแตนเชียร์' },
      { id: 'athlete', label: 'นักกีฬา' },
      ...data.specialDuties.map((item: SpecialDuty) => ({ id: item.id, label: item.title })),
    ];
  }, [data.specialDuties]);

  const dutyCounts = useMemo(() => {
    return dutyOptions.map((option) => ({
      ...option,
      count: data.students.filter((s: Student) => s.assigned_duty === option.id).length,
    }));
  }, [data.students, dutyOptions]);

  const filteredRegistry = useMemo(() => {
    const query = registrySearch.trim().toLowerCase();
    return data.students.filter((student: Student) => {
      // 1. Text Search
      let matchesText = !query;
      if (query) {
        // ลองแยกคำค้นหาเผื่อพิมพ์ห้องกับเลขที่คู่กัน เช่น "5/15" หรือ "ม.5/8 3" หรือ "ม.5/8 เลขที่ 3"
        const tokens = query.split(/[\s/]+/); // แยกด้วยเว้นวรรค หรือ เครื่องหมาย /
        
        if (tokens.length >= 2) {
          // กรณีป้อนค้นหาสองเงื่อนไข เช่น "5" และ "15" (หมายถึงห้อง 5/x และ เลขที่ 15 หรือกลับกัน)
          // เช็กว่ามี token ตัวใดตัวหนึ่งตรงกับห้องเรียน และอีกตัวตรงกับเลขที่
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
        
        // ถ้าค้นหาแบบละเอียดด้านบนไม่เจอ ให้ค้นหาแบบข้อความปกติทั่วไป
        if (!matchesText) {
          // เช็กแบบครอบคลุม
          const searchString = `${student.fullname} ${student.id} ${student.classroom} เลขที่ ${student.number}`.toLowerCase();
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
        matchesTab = student.duty_status === 'pending_selection' && student.assigned_duty !== 'none';
      }

      // 4. Category Filter (แยกตามหมวดหมู่หน้าที่)
      let matchesCategory = true;
      if (registryCategoryFilter === 'stand') {
        matchesCategory = student.assigned_duty === 'stand';
      } else if (registryCategoryFilter === 'athlete') {
        matchesCategory = student.assigned_duty === 'athlete';
      } else if (registryCategoryFilter === 'special') {
        // ทุกอย่างที่ไม่ใช่ none, stand, athlete
        matchesCategory = student.assigned_duty !== 'none' && student.assigned_duty !== 'stand' && student.assigned_duty !== 'athlete';
      }

      // 5. Normal Duty Selector (if applicable)
      const matchesDuty = registryDuty === 'all' || student.assigned_duty === registryDuty;

      return matchesText && matchesClassroom && matchesTab && matchesCategory && matchesDuty;
    });
  }, [data.students, registryClassroom, registryDuty, registrySearch, registryTab, registryCategoryFilter]);

  const getSeatOwner = (seatLabel: string) => {
    return data.students.find((s: Student) => s.seat === seatLabel);
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const student = data.students.find(
      (s: Student) => s.classroom === loginClassroom && s.number === loginNumber && s.id === loginStudentId
    );
    if (!student) {
      setLoginError('ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบห้อง เลขที่ และรหัสประจำตัว');
      return;
    }
    setCurrentUserId(student.id);
    setCurrentTab('dashboard');
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    if (staffUsername === 'admin' && staffPassword === '123') {
      const adminUser = data.students.find((s: Student) => s.role === 'admin_president');
      if (adminUser) {
        setCurrentUserId(adminUser.id);
        setCurrentTab('admin');
        return;
      }
    }

    const controller = data.students.find(
      (s: Student) => s.id === staffUsername && data.controllers.includes(s.id)
    );
    if (controller && staffPassword === '123') {
      setCurrentUserId(controller.id);
      setCurrentTab('admin');
      return;
    }

    setStaffError('ผู้ควบคุมต้องใช้รหัสนักเรียนที่ถูกกำหนดไว้เท่านั้น หรือใช้ admin/123');
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setLoginNumber('');
    setLoginStudentId('');
    setStaffUsername('');
    setStaffPassword('');
    setLoginError('');
    setStaffError('');
  };

  const applyDuty = (duty: Duty) => {
    if (!currentUser) return;
    if (currentUser.assigned_duty !== 'none' && currentUser.assigned_duty !== duty) {
      alert('คุณมีหน้าที่อยู่แล้ว หากต้องการเปลี่ยนให้ติดต่อผู้ควบคุม');
      return;
    }
    updateStudent(currentUser.id, {
      assigned_duty: duty,
      duty_status: duty === 'stand' ? 'approved' : 'pending_selection',
    });
  };

  const cancelOwnDuty = () => {
    if (!currentUser) return;
    if (currentUser.assigned_duty === 'stand' && data.standLocked) {
      alert('ระบบล็อกการลงสแตนเชียร์แล้ว ไม่สามารถยกเลิกหน้าที่ได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
      return;
    }
    if (confirm('ต้องการยกเลิกหน้าที่ที่สมัครไว้ใช่หรือไม่?')) {
      updateStudent(currentUser.id, { assigned_duty: 'none', duty_status: 'none', seat: undefined });
    }
  };

  const handleSeatClick = (row: string, colNum: number) => {
    if (!currentUser) return;
    const seatLabel = `${row}${colNum}`;
    const owner = getSeatOwner(seatLabel);

    if (isController) {
      if (owner && confirm(`ต้องการยกเลิกที่นั่ง ${seatLabel} ของ ${owner.fullname} ใช่หรือไม่?`)) {
        releaseSeat(seatLabel);
      }
      return;
    }

    if (currentUser.assigned_duty !== 'stand') return;
    if (owner) {
      if (owner.id === currentUser.id) {
        if (data.standLocked) {
          alert('ระบบล็อกการจองสแตนเชียร์แล้ว ไม่สามารถยกเลิกการจองได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
          return;
        }
        if (confirm('ต้องการยกเลิกการจองที่นั่งของคุณใช่หรือไม่?')) {
          releaseSeat(seatLabel);
        }
      } else {
        alert(`ที่นั่งนี้ถูกจองแล้วโดย ${owner.fullname} (${owner.classroom})`);
      }
      return;
    }

    if (data.standLocked) {
      alert('ระบบล็อกการจองสแตนเชียร์แล้ว ไม่สามารถจองที่นั่งเพิ่มได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
      return;
    }

    if (confirm(`คุณต้องการจองที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
      bookSeat(currentUser.id, seatLabel);
    }
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || !newAnnouncementTitle.trim()) return;
    const announcement: Announcement = {
      id: `a_${Date.now()}`,
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      image: newAnnouncementImage || undefined,
      date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      createdBy: currentUser.fullname,
    };
    saveAnnouncements([announcement, ...data.announcements], currentUser, 'เพิ่มประกาศ', announcement.title);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    setNewAnnouncementImage('');
  };

  const addSpecialDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || !newDutyTitle.trim()) return;
    const id = `special_${Date.now()}`;
    
    // หากกรอก 0 หรือเว้นว่าง หรือค่าผิดปกติ ให้ปรับเป็น 9999 (ซึ่งจะแสดงผลว่า "ไม่จำกัด")
    const parseLimit = Number(newDutyLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;

    const nextDuty: SpecialDuty = {
      id,
      title: newDutyTitle.trim(),
      icon: 'S',
      limit: limitValue,
      lineLink: newDutyLineLink.trim(),
      qrCode: newDutyQr,
    };
    saveSystemConfig(
      { specialDuties: [...data.specialDuties, nextDuty] },
      currentUser,
      `เพิ่มหน้าที่พิเศษ ${nextDuty.title}`
    );
    setNewDutyTitle('');
    setNewDutyLimit('10');
    setNewDutyLineLink('');
    setNewDutyQr('');
  };

  const removeSpecialDuty = (id: string) => {
    if (!currentUser || !isController) return;
    const duty = data.specialDuties.find((item: SpecialDuty) => item.id === id);
    if (!duty || !confirm(`ต้องการลบหน้าที่ ${duty.title} ใช่หรือไม่?`)) return;
    saveSystemConfig(
      { specialDuties: data.specialDuties.filter((item: SpecialDuty) => item.id !== id) },
      currentUser,
      `ลบหน้าที่พิเศษ ${duty.title}`
    );
  };

  const saveAthleteQr = () => {
    if (!currentUser || !isController) return;
    saveSystemConfig(
      { athleteQr: { qrCode: newAthleteQr, lineLink: newAthleteLineLink } },
      currentUser,
      'อัปเดต QR กลุ่มนักกีฬา'
    );
  };

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-primary to-pink-accent" />
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-primary/20">
              <Award size={36} className="text-pink-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">คณะสีชมพู (ปทุมชาติ)</h1>
            <p className="text-xs text-text-secondary">ระบบจัดการหน้าที่ สมัครกิจกรรม และประกาศกีฬาสี</p>
          </div>

          <div className="flex bg-carbon-dark border border-pink-primary/10 rounded-full p-1.5 mb-6">
            <button
              onClick={() => setLoginTab('member')}
              className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginTab === 'member' ? 'bg-pink-primary text-white shadow' : 'text-text-secondary hover:text-white'}`}
            >
              <User size={16} /> สมาชิกสี
            </button>
            <button
              onClick={() => setLoginTab('staff')}
              className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginTab === 'staff' ? 'bg-pink-primary text-white shadow' : 'text-text-secondary hover:text-white'}`}
            >
              <ShieldAlert size={16} /> ผู้ควบคุม
            </button>
          </div>

          {loginTab === 'member' ? (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  เลือกห้องเรียน (Classroom)
                </span>
                <select
                  value={loginClassroom}
                  onChange={(e) => {
                    setLoginClassroom(e.target.value);
                    setLoginNumber('');
                  }}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom} value={classroom}>
                      {classroom}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">เลขที่</span>
                  <input
                    type="number"
                    placeholder="เช่น 15"
                    value={loginNumber}
                    onChange={(e) => setLoginNumber(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                    required
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">รหัสประจำตัว</span>
                  <input
                    type="password"
                    placeholder="รหัสนักเรียน"
                    value={loginStudentId}
                    onChange={(e) => setLoginStudentId(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                    required
                  />
                </label>
              </div>

              {detectedStudent && (
                <div className="p-3 bg-pink-primary/5 border border-pink-primary/25 rounded-xl text-xs text-pink-accent flex items-center justify-between">
                  <span>พบชื่อ: <strong>{detectedStudent.fullname}</strong></span>
                  <span className="text-text-secondary">{detectedStudent.id}</span>
                </div>
              )}

              {loginError && <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">{loginError}</div>}

              <button className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10">
                เข้าสู่ระบบสมาชิก
              </button>
            </form>
          ) : (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">ผู้ควบคุม</span>
                <input
                  type="text"
                  placeholder="admin หรือรหัสนักเรียนผู้ควบคุม"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">รหัสผ่าน</span>
                <input
                  type="password"
                  placeholder="123"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  required
                />
              </label>
              {staffError && <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">{staffError}</div>}
              <button className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10">
                เข้าสู่ระบบผู้ควบคุม
              </button>
              <div className="p-3 bg-carbon-dark border border-pink-primary/5 rounded-xl text-[11px] text-text-tertiary text-center leading-relaxed">
                ผู้ควบคุมต้องเป็นรหัสที่กำหนดไว้ในระบบเท่านั้น ม.5 คนอื่นจะเป็นสมาชิกปกติ
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-carbon-dark text-text-primary">
      <header className="sticky top-0 z-50 glass-nav px-6 py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-primary flex items-center justify-center font-bold text-white text-lg tracking-wider shadow shadow-pink-primary/45">P</div>
          <span className="font-semibold text-lg tracking-widest text-white">PINK<span className="text-pink-primary">69</span></span>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {[
            ['dashboard', 'หน้าหลัก'],
            ['apply', 'สมัครหน้าที่'],
            ['announcements', 'ประกาศ'],
            ['registry', 'ทะเบียนสี'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id as Tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === id ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
            >
              {label}
            </button>
          ))}
          {isController && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'admin' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
            >
              แผงผู้ควบคุม
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-carbon-card border border-pink-primary/20 px-3 py-1.5 rounded-lg text-sm shadow">
            <User size={16} className="text-pink-primary" />
            <span className="font-semibold text-text-primary text-xs md:text-sm">{currentUser.fullname}</span>
            <span className="text-[10px] text-pink-primary bg-pink-primary/15 px-2 py-0.5 rounded uppercase font-semibold">
              {currentUser.classroom} {currentUser.number ? `เลขที่ ${currentUser.number}` : ''} · {roleLabel(currentUser)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            title="ออกจากระบบ"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">ออกระบบ</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {currentTab === 'dashboard' && (
          <section className="space-y-8 animate-fadeIn">
            {/* Rich Gradient Hero Section with Conic/Radial Glow Effect */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-carbon-card via-[#1c1223] to-[#111a2c] border border-pink-primary/15 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-primary/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-widest text-pink-primary font-bold bg-pink-primary/10 px-3 py-1 rounded-full border border-pink-primary/20">Dashboard</span>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-2 tracking-tight text-white">ระบบจัดการหน้าที่สีชมพู</h1>
                <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
                  รวมสมัครหน้าที่ ประกาศสำคัญ ทะเบียนการทำงาน และการจองสแตนเชียร์ของพวกเราคณะสีชมพูไว้ในระบบเดียวแบบเรียลไทม์
                </p>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Members - Pink Theme */}
                  <div className="bg-[#1e131d]/60 border border-pink-primary/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-pink-primary/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-primary/15 text-pink-primary flex items-center justify-center border border-pink-primary/20">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">สมาชิกทั้งหมด</p>
                        <p className="text-xl font-bold text-white mt-0.5">{data.students.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Duties - Emerald Green Theme */}
                  <div className="bg-[#101c18]/60 border border-emerald-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-emerald-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">มีหน้าที่แล้ว</p>
                        <p className="text-xl font-bold text-emerald-400 mt-0.5">{data.students.length - unassignedStudents.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Unassigned Duties - Violet/Rose Theme */}
                  <div className="bg-[#1d1414]/60 border border-rose-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-rose-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/20">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">ยังไม่มีหน้าที่</p>
                        <p className="text-xl font-bold text-rose-400 mt-0.5">{unassignedStudents.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Seated Stand - Gold/Yellow Theme */}
                  <div className="bg-[#1f1a10]/60 border border-yellow-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-yellow-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">จองสแตนแล้ว</p>
                        <p className="text-xl font-bold text-yellow-400 mt-0.5">{seatedStudents.length} / 180 คน</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="สถานะหน้าที่ของคุณ">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <p className="text-sm text-text-secondary">หน้าที่ปัจจุบัน</p>
                    <p className="text-2xl font-bold text-pink-primary">{dutyLabel(currentUser.assigned_duty)}</p>
                    {currentUser.seat ? (
                      <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg w-max text-green-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        จองที่นั่งรหัส {currentUser.seat} สำเร็จ
                      </div>
                    ) : currentUser.duty_status === 'pending_selection' ? (
                      <div className="flex items-center gap-1.5 mt-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg w-max text-yellow-500 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        รอคัดเลือก / รออนุมัติ
                      </div>
                    ) : currentUser.assigned_duty !== 'none' && currentUser.duty_status === 'approved' ? (
                      <div className="flex items-center gap-1.5 mt-2 bg-pink-primary/10 border border-pink-primary/20 px-3 py-1 rounded-lg w-max text-pink-primary text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-pink-primary"></span>
                        ยืนยันหน้าที่เรียบร้อย
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-text-tertiary mt-2">กรุณาเลือกหน้าที่การทำงานเพื่อมีส่วนร่วมกับกีฬาสี</p>
                        {currentUser.rejection_reason && (
                          <div className="mt-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-red-400 text-xs font-semibold">
                            ⚠️ คำขอสมัครหน้าที่ล่าสุดถูกปฏิเสธ: {currentUser.rejection_reason} (คุณสามารถเลือกหน้าที่อื่นใหม่ได้)
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <button onClick={() => setCurrentTab('apply')} className="bg-pink-primary hover:bg-pink-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/25 hover:shadow-lg hover:shadow-pink-primary/35 active:scale-95">
                    ไปสมัครหน้าที่
                  </button>
                </div>
              </Panel>
              <Panel title="กระดานข่าวล่าสุด">
                <div className="space-y-3">
                  {data.announcements.slice(0, 2).map((item: Announcement) => (
                    <div key={item.id} className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-4 hover:border-pink-primary/15 transition-all duration-300">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-white text-sm line-clamp-1">{item.title}</p>
                        <span className="text-[10px] text-text-tertiary whitespace-nowrap bg-carbon-light px-2 py-0.5 rounded-full">{item.date}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        )}

        {currentTab === 'apply' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">สมัครหน้าที่</h2>
              <p className="text-sm text-text-secondary">รวมสมัครสแตน นักกีฬา และตำแหน่งพิเศษไว้ในหน้าเดียว</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DutyCard
                title="สแตนเชียร์"
                description={data.standOpen ? 'ผู้ควบคุมเปิดรับสมัครแล้ว สมัครก่อนจึงจะเห็นตารางจองที่นั่ง' : 'ยังไม่เปิดรับสมัคร รอผู้ควบคุมเปิดระบบ'}
                count={standApplicants.filter((s: Student) => s.duty_status === 'approved').length}
                limit={180}
                disabled={!data.standOpen || (currentUser.assigned_duty !== 'none' && currentUser.assigned_duty !== 'stand')}
                active={currentUser.assigned_duty === 'stand'}
                onApply={() => applyDuty('stand')}
                onCancel={cancelOwnDuty}
              />
              <DutyCard
                title="นักกีฬา"
                description="สมัครคัดเลือกนักกีฬา เมื่อสมัครแล้วจะเห็น QR/ลิงก์กลุ่มติดตามข่าวสาร"
                count={data.students.filter((s: Student) => s.assigned_duty === 'athlete' && s.duty_status === 'approved').length}
                disabled={currentUser.assigned_duty !== 'none' && currentUser.assigned_duty !== 'athlete'}
                active={currentUser.assigned_duty === 'athlete'}
                onApply={() => applyDuty('athlete')}
                onCancel={cancelOwnDuty}
                qrCode={currentUser.assigned_duty === 'athlete' ? data.athleteQr.qrCode : ''}
                lineLink={currentUser.assigned_duty === 'athlete' ? data.athleteQr.lineLink : ''}
              />
              {data.specialDuties.map((item: SpecialDuty) => (
                <DutyCard
                  key={item.id}
                  title={item.title}
                  description={item.limit === 9999 ? 'รับสมัครไม่จำกัดจำนวนคน สมัครแล้วติดตามข่าวสารจาก QR/ลิงก์กลุ่ม' : `รับประมาณ ${item.limit} คน สมัครแล้วติดตามข่าวสารจาก QR/ลิงก์กลุ่ม`}
                  count={data.students.filter((s: Student) => s.assigned_duty === item.id && s.duty_status === 'approved').length}
                  limit={item.limit}
                  disabled={currentUser.assigned_duty !== 'none' && currentUser.assigned_duty !== item.id}
                  active={currentUser.assigned_duty === item.id}
                  onApply={() => applyDuty(item.id)}
                  onCancel={cancelOwnDuty}
                  qrCode={currentUser.assigned_duty === item.id ? item.qrCode : ''}
                  lineLink={currentUser.assigned_duty === item.id ? item.lineLink : ''}
                />
              ))}
            </div>

            {currentUser.assigned_duty === 'stand' && (
              <Panel title="ตารางจองที่นั่งสแตน">
                <p className="text-xs text-text-secondary mb-4">คุณสมัครสแตนแล้ว จึงสามารถเลือกที่นั่งได้</p>
                <SeatGrid currentUser={currentUser} isController={false} getSeatOwner={getSeatOwner} onSeatClick={handleSeatClick} />
              </Panel>
            )}
          </section>
        )}

        {currentTab === 'announcements' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">ประกาศสีชมพู</h2>
              <p className="text-sm text-text-secondary">สมาชิกอ่านได้ทุกคน ผู้ควบคุมเท่านั้นที่เพิ่มประกาศและแนบรูปได้</p>
            </div>

            {isController && (
              <Panel title="เพิ่มประกาศ">
                <form onSubmit={addAnnouncement} className="space-y-4">
                  <input
                    value={newAnnouncementTitle}
                    onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                    placeholder="หัวข้อประกาศ"
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                    required
                  />
                  <textarea
                    value={newAnnouncementContent}
                    onChange={(e) => setNewAnnouncementContent(e.target.value)}
                    placeholder="รายละเอียดประกาศ"
                    className="w-full min-h-28 bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-carbon-dark border border-pink-primary/10 rounded-lg px-3 py-2 text-xs cursor-pointer hover:border-pink-primary/50">
                      <ImageIcon size={16} /> แนบรูป
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) setNewAnnouncementImage(await fileToDataUrl(file));
                        }}
                      />
                    </label>
                    {newAnnouncementImage && (
                      <button type="button" onClick={() => setNewAnnouncementImage('')} className="text-xs text-red-400">
                        ลบรูป
                      </button>
                    )}
                    <button className="ml-auto bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      เพิ่มประกาศ
                    </button>
                  </div>
                  {newAnnouncementImage && <img src={newAnnouncementImage} alt="preview" className="max-h-64 rounded-xl border border-pink-primary/10 object-cover" />}
                </form>
              </Panel>
            )}

            <div className="space-y-4">
              {data.announcements.map((item: Announcement) => (
                <article key={item.id} className="bg-carbon-card border border-pink-primary/10 rounded-2xl overflow-hidden shadow">
                  {item.image && <img src={item.image} alt="" className="w-full max-h-[420px] object-cover bg-carbon-dark" />}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="font-bold text-lg text-white">{item.title}</h3>
                      <span className="text-[11px] text-text-tertiary">{item.date}</span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{item.content}</p>
                    <p className="text-xs text-pink-primary mt-3">โดย {item.createdBy}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'registry' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">รายชื่อทะเบียนการทำงานของสีชมพูทั้งหมด</h2>
                <p className="text-sm text-text-secondary">ค้นหา กรองหน้าที่ และดูจำนวนของแต่ละหน้าที่ได้ทันที</p>
              </div>

              {/* Sub-tabs: All Members vs Pending Requests (คำขออนุมัติ) */}
              <div className="flex bg-carbon-card border border-pink-primary/10 rounded-full p-1 w-max self-start md:self-auto">
                <button
                  onClick={() => setRegistryTab('all_members')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    registryTab === 'all_members'
                      ? 'bg-pink-primary text-white shadow-md shadow-pink-primary/20'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  สมาชิกทั้งหมด ({data.students.length} คน)
                </button>
                <button
                  onClick={() => setRegistryTab('requests')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    registryTab === 'requests'
                      ? 'bg-yellow-500 text-black font-bold shadow'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  📥 คำขออนุมัติ ({data.students.filter((s: Student) => s.duty_status === 'pending_selection' && s.assigned_duty !== 'none').length} คน)
                </button>
              </div>
            </div>

            {/* Separated Category filters (แยกตามหมวดหมู่หน้าที่) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'all', label: '🗂️ ทุกหมวดหมู่', count: data.students.length },
                { id: 'stand', label: '📣 สแตนเชียร์', count: data.students.filter((s: Student) => s.assigned_duty === 'stand').length },
                { id: 'athlete', label: '🏃 นักกีฬา', count: data.students.filter((s: Student) => s.assigned_duty === 'athlete').length },
                { id: 'special', label: '✨ หน้าที่พิเศษ', count: data.students.filter((s: Student) => s.assigned_duty !== 'none' && s.assigned_duty !== 'stand' && s.assigned_duty !== 'athlete').length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRegistryCategoryFilter(cat.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
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
                <select value={registryDuty} onChange={(e) => setRegistryDuty(e.target.value)} className="bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white">
                  <option value="all">ทุกหน้าที่ย่อย</option>
                  {dutyOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <select value={registryClassroom} onChange={(e) => setRegistryClassroom(e.target.value)} className="bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white">
                  <option value="all">ทุกห้อง</option>
                  {classrooms.map((classroom) => <option key={classroom} value={classroom}>{classroom}</option>)}
                </select>
              </div>
            </Panel>

            <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-4 overflow-x-auto shadow">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-pink-primary/10 text-text-secondary">
                    <th className="py-3 px-4 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 font-semibold">ห้อง</th>
                    <th className="py-3 px-4 font-semibold">หน้าที่</th>
                    <th className="py-3 px-4 font-semibold">สถานะ</th>
                    <th className="py-3 px-4 font-semibold">ที่นั่ง</th>
                    {isController && <th className="py-3 px-4 font-semibold text-right">จัดการ</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistry.map((student: Student) => (
                    <tr key={student.id} className="border-b border-pink-primary/5 hover:bg-carbon-light/20 transition-colors">
                      <td className="py-3 px-4 font-semibold">{student.fullname}<span className="block text-[11px] text-text-tertiary">{student.id}</span></td>
                      <td className="py-3 px-4 text-text-secondary">{student.classroom} เลขที่ {student.number}</td>
                      <td className="py-3 px-4 text-pink-primary font-semibold">
                        {isController && student.role !== 'admin_president' ? (
                          <select
                            value={student.assigned_duty}
                            onChange={(e) => {
                              const nextDuty = e.target.value;
                              const status = nextDuty === 'none' ? 'none' : 'approved';
                              updateStudent(
                                student.id,
                                { assigned_duty: nextDuty, duty_status: status, seat: nextDuty === 'none' ? undefined : student.seat },
                                currentUser || undefined,
                                `แต่งตั้งหน้าที่ "${dutyLabel(nextDuty)}"`
                              );
                            }}
                            className="bg-carbon-dark border border-pink-primary/20 text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-pink-primary text-text-primary cursor-pointer"
                          >
                            {dutyOptions.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          dutyLabel(student.assigned_duty)
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {student.duty_status === 'approved' && student.assigned_duty !== 'none' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-400">
                            ✓ {dutyLabel(student.assigned_duty)}
                          </span>
                        ) : student.duty_status === 'pending_selection' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 animate-pulse">
                            ⏳ รออนุมัติ: {dutyLabel(student.assigned_duty)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400">
                            ❌ ไม่มีหน้าที่
                          </span>
                        )}
                        {student.rejection_reason && (
                          <span className="block text-[10px] text-red-400 mt-1 font-medium">เหตุผลปฏิเสธ: {student.rejection_reason}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{student.seat || '-'}</td>
                      {isController && (
                        <td className="py-3 px-4 text-right space-x-2">
                          {student.duty_status === 'pending_selection' && (
                            <>
                              <button 
                                onClick={() => updateStudent(student.id, { duty_status: 'approved', rejection_reason: undefined }, currentUser || undefined, 'อนุมัติหน้าที่')} 
                                className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold mr-1.5"
                              >
                                อนุมัติ
                              </button>
                              <button 
                                onClick={() => {
                                  const reason = prompt(`กรุณาระบุเหตุผลการปฏิเสธหน้าที่ของ ${student.fullname}:`);
                                  if (reason === null) return; // cancel
                                  if (!reason.trim()) {
                                    alert('ต้องใส่เหตุผลการปฏิเสธด้วยครับ');
                                    return;
                                  }
                                  updateStudent(
                                    student.id, 
                                    { assigned_duty: 'none', duty_status: 'none', rejection_reason: reason.trim(), seat: undefined }, 
                                    currentUser || undefined, 
                                    `ปฏิเสธหน้าที่ (เหตุผล: ${reason.trim()})`
                                  );
                                }} 
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold"
                              >
                                ปฏิเสธ
                              </button>
                            </>
                          )}
                          {student.assigned_duty !== 'none' && student.role !== 'admin_president' && (
                            <button onClick={() => updateStudent(student.id, { assigned_duty: 'none', duty_status: 'none', seat: undefined, rejection_reason: undefined }, currentUser || undefined, 'รีเซ็ตหน้าที่')} className="text-red-400 hover:text-red-300 text-xs">
                              รีเซ็ต
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentTab === 'admin' && isController && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">แผงผู้ควบคุม</h2>
              <p className="text-sm text-text-secondary">เปิดปิดสแตน เพิ่มหน้าที่พิเศษ ตั้งค่า QR และจัดไลน์อัพนักกีฬา</p>
            </div>

            {/* Full-width Stand Booking Control */}
             <Panel title="เปิด/ปิดรับสมัครสแตน">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${data.standOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {data.standOpen ? 'กำลังเปิดรับสมัครสแตน' : 'ปิดรับสมัครสแตนอยู่'}
                    </p>
                    <span className="text-text-tertiary">|</span>
                    <p className={`font-bold ${data.standLocked ? 'text-yellow-500' : 'text-text-secondary'}`}>
                      {data.standLocked ? '🔒 ล็อกการเปลี่ยนแปลงที่นั่งแล้ว' : '🔓 เปิดอิสระในการจอง/ยกเลิก'}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    หากสั่งล็อก สมาชิกที่มีรายชื่อบนสแตนแล้วจะไม่สามารถกดยกเลิกที่นั่งหรือถอนตัวได้เพื่อป้องกันความวุ่นวาย
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => saveSystemConfig({ standOpen: !data.standOpen }, currentUser || undefined, data.standOpen ? 'ปิดรับสมัครสแตน' : 'เปิดรับสมัครสแตน')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${data.standOpen ? 'bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20' : 'bg-green-500/10 hover:bg-green-500 hover:text-white text-green-400 border border-green-500/20'}`}
                  >
                    {data.standOpen ? 'ปิดรับสมัครสแตน' : 'เปิดรับสมัครสแตน'}
                  </button>
                  <button
                    onClick={() => saveSystemConfig({ standLocked: !data.standLocked }, currentUser || undefined, data.standLocked ? 'ปลดล็อกการถอนตัวสแตน' : 'ล็อกการถอนตัวสแตน')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${data.standLocked ? 'bg-yellow-500 text-black font-bold' : 'bg-carbon-light border border-pink-primary/20 text-white hover:bg-pink-primary/25'}`}
                  >
                    {data.standLocked ? '🔓 ปลดล็อกที่นั่ง' : '🔒 ล็อกที่นั่งทั้งหมด'}
                  </button>
                </div>
              </div>
              <div className="mt-5 border-t border-pink-primary/10 pt-4">
                <SeatGrid currentUser={currentUser || { id: 'dummy', fullname: 'ระบบ', classroom: 'ม.5', role: 'student_m5', assigned_duty: 'none', duty_status: 'none' }} isController getSeatOwner={getSeatOwner} onSeatClick={handleSeatClick} />
              </div>
            </Panel>

            {/* Merged Special Duties & Athlete QR Code Settings */}
            <Panel title="ตั้งค่าตำแหน่งหน้าที่ & QR กลุ่มไลน์">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                
                {/* Special Duties Management Area */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-pink-primary/10 pb-2">
                    <h3 className="text-sm font-bold text-pink-accent">จัดการตำแหน่งหน้าที่พิเศษ</h3>
                    <button 
                      onClick={() => setShowDutyModal(true)} 
                      className="bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/20 active:scale-95"
                    >
                      <Plus size={14} /> เพิ่มหน้าที่พิเศษใหม่
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {data.specialDuties.map((item: SpecialDuty) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 bg-carbon-dark border border-pink-primary/5 rounded-xl p-3">
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-text-secondary">{item.limit === 9999 ? 'รับไม่จำกัด' : `รับ ${item.limit} คน`} · สมัครแล้ว {data.students.filter((s: Student) => s.assigned_duty === item.id).length} คน</p>
                        </div>
                        <button onClick={() => removeSpecialDuty(item.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Athlete QR Configuration Area */}
                <div className="bg-carbon-dark/50 border border-pink-primary/10 rounded-2xl p-5 space-y-4 h-max">
                  <h3 className="text-sm font-bold text-pink-accent border-b border-pink-primary/10 pb-2">ตั้งค่าช่องทางการติดต่อกลุ่มนักกีฬา</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">ลิงก์กลุ่มไลน์นักกีฬา</label>
                      <input value={newAthleteLineLink} onChange={(e) => setNewAthleteLineLink(e.target.value)} placeholder="ลิงก์ Line group นักกีฬา" className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">อัปโหลดรูปภาพ QR Code</label>
                      <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                        <ImageIcon size={16} className="text-pink-primary" /> เลือกรูป QR Code
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) setNewAthleteQr(await fileToDataUrl(file));
                        }} />
                      </label>
                    </div>
                    {newAthleteQr && (
                      <div className="relative mx-auto w-max">
                        <img src={newAthleteQr} alt="QR กลุ่มนักกีฬา" className="max-h-32 rounded-lg border border-pink-primary/10" />
                        <button onClick={() => setNewAthleteQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                      </div>
                    )}
                    <button onClick={saveAthleteQr} className="w-full bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                      บันทึก QR & ลิงก์นักกีฬา
                    </button>
                  </div>
                </div>

              </div>
            </Panel>

            {/* Sports Event Panel */}
            <Panel title="รายการแข่งขันกีฬา">
              <div className="flex justify-between items-center mb-5">
                <p className="text-xs text-text-secondary">จัดการและเพิ่มรายการแข่งขันกีฬาหรือกรีฑาลงระบบทะเบียน</p>
                <button 
                  onClick={() => setShowSportsModal(true)} 
                  className="bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/20 active:scale-95"
                >
                  <Plus size={14} /> เพิ่มรายการกีฬาใหม่
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.sports.map((event: SportsEvent) => {
                  const eligibleAthletes = data.students.filter((st: Student) => st.assigned_duty === 'athlete');
                  return (
                    <div key={event.id} className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                      <div className="flex items-center justify-between gap-3 border-b border-pink-primary/5 pb-2">
                        <h3 className="font-bold text-white text-sm sm:text-base">{event.name} ({event.category})</h3>
                        <button 
                          onClick={() => {
                            if (confirm(`ต้องการลบรายการแข่งขัน "${event.name}" ใช่หรือไม่? นักกีฬาในรายการนี้จะหลุดจากตาราง`)) {
                              removeSportsEvent(event.id, currentUser || undefined);
                            }
                          }} 
                          className="text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
                          title="ลบรายการแข่งขัน"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {event.lineup.length === 0 ? (
                          <p className="text-xs text-text-tertiary italic">ยังไม่จัดรายชื่อนักกีฬา</p>
                        ) : (
                          event.lineup.map((athleteId) => {
                            const athlete = data.students.find((s: Student) => s.id === athleteId);
                            if (!athlete) return null;
                            return (
                              <div key={athleteId} className="flex items-center justify-between text-xs bg-carbon-card p-2 rounded border border-pink-primary/5">
                                <span>{athlete.fullname} ({athlete.classroom})</span>
                                <button onClick={() => removeAthleteFromEvent(event.id, athleteId, currentUser || undefined)} className="text-red-400 hover:text-red-300 transition-colors"><X size={14} /></button>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <select onChange={(e) => {
                        if (e.target.value) {
                          assignAthleteToEvent(event.id, e.target.value, currentUser || undefined);
                          e.currentTarget.value = '';
                        }
                      }} className="w-full bg-carbon-card border border-pink-primary/10 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-pink-primary text-text-secondary cursor-pointer">
                        <option value="">-- ดึงชื่อผู้สมัครนักกีฬาลงตาราง --</option>
                        {eligibleAthletes.map((athlete: Student) => (
                          <option key={athlete.id} value={athlete.id}>{athlete.fullname} ({athlete.classroom} เลขที่ {athlete.number})</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Controller Action Log History Panel */}
            <Panel title="📝 ประวัติการบันทึกข้อมูลการทำงาน (Log History)">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs sm:text-sm">
                {data.logs.length === 0 ? (
                  <p className="text-text-tertiary text-center italic py-4">ยังไม่มีประวัติการบันทึกกิจกรรมในระบบ</p>
                ) : (
                  data.logs.map((log) => (
                    <div key={log.id} className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3 hover:border-pink-primary/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-2">
                        <span className="bg-pink-primary/10 text-pink-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                          {log.actorRole}
                        </span>
                        <span className="font-bold text-white">{log.actorName}</span>
                        <span className="text-text-secondary">{log.action}</span>
                        {log.targetName && (
                          <span className="text-pink-primary font-medium">({log.targetName})</span>
                        )}
                      </div>
                      <span className="text-text-tertiary text-[10px] sm:text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            {/* Popup Add Sport Modal */}
            {showSportsModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
                  <button 
                    onClick={() => {
                      setShowSportsModal(false);
                      setNewEventName('');
                    }} 
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-4">เพิ่มรายการแข่งขันกีฬาใหม่</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ชื่อรายการแข่งขัน</label>
                      <input 
                        value={newEventName} 
                        onChange={(e) => setNewEventName(e.target.value)} 
                        placeholder="เช่น วิ่ง 100 เมตร, ฟุตบอล, บาสเกตบอล" 
                        className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ประเภทการแข่งขัน</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['ลู่', 'ลาน', 'ทั่วไป'].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setNewEventSubcategory(sub)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                              newEventSubcategory === sub
                                ? 'bg-pink-primary/25 border-pink-primary text-pink-accent'
                                : 'bg-carbon-dark border-pink-primary/10 text-text-secondary hover:text-white'
                            }`}
                          >
                            {sub === 'ทั่วไป' ? 'ทั่วไป (ไม่ใช่กรีฑา)' : `กรีฑาประเภท${sub}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">เพศ</label>
                        <select
                          value={newEventGender}
                          onChange={(e) => setNewEventGender(e.target.value)}
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer"
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="ผสม">ผสม (Co-ed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">จำนวนผู้เล่น (คน)</label>
                        <input
                          type="number"
                          min="1"
                          value={newEventLimit}
                          onChange={(e) => setNewEventLimit(e.target.value)}
                          placeholder="เช่น 1 หรือ 11"
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setShowSportsModal(false);
                          setNewEventName('');
                        }} 
                        className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={() => {
                          if (!newEventName.trim()) return;
                          
                          // สร้างชื่อรายการกีฬาแบบอัตโนมัติ: "ชื่อการแข่งขัน เพศ (จำนวนคน) [ถ้ามี ลู่/ลาน]"
                          // เช่น: วิ่ง 100 เมตร ชาย (1 คน) (ประเภทลู่)
                          let formattedName = `${newEventName.trim()} ${newEventGender}`;
                          if (newEventLimit && parseInt(newEventLimit) > 0) {
                            formattedName += ` (${newEventLimit} คน)`;
                          }
                          if (newEventSubcategory !== 'ทั่วไป') {
                            formattedName += ` (ประเภท${newEventSubcategory})`;
                          }

                          // กำหนด category อัตโนมัติเป็น กรีฑา ถ้าเป็นประเภทลู่/ลาน นอกนั้นให้เป็นชื่อหลัก/ทั่วไป
                          const finalCategory = newEventSubcategory === 'ทั่วไป' ? 'กีฬา' : 'กรีฑา';

                          addSportsEvent(formattedName, finalCategory, currentUser || undefined);
                          setNewEventName('');
                          setNewEventLimit('1');
                          setShowSportsModal(false);
                        }} 
                        className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                      >
                        เพิ่มรายการกีฬา
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popup Add Special Duty Modal */}
            {showDutyModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
                  <button 
                    onClick={() => {
                      setShowDutyModal(false);
                      setNewDutyTitle('');
                      setNewDutyLimit('10');
                      setNewDutyLineLink('');
                      setNewDutyQr('');
                    }} 
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-4">เพิ่มตำแหน่งหน้าที่พิเศษใหม่</h3>
                  <form onSubmit={addSpecialDuty} className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ชื่อตำแหน่งหน้าที่</label>
                      <input 
                        value={newDutyTitle} 
                        onChange={(e) => setNewDutyTitle(e.target.value)} 
                        placeholder="เช่น ฝ่ายฉาก, สตาฟคุมสแตน" 
                        className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">จำนวนรับสมัคร (คน)</label>
                        <input 
                          type="number" 
                          value={newDutyLimit} 
                          onChange={(e) => setNewDutyLimit(e.target.value)} 
                          placeholder="เช่น 10" 
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">ลิงก์กลุ่มไลน์</label>
                        <input 
                          value={newDutyLineLink} 
                          onChange={(e) => setNewDutyLineLink(e.target.value)} 
                          placeholder="ลิงก์กลุ่มข่าวสาร" 
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">รูปภาพ QR Code กลุ่ม</label>
                      <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                        <ImageIcon size={16} className="text-pink-primary" /> {newDutyQr ? 'เปลี่ยนรูป QR Code' : 'อัปโหลดรูปภาพ QR Code'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) setNewDutyQr(await fileToDataUrl(file));
                          }} 
                        />
                      </label>
                    </div>

                    {newDutyQr && (
                      <div className="relative mx-auto w-max">
                        <img src={newDutyQr} alt="QR หน้าที่ใหม่" className="max-h-32 rounded-lg border border-pink-primary/10" />
                        <button type="button" onClick={() => setNewDutyQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowDutyModal(false);
                          setNewDutyTitle('');
                          setNewDutyLimit('10');
                          setNewDutyLineLink('');
                          setNewDutyQr('');
                        }} 
                        className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="submit"
                        onClick={(e) => {
                          addSpecialDuty(e);
                          setShowDutyModal(false);
                        }}
                        className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                      >
                        เพิ่มตำแหน่งหน้าที่
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-5 shadow">
      <h2 className="text-lg font-bold text-pink-primary mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-carbon-card border border-pink-primary/10 rounded-xl flex items-center gap-3 shadow">
      <div className="w-10 h-10 rounded-lg bg-pink-primary/10 flex items-center justify-center text-pink-primary">{icon}</div>
      <div>
        <span className="block text-xl font-bold text-text-primary">{value}</span>
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
    </div>
  );
}

function MiniCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-carbon-card border border-pink-primary/10 rounded-xl p-3">
      <p className="text-lg font-bold text-white">{count}</p>
      <p className="text-[11px] text-text-secondary truncate">{label}</p>
    </div>
  );
}

function DutyCard({
  title,
  description,
  count,
  limit,
  disabled,
  active,
  onApply,
  onCancel,
  qrCode,
  lineLink,
}: {
  title: string;
  description: string;
  count: number;
  limit?: number;
  disabled: boolean;
  active: boolean;
  onApply: () => void;
  onCancel: () => void;
  qrCode?: string;
  lineLink?: string;
}) {
  return (
    <div className={`bg-carbon-card border rounded-2xl p-5 shadow space-y-4 ${active ? 'border-pink-primary/60' : 'border-pink-primary/10'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        </div>
        <span className="text-xs text-pink-primary bg-pink-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
          {limit ? (limit === 9999 ? `${count} คน` : `${count}/${limit} คน`) : `${count} คน`}
        </span>
      </div>
      {active ? (
        <div className="space-y-3">
          <div className="text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20 text-sm font-semibold">
            คุณสมัครหน้าที่นี้แล้ว
          </div>
          {(qrCode || lineLink) && (
            <div className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-3 space-y-2">
              {qrCode && <img src={qrCode} alt={`QR ${title}`} className="max-h-44 rounded-lg mx-auto border border-pink-primary/10" />}
              {lineLink && <a href={lineLink} target="_blank" rel="noreferrer" className="block text-center text-sm text-pink-primary hover:text-pink-accent font-semibold">เข้ากลุ่มติดตามข่าวสาร</a>}
            </div>
          )}
          <button onClick={onCancel} className="w-full bg-carbon-light hover:bg-carbon-dark text-red-400 border border-red-500/20 py-2 rounded-lg text-sm font-semibold">
            ยกเลิกใบสมัคร
          </button>
        </div>
      ) : (
        <button
          onClick={onApply}
          disabled={disabled}
          className="w-full bg-pink-primary hover:bg-pink-accent disabled:bg-carbon-light disabled:text-text-tertiary disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          สมัครหน้าที่นี้
        </button>
      )}
    </div>
  );
}

function SeatGrid({
  currentUser,
  isController,
  getSeatOwner,
  onSeatClick,
}: {
  currentUser: Student;
  isController: boolean;
  getSeatOwner: (seatLabel: string) => Student | undefined;
  onSeatClick: (row: string, colNum: number) => void;
}) {
  return (
    <div className="w-full select-none overflow-x-hidden py-2">
      <div className="w-full space-y-1 sm:space-y-1.5 md:space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1 sm:gap-1.5">
            {/* Row Label */}
            <div className="w-6 sm:w-8 font-bold text-center text-text-secondary text-xs sm:text-sm">{row}</div>
            
            {/* Seat Columns */}
            <div className="flex flex-1 justify-between gap-0.5 sm:gap-1">
              {columns.map((col) => {
                const label = `${row}${col}`;
                const owner = getSeatOwner(label);
                const isMySeat = owner?.id === currentUser.id;
                return (
                  <button
                    key={label}
                    onClick={() => onSeatClick(row, col)}
                    className={`flex-1 aspect-square rounded-[3px] text-[7px] sm:text-[9px] md:text-[10px] font-semibold sm:font-bold transition-all border flex items-center justify-center p-0 ${
                      owner
                        ? isMySeat
                          ? 'bg-green-500 text-white border-green-400 shadow shadow-green-500/20'
                          : 'bg-pink-primary text-white border-pink-accent'
                        : 'bg-carbon-light hover:bg-pink-primary/20 text-text-secondary hover:text-pink-primary border-pink-primary/10 hover:border-pink-primary/50'
                    }`}
                    title={owner ? `${label}: ${owner.fullname} (${owner.classroom})` : `${label}: ว่าง`}
                    style={{ minWidth: '0' }}
                  >
                    {owner ? (isMySeat ? 'คุณ' : owner.classroom.split('/')[1] || label) : label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {isController && <p className="text-xs text-text-tertiary text-center pt-2">ผู้ควบคุมคลิกที่นั่งที่ถูกจองเพื่อยกเลิกได้</p>}
        
        {/* Stage Indicator showing Row A is the frontmost */}
        <div className="mt-4 pt-3 border-t border-pink-primary/5 text-center flex flex-col items-center justify-center gap-1">
          <div className="px-6 py-1.5 bg-pink-primary/10 border border-pink-primary/20 rounded-full text-[10px] sm:text-xs font-bold text-pink-accent tracking-wider uppercase">
            ▲ แถว A อยู่ข้างหน้าสุด (ติดสนาม/STAGE) | แถว J อยู่ข้างหลังสุด ▲
          </div>
        </div>
      </div>
    </div>
  );
}

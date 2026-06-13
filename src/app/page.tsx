'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, CheckCircle, AlertTriangle, Grid, Trophy, Sparkles, LogOut, X, Plus, ShieldAlert, Award
} from 'lucide-react';
import { 
  getStoredData, 
  subscribe, 
  updateStudent, 
  bookSeat, 
  releaseSeat, 
  addSportsEvent, 
  assignAthleteToEvent, 
  removeAthleteFromEvent 
} from './store';
import { Student, SportsEvent, Duty } from './mockData';

export default function Home() {
  const [data, setData] = useState(() => getStoredData());
  
  // Authenticated user state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = currentUserId
    ? data.students.find((s: Student) => s.id === currentUserId) ?? null
    : null;
  
  // Login flow states
  const [loginTab, setLoginTab] = useState<'member' | 'staff'>('member');
  
  // Member login inputs
  const [loginClassroom, setLoginClassroom] = useState('ม.1/1');
  const [loginNumber, setLoginNumber] = useState('');
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Staff login inputs
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState('');

  // Tabs for logged in view: 'dashboard' | 'stand' | 'sports' | 'special' | 'admin'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'stand' | 'sports' | 'special' | 'admin'>('dashboard');

  // Input states
  const [standClassroomFilter, setStandClassroomFilter] = useState<string>('all');
  const standZoneLimit: { [classroom: string]: string } = {
    'ม.1/1': 'A-D',
    'ม.1/2': 'A-D',
    'ม.1/3': 'E-G',
    'ม.2/3': 'E-G',
    'ม.3/1': 'H-J',
  };

  // Sports control states
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('กรีฑา');

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setData(getStoredData());
    });
    return unsubscribe;
  }, []);

  // Auto-find matching name when classroom and number match to present a friendly preview
  const detectedStudent = data.students.find(
    (s: Student) => s.classroom === loginClassroom && s.number === loginNumber
  );

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginNumber || !loginStudentId) {
      setLoginError('กรุณากรอกเลขที่และเลขประจำตัวนักเรียนให้ครบถ้วน');
      return;
    }

    const student = data.students.find(
      (s: Student) => 
        s.classroom === loginClassroom && 
        s.number === loginNumber && 
        s.id === loginStudentId
    );

    if (student) {
      setCurrentUserId(student.id);
      setCurrentTab('dashboard');
    } else {
      setLoginError('ไม่พบข้อมูลนักเรียน หรือเลขประจำตัวไม่ถูกต้อง (กรุณาตรวจสอบเลขที่/เลขประจำตัว)');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');

    // Admin/Staff Simulation verification
    // admin credentials -> username: admin, password: 123
    // staff (M5) credentials -> username: staff, password: 123
    if (staffUsername === 'admin' && staffPassword === '123') {
      const adminUser = data.students.find((s: Student) => s.role === 'admin_president');
      if (adminUser) {
        setCurrentUserId(adminUser.id);
        setCurrentTab('dashboard');
      }
    } else if (staffUsername === 'staff' && staffPassword === '123') {
      const staffUser = data.students.find((s: Student) => s.role === 'staff_m5');
      if (staffUser) {
        setCurrentUserId(staffUser.id);
        setCurrentTab('dashboard');
      }
    } else {
      setStaffError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (ลอง admin/123 หรือ staff/123)');
    }
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

  // Stand seats calculations
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const columns = Array.from({ length: 18 }, (_, i) => i + 1);

  // Check seat assignment rules
  const getSeatOwner = (seatLabel: string) => {
    return data.students.find((s: Student) => s.seat === seatLabel);
  };

  const isRowAllowedForClass = (row: string, classroom: string) => {
    const range = standZoneLimit[classroom];
    if (!range) return true; // default unrestricted
    const [start, end] = range.split('-');
    return row.charCodeAt(0) >= start.charCodeAt(0) && row.charCodeAt(0) <= end.charCodeAt(0);
  };

  const handleSeatClick = (row: string, colNum: number) => {
    if (!currentUser) return;
    const seatLabel = `${row}${colNum}`;
    const owner = getSeatOwner(seatLabel);

    if (currentUser.role === 'admin_president') {
      if (owner) {
        if (confirm(`ต้องการยกเลิกการจองของ ${owner.fullname} ใช่หรือไม่?`)) {
          releaseSeat(seatLabel);
        }
      } else {
        alert('กรุณาเข้าโหมดจำลองบัญชีผู้ใช้ หรือให้น้องคนนั้นล็อกอินเพื่อเลือกจองที่นั่งด้วยตัวเอง');
      }
    } else {
      // Normal Student
      if (owner) {
        if (owner.id === currentUser.id) {
          if (confirm('ต้องการยกเลิกการจองที่นั่งของคุณใช่หรือไม่?')) {
            releaseSeat(seatLabel);
          }
        } else {
          alert(`ที่นั่งนี้ถูกจองแล้วโดย ${owner.fullname} (${owner.classroom})`);
        }
      } else {
        // Apply zone rules
        if (!isRowAllowedForClass(row, currentUser.classroom)) {
          alert(`ห้องของคุณ (${currentUser.classroom}) ได้รับอนุญาตให้จองเฉพาะโซนแถว ${standZoneLimit[currentUser.classroom]} เท่านั้น`);
          return;
        }
        
        // Confirm reservation
        if (confirm(`คุณต้องการจองที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
          bookSeat(currentUser.id, seatLabel);
        }
      }
    }
  };

  // Duty Translate mapping
  const dutyLabel = (d: Duty) => {
    switch(d) {
      case 'none': return 'ไม่มีหน้าที่ (ว่างงาน)';
      case 'stand': return 'สแตนเชียร์';
      case 'athlete': return 'นักกีฬา (รอการจัดรายการแข่ง)';
      case 'procession': return 'เดินขบวนพาเหรด';
      case 'cheerleader': return 'หลีดเดอร์';
      case 'staff': return 'พี่คุมงาน / สตาฟ';
      case 'drummer': return 'ดรัมเมเยอร์';
      case 'band': return 'ดุริยางค์/ดนตรี';
      case 'drum': return 'มือตีกลอง';
    }
  };

  // Login Screen
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-primary to-pink-accent" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-primary/20">
              <Award size={36} className="text-pink-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">คณะสีชมพู (ปทุมชาติ)</h2>
            <p className="text-xs text-text-secondary">ระบบจัดการหน้าที่และสมัครกิจกรรมกีฬาสี โรงเรียนนารีรัตน์จังหวัดแพร่</p>
          </div>

          {/* Login Type Selection */}
          <div className="flex bg-carbon-dark border border-pink-primary/10 rounded-full p-1.5 mb-6">
            <button 
              onClick={() => setLoginTab('member')}
              className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginTab === 'member' ? 'bg-pink-primary text-white shadow' : 'text-text-secondary hover:text-white'}`}
            >
              <User size={16} /> น้องและพี่สมาชิกสี
            </button>
            <button 
              onClick={() => setLoginTab('staff')}
              className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginTab === 'staff' ? 'bg-pink-primary text-white shadow' : 'text-text-secondary hover:text-white'}`}
            >
              <ShieldAlert size={16} /> ผู้ควบคุมงานสี
            </button>
          </div>

          {/* Member Login Flow */}
          {loginTab === 'member' && (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">เลือกห้องเรียน (Classroom)</label>
                <select 
                  value={loginClassroom}
                  onChange={(e) => {
                    setLoginClassroom(e.target.value);
                    setLoginNumber('');
                  }}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                >
                  <option value="ม.1/1">ม.1/1</option>
                  <option value="ม.1/2">ม.1/2</option>
                  <option value="ม.1/3">ม.1/3</option>
                  <option value="ม.2/3">ม.2/3</option>
                  <option value="ม.3/1">ม.3/1</option>
                  <option value="ม.4/1">ม.4/1</option>
                  <option value="ม.4/2">ม.4/2</option>
                  <option value="ม.5/1">ม.5/1</option>
                  <option value="ม.5/2">ม.5/2</option>
                  <option value="ม.5/3">ม.5/3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">เลขที่ (No.)</label>
                  <input 
                    type="number"
                    placeholder="เช่น 15"
                    value={loginNumber}
                    onChange={(e) => setLoginNumber(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">รหัสประจำตัว 5 หลัก</label>
                  <input 
                    type="password"
                    placeholder="เช่น 10002"
                    value={loginStudentId}
                    onChange={(e) => setLoginStudentId(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                    required
                  />
                </div>
              </div>

              {/* Detected Student Helper Preview */}
              {detectedStudent && (
                <div className="p-3 bg-pink-primary/5 border border-pink-primary/25 rounded-xl text-xs text-pink-accent flex items-center justify-between">
                  <span>ยินดีต้อนรับน้อง: <strong>{detectedStudent.fullname}</strong></span>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold">พบข้อมูลในระบบ</span>
                </div>
              )}

              {loginError && (
                <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
                  {loginError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10 mt-2 flex items-center justify-center gap-2"
              >
                เข้าสู่ระบบสมาชิก
              </button>

              <div className="p-3 bg-carbon-dark border border-pink-primary/5 rounded-xl text-[11px] text-text-tertiary text-center leading-relaxed">
                คำแนะนำในการเข้าทดสอบ: ลองเลือก <strong>ม.1/2 เลขที่ 15</strong> รหัสประจำตัวคือ <strong>10002</strong> หรือเลือกดูรหัสผ่านจากรายชื่อจำลอง
              </div>
            </form>
          )}

          {/* Staff Login Flow */}
          {loginTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">ชื่อผู้ใช้งานผู้ควบคุม (Username)</label>
                <input 
                  type="text" 
                  placeholder="กรอก 'admin' หรือ 'staff'"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">รหัสผ่าน (Password)</label>
                <input 
                  type="password" 
                  placeholder="กรอก '123'"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                  required
                />
              </div>

              {staffError && (
                <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
                  {staffError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10 mt-2"
              >
                เข้าสู่ระบบประธาน/ควบคุม
              </button>

              <div className="p-3 bg-carbon-dark border border-pink-primary/5 rounded-xl text-[11px] text-text-tertiary text-center leading-relaxed">
                คำแนะนำล็อกอิน: สิทธิ์ประธานสี (admin) รหัสผ่าน <strong>123</strong> / สิทธิ์พี่สตาฟ ม.5 (staff) รหัสผ่าน <strong>123</strong>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  // Stand seats calculations
  const isNormalStudent = currentUser.role !== 'admin_president' && currentUser.role !== 'staff_m5';

  return (
    <main className="min-h-screen bg-carbon-dark text-text-primary">
      {/* Navbar matching user style */}
      <header className="sticky top-0 z-50 glass-nav px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-primary flex items-center justify-center font-bold text-white text-lg tracking-wider shadow shadow-pink-primary/45">P</div>
          <span className="font-semibold text-lg tracking-widest text-white">PINK<span className="text-pink-primary">69</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'dashboard' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
          >
            แผงควบคุม
          </button>
          <button 
            onClick={() => setCurrentTab('stand')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'stand' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
          >
            จองสแตน
          </button>
          <button 
            onClick={() => setCurrentTab('sports')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'sports' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
          >
            สมัครนักกีฬา
          </button>
          <button 
            onClick={() => setCurrentTab('special')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'special' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
          >
            สมัครตำแหน่งพิเศษ
          </button>
          {!isNormalStudent && (
            <button 
              onClick={() => setCurrentTab('admin')} 
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currentTab === 'admin' ? 'bg-pink-primary text-white' : 'text-text-secondary hover:text-white hover:bg-carbon-light'}`}
            >
              แผงประธานสี (สตาฟ)
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-carbon-card border border-pink-primary/20 px-3 py-1.5 rounded-lg text-sm shadow">
            <User size={16} className="text-pink-primary animate-pulse" />
            <span className="font-semibold text-text-primary text-xs md:text-sm">{currentUser.fullname}</span>
            <span className="text-[10px] text-pink-primary bg-pink-primary/15 px-2 py-0.5 rounded uppercase font-semibold">
              {currentUser.classroom} {currentUser.number ? `เลขที่ ${currentUser.number}` : ''}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Greeting Hero */}
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-pink-dark to-carbon-card border border-pink-primary/20 shadow-lg">
              <div className="absolute right-0 top-0 w-64 h-64 bg-pink-primary/10 blur-3xl rounded-full" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white">ยินดีต้อนรับสู่ระบบงานกีฬาสี</h1>
              <p className="text-text-secondary max-w-2xl text-xs md:text-sm">
                โครงการจัดการหน้าที่และตำแหน่งของนักเรียน สีชมพู โรงเรียนนารีรัตน์จังหวัดแพร่ เพื่อป้องกันการตกหล่นของนักเรียนทุกคน
              </p>

              {/* Duty Checker Card */}
              <div className="mt-8 p-6 glass-panel rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-1">สถานะหน้าที่ปัจจุบันของคุณ</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-2xl font-bold ${currentUser.assigned_duty === 'none' ? 'text-yellow-500' : 'text-pink-primary'}`}>
                      {dutyLabel(currentUser.assigned_duty)}
                    </span>
                    {currentUser.seat && (
                      <span className="bg-pink-primary/25 border border-pink-primary/40 text-pink-primary text-sm px-2.5 py-0.5 rounded-full font-bold">
                        ที่นั่ง {currentUser.seat}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    {currentUser.assigned_duty === 'none' 
                      ? 'คำเตือน: คุณยังไม่มีหน้าที่ในระบบ กรุณาเลือกจองสแตน สมัครกีฬา หรือสมัครตำแหน่งพิเศษ'
                      : 'ระบบบันทึกหน้าที่ของคุณแล้ว'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {currentUser.assigned_duty === 'none' ? (
                    <>
                      <button 
                        onClick={() => setCurrentTab('stand')}
                        className="bg-pink-primary hover:bg-pink-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                      >
                        ไปเลือกจองที่นั่งสแตน
                      </button>
                      <button 
                        onClick={() => setCurrentTab('special')}
                        className="bg-carbon-light hover:bg-carbon-card text-text-primary border border-pink-primary/10 hover:border-pink-primary/50 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      >
                        ไปสมัครตำแหน่งพิเศษ
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20 text-sm font-semibold">
                      <CheckCircle size={16} /> ลงทะเบียนหน้าที่เรียบร้อย
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Statistics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-xl flex items-center gap-4 shadow">
                <div className="w-12 h-12 rounded-lg bg-pink-primary/10 flex items-center justify-center text-pink-primary">
                  <Grid size={24} />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-text-primary">
                    {data.students.filter((s: Student) => s.assigned_duty === 'stand').length} / 180
                  </span>
                  <span className="text-xs text-text-secondary">ที่นั่งสแตนที่ถูกจอง</span>
                </div>
              </div>

              <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-xl flex items-center gap-4 shadow">
                <div className="w-12 h-12 rounded-lg bg-pink-primary/10 flex items-center justify-center text-pink-primary">
                  <Trophy size={24} />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-text-primary">
                    {data.students.filter((s: Student) => s.assigned_duty === 'athlete').length}
                  </span>
                  <span className="text-xs text-text-secondary">ผู้สมัครนักกีฬา</span>
                </div>
              </div>

              <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-xl flex items-center gap-4 shadow">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-yellow-500">
                    {data.students.filter((s: Student) => s.assigned_duty === 'none').length} คน
                  </span>
                  <span className="text-xs text-text-secondary">ยังว่างงาน (ต้องจัดต่อ)</span>
                </div>
              </div>
            </div>

            {/* Quick Walkthrough Guidance */}
            <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4 text-pink-primary flex items-center gap-2">
                <Sparkles size={18} /> แนวทางการจัดหน้าที่ของสมาชิกสี
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm">
                <div className="p-4 bg-carbon-dark rounded-lg border border-pink-primary/5">
                  <span className="font-bold text-pink-primary block mb-2">ม.1 - ม.3 (น้องเล็ก)</span>
                  <p className="text-text-secondary">เลือกจองที่นั่งสแตนและสมัครกิจกรรมที่สนใจ เพื่อให้มีหน้าที่ชัดเจน</p>
                </div>
                <div className="p-4 bg-carbon-dark rounded-lg border border-pink-primary/5">
                  <span className="font-bold text-pink-primary block mb-2">ม.4 (ฝ่ายขบวน)</span>
                  <p className="text-text-secondary">ช่วยงานขบวนและสมัครตำแหน่งพิเศษตามความถนัด</p>
                </div>
                <div className="p-4 bg-carbon-dark rounded-lg border border-pink-primary/5">
                  <span className="font-bold text-pink-primary block mb-2">ม.5 (พี่สตาฟ)</span>
                  <p className="text-text-secondary">ดูแลระบบจองสแตน คัดเลือกนักกีฬา และติดตามรายชื่อผู้ตกหล่น</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stand Booking Tab */}
        {currentTab === 'stand' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">ระบบจองที่นั่งสแตนเชียร์</h2>
                <p className="text-sm text-text-secondary">
                  แผนผังที่นั่งรวม 180 ที่นั่ง (แถวละ 18 ที่นั่ง x 10 แถว A ถึง J)
                </p>
              </div>

              {/* Classroom filter logic */}
              <div className="flex items-center gap-2 text-sm">
                <span>กรองตามห้อง: </span>
                <select 
                  value={standClassroomFilter}
                  onChange={(e) => setStandClassroomFilter(e.target.value)}
                  className="bg-carbon-card border border-pink-primary/10 text-text-primary px-3 py-1.5 rounded-lg focus:outline-none focus:border-pink-primary"
                >
                  <option value="all">ทุกห้อง</option>
                  <option value="ม.1/1">ม.1/1</option>
                  <option value="ม.1/2">ม.1/2</option>
                  <option value="ม.1/3">ม.1/3</option>
                  <option value="ม.2/3">ม.2/3</option>
                  <option value="ม.3/1">ม.3/1</option>
                </select>
              </div>
            </div>

            {/* Instruction banner based on zone rules */}
            <div className="p-4 rounded-xl bg-pink-primary/10 border border-pink-primary/30 text-sm flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-pink-primary block">เงื่อนไขการจองที่นั่ง:</span>
                <span className="text-text-secondary text-xs">
                  {!isNormalStudent 
                    ? 'โหมดผู้ควบคุม: สามารถตรวจสอบและยกเลิกที่นั่งได้ (ต้องให้น้องล็อกอินเองเพื่อจอง)'
                    : `ห้อง ${currentUser.classroom} จองได้เฉพาะแถว ${standZoneLimit[currentUser.classroom] || 'A-J'} เท่านั้น`}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-carbon-light border border-pink-primary/10 block" /> ว่าง</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-pink-primary block" /> ถูกจอง</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-green-500 block" /> ที่นั่งของคุณ</span>
              </div>
            </div>

            {/* The Seat Grid */}
            <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-2xl overflow-x-auto shadow-2xl">
              <div className="min-w-[760px] space-y-2.5">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-2">
                    {/* Row Label */}
                    <div className="w-8 font-bold text-center text-text-secondary text-sm">{row}</div>
                    
                    {/* Columns */}
                    <div className="flex flex-1 justify-between gap-1.5">
                      {columns.map(col => {
                        const label = `${row}${col}`;
                        const owner = getSeatOwner(label);
                        const isMySeat = owner && owner.id === currentUser.id;
                        const isClassroomFiltered = standClassroomFilter === 'all' || (owner && owner.classroom === standClassroomFilter);
                        const isAllowedByZone = isNormalStudent && isRowAllowedForClass(row, currentUser.classroom);

                        return (
                          <button
                            key={label}
                            onClick={() => handleSeatClick(row, col)}
                            disabled={(!isAllowedByZone && !owner) || !isNormalStudent}
                            className={`
                              flex-1 aspect-square rounded text-[10px] font-bold transition-all border
                              ${owner 
                                ? isMySeat 
                                  ? 'bg-green-500 text-white border-green-400 shadow shadow-green-500/20'
                                  : isClassroomFiltered
                                    ? 'bg-pink-primary text-white border-pink-accent'
                                    : 'bg-pink-primary/30 text-text-secondary border-pink-primary/20 opacity-40'
                                : isAllowedByZone 
                                  ? 'bg-carbon-light hover:bg-pink-primary/20 text-text-secondary hover:text-pink-primary border-pink-primary/10 hover:border-pink-primary/50'
                                  : 'bg-carbon-dark text-text-tertiary border-transparent cursor-not-allowed opacity-30'
                              }
                            `}
                            title={owner ? `${label}: ${owner.fullname} (${owner.classroom})` : `${label}: ว่าง`}
                          >
                            {owner ? (isMySeat ? 'คุณ' : owner.classroom.split('/')[1] || label) : label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Stage Indicator */}
                <div className="mt-8 pt-4 border-t border-pink-primary/10 text-center">
                  <div className="inline-block px-12 py-2.5 bg-carbon-light/50 border border-pink-primary/10 rounded-lg text-xs tracking-wider uppercase font-semibold text-text-secondary">
                    เวทีกลาง / พื้นที่กิจกรรม (STAGE)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sports Volunterring Tab */}
        {currentTab === 'sports' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">สมัครคัดเลือกนักกีฬา</h2>
              <p className="text-sm text-text-secondary">
                ลงชื่อสมัครคัดเลือกนักกีฬาเพื่อให้ประธานสีตรวจสอบและจัดลงรายการแข่งขัน
              </p>
            </div>

            <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-6 space-y-6 max-w-2xl shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-pink-primary mb-2">ข้อมูลการสมัครของคุณ</h3>
                <p className="text-xs text-text-secondary mb-4">
                  * หากผ่านการคัดเลือก ประธานสีจะจัดชื่อลงรายการแข่งขันที่เหมาะสม
                </p>

                <div className="p-4 bg-carbon-dark border border-pink-primary/5 rounded-xl space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">ชื่อผู้สมัคร:</span>
                    <span className="font-semibold text-white">{currentUser.fullname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">ห้องเรียน:</span>
                    <span className="font-semibold text-white">{currentUser.classroom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">สถานะการสมัครนักกีฬา:</span>
                    <span className={`font-bold ${currentUser.assigned_duty === 'athlete' ? 'text-pink-primary' : 'text-text-tertiary'}`}>
                      {currentUser.assigned_duty === 'athlete' ? 'สมัครแล้ว' : 'ยังไม่ได้สมัคร'}
                    </span>
                  </div>
                  {currentUser.assigned_duty === 'athlete' && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">ผลการคัดเลือก:</span>
                      <span className={`font-bold ${currentUser.duty_status === 'approved' ? 'text-green-400 animate-pulse' : 'text-yellow-500'}`}>
                        {currentUser.duty_status === 'approved' ? 'ผ่านคัดเลือก (ประธานบรรจุลงไลน์อัพแล้ว)' : 'รอประธานตรวจสอบความสามารถ/ลงรายการแข่งขัน'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-pink-primary/10 flex gap-3">
                {currentUser.assigned_duty === 'none' ? (
                  <button
                    onClick={() => {
                      if (confirm('คุณแน่ใจใช่หรือไม่ว่าต้องการยื่นใบสมัครคัดเลือกนักกีฬาสีชมพูปีนี้?')) {
                        updateStudent(currentUser.id, { assigned_duty: 'athlete', duty_status: 'pending_selection' });
                      }
                    }}
                    className="flex-1 bg-pink-primary hover:bg-pink-accent py-3.5 rounded-xl font-bold text-sm text-center transition-colors shadow-lg shadow-pink-primary/10"
                  >
                    ส่งใบสมัครลงคัดเลือกนักกีฬา
                  </button>
                ) : (
                  currentUser.assigned_duty === 'athlete' && currentUser.duty_status !== 'approved' && (
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการยกเลิกการลงสมัครคัดเลือกนักกีฬาใช่หรือไม่?')) {
                          updateStudent(currentUser.id, { assigned_duty: 'none', duty_status: 'none' });
                        }
                      }}
                      className="flex-1 bg-carbon-light hover:bg-carbon-dark text-red-400 border border-red-500/20 py-3 rounded-xl text-sm font-semibold transition-all"
                    >
                      ยกเลิกใบสมัครนักกีฬา
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Special Duty Tab */}
        {currentTab === 'special' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">สมัครตำแหน่งหน้าที่พิเศษ</h2>
              <p className="text-sm text-text-secondary">
                สมัครและคัดเลือกตำแหน่งพิเศษ เช่น หลีดเดอร์ ดรัมเมเยอร์ วงดุริยางค์ และมือตีกลอง ตั้งแต่ ม.1 ถึง ม.5
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: 'cheerleader' as Duty, title: 'หลีดเดอร์ (Cheerleader)', limit: 10 },
                { type: 'drummer' as Duty, title: 'ดรัมเมเยอร์ (Drum Major)', limit: 4 },
                { type: 'band' as Duty, title: 'ดุริยางค์ & ดนตรี', limit: 20 },
                { type: 'drum' as Duty, title: 'มือตีกลองสแตนเชียร์', limit: 6 },
              ].map(special => {
                const applicants = data.students.filter((s: Student) => s.assigned_duty === special.type);
                const isUserApplied = currentUser.assigned_duty === special.type;

                return (
                  <div key={special.type} className="bg-carbon-card border border-pink-primary/10 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow">
                    <div>
                      <h3 className="font-bold text-text-primary text-base">{special.title}</h3>
                      <span className="text-xs text-text-secondary">ต้องการ: {special.limit} คน</span>
                      
                      <div className="mt-4">
                        <span className="text-xs text-text-tertiary block font-semibold uppercase tracking-wider mb-2">รายชื่อผู้สมัคร/คัดตัว:</span>
                        {applicants.length === 0 ? (
                          <span className="text-xs text-text-tertiary italic">ยังไม่มีผู้สมัคร</span>
                        ) : (
                          <div className="space-y-2">
                            {applicants.map((app: Student) => (
                              <div key={app.id} className="text-xs bg-carbon-dark p-2 rounded border border-pink-primary/5 flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-text-primary block">{app.fullname}</span>
                                  <span className="text-text-secondary text-[10px]">{app.classroom}</span>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${app.duty_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                  {app.duty_status === 'approved' ? 'ผ่านแล้ว' : 'รอคัด'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-pink-primary/5">
                      {isUserApplied ? (
                        <div className="space-y-2 text-center">
                          <span className="text-xs text-pink-primary block font-medium">คุณสมัครตำแหน่งนี้อยู่</span>
                          <button
                            onClick={() => {
                              if (confirm('ต้องการยกเลิกการสมัครนี้ใช่หรือไม่?')) {
                                updateStudent(currentUser.id, { assigned_duty: 'none', duty_status: 'none' });
                              }
                            }}
                            className="w-full bg-carbon-light hover:bg-carbon-dark border border-red-500/20 py-1.5 rounded text-xs transition-all text-red-400"
                          >
                            ยกเลิกใบสมัคร
                          </button>
                        </div>
                      ) : (
                        currentUser.assigned_duty === 'none' && (
                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการยื่นใบสมัครเข้าร่วมคัดตัวในหน้าที่ ${special.title} ใช่หรือไม่?`)) {
                                updateStudent(currentUser.id, { assigned_duty: special.type, duty_status: 'pending_selection' });
                              }
                            }}
                            className="w-full bg-pink-primary hover:bg-pink-accent py-2 rounded text-xs font-semibold transition-colors"
                          >
                            ยื่นสมัครคัดเลือก
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin / President Tab */}
        {currentTab === 'admin' && !isNormalStudent && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">แผงควบคุมหลักประธานกีฬาสี</h2>
              <p className="text-sm text-text-secondary">
                จัดการสิทธิ์ที่นั่งสแตน ตัดสินใจคัดเลือกหน้าที่พิเศษ และบริหารรายชื่อผู้ตกหล่นทั้งหมด
              </p>
            </div>

            {/* Event configuration for admin */}
            <div className="p-6 bg-carbon-card border border-pink-primary/10 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-pink-primary">ไลน์อัพและรายการแข่งขันกีฬา (Line-up)</h3>
                  <p className="text-xs text-text-secondary">จัดการดึงชื่อน้องที่สมัครและผ่านการคัดเลือกเป็นนักกีฬาเข้าแข่งขัน</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="ชื่อรายการแข่งขัน (เช่น วิ่งผลัด 4x100)"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="bg-carbon-dark border border-pink-primary/10 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-pink-primary text-white"
                  />
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="bg-carbon-dark border border-pink-primary/10 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-pink-primary text-white"
                  >
                    <option value="กรีฑา">กรีฑา</option>
                    <option value="ฟุตบอล">ฟุตบอล</option>
                    <option value="บาสเกตบอล">บาสเกตบอล</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!newEventName) return;
                      addSportsEvent(newEventName, newEventCategory);
                      setNewEventName('');
                    }}
                    className="bg-pink-primary hover:bg-pink-accent px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> เพิ่มรายการกีฬา
                  </button>
                </div>
              </div>

              {/* Event Line-up Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {data.sports.map((event: SportsEvent) => {
                  // Pool of student who applied as athletes OR are currently unassigned/free
                  const eligibleAthletes = data.students.filter(
                    (st: Student) => st.assigned_duty === 'athlete' && st.id !== currentUser.id
                  );

                  return (
                    <div key={event.id} className="bg-carbon-dark p-5 rounded-xl border border-pink-primary/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">{event.name} ({event.category})</h4>
                      </div>

                      <div className="space-y-2">
                        {event.lineup.length === 0 ? (
                          <span className="text-xs text-text-tertiary italic">ยังไม่จัดรายชื่อนักกีฬาลงแข่งขัน</span>
                        ) : (
                          <div className="space-y-1.5">
                            {event.lineup.map(athleteId => {
                              const ath = data.students.find((s: Student) => s.id === athleteId);
                              if (!ath) return null;
                              return (
                                <div key={athleteId} className="flex items-center justify-between text-xs bg-carbon-card p-2 rounded border border-pink-primary/5">
                                  <span>{ath.fullname} ({ath.classroom})</span>
                                  <button
                                    onClick={() => removeAthleteFromEvent(event.id, athleteId)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignAthleteToEvent(event.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full bg-carbon-card border border-pink-primary/10 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-pink-primary text-text-secondary"
                        >
                          <option value="">-- เลือกผู้สมัครนักกีฬาลงแข่งขันที่นี่ --</option>
                          {eligibleAthletes.map((ath: Student) => (
                            <option key={ath.id} value={ath.id}>
                              {ath.fullname} ({ath.classroom} เลขที่ {ath.number})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of all students for screening */}
            <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-pink-primary mb-4">รายชื่อคัดกรองนักเรียนและการทำงาน</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-pink-primary/10 text-text-secondary">
                      <th className="py-3 px-4 font-semibold">ชื่อ-นามสกุล</th>
                      <th className="py-3 px-4 font-semibold">ระดับชั้น</th>
                      <th className="py-3 px-4 font-semibold">ตำแหน่งสมัคร</th>
                      <th className="py-3 px-4 font-semibold">สถานะคัดกรอง</th>
                      <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((st: Student) => (
                      <tr key={st.id} className="border-b border-pink-primary/5 hover:bg-carbon-light/20 transition-colors">
                        <td className="py-3 px-4 font-semibold">{st.fullname}</td>
                        <td className="py-3 px-4 text-text-secondary">{st.classroom} (เลขที่ {st.number})</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-pink-primary">{dutyLabel(st.assigned_duty)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${st.duty_status === 'approved' ? 'bg-green-500/10 text-green-400' : st.duty_status === 'pending_selection' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'}`}>
                            {st.duty_status === 'approved' ? 'ผ่านการอนุมัติ' : st.duty_status === 'pending_selection' ? 'รอคัดตัว' : 'ว่างงาน/ตกหล่น'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {st.duty_status === 'pending_selection' && (
                            <>
                              <button
                                onClick={() => updateStudent(st.id, { duty_status: 'approved' })}
                                className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors"
                              >
                                ผ่านคัดเลือก
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`คัด ${st.fullname} ไม่ผ่านใช่ไหม? ระบบจะดันเขากลับไปลงทะเบียนใหม่เพื่อไม่ให้ตกหล่น`)) {
                                    updateStudent(st.id, { assigned_duty: 'none', duty_status: 'none' });
                                  }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors"
                              >
                                คัดออก (ไม่ผ่าน)
                              </button>
                            </>
                          )}
                          {st.assigned_duty !== 'none' && st.role !== 'admin_president' && (
                            <button
                              onClick={() => {
                                if (confirm(`ต้องการรีเซ็ตหน้าที่ของ ${st.fullname} กลับเป็นว่างงานใช่หรือไม่?`)) {
                                  updateStudent(st.id, { assigned_duty: 'none', duty_status: 'none' });
                                }
                              }}
                              className="text-text-tertiary hover:text-red-400 transition-colors p-1"
                            >
                              รีเซ็ตหน้าที่
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

'use strict';

// Custom lightweight state store that uses localStorage to persist mock data
// and trigger react updates across components (simple pub/sub)
import { Student, SportsEvent, INITIAL_STUDENTS, INITIAL_SPORTS } from './mockData';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string; // base64 string
  date: string;
  createdBy?: string; // controller name
}

export interface ActivityLog {
  id: string;
  timestamp: string;       // ISO string
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;          // human-readable action text
  targetName?: string;     // student/announcement name if applicable
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'ประกาศรับสมัครสแตนด์เชียร์เพิ่มเติม',
    content: 'สำหรับน้อง ม.1-3 ที่ยังไม่มีหน้าที่ สามารถเข้าไปเลือกจองที่นั่งบนสแตนด์เชียร์สีชมพูได้ทันทีที่ระบบจองที่นั่ง',
    date: '13 มิ.ย. 2026',
    createdBy: 'ประธานสีชมพู (แอดมิน)'
  },
  {
    id: '2',
    title: 'ประกาศคัดตัวดรัมเมเยอร์และดนตรีกลอง',
    content: 'เปิดโอกาสให้นักเรียน ม.1 - ม.5 ทุกระดับชั้นที่มีความสามารถด้านดนตรีหรือบุคลิกภาพดี สมัครคัดเลือกตำแหน่งพิเศษได้ที่เมนูสมัครตำแหน่งพิเศษ',
    date: '12 มิ.ย. 2026',
    createdBy: 'ประธานสีชมพู (แอดมิน)'
  }
];

const DEFAULT_LOGS: ActivityLog[] = [];

const LISTENERS = new Set<() => void>();

export function subscribe(listener: () => void) {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

function notify() {
  LISTENERS.forEach(l => l());
}

export interface SpecialDuty {
  id: string;
  title: string;
  icon: string;
  limit: number;
  qrCode?: string;
  lineLink?: string;
}

const DEFAULT_SPECIAL_DUTIES: SpecialDuty[] = [
  { id: 'cheerleader', title: 'หลีดเดอร์ (Cheerleader)', icon: 'C', limit: 10, qrCode: '', lineLink: '' },
  { id: 'drummer', title: 'ดรัมเมเยอร์ (Drum Major)', icon: 'D', limit: 4, qrCode: '', lineLink: '' },
  { id: 'band', title: 'ดุริยางค์ & ดนตรี', icon: 'B', limit: 20, qrCode: '', lineLink: '' },
  { id: 'drum', title: 'มือตีกลองสแตนเชียร์', icon: 'R', limit: 6, qrCode: '', lineLink: '' },
];

export function getStoredData() {
  if (typeof window === 'undefined') {
    return { 
      students: INITIAL_STUDENTS, 
      sports: INITIAL_SPORTS, 
      announcements: DEFAULT_ANNOUNCEMENTS, 
      logs: DEFAULT_LOGS,
      controllers: [] as string[],
      standOpen: false,
      standLocked: false,
      specialDuties: DEFAULT_SPECIAL_DUTIES,
      athleteQr: { qrCode: '', lineLink: '' }
    };
  }
  const studentsRaw = localStorage.getItem('pink69_students');
  const sportsRaw = localStorage.getItem('pink69_sports');
  const announcementsRaw = localStorage.getItem('pink69_announcements');
  const logsRaw = localStorage.getItem('pink69_logs');
  
  const controllersRaw = localStorage.getItem('pink69_controllers');
  const standOpenRaw = localStorage.getItem('pink69_stand_open');
  const standLockedRaw = localStorage.getItem('pink69_stand_locked');
  const specialDutiesRaw = localStorage.getItem('pink69_special_duties');
  const athleteQrRaw = localStorage.getItem('pink69_athlete_qr');

  const rawStudents = studentsRaw ? JSON.parse(studentsRaw) : INITIAL_STUDENTS;
  const sports = sportsRaw ? JSON.parse(sportsRaw) : INITIAL_SPORTS;
  const announcements = announcementsRaw ? JSON.parse(announcementsRaw) : DEFAULT_ANNOUNCEMENTS;
  const logs: ActivityLog[] = logsRaw ? JSON.parse(logsRaw) : DEFAULT_LOGS;

  const defaultControllers = ['39967', '39998']; // Default ม.5 controllers
  const controllers: string[] = controllersRaw ? JSON.parse(controllersRaw) : defaultControllers;
  const standOpen: boolean = standOpenRaw ? JSON.parse(standOpenRaw) : false;
  const standLocked: boolean = standLockedRaw ? JSON.parse(standLockedRaw) : false;
  const specialDuties: SpecialDuty[] = specialDutiesRaw ? JSON.parse(specialDutiesRaw) : DEFAULT_SPECIAL_DUTIES;
  const athleteQr = athleteQrRaw ? JSON.parse(athleteQrRaw) : { qrCode: '', lineLink: '' };

  // Make sure admin profile is in students list if not present
  if (!rawStudents.find((s: Student) => s.role === 'admin_president')) {
    rawStudents.push({
      id: 'admin',
      fullname: 'ประธานสีชมพู (แอดมิน)',
      classroom: 'ม.5/8',
      number: '99',
      role: 'admin_president',
      assigned_duty: 'staff',
      duty_status: 'approved'
    });
  }

  // Dynamically map student roles: M.5 students who are NOT in controllers list should be normal students
  const students = rawStudents.map((s: Student) => {
    if (s.role === 'admin_president') return s;
    if (s.classroom && s.classroom.startsWith('ม.5')) {
      if (controllers.includes(s.id)) {
        return { ...s, role: 'staff_m5' };
      } else {
        return { ...s, role: 'student_m5' };
      }
    }
    return s;
  });

  return { students, sports, announcements, logs, controllers, standOpen, standLocked, specialDuties, athleteQr };
}

function saveAll(
  students: Student[],
  sports: SportsEvent[],
  announcements: Announcement[],
  logs: ActivityLog[]
) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pink69_students', JSON.stringify(students));
  localStorage.setItem('pink69_sports', JSON.stringify(sports));
  localStorage.setItem('pink69_announcements', JSON.stringify(announcements));
  localStorage.setItem('pink69_logs', JSON.stringify(logs));
  notify();
}

export function saveSystemConfig(config: {
  controllers?: string[];
  standOpen?: boolean;
  standLocked?: boolean;
  specialDuties?: SpecialDuty[];
  athleteQr?: { qrCode: string; lineLink: string };
}, actor?: Student, action?: string) {
  if (typeof window === 'undefined') return;
  
  if (config.controllers !== undefined) {
    localStorage.setItem('pink69_controllers', JSON.stringify(config.controllers));
  }
  if (config.standOpen !== undefined) {
    localStorage.setItem('pink69_stand_open', JSON.stringify(config.standOpen));
  }
  if (config.standLocked !== undefined) {
    localStorage.setItem('pink69_stand_locked', JSON.stringify(config.standLocked));
  }
  if (config.specialDuties !== undefined) {
    localStorage.setItem('pink69_special_duties', JSON.stringify(config.specialDuties));
  }
  if (config.athleteQr !== undefined) {
    localStorage.setItem('pink69_athlete_qr', JSON.stringify(config.athleteQr));
  }

  if (actor && action) {
    const { logs } = getStoredData();
    const roleLabel =
      actor.role === 'admin_president' ? 'ประธานสี' :
      actor.role === 'staff_m5' ? 'พี่ ม.5 (สตาฟ)' : 'น้อง';
    
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action,
    };
    const updatedLogs = [newLog, ...logs].slice(0, 200);
    localStorage.setItem('pink69_logs', JSON.stringify(updatedLogs));
  }

  notify();
}

// ----------------------------------------------------------
// Activity Log helpers
// ----------------------------------------------------------
export function appendLog(actor: Student, action: string, targetName?: string) {
  const { students, sports, announcements, logs } = getStoredData();
  const roleLabel =
    actor.role === 'admin_president' ? 'ประธานสี' :
    actor.role === 'staff_m5' ? 'พี่ ม.5 (สตาฟ)' :
    actor.role === 'student_m4' ? 'พี่ ม.4' : 'น้อง ม.1-3';

  const now = new Date();

  const newLog: ActivityLog = {
    id: 'log_' + Date.now(),
    timestamp: now.toISOString(),
    actorId: actor.id,
    actorName: actor.fullname,
    actorRole: roleLabel,
    action,
    targetName
  };
  // Keep only latest 200 entries
  const updatedLogs = [newLog, ...logs].slice(0, 200);
  saveAll(students, sports, announcements, updatedLogs);
}

export function clearLogs() {
  const { students, sports, announcements } = getStoredData();
  saveAll(students, sports, announcements, []);
}

// ----------------------------------------------------------
// Announcement helpers (controller-only enforced in UI layer)
// ----------------------------------------------------------
export function saveAnnouncements(announcements: Announcement[], actor?: Student, action?: string, targetName?: string) {
  const { students, sports, logs } = getStoredData();
  let updatedLogs = logs;
  if (actor && action) {
    const roleLabel =
      actor.role === 'admin_president' ? 'ประธานสี' :
      actor.role === 'staff_m5' ? 'พี่ ม.5 (สตาฟ)' : 'น้อง';
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action,
      targetName
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }
  saveAll(students, sports, announcements, updatedLogs);
}

// ----------------------------------------------------------
// Student helpers
// ----------------------------------------------------------
export function updateStudent(studentId: string, updates: Partial<Student>, actor?: Student, logAction?: string) {
  const { students, sports, announcements, logs } = getStoredData();
  const target = students.find((s: Student) => s.id === studentId);
  const nextStudents = students.map((s: Student) => {
    if (s.id === studentId) {
      const next = { ...s, ...updates };
      // Business logic validation: If the user is rejected from an athlete or special duty,
      // reset their assigned duty to none, forcing Stand selection
      if (updates.duty_status === 'none' || (updates.assigned_duty === 'none')) {
        next.assigned_duty = 'none';
        next.duty_status = 'none';
        delete next.seat;
      }
      return next;
    }
    return s;
  });

  let updatedLogs = logs;
  if (actor && logAction) {
    const roleLabel =
      actor.role === 'admin_president' ? 'ประธานสี' :
      actor.role === 'staff_m5' ? 'พี่ ม.5 (สตาฟ)' : 'น้อง';
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: logAction,
      targetName: target?.fullname
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, sports, announcements, updatedLogs);
}

export function updateMultipleStudents(studentIds: string[], updates: Partial<Student>, actor?: Student, logAction?: string) {
  const { students, sports, announcements, logs } = getStoredData();
  const targetNames: string[] = [];
  
  const nextStudents = students.map((s: Student) => {
    if (studentIds.includes(s.id)) {
      targetNames.push(s.fullname);
      const next = { ...s, ...updates };
      if (updates.duty_status === 'none' || (updates.assigned_duty === 'none')) {
        next.assigned_duty = 'none';
        next.duty_status = 'none';
        delete next.seat;
      }
      return next;
    }
    return s;
  });

  let updatedLogs = logs;
  if (actor && logAction) {
    const roleLabel =
      actor.role === 'admin_president' ? 'ประธานสี' :
      actor.role === 'staff_m5' ? 'พี่ ม.5 (สตาฟ)' : 'น้อง';
    const targetsStr = targetNames.length > 3 
      ? `${targetNames.slice(0, 3).join(', ')} และคนอื่นๆ รวม ${targetNames.length} คน` 
      : targetNames.join(', ');
    
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `${logAction} จำนวน ${studentIds.length} คน`,
      targetName: targetsStr
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, sports, announcements, updatedLogs);
}

// ----------------------------------------------------------
// Seat helpers
// ----------------------------------------------------------
export function bookSeat(studentId: string, seatLabel: string) {
  const { students, sports, announcements, logs } = getStoredData();
  
  // Clean old seat of this student
  let nextStudents = students.map((s: Student) => {
    if (s.seat === seatLabel) {
      return { ...s, seat: undefined, assigned_duty: 'none', duty_status: 'none' as const };
    }
    return s;
  });

  // Assign new seat
  nextStudents = nextStudents.map((s: Student) => {
    if (s.id === studentId) {
      return { ...s, seat: seatLabel, assigned_duty: 'stand' as const, duty_status: 'approved' as const };
    }
    return s;
  });

  saveAll(nextStudents, sports, announcements, logs);
}

export function releaseSeat(seatLabel: string) {
  const { students, sports, announcements, logs } = getStoredData();
  const nextStudents = students.map((s: Student) => {
    if (s.seat === seatLabel) {
      return { ...s, seat: undefined, assigned_duty: 'none' as const, duty_status: 'none' as const };
    }
    return s;
  });
  saveAll(nextStudents, sports, announcements, logs);
}

// ----------------------------------------------------------
// Sports event helpers
// ----------------------------------------------------------
export function addSportsEvent(name: string, category: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  const newEvent: SportsEvent = {
    id: 's_' + Date.now(),
    name,
    category,
    lineup: []
  };
  let updatedLogs = logs;
  if (actor) {
    const roleLabel = actor.role === 'admin_president' ? 'ประธานสี' : 'พี่ ม.5 (สตาฟ)';
    updatedLogs = [{
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `เพิ่มรายการแข่งขัน "${name}" (${category})`,
    }, ...logs].slice(0, 200);
  }
  saveAll(students, [...sports, newEvent], announcements, updatedLogs);
}

export function assignAthleteToEvent(eventId: string, studentId: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  const nextSports = sports.map((s: SportsEvent) => {
    if (s.id === eventId) {
      if (!s.lineup.includes(studentId)) {
        return { ...s, lineup: [...s.lineup, studentId] };
      }
    }
    return s;
  });
  let updatedLogs = logs;
  if (actor) {
    const event = sports.find((e: SportsEvent) => e.id === eventId);
    const student = students.find((s: Student) => s.id === studentId);
    const roleLabel = actor.role === 'admin_president' ? 'ประธานสี' : 'พี่ ม.5 (สตาฟ)';
    updatedLogs = [{
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `เพิ่มนักกีฬาในรายการ "${event?.name || eventId}"`,
      targetName: student?.fullname
    }, ...logs].slice(0, 200);
  }
  saveAll(students, nextSports, announcements, updatedLogs);
}

export function removeAthleteFromEvent(eventId: string, studentId: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  const nextSports = sports.map((s: SportsEvent) => {
    if (s.id === eventId) {
      return { ...s, lineup: s.lineup.filter(id => id !== studentId) };
    }
    return s;
  });
  let updatedLogs = logs;
  if (actor) {
    const event = sports.find((e: SportsEvent) => e.id === eventId);
    const student = students.find((s: Student) => s.id === studentId);
    const roleLabel = actor.role === 'admin_president' ? 'ประธานสี' : 'พี่ ม.5 (สตาฟ)';
    updatedLogs = [{
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `นำชื่อนักกีฬาออกจากรายการ "${event?.name || eventId}"`,
      targetName: student?.fullname
    }, ...logs].slice(0, 200);
  }
  saveAll(students, nextSports, announcements, updatedLogs);
}

export function removeSportsEvent(eventId: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  const event = sports.find((e: SportsEvent) => e.id === eventId);
  const nextSports = sports.filter((s: SportsEvent) => s.id !== eventId);
  let updatedLogs = logs;
  if (actor && event) {
    const roleLabel = actor.role === 'admin_president' ? 'ประธานสี' : 'พี่ ม.5 (สตาฟ)';
    updatedLogs = [{
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `ลบรายการแข่งขัน "${event.name}" (${event.category})`,
    }, ...logs].slice(0, 200);
  }
  saveAll(students, nextSports, announcements, updatedLogs);
}

// Legacy compatibility  saveStoredData without logs (used by old callers)
export function saveStoredData(students: Student[], sports: SportsEvent[], announcements?: Announcement[]) {
  if (typeof window === 'undefined') return;
  const { logs } = getStoredData();
  localStorage.setItem('pink69_students', JSON.stringify(students));
  localStorage.setItem('pink69_sports', JSON.stringify(sports));
  if (announcements) {
    localStorage.setItem('pink69_announcements', JSON.stringify(announcements));
  }
  localStorage.setItem('pink69_logs', JSON.stringify(logs));
  notify();
}

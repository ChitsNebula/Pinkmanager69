'use strict';

// Custom lightweight state store that uses localStorage to persist mock data
// and trigger react updates across components (simple pub/sub)
import { Student, SportsEvent, INITIAL_STUDENTS, INITIAL_SPORTS } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string; // base64 string
  date: string;
  createdBy?: string; // controller name
}

export interface ColorHouseCheckin {
  id: string;
  submitterId: string;
  submitterName: string;
  date: string;
  weekKey: string;
  photos: string[]; // array of base64 strings
  taggedStudentIds: string[];
  taggedStudentNames: string[];
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
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

export function getRoleLabel(role?: string): string {
  if (!role) return 'น้อง';
  if (role === 'admin_president') return 'ประธานสี';
  if (role === 'staff_m5') return 'ผู้ควบคุม';
  if (role === 'moderator') return 'ผู้ดูแล';
  if (role === 'student_m4') return 'พี่ ม.4';
  if (role === 'student_m5') return 'พี่ ม.5';
  return 'น้อง';
}

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

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`[LocalStorage Error] safeGetItem failed for key "${key}":`, e);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`[LocalStorage Error] safeSetItem failed for key "${key}":`, e);
  }
}

function safeJsonParse<T>(rawStr: string | null, defaultValue: T): T {
  if (!rawStr) return defaultValue;
  try {
    return JSON.parse(rawStr) as T;
  } catch (e) {
    console.error(`[JSON Parse Error] failed parsing string:`, e);
    return defaultValue;
  }
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

export interface SongWord {
  text: string;       // เนื้อหาคำ เช่น "ฟ้าน้ำเงิน"
  isTagged: boolean;  // แปรอักษรในจังหวะนี้ไหม
  visuals?: Record<string, string>; // seat label -> color/equipment for word-by-word choreo
}

export interface SongSegment {
  id: string;
  words: SongWord[];  // คำทั้งหมดในท่อนนี้ (isTagged=true คือจังหวะแปรอักษร)
  visuals: Record<string, string>; // seat label (e.g. A1, E8) -> equipment/color name
}

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  equipment: string[];
  segments: SongSegment[];
  isLocked?: boolean;
}

export function generateDefaultVisuals(patternType: 'checker' | 'border' | 'split-vertical' | 'split-horizontal') {
  const visuals: Record<string, string> = {};
  const rows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const columns = Array.from({ length: 20 }, (_, i) => i + 1);
  rows.forEach((row, rIdx) => {
    columns.forEach((col) => {
      const label = `${row}${col}`;
      if (patternType === 'checker') {
        visuals[label] = (rIdx + col) % 2 === 0 ? 'ชมพู' : 'ขาว';
      } else if (patternType === 'border') {
        const isBorder = rIdx === 0 || rIdx === 9 || col === 1 || col === 18;
        visuals[label] = isBorder ? 'ชมพู' : 'ขาว';
      } else if (patternType === 'split-vertical') {
        visuals[label] = col <= 9 ? 'ชมพู' : 'ขาว';
      } else if (patternType === 'split-horizontal') {
        visuals[label] = rIdx <= 4 ? 'ขาว' : 'ชมพู';
      }
    });
  });
  return visuals;
}

const DEFAULT_SONGS: Song[] = [
  {
    id: 'song_1',
    title: 'เพลงมาร์ชชมพู',
    lyrics: 'ชมพู สู้ตาย ชมพู เกรียงไกร',
    equipment: ['ชมพู', 'ขาว', 'ร่ม'],
    segments: [
      { id: 'seg_1_1', words: [{ text: 'ชมพู', isTagged: false }], visuals: generateDefaultVisuals('border') },
      { id: 'seg_1_2', words: [{ text: 'สู้ตาย', isTagged: false }], visuals: generateDefaultVisuals('checker') },
      { id: 'seg_1_3', words: [{ text: 'ชมพู', isTagged: false }], visuals: generateDefaultVisuals('split-vertical') },
      { id: 'seg_1_4', words: [{ text: 'เกรียงไกร', isTagged: false }], visuals: generateDefaultVisuals('split-horizontal') }
    ]
  }
];

export interface SystemReport {
  id: string;
  studentId: string;
  studentName: string;
  classroom: string;
  number: string;
  subject: string; // 'name_wrong' | 'classroom_wrong' | 'number_wrong' | 'other'
  description: string;
  status: 'pending' | 'resolved';
  timestamp: string;
}

const DEFAULT_REPORTS: SystemReport[] = [];

export function getStoredData() {
  if (typeof window === 'undefined') {
    return { 
      students: INITIAL_STUDENTS, 
      sports: INITIAL_SPORTS, 
      announcements: DEFAULT_ANNOUNCEMENTS, 
      logs: DEFAULT_LOGS,
      controllers: [] as string[],
      moderators: [] as string[],
      standOpen: false,
      standLocked: false,
      specialDuties: DEFAULT_SPECIAL_DUTIES,
      athleteQr: { qrCode: '', lineLink: '' },
      processionQr: { qrCode: '', lineLink: '' },
      processionLimit: 150,
      processionTitle: 'ขบวนพาเหรด',
      songs: DEFAULT_SONGS,
      reports: DEFAULT_REPORTS,
      colorHouseCheckins: [] as ColorHouseCheckin[]
    };
  }
  const studentsRaw = safeGetItem('pink69_students');
  const sportsRaw = safeGetItem('pink69_sports');
  const announcementsRaw = safeGetItem('pink69_announcements');
  const logsRaw = safeGetItem('pink69_logs');
  
  const controllersRaw = safeGetItem('pink69_controllers');
  const moderatorsRaw = safeGetItem('pink69_moderators');
  const standOpenRaw = safeGetItem('pink69_stand_open');
  const standLockedRaw = safeGetItem('pink69_stand_locked');
  const specialDutiesRaw = safeGetItem('pink69_special_duties');
  const athleteQrRaw = safeGetItem('pink69_athlete_qr');
  const processionQrRaw = safeGetItem('pink69_procession_qr');
  const processionLimitRaw = safeGetItem('pink69_procession_limit');
  const processionTitleRaw = safeGetItem('pink69_procession_title');
  const songsRaw = safeGetItem('pink69_songs');
  const checkinsRaw = safeGetItem('pink69_color_house_checkins');

  let rawStudents = safeJsonParse<Student[]>(studentsRaw, INITIAL_STUDENTS);
  const colorHouseCheckins = safeJsonParse<ColorHouseCheckin[]>(checkinsRaw, []);

  // Auto-migration ม.3/13 v2
  if (typeof window !== 'undefined') {
    const isMigrated = safeGetItem('pink69_m313_migrated_v2') === 'true';
    if (!isMigrated) {
      const nonM313 = rawStudents.filter((s: Student) => s.classroom !== 'ม.3/13');
      const newM313 = INITIAL_STUDENTS.filter((s: Student) => s.classroom === 'ม.3/13');
      rawStudents = [...nonM313, ...newM313];
      safeSetItem('pink69_students', JSON.stringify(rawStudents));
      safeSetItem('pink69_m313_migrated_v2', 'true');
    }
  }
  const sports = safeJsonParse<SportsEvent[]>(sportsRaw, INITIAL_SPORTS);
  const announcements = safeJsonParse<Announcement[]>(announcementsRaw, DEFAULT_ANNOUNCEMENTS);
  const logs = safeJsonParse<ActivityLog[]>(logsRaw, DEFAULT_LOGS);

  const defaultControllers = ['39967', '39998', '40059', '40092']; // Default controllers
  let controllers = safeJsonParse<string[]>(controllersRaw, defaultControllers);
  let moderators = safeJsonParse<string[]>(moderatorsRaw, []);

  // Auto-migration: Ensure default controllers are merged into user's localStorage
  if (typeof window !== 'undefined') {
    const isControllersMigrated = safeGetItem('pink69_controllers_migrated_v3') === 'true';
    if (!isControllersMigrated) {
      const merged = Array.from(new Set([...controllers, ...defaultControllers]));
      controllers = merged;
      safeSetItem('pink69_controllers', JSON.stringify(merged));
      safeSetItem('pink69_controllers_migrated_v3', 'true');
    }
  }

  // Auto-migration: Ensure default controller student profiles are in the students list so they have identities
  if (typeof window !== 'undefined') {
    const isStudentsControllersMigrated = safeGetItem('pink69_students_controllers_migrated_v3') === 'true';
    if (!isStudentsControllersMigrated) {
      let nextStudents = [...rawStudents];
      const defaultControllerProfiles: Student[] = [
        {
          id: "39967",
          fullname: "กฤติธี แสนคำ (มิวสิค)",
          classroom: "ม.5/1",
          number: "1",
          role: "staff_m5",
          assigned_duty: "none",
          duty_status: "none"
        },
        {
          id: "39998",
          fullname: "เกียรติสกุล กันกา (ไอคิว)",
          classroom: "ม.5/1",
          number: "2",
          role: "staff_m5",
          assigned_duty: "none",
          duty_status: "none"
        }
      ];

      let hasAdded = false;
      defaultControllerProfiles.forEach(profile => {
        if (!nextStudents.some((s: Student) => s.id === profile.id)) {
          nextStudents.push(profile);
          hasAdded = true;
        }
      });

      if (hasAdded) {
        rawStudents = nextStudents;
        safeSetItem('pink69_students', JSON.stringify(rawStudents));
      }
      safeSetItem('pink69_students_controllers_migrated_v3', 'true');
    }

    const isNicknamesMigrated = safeGetItem('pink69_m41_nicknames_migrated_v1') === 'true';
    if (!isNicknamesMigrated) {
      const nicknamesM41: Record<string, string> = {
        "1": "ภูริ",
        "2": "ฟีฟ่า",
        "3": "โกเบ",
        "4": "อูชิ",
        "5": "มอส",
        "6": "ปัน",
        "7": "ข้าวกล้อง",
        "8": "ทรอย",
        "9": "คอม",
        "10": "ต้นก้า",
        "11": "ธูปหอม",
        "12": "นาง",
        "13": "อองฟอง",
        "14": "ดิ้วตี้",
        "15": "ต้นหอม",
        "16": "ใจเอย",
        "17": "นาย",
        "18": "กอข้าว",
        "19": "ก้านพลู",
        "20": "น้ำว้า",
        "21": "โปรแกรม",
        "22": "เปเป้",
        "23": "อัณณ์",
        "24": "เอิร์น",
        "25": "แพนเค้ก",
        "26": "น้ำขิง",
        "27": "ข้าวหอม",
        "28": "ใบบัว",
        "29": "น้ำหวาน",
        "30": "ข้าวฟ่าง"
      };
      
      let modified = false;
      rawStudents = rawStudents.map((s: Student) => {
        if (s.classroom === 'ม.4/1' && nicknamesM41[s.number]) {
          const nick = nicknamesM41[s.number];
          if (!s.fullname.includes(`(${nick})`)) {
            const cleaned = s.fullname.replace(/\s*\([^)]+\)/g, '').trim();
            modified = true;
            return { ...s, fullname: `${cleaned} (${nick})` };
          }
        }
        return s;
      });
      
      if (modified) {
        safeSetItem('pink69_students', JSON.stringify(rawStudents));
      }
      safeSetItem('pink69_m41_nicknames_migrated_v1', 'true');
    }
  }

  const standOpen: boolean = standOpenRaw ? JSON.parse(standOpenRaw) : false;
  const standLocked: boolean = standLockedRaw ? JSON.parse(standLockedRaw) : false;
  let specialDuties: SpecialDuty[] = specialDutiesRaw ? JSON.parse(specialDutiesRaw) : DEFAULT_SPECIAL_DUTIES;
  const athleteQr = athleteQrRaw ? JSON.parse(athleteQrRaw) : { qrCode: '', lineLink: '' };
  const processionQr = processionQrRaw ? JSON.parse(processionQrRaw) : { qrCode: '', lineLink: '' };
  const processionLimit = processionLimitRaw ? Number(processionLimitRaw) : 150;
  const processionTitle = processionTitleRaw || 'ขบวนพาเหรด';
  let songs: Song[] = songsRaw ? JSON.parse(songsRaw) : DEFAULT_SONGS;

  // Auto-migration: แปลง segments.text เดิม → segments.words (v1)
  if (typeof window !== 'undefined') {
    const isSongMigrated = safeGetItem('pink69_songs_words_v1') === 'true';
    if (!isSongMigrated) {
      songs = songs.map((song: Song) => ({
        ...song,
        segments: (song.segments || []).map((seg: { text?: string; words?: SongWord[]; id: string; visuals: Record<string, string> }) => {
          if (seg.words) return seg as SongSegment; // already migrated
          return {
            ...seg,
            words: [{ text: seg.text || '', isTagged: false }],
          } as SongSegment;
        }),
      }));
      safeSetItem('pink69_songs', JSON.stringify(songs));
      safeSetItem('pink69_songs_words_v1', 'true');
    }
  }
  const reportsRaw = safeGetItem('pink69_reports');
  const reports: SystemReport[] = safeJsonParse<SystemReport[]>(reportsRaw, DEFAULT_REPORTS);

  // Auto-migration: แทรก นนท์นภัส อภัยกาวี เข้าไปเป็น ม.2/14 เลขที่ 7 และขยับคนอื่น
  if (typeof window !== 'undefined') {
    const isNonnaphatInserted = safeGetItem('pink69_m214_insert_nonnaphat_v3') === 'true';
    if (!isNonnaphatInserted) {
      // ดึงรายชื่อคนอื่นที่ไม่ใช่ ม.2/14
      const otherStudents = rawStudents.filter((s: Student) => s.classroom !== 'ม.2/14');
      
      // ดึง ม.2/14 ทั้งหมด (รวม 41750 ถ้ามี)
      let m214 = rawStudents.filter((s: Student) => s.classroom === 'ม.2/14');
      
      // ดึง นนท์นภัส (41750)
      let nonnaphat = m214.find((s: Student) => s.id === '41750');
      if (!nonnaphat) {
        nonnaphat = {
          id: "41750",
          fullname: "นนท์นภัส อภัยกาวี",
          classroom: "ม.2/14",
          number: "7",
          role: "student_m13",
          assigned_duty: "none",
          duty_status: "none"
         };
      }

      // กรองเอาคน ม.2/14 ที่ไม่ใช่นนท์นภัส
      const restOfM214 = m214.filter((s: Student) => s.id !== '41750');

      // เรียงคนอื่นตามเลขที่เดิม
      restOfM214.sort((a: Student, b: Student) => {
        const numA = parseInt(a.number, 10) || 999;
        const numB = parseInt(b.number, 10) || 999;
        return numA - numB;
      });

      // จัดเรียงใหม่โดยแทรก นนท์นภัส ที่เลขที่ 7
      const reorderedM214: Student[] = [];
      restOfM214.forEach((s: Student, idx: number) => {
        if (idx < 6) {
          reorderedM214.push({ ...s, number: String(idx + 1) });
        } else {
          reorderedM214.push({ ...s, number: String(idx + 2) }); // ขยับบวก 1 เพื่อเว้นที่ให้เลขที่ 7
        }
      });

      // แทรก นนท์นภัส ที่ตำแหน่งที่ 6 (ดัชนี 6 ของอาร์เรย์ ซึ่งจะเป็นเลขที่ 7)
      nonnaphat.number = "7";
      reorderedM214.splice(6, 0, nonnaphat);

      // รวมกลับเข้าไป
      rawStudents = [...otherStudents, ...reorderedM214];
      safeSetItem('pink69_students', JSON.stringify(rawStudents));
      safeSetItem('pink69_m214_insert_nonnaphat_v3', 'true');
    }
  }

  // Auto-migration ขบวนพาเหรด v2 (ย้ายจากหน้าที่พิเศษของเดิม ไปเป็น procession)
  if (typeof window !== 'undefined') {
    const isMigrated = safeGetItem('pink69_procession_migrated_v2') === 'true';
    if (!isMigrated) {
      const targetSpecial = specialDuties.find(sd => sd.title.includes('ขบวน'));
      if (targetSpecial) {
        const targetId = targetSpecial.id;
        rawStudents = rawStudents.map((student: Student) => {
          let next = { ...student };
          if (next.duties && next.duties[targetId]) {
            next.duties = { ...next.duties, procession: next.duties[targetId] };
            delete next.duties[targetId];
          }
          if (next.assigned_duty === targetId) {
            next.assigned_duty = 'procession';
          }
          return next;
        });
        specialDuties = specialDuties.filter(sd => sd.id !== targetId);
        safeSetItem('pink69_students', JSON.stringify(rawStudents));
        safeSetItem('pink69_special_duties', JSON.stringify(specialDuties));
      }
      safeSetItem('pink69_procession_migrated_v2', 'true');
    }
  }

  // Auto-migration: ป้องกัน ID ซ้ำ หรือ ID เป็นคำว่า "ยังไม่มี" ใน LocalStorage
  if (typeof window !== 'undefined') {
    let hasIdCleaned = false;
    const seenIds = new Set<string>();
    
    rawStudents = rawStudents.map((student: Student) => {
      let currentId = student.id ? String(student.id).trim() : '';
      // เช็คว่า ID เป็นค่าว่าง หรือ "ยังไม่มี" หรือ "undefined" หรือซ้ำ
      if (!currentId || currentId === 'ยังไม่มี' || currentId === 'undefined' || seenIds.has(currentId)) {
        // สร้างรหัสสุ่ม 5 หลักที่ไม่ซ้ำ
        let newId = '';
        do {
          newId = String(Math.floor(10000 + Math.random() * 90000));
        } while (seenIds.has(newId) || rawStudents.some((s: Student) => s.id === newId));
        
        currentId = newId;
        hasIdCleaned = true;
      }
      seenIds.add(currentId);
      return { ...student, id: currentId };
    });

    if (hasIdCleaned) {
      safeSetItem('pink69_students', JSON.stringify(rawStudents));
    }
  }

  // Dynamically map student roles:
  // 1. If student ID is in controllers list, assign 'staff_m5' role (controller)
  // 2. If student ID is in moderators list, assign 'moderator' role (moderator/staff)
  // 3. If student is NOT in controllers/moderators list but holds staff/admin role, revert to normal student role
  const students = rawStudents.map((s: Student) => {
    let next = { ...s };
    if (!next.duties) {
      next.duties = next.assigned_duty && next.assigned_duty !== 'none'
        ? { [next.assigned_duty]: next.duty_status || 'approved' }
        : {};
    }
    
    if (controllers.includes(next.id)) {
      return { ...next, role: 'staff_m5' };
    }

    if (moderators && moderators.includes(next.id)) {
      return { ...next, role: 'moderator' };
    }
    
    // Revert controller/president/moderator roles to normal roles if they are not in the active controller/moderator list
    if (next.role === 'staff_m5' || next.role === 'admin_president' || next.role === 'moderator') {
      let normalRole = 'student_m13';
      if (next.classroom) {
        if (next.classroom.startsWith('ม.5')) normalRole = 'student_m5';
        else if (next.classroom.startsWith('ม.4')) normalRole = 'student_m4';
      }
      return { ...next, role: normalRole };
    }
    
    return next;
  });

  return { students, sports, announcements, logs, controllers, moderators, standOpen, standLocked, specialDuties, athleteQr, processionQr, processionLimit, processionTitle, songs, reports, colorHouseCheckins };
}

function saveAll(
  students: Student[],
  sports: SportsEvent[],
  announcements: Announcement[],
  logs: ActivityLog[]
) {
  if (typeof window === 'undefined') return;
  safeSetItem('pink69_students', JSON.stringify(students));
  safeSetItem('pink69_sports', JSON.stringify(sports));
  safeSetItem('pink69_announcements', JSON.stringify(announcements));
  safeSetItem('pink69_logs', JSON.stringify(logs));
  notify();

  if (supabase) {
    uploadAllToSupabase(students, sports, announcements, logs).catch(err => {
      console.error('[Supabase Sync] Error during saveAll background upload:', err);
    });
  }
}

export function saveSongs(songs: Song[], actor?: Student, action?: string) {
  if (typeof window === 'undefined') return;
  safeSetItem('pink69_songs', JSON.stringify(songs));
  
  let updatedLogs: ActivityLog[] | null = null;
  if (actor && action) {
    const { logs } = getStoredData();
    const roleLabel = getRoleLabel(actor.role);
    
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action,
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
    safeSetItem('pink69_logs', JSON.stringify(updatedLogs));
  }
  notify();

  if (supabase) {
    uploadSongsToSupabase(songs).catch(err => {
      console.error('[Supabase Sync] Error uploading songs in saveSongs:', err);
    });
    if (updatedLogs) {
      uploadLogsToSupabase(updatedLogs).catch(err => {
        console.error('[Supabase Sync] Error uploading logs in saveSongs:', err);
      });
    }
  }
}

export function toggleSongLock(songId: string, actor?: Student): void {
  if (typeof window === 'undefined') return;
  if (actor?.role === 'moderator') return;
  const songsRaw = safeGetItem('pink69_songs');
  if (!songsRaw) return;
  try {
    const songs: Song[] = JSON.parse(songsRaw);
    let updatedLogs: ActivityLog[] | null = null;
    const updatedSongs = songs.map(s => {
      if (s.id === songId) {
        const nextLocked = !s.isLocked;
        if (actor) {
          const { logs } = getStoredData();
          const roleLabel = getRoleLabel(actor.role);
          const newLog = {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            actorId: actor.id,
            actorName: actor.fullname,
            actorRole: roleLabel,
            action: nextLocked ? `ล็อคเพลง "${s.title}" เพื่อป้องกันการแก้ไข` : `ปลดล็อคเพลง "${s.title}" ให้สามารถแก้ไขได้`
          };
          updatedLogs = [newLog, ...logs].slice(0, 200);
          safeSetItem('pink69_logs', JSON.stringify(updatedLogs));
        }
        return { ...s, isLocked: nextLocked };
      }
      return s;
    });
    safeSetItem('pink69_songs', JSON.stringify(updatedSongs));
    notify();

    if (supabase) {
      uploadSongsToSupabase(updatedSongs).catch(err => {
        console.error('[Supabase Sync] Error uploading songs in toggleSongLock:', err);
      });
      if (updatedLogs) {
        uploadLogsToSupabase(updatedLogs).catch(err => {
          console.error('[Supabase Sync] Error uploading logs in toggleSongLock:', err);
        });
      }
    }
  } catch (e) {
    console.error('Failed to toggle song lock:', e);
  }
}

export function saveSystemConfig(config: {
  controllers?: string[];
  moderators?: string[];
  standOpen?: boolean;
  standLocked?: boolean;
  specialDuties?: SpecialDuty[];
  athleteQr?: { qrCode: string; lineLink: string };
  processionQr?: { qrCode: string; lineLink: string };
  processionLimit?: number;
  processionTitle?: string;
}, actor?: Student, action?: string) {
  if (typeof window === 'undefined') return;
  
  if (config.controllers !== undefined) {
    safeSetItem('pink69_controllers', JSON.stringify(config.controllers));
  }
  if (config.moderators !== undefined) {
    safeSetItem('pink69_moderators', JSON.stringify(config.moderators));
  }
  if (config.standOpen !== undefined) {
    safeSetItem('pink69_stand_open', JSON.stringify(config.standOpen));
  }
  if (config.standLocked !== undefined) {
    safeSetItem('pink69_stand_locked', JSON.stringify(config.standLocked));
  }
  if (config.specialDuties !== undefined) {
    safeSetItem('pink69_special_duties', JSON.stringify(config.specialDuties));
  }
  if (config.athleteQr !== undefined) {
    safeSetItem('pink69_athlete_qr', JSON.stringify(config.athleteQr));
  }
  if (config.processionQr !== undefined) {
    safeSetItem('pink69_procession_qr', JSON.stringify(config.processionQr));
  }
  if (config.processionLimit !== undefined) {
    safeSetItem('pink69_procession_limit', String(config.processionLimit));
  }
  if (config.processionTitle !== undefined) {
    safeSetItem('pink69_procession_title', config.processionTitle);
  }

  let updatedLogs: ActivityLog[] | null = null;
  if (actor && action) {
    const { logs } = getStoredData();
    const roleLabel = getRoleLabel(actor.role);
    
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action,
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
    safeSetItem('pink69_logs', JSON.stringify(updatedLogs));
  }

  notify();

  if (supabase) {
    const promises: PromiseLike<any>[] = [];
    if (config.controllers !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'controllers', value: config.controllers }));
    }
    if (config.moderators !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'moderators', value: config.moderators }));
    }
    if (config.standOpen !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'stand_open', value: config.standOpen }));
    }
    if (config.standLocked !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'stand_locked', value: config.standLocked }));
    }
    if (config.specialDuties !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'special_duties', value: config.specialDuties }));
    }
    if (config.athleteQr !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'athlete_qr', value: config.athleteQr }));
    }
    if (config.processionQr !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'procession_qr', value: config.processionQr }));
    }
    if (config.processionLimit !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'procession_limit', value: config.processionLimit }));
    }
    if (config.processionTitle !== undefined) {
      promises.push(supabase.from('pink69_config').upsert({ key: 'procession_title', value: config.processionTitle }));
    }
    
    Promise.all(promises).catch(err => {
      console.error('[Supabase Sync] Error during saveSystemConfig upload:', err);
    });

    if (updatedLogs) {
      uploadLogsToSupabase(updatedLogs).catch(err => {
        console.error('[Supabase Sync] Error during saveSystemConfig logs upload:', err);
      });
    }
  }
}

// ----------------------------------------------------------
// Activity Log helpers
// ----------------------------------------------------------
export function appendLog(actor: Student, action: string, targetName?: string) {
  const { students, sports, announcements, logs } = getStoredData();
  const roleLabel = getRoleLabel(actor.role);

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
    const roleLabel = getRoleLabel(actor.role);
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
function syncLegacyDutyFields(student: Student): Student {
  const next = { ...student };
  if (!next.duties) next.duties = {};
  
  const dutyEntries = Object.entries(next.duties);
  const approvedEntry = dutyEntries.find(([_, status]) => status === 'approved');
  if (approvedEntry) {
    next.assigned_duty = approvedEntry[0];
    next.duty_status = 'approved';
  } else {
    const pendingEntry = dutyEntries.find(([_, status]) => status === 'pending_selection');
    if (pendingEntry) {
      next.assigned_duty = pendingEntry[0];
      next.duty_status = 'pending_selection';
    } else {
      next.assigned_duty = 'none';
      next.duty_status = 'none';
      delete next.seat;
    }
  }
  return next;
}

export function updateStudent(studentId: string, updates: Partial<Student>, actor?: Student, logAction?: string) {
  if (actor?.role === 'moderator' && actor.id !== studentId) return;
  const { students, sports, announcements, logs } = getStoredData();
  const target = students.find((s: Student) => s.id === studentId);
  const nextStudents = students.map((s: Student) => {
    if (s.id === studentId) {
      let next = { ...s, ...updates };
      
      if (updates.duties) {
        if (Object.keys(updates.duties).length === 0) {
          next.duties = {};
        } else {
          next.duties = { ...(s.duties || {}), ...updates.duties };
          Object.keys(next.duties).forEach(k => {
            if (next.duties![k] === 'none') {
              delete next.duties![k];
            }
          });
        }
      }
      
      if (updates.assigned_duty !== undefined || updates.duty_status !== undefined) {
        const d = updates.assigned_duty !== undefined ? updates.assigned_duty : s.assigned_duty;
        const ds = updates.duty_status !== undefined ? updates.duty_status : s.duty_status;
        if (d === 'none' || ds === 'none') {
          next.duties = {};
        } else {
          next.duties = { ...(s.duties || {}), [d]: ds };
        }
      }
      
      next = syncLegacyDutyFields(next);
      return next;
    }
    return s;
  });

  // Handle student ID updates across SportsEvent lineups and controllers
  let nextSports = sports;
  if (updates.id !== undefined && updates.id !== studentId) {
    // 1. Update ID in sports lineup
    nextSports = sports.map((event: SportsEvent) => {
      if (event.lineup.includes(studentId)) {
        return {
          ...event,
          lineup: event.lineup.map(id => id === studentId ? updates.id! : id)
        };
      }
      return event;
    });

    // 2. Update ID in controllers
    if (typeof window !== 'undefined') {
      const controllersRaw = safeGetItem('pink69_controllers');
      if (controllersRaw) {
        try {
          const controllers: string[] = JSON.parse(controllersRaw);
          if (controllers.includes(studentId)) {
            const nextControllers = controllers.map(id => id === studentId ? updates.id! : id);
            safeSetItem('pink69_controllers', JSON.stringify(nextControllers));
          }
        } catch (e) {
          console.error('Failed to parse controllers for ID update:', e);
        }
      }
    }
  }

  let updatedLogs = logs;
  if (actor && logAction) {
    const roleLabel = getRoleLabel(actor.role);

    let details: string[] = [];
    if (updates.fullname !== undefined && updates.fullname !== target?.fullname) {
      details.push(`ชื่อ: "${target?.fullname || '-'}" -> "${updates.fullname}"`);
    }
    if (updates.id !== undefined && updates.id !== target?.id) {
      details.push(`รหัสประจำตัว: "${target?.id || '-'}" -> "${updates.id}"`);
    }
    if (updates.classroom !== undefined && updates.classroom !== target?.classroom) {
      details.push(`ห้องเรียน: "${target?.classroom || '-'}" -> "${updates.classroom}"`);
    }
    if (updates.number !== undefined && updates.number !== target?.number) {
      details.push(`เลขที่: "${target?.number || '-'}" -> "${updates.number}"`);
    }

    let finalAction = logAction;
    if (details.length > 0) {
      finalAction = `${logAction} [${details.join(', ')}]`;
    }

    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: finalAction,
      targetName: target?.fullname
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, nextSports, announcements, updatedLogs);
}

export function deleteStudent(studentId: string, actor?: Student) {
  if (actor?.role === 'moderator') return;
  const { students, sports, announcements, logs } = getStoredData();
  const target = students.find((s: Student) => s.id === studentId);
  let nextStudents = students.filter((s: Student) => s.id !== studentId);



  let updatedLogs = logs;
  if (actor && target) {
    const roleLabel = getRoleLabel(actor.role);
      
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: `ลบสมาชิกจากทะเบียนสี (รหัส: ${target.id}, ชั้น: ${target.classroom || '-'}, เลขที่: ${target.number || '-'})`,
      targetName: target.fullname
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, sports, announcements, updatedLogs);
}

export function updateMultipleStudents(studentIds: string[], updates: Partial<Student>, actor?: Student, logAction?: string) {
  if (actor?.role === 'moderator') return;
  const { students, sports, announcements, logs } = getStoredData();
  const targetNames: string[] = [];
  
  const nextStudents = students.map((s: Student) => {
    if (studentIds.includes(s.id)) {
      targetNames.push(s.fullname);
      let next = { ...s, ...updates };
      
      if (updates.duties) {
        next.duties = { ...(s.duties || {}), ...updates.duties };
        Object.keys(next.duties).forEach(k => {
          if (next.duties![k] === 'none') {
            delete next.duties![k];
          }
        });
      }
      
      if (updates.assigned_duty !== undefined || updates.duty_status !== undefined) {
        const d = updates.assigned_duty !== undefined ? updates.assigned_duty : s.assigned_duty;
        const ds = updates.duty_status !== undefined ? updates.duty_status : s.duty_status;
        if (d === 'none' || ds === 'none') {
          next.duties = {};
        } else {
          next.duties = { ...(s.duties || {}), [d]: ds };
        }
      }
      
      next = syncLegacyDutyFields(next);
      return next;
    }
    return s;
  });

  let updatedLogs = logs;
  if (actor && logAction) {
    const roleLabel = getRoleLabel(actor.role);
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
export function bookSeat(studentId: string, seatLabel: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  
  // Clean old seat of this student
  let nextStudents = students.map((s: Student) => {
    if (s.seat === seatLabel) {
      return { 
        ...s, 
        seat: undefined, 
        assigned_duty: 'stand' as const, 
        duty_status: 'approved' as const,
        duties: { ...(s.duties || {}), stand: 'approved' as const }
      };
    }
    return s;
  });

  const targetStudent = students.find((s: Student) => s.id === studentId);

  // Assign new seat
  nextStudents = nextStudents.map((s: Student) => {
    if (s.id === studentId) {
      return { 
        ...s, 
        seat: seatLabel, 
        assigned_duty: 'stand' as const, 
        duty_status: 'approved' as const,
        duties: { ...(s.duties || {}), stand: 'approved' as const }
      };
    }
    return s;
  });

  let updatedLogs = logs;
  if (actor && targetStudent) {
    const roleLabel = getRoleLabel(actor.role);
      
    const isSelf = actor.id === studentId;
    const actionText = isSelf 
      ? `จองที่นั่งสแตนเชียร์ รหัส ${seatLabel}` 
      : `จัดสรรที่นั่งสแตนเชียร์ รหัส ${seatLabel}`;
      
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: actionText,
      targetName: targetStudent.fullname
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, sports, announcements, updatedLogs);
}

export function releaseSeat(seatLabel: string, actor?: Student) {
  const { students, sports, announcements, logs } = getStoredData();
  const owner = students.find((s: Student) => s.seat === seatLabel);
  
  const nextStudents = students.map((s: Student) => {
    if (s.seat === seatLabel) {
      return { 
        ...s, 
        seat: undefined, 
        assigned_duty: 'stand' as const, 
        duty_status: 'approved' as const,
        duties: { ...(s.duties || {}), stand: 'approved' as const }
      };
    }
    return s;
  });

  let updatedLogs = logs;
  if (actor && owner) {
    const roleLabel = getRoleLabel(actor.role);
      
    const isSelf = actor.id === owner.id;
    const actionText = isSelf 
      ? `ยกเลิกการจองที่นั่งสแตนเชียร์ รหัส ${seatLabel}` 
      : `ปลดสมาชิกออกจากที่นั่งสแตนเชียร์ รหัส ${seatLabel}`;
      
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: roleLabel,
      action: actionText,
      targetName: owner.fullname
    };
    updatedLogs = [newLog, ...logs].slice(0, 200);
  }

  saveAll(nextStudents, sports, announcements, updatedLogs);
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
    const roleLabel = getRoleLabel(actor.role);
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
    const roleLabel = getRoleLabel(actor.role);
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
    const roleLabel = getRoleLabel(actor.role);
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
    const roleLabel = getRoleLabel(actor.role);
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
  const { logs, announcements: currentAnnouncements } = getStoredData();
  safeSetItem('pink69_students', JSON.stringify(students));
  safeSetItem('pink69_sports', JSON.stringify(sports));
  if (announcements) {
    safeSetItem('pink69_announcements', JSON.stringify(announcements));
  }
  safeSetItem('pink69_logs', JSON.stringify(logs));
  notify();

  if (supabase) {
    uploadAllToSupabase(students, sports, announcements || currentAnnouncements, logs).catch(err => {
      console.error('[Supabase Sync] Error uploading in saveStoredData:', err);
    });
  }
}

export function saveSystemReports(reports: SystemReport[]) {
  if (typeof window === 'undefined') return;
  safeSetItem('pink69_reports', JSON.stringify(reports));
  notify();

  if (supabase) {
    uploadReportsToSupabase(reports).catch(err => {
      console.error('[Supabase Sync] Error uploading reports in saveSystemReports:', err);
    });
  }
}

export function importStudentsData(newStudents: Student[], mode: 'merge' | 'replace', actor?: Student) {
  if (typeof window === 'undefined') return;
  const { students: oldStudents, sports, announcements, logs, controllers } = getStoredData();
  
  let finalStudents: Student[] = [];
  if (mode === 'replace') {
    // Keep all existing controllers so they don't get logged out or deleted
    const activeControllers = oldStudents.filter((s: Student) => controllers.includes(s.id));
    // Filter out new student items that duplicate the controller IDs
    const newStudentsFiltered = newStudents.filter((ns: Student) => !activeControllers.some((ac: Student) => ac.id === ns.id));
    finalStudents = [...activeControllers, ...newStudentsFiltered];
  } else {
    // โหมด Merge (อัปเดตข้อมูลเดิม / เพิ่มตัวใหม่)
    const studentMap = new Map<string, Student>();
    oldStudents.forEach((s: Student) => studentMap.set(s.id, s));
    newStudents.forEach((s: Student) => {
      const existing = studentMap.get(s.id);
      if (existing) {
        // อัปเดตข้อมูลแต่รักษาฟิลด์สำคัญเช่น seat หรือ duties เดิมหากตัวใหม่ไม่ได้เจาะจง
        const updatedDuties = { ...(existing.duties || {}), ...(s.duties || {}) };
        studentMap.set(s.id, { 
          ...existing, 
          ...s,
          duties: Object.keys(updatedDuties).length > 0 ? updatedDuties : existing.duties
        });
      } else {
        studentMap.set(s.id, s);
      }
    });
    finalStudents = Array.from(studentMap.values());
  }

  // สร้าง Log ประวัติการทำงาน
  let actionText = '';
  let targetNameText: string | undefined = undefined;
  if (newStudents.length === 1) {
    const targetStudent = newStudents[0];
    actionText = `เพิ่มสมาชิกใหม่เข้าระบบ (รหัส: ${targetStudent.id}, ชั้น: ${targetStudent.classroom || '-'}, เลขที่: ${targetStudent.number || '-'})`;
    targetNameText = targetStudent.fullname;
  } else {
    actionText = `นำเข้าข้อมูลรายชื่อสมาชิกจำนวน ${newStudents.length} คน (โหมด: ${mode === 'merge' ? 'ผสานข้อมูล' : 'แทนที่ทั้งหมด'})`;
  }

  const roleLabel = actor ? getRoleLabel(actor.role) : 'System';

  const newLog: ActivityLog = {
    id: 'log_' + Date.now(),
    timestamp: new Date().toISOString(),
    actorId: actor?.id || 'system',
    actorName: actor?.fullname || 'System',
    actorRole: roleLabel,
    action: actionText,
    targetName: targetNameText
  };

  const updatedLogs = [newLog, ...logs].slice(0, 200);
  saveAll(finalStudents, sports, announcements, updatedLogs);
}

// ==============================================================================
// Supabase Sync & Real-time Integration Helpers
// ==============================================================================

let isSupabaseLoaded = false;
let isSupabaseConnectedActual = false;

export function getSupabaseConnectionStatus(): boolean {
  return isSupabaseConnectedActual;
}

// 1. Helper สำหรับการอัปโหลดนักเรียนขึ้น Supabase (Batching)
export async function uploadStudentsToSupabase(students: Student[]) {
  if (!supabase) return;
  try {
    const batchSize = 100;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize).map(s => ({
        id: s.id,
        fullname: s.fullname,
        classroom: s.classroom,
        number: s.number,
        role: s.role,
        assigned_duty: s.assigned_duty,
        duty_status: s.duty_status,
        duties: s.duties || {},
        seat: s.seat || null,
        rejection_reason: s.rejection_reason || null,
        avatar: s.avatar || null,
        contact: s.contact || null
      }));
      const { error } = await supabase.from('pink69_students').upsert(batch);
      if (error) console.error('[Supabase Error] Failed to upload student batch:', error);
    }

    // ลบรายชื่อนักเรียนที่ไม่มีในเครื่อง
    const { data: dbStudents, error: fetchError } = await supabase.from('pink69_students').select('id');
    if (!fetchError && dbStudents) {
      const dbIds = dbStudents.map((row: any) => row.id);
      const currentIdsSet = new Set(students.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_students').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed students:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload students:', e);
  }
}

// 2. Helper สำหรับการส่งข้อมูลเพลง
export async function uploadSongsToSupabase(songs: Song[]) {
  if (!supabase) return;
  try {
    const songsData = songs.map(s => ({
      id: s.id,
      title: s.title,
      lyrics: s.lyrics,
      equipment: s.equipment,
      segments: s.segments,
      is_locked: s.isLocked
    }));
    const { error } = await supabase.from('pink69_songs').upsert(songsData);
    if (error) console.error('[Supabase Error] Failed to upload songs:', error);

    // ลบเพลงที่ไม่มีในเครื่อง
    const { data: dbSongs, error: fetchError } = await supabase.from('pink69_songs').select('id');
    if (!fetchError && dbSongs) {
      const dbIds = dbSongs.map((row: any) => row.id);
      const currentIdsSet = new Set(songs.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_songs').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed songs:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload songs:', e);
  }
}

// 3. Helper สำหรับรายงานปัญหา
export async function uploadReportsToSupabase(reports: SystemReport[]) {
  if (!supabase) return;
  try {
    const reportsData = reports.map(s => ({
      id: s.id,
      student_id: s.studentId,
      student_name: s.studentName,
      classroom: s.classroom,
      number: s.number,
      subject: s.subject,
      description: s.description,
      status: s.status,
      timestamp: s.timestamp
    }));
    const { error } = await supabase.from('pink69_reports').upsert(reportsData);
    if (error) console.error('[Supabase Error] Failed to upload reports:', error);

    // ลบรายงานที่ไม่มีในเครื่อง
    const { data: dbReports, error: fetchError } = await supabase.from('pink69_reports').select('id');
    if (!fetchError && dbReports) {
      const dbIds = dbReports.map((row: any) => row.id);
      const currentIdsSet = new Set(reports.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_reports').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed reports:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload reports:', e);
  }
}

// 3.5 Helper สำหรับการส่งข้อมูลกีฬา
export async function uploadSportsToSupabase(sports: SportsEvent[]) {
  if (!supabase) return;
  try {
    const sportsData = sports.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lineup: s.lineup || []
    }));
    const { error: upsertError } = await supabase.from('pink69_sports').upsert(sportsData);
    if (upsertError) console.error('[Supabase Error] Failed to upload sports:', upsertError);

    // ลบรายการกีฬาที่ไม่มีในเครื่อง
    const { data: dbSports, error: fetchError } = await supabase.from('pink69_sports').select('id');
    if (!fetchError && dbSports) {
      const dbIds = dbSports.map((row: any) => row.id);
      const currentIdsSet = new Set(sports.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_sports').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed sports:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload sports:', e);
  }
}

// 3.6 Helper สำหรับส่งประกาศ
export async function uploadAnnouncementsToSupabase(announcements: Announcement[]) {
  if (!supabase) return;
  try {
    const annData = announcements.map(s => ({
      id: s.id,
      title: s.title,
      content: s.content,
      image: s.image || null,
      date: s.date,
      created_by: s.createdBy
    }));
    const { error: upsertError } = await supabase.from('pink69_announcements').upsert(annData);
    if (upsertError) console.error('[Supabase Error] Failed to upload announcements:', upsertError);

    // ลบประกาศที่ไม่มีในเครื่อง
    const { data: dbAnn, error: fetchError } = await supabase.from('pink69_announcements').select('id');
    if (!fetchError && dbAnn) {
      const dbIds = dbAnn.map((row: any) => row.id);
      const currentIdsSet = new Set(announcements.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_announcements').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed announcements:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload announcements:', e);
  }
}

// 3.7 Helper สำหรับส่งบันทึกการทำงาน (Logs)
export async function uploadLogsToSupabase(logs: ActivityLog[]) {
  if (!supabase) return;
  try {
    if (logs.length === 0) {
      const { error: deleteError } = await supabase.from('pink69_logs').delete().neq('id', '');
      if (deleteError) console.error('[Supabase Error] Failed to clear logs:', deleteError);
      return;
    }

    const logsData = logs.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      actor_id: s.actorId,
      actor_name: s.actorName,
      actor_role: s.actorRole,
      action: s.action,
      target_name: s.targetName || null
    }));
    const { error: upsertError } = await supabase.from('pink69_logs').upsert(logsData);
    if (upsertError) console.error('[Supabase Error] Failed to upload logs:', upsertError);

    // ลบ Logs ที่เกินใน DB เพื่อให้สอดคล้องกับขีดจำกัด 200 รายการหลักในเครื่อง
    const { data: dbLogs, error: fetchError } = await supabase.from('pink69_logs').select('id');
    if (!fetchError && dbLogs) {
      const dbIds = dbLogs.map((row: any) => row.id);
      const currentIdsSet = new Set(logs.map(s => s.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_logs').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete old logs:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload logs:', e);
  }
}

// Helper สำหรับอัปโหลดข้อมูลเช็คชื่อเข้าบ้านสีขึ้น Supabase
export async function uploadColorHouseCheckinsToSupabase(checkins: ColorHouseCheckin[]) {
  if (!supabase) return;
  try {
    const dataToUpload = checkins.map(c => ({
      id: c.id,
      submitter_id: c.submitterId,
      submitter_name: c.submitterName,
      date: c.date,
      week_key: c.weekKey,
      photos: c.photos,
      tagged_student_ids: c.taggedStudentIds,
      tagged_student_names: c.taggedStudentNames,
      status: c.status,
      approved_by: c.approvedBy || null,
      approved_at: c.approvedAt || null,
      note: c.note || null
    }));

    const { error: upsertError } = await supabase.from('pink69_color_house_checkins').upsert(dataToUpload);
    if (upsertError) console.error('[Supabase Error] Failed to upload color house checkins:', upsertError);

    // ลบรายการเช็คชื่อที่ไม่มีในเครื่อง
    const { data: dbCheckins, error: fetchError } = await supabase.from('pink69_color_house_checkins').select('id');
    if (!fetchError && dbCheckins) {
      const dbIds = dbCheckins.map((row: any) => row.id);
      const currentIdsSet = new Set(checkins.map(c => c.id));
      const idsToDelete = dbIds.filter(id => !currentIdsSet.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('pink69_color_house_checkins').delete().in('id', idsToDelete);
        if (deleteError) console.error('[Supabase Error] Failed to delete removed color house checkins:', deleteError);
      }
    }
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload color house checkins:', e);
  }
}

export function saveColorHouseCheckins(
  checkins: ColorHouseCheckin[],
  actor?: Student,
  action?: string,
  targetName?: string
) {
  if (typeof window === 'undefined') return;
  safeSetItem('pink69_color_house_checkins', JSON.stringify(checkins));

  let updatedLogs: ActivityLog[] | null = null;
  if (actor && action) {
    const data = getStoredData();
    const newLog: ActivityLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.fullname,
      actorRole: getRoleLabel(actor.role),
      action: action,
      targetName: targetName
    };
    updatedLogs = [newLog, ...data.logs].slice(0, 200);
    safeSetItem('pink69_logs', JSON.stringify(updatedLogs));
  }

  notify();

  if (supabase) {
    uploadColorHouseCheckinsToSupabase(checkins).catch(err => {
      console.error('[Supabase Sync] Error uploading color house checkins:', err);
    });
    if (updatedLogs) {
      uploadLogsToSupabase(updatedLogs).catch(err => {
        console.error('[Supabase Sync] Error uploading logs after color house checkin:', err);
      });
    }
  }
}

// 4. Helper อัปโหลดทุกอย่าง (สำหรับ saveAll)
export async function uploadAllToSupabase(
  students: Student[],
  sports: SportsEvent[],
  announcements: Announcement[],
  logs: ActivityLog[]
) {
  if (!supabase) return;
  try {
    await uploadStudentsToSupabase(students);
    await uploadSportsToSupabase(sports);
    await uploadAnnouncementsToSupabase(announcements);
    await uploadLogsToSupabase(logs);
  } catch (e) {
    console.error('[Supabase Sync] Failed to upload all data:', e);
  }
}

// 5. ดึงตารางใดตารางหนึ่งแบบเฉพาะเจาะจงเมื่อเกิดการเปลี่ยนแบบเรียลไทม์
export async function syncSingleTable(table: string) {
  if (!supabase) {
    isSupabaseConnectedActual = false;
    return;
  }
  try {
    if (table === 'students') {
      const { data, error } = await supabase.from('pink69_students').select('*');
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          fullname: s.fullname,
          classroom: s.classroom,
          number: s.number != null ? String(s.number) : '',
          role: s.role,
          assigned_duty: s.assigned_duty,
          duty_status: s.duty_status,
          duties: s.duties || {},
          seat: s.seat || undefined,
          rejection_reason: s.rejection_reason || undefined,
          avatar: s.avatar || undefined,
          contact: s.contact || undefined
        }));
        safeSetItem('pink69_students', JSON.stringify(parsed));
      }
    } else if (table === 'sports') {
      const { data, error } = await supabase.from('pink69_sports').select('*');
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          lineup: s.lineup || []
        }));
        safeSetItem('pink69_sports', JSON.stringify(parsed));
      }
    } else if (table === 'announcements') {
      const { data, error } = await supabase.from('pink69_announcements').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          image: s.image || undefined,
          date: s.date,
          createdBy: s.created_by
        }));
        safeSetItem('pink69_announcements', JSON.stringify(parsed));
      }
    } else if (table === 'logs') {
      const { data, error } = await supabase.from('pink69_logs').select('*').order('timestamp', { ascending: false }).limit(200);
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          timestamp: s.timestamp,
          actorId: s.actor_id,
          actorName: s.actor_name,
          actorRole: s.actor_role,
          action: s.action,
          targetName: s.target_name || undefined
        }));
        safeSetItem('pink69_logs', JSON.stringify(parsed));
      }
    } else if (table === 'config') {
      const { data, error } = await supabase.from('pink69_config').select('*');
      if (!error && data) {
        data.forEach((item: any) => {
          if (item.key !== 'staff_passwords') {
            safeSetItem('pink69_' + item.key, JSON.stringify(item.value));
          }
        });
      }
    } else if (table === 'songs') {
      const { data, error } = await supabase.from('pink69_songs').select('*');
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          lyrics: s.lyrics,
          equipment: s.equipment || [],
          segments: s.segments || [],
          isLocked: s.is_locked
        }));
        safeSetItem('pink69_songs', JSON.stringify(parsed));
      }
    } else if (table === 'reports') {
      const { data, error } = await supabase.from('pink69_reports').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const parsed = data.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          studentName: s.student_name,
          classroom: s.classroom,
          number: s.number != null ? String(s.number) : '',
          subject: s.subject,
          description: s.description,
          status: s.status,
          timestamp: s.timestamp
        }));
        safeSetItem('pink69_reports', JSON.stringify(parsed));
      }
    } else if (table === 'color_house_checkins') {
      const { data, error } = await supabase.from('pink69_color_house_checkins').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const parsed = data.map((c: any) => ({
          id: c.id,
          submitterId: c.submitter_id,
          submitterName: c.submitter_name,
          date: c.date,
          weekKey: c.week_key,
          photos: c.photos || [],
          taggedStudentIds: c.tagged_student_ids || [],
          taggedStudentNames: c.tagged_student_names || [],
          status: c.status,
          approvedBy: c.approved_by || undefined,
          approvedAt: c.approved_at || undefined,
          note: c.note || undefined
        }));
        safeSetItem('pink69_color_house_checkins', JSON.stringify(parsed));
      }
    }
    notify();
  } catch (e) {
    console.error('[Realtime Sync] Failed to sync table:', table, e);
  }
}

// 6. ตั้งค่า Real-time Subscriptions ฟังการเปลี่ยนแปลงและอัปเดต React
const syncDebounceTimers = new Map<string, any>();

export function triggerDebouncedSync(table: string, delay = 800) {
  if (typeof window === 'undefined') return;
  const existing = syncDebounceTimers.get(table);
  if (existing) {
    clearTimeout(existing);
  }
  const timer = setTimeout(() => {
    syncSingleTable(table).catch(console.error);
    syncDebounceTimers.delete(table);
  }, delay);
  syncDebounceTimers.set(table, timer);
}

function setupRealtimeSubscriptions() {
  if (!supabase) return;

  supabase.channel('public:pink69_students')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_students' }, () => {
       triggerDebouncedSync('students');
    })
    .subscribe();

  supabase.channel('public:pink69_announcements')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_announcements' }, () => {
       triggerDebouncedSync('announcements');
    })
    .subscribe();

  supabase.channel('public:pink69_sports')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_sports' }, () => {
       triggerDebouncedSync('sports');
    })
    .subscribe();

  supabase.channel('public:pink69_logs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_logs' }, () => {
       triggerDebouncedSync('logs');
    })
    .subscribe();

  supabase.channel('public:pink69_config')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_config' }, () => {
       triggerDebouncedSync('config');
    })
    .subscribe();

  supabase.channel('public:pink69_songs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_songs' }, () => {
       triggerDebouncedSync('songs');
    })
    .subscribe();

  supabase.channel('public:pink69_reports')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_reports' }, () => {
       triggerDebouncedSync('reports');
    })
    .subscribe();

  supabase.channel('public:pink69_color_house_checkins')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pink69_color_house_checkins' }, () => {
       triggerDebouncedSync('color_house_checkins');
    })
    .subscribe();
}

// 7. โหลดข้อมูลจาก Supabase ครั้งแรกเมื่อเปิดหน้าเว็บ (Hydration)
export async function initializeSupabaseSync() {
  if (typeof window === 'undefined' || !isSupabaseConfigured || !supabase) {
    isSupabaseConnectedActual = false;
    return;
  }
  if (isSupabaseLoaded) return;
  
  console.log('[Supabase Sync] Initializing Supabase sync...');
  
  try {
    // 1. ดึงข้อมูลนักเรียน
    const { data: dbStudents, error: studentsError } = await supabase
      .from('pink69_students')
      .select('*');
      
    if (!studentsError) {
      const localRaw = safeGetItem('pink69_students');
      const localStudents = safeJsonParse(localRaw, INITIAL_STUDENTS);

      if (dbStudents && dbStudents.length > 0) {
        // เคารพข้อมูลในฐานข้อมูลเสมอเป็น Source of Truth เพื่อไม่ให้เกิดลูปการอัปเดตทับกันข้ามเครื่อง
        console.log('[Supabase Sync] Hydrating students from Supabase to Local...');
        const parsedStudents = dbStudents.map((s: any) => ({
          id: s.id,
          fullname: s.fullname,
          classroom: s.classroom,
          number: s.number != null ? String(s.number) : '',
          role: s.role,
          assigned_duty: s.assigned_duty,
          duty_status: s.duty_status,
          duties: s.duties || {},
          seat: s.seat || undefined,
          rejection_reason: s.rejection_reason || undefined,
          avatar: s.avatar || undefined,
          contact: s.contact || undefined
        }));
        safeSetItem('pink69_students', JSON.stringify(parsedStudents));
      } else {
        // อัปโหลดข้อมูลขึ้น DB เฉพาะเมื่อฐานข้อมูลว่างเปล่าจริงๆ เท่านั้น
        console.log('[Supabase Sync] Uploading initial local students to Supabase...');
        await uploadStudentsToSupabase(localStudents);
      }
    }

    // 2. ดึงข้อมูลกีฬา
    const { data: dbSports, error: sportsError } = await supabase
      .from('pink69_sports')
      .select('*');
      
    if (!sportsError) {
      if (dbSports && dbSports.length > 0) {
        const parsedSports = dbSports.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          lineup: s.lineup || []
        }));
        safeSetItem('pink69_sports', JSON.stringify(parsedSports));
      } else {
        const localRaw = safeGetItem('pink69_sports');
        const localSports = safeJsonParse(localRaw, INITIAL_SPORTS);
        const sportsData = localSports.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          lineup: s.lineup
        }));
        await supabase.from('pink69_sports').upsert(sportsData);
      }
    }

    // 3. ดึงประกาศ
    const { data: dbAnnouncements, error: annError } = await supabase
      .from('pink69_announcements')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!annError) {
      if (dbAnnouncements && dbAnnouncements.length > 0) {
        const parsedAnn = dbAnnouncements.map((s: any) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          image: s.image || undefined,
          date: s.date,
          createdBy: s.created_by
        }));
        safeSetItem('pink69_announcements', JSON.stringify(parsedAnn));
      } else {
        const localRaw = safeGetItem('pink69_announcements');
        const localAnn = safeJsonParse(localRaw, DEFAULT_ANNOUNCEMENTS);
        const annData = localAnn.map(s => ({
          id: s.id,
          title: s.title,
          content: s.content,
          image: s.image || null,
          date: s.date,
          created_by: s.createdBy
        }));
        await supabase.from('pink69_announcements').upsert(annData);
      }
    }

    // 4. ดึง Logs
    const { data: dbLogs, error: logsError } = await supabase
      .from('pink69_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);
      
    if (!logsError) {
      if (dbLogs && dbLogs.length > 0) {
        const parsedLogs = dbLogs.map((s: any) => ({
          id: s.id,
          timestamp: s.timestamp,
          actorId: s.actor_id,
          actorName: s.actor_name,
          actorRole: s.actor_role,
          action: s.action,
          targetName: s.target_name || undefined
        }));
        safeSetItem('pink69_logs', JSON.stringify(parsedLogs));
      }
    }

    // 5. ดึงข้อมูลการตั้งค่า Config
    const { data: dbConfig, error: configError } = await supabase
      .from('pink69_config')
      .select('*');
      
    if (!configError && dbConfig && dbConfig.length > 0) {
      const localSpecialDutiesRaw = safeGetItem('pink69_special_duties');
      const localSpecialDuties = safeJsonParse(localSpecialDutiesRaw, DEFAULT_SPECIAL_DUTIES);

      const dbSpecialDutiesItem = dbConfig.find((item: any) => item.key === 'special_duties');
      const dbSpecialDuties = dbSpecialDutiesItem ? dbSpecialDutiesItem.value : DEFAULT_SPECIAL_DUTIES;

      const localLen = Array.isArray(localSpecialDuties) ? localSpecialDuties.length : 0;
      const dbLen = Array.isArray(dbSpecialDuties) ? dbSpecialDuties.length : 0;

      console.log(`[Supabase Sync] Special duties count - Local: ${localLen}, DB: ${dbLen}`);

      if (localLen > dbLen) {
        // อัปโหลด config ตัวที่เครื่องมีมากกว่าขึ้นฐานข้อมูล
        console.log('[Supabase Sync] Uploading richer local special_duties to Supabase config...');
        await supabase.from('pink69_config').upsert({ key: 'special_duties', value: localSpecialDuties });
        
        // สำหรับ key อื่นๆ ดึงจาก DB ตามปกติ ยกเว้นตัวที่เราเพิ่งอัปโหลด
        dbConfig.forEach((item: any) => {
          if (item.key !== 'staff_passwords' && item.key !== 'special_duties') {
            safeSetItem('pink69_' + item.key, JSON.stringify(item.value));
          }
        });
        // บันทึกตัวพิเศษของเราในเครื่องด้วย
        safeSetItem('pink69_special_duties', JSON.stringify(localSpecialDuties));
      } else {
        // ดึงจาก DB มาเซฟลงเครื่องตามปกติ
        dbConfig.forEach((item: any) => {
          if (item.key !== 'staff_passwords') {
            safeSetItem('pink69_' + item.key, JSON.stringify(item.value));
          }
        });
      }
    } else {
      // อัปโหลด config เริ่มต้น
      const configItems = [
        { key: 'stand_open', value: false },
        { key: 'stand_locked', value: false },
        { key: 'athlete_qr', value: { qrCode: '', lineLink: '' } },
        { key: 'procession_qr', value: { qrCode: '', lineLink: '' } },
        { key: 'procession_limit', value: 150 },
        { key: 'procession_title', value: 'ขบวนพาเหรด' },
        { key: 'controllers', value: ['39967', '39998', '40059', '40092'] },
        { key: 'moderators', value: [] },
        { key: 'special_duties', value: DEFAULT_SPECIAL_DUTIES },
        { key: 'staff_passwords', value: {} }
      ];
      for (const item of configItems) {
        await supabase.from('pink69_config').upsert({ key: item.key, value: item.value });
      }
    }

    // 6. ดึงข้อมูลเพลง (Songs)
    const { data: dbSongs, error: songsError } = await supabase
      .from('pink69_songs')
      .select('*');
      
    if (!songsError) {
      if (dbSongs && dbSongs.length > 0) {
        const parsedSongs = dbSongs.map((s: any) => ({
          id: s.id,
          title: s.title,
          lyrics: s.lyrics,
          equipment: s.equipment || [],
          segments: s.segments || [],
          isLocked: s.is_locked
        }));
        safeSetItem('pink69_songs', JSON.stringify(parsedSongs));
      } else {
        const localRaw = safeGetItem('pink69_songs');
        const localSongs = safeJsonParse(localRaw, DEFAULT_SONGS);
        await uploadSongsToSupabase(localSongs);
      }
    }

    // 7. ดึงข้อมูลรายงาน (Reports)
    const { data: dbReports, error: reportsError } = await supabase
      .from('pink69_reports')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!reportsError) {
      if (dbReports && dbReports.length > 0) {
        const parsedReports = dbReports.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          studentName: s.student_name,
          classroom: s.classroom,
          number: s.number != null ? String(s.number) : '',
          subject: s.subject,
          description: s.description,
          status: s.status,
          timestamp: s.timestamp
        }));
        safeSetItem('pink69_reports', JSON.stringify(parsedReports));
      }
    }

    // 8. ดึงข้อมูลเช็คชื่อเข้าบ้านสี (Color House Checkins)
    const { data: dbCheckins, error: checkinsError } = await supabase
      .from('pink69_color_house_checkins')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!checkinsError) {
      if (dbCheckins && dbCheckins.length > 0) {
        const parsedCheckins = dbCheckins.map((c: any) => ({
          id: c.id,
          submitterId: c.submitter_id,
          submitterName: c.submitter_name,
          date: c.date,
          weekKey: c.week_key,
          photos: c.photos || [],
          taggedStudentIds: c.tagged_student_ids || [],
          taggedStudentNames: c.tagged_student_names || [],
          status: c.status,
          approvedBy: c.approved_by || undefined,
          approvedAt: c.approved_at || undefined,
          note: c.note || undefined
        }));
        safeSetItem('pink69_color_house_checkins', JSON.stringify(parsedCheckins));
      } else {
        const localRaw = safeGetItem('pink69_color_house_checkins');
        const localCheckins = safeJsonParse(localRaw, []);
        if (localCheckins.length > 0) {
          await uploadColorHouseCheckinsToSupabase(localCheckins);
        }
      }
    }

    isSupabaseLoaded = true;
    isSupabaseConnectedActual = true;
    console.log('[Supabase Sync] Sync initialized successfully.');
    notify();
    
    // เริ่ม Real-time Subscriptions
    setupRealtimeSubscriptions();



  } catch (err) {
    isSupabaseConnectedActual = false;
    notify();
  }
}

export function updateStudentContact(studentId: string, contact: string) {
  const current = getStoredData();
  const nextStudents = current.students.map((s: Student) => 
    s.id === studentId ? { ...s, contact } : s
  );
  
  saveAll(nextStudents, current.sports, current.announcements, current.logs);
}

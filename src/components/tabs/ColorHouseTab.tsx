'use client';

import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Search, 
  Plus, 
  ThumbsUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { ColorHouseCheckin, getRoleLabel } from '../../app/store';
import { Student } from '../../app/mockData';
import { Panel } from '../ui';
import { fileToDataUrl } from '../../lib/helpers';

interface ColorHouseTabProps {
  data: { 
    students: Student[]; 
    colorHouseCheckins: ColorHouseCheckin[];
  };
  currentUser: Student;
  isController: boolean;
  isModerator: boolean;
  onSubmitCheckin: (photos: string[], taggedIds: string[]) => Promise<void>;
  onApproveCheckin: (id: string, note?: string) => Promise<void>;
  onRejectCheckin: (id: string, note?: string) => Promise<void>;
}

// ฟังก์ชันบีบอัดรูปภาพฝั่ง Client
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDimension = 800; // บีบไม่เกิน 800px

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // วาดรูปและบีบอัดคุณภาพลงเหลือ 70% เป็น jpeg
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// ฟังก์ชันคำนวณหมายเลขสัปดาห์ ISO-8601
export function getISOWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
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
}

export function ColorHouseTab({
  data,
  currentUser,
  isController,
  isModerator,
  onSubmitCheckin,
  onApproveCheckin,
  onRejectCheckin,
}: ColorHouseTabProps) {
  // คำนวณสัปดาห์ปัจจุบัน
  const currentWeekKey = useMemo(() => getISOWeekKey(), []);

  // States
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taggedIds, setTaggedIds] = useState<string[]>([currentUser.id]); // ตั้งต้นแท็กตัวเอง
  const [submitting, setSubmitting] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  
  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Auto-bind stream when video element mounts
  React.useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  // Clean up camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async (facing: 'user' | 'environment' = 'environment') => {
    setIsCameraOpen(true);
    setCameraFacingMode(facing);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
    } catch (err) {
      console.error('Error starting camera:', err);
      alert('ไม่สามารถเข้าถึงกล้องถ่ายรูปได้ครับ กรุณาอนุญาตสิทธิ์การใช้กล้องในเบราว์เซอร์ของคุณก่อนนะครับ');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const switchCamera = () => {
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    startCamera(nextFacing);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !cameraStream) return;
    
    setIsCompressing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (cameraFacingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const compressed = await compressImage(dataUrl);
        setSelectedPhotos(prev => [...prev, compressed]);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      setIsCompressing(false);
      stopCamera();
    }
  };
  
  // States สำหรับสตาฟกรอก Note ตอนไม่อนุมัติ
  const [rejectionNoteId, setRejectionNoteId] = useState<string | null>(null);
  const [rejectNoteText, setRejectNoteText] = useState('');

  // States สำหรับตารางสรุปสถิตินักเรียน ม.5 ขาดเช็คชื่อ
  const [statsSearchQuery, setStatsSearchQuery] = useState('');
  const [statsFilterStatus, setStatsFilterStatus] = useState<'all' | 'lacking' | 'completed'>('all');

  // สลับดูสัปดาห์ย้อนหลัง
  const [selectedWeekKey, setSelectedWeekKey] = useState(currentWeekKey);

  // 1. ดึงรายชื่อ ม.5 ทั้งหมดเพื่อเอามาใช้แท็ก (ยกเว้นตัวเองที่แท็กไปแล้วโดยปริยาย)
  const m5Students = useMemo(() => {
    return data.students.filter((s: Student) => {
      const isM5Class = s.classroom && s.classroom.startsWith('ม.5');
      const isM5Role = s.role === 'student_m5' || s.role === 'staff_m5';
      return (isM5Class || isM5Role) && s.id !== currentUser.id;
    });
  }, [data.students, currentUser.id]);

  // ผลลัพธ์ตัวเลือกชื่อที่ผ่านการค้นหา
  const filteredSearchList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return m5Students.filter(s => 
      !taggedIds.includes(s.id) && 
      (s.fullname.toLowerCase().includes(query) || s.id.includes(query))
    ).slice(0, 5); // ลิมิตแสดง 5 รายการให้สะอาดตา
  }, [m5Students, searchQuery, taggedIds]);

  // ดึงสัปดาห์ทั้งหมดที่มีในประวัติ หรือรวมสัปดาห์ปัจจุบันเข้าไปด้วย
  const availableWeeks = useMemo(() => {
    const weeks = new Set<string>();
    weeks.add(currentWeekKey); // ต้องมีสัปดาห์ปัจจุบันเสมอ
    data.colorHouseCheckins.forEach(c => {
      if (c.weekKey) {
        weeks.add(c.weekKey);
      }
    });
    return Array.from(weeks).sort((a, b) => b.localeCompare(a)); // เรียงสัปดาห์ล่าสุดขึ้นก่อน
  }, [data.colorHouseCheckins, currentWeekKey]);

  // ดึงรายการที่ตัวเองเช็คชื่อ
  const myCheckins = useMemo(() => {
    return data.colorHouseCheckins.filter(c => 
      c.submitterId === currentUser.id || c.taggedStudentIds.includes(currentUser.id)
    );
  }, [data.colorHouseCheckins, currentUser.id]);

  // คำนวณจำนวนครั้งที่ "อนุมัติแล้ว" ในสัปดาห์ที่เลือก
  const approvedCheckinsThisWeekCount = useMemo(() => {
    return myCheckins.filter(c => c.weekKey === selectedWeekKey && c.status === 'approved').length;
  }, [myCheckins, selectedWeekKey]);

  // คำนวณความคืบหน้าของ ม.5 ทุกคนในสัปดาห์ที่เลือก
  const m5AttendanceStats = useMemo(() => {
    const allM5 = data.students.filter((s: Student) => {
      const isM5Class = s.classroom && s.classroom.startsWith('ม.5');
      const isM5Role = s.role === 'student_m5' || s.role === 'staff_m5';
      return isM5Class || isM5Role;
    });

    return allM5.map(student => {
      const approvedCount = data.colorHouseCheckins.filter(c => 
        c.status === 'approved' && 
        c.weekKey === selectedWeekKey &&
        (c.submitterId === student.id || c.taggedStudentIds.includes(student.id))
      ).length;

      const lacks = Math.max(0, 3 - approvedCount);

      return {
        student,
        approvedCount,
        lacks
      };
    });
  }, [data.students, data.colorHouseCheckins, selectedWeekKey]);

  // ผลสถิติที่กรองและเรียงลำดับแล้ว
  const filteredStats = useMemo(() => {
    let list = m5AttendanceStats;

    if (statsSearchQuery.trim()) {
      const query = statsSearchQuery.toLowerCase();
      list = list.filter(item => 
        item.student.fullname.toLowerCase().includes(query) || 
        item.student.id.includes(query) ||
        (item.student.classroom && item.student.classroom.toLowerCase().includes(query))
      );
    }

    if (statsFilterStatus === 'lacking') {
      list = list.filter(item => item.lacks > 0);
    } else if (statsFilterStatus === 'completed') {
      list = list.filter(item => item.lacks === 0);
    }

    return [...list].sort((a, b) => {
      const classA = parseClassroom(a.student.classroom || '');
      const classB = parseClassroom(b.student.classroom || '');
      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
      if (classA.room !== classB.room) return classA.room - classB.room;
      const numA = parseInt(a.student.number, 10) || 0;
      const numB = parseInt(b.student.number, 10) || 0;
      return numA - numB;
    });
  }, [m5AttendanceStats, statsSearchQuery, statsFilterStatus]);

  // คำนวณสรุปรวมภาพสถิติของคณะสี ม.5 ทั้งหมด
  const statsSummary = useMemo(() => {
    const total = m5AttendanceStats.length;
    const completed = m5AttendanceStats.filter(item => item.lacks === 0).length;
    const lacking = total - completed;
    return { total, completed, lacking };
  }, [m5AttendanceStats]);

  // จัดการอัปโหลดไฟล์รูปภาพพร้อมย่อขนาด
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsCompressing(true);
    const newPhotos: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const rawBase64 = await fileToDataUrl(files[i]);
        const compressed = await compressImage(rawBase64);
        newPhotos.push(compressed);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }
    
    setSelectedPhotos(prev => [...prev, ...newPhotos]);
    setIsCompressing(false);
  };

  // ลบรูปภาพออกจากฟอร์ม
  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // เพิ่มคนที่แท็ก
  const handleAddTag = (student: Student) => {
    if (!taggedIds.includes(student.id)) {
      setTaggedIds(prev => [...prev, student.id]);
    }
    setSearchQuery('');
  };

  // เอาคนที่แท็กออก (ห้ามเอาตัวเองออก)
  const handleRemoveTag = (studentId: string) => {
    if (studentId === currentUser.id) return;
    setTaggedIds(prev => prev.filter(id => id !== studentId));
  };

  // ส่งข้อมูลเข้าเซิร์ฟเวอร์
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      alert('กรุณาอัปโหลดรูปภาพยืนยันการเข้าบ้านสีอย่างน้อย 1 รูปครับ!');
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmitCheckin(selectedPhotos, taggedIds);
      // เคลียร์ฟอร์มสำเร็จ
      setSelectedPhotos([]);
      setTaggedIds([currentUser.id]);
      alert('ส่งเช็คชื่อเข้าบ้านสีเสร็จสิ้น! รอพี่สตาฟผู้ควบคุมอนุมัติความถูกต้องครับมึง');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  // ดึงรายการรออนุมัติทั้งหมด (สำหรับผู้ดูแล/ผู้ควบคุม)
  const pendingCheckins = useMemo(() => {
    return data.colorHouseCheckins.filter(c => c.status === 'pending');
  }, [data.colorHouseCheckins]);

  // ฟังก์ชันช่วยเหลือหาชื่อเต็มจาก ID นักเรียน
  const getStudentName = (id: string) => {
    if (id === currentUser.id) return currentUser.fullname;
    const found = data.students.find(s => s.id === id);
    return found ? found.fullname : `รหัส ${id}`;
  };

  return (
    <div className="space-y-6">
      {/* ส่วนหัวหน้าเว็บ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">🏠 ระบบเช็คชื่อเข้าบ้านสี (ม.5)</h2>
          <p className="text-sm text-text-secondary">
            ส่งภาพรายงานตัวว่าอยู่ปฏิบัติหน้าที่บ้านสีจริงวันต่อวัน พร้อมแท็กเพื่อนร่วมเฟรม และเช็คประวัติตนเอง
          </p>
        </div>
        
        {/* ตัวเลือกเลือกสัปดาห์ */}
        <div className="bg-carbon-card border border-pink-primary/10 px-4 py-2 rounded-xl flex flex-col items-center md:items-end justify-center">
          <span className="text-[10px] text-text-tertiary block font-bold uppercase tracking-wider mb-1 font-sans">เลือกสัปดาห์ที่จะดู</span>
          <select
            value={selectedWeekKey}
            onChange={(e) => setSelectedWeekKey(e.target.value)}
            className="bg-carbon-dark border border-pink-primary/10 text-pink-accent font-black text-sm rounded-lg py-1 px-3 focus:outline-none cursor-pointer font-sans"
          >
            {availableWeeks.map(wk => (
              <option key={wk} value={wk} className="bg-carbon-card text-white">
                {wk} {wk === currentWeekKey ? '(ปัจจุบัน)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid หน้านักเรียน */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* คอลัมน์ซ้าย: ฟอร์มเช็คชื่อ & แดชบอร์ดสถิติ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* แดชบอร์ดสถิติสัปดาห์นี้ */}
          <div className="bg-gradient-to-br from-carbon-card to-carbon-dark border border-pink-primary/15 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-black text-pink-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
              📊 สถิติความเพียรในการเข้าบ้านสี
            </h3>
            
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <span className="text-3xl font-black text-white">
                  {approvedCheckinsThisWeekCount} <span className="text-sm text-text-secondary font-medium">/ 3 ครั้ง</span>
                </span>
                <p className="text-xs text-text-secondary mt-1">
                  ผ่านการตรวจสอบและอนุมัติแล้วในสัปดาห์นี้
                </p>
              </div>
              
              {approvedCheckinsThisWeekCount >= 3 ? (
                <div className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-bold animate-bounce">
                  <CheckCircle2 size={14} /> ผ่านเกณฑ์แล้ว
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Clock size={14} /> ขาดอีก {3 - approvedCheckinsThisWeekCount} ครั้ง
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-carbon-dark/80 rounded-full h-3 border border-pink-primary/5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-pink-primary to-pink-accent h-full transition-all duration-500"
                style={{ width: `${Math.min((approvedCheckinsThisWeekCount / 3) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* ฟอร์มเขียนส่งรายงานตัว */}
          <Panel title="📝 ส่งบันทึกรายงานตัวเข้าบ้านสี">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* จุดแนบรูปถ่าย */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  📸 อัปโหลดรูปภาพยืนยัน (แนบพร้อมกันได้หลายรูป)
                </label>
                
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex flex-col items-center justify-center w-24 h-24 bg-carbon-dark hover:bg-carbon-light/50 border border-pink-primary/10 rounded-2xl cursor-pointer hover:border-pink-primary/40 transition-all select-none group">
                    <Camera size={24} className="text-text-tertiary group-hover:text-pink-primary transition-colors mb-1" />
                    <span className="text-[10px] font-bold text-text-tertiary">แนบรูป</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handlePhotoUpload} 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="flex flex-col items-center justify-center w-24 h-24 bg-carbon-dark hover:bg-carbon-light/50 border border-pink-primary/10 rounded-2xl cursor-pointer hover:border-pink-primary/40 transition-all select-none group"
                  >
                    <Camera size={24} className="text-text-tertiary group-hover:text-pink-primary transition-colors mb-1" />
                    <span className="text-[10px] font-bold text-text-tertiary">ถ่ายรูป</span>
                  </button>

                  {/* แสดง Preview รูปแต่ละใบ */}
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-pink-primary/10 group">
                      <img 
                        src={photo} 
                        alt="upload preview" 
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedPreviewImage(photo)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {isCompressing && (
                    <div className="w-24 h-24 rounded-2xl border border-dashed border-pink-primary/20 flex flex-col items-center justify-center bg-carbon-dark animate-pulse">
                      <span className="loading-spinner text-pink-primary mb-1"></span>
                      <span className="text-[8px] text-text-tertiary">บีบอัดรูป...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ค้นหาและระบุเพื่อนร่วมภาพ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  👥 มีใครอยู่ในรูปนี้บ้าง? (แท็กเพื่อน ม.5 คณะสีชมพู)
                </label>
                
                {/* ชิปแสดงรายชื่อคนในรูป */}
                <div className="flex flex-wrap gap-2 py-1">
                  <div className="bg-pink-primary/20 text-pink-accent border border-pink-primary/30 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 select-none">
                    <span>{currentUser.fullname} (ตัวคุณ)</span>
                  </div>
                  
                  {taggedIds.filter(id => id !== currentUser.id).map(id => (
                    <div key={id} className="bg-carbon-light border border-pink-primary/5 text-text-primary rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <span>{getStudentName(id)}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(id)} 
                        className="text-text-tertiary hover:text-red-400 font-extrabold focus:outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* กล่องค้นหาเพื่อน */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="พิมพ์ชื่อเพื่อน ม.5 หรือเลขประจำตัว..."
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white"
                  />

                  {/* Dropdown ผลการหา */}
                  {filteredSearchList.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1.5 bg-carbon-card border border-pink-primary/20 rounded-xl overflow-hidden shadow-2xl">
                      {filteredSearchList.map(student => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleAddTag(student)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-pink-primary/10 text-white font-semibold transition-colors flex items-center justify-between border-b border-pink-primary/5 last:border-0 cursor-pointer"
                        >
                          <span>{student.fullname} ({student.classroom})</span>
                          <span className="text-[10px] text-pink-accent font-bold">แท็ก <Plus size={10} className="inline ml-0.5" /></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ปุ่มบันทึกส่งเรื่อง */}
              <button
                type="submit"
                disabled={submitting || selectedPhotos.length === 0 || isCompressing}
                className={`w-full py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer border ${
                  selectedPhotos.length > 0 && !isCompressing
                    ? 'bg-pink-primary hover:bg-pink-accent text-white border-pink-accent shadow-md shadow-pink-primary/10'
                    : 'bg-carbon-light/20 border-pink-primary/5 text-text-tertiary opacity-50 cursor-not-allowed'
                }`}
              >
                {submitting ? 'กำลังจัดส่งข้อมูล...' : 'ส่งเช็คชื่อเข้าบ้านสี'}
              </button>
            </form>
          </Panel>

        </div>

        {/* คอลัมน์ขวา: ตารางโชว์ประวัติตัวเอง */}
        <div className="lg:col-span-5 space-y-6">
          <Panel title="📋 ประวัติการเข้าบ้านสีของคุุณ">
            {myCheckins.length === 0 ? (
              <div className="text-center py-8 text-text-tertiary space-y-2">
                <ImageIcon size={28} className="mx-auto opacity-40 text-pink-primary" />
                <p className="text-xs">ยังไม่มีประวัติการส่งรายงานตัวเข้าบ้านสี</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {myCheckins.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-carbon-dark border border-pink-primary/5 rounded-2xl p-4 space-y-3 shadow-inner hover:border-pink-primary/15 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-tertiary font-medium">{item.date}</span>
                      
                      {/* สเตตัส Badge */}
                      {item.status === 'approved' && (
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> อนุมัติแล้ว
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <XCircle size={10} /> ปฏิเสธ
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Clock size={10} /> รอตรวจสอบ
                        </span>
                      )}
                    </div>

                    {/* แสดง Thumbnail รูป */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.photos.map((photo, pIdx) => (
                        <img
                          key={pIdx}
                          src={photo}
                          alt="attachement thumbnail"
                          className="w-12 h-12 rounded-lg object-cover border border-pink-primary/5 cursor-pointer hover:border-pink-primary/40 transition-colors"
                          onClick={() => setSelectedPreviewImage(photo)}
                        />
                      ))}
                    </div>

                    {/* ข้อมูลว่าแท็กใครบ้าง */}
                    <div className="text-[11px] text-text-secondary space-y-1 border-t border-pink-primary/5 pt-2">
                      <p>
                        <span className="font-semibold text-text-tertiary">ผู้รายงานตัว:</span> {item.submitterName}
                      </p>
                      {item.taggedStudentNames.length > 1 && (
                        <p>
                          <span className="font-semibold text-text-tertiary">เพื่อนร่วมภาพ:</span> {
                            item.taggedStudentNames.filter(name => name !== item.submitterName).join(', ')
                          }
                        </p>
                      )}
                      
                      {/* แสดงโน้ตจากสตาฟกรณีมีแก้ไข/ปฏิเสธ */}
                      {item.note && (
                        <div className="bg-red-500/5 text-red-400/90 border border-red-500/10 p-2 rounded-lg mt-2 text-[10px]">
                          <span className="font-bold flex items-center gap-1"><AlertCircle size={10} /> หมายเหตุจากสตาฟ:</span>
                          <span className="block mt-0.5 font-medium">{item.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

      </div>

      {/* แผงอนุมัติ (สิทธิ์สตาฟคุมสแตนด์และพี่ประธานขึ้นไป) */}
      {(isController || isModerator) && (
        <>
          <Panel title="⚙️ แผงจัดการอนุมัติเช็คชื่อเข้าบ้านสี (สำหรับผู้ควบคุม)">
          {pendingCheckins.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-green-400/70" />
              <p className="text-xs">ไม่มีรายการค้างตรวจสอบในระบบ ทุกคนได้รับอนุมัติหมดแล้ว!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-pink-primary/10 text-xs text-text-secondary uppercase font-black tracking-wider">
                    <th className="py-3 px-4">วันที่ / ผู้ส่ง</th>
                    <th className="py-3 px-4">รูปถ่ายหลักฐาน</th>
                    <th className="py-3 px-4">รายชื่อผู้รายงานตัว</th>
                    <th className="py-3 px-4 text-center">จัดการคำร้อง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-primary/5">
                  {pendingCheckins.map((checkin) => (
                    <tr key={checkin.id} className="hover:bg-carbon-light/20 transition-colors">
                      <td className="py-4 px-4 font-bold">
                        <span className="text-xs text-text-tertiary block font-normal">{checkin.date}</span>
                        <span className="text-white text-xs">{checkin.submitterName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1.5">
                          {checkin.photos.map((photo, pIdx) => (
                            <img
                              key={pIdx}
                              src={photo}
                              alt="pending attachment"
                              className="w-10 h-10 rounded-lg object-cover border border-pink-primary/5 cursor-pointer hover:border-pink-primary/40"
                              onClick={() => setSelectedPreviewImage(photo)}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-text-secondary">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {checkin.taggedStudentNames.map((name, nIdx) => (
                            <li key={nIdx} className="text-white">{name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4">
                        {rejectionNoteId === checkin.id ? (
                          <div className="flex flex-col gap-2 max-w-xs mx-auto">
                            <input
                              type="text"
                              value={rejectNoteText}
                              onChange={(e) => setRejectNoteText(e.target.value)}
                              placeholder="ระบุเหตุผลที่ปฏิเสธ..."
                              className="bg-carbon-dark border border-red-500/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  onRejectCheckin(checkin.id, rejectNoteText.trim());
                                  setRejectionNoteId(null);
                                  setRejectNoteText('');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                              >
                                ยืนยันปฏิเสธ
                              </button>
                              <button
                                onClick={() => {
                                  setRejectionNoteId(null);
                                  setRejectNoteText('');
                                }}
                                className="bg-carbon-light text-text-secondary px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onApproveCheckin(checkin.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm shadow-green-600/10"
                            >
                              <Check size={14} /> อนุมัติ
                            </button>
                            <button
                              onClick={() => setRejectionNoteId(checkin.id)}
                              className="bg-red-600/20 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                              <XCircle size={14} /> ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* ตารางแสดงสถิตินักเรียน ม.5 (เช็คว่าใครขาดเช็คชื่อเท่าไหร่) */}
        <Panel title="📊 สถิติเช็คชื่อบ้านสี ม.5 (สตาฟตรวจคนขาด)">
          <div className="space-y-4">
            
            {/* สรุปสถิติมินิแดชบอร์ด */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-text-tertiary block font-bold uppercase tracking-wider font-sans">ม.5 ทั้งหมด</span>
                <span className="text-xl font-black text-white font-sans">{statsSummary.total} คน</span>
              </div>
              <div className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-text-tertiary block font-bold uppercase tracking-wider font-sans">เช็คชื่อครบแล้ว (3 ครั้งขึ้นไป)</span>
                <span className="text-xl font-black text-green-400 font-sans">{statsSummary.completed} คน</span>
              </div>
              <div className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-text-tertiary block font-bold uppercase tracking-wider font-sans">ยังไม่ครบ (ขาดเช็คชื่อ)</span>
                <span className="text-xl font-black text-red-400 font-sans">{statsSummary.lacking} คน</span>
              </div>
            </div>

            {/* แถบค้นหาและฟิลเตอร์ */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  value={statsSearchQuery}
                  onChange={(e) => setStatsSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อเพื่อน หรือห้องเรียน (เช่น ม.5/2)..."
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-pink-primary text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatsFilterStatus('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statsFilterStatus === 'all'
                      ? 'bg-pink-primary border-pink-accent text-white'
                      : 'bg-carbon-dark border-pink-primary/5 text-text-secondary hover:bg-carbon-light'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setStatsFilterStatus('lacking')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statsFilterStatus === 'lacking'
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-carbon-dark border-pink-primary/5 text-text-secondary hover:bg-carbon-light'
                  }`}
                >
                  ขาดเช็คชื่อ ({statsSummary.lacking})
                </button>
                <button
                  type="button"
                  onClick={() => setStatsFilterStatus('completed')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statsFilterStatus === 'completed'
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-carbon-dark border-pink-primary/5 text-text-secondary hover:bg-carbon-light'
                  }`}
                >
                  ครบแล้ว ({statsSummary.completed})
                </button>
              </div>
            </div>

            {/* ตารางแสดงรายชื่อนักเรียน ม.5 พร้อมสเตตัสการขาด */}
            {filteredStats.length === 0 ? (
              <div className="text-center py-6 text-text-tertiary">
                <p className="text-xs">ไม่พบรายชื่อผู้ใช้งานที่ตรงตามเงื่อนไขที่ระบุ</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-pink-primary/5 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-carbon-dark/50 border-b border-pink-primary/10 text-[10px] text-text-secondary uppercase font-bold tracking-wider font-sans">
                      <th className="py-2.5 px-4">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-4">ห้อง / เลขที่</th>
                      <th className="py-2.5 px-4 text-center">เข้าบ้านสีแล้ว (สัปดาห์นี้)</th>
                      <th className="py-2.5 px-4 text-center">สถานะการขาดเช็คชื่อ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-primary/5 font-sans">
                    {filteredStats.map(({ student, approvedCount, lacks }) => (
                      <tr key={student.id} className="hover:bg-carbon-light/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {student.fullname}
                          <span className="text-[9px] text-text-tertiary font-normal block mt-0.5">รหัส {student.id}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-text-secondary">
                          {student.classroom || '-'} / เลขที่ {student.number || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-white text-sm">
                          {approvedCount} / 3
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            {lacks === 3 && (
                              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold select-none text-[10px]">
                                ขาดอีก 3 ครั้ง (ยังไม่ได้เข้า)
                              </span>
                            )}
                            {lacks === 2 && (
                              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-bold select-none text-[10px]">
                                ขาดอีก 2 ครั้ง
                              </span>
                            )}
                            {lacks === 1 && (
                              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full font-bold select-none text-[10px]">
                                ขาดอีก 1 ครั้ง
                              </span>
                            )}
                            {lacks === 0 && (
                              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-bold select-none text-[10px] flex items-center gap-1">
                                <Check size={10} /> ครบเกณฑ์แล้ว 🎉
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </Panel>
      </>
    )}

      {/* Lightbox ขยายภาพพรีวิวใหญ่ */}
      {selectedPreviewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden">
            <img 
              src={selectedPreviewImage} 
              alt="expanded preview" 
              className="max-w-full max-h-[85vh] rounded-3xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Webcam Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg bg-carbon-card border border-pink-primary/20 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-primary/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                📷 ถ่ายรูปรายงานตัวเข้าบ้านสี
              </h3>
              <button 
                onClick={stopCamera}
                className="text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-pink-primary/10 flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              
              {/* Overlay guides / scan lines */}
              <div className="absolute inset-4 border border-dashed border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-white/40 font-bold bg-black/40 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {cameraFacingMode === 'user' ? 'กล้องหน้า' : 'กล้องหลัง'}
                </span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light/80 border border-pink-primary/10 text-text-secondary py-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 bg-pink-primary hover:bg-pink-accent border-4 border-white/20 hover:border-white/40 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-90 cursor-pointer"
                title="กดถ่ายรูป"
              >
                <Camera size={26} />
              </button>

              <button
                type="button"
                onClick={switchCamera}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light/80 border border-pink-primary/10 text-text-secondary py-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RefreshCw size={14} />
                สลับกล้อง
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

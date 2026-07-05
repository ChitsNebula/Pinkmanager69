import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Settings, Trash2, User } from 'lucide-react';
import { Student, SportsEvent } from '../../app/mockData';
import { SpecialDuty, ActivityLog, getStoredData, saveSystemConfig } from '../../app/store';
import { Panel } from '../ui';
import { SeatGrid } from '../ui/SeatGrid';
import { fileToDataUrl } from '../../lib/helpers';

interface AdminTabProps {
  data: ReturnType<typeof getStoredData>;
  currentUser: Student;
  isController: boolean;
  isSuperController: boolean;
  saveSystemConfig: typeof saveSystemConfig;
  getSeatOwner: (seatId: string) => Student | undefined;
  handleSeatClick: (row: string, colNum: number) => void;
  addSportsEvent: (name: string, category: string, byUser?: Student) => void;
  removeSportsEvent: (id: string, byUser?: Student) => void;
  removeAthleteFromEvent: (eventId: string, athleteId: string, byUser?: Student) => void;
  assignAthleteToEvent: (eventId: string, athleteId: string, byUser?: Student) => void;
  handleExportLogsToCSV: () => void;
  handleUploadAthletePhoto: (athleteId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  data,
  currentUser,
  isController,
  isSuperController,
  saveSystemConfig,
  getSeatOwner,
  handleSeatClick,
  addSportsEvent,
  removeSportsEvent,
  removeAthleteFromEvent,
  assignAthleteToEvent,
  handleExportLogsToCSV,
  handleUploadAthletePhoto,
}) => {
  const [adminSubTab, setAdminSubTab] = useState<'stand' | 'athlete' | 'procession' | 'special_duty' | 'logs' | 'roles'>('stand');

  // Local input states for Athlete QR settings
  const [newAthleteLineLink, setNewAthleteLineLink] = useState(data.athleteQr?.lineLink || '');
  const [newAthleteQr, setNewAthleteQr] = useState(data.athleteQr?.qrCode || '');

  // Local input states for Procession
  const [newProcessionTitle, setNewProcessionTitle] = useState(data.processionTitle || 'ขบวนพาเหรด');
  const [newProcessionLineLink, setNewProcessionLineLink] = useState(data.processionQr?.lineLink || '');
  const [newProcessionQr, setNewProcessionQr] = useState(data.processionQr?.qrCode || '');
  const [newProcessionLimit, setNewProcessionLimit] = useState(data.processionLimit === 9999 ? '0' : String(data.processionLimit || '0'));

  // Local input states for Special Duties
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [newDutyTitle, setNewDutyTitle] = useState('');
  const [newDutyLimit, setNewDutyLimit] = useState('10');
  const [newDutyLineLink, setNewDutyLineLink] = useState('');
  const [newDutyQr, setNewDutyQr] = useState('');

  const [editingSpecialDuty, setEditingSpecialDuty] = useState<SpecialDuty | null>(null);
  const [editDutyTitle, setEditDutyTitle] = useState('');
  const [editDutyLimit, setEditDutyLimit] = useState('');
  const [editDutyLineLink, setEditDutyLineLink] = useState('');
  const [editDutyQr, setEditDutyQr] = useState('');

  // Local input states for Sports
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSubcategory, setNewEventSubcategory] = useState('ลู่'); // ลู่ หรือ ลาน
  const [newEventGender, setNewEventGender] = useState('ชาย'); // ชาย, หญิง, ผสม
  const [newEventLimit, setNewEventLimit] = useState('1'); // จำนวนคน

  // Local input states for Roles
  const [newControllerId, setNewControllerId] = useState('');
  const [newModeratorId, setNewModeratorId] = useState('');
  const [rolesError, setRolesError] = useState('');
  const [rolesSuccess, setRolesSuccess] = useState('');

  // Sync data updates to local input states
  useEffect(() => {
    setNewAthleteLineLink(data.athleteQr?.lineLink || '');
    setNewAthleteQr(data.athleteQr?.qrCode || '');
    setNewProcessionLineLink(data.processionQr?.lineLink || '');
    setNewProcessionQr(data.processionQr?.qrCode || '');
    setNewProcessionLimit(data.processionLimit === 9999 ? '0' : String(data.processionLimit || '0'));
    setNewProcessionTitle(data.processionTitle || 'ขบวนพาเหรด');
  }, [data.athleteQr, data.processionQr, data.processionLimit, data.processionTitle]);

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
        return data.processionTitle || 'เดินขบวนพาเหรด';
      case 'staff':
        return 'พี่คุมงาน / สตาฟ';
      default:
        return duty;
    }
  };

  const saveAthleteQr = () => {
    if (!currentUser || !isController) return;
    saveSystemConfig(
      { athleteQr: { qrCode: newAthleteQr, lineLink: newAthleteLineLink } },
      currentUser,
      'อัปเดต QR กลุ่มนักกีฬา'
    );
  };

  const saveProcessionConfig = () => {
    if (!currentUser || !isController) return;
    const parseLimit = Number(newProcessionLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;
    const cleanTitle = newProcessionTitle.trim() || 'ขบวนพาเหรด';
    saveSystemConfig(
      { 
        processionQr: { qrCode: newProcessionQr, lineLink: newProcessionLineLink },
        processionLimit: limitValue,
        processionTitle: cleanTitle
      },
      currentUser,
      `อัปเดตตั้งค่าขบวนพาเหรด (ชื่อ: ${cleanTitle}, โควตา: ${limitValue === 9999 ? 'ไม่จำกัด' : `${limitValue} คน`})`
    );
  };

  const addSpecialDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || currentUser.role === 'moderator' || !newDutyTitle.trim()) return;
    const id = `special_${Date.now()}`;
    
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
      `เพิ่มหน้าที่พิเศษ ${nextDuty.title} (โควตา: ${nextDuty.limit === 9999 ? 'ไม่จำกัด' : `${nextDuty.limit} คน`})`
    );
    setNewDutyTitle('');
    setNewDutyLimit('10');
    setNewDutyLineLink('');
    setNewDutyQr('');
  };

  const removeSpecialDuty = (id: string) => {
    if (!currentUser || !isController || currentUser.role === 'moderator') return;
    const duty = data.specialDuties.find((item: SpecialDuty) => item.id === id);
    if (!duty || !confirm(`ต้องการลบหน้าที่ ${duty.title} ใช่หรือไม่?`)) return;
    saveSystemConfig(
      { specialDuties: data.specialDuties.filter((item: SpecialDuty) => item.id !== id) },
      currentUser,
      `ลบหน้าที่พิเศษ ${duty.title}`
    );
  };

  const updateSpecialDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || currentUser.role === 'moderator' || !editingSpecialDuty || !editDutyTitle.trim()) return;

    const parseLimit = Number(editDutyLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;

    const changes: string[] = [];
    if (editingSpecialDuty.title !== editDutyTitle.trim()) {
      changes.push(`ชื่อ "${editingSpecialDuty.title}" ➔ "${editDutyTitle.trim()}"`);
    }
    if (editingSpecialDuty.limit !== limitValue) {
      const oldLimit = editingSpecialDuty.limit === 9999 ? 'ไม่จำกัด' : `${editingSpecialDuty.limit} คน`;
      const newLimit = limitValue === 9999 ? 'ไม่จำกัด' : `${limitValue} คน`;
      changes.push(`โควตา ${oldLimit} ➔ ${newLimit}`);
    }
    if (editingSpecialDuty.lineLink !== editDutyLineLink.trim()) {
      changes.push('ปรับปรุงลิงก์กลุ่ม');
    }
    if (editingSpecialDuty.qrCode !== editDutyQr) {
      changes.push('ปรับปรุง QR Code');
    }

    const logMessage = changes.length > 0 
      ? `แก้ไขหน้าที่พิเศษ ${editDutyTitle.trim()} (${changes.join(', ')})`
      : `แก้ไขหน้าที่พิเศษ ${editDutyTitle.trim()}`;

    const updatedDuties = data.specialDuties.map((item: SpecialDuty) => {
      if (item.id === editingSpecialDuty.id) {
        return {
          ...item,
          title: editDutyTitle.trim(),
          limit: limitValue,
          lineLink: editDutyLineLink.trim(),
          qrCode: editDutyQr,
        };
      }
      return item;
    });

    saveSystemConfig(
      { specialDuties: updatedDuties },
      currentUser,
      logMessage
    );
    setEditingSpecialDuty(null);
    setEditDutyTitle('');
    setEditDutyLimit('');
    setEditDutyLineLink('');
    setEditDutyQr('');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">แผงผู้ควบคุม</h2>
        <p className="text-sm text-text-secondary">เปิดปิดสแตน เพิ่มหน้าที่พิเศษ ตั้งค่า QR และจัดไลน์อัพนักกีฬา</p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar bg-carbon-card border border-pink-primary/10 rounded-2xl md:rounded-full p-1.5 w-full max-w-full gap-1 mb-6 shadow-lg scroll-smooth">
        {[
          { id: 'stand', label: '📣 จัดการสแตน' },
          { id: 'athlete', label: '🏃 จัดการนักกีฬา' },
          { id: 'procession', label: `🚶 จัดการ${data.processionTitle || 'ขบวนพาเหรด'}` },
          { id: 'special_duty', label: '✨ จัดการหน้าที่พิเศษ' },
          { id: 'logs', label: '📝 Log ประวัติการทำงาน' }
        ].filter(Boolean).map(sub => (
          <button
            key={sub!.id}
            onClick={() => setAdminSubTab(sub!.id as 'stand' | 'athlete' | 'procession' | 'special_duty' | 'logs' | 'roles')}
            className={`px-4 py-2 rounded-xl md:rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
              adminSubTab === sub!.id
                ? 'bg-pink-primary text-white shadow-md shadow-pink-primary/20 scale-105'
                : 'text-text-secondary hover:text-white hover:bg-carbon-light/30'
            }`}
          >
            {sub!.label}
          </button>
        ))}
      </div>

      {/* Full-width Stand Booking Control */}
      {adminSubTab === 'stand' && (
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
            {isSuperController && (
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
            )}
          </div>
          <div className="mt-5 border-t border-pink-primary/10 pt-4">
            <SeatGrid currentUser={currentUser || { id: 'dummy', fullname: 'ระบบ', classroom: 'ม.5', role: 'student_m5', assigned_duty: 'none', duty_status: 'none' }} isController={isSuperController} getSeatOwner={getSeatOwner} onSeatClick={handleSeatClick} />
          </div>
        </Panel>
      )}

      {/* Athlete QR Code Settings (Split Athlete Panel) */}
      {adminSubTab === 'athlete' && (
        <Panel title="ตั้งค่าช่องทางการติดต่อกลุ่มนักกีฬา">
          <div className="max-w-md space-y-3">
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
            <button onClick={saveAthleteQr} className="w-full bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20">
              บันทึก QR & ลิงก์นักกีฬา
            </button>
          </div>
        </Panel>
      )}

      {/* Procession Panel */}
      {adminSubTab === 'procession' && (
        <Panel title="ตั้งค่าขบวนพาเหรด">
          <div className="max-w-md space-y-3">
            <div>
              <label className="text-xs text-text-secondary block mb-1">ชื่อตำแหน่งงาน</label>
              <input 
                type="text"
                value={newProcessionTitle} 
                onChange={(e) => setNewProcessionTitle(e.target.value)} 
                placeholder="เช่น ขบวนพาเหรด" 
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-bold" 
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">ลิงก์กลุ่มไลน์ขบวนพาเหรด</label>
              <input 
                value={newProcessionLineLink} 
                onChange={(e) => setNewProcessionLineLink(e.target.value)} 
                placeholder="ลิงก์ Line group ขบวนพาเหรด" 
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">อัปโหลดรูปภาพ QR Code</label>
              <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                <ImageIcon size={16} className="text-pink-primary" /> เลือกรูป QR Code
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setNewProcessionQr(await fileToDataUrl(file));
                }} />
              </label>
            </div>
            {newProcessionQr && (
              <div className="relative mx-auto w-max">
                <img src={newProcessionQr} alt="QR กลุ่มขบวนพาเหรด" className="max-h-32 rounded-lg border border-pink-primary/10" />
                <button onClick={() => setNewProcessionQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
              </div>
            )}
            <div>
              <label className="text-xs text-text-secondary block mb-1">จำนวนโควตาคน (ใส่อักษร 0 หรือไม่ใส่เพื่อไม่จำกัดคน)</label>
              <input 
                type="number"
                value={newProcessionLimit} 
                onChange={(e) => setNewProcessionLimit(e.target.value)} 
                placeholder="จำนวนโควตาขบวนพาเหรด" 
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-bold" 
              />
            </div>
            <button onClick={saveProcessionConfig} className="w-full bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 cursor-pointer font-bold active:scale-95">
              บันทึกตั้งค่าขบวนพาเหรด
            </button>
          </div>
        </Panel>
      )}

      {/* Special Duties Management Area (Split Special Duties Panel) */}
      {adminSubTab === 'special_duty' && (
        <Panel title="จัดการตำแหน่งหน้าที่พิเศษ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-primary/10 pb-4 mb-4">
            <span className="text-xs text-text-secondary">กำหนดจำนวนโควตาผู้ปฏิบัติงานในตำแหน่งพิเศษ และตั้งค่าลิงก์/QR กลุ่มสตาฟ</span>
            {currentUser?.role !== 'moderator' && (
              <button 
                onClick={() => setShowDutyModal(true)} 
                className="bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/20 active:scale-95 cursor-pointer w-max"
              >
                <Plus size={14} /> เพิ่มหน้าที่พิเศษใหม่
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.specialDuties.map((item: SpecialDuty) => (
              <div key={item.id} className="flex items-center justify-between gap-3 bg-carbon-dark border border-pink-primary/5 rounded-xl p-3 hover:border-pink-primary/10 transition-all">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-text-secondary">{item.limit === 9999 ? 'รับไม่จำกัด' : `รับ ${item.limit} คน`} · มอบหมายแล้ว {data.students.filter((s: Student) => s.duties?.[item.id] === 'approved').length} คน</p>
                </div>
                {currentUser?.role !== 'moderator' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingSpecialDuty(item);
                        setEditDutyTitle(item.title);
                        setEditDutyLimit(item.limit === 9999 ? '0' : String(item.limit));
                        setEditDutyLineLink(item.lineLink || '');
                        setEditDutyQr(item.qrCode || '');
                      }} 
                      className="text-pink-primary hover:text-pink-accent transition-colors p-1 cursor-pointer"
                      title="แก้ไขหน้าที่"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeSpecialDuty(item.id)} 
                      className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                      title="ลบหน้าที่"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Sports Event Panel */}
      {adminSubTab === 'athlete' && (
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
              const eligibleAthletes = data.students.filter((st: Student) => st.duties?.['athlete'] === 'approved');
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
                  <div className="border-t border-pink-primary/5 pt-3">
                    {event.lineup.length === 0 ? (
                      <div className="w-full text-center py-6 text-text-tertiary text-xs italic bg-carbon-card/30 rounded-xl border border-pink-primary/5">
                        ยังไม่จัดรายชื่อนักกีฬา
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {event.lineup.map((athleteId) => {
                          const athlete = data.students.find((s: Student) => s.id === athleteId);
                          if (!athlete) return null;

                          const nicknameMatch = athlete.fullname.match(/\(([^)]+)\)/);
                          const shortName = nicknameMatch ? nicknameMatch[1] : athlete.fullname.split(' ')[0];

                          return (
                            <div 
                              key={athleteId} 
                              className="w-[100px] bg-gradient-to-b from-pink-primary/10 to-carbon-card rounded-xl border border-pink-primary/20 overflow-hidden flex flex-col items-center relative text-center group shadow-md shadow-pink-primary/5"
                            >
                              {isController && (
                                <button 
                                  onClick={() => removeAthleteFromEvent(event.id, athleteId, currentUser || undefined)} 
                                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-red-400 hover:text-white p-1 rounded-full z-20 transition-all cursor-pointer shadow-sm"
                                  title="นำนักกีฬาออกจากรายการ"
                                >
                                  <X size={8} />
                                </button>
                              )}
                              
                              <div className="w-full aspect-[3/4] relative bg-carbon-dark/50 flex items-center justify-center overflow-hidden border-b border-pink-primary/10">
                                {athlete.avatar ? (
                                  <img 
                                    src={athlete.avatar} 
                                    alt={athlete.fullname} 
                                    className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-text-tertiary p-1.5">
                                    <User size={24} className="opacity-40 text-pink-primary" />
                                    <span className="text-[8px] mt-1 text-center font-medium opacity-60">ไม่มีรูป</span>
                                  </div>
                                )}
                                
                                {(isController || currentUser?.id === athleteId) && (
                                  <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-[8px] text-white cursor-pointer z-10">
                                    <Plus size={12} className="text-pink-primary" />
                                    <span className="font-semibold">แนบรูป</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => handleUploadAthletePhoto(athleteId, e)} 
                                    />
                                  </label>
                                )}
                              </div>

                              <div className="p-1 w-full flex flex-col justify-center bg-carbon-card/90">
                                <span 
                                  className="text-[10px] font-bold text-white truncate max-w-full px-0.5 block" 
                                  title={athlete.fullname}
                                >
                                  {shortName}
                                </span>
                                <span className="text-[8px] text-pink-accent font-semibold block">
                                  {athlete.classroom} {athlete.number ? `เลขที่ ${athlete.number}` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
      )}

      {/* Controller Action Log History Panel */}
      {adminSubTab === 'logs' && (
        <Panel title="📝 ประวัติการบันทึกข้อมูลการทำงาน (Log History)">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-pink-primary/10">
            <span className="text-xs text-text-secondary">ประวัติกิจกรรมและการบันทึกข้อมูลทั้งหมดในระบบ</span>
            <button
              onClick={handleExportLogsToCSV}
              className="bg-green-600 hover:bg-green-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-md shadow-green-600/10 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer w-max"
            >
              📥 ส่งออก Log เป็น CSV
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs sm:text-sm">
            {(() => {
              const backendLogs = data.logs.filter((log: ActivityLog) => log.actorRole !== 'สมาชิก');
              if (backendLogs.length === 0) {
                return <p className="text-text-tertiary text-center italic py-4">ยังไม่มีประวัติการบันทึกกิจกรรมในระบบ</p>;
              }
              return backendLogs.map((log: ActivityLog) => (
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
              ));
            })()}
          </div>
        </Panel>
      )}

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
                    
                    let formattedName = `${newEventName.trim()} ${newEventGender}`;
                    if (newEventLimit && parseInt(newEventLimit) > 0) {
                      formattedName += ` (${newEventLimit} คน)`;
                    }
                    if (newEventSubcategory !== 'ทั่วไป') {
                      formattedName += ` (ประเภท${newEventSubcategory})`;
                    }

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

      {/* Popup Edit Special Duty Modal */}
      {editingSpecialDuty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => {
                setEditingSpecialDuty(null);
                setEditDutyTitle('');
                setEditDutyLimit('');
                setEditDutyLineLink('');
                setEditDutyQr('');
              }} 
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">แก้ไขตำแหน่งหน้าที่พิเศษ</h3>
            <form onSubmit={updateSpecialDuty} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">ชื่อตำแหน่งหน้าที่</label>
                <input 
                  value={editDutyTitle} 
                  onChange={(e) => setEditDutyTitle(e.target.value)} 
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
                    value={editDutyLimit} 
                    onChange={(e) => setEditDutyLimit(e.target.value)} 
                    placeholder="เช่น 10" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5">ลิงก์กลุ่มไลน์</label>
                  <input 
                    value={editDutyLineLink} 
                    onChange={(e) => setEditDutyLineLink(e.target.value)} 
                    placeholder="ลิงก์กลุ่มข่าวสาร" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">รูปภาพ QR Code กลุ่ม</label>
                <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                  <ImageIcon size={16} className="text-pink-primary" /> {editDutyQr ? 'เปลี่ยนรูป QR Code' : 'อัปโหลดรูปภาพ QR Code'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditDutyQr(await fileToDataUrl(file));
                    }} 
                  />
                </label>
              </div>

              {editDutyQr && (
                <div className="relative mx-auto w-max">
                  <img src={editDutyQr} alt="QR แก้ไขหน้าที่" className="max-h-32 rounded-lg border border-pink-primary/10" />
                  <button type="button" onClick={() => setEditDutyQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingSpecialDuty(null);
                    setEditDutyTitle('');
                    setEditDutyLimit('');
                    setEditDutyLineLink('');
                    setEditDutyQr('');
                  }} 
                  className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    updateSpecialDuty(e);
                  }}
                  className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

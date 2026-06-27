import React from 'react';
import { Users, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import { Student } from '../../app/mockData';
import { SpecialDuty, Announcement } from '../../app/store';
import { Panel } from '../ui';

interface DashboardTabProps {
  data: any;
  currentUser: Student;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ data, currentUser }) => {
  // Compute unassigned and seated students locally
  const unassignedStudents = data.students.filter((s: Student) => 
    !Object.values(s.duties || {}).some(status => status === 'approved')
  );
  const seatedStudents = data.students.filter((s: Student) => s.seat);

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

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Rich Gradient Hero Section with Conic/Radial Glow Effect */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-carbon-card via-carbon-card/90 to-carbon-light/35 border border-pink-primary/15 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-primary/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-pink-primary font-bold bg-pink-primary/10 px-3 py-1 rounded-full border border-pink-primary/20">Dashboard</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-2 tracking-tight text-text-primary">ระบบจัดการหน้าที่สีชมพู</h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
            รวมสมัครหน้าที่ ประกาศสำคัญ ทะเบียนการทำงาน และการจองสแตนเชียร์ของพวกเราคณะสีชมพูไว้ในระบบเดียวแบบเรียลไทม์
          </p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Members - Pink Theme */}
            <div className="bg-pink-primary/10 border border-pink-primary/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-pink-primary/45 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-primary/20 text-pink-primary flex items-center justify-center border border-pink-primary/30">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium">สมาชิกทั้งหมด</p>
                  <p className="text-xl font-bold text-text-primary mt-0.5">{data.students.length} คน</p>
                </div>
              </div>
            </div>

            {/* Assigned Duties - Emerald Green Theme */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-emerald-500/45 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium">มีหน้าที่แล้ว</p>
                  <p className="text-xl font-bold text-emerald-500 mt-0.5">{data.students.length - unassignedStudents.length} คน</p>
                </div>
              </div>
            </div>

            {/* Unassigned Duties - Violet/Rose Theme */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-rose-500/45 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium">ยังไม่มีหน้าที่</p>
                  <p className="text-xl font-bold text-rose-500 mt-0.5">{unassignedStudents.length} คน</p>
                </div>
              </div>
            </div>

            {/* Seated Stand - Gold/Yellow Theme */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-yellow-500/45 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium">จองสแตนแล้ว</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">{seatedStudents.length} / 180 คน</p>
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
                  ที่นั่งรหัส {currentUser.seat}
                </div>
              ) : currentUser.duty_status === 'pending_selection' ? (
                <div className="flex items-center gap-1.5 mt-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg w-max text-yellow-500 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  รอคัดเลือก / รออนุมัติ
                </div>
              ) : currentUser.assigned_duty !== 'none' && currentUser.duty_status === 'approved' ? (
                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-pink-primary/10 border border-pink-primary/20 px-3 py-1 rounded-lg w-max text-pink-primary text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-pink-primary"></span>
                    ยืนยันหน้าที่เรียบร้อย
                  </div>
                  {(() => {
                    let qrCode = '';
                    let lineLink = '';
                    
                    if (currentUser.assigned_duty === 'athlete') {
                      qrCode = data.athleteQr?.qrCode;
                      lineLink = data.athleteQr?.lineLink;
                    } else if (currentUser.assigned_duty === 'procession') {
                      qrCode = data.processionQr?.qrCode;
                      lineLink = data.processionQr?.lineLink;
                    } else {
                      const spec = data.specialDuties.find((sd: SpecialDuty) => sd.id === currentUser.assigned_duty);
                      if (spec) {
                        qrCode = spec.qrCode || '';
                        lineLink = spec.lineLink || '';
                      }
                    }
                    
                    if (!qrCode && !lineLink) return null;
                    return (
                      <div className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-3 space-y-2 mt-2 w-max max-w-xs text-xs font-sans">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">ช่องทางติดต่อหัวหน้ากลุ่ม</p>
                        {qrCode && <img src={qrCode} alt="QR กลุ่มประสานงาน" className="max-h-36 rounded-lg mx-auto border border-pink-primary/10" />}
                        {lineLink && <a href={lineLink} target="_blank" rel="noreferrer" className="block text-center text-[11px] text-pink-primary hover:text-pink-accent font-semibold font-bold">เข้ากลุ่มไลน์ติดตามข่าวสาร</a>}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary mt-2">กรุณาติดต่อพี่ควบคุมสี</p>
              )}
            </div>
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
  );
};

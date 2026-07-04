'use client';

import React from 'react';
import { Award, User, ShieldAlert, X } from 'lucide-react';
import { Student } from '../../app/mockData';

interface LoginScreenProps {
  lightTheme: boolean;
  setLightTheme: (val: boolean) => void;
  loginTab: 'member' | 'staff';
  setLoginTab: (tab: 'member' | 'staff') => void;
  loginClassroom: string;
  setLoginClassroom: (val: string) => void;
  loginNumber: string;
  setLoginNumber: (val: string) => void;
  loginStudentId: string;
  setLoginStudentId: (val: string) => void;
  detectedStudent: Student | null;
  loginError: string;
  staffUsername: string;
  setStaffUsername: (val: string) => void;
  staffPassword: string;
  setStaffPassword: (val: string) => void;
  staffError: string;
  handleMemberLogin: (e: React.FormEvent) => void;
  handleStaffLogin: (e: React.FormEvent) => void;
  classrooms: string[];
  mounted: boolean;
  showGuestReportModal: boolean;
  setShowGuestReportModal: (val: boolean) => void;
  guestReportName: string;
  setGuestReportName: (val: string) => void;
  guestReportClassroom: string;
  setGuestReportClassroom: (val: string) => void;
  guestReportNumber: string;
  setGuestReportNumber: (val: string) => void;
  guestReportStudentId: string;
  setGuestReportStudentId: (val: string) => void;
  guestReportSubject: string;
  setGuestReportSubject: (val: string) => void;
  guestReportDescription: string;
  setGuestReportDescription: (val: string) => void;
  handleSubmitGuestReport: (e: React.FormEvent) => void;
}

export function LoginScreen({
  lightTheme,
  setLightTheme,
  loginTab,
  setLoginTab,
  loginClassroom,
  setLoginClassroom,
  loginNumber,
  setLoginNumber,
  loginStudentId,
  setLoginStudentId,
  detectedStudent,
  loginError,
  staffUsername,
  setStaffUsername,
  staffPassword,
  setStaffPassword,
  staffError,
  handleMemberLogin,
  handleStaffLogin,
  classrooms,
  mounted,
  showGuestReportModal,
  setShowGuestReportModal,
  guestReportName,
  setGuestReportName,
  guestReportClassroom,
  setGuestReportClassroom,
  guestReportNumber,
  setGuestReportNumber,
  guestReportStudentId,
  setGuestReportStudentId,
  guestReportSubject,
  setGuestReportSubject,
  guestReportDescription,
  setGuestReportDescription,
  handleSubmitGuestReport,
}: LoginScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-carbon-dark via-carbon-dark to-pink-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glowing background accent blobs */}
      <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-pink-primary/15 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-20%] w-[35%] h-[35%] rounded-full bg-gradient-to-br from-pink-accent/10 to-transparent blur-[90px] pointer-events-none" />

      {/* Floating Theme Toggle in top-right of pre-login page */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLightTheme(!lightTheme)}
          className="flex items-center justify-center p-2.5 rounded-xl bg-carbon-card/80 backdrop-blur-md border border-pink-primary/20 text-pink-primary hover:bg-pink-primary/15 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none shadow-md shadow-pink-primary/5"
          title={
            lightTheme ? 'เปลี่ยนเป็นโหมดมืด (Dark Mode)' : 'เปลี่ยนเป็นโหมดสว่าง (Light/White Mode)'
          }
        >
          {lightTheme ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="w-full max-w-[460px] glass-panel rounded-[32px] p-8 shadow-2xl shadow-pink-primary/10 relative overflow-hidden border border-pink-primary/15">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-primary via-pink-accent to-pink-primary" />
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-primary/15 to-pink-accent/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-primary/30 shadow-md shadow-pink-primary/10 hover:scale-110 hover:rotate-6 transition-all duration-300">
            <Award
              size={36}
              className="text-pink-primary drop-shadow-[0_2px_8px_rgba(255,46,147,0.4)]"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">คณะสีชมพู</h1>
          <p className="text-xs text-text-secondary font-medium">
            ระบบติดตามข่าวสาร เช็คตารางแข่ง และดูโค้ดแปรอักษรรายบุคคล
          </p>
        </div>

        <div className="flex bg-carbon-dark border border-pink-primary/10 rounded-full p-1.5 mb-6 shadow-inner">
          <button
            onClick={() => setLoginTab('member')}
            className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginTab === 'member'
                ? 'bg-pink-primary text-white shadow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <User size={16} /> สมาชิกสี
          </button>
          <button
            onClick={() => setLoginTab('staff')}
            className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginTab === 'staff'
                ? 'bg-pink-primary text-white shadow'
                : 'text-text-secondary hover:text-white'
            }`}
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
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer"
              >
                {mounted ? (
                  classrooms.map((classroom) => (
                    <option key={classroom} value={classroom}>
                      {classroom}
                    </option>
                  ))
                ) : (
                  <option value="">กำลังโหลด...</option>
                )}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  เลขที่
                </span>
                <input
                  type="number"
                  placeholder="เช่น 15"
                  value={loginNumber}
                  onChange={(e) => setLoginNumber(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  รหัสประจำตัว
                </span>
                <input
                  type="password"
                  placeholder="รหัสนักเรียน"
                  value={loginStudentId}
                  onChange={(e) => setLoginStudentId(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                  required
                />
              </label>
            </div>

            {detectedStudent && (
              <div className="p-3 bg-pink-primary/5 border border-pink-primary/25 rounded-xl text-xs text-pink-accent flex items-center justify-between">
                <span>
                  พบชื่อ: <strong>{detectedStudent.fullname}</strong>
                </span>
              </div>
            )}

            {loginError && (
              <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
                {loginError}
              </div>
            )}

            <button className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10 cursor-pointer">
              เข้าสู่ระบบสมาชิก
            </button>
          </form>
        ) : (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                ผู้ควบคุม
              </span>
              <input
                type="text"
                placeholder="admin หรือรหัสนักเรียนผู้ควบคุม"
                value={staffUsername}
                onChange={(e) => setStaffUsername(e.target.value)}
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                required
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                รหัสผ่าน
              </span>
              <input
                type="password"
                placeholder="123"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                required
              />
            </label>
            {staffError && (
              <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
                {staffError}
              </div>
            )}
            <button className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-primary/10 cursor-pointer">
              เข้าสู่ระบบผู้ควบคุม
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-pink-primary/5 text-center">
          <button
            type="button"
            onClick={() => {
              setShowGuestReportModal(true);
              if (!guestReportClassroom && classrooms.length > 0) {
                setGuestReportClassroom(classrooms[0]);
              }
            }}
            className="text-xs text-pink-primary hover:text-pink-accent font-semibold transition-all hover:underline cursor-pointer"
          >
            ⚠️ แจ้งปัญหาเข้าสู่ระบบไม่ได้ / ข้อมูลผิดพลาด
          </button>
        </div>
      </div>

      {showGuestReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative font-semibold text-white">
            <button
              onClick={() => setShowGuestReportModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
              type="button"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              แจ้งปัญหาเข้าใช้งาน / ข้อมูลผิดพลาด
            </h3>
            <p className="text-xs text-text-secondary mb-4 font-normal">
              ข้อมูลจะถูกส่งไปยังสตาฟและผู้ดูแลระบบเพื่อทำการตรวจสอบและแก้ไขให้ครับ
            </p>

            <form onSubmit={handleSubmitGuestReport} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  ชื่อ-นามสกุลจริง *
                </label>
                <input
                  type="text"
                  value={guestReportName}
                  onChange={(e) => setGuestReportName(e.target.value)}
                  placeholder="ระบุชื่อจริง เช่น นายสมชาย ใจดี"
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1 font-semibold">
                    ห้องเรียน *
                  </label>
                  <select
                    value={guestReportClassroom}
                    onChange={(e) => setGuestReportClassroom(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium cursor-pointer"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom} value={classroom}>
                        {classroom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1 font-semibold">
                    เลขที่
                  </label>
                  <input
                    type="number"
                    value={guestReportNumber}
                    onChange={(e) => setGuestReportNumber(e.target.value)}
                    placeholder="เช่น 12"
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  เลขประจำตัวนักเรียน (5 หลัก)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={guestReportStudentId}
                  onChange={(e) => setGuestReportStudentId(e.target.value)}
                  placeholder="เช่น 41234 (หากไม่ทราบเว้นว่างได้)"
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  เรื่องที่ต้องการแจ้ง *
                </label>
                <select
                  value={guestReportSubject}
                  onChange={(e) => setGuestReportSubject(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium cursor-pointer"
                >
                  <option value="login_issue">เข้าสู่ระบบไม่ได้ / ไม่พบรหัสผ่าน</option>
                  <option value="name_wrong">ชื่อสะกดผิดต้องการแก้ไข</option>
                  <option value="classroom_wrong">ระดับชั้นไม่ตรงความจริง</option>
                  <option value="number_wrong">เลขที่บนชั้นเรียนไม่ถูกต้อง</option>
                  <option value="other">อื่นๆ (ระบุด้านล่าง)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  รายละเอียดข้อมูลที่ถูกต้อง *
                </label>
                <textarea
                  value={guestReportDescription}
                  onChange={(e) => setGuestReportDescription(e.target.value)}
                  placeholder="เช่น: ต้องการเปลี่ยนรหัสให้ตรงกับความจริง หรือ รหัสนักเรียน 43210 พิมพ์เลขที่สลับกันเป็น 10 แต่ความจริงคือเลขที่ 1"
                  rows={4}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white resize-none font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuestReportModal(false)}
                  className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 font-bold cursor-pointer"
                >
                  ส่งข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

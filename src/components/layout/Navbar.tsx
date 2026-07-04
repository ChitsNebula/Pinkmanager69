'use client';

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Student } from '../../app/mockData';
import { Tab } from '../../app/types';
import { roleLabel } from '../../lib/helpers';

interface NavbarProps {
  currentUser: Student;
  currentTab: Tab;
  isController: boolean;
  lightTheme: boolean;
  setCurrentTab: (tab: Tab) => void;
  setLightTheme: (light: boolean) => void;
  handleLogout: () => void;
  isSupabaseConnected?: boolean;
  onChangePasswordClick?: () => void;
}

export function Navbar({
  currentUser,
  currentTab,
  isController,
  lightTheme,
  setCurrentTab,
  setLightTheme,
  handleLogout,
  isSupabaseConnected,
  onChangePasswordClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 glass-nav px-4 py-3 xl:px-6 xl:py-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-primary flex items-center justify-center font-bold text-white text-lg tracking-wider shadow shadow-pink-primary/45">
            P
          </div>
          <span className="font-semibold text-lg tracking-widest text-text-primary">
            PINK<span className="text-pink-primary">69</span>
          </span>
        </div>
      </div>

      <nav className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1 xl:pb-0 scroll-smooth -mx-2 px-2">
        {(
          [
            ['dashboard', 'หน้าหลัก'],
            ['announcements', 'ประกาศ'],
            isController || currentUser?.assigned_duty === 'stand' ? ['choreo', 'แปรอักษร'] : null,
            isController ||
            currentUser?.assigned_duty === 'athlete' ||
            currentUser?.duties?.['athlete'] === 'approved'
              ? ['athlete_events', 'รายการแข่งของฉัน']
              : null,
            isController ||
            currentUser?.role === 'student_m5' ||
            (currentUser?.classroom && currentUser?.classroom.startsWith('ม.5'))
              ? ['colorhouse', 'บ้านสี']
              : null,
            isController ? ['registry', 'ทะเบียนสี'] : null,
            ['reports', 'แจ้งปัญหา'],
          ] as Array<[Tab, string] | null>
        )
          .filter((item): item is [Tab, string] => item !== null)
          .map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                currentTab === id
                  ? 'bg-pink-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-carbon-light'
              }`}
            >
              {label}
            </button>
          ))}
        {isController && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
              currentTab === 'admin'
                ? 'bg-pink-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-carbon-light'
            }`}
          >
            แผงผู้ควบคุม
          </button>
        )}
      </nav>
      <div className="flex flex-wrap items-center gap-2 xl:gap-3 w-full xl:w-auto justify-between xl:justify-end">
        {/* Supabase status indicator */}
        {isController && (
          <div 
            className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/20'
            }`}
            title={isSupabaseConnected ? 'เชื่อมต่อฐานข้อมูล Supabase Real-time สำเร็จ' : 'ไม่ได้เชื่อมต่อ Supabase (โหมดออฟไลน์/เซฟลงเครื่อง)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>
        )}

        <button
          onClick={() => setLightTheme(!lightTheme)}
          className="flex items-center justify-center p-2 rounded-lg bg-carbon-card border border-pink-primary/20 text-pink-primary hover:bg-pink-primary/10 transition-all cursor-pointer select-none"
          title={lightTheme ? 'เปลี่ยนเป็นโหมดมืด (Dark Mode)' : 'เปลี่ยนเป็นโหมดสว่าง (Light/White Mode)'}
        >
          {lightTheme ? '☀️' : '🌙'}
        </button>

        <div className="flex items-center gap-2 bg-carbon-card border border-pink-primary/20 px-2.5 py-1 xl:px-3 xl:py-1.5 rounded-lg text-xs xl:text-sm shadow max-w-[70%] sm:max-w-none truncate">
          <User size={14} className="text-pink-primary shrink-0" />
          <span className="font-semibold text-text-primary truncate">
            {currentUser.fullname}
          </span>
          <span className="text-[9px] xl:text-[10px] text-pink-primary bg-pink-primary/15 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0">
            {currentUser.classroom} {currentUser.number ? `เลขที่ ${currentUser.number}` : ''}
            {(currentUser.role === 'admin_president' || currentUser.role === 'staff_m5') &&
              ` · ${roleLabel(currentUser)}`}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 px-2.5 py-1 xl:px-3 xl:py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all cursor-pointer"
          title="ออกจากระบบ"
        >
          <LogOut size={12} /> <span className="hidden sm:inline">ออกระบบ</span>
        </button>
      </div>
    </header>
  );
}

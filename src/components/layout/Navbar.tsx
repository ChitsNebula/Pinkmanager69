'use client';

import React, { useRef, useState, useEffect } from 'react';
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
}: NavbarProps) {
  // Extract nickname from fullname pattern "FirstName LastName (Nickname)"
  const displayName = (() => {
    const match = currentUser.fullname.match(/\(([^)]+)\)/);
    if (match) return match[1];
    return currentUser.fullname.split(' ')[0];
  })();

  // Track whether the tab nav can scroll right (to show fade indicator)
  const navRef = useRef<HTMLElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const check = () => setCanScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
    check();
    nav.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      nav.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  const tabs = (
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
  ).filter((item): item is [Tab, string] => item !== null);

  if (isController) {
    tabs.push(['admin', 'แผงผู้ควบคุม']);
  }

  return (
    <header className="sticky top-0 z-50 glass-nav px-4 py-2.5 xl:px-6 xl:py-4 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between xl:gap-4">

      {/* ─── Row 1: Logo + Controls ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Logo group */}
        <div className="flex items-center gap-2">
          {/* Supabase dot — mobile: inline with logo; desktop: hidden here */}
          {isController && (
            <div
              className={`xl:hidden flex items-center justify-center w-4 h-4 rounded-full border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}
              title={isSupabaseConnected ? 'เชื่อมต่อฐานข้อมูล Supabase' : 'ออฟไลน์'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-pink-primary flex items-center justify-center font-bold text-white text-lg tracking-wider shadow shadow-pink-primary/45">
            P
          </div>
          <span className="font-semibold text-lg tracking-widest text-text-primary">
            PINK<span className="text-pink-primary">69</span>
          </span>
        </div>

        {/* Mobile-only controls (hidden on xl+) */}
        <div className="flex items-center gap-1.5 xl:hidden">
          <button
            onClick={() => setLightTheme(!lightTheme)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-carbon-card border border-pink-primary/20 text-pink-primary hover:bg-pink-primary/10 transition-all cursor-pointer select-none text-sm"
            title={lightTheme ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
          >
            {lightTheme ? '☀️' : '🌙'}
          </button>

          {/* Compact user chip */}
          <div className="flex items-center gap-1 bg-carbon-card border border-pink-primary/20 px-2 py-1 rounded-lg text-xs max-w-[160px] min-w-0">
            <User size={11} className="text-pink-primary shrink-0" />
            <span className="font-semibold text-text-primary truncate">{displayName}</span>
            <span className="text-[9px] text-pink-primary bg-pink-primary/15 px-1 py-0.5 rounded font-semibold shrink-0 whitespace-nowrap">
              {currentUser.classroom}
              {currentUser.number ? ` ·${currentUser.number}` : ''}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* ─── Row 2: Tab Navigation ──────────────────────────────────────── */}
      <div className="relative w-full xl:w-auto">
        <nav
          ref={navRef as React.RefObject<HTMLElement>}
          className="flex flex-nowrap items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar w-full pb-0.5 xl:pb-0 scroll-smooth -mx-2 px-2"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`px-3 py-1.5 xl:px-3.5 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                currentTab === id
                  ? 'bg-pink-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-carbon-light'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        {/* Scroll fade indicator — shows when there are more tabs to the right */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-14 xl:hidden"
            style={{
              background: 'linear-gradient(to left, var(--glass-nav-bg) 0%, transparent 100%)',
            }}
          />
        )}
      </div>

      {/* ─── Desktop-only controls (hidden on mobile) ───────────────────── */}
      <div className="hidden xl:flex items-center gap-3 shrink-0">
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

        <div className="flex items-center gap-2 bg-carbon-card border border-pink-primary/20 px-3 py-1.5 rounded-lg text-sm shadow max-w-[260px]">
          <User size={14} className="text-pink-primary shrink-0" />
          <span className="font-semibold text-text-primary truncate">
            {currentUser.fullname}
          </span>
          <span className="text-[10px] text-pink-primary bg-pink-primary/15 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 whitespace-nowrap">
            {currentUser.classroom} {currentUser.number ? `เลขที่ ${currentUser.number}` : ''}
            {(currentUser.role === 'admin_president' || currentUser.role === 'staff_m5') &&
              ` · ${roleLabel(currentUser)}`}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          title="ออกจากระบบ"
        >
          <LogOut size={12} /> <span>ออกระบบ</span>
        </button>
      </div>

    </header>
  );
}

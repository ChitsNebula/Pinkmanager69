/**
 * Unit Tests: src/components/layout/Navbar.tsx
 * ทดสอบการแสดงผล Supabase connection indicator
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import type { Student } from '../../app/mockData';
import type { Tab } from '../../app/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <span data-testid="icon-user" />,
  LogOut: () => <span data-testid="icon-logout" />,
}));

// Mock helpers
jest.mock('../../lib/helpers', () => ({
  roleLabel: jest.fn(() => 'Admin'),
}));

// Student mock ใช้สำหรับทุก test
const mockStudent: Student = {
  id: 'test-001',
  student_id: '39967',
  fullname: 'นายทดสอบ ระบบ',
  classroom: 'ม.4/1',
  number: '1',
  role: 'member',
  color: 'pink',
  assigned_duty: 'general',
  duties: {},
};

const defaultProps = {
  currentUser: mockStudent,
  currentTab: 'dashboard' as Tab,
  isController: false,
  lightTheme: false,
  setCurrentTab: jest.fn(),
  setLightTheme: jest.fn(),
  handleLogout: jest.fn(),
};

describe('Navbar — Supabase Status Indicator', () => {
  it('แสดงข้อความ "Supabase" และ class สีเขียวเมื่อ isSupabaseConnected = true', () => {
    render(<Navbar {...defaultProps} isSupabaseConnected={true} />);
    // ข้อความ "Supabase" ต้องแสดงใน md breakpoint ขึ้นไป
    expect(screen.getByText('Supabase')).toBeInTheDocument();
  });

  it('แสดงข้อความ "Offline" เมื่อ isSupabaseConnected = false', () => {
    render(<Navbar {...defaultProps} isSupabaseConnected={false} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('แสดงข้อความ "Offline" เมื่อ isSupabaseConnected ไม่ได้ถูกส่งมา (undefined)', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('indicator มี title tooltip ที่ถูกต้องเมื่อ connected', () => {
    render(<Navbar {...defaultProps} isSupabaseConnected={true} />);
    const indicator = screen.getByTitle(/เชื่อมต่อฐานข้อมูล Supabase/);
    expect(indicator).toBeInTheDocument();
  });

  it('indicator มี title tooltip ที่ถูกต้องเมื่อ offline', () => {
    render(<Navbar {...defaultProps} isSupabaseConnected={false} />);
    const indicator = screen.getByTitle(/ไม่ได้เชื่อมต่อ Supabase/);
    expect(indicator).toBeInTheDocument();
  });
});

describe('Navbar — แสดงข้อมูล User', () => {
  it('แสดงชื่อนักเรียน', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('นายทดสอบ ระบบ')).toBeInTheDocument();
  });

  it('แสดงห้องเรียนและเลขที่', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText(/ม\.4\/1/)).toBeInTheDocument();
    expect(screen.getByText(/เลขที่ 1/)).toBeInTheDocument();
  });
});

describe('Navbar — Tab Navigation', () => {
  it('แสดงปุ่ม "หน้าหลัก" และ "ประกาศ" เสมอ', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('หน้าหลัก')).toBeInTheDocument();
    expect(screen.getByText('ประกาศ')).toBeInTheDocument();
  });

  it('ซ่อนปุ่ม "แผงผู้ควบคุม" เมื่อ isController = false', () => {
    render(<Navbar {...defaultProps} isController={false} />);
    expect(screen.queryByText('แผงผู้ควบคุม')).not.toBeInTheDocument();
  });

  it('แสดงปุ่ม "แผงผู้ควบคุม" เมื่อ isController = true', () => {
    render(<Navbar {...defaultProps} isController={true} />);
    expect(screen.getByText('แผงผู้ควบคุม')).toBeInTheDocument();
  });
});

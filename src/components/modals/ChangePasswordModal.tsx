'use client';

import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { Student } from '../../app/mockData';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Student;
}

export function ChangePasswordModal({ isOpen, onClose, currentUser }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 4) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/staff/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.id,
          oldPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // ปิด modal หลังจากสำเร็จ 1.5 วินาที
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดำเนินการได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-carbon-card border border-pink-primary/20 rounded-2xl w-full max-w-md p-6 relative flex flex-col gap-4 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-primary/10">
          <div className="flex items-center gap-2">
            <Lock className="text-pink-primary w-5 h-5" />
            <h3 className="text-base font-bold text-text-primary">
              เปลี่ยนรหัสผ่านผู้ควบคุม
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-pink-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Badge Info */}
        <div className="bg-pink-primary/5 border border-pink-primary/15 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-primary flex items-center justify-center text-white font-black text-sm">
            {currentUser.fullname.substring(0, 1)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary">{currentUser.fullname}</span>
            <span className="text-[10px] text-text-secondary">บัญชีผู้ควบคุม ID: {currentUser.id}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <KeyRound size={12} className="text-pink-primary" /> รหัสผ่านเดิม (รหัสเริ่มต้นคือ ID ของคุณ)
            </span>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
              required
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-pink-primary" /> รหัสผ่านใหม่
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
              required
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-text-secondary mb-1.5">
              ยืนยันรหัสผ่านใหม่
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-medium"
              required
            />
          </label>

          {/* Messages */}
          {error && (
            <div className="text-red-400 text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-emerald-400 text-xs p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center font-medium">
              {success}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 mt-3 pt-3 border-t border-pink-primary/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

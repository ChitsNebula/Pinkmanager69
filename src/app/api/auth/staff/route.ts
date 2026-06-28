import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Helper: แฮชรหัสผ่านด้วย SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณากรอกผู้ใช้และรหัสผ่าน' 
      }, { status: 400 });
    }

    // 1. ดึงข้อมูลรหัสผ่านที่แฮชแล้วจาก Supabase (ตาราง config)
    let staffPasswords: Record<string, string> = {};
    if (supabase) {
      const { data, error } = await supabase
        .from('pink69_config')
        .select('value')
        .eq('key', 'staff_passwords')
        .maybeSingle(); // ใช้ maybeSingle เผื่อยังไม่มี record
        
      if (!error && data && data.value) {
        staffPasswords = data.value;
      }
    }

    const inputHash = hashPassword(password);
    let isAuthenticated = false;

    // 2. ตรวจสอบความถูกต้องของรหัสผ่าน
    if (username in staffPasswords) {
      // มีการเปลี่ยนรหัสผ่านเฉพาะตัวแล้วในระบบ -> ตรวจสอบค่าแฮชที่บันทึกไว้
      isAuthenticated = inputHash === staffPasswords[username];
    } else {
      // ยังไม่มีการเปลี่ยนรหัสผ่านเฉพาะตัว -> รหัสผ่านเริ่มต้นคือ ID ของตัวเอง (เช่น '39967')
      const defaultHash = hashPassword(String(username));
      isAuthenticated = inputHash === defaultHash;
    }

    if (isAuthenticated) {
      return NextResponse.json({ 
        success: true, 
        message: 'เข้าสู่ระบบสำเร็จ' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสผ่านผู้ควบคุมไม่ถูกต้อง' 
      }, { status: 401 });
    }

  } catch (error) {
    console.error('[API Auth Staff Error]:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' 
    }, { status: 500 });
  }
}

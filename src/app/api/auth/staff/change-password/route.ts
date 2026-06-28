import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Helper: แฮชรหัสผ่านด้วย SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
      }, { status: 400 });
    }

    if (newPassword.trim().length < 4) {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' 
      }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่สามารถเปลี่ยนรหัสผ่านในโหมดออฟไลน์ได้ (ต้องเชื่อมต่อ Supabase)' 
      }, { status: 503 });
    }

    // 1. ดึงข้อมูลรหัสผ่านที่แฮชแล้วทั้งหมดในปัจจุบัน
    const { data: configRecord, error: getError } = await supabase
      .from('pink69_config')
      .select('value')
      .eq('key', 'staff_passwords')
      .maybeSingle();

    if (getError) {
      console.error('[Change Password Error]: Failed to fetch config:', getError);
      return NextResponse.json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการติดต่อฐานข้อมูล' 
      }, { status: 500 });
    }

    let staffPasswords: Record<string, string> = {};
    if (configRecord && configRecord.value) {
      staffPasswords = configRecord.value;
    }

    // 2. ตรวจสอบความถูกต้องของรหัสผ่านเดิม
    const oldInputHash = hashPassword(oldPassword);
    let isOldCorrect = false;

    if (username in staffPasswords) {
      isOldCorrect = oldInputHash === staffPasswords[username];
    } else {
      // รหัสผ่านเริ่มต้นคือ ID
      const defaultHash = hashPassword(String(username));
      isOldCorrect = oldInputHash === defaultHash;
    }

    // fallback ENV password
    const envStaffPassword = process.env.STAFF_PASSWORD;
    if (!isOldCorrect && envStaffPassword && oldPassword === envStaffPassword) {
      isOldCorrect = true;
    }

    if (!isOldCorrect) {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสผ่านเดิมไม่ถูกต้อง' 
      }, { status: 401 });
    }

    // 3. อัปเดตรหัสผ่านใหม่ลงตาราง config
    const newHash = hashPassword(newPassword);
    const updatedPasswords = {
      ...staffPasswords,
      [username]: newHash
    };

    const { error: updateError } = await supabase
      .from('pink69_config')
      .upsert({ 
        key: 'staff_passwords', 
        value: updatedPasswords 
      });

    if (updateError) {
      console.error('[Change Password Error]: Failed to update config:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่สามารถบันทึกรหัสผ่านใหม่ลงฐานข้อมูลได้' 
      }, { status: 500 });
    }

    // 4. บันทึกประวัติการเปลี่ยนรหัสผ่านลง Log (ไม่บันทึกความลับลง log)
    const newLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor_id: username,
      actor_name: 'ผู้ควบคุมระบบ',
      actor_role: 'ผู้ควบคุม',
      action: `เปลี่ยนรหัสผ่านส่วนตัว (ID: ${username}) ประสบความสำเร็จ`,
      target_name: null
    };
    await supabase.from('pink69_logs').insert([newLog]);

    return NextResponse.json({ 
      success: true, 
      message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' 
    });

  } catch (error) {
    console.error('[Change Password Error]:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' 
    }, { status: 500 });
  }
}

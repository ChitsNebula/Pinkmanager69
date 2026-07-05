// Script: อัปเดต controllers และ staff_passwords ใน Supabase โดยตรง
// รัน: node scripts/update-supabase-config.mjs

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozgrorajkkecadmidahg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z3JvcmFqa2tlY2FkbWlkYWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTc1NTYsImV4cCI6MjA5ODE5MzU1Nn0.7e38SNQQesKeyFy1-ucs2jmRGP-K7zZAFUq0IASloMU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🔧 เริ่มอัปเดต Supabase config...\n');

  // 1. อัปเดต controllers list
  const newControllers = ['39967', '39998', '40059', '40092'];
  const { error: ctrlError } = await supabase
    .from('pink69_config')
    .upsert({ key: 'controllers', value: newControllers });

  if (ctrlError) {
    console.error('❌ ล้มเหลวอัปเดต controllers:', ctrlError.message);
  } else {
    console.log('✅ Controllers อัปเดตแล้ว:', newControllers);
  }

  // 2. ดึง staff_passwords ปัจจุบัน
  const { data: pwData, error: pwFetchError } = await supabase
    .from('pink69_config')
    .select('value')
    .eq('key', 'staff_passwords')
    .maybeSingle();

  if (pwFetchError) {
    console.error('❌ ล้มเหลวดึง staff_passwords:', pwFetchError.message);
    return;
  }

  const currentPasswords = (pwData && pwData.value) ? pwData.value : {};
  console.log('📋 รหัสผ่านปัจจุบัน (ผู้ใช้):', Object.keys(currentPasswords));

  // 3. อัปเดตรหัสผ่าน
  const updatedPasswords = {
    ...currentPasswords,
    '40059': hashPassword('farmsutlor'),   // เปลี่ยนรหัส 40059
    '40092': hashPassword('opanrakgorfang'), // เพิ่มรหัส 40092 ใหม่
  };

  const { error: pwSaveError } = await supabase
    .from('pink69_config')
    .upsert({ key: 'staff_passwords', value: updatedPasswords });

  if (pwSaveError) {
    console.error('❌ ล้มเหลวอัปเดต staff_passwords:', pwSaveError.message);
  } else {
    console.log('✅ รหัสผ่านอัปเดตแล้ว:');
    console.log('   - 40059 (ฟาร์ม) → farmsutlor ✓');
    console.log('   - 40092 (ใหม่) → opanrakgorfang ✓');
  }

  // Verify
  const { data: verify } = await supabase
    .from('pink69_config')
    .select('key, value')
    .in('key', ['controllers', 'staff_passwords']);
  
  console.log('\n📊 ผลลัพธ์หลังอัปเดต:');
  for (const row of (verify || [])) {
    if (row.key === 'controllers') {
      console.log('  controllers:', row.value);
    } else if (row.key === 'staff_passwords') {
      console.log('  staff_passwords users:', Object.keys(row.value));
    }
  }

  console.log('\n🎉 เสร็จสิ้น!');
}

main().catch(console.error);

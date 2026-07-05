// Script: คืนค่าสมาชิกรหัส 42338 และรีเซ็ตเลขที่ห้อง ม.1/8 ให้ตรงกับค่าเริ่มต้น
// รัน: node scripts/restore-student.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozgrorajkkecadmidahg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z3JvcmFqa2tlY2FkbWlkYWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTc1NTYsImV4cCI6MjA5ODE5MzU1Nn0.7e38SNQQesKeyFy1-ucs2jmRGP-K7zZAFUq0IASloMU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ORIGINAL_M18 = {
  "42324": "1",
  "42338": "2", // ตี๋ใหญ่ (คนที่ลบ)
  "42364": "3",
  "42370": "4",
  "42388": "5",
  "42402": "6",
  "42422": "7",
  "42425": "8",
  "42427": "9",
  "42441": "10",
  "42443": "11",
  "42450": "12",
  "42453": "13",
  "42465": "14",
  "42481": "15",
  "42484": "16",
  "42492": "17",
  "42503": "18",
  "42506": "19",
  "42522": "20",
  "42529": "21",
  "42548": "22",
  "42549": "23",
  "42594": "24",
  "42602": "25",
  "42625": "26",
  "42638": "27",
  "42639": "28",
  "42651": "29",
  "42698": "30",
  "42701": "31",
  "42750": "32",
  "42751": "33",
  "42772": "34",
  "42775": "35",
  "42784": "36",
  "42817": "37",
  "42832": "38",
  "42835": "39",
  "42837": "40"
};

async function main() {
  console.log('🔄 เริ่มต้นกู้คืนข้อมูล เกียรติกุล ถาวงษ์ (ตี๋ใหญ่) ม.1/8...\n');

  // 1. ดึงข้อมูลนักเรียนทั้งหมดในปัจจุบัน
  const { data: dbStudents, error: fetchError } = await supabase
    .from('pink69_students')
    .select('*');

  if (fetchError) {
    console.error('❌ ดึงข้อมูลล้มเหลว:', fetchError.message);
    return;
  }

  // 2. ตรวจสอบว่ามี 42338 หรือยัง
  const hasTeeYai = dbStudents.some(s => s.id === '42338');

  // 3. เตรียมข้อมูลของตี๋ใหญ่เพื่ออัปโหลดกลับเข้าไป
  const teeYaiData = {
    id: '42338',
    fullname: 'เกียรติกุล ถาวงษ์ (ตี๋ใหญ่)',
    classroom: 'ม.1/8',
    number: 2,
    role: 'student_m13',
    assigned_duty: 'none',
    duty_status: 'none',
    duties: {},
    seat: null,
    rejection_reason: null,
    avatar: null,
    contact: null
  };

  // 4. ทำการ Upsert สมาชิกทั้งหมดใน ม.1/8 เพื่อคืนค่าเลขที่ที่ถูกต้อง (และคืนค่า 42338)
  const studentsToUpsert = [];

  // ใส่ตี๋ใหญ่เข้าไป
  studentsToUpsert.push(teeYaiData);

  // ค้นหานักเรียน ม.1/8 คนอื่นใน DB เพื่อมาแก้เลขที่
  dbStudents.forEach(s => {
    if (s.classroom === 'ม.1/8') {
      const originalNumberStr = ORIGINAL_M18[s.id];
      if (originalNumberStr) {
        studentsToUpsert.push({
          ...s,
          number: parseInt(originalNumberStr, 10)
        });
      }
    }
  });

  console.log(`📝 กำลังบันทึกข้อมูลนักเรียน ม.1/8 จำนวน ${studentsToUpsert.length} คนลง Supabase...`);

  const { error: upsertError } = await supabase
    .from('pink69_students')
    .upsert(studentsToUpsert);

  if (upsertError) {
    console.error('❌ ล้มเหลวระหว่างอัปเดตข้อมูล:', upsertError.message);
    return;
  }

  console.log('✅ กู้คืนข้อมูลสำเร็จ!');
  console.log('   - คืนชีพ เกียรติกุล ถาวงษ์ (ตี๋ใหญ่) [รหัส 42338, เลขที่ 2] เรียบร้อย');
  console.log('   - แก้ไขเลขที่สมาชิก ม.1/8 ทุกคนกลับเป็นปกติเรียบร้อย');
}

main().catch(console.error);

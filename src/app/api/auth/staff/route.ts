import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // ตรวจเช็คข้อมูล Staff credentials จาก Server-side environment variables
    // ปลอดภัย 100% เพราะไม่ใช้ prefix NEXT_PUBLIC_ และรันเฉพาะบนเซิร์ฟเวอร์
    const correctPassword = process.env.STAFF_PASSWORD || '123';
    
    if (password === correctPassword) {
      return NextResponse.json({ 
        success: true, 
        message: 'Authenticated successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสผ่าน Staff ไม่ถูกต้อง' 
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
export async function GET() {
  return NextResponse.json({ message: "Staff Authentication API endpoint active." });
}

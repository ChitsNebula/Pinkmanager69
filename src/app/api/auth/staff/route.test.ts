/**
 * Unit Tests: src/app/api/auth/staff/route.ts
 * ทดสอบ Server-side password checking logic
 */

import { NextResponse } from 'next/server';
import { POST, hashPassword } from './route';

// Mock Supabase client
const mockMaybeSingle = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: () => mockMaybeSingle(),
        }),
      }),
    }),
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

// Helper: สร้าง mock Request object
function makeRequest(body: object): Request {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe('POST /api/auth/staff', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    (NextResponse.json as jest.Mock).mockClear();
    mockMaybeSingle.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('ควร return 200 เมื่อรหัสผ่านตรงกับรหัสผ่านเฉพาะตัวใน Supabase config', async () => {
    const username = '39967';
    const password = 'my-new-secure-password';
    const hashed = hashPassword(password);

    // Mock คืนค่า config staff_passwords
    mockMaybeSingle.mockResolvedValue({
      data: { value: { [username]: hashed } },
      error: null,
    });

    const req = makeRequest({ username, password });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('ควร return 200 และเข้าด้วยรหัสผ่านเริ่มต้น (รหัสผ่านคือ ID ของตัวแปร username)', async () => {
    const username = '39967';
    const password = '39967'; // รหัสผ่านเริ่มต้นคือ ID

    // Mock คืนค่าเป็น empty config
    mockMaybeSingle.mockResolvedValue({
      data: { value: {} },
      error: null,
    });

    const req = makeRequest({ username, password });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('ควร return 401 เมื่อรหัสผ่านเฉพาะตัวไม่ถูกต้อง', async () => {
    const username = '39967';
    const hashed = hashPassword('correct-pass');

    mockMaybeSingle.mockResolvedValue({
      data: { value: { [username]: hashed } },
      error: null,
    });

    const req = makeRequest({ username, password: 'wrong-pass' });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      expect.objectContaining({ status: 401 }),
    );
  });

  it('ควร return 200 เมื่อใช้รหัสผ่าน STAFF_PASSWORD จาก ENV (สำหรับ backward compatibility)', async () => {
    process.env.STAFF_PASSWORD = 'env-secret-123';
    
    // Mock คืนค่าเป็น empty config
    mockMaybeSingle.mockResolvedValue({
      data: { value: {} },
      error: null,
    });

    const req = makeRequest({ username: '39967', password: 'env-secret-123' });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('ควร return 500 เมื่อเกิดข้อผิดพลาดจาก request body (JSON parse error)', async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Request;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      expect.objectContaining({ status: 500 }),
    );
  });
});

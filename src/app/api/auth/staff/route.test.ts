/**
 * Unit Tests: src/app/api/auth/staff/route.ts
 * ทดสอบ Server-side password checking logic
 *
 * หมายเหตุ: import route ตรงๆ ที่ top-level เพื่อให้ mock NextResponse ทำงานได้ถูกต้อง
 * process.env.STAFF_PASSWORD อ่านภายใน POST() ทุกครั้ง ดังนั้นไม่จำเป็นต้อง resetModules
 */

import { NextResponse } from 'next/server';
import { POST } from './route';

// Mock NextResponse ก่อน module ถูก import จริง
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
    // ล้างค่า env และ mock calls ก่อนทุก test
    process.env = { ...originalEnv };
    (NextResponse.json as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('ควร return 200 และ success: true เมื่อรหัสผ่านถูกต้อง', async () => {
    process.env.STAFF_PASSWORD = 'secret123';
    const req = makeRequest({ username: 'admin', password: 'secret123' });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('ควร return 401 และ success: false เมื่อรหัสผ่านผิด', async () => {
    process.env.STAFF_PASSWORD = 'secret123';
    const req = makeRequest({ username: 'admin', password: 'wrongpass' });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      expect.objectContaining({ status: 401 }),
    );
  });

  it('ควร return 500 เมื่อไม่มีการตั้งค่า STAFF_PASSWORD', async () => {
    delete process.env.STAFF_PASSWORD;
    const req = makeRequest({ username: 'admin', password: 'anything' });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      expect.objectContaining({ status: 500 }),
    );
  });

  it('ควร return 500 เมื่อ request body เสีย (JSON parse error)', async () => {
    process.env.STAFF_PASSWORD = 'secret123';
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

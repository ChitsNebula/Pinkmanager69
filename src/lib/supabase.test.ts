/**
 * Unit Tests: src/lib/supabase.ts
 * ทดสอบ Supabase client configuration และ isSupabaseConfigured flag
 */

describe('supabase.ts — isSupabaseConfigured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('ควร return false เมื่อไม่มี ENV vars', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('ควร return false เมื่อ URL เป็น placeholder', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-supabase-anon-key-here';

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('ควร return false เมื่อ URL ว่างเปล่า', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-valid-key';

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('ควร return false เมื่อ ANON_KEY ว่างเปล่า', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(false);
  });

  it('ควร return true เมื่อมี URL และ KEY ที่ valid', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc123.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-key';

    const { isSupabaseConfigured } = await import('./supabase');
    expect(isSupabaseConfigured).toBe(true);
  });
});

describe('supabase.ts — supabase client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('ควร return null เมื่อไม่มี ENV', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { supabase } = await import('./supabase');
    expect(supabase).toBeNull();
  });

  it('ควรสร้าง client จริงเมื่อ ENV valid', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc123.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid';

    const { supabase } = await import('./supabase');
    expect(supabase).not.toBeNull();
    expect(typeof supabase?.from).toBe('function');
  });
});

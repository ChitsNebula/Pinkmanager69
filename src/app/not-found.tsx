import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-carbon-dark flex flex-col items-center justify-center p-6 text-center font-sans">
      {/* Decorative Top Glow Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-primary via-pink-accent to-pink-primary" />

      <div className="w-full max-w-[500px] glass-panel rounded-[32px] p-10 shadow-2xl shadow-pink-primary/10 border border-pink-primary/15 relative overflow-hidden flex flex-col items-center">
        {/* Animated Pink 404 Label */}
        <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-primary to-pink-accent animate-pulse drop-shadow-[0_4px_20px_rgba(255,46,147,0.4)]">
          404
        </h1>

        <div className="w-20 h-20 bg-gradient-to-tr from-pink-primary/10 to-pink-accent/5 rounded-2xl flex items-center justify-center my-6 border border-pink-primary/20 shadow-md shadow-pink-primary/5">
          <span className="text-3xl">🔍</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">ขออภัยด้วยครับ ไม่พบหน้านี้</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-[380px]">
          ไม่พบหน้าที่ท่านกำลังค้นหาในระบบ กรุณาตรวจสอบ URL หรือคลิกปุ่มด้านล่างเพื่อกลับสู่หน้าหลักของระบบจัดการ
        </p>

        <Link
          href="/"
          className="w-full bg-gradient-to-r from-pink-primary to-pink-accent hover:from-pink-accent hover:to-pink-primary text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-pink-primary/20 hover:shadow-pink-primary/35 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          🏠 กลับสู่หน้าหลักของระบบ
        </Link>
      </div>
    </div>
  );
}

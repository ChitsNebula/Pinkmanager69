export type Role = 'student_m13' | 'student_m4' | 'student_m5' | 'staff_m5' | 'admin_president' | string;
export type Duty = 'none' | 'stand' | 'athlete' | 'procession' | 'cheerleader' | 'staff' | 'drummer' | 'band' | 'drum' | string;
export type DutyStatus = 'none' | 'pending_selection' | 'approved';

export interface Student {
  id: string; // เลขประจำตัวนักเรียน 5 หลัก
  fullname: string;
  classroom: string;
  number: string; // เลขที่
  role: Role;
  assigned_duty: Duty;
  duty_status: DutyStatus;
  duties?: { [key: string]: DutyStatus };
  seat?: string; // e.g. A1, B17
  rejection_reason?: string; // เหตุผลที่ถูกปฏิเสธหน้าที่
  avatar?: string; // รูปถ่าย/รูปประจำตัวนักกีฬา (base64 string)
}

export interface SportsEvent {
  id: string;
  name: string;
  category: string;
  lineup: string[]; // List of Student.id
}

export const INITIAL_STUDENTS: Student[] = [
  {
    "id": "42324",
    "fullname": "กฤษณพล ถาวงค์ (เตโช)",
    "classroom": "ม.1/8",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42338",
    "fullname": "เกียรติกุล ถาวงษ์ (ตี๋ใหญ่)",
    "classroom": "ม.1/8",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42364",
    "fullname": "ฑีฆาฑร บัวนาค (แท็กกี้)",
    "classroom": "ม.1/8",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42370",
    "fullname": "ณภัทร ทาวัน (โน่)",
    "classroom": "ม.1/8",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42388",
    "fullname": "ธนบดี แนวนัน (เอ)",
    "classroom": "ม.1/8",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42402",
    "fullname": "ธีธัช อุดคำมี (ธีธัช)",
    "classroom": "ม.1/8",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42422",
    "fullname": "ปองคุณ วัลลังกา (ขุน)",
    "classroom": "ม.1/8",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42425",
    "fullname": "ปุญญพัฒน์ ตาสาย (ปุณ)",
    "classroom": "ม.1/8",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42427",
    "fullname": "พงศภัค เจริญจิต (ตะวัน)",
    "classroom": "ม.1/8",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42441",
    "fullname": "ภคิน เสนาธรรม (ภูผา)",
    "classroom": "ม.1/8",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42443",
    "fullname": "ภัทนวิชญ์ สินธุชัย (น้ำเพชร)",
    "classroom": "ม.1/8",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42450",
    "fullname": "ภูผา แสงแก่ง (ภูผา)",
    "classroom": "ม.1/8",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42453",
    "fullname": "ภูริพัฒน์ นุ่มนวล (ภูริ)",
    "classroom": "ม.1/8",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42465",
    "fullname": "วิภูร์ดิษฐ์ มงคล (ตะวัน)",
    "classroom": "ม.1/8",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42481",
    "fullname": "อคิร อัครกิตติพร (อชิ)",
    "classroom": "ม.1/8",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42484",
    "fullname": "อภิชา ดีบัวภา (โอชิน)",
    "classroom": "ม.1/8",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42492",
    "fullname": "กชกร ถินสอน (ออกัส)",
    "classroom": "ม.1/8",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42503",
    "fullname": "กมลชนก สิงห์เทพ (กรีน)",
    "classroom": "ม.1/8",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42506",
    "fullname": "กมลพร ถูกจิตร (ข้าวหอม)",
    "classroom": "ม.1/8",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42522",
    "fullname": "กัญญา ม้าแก้ว (ยุ้ย)",
    "classroom": "ม.1/8",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42529",
    "fullname": "กัญญาภัทร พรชัยเจริญรัตน์ (พั้น)",
    "classroom": "ม.1/8",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42548",
    "fullname": "จรินทร์พร มากมีธนกุรชร (—ลาออก—)",
    "classroom": "ม.1/8",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42549",
    "fullname": "จิณณ์วรัชญา ขอนพิกุล (ใบพลู)",
    "classroom": "ม.1/8",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42594",
    "fullname": "ญาณัจฉรา พูลศิริ (ฟินเน่)",
    "classroom": "ม.1/8",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42602",
    "fullname": "ฐิติชญา กันทวงศ์ (แพนเค้ก)",
    "classroom": "ม.1/8",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42625",
    "fullname": "ณัฐณิชา กิติคู้ (นิเดียร์)",
    "classroom": "ม.1/8",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42638",
    "fullname": "ณิชารีย์ หอวิจิตร์ (ดีดี้)",
    "classroom": "ม.1/8",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42639",
    "fullname": "ณศรา ศรีทองแท้ (น้ำขิง)",
    "classroom": "ม.1/8",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42651",
    "fullname": "ธฤดี ทองดวง (มายด์)",
    "classroom": "ม.1/8",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42698",
    "fullname": "ปทิตตา สบายสุข (เอเชีย)",
    "classroom": "ม.1/8",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42701",
    "fullname": "ปราณปรียา คะซา (อัยญ่า)",
    "classroom": "ม.1/8",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42750",
    "fullname": "พิมพ์ปวีณ์ หงษ์วงศ์ (ทับทิม)",
    "classroom": "ม.1/8",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42751",
    "fullname": "พิมพ์พิชชา รุ่งทวีศักดิ์ (เหมย)",
    "classroom": "ม.1/8",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42772",
    "fullname": "ภูริชชญา จิตพยัค (พรีม)",
    "classroom": "ม.1/8",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42775",
    "fullname": "มนัญชยา โสภา (สกรีน)",
    "classroom": "ม.1/8",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42784",
    "fullname": "รัชฎาภรณ์ อารมณ์ (อิม)",
    "classroom": "ม.1/8",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42817",
    "fullname": "สิริวิมล ยอดเป็ง (ขนุน)",
    "classroom": "ม.1/8",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42832",
    "fullname": "อภิชญา จันทราทิพย์ (มัดหมี่)",
    "classroom": "ม.1/8",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42835",
    "fullname": "อริสรา บุญทิพย์ (กีต้า)",
    "classroom": "ม.1/8",
    "number": "39",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42837",
    "fullname": "อลิชา แสนผาทอง (เอย)",
    "classroom": "ม.1/8",
    "number": "40",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42318",
    "fullname": "กฤตภัค พิมเสน (ออโต้)",
    "classroom": "ม.1/10",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42327",
    "fullname": "กล้าตะวัน กาบเกี้ยว (ตะวัน)",
    "classroom": "ม.1/10",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42328",
    "fullname": "กษิดิ์เดช กุนนา (เก้า)",
    "classroom": "ม.1/10",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42333",
    "fullname": "กันตภณ ฝั้นเต็ม (กัน)",
    "classroom": "ม.1/10",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42353",
    "fullname": "ชนากฤติ สุดคะวงศ์ (กัส)",
    "classroom": "ม.1/10",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42369",
    "fullname": "ณพิชญ์ แพทย์เมืองพรวญ (เอิร์ท)",
    "classroom": "ม.1/10",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42379",
    "fullname": "เดชินท์ สารีอ่อน (โชกุน)",
    "classroom": "ม.1/10",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42389",
    "fullname": "ธนพัฒน์ ปุนปัน (เจ๋ง)",
    "classroom": "ม.1/10",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42408",
    "fullname": "นนท์ปวิธ เชื้อชัย (เติ้ล)",
    "classroom": "ม.1/10",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42411",
    "fullname": "นฤบดินทร์ รุ่งเรืองปัญญา (ร๊อคกี้)",
    "classroom": "ม.1/10",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42416",
    "fullname": "ปภาวิน อุดมศรี (ปลื้ม)",
    "classroom": "ม.1/10",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42477",
    "fullname": "สิริมงคล สมหมาย (เฌอแตม)",
    "classroom": "ม.1/10",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42495",
    "fullname": "กนกพร ดอกจำปา (สมายด์)",
    "classroom": "ม.1/10",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42498",
    "fullname": "กนกพิชญ์ วังคะออม (มะนาว)",
    "classroom": "ม.1/10",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42510",
    "fullname": "กรวรรณ ระนา (อันดา)",
    "classroom": "ม.1/10",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42531",
    "fullname": "กัญญณัช ป่าเมือง (เบกัส)",
    "classroom": "ม.1/10",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42539",
    "fullname": "กิรณา ปรีดีวรรณกุล (แอนฟิว)",
    "classroom": "ม.1/10",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42546",
    "fullname": "เขมิกา ศรีสิงห์ (ชะเอม)",
    "classroom": "ม.1/10",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42560",
    "fullname": "จุฑาทิบดิ์ กลีบใบ (แพรวา)",
    "classroom": "ม.1/10",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42573",
    "fullname": "ชนม์ณกานต์ ศรีเจริญบวรภัค (โมจิ)",
    "classroom": "ม.1/10",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42579",
    "fullname": "ชนิตา อุดมพล (ยิ้ม)",
    "classroom": "ม.1/10",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42610",
    "fullname": "ณัชชุฎา อภิสิทธิเกษม (วาวา)",
    "classroom": "ม.1/10",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42637",
    "fullname": "ณิชาภัทร สมรส (ดอลล่า)",
    "classroom": "ม.1/10",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42644",
    "fullname": "ทัศนียา อุ่นใจ (เคส)",
    "classroom": "ม.1/10",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42647",
    "fullname": "ทิพาพร อภิรมย์ (แยมโรล)",
    "classroom": "ม.1/10",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42684",
    "fullname": "บวรฉัตร มุ้งทอง (น้ำมน)",
    "classroom": "ม.1/10",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42685",
    "fullname": "บุญชนิต ผ่าเรือนดี (เอวา)",
    "classroom": "ม.1/10",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42709",
    "fullname": "ปวิณ์ดา อุทัยศิลป์ (ลดา)",
    "classroom": "ม.1/10",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42728",
    "fullname": "พรปวีณ์ อุปธิ (ต้นน้ำ)",
    "classroom": "ม.1/10",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42739",
    "fullname": "พัทธนันท์ สุโรพันธ์ (เค้ก)",
    "classroom": "ม.1/10",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42752",
    "fullname": "พิมพ์มาดา ม่วงคำ (โฟกัส)",
    "classroom": "ม.1/10",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42754",
    "fullname": "พิมพ์ลภัส หม้อกรอง (พรีม)",
    "classroom": "ม.1/10",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42755",
    "fullname": "พิยดา วังกาวี (แป้ง)",
    "classroom": "ม.1/10",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42766",
    "fullname": "ภัทรวดี ป่าธนู (การ์ตูน)",
    "classroom": "ม.1/10",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42782",
    "fullname": "รดาธร จันกระจ่าง (นิดา)",
    "classroom": "ม.1/10",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42786",
    "fullname": "รินรดา ฉิมภารส (เก็ต)",
    "classroom": "ม.1/10",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42804",
    "fullname": "ศศิประภา สิทธิประยงค์ (เหมยอิง)",
    "classroom": "ม.1/10",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42816",
    "fullname": "สิริวิภา รับขวัญ (คิตตี้)",
    "classroom": "ม.1/10",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42830",
    "fullname": "อนันตญา ศักดิ์ดา (เมเปิ้ล)",
    "classroom": "ม.1/10",
    "number": "39",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42845",
    "fullname": "อุรัสญา คงยืน (ใบเตย)",
    "classroom": "ม.1/10",
    "number": "40",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41728",
    "fullname": "ณปภัช เพชรรัตน์ (ปุณณ์ปัณณ์)",
    "classroom": "ม.2/1",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41729",
    "fullname": "ณภัทร์ โกสีย์ศิริกุล (ฟง)",
    "classroom": "ม.2/1",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41738",
    "fullname": "ณัฐพัฒน์ เทพศุภร (มีน)",
    "classroom": "ม.2/1",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41754",
    "fullname": "ธนบดี สุทธิกุลธนกิจ (แชมป์เปี้ยน)",
    "classroom": "ม.2/1",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41819",
    "fullname": "วราเมธ เปรมพุ่ม (ฟิม)",
    "classroom": "ม.2/1",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41824",
    "fullname": "ศิรวิทย์ ไชยบุญเรือง (โจอี้)",
    "classroom": "ม.2/1",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41836",
    "fullname": "อชิตะ พื้นดี (ออกัส)",
    "classroom": "ม.2/1",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41852",
    "fullname": "กนกลักษณ์ สงคราม (แพรวา)",
    "classroom": "ม.2/1",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41861",
    "fullname": "กมลลักษณ์ จานแก้ว (จอม)",
    "classroom": "ม.2/1",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41878",
    "fullname": "กัญญารัตน์ ชัยเจริญ (แก้มบุ๋ม)",
    "classroom": "ม.2/1",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41893",
    "fullname": "เขมจิรา ผ่องสะอาด (นิดา)",
    "classroom": "ม.2/1",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41895",
    "fullname": "คุณณุงทอง ทองประไพ (กาแฟ)",
    "classroom": "ม.2/1",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41899",
    "fullname": "จรินทร์ภรณ์ เหมือนรอดดี (ชิวเทียน)",
    "classroom": "ม.2/1",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41909",
    "fullname": "จิรัชญา พุมิไชยจรรยา (อัยย์)",
    "classroom": "ม.2/1",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41951",
    "fullname": "ณัชชา วงศารัตนศิลป์ (คิมเบอร์รี่)",
    "classroom": "ม.2/1",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41953",
    "fullname": "ณัชภัส ตั้งตรงจิตร (ต้นข้าว)",
    "classroom": "ม.2/1",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41962",
    "fullname": "ณัฐกมล วรรณโร (ณัฐ)",
    "classroom": "ม.2/1",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41963",
    "fullname": "ณัฐชยา วงศ์วงศ์ (มุนิน)",
    "classroom": "ม.2/1",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41970",
    "fullname": "ณัฐณิชา ดอกแก้ว (มินนี่)",
    "classroom": "ม.2/1",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42025",
    "fullname": "ธัญวรัตน์ อรุณโรจน์ (ขิม)",
    "classroom": "ม.2/1",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42050",
    "fullname": "ปภาดา สวนบ่อแร่ (ณิชา)",
    "classroom": "ม.2/1",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42065",
    "fullname": "ปิยะฉัตร พอทำ (อุ้งอิ้ง)",
    "classroom": "ม.2/1",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42081",
    "fullname": "พรรณวรท พงษ์เจตสุพรรณ (โบนัส)",
    "classroom": "ม.2/1",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42093",
    "fullname": "พิชญธิดา ศรีคำ (ยินดี)",
    "classroom": "ม.2/1",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42119",
    "fullname": "ภัสสินี ดูเหว่า (นีน่า)",
    "classroom": "ม.2/1",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42126",
    "fullname": "ภูริชญา นันตา (ต้นหนาว)",
    "classroom": "ม.2/1",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42130",
    "fullname": "เมลิณี เฉยโพธิ์ (ชมพู่)",
    "classroom": "ม.2/1",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42137",
    "fullname": "รวินท์นิภา จบแล้ว (ไบร์ท)",
    "classroom": "ม.2/1",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42144",
    "fullname": "รุจา จันทรานิมิตร (รุจา)",
    "classroom": "ม.2/1",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42194",
    "fullname": "สิริกร ชำนาญ (น้ำหอม)",
    "classroom": "ม.2/1",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41720",
    "fullname": "ชัชพล วรรณมณี (มาร์ค)",
    "classroom": "ม.2/6",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41736",
    "fullname": "ณัฐพนธ์ ป่าธนู (ต้า)",
    "classroom": "ม.2/6",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41742",
    "fullname": "ดุลยทรรศน์ ไชยา (อิคคิว)",
    "classroom": "ม.2/6",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41743",
    "fullname": "เดชาณัฐ ไชยวงศ์ศิลป์ (กีต้า)",
    "classroom": "ม.2/6",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41766",
    "fullname": "ธีรภัทร วุฒิโอสถ (เต็งหนึ่ง)",
    "classroom": "ม.2/6",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41775",
    "fullname": "ปภาวิน กลีบใบ (โอบ)",
    "classroom": "ม.2/6",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41801",
    "fullname": "ภัคศรัณย์ พยาราช (ยูฟ่า)",
    "classroom": "ม.2/6",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41880",
    "fullname": "กันตพร เขื่อนเก้า (น้ำข้าว)",
    "classroom": "ม.2/6",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41885",
    "fullname": "กิตติญา ทารเนต (แป้ง)",
    "classroom": "ม.2/6",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41887",
    "fullname": "กุลรดา สิริมณีพิพัฒน์ (รดา)",
    "classroom": "ม.2/6",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41908",
    "fullname": "จิรภิญญา หิรัญพิทักษ์ (ข้าวฟ่าง)",
    "classroom": "ม.2/6",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41915",
    "fullname": "ชญาพิมพ์ ประสารยา (ข้าวตัง)",
    "classroom": "ม.2/6",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41916",
    "fullname": "ชญาภา หมดห่วง (เฟรช)",
    "classroom": "ม.2/6",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41919",
    "fullname": "ชนิกานต์ อิปิน (โฟกัส)",
    "classroom": "ม.2/6",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41922",
    "fullname": "ชรินทร์ทิพย์ พลอยเขียว (ข้าวหอม)",
    "classroom": "ม.2/6",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41929",
    "fullname": "ชาลิดา แปงศิลป์ (ชมพู่)",
    "classroom": "ม.2/6",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41936",
    "fullname": "ฐิตาภา อิ่มรส (ออมสิน)",
    "classroom": "ม.2/6",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41937",
    "fullname": "ฐิตารีย์ อำพันพงษ์ (ไข่มุก)",
    "classroom": "ม.2/6",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41940",
    "fullname": "ฐิติยา แมตสอง (ใบเฟิร์น)",
    "classroom": "ม.2/6",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41957",
    "fullname": "ณัฏฐ์ธิดา ยะปะนันท์ (นีน่า)",
    "classroom": "ม.2/6",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41965",
    "fullname": "ณัฐชา เพียรทอง (น้ำพั้น)",
    "classroom": "ม.2/6",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41976",
    "fullname": "ณัฐธิดา ทาสี (นอย)",
    "classroom": "ม.2/6",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41980",
    "fullname": "ณัฐพร เป็นอัน (ขนมจีน)",
    "classroom": "ม.2/6",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41993",
    "fullname": "ณิชาวรินทร์ เขื่อนเขตร (เฟรชชี่)",
    "classroom": "ม.2/6",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42003",
    "fullname": "ธนัชญา เสือเหลือง (เนเน่)",
    "classroom": "ม.2/6",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42014",
    "fullname": "ธัญชนก ประใจ (เนท)",
    "classroom": "ม.2/6",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42046",
    "fullname": "เบญญาพร ถุงพลอย (บิ๊กไบร์ท)",
    "classroom": "ม.2/6",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42049",
    "fullname": "ปภากานต์ ชุมภู (ขิม)",
    "classroom": "ม.2/6",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42071",
    "fullname": "ปุณญานุช เมฆกิจ (ปาย)",
    "classroom": "ม.2/6",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42080",
    "fullname": "พรรณปพร แพะคำ (อิงอิง)",
    "classroom": "ม.2/6",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42088",
    "fullname": "พาขวัญ งามดี (พลอย)",
    "classroom": "ม.2/6",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42089",
    "fullname": "พาขวัญ แพทย์ยา (ข้าวตัง)",
    "classroom": "ม.2/6",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42094",
    "fullname": "พิชญา โกมลรัตน์ (ต้องตา)",
    "classroom": "ม.2/6",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42103",
    "fullname": "พิพาดา ใจกลม (พิ้งค์กี้)",
    "classroom": "ม.2/6",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42134",
    "fullname": "รมย์มณี อิ่นแก้ว (โบนัส)",
    "classroom": "ม.2/6",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42152",
    "fullname": "วรดา วงศ์โพธิ์ (กีต้า)",
    "classroom": "ม.2/6",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42160",
    "fullname": "วรัญญา เหลืองสมบูรณ์ (หมิงๆ)",
    "classroom": "ม.2/6",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42169",
    "fullname": "วีรภัทรา หน่อแก้วบุตร (กรีน)",
    "classroom": "ม.2/6",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42195",
    "fullname": "สิริกาญจน์ สายาจักน์ (แนน)",
    "classroom": "ม.2/6",
    "number": "39",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42197",
    "fullname": "สิริภัทร วงศ์ชัยพานิชย์ (แวววาว)",
    "classroom": "ม.2/6",
    "number": "40",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41699",
    "fullname": "กรวิชญ์ ศรีรักษ์ (ฟีโน่)",
    "classroom": "ม.2/14",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41730",
    "fullname": "ณภัทร พันธุเวช (พอตเตอร์)",
    "classroom": "ม.2/14",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41735",
    "fullname": "ณัฐนันท์ แก้วจริยานุวัตร (โต๋)",
    "classroom": "ม.2/14",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41779",
    "fullname": "ปวันสรรค์ เขื่อนแก้ว (ข้าวโอ็ต)",
    "classroom": "ม.2/14",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41835",
    "fullname": "สุภัทน์ นุ่นวงกด (สอง)",
    "classroom": "ม.2/14",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41839",
    "fullname": "อธิวัฒน์ ดอนดง (สแตมป์)",
    "classroom": "ม.2/14",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41750",
    "fullname": "นนท์นภัส อภัยกาวี",
    "classroom": "ม.2/14",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41860",
    "fullname": "กมลพรรณ สุขกมลกุล (คุนคุน)",
    "classroom": "ม.2/14",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41862",
    "fullname": "กรกมล แก้วสีทอง (ใบบัว)",
    "classroom": "ม.2/14",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41871",
    "fullname": "กัญญพัชร รัตนชมภู (กวาง)",
    "classroom": "ม.2/14",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41881",
    "fullname": "กันยกร เรือนสังข์ (กัน)",
    "classroom": "ม.2/14",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41907",
    "fullname": "จิรภิญญา เชิดอยู่ (วุ้นเส้น)",
    "classroom": "ม.2/14",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41914",
    "fullname": "ชญานิศ ชุมภูอินทร์ (ไอเดีย)",
    "classroom": "ม.2/14",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41918",
    "fullname": "ชนิกานต์ แก้ววิเศษ (ตอมแตมป์)",
    "classroom": "ม.2/14",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41934",
    "fullname": "ณมชล คังคา (ทับทิม)",
    "classroom": "ม.2/14",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41938",
    "fullname": "ฐิติภัทรา วังกาวรรณ (ข้าวฟ่าง)",
    "classroom": "ม.2/14",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41945",
    "fullname": "ณภัทรสรา วัชรนันทกร (นท)",
    "classroom": "ม.2/14",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41948",
    "fullname": "ณรรฐ์ทิวา วิชาชาติ (ต้นข้าว)",
    "classroom": "ม.2/14",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41955",
    "fullname": "ณัฏฐณิชา ชุมภูอินทร์ (ฟาง)",
    "classroom": "ม.2/14",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41959",
    "fullname": "ณัฏฐจิตรา ดวงวิโรจน์ (ปริ้น)",
    "classroom": "ม.2/14",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41964",
    "fullname": "ณัฐชา ชัดศรี (มะนาว)",
    "classroom": "ม.2/14",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41987",
    "fullname": "ณิชชาภัทร สายยืด (เปียโน)",
    "classroom": "ม.2/14",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41994",
    "fullname": "ณิญาดา เมืองมูล (ไอด้า)",
    "classroom": "ม.2/14",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42024",
    "fullname": "ธัญลักษณ์ อุปการ (เอบี)",
    "classroom": "ม.2/14",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42033",
    "fullname": "นรีกานต์ วิโรจน์เรืองรัตน์ (ใบหม่อน)",
    "classroom": "ม.2/14",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42039",
    "fullname": "นารดา เตปินตา (อิมอิม)",
    "classroom": "ม.2/14",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42045",
    "fullname": "เบญจมาศ ทับขำ (มิก)",
    "classroom": "ม.2/14",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42053",
    "fullname": "ปราณปรียา ปิ่นทอง (เพียงออ)",
    "classroom": "ม.2/14",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42063",
    "fullname": "ปิยฉัตร เพิ่มผล (หนูจี๊ด)",
    "classroom": "ม.2/14",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42070",
    "fullname": "ปัญรวิภา ทองแก้ว (ขวัญข้าว)",
    "classroom": "ม.2/14",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42095",
    "fullname": "พิชญา วงค์ฉายา (อุ๋งอิ๋ง)",
    "classroom": "ม.2/14",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42107",
    "fullname": "พิมพ์มาดา จิตไพศาล (กีต้าร์)",
    "classroom": "ม.2/14",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42110",
    "fullname": "พิมพ์วิมล ศรีวงษา (มาหยา)",
    "classroom": "ม.2/14",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42124",
    "fullname": "ภูริชญา กาศเจริญ (ไบร์ท)",
    "classroom": "ม.2/14",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42131",
    "fullname": "ยลรดี กาศสนุก (กล้วยหอม)",
    "classroom": "ม.2/14",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42177",
    "fullname": "ศิริกัญญา แก้วเอี่ยม (กิ้ฟ)",
    "classroom": "ม.2/14",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42191",
    "fullname": "สาธิดา ชุมภูหมุด (จุ๊บจิ้บ)",
    "classroom": "ม.2/14",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42204",
    "fullname": "สุพรรษา เรือนแสน (แก้มใส)",
    "classroom": "ม.2/14",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42209",
    "fullname": "สุรัสวดี สาระวะ (นาโน)",
    "classroom": "ม.2/14",
    "number": "39",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42227",
    "fullname": "อุรสยา คำมา (ตังตัง)",
    "classroom": "ม.2/14",
    "number": "40",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42928",
    "fullname": "ชนรัตน์ ช้องกา (ไข่ขวัญ)",
    "classroom": "ม.2/14",
    "number": "41",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41182",
    "fullname": "ชินพัฒน์ อินทะอุด (น็อต)",
    "classroom": "ม.3/9",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41222",
    "fullname": "ณัฏฐากร มุกดามาศ (ลิปตัน)",
    "classroom": "ม.3/9",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41447",
    "fullname": "ภชรพล หมื่นโฮ้ง (อิคคิว)",
    "classroom": "ม.3/9",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41548",
    "fullname": "สวณัฐกร เรืองเจริญ (กอว่าน)",
    "classroom": "ม.3/9",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41565",
    "fullname": "สุรพงศ์ แห่งศรีสุวรรณ (ฟีน)",
    "classroom": "ม.3/9",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41106",
    "fullname": "กัญญ์วรา เชี่ยวชาญ (ไบร์ท)",
    "classroom": "ม.3/9",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41110",
    "fullname": "กัญญ์พชร เชี่ยวชาญ (เจต)",
    "classroom": "ม.3/9",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41111",
    "fullname": "กัญญณัค เมตตา (ตอง)",
    "classroom": "ม.3/9",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41119",
    "fullname": "กันยาวีร์ อิ่นแก้วน่าน (แพม)",
    "classroom": "ม.3/9",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41131",
    "fullname": "กุลธิดา เช็ดขาม (กีต้า)",
    "classroom": "ม.3/9",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41134",
    "fullname": "กุลลักษณ์ แสนย่าง (น้ำหนาว)",
    "classroom": "ม.3/9",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41135",
    "fullname": "เกวลิน แก้วมา (ข้าวฟ่าง)",
    "classroom": "ม.3/9",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41144",
    "fullname": "คีตา แต้มกิตติกุล (อินดี้)",
    "classroom": "ม.3/9",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41148",
    "fullname": "จิรชยา เสือเพ็ชร์ (ใยไหม)",
    "classroom": "ม.3/9",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41149",
    "fullname": "จิรภิญญา ฝั้นชมภู (ใบหม่อน)",
    "classroom": "ม.3/9",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41150",
    "fullname": "จิรัชญา รอบเมือง (น้ำหวาน)",
    "classroom": "ม.3/9",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41156",
    "fullname": "จุฑามาศ แสนกิ่ง (โฟกัส)",
    "classroom": "ม.3/9",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41159",
    "fullname": "ฉัตรชนก เชียงคำ (นาโน)",
    "classroom": "ม.3/9",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41209",
    "fullname": "ณัจฉรียา ขวัญเจริญ (บีม)",
    "classroom": "ม.3/9",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41218",
    "fullname": "ณัฏฐธิตา ขันทรัตน์ (ไอติม)",
    "classroom": "ม.3/9",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41257",
    "fullname": "ทิฆัมพร กองคำ (ญาญ่า)",
    "classroom": "ม.3/9",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41266",
    "fullname": "ธนภรณ์ ศรีวิลัย (สายไหม)",
    "classroom": "ม.3/9",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41267",
    "fullname": "ธนวรรณ สนแก้ว (หลิน)",
    "classroom": "ม.3/9",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41275",
    "fullname": "ธนัญญา ชะชิกุล (หยก)",
    "classroom": "ม.3/9",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41281",
    "fullname": "ธวัลรัตน์ เหมืองหม้อ (ซีเนม)",
    "classroom": "ม.3/9",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41286",
    "fullname": "ธัญธิตา กาบบัว (จ๊ะจ๋า)",
    "classroom": "ม.3/9",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41319",
    "fullname": "นันทรัตน์ โกคัย (เตอร์)",
    "classroom": "ม.3/9",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41326",
    "fullname": "น้ำทิพย์ วิระษร (นะโม)",
    "classroom": "ม.3/9",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41353",
    "fullname": "ปรียาพร บุณยเกียรติ (มานา)",
    "classroom": "ม.3/9",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41363",
    "fullname": "ปิ่นยุภา ประสารยา (โมลิ)",
    "classroom": "ม.3/9",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41378",
    "fullname": "ปุณยนุช ลิ้มโพธิ์เงิน (ชมพู่)",
    "classroom": "ม.3/9",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41424",
    "fullname": "พิมชนก เวียงนิล (เบล)",
    "classroom": "ม.3/9",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41436",
    "fullname": "พิริยา เงินคง (โมจิ)",
    "classroom": "ม.3/9",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41451",
    "fullname": "ภวันรัตน์ เบื้องสุวรรณ์ (จิงจิง)",
    "classroom": "ม.3/9",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41452",
    "fullname": "ภัคฐลัญธ์ ภูมิจิตรมนัส (ผิงผิง)",
    "classroom": "ม.3/9",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41517",
    "fullname": "วิรัชฎา มณฑา (ใบขิง)",
    "classroom": "ม.3/9",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41520",
    "fullname": "ศรัณภัสร์ ดิลกหิรัณย์กุล (ข้าวหอม)",
    "classroom": "ม.3/9",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41555",
    "fullname": "สุชัญญา อุปนันชัย (มายเดียร์)",
    "classroom": "ม.3/9",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41092",
    "fullname": "กลวัฒน์ ยืนนาน (ออโต้)",
    "classroom": "ม.3/13",
    "number": "1",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41094",
    "fullname": "กวินท์ อุปนันท์ (กวินท์)",
    "classroom": "ม.3/13",
    "number": "2",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41202",
    "fullname": "ณพัฒน์ รัตนพิทักษ์กุล (ฟิล์ม)",
    "classroom": "ม.3/13",
    "number": "3",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41296",
    "fullname": "ธีรวัฒน์ โสภณปิยวัฒน์ (แน็กซ์)",
    "classroom": "ม.3/13",
    "number": "4",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41320",
    "fullname": "นันทวัฒน์ สุกแก้ว (เนต)",
    "classroom": "ม.3/13",
    "number": "5",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41399",
    "fullname": "พัทธนันท์ วารีกุล (ปลื้ม)",
    "classroom": "ม.3/13",
    "number": "6",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41438",
    "fullname": "พีรวิชญ์ เสนาธรรม (ปังปอนด์)",
    "classroom": "ม.3/13",
    "number": "7",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41467",
    "fullname": "ภูตะวัน ธงสิบเจ็ด (โมเดล)",
    "classroom": "ม.3/13",
    "number": "8",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41490",
    "fullname": "รังศิพัฒน์ ตาอินทร (ปีโป้)",
    "classroom": "ม.3/13",
    "number": "9",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41518",
    "fullname": "วุฒิชัย จันทร์คำ (ยิม)",
    "classroom": "ม.3/13",
    "number": "10",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41519",
    "fullname": "ศรวัส คชสาร (ปลื้ม)",
    "classroom": "ม.3/13",
    "number": "11",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41539",
    "fullname": "ศุภสัณฑ์ สุขผ่อง (ปาล์ม)",
    "classroom": "ม.3/13",
    "number": "12",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41550",
    "fullname": "สิทธินนท์ บกบี้ (มอส)",
    "classroom": "ม.3/13",
    "number": "13",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42929",
    "fullname": "พศวัต จะรอนรัมย์ (พักตร์)",
    "classroom": "ม.3/13",
    "number": "14",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41072",
    "fullname": "กนกมล เจริญศิริ (แพรวา)",
    "classroom": "ม.3/13",
    "number": "15",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41077",
    "fullname": "กนกวรรณ ศรีโพธา (ปรายดาว)",
    "classroom": "ม.3/13",
    "number": "16",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41098",
    "fullname": "ณทิรา อู่เงิน (มันปู)",
    "classroom": "ม.3/13",
    "number": "17",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41103",
    "fullname": "กัญญภัค เจริญจิต (ส้มโอ)",
    "classroom": "ม.3/13",
    "number": "18",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41125",
    "fullname": "กานต์ธิดา ธงหนึ่ง (อิงอิง)",
    "classroom": "ม.3/13",
    "number": "19",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41187",
    "fullname": "ญาณาธิป ยุทธแสน (ปาย)",
    "classroom": "ม.3/13",
    "number": "20",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41227",
    "fullname": "ณัฐชยา พูนทวีป (มายมิ้น)",
    "classroom": "ม.3/13",
    "number": "21",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41246",
    "fullname": "ณิชาภัทร วรินทร์ (อาย)",
    "classroom": "ม.3/13",
    "number": "22",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41287",
    "fullname": "ธัญพิชชา อินทรสัตยพงศ์ (นิ้ง)",
    "classroom": "ม.3/13",
    "number": "23",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41292",
    "fullname": "ธิดาขวัญ จิตธบุญ (มันนี่)",
    "classroom": "ม.3/13",
    "number": "24",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41304",
    "fullname": "ณรมน อุยาณะ (หยก)",
    "classroom": "ม.3/13",
    "number": "25",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41347",
    "fullname": "ประภัสสิริ กันทาบุตร (โฟกัส)",
    "classroom": "ม.3/13",
    "number": "26",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41364",
    "fullname": "ปิยธิดา ขันตา (สายป่าน)",
    "classroom": "ม.3/13",
    "number": "27",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41381",
    "fullname": "เปรมกมล ครองสุข (ออม)",
    "classroom": "ม.3/13",
    "number": "28",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41415",
    "fullname": "พิชญาภัค สายาจักร (พลอยใส)",
    "classroom": "ม.3/13",
    "number": "29",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41443",
    "fullname": "แพรวา วีรธนศิลป์ (น้ำอิง)",
    "classroom": "ม.3/13",
    "number": "30",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41445",
    "fullname": "ฟ้าใส เกิดสุข (ฟ้าใส)",
    "classroom": "ม.3/13",
    "number": "31",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41487",
    "fullname": "รมิตา เรือนพรม (วิว)",
    "classroom": "ม.3/13",
    "number": "32",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41496",
    "fullname": "ฤทัยชนก เรือนแสน (จ๊ะจ๋า)",
    "classroom": "ม.3/13",
    "number": "33",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41511",
    "fullname": "วันวิสาสา ราชวัง (แบม)",
    "classroom": "ม.3/13",
    "number": "34",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41522",
    "fullname": "ศรุดา แก้วโมรา (ปริม)",
    "classroom": "ม.3/13",
    "number": "35",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41562",
    "fullname": "สุภัสสร หวายลี (อะตอม)",
    "classroom": "ม.3/13",
    "number": "36",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41566",
    "fullname": "สุริญาพัศ จันทะนะ (นีร)",
    "classroom": "ม.3/13",
    "number": "37",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "41579",
    "fullname": "อภิชญา ชมเชย (ไอซ์)",
    "classroom": "ม.3/13",
    "number": "38",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42930",
    "fullname": "ณวิษา วงศ์ค่า (แป้ง)",
    "classroom": "ม.3/13",
    "number": "39",
    "role": "student_m13",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40514",
    "fullname": "กฤตยชญ์ สุขภัทรสิริ (ภูริ)",
    "classroom": "ม.4/1",
    "number": "1",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40519",
    "fullname": "กษิดิ์เดช สมรส (ฟีฟ่า)",
    "classroom": "ม.4/1",
    "number": "2",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40609",
    "fullname": "ไชยภพ ผึ่งผาย (โกเบ)",
    "classroom": "ม.4/1",
    "number": "3",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40612",
    "fullname": "ญาณวุฒิ เนตรจำนงค์ (อูชิ)",
    "classroom": "ม.4/1",
    "number": "4",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40657",
    "fullname": "ณัฐพงษ์ ศรีใจวงศ์ (มอส)",
    "classroom": "ม.4/1",
    "number": "5",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40788",
    "fullname": "ปัณณวิชญ์ หาญสมุทร (ปัน)",
    "classroom": "ม.4/1",
    "number": "6",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40847",
    "fullname": "ภคนันท์ นันทจักร์ (ข้าวกล้อง)",
    "classroom": "ม.4/1",
    "number": "7",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40929",
    "fullname": "ศศิวัฒน์ พงษ์พัศภิญโญ (ทรอย)",
    "classroom": "ม.4/1",
    "number": "8",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42879",
    "fullname": "ธนโชติ ศรีบุญเรือง (คอม)",
    "classroom": "ม.4/1",
    "number": "9",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42899",
    "fullname": "พลาธิป จันรุณ (ต้นก้า)",
    "classroom": "ม.4/1",
    "number": "10",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40531",
    "fullname": "กัณชารีย์ อุ่มบางตลาด (ธูปหอม)",
    "classroom": "ม.4/1",
    "number": "11",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40563",
    "fullname": "ขวัญหล้า สุดใจ (นาง)",
    "classroom": "ม.4/1",
    "number": "12",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40568",
    "fullname": "จารุกัญญ์ นันตา (อองฟอง)",
    "classroom": "ม.4/1",
    "number": "13",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40622",
    "fullname": "ณชนิชา ไชยมงคล (ดิ้วตี้)",
    "classroom": "ม.4/1",
    "number": "14",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40627",
    "fullname": "ณปภัสร ตั้งตรงจิตร (ต้นหอม)",
    "classroom": "ม.4/1",
    "number": "15",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40633",
    "fullname": "ณัชชา ศรีสุระ (ใจเอย)",
    "classroom": "ม.4/1",
    "number": "16",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40643",
    "fullname": "ณัฏฐา เทพจันที (นาย)",
    "classroom": "ม.4/1",
    "number": "17",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40651",
    "fullname": "ณัฐณิชา ทองตัน (กอข้าว)",
    "classroom": "ม.4/1",
    "number": "18",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40686",
    "fullname": "ทิพย์วรางค์ เสนาธรรม (ก้านพลู)",
    "classroom": "ม.4/1",
    "number": "19",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40687",
    "fullname": "ธนกร ปิ่นจงมีสุข (น้ำว้า)",
    "classroom": "ม.4/1",
    "number": "20",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40757",
    "fullname": "นิรภัฏ นาเวียง (โปรแกรม)",
    "classroom": "ม.4/1",
    "number": "21",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40792",
    "fullname": "ปานรดา ทิพย์ปัญญา (เปเป้)",
    "classroom": "ม.4/1",
    "number": "22",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40804",
    "fullname": "ปุณยวีร์ กันยามี (อัณณ์)",
    "classroom": "ม.4/1",
    "number": "23",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40830",
    "fullname": "พิชญกานต์ อินกัน (เอิร์น)",
    "classroom": "ม.4/1",
    "number": "24",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40864",
    "fullname": "ภิญญาพัชญ์ เวียงทอง (แพนเค้ก)",
    "classroom": "ม.4/1",
    "number": "25",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40902",
    "fullname": "วรัชยา ร่องพืช (น้ำขิง)",
    "classroom": "ม.4/1",
    "number": "26",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40926",
    "fullname": "ศรุตยา กิงโคง (ข้าวหอม)",
    "classroom": "ม.4/1",
    "number": "27",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40928",
    "fullname": "ศศิมินตรา สุวรรณกาศ (ใบบัว)",
    "classroom": "ม.4/1",
    "number": "28",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42877",
    "fullname": "ดารารัตน์ ยินดี (น้ำหวาน)",
    "classroom": "ม.4/1",
    "number": "29",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42901",
    "fullname": "พิชญดา ผัดขัน (ข้าวฟ่าง)",
    "classroom": "ม.4/1",
    "number": "30",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40611",
    "fullname": "ญาณทัศน์ วงศ์สุวคันธ",
    "classroom": "ม.4/3",
    "number": "1",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40621",
    "fullname": "ฑีฆายุ บัวนาค",
    "classroom": "ม.4/3",
    "number": "2",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40801",
    "fullname": "ปุญญวัต รูปสม",
    "classroom": "ม.4/3",
    "number": "3",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40883",
    "fullname": "ลภัสกร วงศ์วุฒิ",
    "classroom": "ม.4/3",
    "number": "4",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40892",
    "fullname": "วชิรวิทย์ กาบจันทร์",
    "classroom": "ม.4/3",
    "number": "5",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40923",
    "fullname": "ศรัณณภัทร ทิพย์โพธิ์",
    "classroom": "ม.4/3",
    "number": "6",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42874",
    "fullname": "ณัฐพัฒน์ วงศ์แสนสี",
    "classroom": "ม.4/3",
    "number": "7",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42923",
    "fullname": "อัครพนธ์ พูนพิน",
    "classroom": "ม.4/3",
    "number": "8",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40496",
    "fullname": "กชพรรณ ใจนันท์",
    "classroom": "ม.4/3",
    "number": "9",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40500",
    "fullname": "กนกพร โอดเฮิง",
    "classroom": "ม.4/3",
    "number": "10",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40506",
    "fullname": "กมลชนก สืบสี",
    "classroom": "ม.4/3",
    "number": "11",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40572",
    "fullname": "จิรัชญา คำวังจันทร์",
    "classroom": "ม.4/3",
    "number": "12",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40582",
    "fullname": "ชญานิษฐ์ เงาะหวาน",
    "classroom": "ม.4/3",
    "number": "13",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40586",
    "fullname": "ชณัญชิดา ศรีรมย์",
    "classroom": "ม.4/3",
    "number": "14",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40595",
    "fullname": "ชลฎา ภูกงลี",
    "classroom": "ม.4/3",
    "number": "15",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40632",
    "fullname": "ณัชชา เดือนดาว",
    "classroom": "ม.4/3",
    "number": "16",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40652",
    "fullname": "ณัฐณิชา วิลาวัณย์",
    "classroom": "ม.4/3",
    "number": "17",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40664",
    "fullname": "ณัฐวดี ตันมา",
    "classroom": "ม.4/3",
    "number": "18",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40677",
    "fullname": "ณิชารีย์ อุ่มบางตลาด",
    "classroom": "ม.4/3",
    "number": "19",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40706",
    "fullname": "ธัญชนก สีสะอาด",
    "classroom": "ม.4/3",
    "number": "20",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40710",
    "fullname": "ธัญพร ยนต์สุวรรณ",
    "classroom": "ม.4/3",
    "number": "21",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40743",
    "fullname": "นวพร ทินวล",
    "classroom": "ม.4/3",
    "number": "22",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40766",
    "fullname": "บุญญาพร ใสสะอาด",
    "classroom": "ม.4/3",
    "number": "23",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40784",
    "fullname": "ปวิตรา เขื่อนเก้า",
    "classroom": "ม.4/3",
    "number": "24",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40814",
    "fullname": "พรรณพัชร สุนทรเนติวงศ์",
    "classroom": "ม.4/3",
    "number": "25",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40815",
    "fullname": "พรรณภัสสร มหาวงศ์",
    "classroom": "ม.4/3",
    "number": "26",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40818",
    "fullname": "พัชรพร ชีวะแพทย์",
    "classroom": "ม.4/3",
    "number": "27",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40826",
    "fullname": "พิกุลรัตน์ อุดตรี",
    "classroom": "ม.4/3",
    "number": "28",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40846",
    "fullname": "แพรวพรรณ คุ้มเสาร์",
    "classroom": "ม.4/3",
    "number": "29",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40859",
    "fullname": "ภัทราภรณ์ นาระต๊ะ",
    "classroom": "ม.4/3",
    "number": "30",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40876",
    "fullname": "มีนญดา ศิลารมย์",
    "classroom": "ม.4/3",
    "number": "31",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40897",
    "fullname": "วรรณพร อยู่สืบ",
    "classroom": "ม.4/3",
    "number": "32",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40899",
    "fullname": "วรรณารัตน์ เชื้อเชิญ",
    "classroom": "ม.4/3",
    "number": "33",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40917",
    "fullname": "วิสุมิตรา ใจอ้าย",
    "classroom": "ม.4/3",
    "number": "34",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40925",
    "fullname": "ศรัณย์พร ศรีขะโรจน์",
    "classroom": "ม.4/3",
    "number": "35",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40932",
    "fullname": "ศิรภัสสร แพทย์สมาน",
    "classroom": "ม.4/3",
    "number": "36",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40953",
    "fullname": "สิริญา จันเสนา",
    "classroom": "ม.4/3",
    "number": "37",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40981",
    "fullname": "อังคณา ใจซื่อ",
    "classroom": "ม.4/3",
    "number": "38",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40995",
    "fullname": "ไอยวริญท์ ฉัตรเทวินทภรณ์",
    "classroom": "ม.4/3",
    "number": "39",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40579",
    "fullname": "เจษฎากร บุญมี",
    "classroom": "ม.4/8",
    "number": "1",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40603",
    "fullname": "ชัยภัทร เวียงคำ",
    "classroom": "ม.4/8",
    "number": "2",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40690",
    "fullname": "ธนพนธ์ จินจำ",
    "classroom": "ม.4/8",
    "number": "3",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40694",
    "fullname": "ธนภัทร คำร้อย",
    "classroom": "ม.4/8",
    "number": "4",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40701",
    "fullname": "ธนาธิป อินถา",
    "classroom": "ม.4/8",
    "number": "5",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40749",
    "fullname": "นันทภัค เหมืองทอง",
    "classroom": "ม.4/8",
    "number": "6",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40509",
    "fullname": "กรณีศา กำปั้น",
    "classroom": "ม.4/8",
    "number": "7",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40518",
    "fullname": "กษมา ถาปนา",
    "classroom": "ม.4/8",
    "number": "8",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40526",
    "fullname": "กัญญพัชร เสือเพชร",
    "classroom": "ม.4/8",
    "number": "9",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40530",
    "fullname": "กัญญาวีร์ อะกะเรือน",
    "classroom": "ม.4/8",
    "number": "10",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40540",
    "fullname": "กัลยรัตน์ กวาวสาม",
    "classroom": "ม.4/8",
    "number": "11",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40542",
    "fullname": "กานต์ชนก คำพรหม",
    "classroom": "ม.4/8",
    "number": "12",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40570",
    "fullname": "จิตติมา วงค์เสน",
    "classroom": "ม.4/8",
    "number": "13",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40571",
    "fullname": "จิระนันท์ เพชรมณี",
    "classroom": "ม.4/8",
    "number": "14",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40588",
    "fullname": "ชนานันท์ คุณรูป",
    "classroom": "ม.4/8",
    "number": "15",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40619",
    "fullname": "ฐิตาภา วงศาเคน",
    "classroom": "ม.4/8",
    "number": "16",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40644",
    "fullname": "ณัฐกมล จันทวี",
    "classroom": "ม.4/8",
    "number": "17",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40674",
    "fullname": "ณิชชารีย์ อำพันพงษ์",
    "classroom": "ม.4/8",
    "number": "18",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40699",
    "fullname": "ธนัญชนก ชัยนันท์",
    "classroom": "ม.4/8",
    "number": "19",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40733",
    "fullname": "นชชนก หงษ์เหาะ",
    "classroom": "ม.4/8",
    "number": "20",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40737",
    "fullname": "นภารัตน์ ตอนดง",
    "classroom": "ม.4/8",
    "number": "21",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40746",
    "fullname": "นัฐลดา กองแก้ว",
    "classroom": "ม.4/8",
    "number": "22",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40750",
    "fullname": "นาถนารี มิวินเปี้ย",
    "classroom": "ม.4/8",
    "number": "23",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40756",
    "fullname": "นิภาพร ต๊ะม่าน",
    "classroom": "ม.4/8",
    "number": "24",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40759",
    "fullname": "นิศารัตน์ ขัดแสนจักร์",
    "classroom": "ม.4/8",
    "number": "25",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40791",
    "fullname": "ปานทิพย์ ชมภูวัง",
    "classroom": "ม.4/8",
    "number": "26",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40810",
    "fullname": "พนิตนรี ถิ่นสอน",
    "classroom": "ม.4/8",
    "number": "27",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40840",
    "fullname": "พิมพ์วลัญช์ สวนโพธิ์",
    "classroom": "ม.4/8",
    "number": "28",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40860",
    "fullname": "ภัสสร สาวะเนตร",
    "classroom": "ม.4/8",
    "number": "29",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40884",
    "fullname": "ลภัสญา คำปันปู่",
    "classroom": "ม.4/8",
    "number": "30",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40908",
    "fullname": "วริมน บุญเพิ่ม",
    "classroom": "ม.4/8",
    "number": "31",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40937",
    "fullname": "ศิริลักษณ์ กาบไม้จันทร์",
    "classroom": "ม.4/8",
    "number": "32",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40941",
    "fullname": "ศุภานันท์ โฆษิตนิธิโรจน์",
    "classroom": "ม.4/8",
    "number": "33",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40947",
    "fullname": "สตรีรัตน์ เวทมนต์",
    "classroom": "ม.4/8",
    "number": "34",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40950",
    "fullname": "สิมิลัน จันทร์เจิง",
    "classroom": "ม.4/8",
    "number": "35",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40984",
    "fullname": "อัญชิษา บุญถนอม",
    "classroom": "ม.4/8",
    "number": "36",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42849",
    "fullname": "กรณิศ เกตุวีระพงศ์",
    "classroom": "ม.4/8",
    "number": "37",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42870",
    "fullname": "ณัฏฐณิชา มาแก้ว",
    "classroom": "ม.4/8",
    "number": "38",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42887",
    "fullname": "ธัญลักษณ์ สืบจากถิ่น",
    "classroom": "ม.4/8",
    "number": "39",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42916",
    "fullname": "โศภิตรา คำล้อม",
    "classroom": "ม.4/8",
    "number": "40",
    "role": "student_m4",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39967",
    "fullname": "กฤติธี แสนคำ (มิวสิค)",
    "classroom": "ม.5/1",
    "number": "1",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39998",
    "fullname": "เกียรติสกุล กันกา (ไอคิว)",
    "classroom": "ม.5/1",
    "number": "2",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40019",
    "fullname": "จิรัฏฐ์ บัตริยะ (เหนือ)",
    "classroom": "ม.5/1",
    "number": "3",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40050",
    "fullname": "ชยุตพงศ์ ดีคำ (โฟล์ค)",
    "classroom": "ม.5/1",
    "number": "4",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40059",
    "fullname": "ชิษณุพงศ์ ทะจักร์ (ฟาร์ม)",
    "classroom": "ม.5/1",
    "number": "5",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40309",
    "fullname": "ภาวิต ภาสสัทธา (อาร์ม)",
    "classroom": "ม.5/1",
    "number": "6",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40338",
    "fullname": "วรนน สัจจะพรพันธ์ (ลาเต้)",
    "classroom": "ม.5/1",
    "number": "7",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40350",
    "fullname": "วิเชียรรัตน์ ดอกแก้ว (ดัง)",
    "classroom": "ม.5/1",
    "number": "8",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39993",
    "fullname": "กิตพร เพชรพัฒนากุล (นิกกี้)",
    "classroom": "ม.5/1",
    "number": "9",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40049",
    "fullname": "ชยาดา สมบูรณ์ (พร้อม)",
    "classroom": "ม.5/1",
    "number": "10",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40076",
    "fullname": "ณฤดี ศรีเจริญภากร (หนูดี)",
    "classroom": "ม.5/1",
    "number": "11",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40087",
    "fullname": "ณัฐธยาน์ แก้วกล้า (แตงโม)",
    "classroom": "ม.5/1",
    "number": "12",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40092",
    "fullname": "ณัฐภัสสร ยศเลิศ (กอฟาง)",
    "classroom": "ม.5/1",
    "number": "13",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40122",
    "fullname": "ธนพร ใจยะ (อีฟ)",
    "classroom": "ม.5/1",
    "number": "14",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40132",
    "fullname": "ธนิสตา สีอินทร์ (มินิ)",
    "classroom": "ม.5/1",
    "number": "15",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40179",
    "fullname": "ปณิตา ถุงพลอย (ไออุ่น)",
    "classroom": "ม.5/1",
    "number": "16",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40200",
    "fullname": "ปัทมพร กาศเกษม (โฟร์)",
    "classroom": "ม.5/1",
    "number": "17",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40202",
    "fullname": "ปานปั้น นุชธิสาร (ปานปั้น)",
    "classroom": "ม.5/1",
    "number": "18",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40245",
    "fullname": "พัทธนันท์ คำลือ (พอใจ)",
    "classroom": "ม.5/1",
    "number": "19",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40266",
    "fullname": "พิมพ์ลภัส แตกฉาน (กอพิม)",
    "classroom": "ม.5/1",
    "number": "20",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40294",
    "fullname": "ภรภัทร ไชยยงยศ (ออม)",
    "classroom": "ม.5/1",
    "number": "21",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40352",
    "fullname": "วิภาดา แสนสนั่น (ส้มปุย)",
    "classroom": "ม.5/1",
    "number": "22",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40363",
    "fullname": "ศศินิภา โปธาตุ (อิงฟ้า)",
    "classroom": "ม.5/1",
    "number": "23",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40376",
    "fullname": "ศุภรดา ศิริบรรพต (น้ำตาล)",
    "classroom": "ม.5/1",
    "number": "24",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40380",
    "fullname": "ศุภิสรา แก้วมา (เอม)",
    "classroom": "ม.5/1",
    "number": "25",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42242",
    "fullname": "ณัฏฐณิชา สมนึก (โบนัส)",
    "classroom": "ม.5/1",
    "number": "26",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42260",
    "fullname": "นันท์นภัส ศรีชมภู (นภัส)",
    "classroom": "ม.5/1",
    "number": "27",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42283",
    "fullname": "ไพลิน ฤทธิ์สมบูรณ์ (แพร)",
    "classroom": "ม.5/1",
    "number": "28",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40119",
    "fullname": "ธนโชติ แจ้งเลิศ (เคน)",
    "classroom": "ม.5/8",
    "number": "1",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40134",
    "fullname": "ธรรมรัตน์ อุตรศรี (ปราชญ์)",
    "classroom": "ม.5/8",
    "number": "2",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40195",
    "fullname": "ปองคุณ อรรถชัยพานิช (ลาเต้)",
    "classroom": "ม.5/8",
    "number": "3",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42230",
    "fullname": "กฤษณ์ ลือวัฒนานนท์ (กิต)",
    "classroom": "ม.5/8",
    "number": "4",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42235",
    "fullname": "คณิศร กิ่งกันคำ (บิ๊ก)",
    "classroom": "ม.5/8",
    "number": "5",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42264",
    "fullname": "ปกรณ์เกียรติ เคนจอม (ปลื้ม)",
    "classroom": "ม.5/8",
    "number": "6",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42272",
    "fullname": "พงศกร อุดเวียง (โอลี่)",
    "classroom": "ม.5/8",
    "number": "7",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42273",
    "fullname": "พชร จักรเงิน (ปั๊ป)",
    "classroom": "ม.5/8",
    "number": "8",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42280",
    "fullname": "พีรพัฒน์ แสนคำวัง (ตอร์เรส)",
    "classroom": "ม.5/8",
    "number": "9",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42281",
    "fullname": "พีรวัส วังหา (กอล์ฟ)",
    "classroom": "ม.5/8",
    "number": "10",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42303",
    "fullname": "อาทิตย์ กาญจนกูล (เอ็ม)",
    "classroom": "ม.5/8",
    "number": "11",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39954",
    "fullname": "กฤตภรณ์ พรินทรากูล (ใบเตย)",
    "classroom": "ม.5/8",
    "number": "12",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39976",
    "fullname": "กัญญาณัฐ สุขศิลป์ชัย (ดรีม)",
    "classroom": "ม.5/8",
    "number": "13",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39979",
    "fullname": "กัญญาภัค เรืองขจร (น้ำตาล)",
    "classroom": "ม.5/8",
    "number": "14",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "39988",
    "fullname": "กาญจนา เหมือนจา (น้ำตาล แคมูน)",
    "classroom": "ม.5/8",
    "number": "15",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40037",
    "fullname": "ชณัญชิตา สายาจักร (บุ๋มบิ๋ม)",
    "classroom": "ม.5/8",
    "number": "16",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40054",
    "fullname": "ชวิศา คงคารักษ์ (การ์ตูน)",
    "classroom": "ม.5/8",
    "number": "17",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40057",
    "fullname": "ชลิสา คำปาแฝง (อาย)",
    "classroom": "ม.5/8",
    "number": "18",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40088",
    "fullname": "ณัฐธิดา ไชยยอด (ฟ้า)",
    "classroom": "ม.5/8",
    "number": "19",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40104",
    "fullname": "ตามภรณ์ ชัยชนะ (ตาม)",
    "classroom": "ม.5/8",
    "number": "20",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40109",
    "fullname": "ทักษพร อุดร (วิว)",
    "classroom": "ม.5/8",
    "number": "21",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40112",
    "fullname": "ธนิตากานต์ ธนสาร (บิว)",
    "classroom": "ม.5/8",
    "number": "22",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40147",
    "fullname": "ธิดารัตน์ วิเชียรกันทา (ปาย)",
    "classroom": "ม.5/8",
    "number": "23",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40161",
    "fullname": "นันทัชพร เสนากูล (อิ่มอุ่น)",
    "classroom": "ม.5/8",
    "number": "24",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40184",
    "fullname": "ปภาวรินทร์ บุตรเสน (พาขวัญ)",
    "classroom": "ม.5/8",
    "number": "25",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40185",
    "fullname": "ปภาวรินทร์ วังอินทร์ (เอิร์น)",
    "classroom": "ม.5/8",
    "number": "26",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40232",
    "fullname": "พรอนงค์ ยาสุปิ (น้ำพิพย์)",
    "classroom": "ม.5/8",
    "number": "27",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40244",
    "fullname": "พัทธ์ธิดา วาสนาโลก (แก้ม)",
    "classroom": "ม.5/8",
    "number": "28",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40267",
    "fullname": "พิมพ์ลภัส วันมหาใจ (มะนาว)",
    "classroom": "ม.5/8",
    "number": "29",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40318",
    "fullname": "มนัญชยา อินต๊ะวงค์ (ยิม)",
    "classroom": "ม.5/8",
    "number": "30",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40339",
    "fullname": "วรณัน อินต๊ะจัง (ไอริส)",
    "classroom": "ม.5/8",
    "number": "31",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40359",
    "fullname": "ศกุลตลา คชปัญญา (เพลง)",
    "classroom": "ม.5/8",
    "number": "32",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42404",
    "fullname": "สุภนิดา ถาป้อม (ตังเม)",
    "classroom": "ม.5/8",
    "number": "33",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42424",
    "fullname": "อัญชิษฐา วาปีศิริ (แพร)",
    "classroom": "ม.5/8",
    "number": "34",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42240",
    "fullname": "ฐิตาภา คำน้ำปาด (พรีม)",
    "classroom": "ม.5/8",
    "number": "35",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42243",
    "fullname": "ณัฐกฤตา อุดสม (เหมย)",
    "classroom": "ม.5/8",
    "number": "36",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42250",
    "fullname": "ธมลวรรณ อินจันทร์ (นะนาย)",
    "classroom": "ม.5/8",
    "number": "37",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42276",
    "fullname": "พัทธ์ธีรา ประพัศรางค์ (เอย)",
    "classroom": "ม.5/8",
    "number": "38",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "40281",
    "fullname": "วุฒินันท์ นันทะไสย (โฟกัส)",
    "classroom": "ม.5/8",
    "number": "39",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42292",
    "fullname": "วนัชพร กาศสนุก (โฟล์ค)",
    "classroom": "ม.5/8",
    "number": "40",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  },
  {
    "id": "42932",
    "fullname": "ภิพัทธ์พร หิรัตน์พันธุ์ (แอม)",
    "classroom": "ม.5/8",
    "number": "41",
    "role": "staff_m5",
    "assigned_duty": "none",
    "duty_status": "none"
  }
];

export const INITIAL_SPORTS: SportsEvent[] = [
  { id: 's1', name: 'วิ่ง 100 เมตร ชาย', category: 'กรีฑา', lineup: [] },
  { id: 's2', name: 'ฟุตบอล ชาย (11 คน)', category: 'ฟุตบอล', lineup: [] },
  { id: 's3', name: 'บาสเกตบอล หญิง', category: 'บาสเกตบอล', lineup: [] }
];

'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { SystemReport } from '../../app/store';
import { Student } from '../../app/mockData';
import { Panel } from '../ui';

interface ReportsTabProps {
  data: { reports: SystemReport[] };
  currentUser: Student;
  isController: boolean;
  reportSubject: string;
  setReportSubject: (val: string) => void;
  reportDescription: string;
  setReportDescription: (val: string) => void;
  reportFilter: 'all' | 'pending' | 'resolved';
  setReportFilter: (val: 'all' | 'pending' | 'resolved') => void;
  handleSubmitReport: (e: React.FormEvent) => void;
  handleResolveReport: (id: string) => void;
  handleDeleteReport: (id: string) => void;
}

export function ReportsTab({
  data,
  currentUser,
  isController,
  reportSubject,
  setReportSubject,
  reportDescription,
  setReportDescription,
  reportFilter,
  setReportFilter,
  handleSubmitReport,
  handleResolveReport,
  handleDeleteReport,
}: ReportsTabProps) {
  const subjectLabels: Record<string, string> = {
    name_wrong: 'ชื่อ-นามสกุล ไม่ถูกต้อง',
    classroom_wrong: 'ระดับชั้น / ห้องเรียน ไม่ถูกต้อง',
    number_wrong: 'เลขที่ ไม่ถูกต้อง',
    national_id_wrong: 'เลขประจำตัว / รหัสนักเรียน ไม่ถูกต้อง',
    other: 'อื่นๆ',
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">แจ้งปัญหาของระบบ / ข้อมูลผิดพลาด</h2>
        <p className="text-sm text-text-secondary">
          สำหรับแจ้งเรื่องข้อมูลไม่ตรง เช่น ชื่อ-นามสกุล, เลขประจำตัว, ระดับชั้น, เลขที่
          หรือปัญหาอื่น ๆ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submit form (visible to everyone) */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="ส่งรายงานแจ้งปัญหา">
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">
                  เรื่องที่ต้องการแจ้ง
                </label>
                <select
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium cursor-pointer"
                >
                  <option value="name_wrong">ชื่อ-นามสกุล ไม่ถูกต้อง</option>
                  <option value="classroom_wrong">ระดับชั้น / ห้องเรียน ไม่ถูกต้อง</option>
                  <option value="number_wrong">เลขที่ ไม่ถูกต้อง</option>
                  <option value="national_id_wrong">เลขประจำตัว / รหัสนักเรียน ไม่ถูกต้อง</option>
                  <option value="other">อื่นๆ (ระบุรายละเอียดด้านล่าง)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">
                  รายละเอียดข้อผิดพลาดและสิ่งที่ถูกต้อง
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="เช่น: ชื่อจริงสะกดผิด ที่ถูกต้องคือ นายสมชาย ใจดี, หรือ เลขประจำตัวสลับกัน"
                  rows={5}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white resize-none font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-primary hover:bg-pink-accent text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                ส่งข้อมูลแจ้งแก้ไข
              </button>
            </form>
          </Panel>
        </div>

        {/* Right/Main Column: Dashboard / Report list */}
        <div className="lg:col-span-2 space-y-6">
          {isController ? (
            <Panel title="รายการแจ้งปัญหาทั้งหมด (สำหรับผู้ดูแล)">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-pink-primary/10 pb-4">
                <div className="flex gap-2">
                  {(['all', 'pending', 'resolved'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setReportFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        reportFilter === filter
                          ? 'bg-pink-primary text-white'
                          : 'bg-carbon-dark border border-pink-primary/10 text-text-secondary hover:text-white'
                      }`}
                    >
                      {filter === 'all' ? 'ทั้งหมด' : filter === 'pending' ? 'รอดำเนินการ' : 'แก้ไขแล้ว'}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-text-tertiary font-normal">
                  จำนวน:{' '}
                  {
                    data.reports.filter(
                      (r: SystemReport) => reportFilter === 'all' || r.status === reportFilter
                    ).length
                  }{' '}
                  รายการ
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {data.reports.filter(
                  (r: SystemReport) => reportFilter === 'all' || r.status === reportFilter
                ).length === 0 ? (
                  <div className="text-center py-10 text-text-secondary text-sm font-normal">
                    ไม่พบรายการแจ้งปัญหาใด ๆ
                  </div>
                ) : (
                  data.reports
                    .filter(
                      (r: SystemReport) => reportFilter === 'all' || r.status === reportFilter
                    )
                    .map((report: SystemReport) => {
                      return (
                        <div
                          key={report.id}
                          className={`p-4 rounded-xl border transition-all ${
                            report.status === 'resolved'
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-yellow-500/5 border-yellow-500/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white">
                                {report.studentName} ({report.classroom}{' '}
                                {report.number ? `เลขที่ ${report.number}` : ''})
                              </span>
                              <span className="text-[10px] text-text-tertiary font-normal">
                                ID: {report.studentId}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  report.status === 'resolved'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}
                              >
                                {subjectLabels[report.subject] || report.subject}
                              </span>
                            </div>
                            <span className="text-[10px] text-text-tertiary font-normal">
                              {report.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary bg-carbon-dark/50 p-3 rounded-lg border border-pink-primary/5 whitespace-pre-wrap mb-3 font-medium">
                            {report.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold flex items-center gap-1 ${
                                report.status === 'resolved' ? 'text-green-400' : 'text-yellow-400'
                              }`}
                            >
                              {report.status === 'resolved'
                                ? '✓ ดำเนินการแก้ไขเรียบร้อยแล้ว'
                                : '⌛ รอดำเนินการแก้ไข'}
                            </span>
                            <div className="flex items-center gap-2">
                              {report.status === 'pending' && (
                                <button
                                  onClick={() => handleResolveReport(report.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                >
                                  ทำเครื่องหมายว่าแก้ไขแล้ว
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="ลบคำร้อง"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </Panel>
          ) : (
            <Panel title="ประวัติการแจ้งเรื่องของคุณ">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {data.reports.filter((r: SystemReport) => r.studentId === currentUser.id)
                  .length === 0 ? (
                  <div className="text-center py-10 text-text-secondary text-sm font-normal">
                    คุณยังไม่เคยส่งรายงานปัญหาใด ๆ
                  </div>
                ) : (
                  data.reports
                    .filter((r: SystemReport) => r.studentId === currentUser.id)
                    .map((report: SystemReport) => {
                      return (
                        <div
                          key={report.id}
                          className={`p-4 rounded-xl border transition-all ${
                            report.status === 'resolved'
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-yellow-500/5 border-yellow-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                report.status === 'resolved'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              }`}
                            >
                              {subjectLabels[report.subject] || report.subject}
                            </span>
                            <span className="text-[10px] text-text-tertiary font-normal">
                              {report.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary bg-carbon-dark/50 p-3 rounded-lg border border-pink-primary/5 whitespace-pre-wrap mb-2 font-medium">
                            {report.description}
                          </p>
                          <div className="text-xs font-semibold">
                            {report.status === 'resolved' ? (
                              <span className="text-green-400 flex items-center gap-1">
                                ✓ พี่ๆ ได้แก้ไขปัญหาให้เรียบร้อยแล้ว
                              </span>
                            ) : (
                              <span className="text-yellow-400 flex items-center gap-1">
                                ⌛ กำลังรอทีมงานสตาฟดำเนินการตรวจสอบ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}

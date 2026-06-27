'use client';

import React from 'react';
import { Users, User, Plus } from 'lucide-react';
import { SportsEvent, Student } from '../../app/mockData';

interface AthleteTabProps {
  currentUser: Student;
  data: { sports: SportsEvent[]; students: Student[] };
  isController: boolean;
  handleUploadAthletePhoto: (
    studentId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function AthleteTab({
  currentUser,
  data,
  isController,
  handleUploadAthletePhoto,
}: AthleteTabProps) {
  const userIdToFilter = currentUser?.id || '';
  const myEvents = data.sports.filter(
    (event: SportsEvent) =>
      event.lineup.includes(userIdToFilter) || (isController && event.lineup.length > 0)
  );

  if (myEvents.length === 0) {
    return (
      <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-8 text-center space-y-4 shadow shadow-pink-primary/5 font-sans">
        <div className="w-16 h-16 rounded-full bg-pink-primary/10 flex items-center justify-center mx-auto border border-pink-primary/20 text-pink-primary">
          <Users size={32} />
        </div>
        <h3 className="text-lg font-bold text-text-primary">ยังไม่มีรายการแข่งขันของคุณ</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          คุณยังไม่ได้ถูกจัดรายชื่อลงในรายการแข่งขันกีฬาใดๆ ในขณะนี้ หากมีข้อสงสัย
          กรุณาติดต่อผู้ควบคุมระบบหรือหัวหน้างานฝ่ายสตาฟกีฬา
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {myEvents.map((event: SportsEvent) => {
        const isUserInEvent = event.lineup.includes(userIdToFilter);
        return (
          <div
            key={event.id}
            className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-primary/10 pb-4 font-sans">
              <div>
                <span className="text-xs text-pink-primary font-bold uppercase tracking-wider bg-pink-primary/10 px-2.5 py-1 rounded-full">
                  {event.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mt-2">{event.name}</h3>
              </div>
              {isUserInEvent ? (
                <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 font-bold self-start sm:self-center">
                  ✓ คุณลงแข่งรายการนี้
                </span>
              ) : (
                <span className="text-xs text-text-tertiary bg-carbon-light px-3 py-1.5 rounded-full font-bold self-start sm:self-center">
                  👁️ โหมดพรีวิว (แอดมิน)
                </span>
              )}
            </div>

            <div className="space-y-3 font-sans">
              <h4 className="text-xs font-bold text-pink-accent uppercase tracking-wider">
                👥 สมาชิกในทีมทั้งหมด ({event.lineup.length} คน)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {event.lineup.map((athleteId: string) => {
                  const athlete = data.students.find((s: Student) => s.id === athleteId);
                  if (!athlete) return null;

                  const isMe = athlete.id === userIdToFilter;
                  const nicknameMatch = athlete.fullname.match(/\(([^)]+)\)/);
                  const shortName = nicknameMatch
                    ? nicknameMatch[1]
                    : athlete.fullname.split(' ')[0];

                  return (
                    <div
                      key={athleteId}
                      className={`rounded-xl border overflow-hidden flex flex-col items-center relative text-center shadow-md transition-all duration-300 hover:-translate-y-0.5 group ${
                        isMe
                          ? 'bg-pink-primary/10 border-pink-primary shadow-pink-primary/10 scale-105 z-10'
                          : 'bg-carbon-dark/80 border-pink-primary/5 hover:border-pink-primary/20 shadow-black/40'
                      }`}
                    >
                      {isMe && (
                        <span className="absolute top-1 left-1 bg-pink-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm animate-pulse">
                          YOU
                        </span>
                      )}

                      <div className="w-full aspect-[3/4] relative bg-carbon-dark/50 flex items-center justify-center overflow-hidden border-b border-pink-primary/5">
                        {athlete.avatar ? (
                          <img
                            src={athlete.avatar}
                            alt={athlete.fullname}
                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-text-tertiary p-2">
                            <User size={28} className="opacity-40 text-pink-primary" />
                            <span className="text-[8px] mt-1 text-center font-medium opacity-60">
                              ไม่มีรูป
                            </span>
                          </div>
                        )}

                        {/* Upload photo overlay (accessible ONLY to one's own self) */}
                        {isMe && (
                          <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-[10px] text-white cursor-pointer z-10">
                            <Plus size={16} className="text-pink-primary" />
                            <span className="font-semibold">แนบรูป</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadAthletePhoto(athleteId, e)}
                            />
                          </label>
                        )}
                      </div>

                      <div className="p-2 w-full flex flex-col justify-center bg-carbon-card/90">
                        <span
                          className="text-xs font-bold text-white truncate max-w-full block"
                          title={athlete.fullname}
                        >
                          {shortName}
                        </span>
                        <span className="text-[9px] text-pink-accent font-semibold block mt-0.5">
                          {athlete.classroom} {athlete.number ? `เลขที่ ${athlete.number}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

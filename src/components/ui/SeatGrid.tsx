'use client';

import React from 'react';
import { rows, columns } from '../../lib/helpers';
import { Student } from '../../app/mockData';

export function SeatGrid({
  currentUser,
  isController,
  getSeatOwner,
  onSeatClick,
}: {
  currentUser: Student;
  isController: boolean;
  getSeatOwner: (seatLabel: string) => Student | undefined;
  onSeatClick: (row: string, colNum: number) => void;
}) {
  return (
    <div className="w-full select-none overflow-x-hidden py-2">
      <div className="w-full space-y-1 sm:space-y-1.5 md:space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1 sm:gap-1.5">
            {/* Row Label */}
            <div className="w-6 sm:w-8 font-bold text-center text-text-secondary text-xs sm:text-sm">
              {row}
            </div>

            {/* Seat Columns */}
            <div className="flex flex-1 justify-between gap-0.5 sm:gap-1">
              {columns.map((col) => {
                const label = `${row}${col}`;
                const owner = getSeatOwner(label);
                const isMySeat = owner?.id === currentUser.id;
                return (
                  <button
                    key={label}
                    onClick={() => onSeatClick(row, col)}
                    className={`flex-1 aspect-square rounded-[3px] text-[7px] sm:text-[9px] md:text-[10px] font-semibold sm:font-bold transition-all border flex items-center justify-center p-0 ${
                      owner
                        ? isMySeat
                          ? 'bg-green-500 text-white border-green-400 shadow shadow-green-500/20'
                          : 'bg-pink-primary text-white border-pink-accent'
                        : 'bg-carbon-light hover:bg-pink-primary/20 text-text-secondary hover:text-pink-primary border-pink-primary/10 hover:border-pink-primary/50'
                    }`}
                    title={
                      owner
                        ? `${label}: ${owner.fullname} (${owner.classroom})`
                        : `${label}: ว่าง`
                    }
                    style={{ minWidth: '0' }}
                  >
                    {owner ? (
                      isMySeat ? (
                        <div className="flex flex-col items-center justify-center leading-none text-center w-full h-full p-0.5">
                          <span className="text-[7px] sm:text-[9px] md:text-[10px] font-extrabold text-white/95">
                            {label}
                          </span>
                          <span className="text-[7px] sm:text-[8.5px] md:text-[9.5px] font-semibold text-white/80">
                            คุณ
                          </span>
                        </div>
                      ) : (
                        (() => {
                          const nicknameMatch = owner.fullname.match(/\(([^)]+)\)/);
                          const nickname = nicknameMatch
                            ? nicknameMatch[1]
                            : owner.fullname.split(' ')[0];
                          const classShort = owner.classroom.replace('ม.', '');
                          return (
                            <div className="flex flex-col items-center justify-center leading-[1.1] text-center w-full h-full p-0.5 overflow-hidden">
                              <span className="text-[7px] sm:text-[9px] md:text-[10px] font-extrabold text-white/95">
                                {label}
                              </span>
                              <span className="text-[6.5px] sm:text-[8px] md:text-[9px] font-semibold text-white truncate max-w-full px-0.5">
                                {nickname}
                              </span>
                              <span className="text-[5px] sm:text-[6px] md:text-[7px] text-white/80 truncate max-w-full font-medium">
                                {classShort}{' '}
                                <span className="hidden sm:inline">เลขที่ </span>
                                <span className="sm:hidden">#</span>
                                {owner.number}
                              </span>
                            </div>
                          );
                        })()
                      )
                    ) : (
                      label
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {isController && (
          <p className="text-xs text-text-tertiary text-center pt-2">
            ผู้ควบคุมคลิกที่นั่งที่ถูกจองเพื่อยกเลิกได้
          </p>
        )}

        {/* Stage Indicator */}
        <div className="mt-4 pt-3 border-t border-pink-primary/5 text-center flex flex-col items-center justify-center gap-1">
          <div className="px-6 py-1.5 bg-pink-primary/10 border border-pink-primary/20 rounded-full text-[10px] sm:text-xs font-bold text-pink-accent tracking-wider uppercase">
            ▲ แถว A อยู่ข้างหน้าสุด (ติดสนาม/STAGE) | แถว I อยู่ข้างหลังสุด ▲
          </div>
        </div>
      </div>
    </div>
  );
}

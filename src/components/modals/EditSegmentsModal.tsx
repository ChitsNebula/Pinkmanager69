'use client';

import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Song } from '../../app/store';
import {
  segmentThaiGraphemes,
  segmentThaiWords,
  getWordBoundaries,
} from '../../lib/helpers';

interface EditSegmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  onSave: (songId: string, segments: { words: { text: string; isTagged: boolean }[] }[]) => void;
  onSuccess: () => void;
}

// Step indicator component for EditSegmentsModal
function StepBadge({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        active ? 'bg-pink-primary text-white' : 'bg-carbon-dark text-text-tertiary'
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
          active ? 'bg-white text-pink-primary' : 'bg-carbon-light text-text-tertiary'
        }`}
      >
        {step}
      </span>
      {label}
    </div>
  );
}

export function EditSegmentsModal({
  isOpen,
  onClose,
  song,
  onSave,
  onSuccess,
}: EditSegmentsModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [lyricsInput, setLyricsInput] = useState(() => {
    if (song.segments.length > 0 && song.segments[0].words) {
      return song.segments.map((s) => s.words.map((w) => w.text).join('')).join(' ');
    }
    return song.lyrics || '';
  });
  const [splitIndices, setSplitIndices] = useState<number[]>(() => {
    if (song.segments.length > 1 && song.segments[0].words) {
      const splits: number[] = [];
      let accumulatedGraphemes = 0;
      for (let i = 0; i < song.segments.length - 1; i++) {
        const segText = song.segments[i].words.map((w) => w.text).join('');
        const segGraphemes = segmentThaiGraphemes(segText);
        accumulatedGraphemes += segGraphemes.length;
        splits.push(accumulatedGraphemes - 1);
        accumulatedGraphemes += 1;
      }
      return splits;
    }
    return [];
  });
  const [modalSegments, setModalSegments] = useState<
    { words: { text: string; isTagged: boolean }[] }[]
  >(() => {
    if (song.segments && song.segments.length > 0 && song.segments[0].words) {
      return song.segments;
    }
    return [];
  });
  const [editingPhraseIdx, setEditingPhraseIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleSavePhraseWords = (phraseIdx: number) => {
    const newWords = editingText.split(/\s+/).filter(Boolean);
    setModalSegments((prev) => {
      return prev.map((seg, sIdx) => {
        if (sIdx !== phraseIdx) return seg;

        // Preserve tagged status if word matches
        const nextWords = newWords.map((newW) => {
          const matched = seg.words.find((oldW) => oldW.text === newW);
          return {
            text: newW,
            isTagged: matched ? matched.isTagged : false,
          };
        });

        return { words: nextWords };
      });
    });
    setEditingPhraseIdx(null);
    setEditingText('');
  };

  const words = useMemo(() => segmentThaiWords(lyricsInput), [lyricsInput]);
  const wordBoundaries = useMemo(() => getWordBoundaries(words), [words]);
  const graphemes = useMemo(() => segmentThaiGraphemes(lyricsInput), [lyricsInput]);

  if (!isOpen) return null;

  const toggleSplit = (idx: number) => {
    setSplitIndices((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx).sort((a, b) => a - b)
        : [...prev, idx].sort((a, b) => a - b)
    );
  };

  const autoSplitBySpaces = () => {
    const newSplits: number[] = [];
    const g = segmentThaiGraphemes(lyricsInput);
    for (let i = 0; i < g.length - 1; i++) {
      if (g[i] === ' ' || g[i + 1] === ' ') newSplits.push(i);
    }
    setSplitIndices([...new Set(newSplits)].sort((a, b) => a - b));
  };

  const getPhrases = (): string[] => {
    const g = segmentThaiGraphemes(lyricsInput);
    const sortedSplits = [...splitIndices].sort((a, b) => a - b);
    const phrases: string[] = [];
    let lastIdx = 0;
    for (const split of sortedSplits) {
      if (split >= lastIdx && split < g.length) {
        const part = g.slice(lastIdx, split + 1).join('').trim();
        if (part) phrases.push(part);
        lastIdx = split + 1;
      }
    }
    if (lastIdx < g.length) {
      const part = g.slice(lastIdx).join('').trim();
      if (part) phrases.push(part);
    }
    return phrases.filter(Boolean);
  };

  const currentPhrases = getPhrases();

  const goToStep2 = () => {
    if (currentPhrases.length === 0) {
      alert('ต้องแบ่งคำร้องอย่างน้อย 1 ท่อนร้องครับ');
      return;
    }
    const newSegments = currentPhrases.map((phrase, phraseIdx) => {
      const ws = segmentThaiWords(phrase).filter((w) => w.trim() !== '');
      const existingSeg = modalSegments[phraseIdx];
      const existingWords = existingSeg?.words || [];
      const originalSeg = song.segments[phraseIdx];
      const originalWords = originalSeg?.words || [];

      const wordsWithTags = ws.map((w, wIdx) => {
        if (existingWords[wIdx] && existingWords[wIdx].text === w) {
          return { text: w, isTagged: existingWords[wIdx].isTagged };
        }
        const matchInExisting = existingWords.find((ew) => ew.text === w);
        if (matchInExisting) {
          return { text: w, isTagged: matchInExisting.isTagged };
        }
        if (originalWords[wIdx] && originalWords[wIdx].text === w) {
          return { text: w, isTagged: originalWords[wIdx].isTagged };
        }
        const matchInOriginal = originalWords.find((ow) => ow.text === w);
        if (matchInOriginal) {
          return { text: w, isTagged: matchInOriginal.isTagged };
        }
        return { text: w, isTagged: false };
      });
      return { words: wordsWithTags };
    });
    setModalSegments(newSegments);
    setStep(2);
  };

  const toggleWordTag = (phraseIdx: number, wordIdx: number) => {
    setModalSegments((prev) => {
      return prev.map((seg, sIdx) => {
        if (sIdx !== phraseIdx) return seg;
        const nextWords = seg.words.map((w, wIdx) => {
          if (wIdx !== wordIdx) return w;
          return { ...w, isTagged: !w.isTagged };
        });
        return { words: nextWords };
      });
    });
  };

  const handleSave = () => {
    if (modalSegments.length === 0) {
      alert('ต้องมีคำร้องอย่างน้อย 1 ท่อน');
      return;
    }
    onSave(song.id, modalSegments);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-bold">
      <div className="w-full max-w-2xl bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold text-white mb-1">แก้ไข/จัดลำดับท่อนร้องเพลง</h3>
        <p className="text-xs text-text-secondary mb-4 font-normal">
          จัดเนื้อเพลงเป็น <strong className="text-pink-accent">ท่อน</strong> ก่อน แล้วเลือก{' '}
          <strong className="text-pink-accent">คำ</strong> ที่ต้องการแปรอักษรในแต่ละท่อน{' '}
          <span className="text-pink-primary font-semibold">
            (หากมีคำฉีก/แบ่งผิด สามารถเข้าไปแก้ไขตัวสะกดคำได้ในขั้นตอนที่ 2 "แท็กคำแปรอักษร" ครับ)
          </span>
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              step === 1 ? 'bg-pink-primary text-white' : 'bg-carbon-dark text-text-tertiary'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === 1 ? 'bg-white text-pink-primary' : 'bg-carbon-light text-text-tertiary'
              }`}
            >
              1
            </span>
            แบ่งท่อน
          </div>
          <div className="flex-1 h-px bg-pink-primary/15" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              step === 2 ? 'bg-pink-primary text-white' : 'bg-carbon-dark text-text-tertiary'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === 2 ? 'bg-white text-pink-primary' : 'bg-carbon-light text-text-tertiary'
              }`}
            >
              2
            </span>
            แท็กคำแปรอักษร
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {/* ─── STEP 1: แบ่งท่อน ─── */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-normal">
                  เนื้อเพลงเต็ม (พิมพ์แก้ไขที่นี่):
                </label>
                <textarea
                  value={lyricsInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLyricsInput(val);
                    const g = segmentThaiGraphemes(val);
                    const maxIdx = g.length - 2;
                    setSplitIndices((prev) => prev.filter((idx) => idx <= maxIdx));
                  }}
                  rows={3}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white resize-none font-medium"
                  placeholder="พิมพ์เนื้อเพลงที่นี่..."
                />
              </div>

              <div className="flex items-center gap-2 border-b border-pink-primary/10 pb-3">
                <button
                  type="button"
                  onClick={autoSplitBySpaces}
                  className="bg-carbon-dark hover:bg-carbon-light border border-pink-primary/10 text-text-primary px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  ⚡ แบ่งตามเว้นวรรคอัตโนมัติ
                </button>
                <button
                  type="button"
                  onClick={() => setSplitIndices([])}
                  className="bg-carbon-dark hover:bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  ล้างจุดแบ่งทั้งหมด
                </button>
                <span className="ml-auto text-xs text-text-tertiary font-normal">
                  {currentPhrases.length} ท่อน
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-text-secondary block font-normal">
                    คลิก ◆ ระหว่างคำเพื่อแบ่งท่อน (สีแดง = จุดแบ่ง):
                  </label>
                  <span className="text-[10px] text-pink-primary font-semibold">
                    💡 แก้ไขสะกดคำ/รวมคำที่ฉีกได้ในขั้นตอนถัดไป
                  </span>
                </div>
                <div className="bg-carbon-dark border border-pink-primary/10 p-4 rounded-2xl select-none min-h-[60px]">
                  {graphemes.length === 0 ? (
                    <span className="text-text-tertiary text-xs font-normal">
                      พิมพ์เนื้อเพลงด้านบนเพื่อเริ่มการจัดคำร้อง...
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-y-2">
                      {words.map((word, wordIdx) => {
                        const isSpace = word.trim() === '';
                        const hasSplitZone = wordIdx < words.length - 1;
                        const wordBoundaryGraphemeIdx = wordBoundaries[wordIdx];
                        const isActive = splitIndices.includes(wordBoundaryGraphemeIdx);
                        return (
                          <React.Fragment key={wordIdx}>
                            <span className="relative inline-flex items-center mx-0.5 my-1">
                              <span
                                className={`inline-flex items-center justify-center text-sm font-bold h-8 select-none transition-all rounded-lg px-2.5 ${
                                  isSpace
                                    ? 'border border-dashed border-pink-primary/20 bg-carbon-light/20 text-pink-accent/30 text-[10px] w-5'
                                    : 'bg-pink-primary/10 text-white border border-pink-primary/20 hover:bg-pink-primary/20'
                                }`}
                              >
                                {isSpace ? '·' : word}
                              </span>
                              {hasSplitZone && (
                                <div
                                  onClick={() => toggleSplit(wordBoundaryGraphemeIdx)}
                                  className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-4 h-10 cursor-pointer group z-20"
                                  title="คลิกเพื่อแบ่ง/รวมท่อน"
                                >
                                  <div
                                    className={`w-[2px] h-5 rounded-full transition-all ${
                                      isActive ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-400/40'
                                    }`}
                                  />
                                  <div
                                    className={`text-[9px] font-black transition-all ${
                                      isActive ? 'text-red-500' : 'text-transparent group-hover:text-red-400/60'
                                    }`}
                                  >
                                    ◆
                                  </div>
                                </div>
                              )}
                            </span>
                            {isActive && <div className="w-full h-1" />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {currentPhrases.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary block font-normal">
                    ภาพรวมท่อน ({currentPhrases.length} ท่อน):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-carbon-dark rounded-xl border border-pink-primary/5">
                    {currentPhrases.map((phrase, idx) => (
                      <div
                        key={idx}
                        className="bg-carbon-card border border-pink-primary/10 rounded-xl p-2 text-xs text-left truncate text-text-primary"
                      >
                        <span className="text-[9px] block text-pink-accent opacity-75 font-semibold">
                          ท่อนที่ {idx + 1}
                        </span>
                        {phrase}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── STEP 2: แท็กคำ ─── */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="bg-carbon-dark border border-pink-primary/10 rounded-xl p-3">
                <p className="text-xs text-text-secondary font-normal">
                  คลิกที่ <span className="text-pink-accent font-bold">คำ</span>{' '}
                  ในแต่ละท่อนเพื่อเลือกว่าจะ <strong className="text-pink-accent">แปรอักษร</strong>{' '}
                  ในจังหวะนั้น
                  <br />
                  คำ{' '}
                  <span className="inline-block bg-pink-primary text-white text-[10px] px-1.5 py-0.5 rounded ml-1">
                    ★ สีชมพู
                  </span>{' '}
                  = แปรอักษร | สีเทา = ร้องปกติ ไม่แปร
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {modalSegments.map((segment, phraseIdx) => {
                  const ws = segment.words;
                  const taggedCount = ws.filter((w) => w.isTagged).length;
                  const isEditing = editingPhraseIdx === phraseIdx;
                  return (
                    <div
                      key={phraseIdx}
                      className="bg-carbon-dark border border-pink-primary/10 rounded-2xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-pink-accent font-bold uppercase tracking-wider">
                            ท่อนที่ {phraseIdx + 1}
                          </span>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhraseIdx(phraseIdx);
                                setEditingText(ws.map((w) => w.text).join(' '));
                              }}
                              className="text-[10px] bg-carbon-light hover:bg-carbon-light/80 text-text-secondary px-2 py-0.5 rounded border border-pink-primary/5 transition-all flex items-center gap-1 font-semibold"
                            >
                              ✏️ แก้ไขคำสะกด
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] font-normal">
                          {isEditing ? (
                            <span className="text-text-tertiary">กำลังแก้ไขคำสะกด...</span>
                          ) : taggedCount > 0 ? (
                            <span className="text-pink-primary font-semibold">
                              แปรอักษร {taggedCount} คำ
                            </span>
                          ) : (
                            <span className="text-text-tertiary">
                              ยังไม่ได้แท็ก — ท่อนนี้จะไม่แปรอักษร
                            </span>
                          )}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSavePhraseWords(phraseIdx);
                              } else if (e.key === 'Escape') {
                                setEditingPhraseIdx(null);
                              }
                            }}
                            className="flex-1 bg-carbon-card border border-pink-primary/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-primary font-medium"
                            placeholder="เว้นวรรคเพื่อแยกคำ เช่น: เอ้า บุก กัน ใหญ่"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePhraseWords(phraseIdx)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all font-semibold"
                          >
                            ตกลง
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPhraseIdx(null)}
                            className="bg-carbon-light hover:bg-carbon-light/80 text-text-secondary text-xs px-3 py-1.5 rounded-lg border border-pink-primary/5 transition-all font-semibold"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {ws.map((w, wIdx) => {
                            const isTagged = w.isTagged;
                            return (
                              <button
                                key={wIdx}
                                type="button"
                                onClick={() => toggleWordTag(phraseIdx, wIdx)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all select-none border ${
                                  isTagged
                                    ? 'bg-pink-primary text-white border-pink-accent shadow-md shadow-pink-primary/30 scale-105'
                                    : 'bg-carbon-card text-text-secondary border-pink-primary/10 hover:border-pink-primary/30 hover:text-white'
                                }`}
                                title={isTagged ? 'คลิกเพื่อยกเลิกการแปรอักษร' : 'คลิกเพื่อแท็กแปรอักษร'}
                              >
                                {isTagged && <span className="mr-1 text-[10px]">★</span>}
                                {w.text}
                              </button>
                            );
                          })}
                          {ws.length === 0 && (
                            <span className="text-text-tertiary text-xs font-normal">
                              ท่อนนี้ไม่มีคำ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3">
                <p className="text-xs text-text-secondary font-normal">
                  สรุป: {modalSegments.length} ท่อน →{' '}
                  <span className="text-pink-primary font-bold">
                    {modalSegments.reduce(
                      (sum, seg) => sum + seg.words.filter((w) => w.isTagged).length,
                      0
                    )}{' '}
                    คำแปรอักษร
                  </span>{' '}
                  (1 คำ = 1 ครั้งแปรอักษร)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-4 pt-3 border-t border-pink-primary/10">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={goToStep2}
                disabled={currentPhrases.length === 0}
                className="flex-1 bg-pink-primary hover:bg-pink-accent disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
              >
                ถัดไป: แท็กคำ →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                ← กลับแก้ท่อน
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
              >
                บันทึกคำร้อง ✓
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

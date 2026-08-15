import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, ChevronLeft, ChevronRight, Play, Pause, Plus, Trash2,
  Lock, Unlock, Settings, User, Image as ImageIcon, Save, X, CheckCircle
} from 'lucide-react';
import { Student } from '../../app/mockData';
import {
  Song, SongSegment, saveSongs, toggleSongLock, getStoredData
} from '../../app/store';
import { ArmPoseEquipment, ArmPose, SubSegment } from '../../app/types';
import {
  rows, columns,
  isArmPoseString, parseArmPose, serializeArmPose, getEquipmentDisplayName,
  getResolvedVisuals, buildSubSegments, getSegmentText, getSegmentTaggedWords,
  segmentThaiGraphemes, segmentThaiWords, getWordBoundaries, fileToDataUrl,
  getSeatColorStyle
} from '../../lib/helpers';
import { EditSegmentsModal } from '../modals/EditSegmentsModal';
import { ArmPoseEditorModal } from '../modals/ArmPoseEditorModal';
import { ArmPoseMiniSVG } from '../ui/ArmPoseMiniSVG';
import { Panel } from '../ui';

interface CardStuntTabProps {
  data: ReturnType<typeof getStoredData>;
  currentUser: Student;
  isController: boolean;
  isSuperController: boolean;
  lightTheme: boolean;
}

export function CardStuntTab({ data, currentUser, isController, isSuperController, lightTheme }: CardStuntTabProps) {
  const [selectedSongId, setSelectedSongId] = useState<string>(() => {
    return data.songs[0]?.id || 'song_1';
  });
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per word
  const [dragColor, setDragColor] = useState<string>('ชมพู');
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const isMouseDownRef = useRef(isMouseDown);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Unsaved changes & local state for uninterrupted painting
  const [workingSongs, setWorkingSongs] = useState<Song[]>(data.songs);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [pendingNav, setPendingNav] = useState<{
    type: 'word' | 'segment' | 'song';
    segmentIndex?: number;
    wordIndex?: number;
    songId?: string;
  } | null>(null);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setWorkingSongs(data.songs);
    }
  }, [data.songs, hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const executeNavigation = (nav: { type: string; segmentIndex?: number; wordIndex?: number; songId?: string }) => {
    setIsPlaying(false);
    if (nav.songId && nav.songId !== selectedSongId) {
      setSelectedSongId(nav.songId);
      setActiveSegmentIndex(nav.segmentIndex ?? 0);
      setActiveWordIndex(nav.wordIndex ?? 0);
    } else if (nav.segmentIndex !== undefined && nav.segmentIndex !== activeSegmentIndex) {
      setActiveSegmentIndex(nav.segmentIndex);
      setActiveWordIndex(nav.wordIndex ?? 0);
    } else if (nav.wordIndex !== undefined && nav.wordIndex !== activeWordIndex) {
      setActiveWordIndex(nav.wordIndex);
    }
  };

  const handleAttemptNavigate = (target: { segmentIndex?: number; wordIndex?: number; songId?: string }) => {
    const targetSongId = target.songId ?? selectedSongId;
    const targetSegIdx = target.segmentIndex ?? activeSegmentIndex;
    const targetWordIdx = target.wordIndex ?? activeWordIndex;

    if (targetSongId === selectedSongId && targetSegIdx === activeSegmentIndex && targetWordIdx === activeWordIndex) {
      return;
    }

    const navType: 'word' | 'segment' | 'song' = target.songId ? 'song' : target.segmentIndex !== undefined ? 'segment' : 'word';
    const navObj = { type: navType, ...target };

    if (hasUnsavedChanges) {
      setPendingNav(navObj);
    } else {
      executeNavigation(navObj);
    }
  };

  const handleSaveChanges = () => {
    const song = workingSongs.find((s: Song) => s.id === selectedSongId);
    const songName = song ? song.title : '';
    saveSongs(workingSongs, currentUser, `บันทึกแผนผังแปรอักษรในเพลง "${songName}"`);
    setHasUnsavedChanges(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  useEffect(() => {
    isMouseDownRef.current = isMouseDown;
  }, [isMouseDown]);

  const activeSegRef = useRef(activeSegmentIndex);
  const activeWordRef = useRef(activeWordIndex);
  const karaokeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { activeSegRef.current = activeSegmentIndex; }, [activeSegmentIndex]);
  useEffect(() => { activeWordRef.current = activeWordIndex; }, [activeWordIndex]);

  // Add song modal states
  const [showAddSongModal, setShowAddSongModal] = useState<boolean>(false);
  const [addSongTitle, setAddSongTitle] = useState<string>('');
  const [addSongLyrics, setAddSongLyrics] = useState<string>('');
  const [addSongEquipment, setAddSongEquipment] = useState<string[]>(['ชมพู', 'ขาว', 'ร่ม']);
  const [newEquipColor, setNewEquipColor] = useState<string>('#ff007f');
  const [editSongEquipColor, setEditSongEquipColor] = useState<string>('#ff007f');
  const [showEditSegmentsModal, setShowEditSegmentsModal] = useState<boolean>(false);
  const [showArmPoseModal, setShowArmPoseModal] = useState<boolean>(false);
  const [showWholePagePreview, setShowWholePagePreview] = useState<boolean>(false);

  // Karaoke horizontal scrolling
  useEffect(() => {
    if (karaokeContainerRef.current) {
      const activeEl = karaokeContainerRef.current.querySelector('.karaoke-active');
      if (activeEl) {
        const container = karaokeContainerRef.current;
        const leftOffset = (activeEl as HTMLElement).offsetLeft - container.clientWidth / 2 + (activeEl as HTMLElement).clientWidth / 2;
        container.scrollTo({ left: leftOffset, behavior: 'smooth' });
      }
    }
  }, [activeSegmentIndex, selectedSongId]);

  useEffect(() => { setActiveWordIndex(0); }, [activeSegmentIndex, selectedSongId]);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) return;
    const currentSong = workingSongs.find((s: Song) => s.id === selectedSongId);
    if (!currentSong || currentSong.segments.length === 0) { setIsPlaying(false); return; }
    const interval = setInterval(() => {
      const segIdx = activeSegRef.current;
      const wordIdx = activeWordRef.current;
      const seg = currentSong.segments[segIdx];
      const wordsCount = seg?.words?.length || 0;
      if (wordIdx < wordsCount - 1) {
        setActiveWordIndex(wordIdx + 1);
      } else {
        let nextSegIdx = segIdx + 1;
        if (nextSegIdx >= currentSong.segments.length) nextSegIdx = 0;
        setActiveSegmentIndex(nextSegIdx);
        setActiveWordIndex(0);
      }
    }, playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedSongId, workingSongs]);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || !addSongTitle.trim() || !addSongLyrics.trim()) return;
    const songId = `song_${Date.now()}`;
    const lyricWords = addSongLyrics.trim().split(/\s+/).filter(Boolean);
    const equipList = [...addSongEquipment];
    if (equipList.length === 0) equipList.push('ชมพู', 'ขาว');
    
    // Auto-generate segments (1 segment per word, no tagged words by default)
    const segments: SongSegment[] = lyricWords.map((word, index) => {
      const visuals: Record<string, string> = {};
      rows.forEach(r => { columns.forEach(c => { visuals[`${r}${c}`] = ''; }); });
      return {
        id: `seg_${songId}_${index}`,
        words: [{ text: word, isTagged: false }],
        visuals
      };
    });
    
    const newSong: Song = {
      id: songId,
      title: addSongTitle.trim(),
      lyrics: addSongLyrics.trim(),
      equipment: equipList,
      segments
    };
    
    saveSongs([...data.songs, newSong], currentUser, `เพิ่มเพลงใหม่ "${newSong.title}"`);
    setAddSongTitle('');
    setAddSongLyrics('');
    setAddSongEquipment(['ชมพู', 'ขาว', 'ร่ม']);
    setSelectedSongId(songId);
    setActiveSegmentIndex(0);
    setShowAddSongModal(false);
  };

  const handleDeleteSong = (songId: string) => {
    if (!currentUser || !isController) return;
    const song = data.songs.find((s: Song) => s.id === songId);
    if (!song) return;
    if (song.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถลบได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }
    if (!confirm(`ต้องการลบเพลง "${song.title}" ใช่หรือไม่?`)) return;
    const nextSongs = data.songs.filter((s: Song) => s.id !== songId);
    saveSongs(nextSongs, currentUser, `ลบเพลง "${song.title}"`);
    if (selectedSongId === songId) {
      setSelectedSongId(nextSongs[0]?.id || '');
      setActiveSegmentIndex(0);
    }
  };

  const handleUpdateSeatVisual = (songId: string, segmentIndex: number, wordIndex: number, seatLabel: string, value: string) => {
    if (!currentUser || !isController) return;
    
    const song = workingSongs.find((s: Song) => s.id === songId);
    if (song?.isLocked) return;
    const targetValue = value === '' ? 'none' : value;
    
    const nextSongs = workingSongs.map((songItem: Song) => {
      if (songItem.id === songId) {
        const nextSegments = songItem.segments.map((seg, idx) => {
          if (idx === segmentIndex) {
            const currentResolved = getResolvedVisuals(songItem, segmentIndex, wordIndex);
            const nextWords = seg.words.map((w, wIdx) => {
              if (wIdx === wordIndex) {
                const currentWordVisuals = w.visuals || { ...currentResolved };
                return {
                  ...w,
                  visuals: {
                    ...currentWordVisuals,
                    [seatLabel]: targetValue
                  }
                };
              }
              return w;
            });
            return {
              ...seg,
              words: nextWords
            };
          }
          return seg;
        });
        return { ...songItem, segments: nextSegments };
      }
      return songItem;
    });

    setWorkingSongs(nextSongs);
    setHasUnsavedChanges(true);
  };

  // Touch device drawing logic with passive: false to prevent scrolling
  useEffect(() => {
    const grid = gridContainerRef.current;
    if (!grid) return;

    const handleTouchStart = (e: TouchEvent) => {
      const targetEl = e.target as HTMLElement;
      const seatEl = targetEl.closest('[data-seat-label]');
      if (seatEl) {
        // Prevent default browser scrolling when drawing
        e.preventDefault();
        const seatLabel = seatEl.getAttribute('data-seat-label');
        if (seatLabel) {
          setIsMouseDown(true);
          handleUpdateSeatVisual(selectedSongId, activeSegmentIndex, activeWordIndex, seatLabel, dragColor);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMouseDownRef.current) return;
      // Prevent browser default scroll behaviors
      e.preventDefault();

      const touch = e.touches[0];
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!targetEl) return;

      const seatEl = targetEl.closest('[data-seat-label]');
      if (seatEl) {
        const seatLabel = seatEl.getAttribute('data-seat-label');
        if (seatLabel) {
          handleUpdateSeatVisual(selectedSongId, activeSegmentIndex, activeWordIndex, seatLabel, dragColor);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsMouseDown(false);
    };

    grid.addEventListener('touchstart', handleTouchStart, { passive: false });
    grid.addEventListener('touchmove', handleTouchMove, { passive: false });
    grid.addEventListener('touchend', handleTouchEnd);
    grid.addEventListener('touchcancel', handleTouchEnd);

    // Global listeners to clean up isMouseDown state
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      grid.removeEventListener('touchstart', handleTouchStart);
      grid.removeEventListener('touchmove', handleTouchMove);
      grid.removeEventListener('touchend', handleTouchEnd);
      grid.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [selectedSongId, activeSegmentIndex, activeWordIndex, dragColor]);

  const handleBulkUpdateVisuals = (songId: string, segmentIndex: number, wordIndex: number, mode: 'fill' | 'clear', value?: string) => {
    if (!currentUser || !isController) return;
    const song = workingSongs.find((s: Song) => s.id === songId);
    if (song?.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถแก้ไขแผนผังแปรอักษรได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }
    const targetValue = (mode === 'fill' && (value === '' || !value)) ? 'none' : (value || '');
    const nextSongs = workingSongs.map((sItem: Song) => {
      if (sItem.id === songId) {
        const nextSegments = sItem.segments.map((seg, idx) => {
          if (idx === segmentIndex) {
            const currentResolved = getResolvedVisuals(sItem, segmentIndex, wordIndex);
            const nextWords = seg.words.map((w, wIdx) => {
              if (wIdx === wordIndex) {
                const currentWordVisuals = { ...(w.visuals || currentResolved) };
                rows.forEach(r => {
                  columns.forEach(c => {
                    const label = `${r}${c}`;
                    currentWordVisuals[label] = mode === 'fill' ? targetValue : 'none';
                  });
                });
                return {
                  ...w,
                  visuals: currentWordVisuals
                };
              }
              return w;
            });
            return {
              ...seg,
              words: nextWords
            };
          }
          return seg;
        });
        return { ...sItem, segments: nextSegments };
      }
      return sItem;
    });

    setWorkingSongs(nextSongs);
    setHasUnsavedChanges(true);
  };

  const handleCopyPreviousWordVisuals = (songId: string, segmentIndex: number, wordIndex: number, isInverted: boolean = false) => {
    if (!currentUser || !isController) return;
    const song = workingSongs.find((s: Song) => s.id === songId);
    if (!song) return;
    if (song.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถคัดลอกแผนผังแปรอักษรได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }

    let prevSegIdx = segmentIndex;
    let prevWordIdx = wordIndex - 1;

    if (prevWordIdx < 0) {
      prevSegIdx = segmentIndex - 1;
      if (prevSegIdx >= 0) {
        prevWordIdx = song.segments[prevSegIdx].words.length - 1;
      }
    }

    if (prevSegIdx < 0 || prevWordIdx < 0) {
      alert('ไม่มีคำก่อนหน้านี้ให้คัดลอกครับ');
      return;
    }

    const prevResolved = getResolvedVisuals(song, prevSegIdx, prevWordIdx);

    // Prepare color inversion map
    const activeEquipments = song.equipment.filter(equip => !isArmPoseString(equip));
    const inversionMap: Record<string, string> = {};
    if (isInverted && activeEquipments.length >= 2) {
      const reversedEquipments = [...activeEquipments].reverse();
      activeEquipments.forEach((equip, idx) => {
        inversionMap[equip] = reversedEquipments[idx];
      });
    }

    const copiedVisuals: Record<string, string> = {};
    rows.forEach(r => {
      columns.forEach(c => {
        const label = `${r}${c}`;
        let val = prevResolved[label];
        if (val && val !== 'none') {
          if (isInverted && inversionMap[val]) {
            val = inversionMap[val];
          }
          copiedVisuals[label] = val;
        } else {
          copiedVisuals[label] = 'none';
        }
      });
    });

    const nextSongs = workingSongs.map((sItem: Song) => {
      if (sItem.id === songId) {
        const nextSegments = sItem.segments.map((seg, idx) => {
          if (idx === segmentIndex) {
            const nextWords = seg.words.map((w, wIdx) => {
              if (wIdx === wordIndex) {
                return {
                  ...w,
                  visuals: copiedVisuals
                };
              }
              return w;
            });
            return {
              ...seg,
              words: nextWords
            };
          }
          return seg;
        });
        return { ...sItem, segments: nextSegments };
      }
      return sItem;
    });

    setWorkingSongs(nextSongs);
    setHasUnsavedChanges(true);
  };

  const handleUpdateSongEquipment = (songId: string, updatedEquips: string[], deletedEquip?: string) => {
    if (!currentUser || !isController) return;
    const song = data.songs.find((s: Song) => s.id === songId);
    if (song?.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถแก้ไขอุปกรณ์ได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }
    const nextSongs = data.songs.map((sSong: Song) => {
      if (sSong.id === songId) {
        let nextSegments = sSong.segments;
        if (deletedEquip) {
          nextSegments = sSong.segments.map((seg) => {
            const nextVisuals = { ...seg.visuals };
            Object.keys(nextVisuals).forEach((seat) => {
              if (nextVisuals[seat] === deletedEquip) {
                nextVisuals[seat] = ''; // clear visual
              }
            });
            return { ...seg, visuals: nextVisuals };
          });
        }
        return { ...sSong, equipment: updatedEquips, segments: nextSegments };
      }
      return sSong;
    });
    const songName = song ? song.title : 'ไม่ระบุชื่อเพลง';
    saveSongs(
      nextSongs, 
      currentUser, 
      `แก้ไขรายการอุปกรณ์ของเพลง "${songName}"` + 
      (deletedEquip ? ` และล้างรหัสระบายสีของ "${deletedEquip}" ออกจากทุกท่อนร้อง` : '')
    );
  };

  const handleSaveSegmentsText = (songId: string, updatedSegments: { words: { text: string; isTagged: boolean }[] }[]) => {
    if (!currentUser || !isController) return;
    const song = data.songs.find((s: Song) => s.id === songId);
    if (song?.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถแก้ไขท่อนร้อง/คำร้องได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }
    const nextSongs = data.songs.map((sSong: Song) => {
      if (sSong.id === songId) {
        const nextSegments = updatedSegments.map((seg, idx) => {
          const existing = sSong.segments[idx];
          const visuals: Record<string, string> = existing?.visuals || (() => {
            const v: Record<string, string> = {};
            rows.forEach(r => { columns.forEach(c => { v[`${r}${c}`] = ''; }); });
            return v;
          })();
          return {
            id: existing?.id || `seg_${songId}_${idx}`,
            words: seg.words,
            visuals,
          };
        });
        const lyricsText = updatedSegments.map(s => s.words.map(w => w.text).join('')).join(' ');
        return { ...sSong, segments: nextSegments, lyrics: lyricsText };
      }
      return sSong;
    });
    const songName = song ? song.title : 'ไม่ระบุชื่อเพลง';
    saveSongs(nextSongs, currentUser, `แก้ไขคำร้องเพลง "${songName}"`);
  };

  if (data.songs.length === 0) {
    return (
      <section className="space-y-6 text-white" onMouseUp={() => setIsMouseDown(false)}>
        {/* Header info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">ระบบซ้อมแปรอักษรอัจฉริยะ (Card Stunt)</h2>
            <p className="text-sm text-text-secondary">
              {isController
                ? 'ออกแบบโค้ดแปรอักษรตามคำร้องเพลงเชียร์ คอนโทรลสแตนผ่านระบบระบายสี และรัน Simulation'
                : 'คู่มือและเครื่องมือซ้อมแปรอักษรส่วนตัวสำหรับสมาชิกบนสแตนเชียร์'}
            </p>
          </div>
        </div>

        <div className="bg-carbon-card border border-pink-primary/20 rounded-2xl p-8 text-center space-y-4 shadow-lg max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 rounded-full bg-pink-primary/10 flex items-center justify-center mx-auto border border-pink-primary/20 text-pink-primary animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">ไม่มีข้อมูลเพลงในระบบ</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            ขณะนี้ยังไม่มีเพลงแปรอักษรที่บันทึกไว้ในระบบ {isController && 'กรุณาเพิ่มเพลงใหม่เพื่อเริ่มต้นการออกแบบแปรอักษร'}
          </p>
          {isController && (
            <button
              type="button"
              onClick={() => setShowAddSongModal(true)}
              className="bg-pink-primary hover:bg-pink-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer mx-auto"
            >
              <Plus size={16} /> เพิ่มเพลงใหม่
            </button>
          )}
        </div>

        {/* Add Song Modal */}
        {showAddSongModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-bold">
            <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative text-white">
              <button 
                type="button"
                onClick={() => setShowAddSongModal(false)} 
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-white mb-4">เพิ่มเพลงเชียร์และแปรอักษรใหม่</h3>
              <form onSubmit={handleAddSong} className="space-y-4">
                <div className="text-left">
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อเพลง</label>
                  <input 
                    value={addSongTitle} 
                    onChange={(e) => setAddSongTitle(e.target.value)} 
                    placeholder="เช่น เพลงมาร์ชสีชมพู, เพลงบูมสี" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium" 
                    required 
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เนื้อเพลง (วรรคคำด้วยเว้นวรรคเพื่อแยกท่อน)</label>
                  <textarea 
                    value={addSongLyrics} 
                    onChange={(e) => setAddSongLyrics(e.target.value)} 
                    placeholder="กรอกเนื้อเพลง เช่น:&#10;ชมพู ชมพูชมพู เก่งกาจ แกร่งกล้า" 
                    rows={4} 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium resize-none" 
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-3 border-t border-pink-primary/10">
                  <button 
                    type="button" 
                    onClick={() => setShowAddSongModal(false)} 
                    className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                  >
                    สร้างเพลงเชียร์
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
          <section className="space-y-6" onMouseUp={() => setIsMouseDown(false)}>
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">ระบบซ้อมแปรอักษรอัจฉริยะ (Card Stunt)</h2>
                <p className="text-sm text-text-secondary">
                  {isController
                    ? 'ออกแบบโค้ดแปรอักษรตามคำร้องเพลงเชียร์ คอนโทรลสแตนผ่านระบบระบายสี และรัน Simulation'
                    : 'คู่มือและเครื่องมือซ้อมแปรอักษรส่วนตัวสำหรับสมาชิกบนสแตนเชียร์'}
                </p>
              </div>
            </div>

            {/* NORMAL STUDENT VIEW */}
            {!isController && (
              <>
                {currentUser.assigned_duty !== 'stand' || !currentUser.seat ? (
                  <div className="bg-carbon-card border border-pink-primary/25 rounded-2xl p-8 text-center space-y-4 shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-pink-primary/10 flex items-center justify-center mx-auto border border-pink-primary/20 text-pink-primary animate-pulse">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">คุณยังไม่มีหน้าที่บนสแตนเชียร์ หรือยังไม่ได้รับมอบหมายที่นั่ง</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto">
                      กรุณาติดต่อพี่ควบคุมสีเพื่อขอมอบหมายหน้าที่และที่นั่งบนสแตนเชียร์ จึงจะสามารถเข้าถึงคู่มือการแปรอักษรส่วนบุคคลได้
                    </p>
                  </div>
                ) : (
                  // Student has booked a seat
                  (() => {
                    const currentSong = data.songs.find((s: Song) => s.id === selectedSongId) || data.songs[0];
                    const mySeat = currentUser.seat;
                    const activeSegment = currentSong?.segments[activeSegmentIndex];
                    const myAction = activeSegment?.visuals[mySeat] || 'none';

                    // Helpers to render coloring
                    // Helpers to render coloring
                    const getActionColor = (action: string) => {
                      if (!action || action === 'none') return 'bg-carbon-dark text-text-secondary border-pink-primary/10';
                      const act = action.toLowerCase().trim();
                      
                      // 1. Check suffix first
                      if (act.endsWith('(ชมพู)') || act.endsWith('(pink)')) return 'bg-pink-primary text-white border-pink-accent';
                      if (act.endsWith('(ขาว)') || act.endsWith('(white)')) return 'bg-white text-carbon-dark border-gray-300';
                      if (act.endsWith('(เหลือง)') || act.endsWith('(yellow)') || act.endsWith('(ร่ม)')) return 'bg-yellow-500 text-white border-yellow-400';
                      if (act.endsWith('(น้ำเงิน)') || act.endsWith('(blue)')) return 'bg-blue-600 text-white border-blue-400';
                      if (act.endsWith('(เขียว)') || act.endsWith('(green)')) return 'bg-green-600 text-white border-green-400';
                      if (act.endsWith('(แดง)') || act.endsWith('(red)')) return 'bg-red-600 text-white border-red-400';

                      // 2. Fallback to includes
                      if (act.includes('ชมพู') || act.includes('pink')) return 'bg-pink-primary text-white border-pink-accent';
                      if (act.includes('ขาว') || act.includes('white')) return 'bg-white text-carbon-dark border-gray-300';
                      if (act.includes('ร่ม') || act.includes('เหลือง') || act.includes('yellow') || act.includes('umbrella')) return 'bg-yellow-500 text-white border-yellow-400';
                      if (act.includes('น้ำเงิน') || act.includes('blue')) return 'bg-blue-600 text-white border-blue-400';
                      if (act.includes('เขียว') || act.includes('green')) return 'bg-green-600 text-white border-green-400';
                      if (act.includes('แดง') || act.includes('red')) return 'bg-red-600 text-white border-red-400';
                      
                      if (currentSong) {
                        const idx = currentSong.equipment.indexOf(action);
                        if (idx === 0) return 'bg-pink-primary text-white border-pink-accent';
                        if (idx === 1) return 'bg-white text-slate-800 border-gray-300';
                        if (idx === 2) return 'bg-yellow-500 text-white border-yellow-400';
                        if (idx === 3) return 'bg-blue-600 text-white border-blue-400';
                        if (idx === 4) return 'bg-green-600 text-white border-green-400';
                      }
                      const actLower = action.toLowerCase();
                      if (actLower.includes('ขาว') || actLower.includes('white')) {
                        return 'bg-white text-slate-800 border-gray-300';
                      }
                      return 'bg-pink-primary/30 text-white border-pink-primary/50';
                    };

                    const getActionText = (action: string) => {
                      if (!action || action === 'none') return 'หมอบ / เอาป้ายลง';
                      const act = action.toLowerCase().trim();
                      
                      if (act.endsWith('(ชมพู)') || act.endsWith('(pink)')) return 'ชูเพลตสีชมพู';
                      if (act.endsWith('(ขาว)') || act.endsWith('(white)')) return 'ชูเพลตสีขาว';
                      if (act.endsWith('(เหลือง)') || act.endsWith('(yellow)') || act.endsWith('(ร่ม)')) return 'กางร่ม / ชูสีเหลือง';
                      if (act.endsWith('(น้ำเงิน)') || act.endsWith('(blue)')) return 'ชูเพลตสีน้ำเงิน';
                      if (act.endsWith('(เขียว)') || act.endsWith('(green)')) return 'ชูเพลตสีเขียว';
                      if (act.endsWith('(แดง)') || act.endsWith('(red)')) return 'ชูเพลตสีแดง';
                      if (act.includes('ชมพู') || act.includes('pink')) return 'ชูเพลตสีชมพู';
                      if (act.includes('ขาว') || act.includes('white')) return 'ชูเพลตสีขาว';
                      if (act.includes('ร่ม') || act.includes('เหลือง') || act.includes('yellow') || act.includes('umbrella')) return 'กางร่ม';
                      if (act.includes('น้ำเงิน') || act.includes('blue')) return 'ชูเพลตสีน้ำเงิน';
                      if (act.includes('เขียว') || act.includes('green')) return 'ชูเพลตสีเขียว';
                      if (act.includes('แดง') || act.includes('red')) return 'ชูเพลตสีแดง';
                      return `แสดง: ${action}`;
                    };

                    return (
                      <div className="flex flex-col gap-5">

                        {/* Top card: Seat + Song + Equipment */}
                        <div className="bg-carbon-card border border-pink-primary/20 rounded-2xl p-5 space-y-4 shadow">
                          <div className="flex items-center justify-between border-b border-pink-primary/10 pb-3">
                            <div>
                              <span className="text-xs text-pink-primary uppercase font-bold tracking-wider">ตำแหน่งของคุณ</span>
                              <h3 className="text-2xl font-bold text-white">ที่นั่งรหัส {mySeat}</h3>
                            </div>
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                              เชื่อมต่อสำเร็จ
                            </span>
                          </div>

                          {/* Song selector */}
                          <div>
                            <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เลือกเพลงเชียร์</label>
                            <select
                              value={selectedSongId}
                              onChange={(e) => {
                                setSelectedSongId(e.target.value);
                                setActiveSegmentIndex(0);
                              }}
                              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-semibold"
                            >
                              {data.songs.map((song: Song) => (
                                <option key={song.id} value={song.id}>{song.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Equipment list for current song */}
                          {currentSong && currentSong.equipment.filter((e: string) => !isArmPoseString(e)).length > 0 && (
                            <div>
                              <span className="text-xs text-text-secondary font-semibold block mb-2">อุปกรณ์ที่ต้องใช้ในเพลงนี้</span>
                              <div className="flex flex-wrap gap-2">
                                {currentSong.equipment.filter((e: string) => !isArmPoseString(e)).map((equip: string) => {
                                  const style = getSeatColorStyle(equip, currentSong.equipment);
                                  return (
                                    <span
                                      key={equip}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${style.className}`}
                                      style={style.style}
                                    >
                                      {getEquipmentDisplayName(equip)}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Lyrics panel */}
                        <Panel title={`เนื้อเพลง "${currentSong?.title || ''}"`}>
                          <div className="p-3 bg-carbon-dark/40 border border-pink-primary/10 rounded-2xl max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin space-y-1">
                            {currentSong?.segments.map((seg, idx) => {
                              const isActive = activeSegmentIndex === idx;
                              return (
                                <div
                                  key={seg.id}
                                  onClick={() => { setIsPlaying(false); setActiveSegmentIndex(idx); setActiveWordIndex(0); }}
                                  className={`cursor-pointer rounded-lg px-2.5 py-1 transition-all border ${
                                    isActive
                                      ? 'bg-pink-primary/10 border-pink-primary/30 scale-[1.01]'
                                      : 'bg-transparent border-transparent hover:bg-carbon-light/30 hover:border-pink-primary/10'
                                  }`}
                                  style={{ contentVisibility: 'auto' }}
                                >
                                  <div className="flex flex-wrap gap-x-0.5 gap-y-1 items-center">
                                    <span className="text-[10px] text-pink-accent/50 font-bold mr-1 shrink-0 select-none">ท่อน {idx + 1}:</span>
                                    {(seg.words || []).map((word, wIdx) => {
                                      const wordResolved = getResolvedVisuals(currentSong, idx, wIdx);
                                      const wordAction = wordResolved[mySeat] || 'none';
                                      const isWordActive = isActive && activeWordIndex === wIdx;
                                      
                                      const act = wordAction.toLowerCase().trim();
                                      let wordColorClass = 'text-text-secondary/60';
                                      let extraStyle: React.CSSProperties = {};
                                      let badgeClass = 'bg-transparent border border-transparent';

                                      if (act !== 'none' && act !== '') {
                                        if (act.includes('ชมพู') || act.includes('pink')) {
                                          wordColorClass = 'text-white';
                                          badgeClass = 'bg-pink-500 border-pink-600/30 font-bold text-white shadow-sm';
                                        } else if (act.includes('ขาว') || act.includes('white')) {
                                          wordColorClass = 'text-slate-800';
                                          badgeClass = 'bg-white border-slate-300 font-bold text-slate-800 shadow-sm';
                                        } else if (act.includes('เหลือง') || act.includes('yellow') || act.includes('ร่ม')) {
                                          wordColorClass = 'text-slate-900';
                                          badgeClass = 'bg-yellow-400 border-yellow-500/30 font-bold text-slate-900 shadow-sm';
                                        } else if (act.includes('น้ำเงิน') || act.includes('blue')) {
                                          wordColorClass = 'text-white';
                                          badgeClass = 'bg-blue-600 border-blue-700/30 font-bold text-white shadow-sm';
                                        } else if (act.includes('เขียว') || act.includes('green')) {
                                          wordColorClass = 'text-white';
                                          badgeClass = 'bg-green-600 border-green-700/30 font-bold text-white shadow-sm';
                                        } else if (act.includes('แดง') || act.includes('red')) {
                                          wordColorClass = 'text-white';
                                          badgeClass = 'bg-red-600 border-red-700/30 font-bold text-white shadow-sm';
                                        }

                                        const hexMatch = act.match(/\((#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\)$/);
                                        if (hexMatch) {
                                          const hexColor = hexMatch[1];
                                          let r = 0, g = 0, b = 0;
                                          if (hexColor.length === 4) {
                                            r = parseInt(hexColor[1] + hexColor[1], 16);
                                            g = parseInt(hexColor[2] + hexColor[2], 16);
                                            b = parseInt(hexColor[3] + hexColor[3], 16);
                                          } else if (hexColor.length === 7) {
                                            r = parseInt(hexColor.slice(1, 3), 16);
                                            g = parseInt(hexColor.slice(3, 5), 16);
                                            b = parseInt(hexColor.slice(5, 7), 16);
                                          }
                                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                          const textColor = brightness > 128 ? '#0f1016' : '#ffffff';
                                          
                                          extraStyle.backgroundColor = hexColor;
                                          extraStyle.color = textColor;
                                          extraStyle.borderColor = brightness > 128 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';
                                          badgeClass = 'border font-bold shadow-sm';
                                          wordColorClass = '';
                                        }
                                      }

                                      return (
                                        <span
                                          key={wIdx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsPlaying(false);
                                            setActiveSegmentIndex(idx);
                                            setActiveWordIndex(wIdx);
                                          }}
                                          style={extraStyle}
                                          className={`text-sm transition-all rounded px-2 py-0.5 cursor-pointer hover:opacity-90 select-none ${badgeClass} ${wordColorClass} ${
                                            isWordActive
                                              ? 'ring-2 ring-pink-primary scale-110 shadow-md font-extrabold relative z-10'
                                              : word.isTagged
                                                ? 'ring-1 ring-current/40 bg-current/5'
                                                : 'text-text-secondary/70'
                                          }`}
                                        >
                                          {word.isTagged && <span className="text-[8px] mr-0.5">★</span>}
                                          {word.text}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Panel>

                      </div>
                    );

                  })()

                )}
              </>
            )}

            {/* CONTROLLER / STAFF VIEW */}
            {isController && (
              (() => {
                const currentSong = workingSongs.find((s: Song) => s.id === selectedSongId) || workingSongs[0];
                const activeSegment = currentSong?.segments[activeSegmentIndex];
                const resolvedVisuals = getResolvedVisuals(currentSong, activeSegmentIndex, activeWordIndex);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left side: song selector and player */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* Songs list */}
                      <Panel title="รายชื่อเพลงเชียร์ที่แปรอักษร">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedSongId}
                              onChange={(e) => {
                                setSelectedSongId(e.target.value);
                                setActiveSegmentIndex(0);
                                setIsPlaying(false);
                              }}
                              className="flex-1 bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white font-semibold"
                            >
                              {workingSongs.map((song: Song) => (
                                <option key={song.id} value={song.id}>
                                  {song.isLocked ? `🔒 ${song.title}` : song.title}
                                </option>
                              ))}
                            </select>
                            {currentSong && (
                              <button
                                onClick={() => toggleSongLock(currentSong.id, currentUser || undefined)}
                                disabled={currentUser?.role === 'moderator'}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  currentUser?.role === 'moderator'
                                    ? 'opacity-40 cursor-not-allowed bg-carbon-light border-pink-primary/10 text-text-tertiary'
                                    : currentSong.isLocked
                                    ? 'bg-red-500/20 text-red-500 border-red-500/30 cursor-pointer'
                                    : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 cursor-pointer'
                                }`}
                                title={
                                  currentUser?.role === 'moderator'
                                    ? 'ผู้ดูแลไม่มีสิทธิ์ล็อกหรือปลดล็อกเพลง'
                                    : currentSong.isLocked
                                    ? 'เพลงถูกล็อกอยู่ คลิกเพื่อปลดล็อก'
                                    : 'เพลงเปิดแก้ไขอยู่ คลิกเพื่อล็อกป้องกันการแก้ไข'
                                }
                              >
                                {currentSong.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setAddSongTitle('');
                                setAddSongLyrics('');
                                setAddSongEquipment(['ชมพู', 'ขาว', 'ร่ม']);
                                setShowAddSongModal(true);
                              }}
                              className="bg-pink-primary hover:bg-pink-accent text-white p-2.5 rounded-xl transition-all shadow-md shadow-pink-primary/10 cursor-pointer"
                              title="เพิ่มเพลงเชียร์ใหม่"
                            >
                              <Plus size={18} />
                            </button>
                            {currentSong && (
                              <button
                                onClick={() => handleDeleteSong(currentSong.id)}
                                disabled={currentSong.isLocked}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  currentSong.isLocked
                                    ? 'opacity-40 cursor-not-allowed bg-red-500/5 text-red-400 border-red-500/10'
                                    : 'bg-red-500/15 hover:bg-red-500/30 text-red-400 border-red-500/20 cursor-pointer'
                                }`}
                                title={currentSong.isLocked ? 'ไม่สามารถลบเพลงที่ถูกล็อกได้' : 'ลบเพลงนี้'}
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>

                          {currentSong && currentSong.isLocked && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                              <Lock size={14} className="shrink-0 animate-bounce" />
                              <span>เพลงนี้ถูกล็อกไว้ชั่วคราวเพื่อป้องกันการแก้ไขข้อมูลทับซ้อนหรือเผลอกดโดน ปลดล็อกเพื่อแก้ไขได้</span>
                            </div>
                          )}

                           {currentSong && (
                            <div className="text-xs text-text-secondary space-y-2 bg-carbon-dark p-4 rounded-xl border border-pink-primary/5">
                              <p><span className="font-bold text-white">เพลง:</span> {currentSong.title}</p>
                              <div>
                                 <span className="font-bold text-white block mb-1">อุปกรณ์ ({currentSong.equipment.filter(equip => !isArmPoseString(equip)).length}):</span>
                                 <div className="flex flex-wrap gap-1 mb-2">
                                   {currentSong.equipment.filter(equip => !isArmPoseString(equip)).length === 0 ? (
                                     <span className="text-[10px] text-text-tertiary italic">ไม่มีอุปกรณ์</span>
                                   ) : (
                                     currentSong.equipment
                                       .filter(equip => !isArmPoseString(equip))
                                       .map((equip) => {
                                         const style = getSeatColorStyle(equip, currentSong.equipment);
                                         return (
                                           <span
                                             key={equip}
                                             className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${style.className}`}
                                             style={style.style}
                                           >
                                             {getEquipmentDisplayName(equip)}
                                             <button
                                               type="button"
                                               title={`ลบ ${getEquipmentDisplayName(equip)}`}
                                               onClick={() => {
                                                 const displayName = getEquipmentDisplayName(equip);
                                                 if (confirm(`คุณแน่ใจว่าต้องการลบ "${displayName}" ใช่หรือไม่? (ระบายสีที่เป็นชื่ออุปกรณ์นี้ทั้งหมดบนผังแปรอักษรของทุกท่อนจะถูกลบทิ้งไปด้วย)`)) {
                                                   const updated = currentSong.equipment.filter((e) => e !== equip);
                                                   handleUpdateSongEquipment(currentSong.id, updated, equip);
                                                   if (dragColor === equip) setDragColor(updated[0] || '');
                                                 }
                                               }}
                                               className="opacity-70 hover:opacity-100 ml-0.5 text-[8px]"
                                               style={{ color: style.style?.color || 'inherit' }}
                                             >
                                               ✕
                                             </button>
                                           </span>
                                         );
                                       })
                                   )}
                                 </div>

                                {/* Quick Add Inline Subform */}
                                {!currentSong.isLocked && (
                                  <div className="space-y-2 mt-2 pt-2 border-t border-pink-primary/5">
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      id="edit-song-new-equip"
                                      placeholder="เพิ่มอุปกรณ์ (เช่น พัด, ป้ายไฟ)"
                                      className="flex-1 bg-carbon-card border border-pink-primary/10 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-pink-primary text-white font-medium"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const btn = document.getElementById('btn-add-equip-song');
                                          btn?.click();
                                        }
                                      }}
                                    />
                                    <input
                                      type="color"
                                      value={editSongEquipColor}
                                      onChange={(e) => setEditSongEquipColor(e.target.value)}
                                      className="w-6 h-6 rounded border border-pink-primary/20 bg-transparent cursor-pointer outline-none overflow-hidden shrink-0 self-center"
                                    />
                                    <input
                                      type="text"
                                      value={editSongEquipColor}
                                      onChange={(e) => setEditSongEquipColor(e.target.value)}
                                      className="bg-carbon-card border border-pink-primary/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-pink-primary font-medium w-[70px] shrink-0"
                                      placeholder="#ff007f"
                                    />
                                    <button
                                      type="button"
                                      id="btn-add-equip-song"
                                      onClick={() => {
                                        const input = document.getElementById('edit-song-new-equip') as HTMLInputElement;
                                        const name = input?.value.trim();
                                        if (!name) return;
                                        const formatted = `${name} (${editSongEquipColor})`;

                                        if (currentSong.equipment.includes(formatted)) {
                                          alert('มีอุปกรณ์นี้แล้วในระบบครับ');
                                          return;
                                        }
                                        const updated = [...currentSong.equipment, formatted];
                                        handleUpdateSongEquipment(currentSong.id, updated);
                                        setDragColor(formatted); // auto select newly added equip
                                        input.value = '';
                                      }}
                                      className="bg-pink-primary hover:bg-pink-accent text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                                    >
                                      + เพิ่ม
                                    </button>
                                  </div>
                                </div>
                              )}
                              </div>
                              <p><span className="font-bold text-white">จำนวนคำ/ท่อน:</span> {currentSong.segments.length} ท่อน</p>
                            </div>
                          )}

                          {/* Lyrics Word Splitter timeline list */}
                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between items-center">
                                <label className="text-xs text-text-secondary">เรียงลำดับคำร้อง (คลิกเพื่อวาด):</label>
                                <button
                                  onClick={() => setShowEditSegmentsModal(true)}
                                  className="text-pink-primary hover:text-pink-accent text-xs font-bold"
                                >
                                  แก้ไข/จัดคำร้อง
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto p-2 bg-carbon-dark rounded-xl border border-pink-primary/5">
                                {currentSong.segments.map((seg, idx) => (
                                  <button
                                    key={seg.id}
                                    onClick={() => {
                                      setIsPlaying(false);
                                      setActiveSegmentIndex(idx);
                                      setActiveWordIndex(0);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs text-left truncate transition-all ${
                                      activeSegmentIndex === idx
                                        ? 'bg-pink-primary text-white font-bold ring-2 ring-pink-primary/45 shadow'
                                        : 'bg-carbon-card text-text-secondary border border-pink-primary/5 hover:text-white hover:border-pink-primary/20'
                                    }`}
                                  >
                                    ท่อนที่ {idx + 1}: {getSegmentText(seg)}
                                  </button>
                                ))}
                              </div>
                            </div>
                        </div>
                      </Panel>

                      {/* Timeline player simulator */}
                      {currentSong && (
                        <Panel title="จำลองการแปรอักษร (Simulation)">
                          <div className="space-y-4">
                            {/* Play controls */}
                            <div className="flex items-center justify-between gap-3 bg-carbon-dark p-3 rounded-xl border border-pink-primary/5">
                              <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  isPlaying ? 'bg-yellow-500 text-white' : 'bg-pink-primary text-white shadow-md shadow-pink-primary/10'
                                }`}
                              >
                                {isPlaying ? '⏸ หยุดเล่น' : '▶ เล่นแอนิเมชัน'}
                              </button>

                              <button
                                onClick={() => {
                                  setIsPlaying(false);
                                  setActiveSegmentIndex(0);
                                  setActiveWordIndex(0);
                                }}
                                className="bg-carbon-light text-text-secondary hover:text-white px-3 py-2 rounded-xl text-xs font-semibold"
                              >
                                รีเซ็ตแรกสุด
                              </button>
                            </div>

                            {/* Speed Control Slider & Input */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary">ความเร็วท่อนเพลง (ms):</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={250}
                                    max={10000}
                                    step={250}
                                    value={playbackSpeed}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      if (val >= 0) setPlaybackSpeed(val);
                                    }}
                                    className="w-20 bg-carbon-dark border border-pink-primary/10 rounded-lg px-2 py-1 text-xs text-center text-pink-primary font-bold focus:outline-none focus:border-pink-primary"
                                  />
                                  <span className="text-text-secondary">({(playbackSpeed / 1000).toFixed(2)} วินาที/คำ)</span>
                                </div>
                              </div>
                              <input
                                type="range"
                                min={250}
                                max={5000}
                                step={250}
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="w-full accent-pink-primary"
                              />
                            </div>
                          </div>
                        </Panel>
                      )}
                    </div>

                    {/* Right side: visual grid designer */}
                    {currentSong && activeSegment ? (
                      <div className="lg:col-span-8 space-y-6">
                        <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-5 space-y-5 shadow">
                          
                          {/* Board tools */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-primary/10 pb-4">
                            <div>
                              <span className="text-xs text-pink-primary uppercase font-bold tracking-wider">แก้ไขสำหรับคำร้อง</span>
                              <h3 className="text-xl font-bold text-white">
                                ท่อนที่ {activeSegmentIndex + 1}: "{getSegmentText(activeSegment)}"
                              </h3>
                            </div>
                            
                            {/* Action Buttons / Shortcuts */}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveChanges}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  hasUnsavedChanges
                                    ? 'bg-pink-primary hover:bg-pink-accent text-white shadow-lg shadow-pink-primary/30 ring-2 ring-pink-primary/50 animate-pulse cursor-pointer scale-105'
                                    : 'bg-carbon-dark border border-pink-primary/10 text-text-tertiary opacity-70 cursor-default'
                                }`}
                              >
                                <Save size={14} />
                                <span>{hasUnsavedChanges ? 'บันทึกข้อมูล *' : 'บันทึกเรียบร้อย'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (dragColor === '') {
                                    alert('กรุณาเลือกสีแปรงทาสีก่อนกดเทสีครับ!');
                                    return;
                                  }
                                  handleBulkUpdateVisuals(selectedSongId, activeSegmentIndex, activeWordIndex, 'fill', dragColor);
                                }}
                                className="bg-carbon-dark hover:bg-carbon-light border border-pink-primary/10 text-text-primary px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              >
                                เทสีทั้งหมดในหน้านี้ (Fill)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBulkUpdateVisuals(selectedSongId, activeSegmentIndex, activeWordIndex, 'clear')}
                                className="bg-carbon-dark hover:bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              >
                                ล้างหน้านี้ทั้งหมด (Clear)
                              </button>
                              {(() => {
                                const hasPrevWord = activeWordIndex > 0 || activeSegmentIndex > 0;
                                return (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPreviousWordVisuals(selectedSongId, activeSegmentIndex, activeWordIndex)}
                                      disabled={!hasPrevWord}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                                        hasPrevWord
                                          ? 'bg-pink-primary/10 hover:bg-pink-primary/20 border-pink-primary/30 text-pink-accent cursor-pointer hover:scale-[1.02] active:scale-95'
                                          : 'bg-carbon-light/20 border-pink-primary/5 text-text-tertiary opacity-50 cursor-not-allowed'
                                      }`}
                                      title={hasPrevWord ? 'คัดลอกรูปแบบการแปรอักษรจากคำร้องก่อนหน้านี้' : 'ไม่มีคำก่อนหน้า'}
                                    >
                                      📋 คัดลอกคำก่อนหน้า
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPreviousWordVisuals(selectedSongId, activeSegmentIndex, activeWordIndex, true)}
                                      disabled={!hasPrevWord}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                                        hasPrevWord
                                          ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-500 cursor-pointer hover:scale-[1.02] active:scale-95'
                                          : 'bg-carbon-light/20 border-pink-primary/5 text-text-tertiary opacity-50 cursor-not-allowed'
                                      }`}
                                      title={hasPrevWord ? 'คัดลอกรูปแบบการแปรอักษรจากคำร้องก่อนหน้านี้แบบสลับสีตรงข้าม' : 'ไม่มีคำก่อนหน้า'}
                                    >
                                      🔄 คัดลอกกลับสีกัน
                                    </button>
                                  </div>
                                );
                              })()}
                              
                              <button
                                type="button"
                                onClick={() => setShowWholePagePreview(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-red-600/10 cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center gap-1"
                              >
                                👁️ พรีวิวทั้งหน้า
                              </button>
                            </div>
                          </div>

                          {/* Karaoke/Lyrics Simulation Player */}
                          {(() => {
                            // Helper to get active plate styling
                             const getSegmentColorStyle = (seg: { visuals: Record<string, string> }) => {
                              let action = 'none';
                              if (!isController && currentUser?.seat) {
                                action = seg.visuals[currentUser.seat] || 'none';
                              } else if (seg.visuals) {
                                const counts: Record<string, number> = {};
                                let maxCount = 0;
                                for (const act of Object.values(seg.visuals) as string[]) {
                                  if (!act || act === 'none') continue;
                                  counts[act] = (counts[act] || 0) + 1;
                                  if (counts[act] > maxCount) {
                                    maxCount = counts[act];
                                    action = act;
                                  }
                                }
                              }

                              if (isArmPoseString(action)) {
                                const pose = parseArmPose(action);
                                if (pose) {
                                  return {
                                    textClass: '',
                                    shadowStyle: { textShadow: `0 0 20px ${pose.color}` },
                                    bgClass: 'bg-carbon-card border-2',
                                    bgStyle: { borderColor: pose.color, color: pose.color },
                                    label: `ท่าแขน: ${pose.name}`,
                                    isArmPose: true,
                                    pose: pose
                                  };
                                }
                              }

                              const act = action.toLowerCase().trim();
                              if (act.includes('ชมพู') || act.includes('pink')) {
                                return {
                                  textClass: 'text-pink-primary',
                                  shadowStyle: { textShadow: '0 0 20px rgba(255,46,147,0.9)' },
                                  bgClass: 'bg-pink-primary/10 border-pink-primary/25',
                                  label: 'เพลตชมพู'
                                };
                              }
                              if (act.includes('ขาว') || act.includes('white')) {
                                return {
                                  textClass: 'text-white',
                                  shadowStyle: { textShadow: '0 0 20px rgba(255,255,255,0.9)' },
                                  bgClass: 'bg-white/10 border-white/20',
                                  label: 'เพลตขาว'
                                };
                              }
                              if (act.includes('เหลือง') || act.includes('yellow') || act.includes('ร่ม') || act.includes('umbrella')) {
                                return {
                                  textClass: 'text-yellow-400',
                                  shadowStyle: { textShadow: '0 0 20px rgba(250,204,21,0.9)' },
                                  bgClass: 'bg-yellow-400/10 border-yellow-400/20',
                                  label: 'เพลตเหลือง/ร่ม'
                                };
                              }
                              if (act.includes('น้ำเงิน') || act.includes('blue')) {
                                return {
                                  textClass: 'text-blue-400',
                                  shadowStyle: { textShadow: '0 0 20px rgba(96,165,250,0.9)' },
                                  bgClass: 'bg-blue-400/10 border-blue-400/20',
                                  label: 'เพลตน้ำเงิน'
                                };
                              }
                              if (act.includes('เขียว') || act.includes('green')) {
                                return {
                                  textClass: 'text-green-400',
                                  shadowStyle: { textShadow: '0 0 20px rgba(74,222,128,0.9)' },
                                  bgClass: 'bg-green-400/10 border-green-400/20',
                                  label: 'เพลตเขียว'
                                };
                              }
                              if (act.includes('แดง') || act.includes('red')) {
                                return {
                                  textClass: 'text-red-400',
                                  shadowStyle: { textShadow: '0 0 20px rgba(248,113,113,0.9)' },
                                  bgClass: 'bg-red-400/10 border-red-400/20',
                                  label: 'เพลตแดง'
                                };
                              }
                              return {
                                textClass: 'text-pink-primary',
                                shadowStyle: { textShadow: '0 0 15px rgba(255,46,147,0.6)' },
                                bgClass: 'bg-pink-primary/10 border-pink-primary/20',
                                label: 'หมอบ / เอาป้ายลง'
                              };
                            };

                            const resolvedVisuals = getResolvedVisuals(currentSong, activeSegmentIndex, activeWordIndex);
                            const currentStyle = getSegmentColorStyle({ visuals: resolvedVisuals });

                            const getWordColorStyle = (w: { text: string; isTagged: boolean; visuals?: Record<string, string> }, seg: SongSegment, resolvedVis?: Record<string, string>) => {
                              const visuals = resolvedVis || w.visuals || {};
                              let action = 'none';
                              if (!isController && currentUser?.seat) {
                                action = visuals[currentUser.seat] || 'none';
                              } else {
                                const counts: Record<string, number> = {};
                                let maxCount = 0;
                                for (const act of Object.values(visuals) as string[]) {
                                  if (!act || act === 'none') continue;
                                  counts[act] = (counts[act] || 0) + 1;
                                  if (counts[act] > maxCount) {
                                    maxCount = counts[act];
                                    action = act;
                                  }
                                }
                              }
                              
                              if (action === 'none') {
                                if (!isController && currentUser?.seat) {
                                  action = seg.visuals?.[currentUser.seat] || 'none';
                                } else if (seg.visuals) {
                                  const counts: Record<string, number> = {};
                                  let maxCount = 0;
                                  for (const act of Object.values(seg.visuals) as string[]) {
                                    if (!act || act === 'none') continue;
                                    counts[act] = (counts[act] || 0) + 1;
                                    if (counts[act] > maxCount) {
                                      maxCount = counts[act];
                                      action = act;
                                    }
                                  }
                                }
                              }

                              const act = action.toLowerCase().trim();
                              if (act.includes('ชมพู') || act.includes('pink')) {
                                return {
                                  textClass: 'text-pink-primary',
                                  bgClass: 'bg-pink-primary/10 border-pink-primary/25',
                                  label: 'เพลตชมพู'
                                };
                              }
                              if (act.includes('ขาว') || act.includes('white')) {
                                return {
                                  textClass: 'text-white',
                                  bgClass: 'bg-white/10 border-white/20',
                                  label: 'เพลตขาว'
                                };
                              }
                              if (act.includes('เหลือง') || act.includes('yellow') || act.includes('ร่ม') || act.includes('umbrella')) {
                                return {
                                  textClass: 'text-yellow-400',
                                  bgClass: 'bg-yellow-400/10 border-yellow-400/20',
                                  label: 'เพลตเหลือง/ร่ม'
                                };
                              }
                              if (act.includes('น้ำเงิน') || act.includes('blue')) {
                                return {
                                  textClass: 'text-blue-400',
                                  bgClass: 'bg-blue-400/10 border-blue-400/20',
                                  label: 'เพลตน้ำเงิน'
                                };
                              }
                              if (act.includes('เขียว') || act.includes('green')) {
                                return {
                                  textClass: 'text-green-400',
                                  bgClass: 'bg-green-400/10 border-green-400/20',
                                  label: 'เพลตเขียว'
                                };
                              }
                              if (act.includes('แดง') || act.includes('red')) {
                                return {
                                  textClass: 'text-red-400',
                                  bgClass: 'bg-red-400/10 border-red-400/20',
                                  label: 'เพลตแดง'
                                };
                              }
                              return {
                                textClass: 'text-text-secondary',
                                bgClass: 'bg-carbon-light/30 border-pink-primary/5',
                                label: 'ไม่มีการแปร'
                              };
                            };

                            return (
                              <div className="bg-carbon-dark/80 border border-pink-primary/10 rounded-2xl p-4 text-center relative overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[140px] w-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-primary/5 to-transparent animate-pulse pointer-events-none" />
                                
                                {/* Dynamic Color Action Indicator Badge */}
                                <div className={`mb-3 px-3 py-1 rounded-full text-[11px] font-bold transition-all border uppercase tracking-wider ${currentStyle.bgClass} ${currentStyle.textClass}`} style={currentStyle.bgStyle}>
                                  {!isController ? 'คิวเพลตของคุณ: ' : 'เพลตหลักฝั่งคอนโทรล: '}
                                  {currentStyle.label}
                                </div>
                                {currentStyle.isArmPose && currentStyle.pose && (
                                  <div className="w-16 h-16 mb-3 bg-carbon-dark/50 rounded-xl p-1 border border-pink-primary/10 animate-fadeIn">
                                    <ArmPoseMiniSVG pose={currentStyle.pose} />
                                  </div>
                                )}

                                {/* Words Selector inside the Active Segment (Circled Area in User Screenshot) */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-3 bg-carbon-dark/50 p-2.5 rounded-2xl border border-pink-primary/5 max-w-full">
                                  {activeSegment.words.map((w, wIdx) => {
                                    const isWordActive = activeWordIndex === wIdx;
                                    const wordVisuals = w.visuals || {};
                                    const activeSeatsCount = Object.values(wordVisuals).filter(val => val && val !== 'none').length;
                                    
                                    // คำนวณ resolved visuals เฉพาะคำนี้
                                    const wordResolvedVisuals = getResolvedVisuals(currentSong, activeSegmentIndex, wIdx);
                                    const wordStyle = getWordColorStyle(w, activeSegment, wordResolvedVisuals);
                                    
                                    return (
                                      <button
                                        key={wIdx}
                                        type="button"
                                        onClick={() => handleAttemptNavigate({ wordIndex: wIdx })}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none border flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                                          isWordActive
                                            ? `${wordStyle.bgClass} ${wordStyle.textClass} border-pink-primary ring-2 ring-pink-primary/20 scale-105 shadow-md shadow-pink-primary/10`
                                            : 'bg-carbon-card text-text-secondary border-pink-primary/5 hover:border-pink-primary/20 hover:text-text-primary'
                                        }`}
                                      >
                                        {w.isTagged && <span className="text-[10px] text-pink-accent">★</span>}
                                        <span>{w.text}</span>
                                        {activeSeatsCount > 0 && (
                                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-pink-primary/20 text-pink-accent font-black">
                                            {activeSeatsCount}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Horizontal Scrolling Viewport Wrapper */}
                                <div className="w-full max-w-2xl relative overflow-hidden py-2 border-t border-pink-primary/5 mt-2">
                                  {/* Shadow masking effects on edges */}
                                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-carbon-dark to-transparent pointer-events-none z-10" />
                                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-carbon-dark to-transparent pointer-events-none z-10" />

                                  {/* Native Scrolling Row */}
                                  <div 
                                    ref={karaokeContainerRef}
                                    style={{
                                      scrollbarWidth: 'none',
                                      msOverflowStyle: 'none'
                                    }}
                                    className="w-full overflow-x-auto flex items-center justify-start scroll-smooth py-1 px-[40%] md:px-[45%] [&::-webkit-scrollbar]:hidden"
                                  >
                                    {currentSong.segments.map((seg, idx) => {
                                      const isActive = activeSegmentIndex === idx;
                                      const isNext = activeSegmentIndex + 1 === idx;
                                      const segResolved = getResolvedVisuals(currentSong, idx, seg.words?.length ? seg.words.length - 1 : 0);
                                      const style = getSegmentColorStyle({ visuals: segResolved });

                                      let textClass = '';
                                      let shadowStyle = undefined;
                                      let opacityClass = 'opacity-40 hover:opacity-100';

                                      if (isActive) {
                                        textClass = `${style.textClass} text-xl md:text-2xl scale-110 ${style.bgClass} border karaoke-active`;
                                        shadowStyle = style.shadowStyle;
                                        opacityClass = 'opacity-100';
                                      } else if (isNext) {
                                        textClass = `${style.textClass} text-base md:text-lg`;
                                        opacityClass = 'opacity-75 hover:opacity-100';
                                      } else {
                                        textClass = `${style.textClass} text-base md:text-lg`;
                                      }

                                      return (
                                        <span
                                          key={seg.id}
                                          onClick={() => handleAttemptNavigate({ segmentIndex: idx, wordIndex: 0 })}
                                          style={shadowStyle}
                                          className={`transition-all duration-300 cursor-pointer rounded-xl px-4 py-1.5 font-bold whitespace-nowrap flex-shrink-0 text-center mx-3 hover:scale-105 flex items-center gap-1.5 ${textClass} ${opacityClass}`}
                                        >
                                          {seg.words.map((word, wIdx) => {
                                            const wordResolved = getResolvedVisuals(currentSong, idx, wIdx);
                                            const wordStyle = getWordColorStyle(word, seg, wordResolved);
                                            const isWordActive = isActive && activeWordIndex === wIdx;
                                            
                                            return (
                                              <span
                                                key={wIdx}
                                                className={`transition-all duration-200 ${wordStyle.textClass} ${
                                                  isWordActive 
                                                    ? 'underline decoration-2 underline-offset-4 font-black scale-105' 
                                                    : ''
                                                }`}
                                              >
                                                {word.text}
                                              </span>
                                            );
                                          })}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}


                          {/* Color Palette selectors */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-pink-primary/10 pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-text-secondary mr-1 font-bold">แปรงทาสี:</span>
                              {currentSong.equipment
                                .filter(equip => !isArmPoseString(equip))
                                .map(equip => {
                                  const btnStyle = getSeatColorStyle(equip, currentSong.equipment);
                                  return (
                                    <button
                                      key={equip}
                                      type="button"
                                      onClick={() => setDragColor(equip)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${btnStyle.className} ${
                                        dragColor === equip ? 'ring-2 ring-pink-primary ring-offset-2 ring-offset-carbon-card font-black scale-105' : 'opacity-70 hover:opacity-100'
                                      }`}
                                      style={btnStyle.style}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <span>{getEquipmentDisplayName(equip)}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              
                              <button
                                type="button"
                                onClick={() => setDragColor('')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border bg-carbon-light border-red-500/20 text-red-400 transition-all ${
                                  dragColor === '' ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-carbon-card font-black scale-105' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                ยางลบ (ลบโค้ด)
                              </button>

                              <button
                                type="button"
                                onClick={handleSaveChanges}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                                  hasUnsavedChanges
                                    ? 'bg-pink-primary hover:bg-pink-accent text-white border-pink-accent shadow-lg shadow-pink-primary/30 ring-2 ring-pink-primary/40 animate-pulse cursor-pointer scale-105'
                                    : 'bg-carbon-dark border-pink-primary/10 text-text-tertiary opacity-60 cursor-default'
                                }`}
                              >
                                <Save size={14} />
                                <span>{hasUnsavedChanges ? 'กดบันทึกข้อมูล *' : 'บันทึกแล้ว'}</span>
                              </button>
                            </div>
                            <span className="text-xs text-text-tertiary hidden sm:inline">
                              💡 เทคนิค: คลิกแล้วลากเมาส์เพื่อระบายสีสแตนได้อย่างรวดเร็ว!
                            </span>
                          </div>

                          {/* Visual 180 Seating Grid */}
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-carbon-dark border border-pink-primary/10 p-4 rounded-2xl overflow-auto select-none font-bold">
                              <div 
                                ref={gridContainerRef}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(21, minmax(28px, 1fr))', gap: '4px', justifyContent: 'center', touchAction: 'none' }}
                              >
                                {/* Empty top-left header */}
                                <div className="w-full aspect-square" />
                                {columns.map(col => (
                                  <div key={col} className="text-[8px] sm:text-[10px] text-text-tertiary text-center font-bold flex items-center justify-center w-full aspect-square">{col}</div>
                                ))}

                                {rows.map(row => (
                                  <React.Fragment key={row}>
                                    {/* Row Label */}
                                    <div className="text-[8px] sm:text-[10px] text-text-tertiary font-bold flex items-center justify-center w-full aspect-square">{row}</div>
                                    {/* Seat elements */}
                                    {columns.map(col => {
                                      const seatLabel = `${row}${col}`;
                                      const seatValue = resolvedVisuals[seatLabel] || '';
                                      const bgStyle = getSeatColorStyle(seatValue, currentSong.equipment);
                                      const isPose = isArmPoseString(seatValue);
                                      const parsedPose = isPose ? parseArmPose(seatValue) : null;

                                      return (
                                        <div
                                          key={seatLabel}
                                          data-seat-label={seatLabel}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setIsMouseDown(true);
                                            handleUpdateSeatVisual(selectedSongId, activeSegmentIndex, activeWordIndex, seatLabel, dragColor);
                                          }}
                                          onMouseEnter={() => {
                                            if (isMouseDown) {
                                              handleUpdateSeatVisual(selectedSongId, activeSegmentIndex, activeWordIndex, seatLabel, dragColor);
                                            }
                                          }}
                                          className={`w-full aspect-square rounded-md border text-[8px] sm:text-[10px] cursor-crosshair transition-all flex items-center justify-center relative overflow-hidden ${bgStyle.className}`}
                                          style={bgStyle.style}
                                          title={seatLabel + (seatValue ? `: ${getEquipmentDisplayName(seatValue)}` : ' (ว่าง)')}
                                        >
                                          {isPose && parsedPose ? (
                                            <div className="absolute inset-0 p-0.5">
                                              <ArmPoseMiniSVG pose={parsedPose} />
                                            </div>
                                          ) : (
                                            seatLabel
                                          )}
                                        </div>
                                      );
                                    })}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="lg:col-span-8 bg-carbon-card border border-pink-primary/10 rounded-2xl p-8 text-center text-text-secondary shadow">
                        กรุณาเลือกหรือสร้างเพลงเชียร์เพื่อเริ่มการแปรอักษร
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </section>


        {showAddSongModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-bold">
            <div className="w-full max-w-md bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowAddSongModal(false)} 
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-white mb-4">เพิ่มเพลงเชียร์และแปรอักษรใหม่</h3>
              <form onSubmit={handleAddSong} className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อเพลง</label>
                  <input 
                    value={addSongTitle} 
                    onChange={(e) => setAddSongTitle(e.target.value)} 
                    placeholder="เช่น เพลงมาร์ชสีชมพู, เพลงบูมสี" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-medium" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เนื้อเพลง (วรรคคำด้วยเว้นวรรคเพื่อแยกท่อน)</label>
                  <textarea 
                    value={addSongLyrics} 
                    onChange={(e) => setAddSongLyrics(e.target.value)} 
                    placeholder="เช่น ชมพู สู้ตาย เกรียงไกร ชนะ" 
                    rows={4}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white resize-none font-medium" 
                    required 
                  />
                  <span className="text-[10px] text-text-tertiary font-normal block mt-1">ระบบจะสร้างขั้นตอนแปรอักษรแยกตามคำที่คุณเว้นวรรคไว้โดยอัตโนมัติ</span>
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">อุปกรณ์แปรอักษรและสีที่เลือกใช้</label>
                  
                  {/* Current equipment list */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-carbon-dark rounded-xl border border-pink-primary/10 min-h-[50px] mb-3">
                    {addSongEquipment.length === 0 ? (
                      <span className="text-[11px] text-text-tertiary font-normal flex items-center px-1">ยังไม่มีอุปกรณ์เพิ่ม กรุณาใส่เครื่องมือด้านล่าง</span>
                    ) : (
                      addSongEquipment.map((equip, idx) => {
                        const style = getSeatColorStyle(equip, addSongEquipment);
                        return (
                          <div key={idx} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${style.className}`}
                            style={style.style}>
                            <span>{getEquipmentDisplayName(equip)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAddSongEquipment(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="opacity-75 hover:opacity-100 ml-1 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add new equipment sub-form */}
                  <div className="bg-carbon-dark/50 border border-pink-primary/5 rounded-xl p-3 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="new-equip-name-input"
                        placeholder="ชื่ออุปกรณ์ เช่น เพลตใหญ่, พัด, ร่ม"
                        className="flex-1 bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-primary text-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('new-equip-name-input') as HTMLInputElement;
                          const name = nameInput?.value.trim();
                          if (!name) {
                            alert('กรุณากรอกชื่ออุปกรณ์ก่อนครับ');
                            return;
                          }
                          // Format as Name (HexColor)
                          const formattedName = `${name} (${newEquipColor})`;
                          
                          if (addSongEquipment.includes(formattedName)) {
                            alert('มีอุปกรณ์นี้ในรายการแล้วครับ');
                            return;
                          }
                          
                          setAddSongEquipment(prev => [...prev, formattedName]);
                          nameInput.value = '';
                        }}
                        className="bg-pink-primary hover:bg-pink-accent text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                      >
                        + เพิ่ม
                      </button>
                    </div>

{/* Color selection picker and input */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-text-secondary block">เลือกสีสำหรับอุปกรณ์นี้ (รหัสสี hex หรือเลือกจากจานสี):</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newEquipColor}
                          onChange={(e) => setNewEquipColor(e.target.value)}
                          className="w-8 h-8 rounded border border-pink-primary/20 bg-transparent cursor-pointer outline-none overflow-hidden"
                        />
                        <input
                          type="text"
                          value={newEquipColor}
                          onChange={(e) => setNewEquipColor(e.target.value)}
                          className="bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-primary font-medium w-[120px]"
                          placeholder="#ff007f"
                        />
                        <span className="w-5 h-5 rounded-full border border-pink-primary/20" style={{ backgroundColor: newEquipColor }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddSongModal(false)} 
                    className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                  >
                    สร้างเพลง
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {showEditSegmentsModal && (() => {
          const currentSong = data.songs.find((s: Song) => s.id === selectedSongId) || data.songs[0];
          if (!currentSong) return null;
          return (
            <EditSegmentsModal
              isOpen={showEditSegmentsModal}
              onClose={() => setShowEditSegmentsModal(false)}
              song={currentSong}
              onSave={handleSaveSegmentsText}
              onSuccess={() => {
                setActiveSegmentIndex(0);
                setShowEditSegmentsModal(false);
              }}
            />
          );
        })()}


        {showArmPoseModal && (
          <ArmPoseEditorModal
            isOpen={showArmPoseModal}
            onClose={() => setShowArmPoseModal(false)}
            onSave={(name, color, leftArm, rightArm, isSymmetric, layout) => {
              const currentSong = data.songs.find((s: Song) => s.id === selectedSongId);
              if (!currentSong) return;
              
              const newPose: ArmPoseEquipment = {
                type: 'arm_pose',
                name,
                color,
                leftArm,
                rightArm,
                isSymmetric,
                ...layout
              };
              
              const serialized = serializeArmPose(newPose);
              
              if (currentSong.equipment.includes(serialized)) {
                alert('มีท่าทางนี้ในรายการแล้วครับ');
                return;
              }
              
              const updated = [...currentSong.equipment, serialized];
              handleUpdateSongEquipment(currentSong.id, updated);
              setDragColor(serialized); // auto select newly created pose
              setShowArmPoseModal(false);
            }}
          />
        )}


      {/* Custom Modal for Whole Page Stunt Preview */}
      {(() => {
        const currentSong = data.songs.find((s: Song) => s.id === selectedSongId);
        if (!showWholePagePreview || !currentSong) return null;
        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-6xl bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative font-sans text-white max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowWholePagePreview(false)} 
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                👁️ พรีวิวการแปรอักษรทั้งหน้า (ท่อนที่ {activeSegmentIndex + 1})
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                เพลง: {currentSong.title} | คำร้อง: <span className="text-pink-primary font-bold">{getSegmentText(currentSong.segments[activeSegmentIndex])}</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const words = currentSong.segments[activeSegmentIndex]?.words || [];
                  const groups: {
                    wordIndices: number[];
                    wordTexts: string[];
                    visuals: Record<string, string>;
                  }[] = [];

                  // Helper: สร้างสตริงระบุค่าสีทุกที่นั่งในตารางเพื่อเทียบความเท่ากัน
                  const serializeVisuals = (vis: Record<string, string>) => {
                    return rows.map(r => columns.map(c => `${r}${c}:${vis[`${r}${c}`] || ''}`).join(',')).join(';');
                  };

                  words.forEach((w, wIdx) => {
                    const resolvedVisuals = getResolvedVisuals(currentSong, activeSegmentIndex, wIdx);
                    const serialized = serializeVisuals(resolvedVisuals);

                    if (groups.length > 0 && (groups[groups.length - 1] as any).serializedKey === serialized) {
                      // รวมเข้ากลุ่มก่อนหน้าถ้ารูปแบบแปรอักษรเหมือนกัน
                      groups[groups.length - 1].wordIndices.push(wIdx);
                      groups[groups.length - 1].wordTexts.push(w.text);
                    } else {
                      // สร้างกลุ่มใหม่
                      groups.push({
                        wordIndices: [wIdx],
                        wordTexts: [w.text],
                        visuals: resolvedVisuals,
                        ...({ serializedKey: serialized } as any)
                      });
                    }
                  });

                  return groups.map((group, gIdx) => {
                    const uniqueTexts = Array.from(new Set(group.wordTexts));
                    const labelText = uniqueTexts.join(' / ');
                    
                    let indexText = '';
                    if (group.wordIndices.length === 1) {
                      indexText = `คำที่ ${group.wordIndices[0] + 1}`;
                    } else {
                      indexText = `คำที่ ${group.wordIndices[0] + 1} - ${group.wordIndices[group.wordIndices.length - 1] + 1}`;
                    }

                    return (
                      <div key={gIdx} className="bg-carbon-dark border border-pink-primary/10 rounded-2xl p-4 flex flex-col items-center space-y-3">
                        <div className="text-center">
                          <span className="text-xs text-text-tertiary">{indexText}</span>
                          <h4 className="text-lg font-bold text-pink-accent mt-0.5">{labelText}</h4>
                        </div>
                        
                        {/* Mini Seating Grid */}
                        <div className="w-full aspect-[20/9] max-w-xs bg-carbon-light/30 border border-pink-primary/5 p-2 rounded-xl">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '1px' }} className="w-full h-full">
                            {rows.map(row => 
                              columns.map(col => {
                                const seatLabel = `${row}${col}`;
                                const val = group.visuals[seatLabel] || '';
                                const colorStyle = getSeatColorStyle(val, currentSong.equipment);
                                const seatBg = colorStyle.style?.backgroundColor || (
                                  colorStyle.className.includes('bg-pink-primary') ? '#ff2e93' : 
                                  colorStyle.className.includes('bg-[#ffffff]') ? '#ffffff' : 
                                  colorStyle.className.includes('bg-blue-600') ? '#2563eb' : 
                                  colorStyle.className.includes('bg-yellow-500') ? '#eab308' : 
                                  colorStyle.className.includes('bg-green-600') ? '#16a34a' : 
                                  colorStyle.className.includes('bg-red-600') ? '#dc2626' : 
                                  'rgba(255,255,255,0.05)'
                                );
                                return (
                                  <div 
                                    key={seatLabel} 
                                    style={{ backgroundColor: seatBg }} 
                                    className="w-full h-full rounded-[1px] border-[0.5px] border-black/20"
                                    title={seatLabel + (val ? `: ${val}` : '')}
                                  />
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowWholePagePreview(false)}
                  className="bg-pink-primary hover:bg-pink-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-primary/20 active:scale-95 cursor-pointer"
                >
                  ปิดหน้าพรีวิว
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Unsaved Changes Warning Modal */}
      {pendingNav && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-bold">
          <div className="w-full max-w-md bg-carbon-card border border-pink-primary/30 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 border-b border-pink-primary/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">คุณยังไม่ได้บันทึกข้อมูล</h3>
                <p className="text-xs text-text-secondary">มีข้อมูลลงสีที่เพิ่งแก้ไขในคำร้องนี้อยู่</p>
              </div>
            </div>

            <p className="text-sm text-text-primary leading-relaxed font-medium">
              คุณต้องการ <span className="text-pink-primary font-bold">บันทึกข้อมูล</span> การลงสีคำร้องนี้ก่อนเปลี่ยนไปคำ/ท่อนเพลงอื่นหรือไม่?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPendingNav(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-carbon-dark border border-pink-primary/10 text-text-secondary hover:text-white transition-all text-center cursor-pointer"
              >
                ยกเลิก (อยู่หน้านี้ต่อ)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkingSongs(data.songs);
                  setHasUnsavedChanges(false);
                  const nav = pendingNav;
                  setPendingNav(null);
                  if (nav) executeNavigation(nav);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-center cursor-pointer"
              >
                ไม่บันทึก
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveChanges();
                  const nav = pendingNav;
                  setPendingNav(null);
                  if (nav) executeNavigation(nav);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-primary hover:bg-pink-accent text-white shadow-lg shadow-pink-primary/20 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                <span>บันทึกข้อมูลและไปต่อ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-[120] bg-green-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2.5 animate-bounce border border-green-400/30">
          <CheckCircle size={20} />
          <span>บันทึกแผนผังแปรอักษรเรียบร้อยแล้ว!</span>
        </div>
      )}

    </>
  );
}

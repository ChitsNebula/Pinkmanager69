// src/lib/helpers.ts
// Pure helper functions extracted from page.tsx

import React from 'react';
import { ArmPoseEquipment, SubSegment } from '../app/types';
import { Song } from '../app/store';

// ─── Seat Grid Constants ──────────────────────────────────────────────────────
export const rows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
export const columns = Array.from({ length: 20 }, (_, i) => i + 1);

// ─── Classroom Sort ───────────────────────────────────────────────────────────
export const classroomSortKey = (classroom: string) => {
  const match = classroom.match(/ม\.(\d+)\/(\d+)/);
  if (!match) return [99, 99, classroom] as const;
  return [Number(match[1]), Number(match[2]), classroom] as const;
};

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const createId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Thai Grapheme Segmentation ───────────────────────────────────────────────
export const segmentThaiGraphemes = (text: string): string[] => {
  const combiningMarks = /[\u0E31\u0E33\u0E34-\u0E3A\u0E47-\u0E4E]/;
  const clusters: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (combiningMarks.test(char) && clusters.length > 0) {
      clusters[clusters.length - 1] += char;
    } else {
      clusters.push(char);
    }
  }
  return clusters;
};

export const segmentThaiWords = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
      const segments = segmenter.segment(text);
      return Array.from(segments).map(s => s.segment);
    } catch (e) {
      console.error(e);
    }
  }
  return text.split(/(\s+)/).filter(Boolean);
};

export const getWordBoundaries = (words: string[]): number[] => {
  const boundaries: number[] = [];
  let currentGraphemeCount = 0;
  for (let i = 0; i < words.length; i++) {
    const wordGraphemes = segmentThaiGraphemes(words[i]);
    currentGraphemeCount += wordGraphemes.length;
    boundaries.push(currentGraphemeCount - 1);
  }
  return boundaries;
};

// ─── Segment Text Helpers ─────────────────────────────────────────────────────
export const getSegmentText = (seg: { words?: { text: string }[]; text?: string }): string => {
  if (seg.words && seg.words.length > 0) {
    return seg.words.map(w => w.text).join('');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (seg as any).text || '';
};

export const getSegmentTaggedWords = (
  seg: { words?: { text: string; isTagged: boolean }[] }
): { text: string; isTagged: boolean }[] => {
  if (!seg.words) return [];
  return seg.words.filter(w => w.isTagged);
};

export const buildSubSegments = (
  segments: { id: string; words?: { text: string; isTagged: boolean }[] }[]
): SubSegment[] => {
  const result: SubSegment[] = [];
  segments.forEach((seg, segIdx) => {
    if (!seg.words) return;
    seg.words.forEach((w, wIdx) => {
      if (w.isTagged) {
        result.push({ segmentIndex: segIdx, wordText: w.text, segId: seg.id, wordIdx: wIdx });
      }
    });
  });
  return result;
};

// ─── Arm Pose Helpers ─────────────────────────────────────────────────────────
export const isArmPoseString = (value: string): boolean =>
  value ? value.startsWith('__ARMPOSE__:') : false;

export const parseArmPose = (value: string): ArmPoseEquipment | null => {
  if (!isArmPoseString(value)) return null;
  try {
    return JSON.parse(value.substring(12));
  } catch (e) {
    console.error('Failed to parse arm pose JSON', e);
    return null;
  }
};

export const serializeArmPose = (pose: ArmPoseEquipment): string =>
  `__ARMPOSE__:${JSON.stringify(pose)}`;

export const getEquipmentDisplayName = (equip: string): string => {
  if (isArmPoseString(equip)) {
    const pose = parseArmPose(equip);
    return pose ? pose.name : 'ท่าแขน (ไม่ถูกต้อง)';
  }
  return equip;
};

export const getEquipmentColor = (equip: string): string => {
  if (isArmPoseString(equip)) {
    const pose = parseArmPose(equip);
    return pose ? pose.color : '#ffffff';
  }
  const hexMatch = equip.match(/\((#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\)$/);
  if (hexMatch) return hexMatch[1];
  return '#ffffff';
};

// ─── Seat Color Style ─────────────────────────────────────────────────────────
export const getSeatColorStyle = (
  value: string,
  equipmentList: string[]
): { className: string; style?: React.CSSProperties } => {
  if (!value)
    return { className: 'bg-carbon-card border-pink-primary/10 text-text-tertiary hover:border-pink-primary/30' };

  if (isArmPoseString(value)) {
    const pose = parseArmPose(value);
    if (pose) {
      return {
        className: 'border font-bold',
        style: {
          backgroundColor: 'rgba(23, 26, 32, 0.4)',
          color: pose.color,
          borderColor: pose.color,
        },
      };
    }
  }

  const val = value.toLowerCase().trim();

  const hexMatch = val.match(/\((#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\)$/);
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
    const borderColor = brightness > 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
    return {
      className: 'font-bold border',
      style: { backgroundColor: hexColor, color: textColor, borderColor },
    };
  }

  if (val.endsWith('(ชมพู)') || val.endsWith('(pink)'))
    return { className: 'bg-pink-primary border-pink-accent text-white font-bold' };
  if (val.endsWith('(ขาว)') || val.endsWith('(white)'))
    return { className: 'bg-[#ffffff] border-gray-300 text-[#0f1016] font-bold' };
  if (val.endsWith('(เหลือง)') || val.endsWith('(yellow)') || val.endsWith('(ร่ม)'))
    return { className: 'bg-yellow-500 border-yellow-400 text-white font-bold' };
  if (val.endsWith('(น้ำเงิน)') || val.endsWith('(blue)'))
    return { className: 'bg-blue-600 border-blue-400 text-white font-bold' };
  if (val.endsWith('(เขียว)') || val.endsWith('(green)'))
    return { className: 'bg-green-600 border-green-400 text-white font-bold' };
  if (val.endsWith('(แดง)') || val.endsWith('(red)'))
    return { className: 'bg-red-600 border-red-400 text-white font-bold' };

  if (val.includes('ชมพู') || val.includes('pink'))
    return { className: 'bg-pink-primary border-pink-accent text-white font-bold' };
  if (val.includes('ขาว') || val.includes('white'))
    return { className: 'bg-[#ffffff] border-gray-300 text-[#0f1016] font-bold' };
  if (val.includes('ร่ม') || val.includes('เหลือง') || val.includes('yellow') || val.includes('umbrella'))
    return { className: 'bg-yellow-500 border-yellow-400 text-white font-bold' };
  if (val.includes('น้ำเงิน') || val.includes('blue'))
    return { className: 'bg-blue-600 border-blue-400 text-white font-bold' };
  if (val.includes('เขียว') || val.includes('green'))
    return { className: 'bg-green-600 border-green-400 text-white font-bold' };
  if (val.includes('แดง') || val.includes('red'))
    return { className: 'bg-red-600 border-red-400 text-white font-bold' };

  const idx = equipmentList.indexOf(value);
  if (idx === 0) return { className: 'bg-pink-primary border-pink-accent text-white font-bold' };
  if (idx === 1) return { className: 'bg-[#ffffff] border-gray-300 text-[#0f1016] font-bold' };
  if (idx === 2) return { className: 'bg-yellow-500 border-yellow-400 text-white font-bold' };
  if (idx === 3) return { className: 'bg-blue-600 border-blue-400 text-white font-bold' };
  if (idx === 4) return { className: 'bg-green-600 border-green-400 text-white font-bold' };

  return { className: 'bg-pink-primary/30 border-pink-primary/50 text-white font-bold' };
};

// ─── Resolved Visuals ─────────────────────────────────────────────────────────
export const getResolvedVisuals = (
  song: Song,
  targetSegIdx: number,
  targetWordIdx: number
): Record<string, string> => {
  const resolved: Record<string, string> = {};
  if (!song || !song.segments) return resolved;

  for (let sIdx = 0; sIdx <= targetSegIdx; sIdx++) {
    const seg = song.segments[sIdx];
    if (!seg) continue;

    if (seg.visuals) {
      Object.assign(resolved, seg.visuals);
    }

    const wordsLimit = sIdx === targetSegIdx ? targetWordIdx : (seg.words?.length || 1) - 1;
    if (seg.words && seg.words.length > 0) {
      for (let wIdx = 0; wIdx <= wordsLimit; wIdx++) {
        const w = seg.words[wIdx];
        if (w && w.visuals) {
          for (const [seat, val] of Object.entries(w.visuals)) {
            if (val && val !== 'none') {
              resolved[seat] = val;
            } else if (val === 'none') {
              resolved[seat] = '';
            }
          }
        }
      }
    }
  }
  return resolved;
};

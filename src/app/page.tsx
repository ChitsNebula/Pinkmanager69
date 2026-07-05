'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Copy,
  Download,
  Image as ImageIcon,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  User,
  Users,
  X,
  Settings,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  Announcement,
  SpecialDuty,
  addSportsEvent,
  assignAthleteToEvent,
  bookSeat,
  getStoredData,
  releaseSeat,
  removeAthleteFromEvent,
  removeSportsEvent,
  saveAnnouncements,
  saveSystemConfig,
  subscribe,
  updateStudent,
  deleteStudent,
  updateMultipleStudents,
  saveSongs,
  toggleSongLock,
  Song,
  SongSegment,
  SystemReport,
  saveSystemReports,
  importStudentsData,
  saveColorHouseCheckins,
  ColorHouseCheckin,
  saveStoredData,
  initializeSupabaseSync,
  getSupabaseConnectionStatus,
  updateStudentContact,
} from './store';
import { Duty, SportsEvent, Student } from './mockData';
import { Tab, ArmPoseEquipment, ArmPose, SubSegment } from './types';
import {
  rows,
  columns,
  classroomSortKey,
  createId,
  fileToDataUrl,
  segmentThaiGraphemes,
  segmentThaiWords,
  getWordBoundaries,
  getSegmentText,
  getSegmentTaggedWords,
  buildSubSegments,
  isArmPoseString,
  parseArmPose,
  serializeArmPose,
  getEquipmentDisplayName,
  getEquipmentColor,
  getSeatColorStyle,
  getResolvedVisuals,
  roleLabel,
} from '../lib/helpers';
import { Panel, ErrorBoundary } from '../components/ui';
import { EditSegmentsModal } from '../components/modals/EditSegmentsModal';
import { SeatGrid } from '../components/ui/SeatGrid';
import { ArmPoseMiniSVG } from '../components/ui/ArmPoseMiniSVG';
import { Navbar } from '../components/layout/Navbar';

import { LoginScreen } from '../components/layout/LoginScreen';
import { AnnouncementsTab } from '../components/tabs/AnnouncementsTab';
import { ReportsTab } from '../components/tabs/ReportsTab';
import { AthleteTab } from '../components/tabs/AthleteTab';
import { RegistryTab } from '../components/tabs/RegistryTab';
import { AdminTab } from '../components/tabs/AdminTab';
import { DashboardTab } from '../components/tabs/DashboardTab';
import { CardStuntTab } from '../components/tabs/CardStuntTab';
import { ColorHouseTab, getISOWeekKey } from '../components/tabs/ColorHouseTab';


interface ArmPoseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string, 
    color: string, 
    leftArm: ArmPose, 
    rightArm: ArmPose, 
    isSymmetric: boolean, 
    layout: { armThickness: number, armLength: number, centerX: number, centerY: number, shoulderDistance: number }
  ) => void;
}

function ArmPoseEditorModal({ isOpen, onClose, onSave }: ArmPoseEditorModalProps) {
  const [poseName, setPoseName] = useState<string>('ท่าแขนใหม่');
  const [poseColor, setPoseColor] = useState<string>('#11ff00');
  const [isSymmetric, setIsSymmetric] = useState<boolean>(true);

  // Left Arm State
  const [leftUpperArm, setLeftUpperArm] = useState<number>(45);
  const [leftForearm, setLeftForearm] = useState<number>(0);
  const [leftHand, setLeftHand] = useState<number>(0);

  // Right Arm State (only used if not symmetric)
  const [rightUpperArm, setRightUpperArm] = useState<number>(45);
  const [rightForearm, setRightForearm] = useState<number>(0);
  const [rightHand, setRightHand] = useState<number>(0);

  // Arm Layout Settings (Thickness, Length, Center X, Center Y, Shoulder Distance)
  const [armThickness, setArmThickness] = useState<number>(8);
  const [armLength, setArmLength] = useState<number>(50);
  const [centerX, setCenterX] = useState<number>(50);
  const [centerY, setCenterY] = useState<number>(45);
  const [shoulderDistance, setShoulderDistance] = useState<number>(10);

  // If symmetric, keep right arm angles synchronized with left arm
  const currentRightUpper = isSymmetric ? leftUpperArm : rightUpperArm;
  const currentRightFore = isSymmetric ? leftForearm : rightForearm;
  const currentRightHand = isSymmetric ? leftHand : rightHand;

  const handleSave = () => {
    if (!poseName.trim()) {
      alert('กรุณากรอกชื่อท่าทางด้วยครับ');
      return;
    }
    onSave(
      poseName.trim(),
      poseColor,
      { upperArmAngle: leftUpperArm, forearmAngle: leftForearm, handAngle: leftHand },
      { upperArmAngle: currentRightUpper, forearmAngle: currentRightFore, handAngle: currentRightHand },
      isSymmetric,
      { armThickness, armLength, centerX, centerY, shoulderDistance }
    );
  };

  if (!isOpen) return null;

  // Mock object for drawing preview SVG
  const previewPose: ArmPoseEquipment = {
    type: 'arm_pose',
    name: poseName,
    color: poseColor,
    leftArm: { upperArmAngle: leftUpperArm, forearmAngle: leftForearm, handAngle: leftHand },
    rightArm: { upperArmAngle: currentRightUpper, forearmAngle: currentRightFore, handAngle: currentRightHand },
    isSymmetric,
    armThickness,
    armLength,
    centerX,
    centerY,
    shoulderDistance
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative font-sans text-white overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
        >
          <X size={22} />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🛠️ ออกแบบท่าแขนแปรอักษร (Front View)</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-carbon-dark/50 rounded-2xl p-5 border border-pink-primary/10 min-h-[300px]">
            <span className="text-xs text-text-secondary mb-2 uppercase tracking-wider font-bold">พรีวิวการแสดงท่าทาง</span>
            <div className="w-48 h-48 bg-carbon-card rounded-2xl p-4 border border-pink-primary/5 flex items-center justify-center relative shadow-inner">
              <ArmPoseMiniSVG pose={previewPose} className="w-full h-full" />
            </div>
            <div className="mt-4 flex gap-3 text-center text-xs text-text-tertiary">
              <div><span className="inline-block w-2.5 h-2.5 rounded bg-white mr-1 border border-gray-400" /> ถุงมือขาว</div>
              <div><span className="inline-block w-2.5 h-2.5 rounded mr-1" style={{ backgroundColor: poseColor }} /> ปลอกแขน/สีท่าทาง</div>
            </div>

            {/* Layout Controls: Position, Length, Thickness */}
            <div className="w-full mt-5 bg-carbon-dark/30 border border-pink-primary/5 rounded-2xl p-4 space-y-3.5">
              <span className="text-xs text-pink-primary font-extrabold uppercase tracking-wide block border-b border-pink-primary/10 pb-1.5">📏 ขนาดและตำแหน่ง (Geometry)</span>
              
              {/* Arm Thickness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>ความหนาแขน (Thickness)</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="4" 
                      max="20" 
                      value={armThickness}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setArmThickness(isNaN(val) ? 8 : Math.max(4, Math.min(20, val)));
                      }}
                      className="w-12 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                    />
                    <span className="text-text-tertiary">px</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="20" 
                  value={armThickness}
                  onChange={(e) => setArmThickness(Number(e.target.value))}
                  className="w-full accent-pink-primary"
                />
              </div>

              {/* Arm Length Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>ความยาวแขน (Length)</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="10" 
                      max="60" 
                      value={armLength}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setArmLength(isNaN(val) ? 30 : Math.max(10, Math.min(60, val)));
                      }}
                      className="w-12 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                    />
                    <span className="text-text-tertiary">px</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="60" 
                  value={armLength}
                  onChange={(e) => setArmLength(Number(e.target.value))}
                  className="w-full accent-pink-primary"
                />
              </div>

              {/* Center Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>ตำแหน่งแนวตั้ง (Center Y)</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="10" 
                      max="90" 
                      value={centerY}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCenterY(isNaN(val) ? 40 : Math.max(10, Math.min(90, val)));
                      }}
                      className="w-12 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                    />
                    <span className="text-text-tertiary">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  value={centerY}
                  onChange={(e) => setCenterY(Number(e.target.value))}
                  className="w-full accent-pink-primary"
                />
              </div>

              {/* Center X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>ตำแหน่งแนวนอน (Center X)</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="10" 
                      max="90" 
                      value={centerX}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCenterX(isNaN(val) ? 50 : Math.max(10, Math.min(90, val)));
                      }}
                      className="w-12 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                    />
                    <span className="text-text-tertiary">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  value={centerX}
                  onChange={(e) => setCenterX(Number(e.target.value))}
                  className="w-full accent-pink-primary"
                />
              </div>

              {/* Shoulder Distance Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>ระยะห่างระหว่างไหล่/แขน</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={shoulderDistance}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setShoulderDistance(isNaN(val) ? 10 : Math.max(0, Math.min(100, val)));
                      }}
                      className="w-12 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                    />
                    <span className="text-text-tertiary">px</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={shoulderDistance}
                  onChange={(e) => setShoulderDistance(Number(e.target.value))}
                  className="w-full accent-pink-primary"
                />
              </div>
            </div>
          </div>

          {/* Right panel: Sliders & Settings */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">ชื่อท่าทาง</label>
                <input 
                  type="text" 
                  value={poseName}
                  onChange={(e) => setPoseName(e.target.value)}
                  placeholder="เช่น ท่ากางแขน V, ท่าชูสองข้าง"
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-primary font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">สีตัวแทนท่าทาง</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={poseColor}
                    onChange={(e) => setPoseColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-pink-primary/10 bg-transparent cursor-pointer overflow-hidden shrink-0"
                  />
                  <input 
                    type="text" 
                    value={poseColor}
                    onChange={(e) => setPoseColor(e.target.value)}
                    className="flex-1 bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-primary font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-carbon-dark/30 p-3.5 rounded-2xl border border-pink-primary/5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isSymmetric}
                  onChange={(e) => setIsSymmetric(e.target.checked)}
                  className="accent-pink-primary w-4 h-4 rounded"
                />
                <span className="text-xs text-white font-bold">ก๊อปปี้ไปอีกข้างแบบสมมาตร (Symmetric / Flip Copy อัตโนมัติ)</span>
              </label>
            </div>

            {/* Arm Angle Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Arm Panel */}
              <div className="bg-carbon-dark/40 border border-pink-primary/5 rounded-2xl p-4 space-y-3">
                <span className="text-xs text-pink-primary font-extrabold uppercase tracking-wide">💪 ปรับแขนซ้าย</span>
                
                {/* Upper Arm Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>แขนท่อนบน (Upper Arm)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={leftUpperArm}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLeftUpperArm(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={leftUpperArm}
                    onChange={(e) => setLeftUpperArm(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary">
                    <span>-180° ชี้ขึ้นข้างใน</span>
                    <span>0° ลง</span>
                    <span>180° ขึ้นข้างนอก</span>
                  </div>
                </div>

                {/* Forearm Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>แขนท่อนล่าง (Forearm - ข้อศอก)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={leftForearm}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLeftForearm(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={leftForearm}
                    onChange={(e) => setLeftForearm(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary">
                    <span>-180° พับเข้าใน</span>
                    <span>0° ตรง</span>
                    <span>180° พับขึ้น</span>
                  </div>
                </div>

                {/* Hand Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>ข้อมือ / ทิศทางมือ (Hand)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={leftHand}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLeftHand(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px]"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={leftHand}
                    onChange={(e) => setLeftHand(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary">
                    <span>-180° หักลง</span>
                    <span>0° ตรง</span>
                    <span>180° หักขึ้น</span>
                  </div>
                </div>
              </div>

              {/* Right Arm Panel */}
              <div className={`bg-carbon-dark/40 border border-pink-primary/5 rounded-2xl p-4 space-y-3 transition-opacity duration-300 ${isSymmetric ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-pink-primary font-extrabold uppercase tracking-wide">💪 ปรับแขนขวา</span>
                  {isSymmetric && <span className="text-[10px] bg-pink-primary/10 text-pink-accent px-2 py-0.5 rounded font-bold">โหมดสมมาตรเปิดอยู่</span>}
                </div>
                
                {/* Upper Arm Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>แขนท่อนบน (Upper Arm)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={currentRightUpper}
                        disabled={isSymmetric}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setRightUpperArm(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px] disabled:opacity-50"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={currentRightUpper}
                    disabled={isSymmetric}
                    onChange={(e) => setRightUpperArm(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                </div>

                {/* Forearm Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>แขนท่อนล่าง (Forearm - ข้อศอก)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={currentRightFore}
                        disabled={isSymmetric}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setRightForearm(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px] disabled:opacity-50"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={currentRightFore}
                    disabled={isSymmetric}
                    onChange={(e) => setRightForearm(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                </div>

                {/* Hand Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>ข้อมือ / ทิศทางมือ (Hand)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={currentRightHand}
                        disabled={isSymmetric}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setRightHand(isNaN(val) ? 0 : Math.max(-180, Math.min(180, val)));
                        }}
                        className="w-14 bg-carbon-dark border border-pink-primary/10 rounded px-1.5 py-0.5 text-center text-white font-bold focus:outline-none focus:border-pink-primary text-[11px] disabled:opacity-50"
                      />
                      <span className="text-text-tertiary">°</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={currentRightHand}
                    disabled={isSymmetric}
                    onChange={(e) => setRightHand(Number(e.target.value))}
                    className="w-full accent-pink-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light text-text-secondary py-2.5 rounded-xl text-sm font-bold transition-all text-center border border-pink-primary/5 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-primary/10 text-center cursor-pointer"
              >
                บันทึกการออกแบบท่าทาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// EditSegmentsModal — imported from components/modals/EditSegmentsModal



// getResolvedVisuals — imported from lib/helpers

export default function Home() {
  const [data, setData] = useState(() => getStoredData());
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = currentUserId
    ? data.students.find((s: Student) => s.id === currentUserId) ?? null
    : null;

  const [loginTab, setLoginTab] = useState<'member' | 'staff'>('member');
  const [loginClassroom, setLoginClassroom] = useState('');
  const [loginNumber, setLoginNumber] = useState('');
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState('');

  // States for student contact prompt
  const [contactType, setContactType] = useState<'Line' | 'IG'>('Line');
  const [contactValue, setContactValue] = useState('');
  const [contactError, setContactError] = useState('');

  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [newAnnouncementImage, setNewAnnouncementImage] = useState('');
  // Admin/Controller inputs and modal states are now handled inside AdminTab component
  const [lightTheme, setLightTheme] = useState<boolean>(true);
  // Seat assignment modal state (used by handleSeatClick and seat modal in page.tsx)
  const [selectedSeatForAssign, setSelectedSeatForAssign] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState<string>('');
  
  // Registry modals are now handled locally inside RegistryTab component


  
  // Edit song segments inline text
  // Report states
  const [reportSubject, setReportSubject] = useState<string>('name_wrong');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Guest report states
  const [showGuestReportModal, setShowGuestReportModal] = useState<boolean>(false);
  const [guestReportName, setGuestReportName] = useState<string>('');
  const [guestReportClassroom, setGuestReportClassroom] = useState<string>('');
  const [guestReportNumber, setGuestReportNumber] = useState<string>('');
  const [guestReportStudentId, setGuestReportStudentId] = useState<string>('');
  const [guestReportSubject, setGuestReportSubject] = useState<string>('login_issue');
  const [guestReportDescription, setGuestReportDescription] = useState<string>('');

  // Image cropping states
  const [cropStudentId, setCropStudentId] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  
  useEffect(() => {
    setMounted(true);
    // เรียกโหลดข้อมูลจาก Supabase Real-time Sync แบบ Asynchronous
    initializeSupabaseSync().catch(console.error);

    const unsubscribe = subscribe(() => {
      const next = getStoredData();
      setData(next);
    });
    return unsubscribe;
  }, []);

  const classrooms = useMemo(() => {
    return [...new Set(data.students.map((s: Student) => s.classroom).filter(Boolean) as string[])]
      .sort((a: string, b: string) => {
        const ak = classroomSortKey(a);
        const bk = classroomSortKey(b);
        return ak[0] - bk[0] || ak[1] - bk[1] || ak[2].localeCompare(bk[2], 'th');
      });
  }, [data.students]);

  useEffect(() => {
    if (classrooms.length > 0) {
      if (!loginClassroom) setLoginClassroom(classrooms[0]);
      if (!guestReportClassroom) setGuestReportClassroom(classrooms[0]);
    }
  }, [classrooms, loginClassroom, guestReportClassroom]);

  // isController ตรวจสอบจาก data.controllers/moderators เท่านั้น
  // ห้ามเช็ค role field โดยตรง มิฉะนั้นสมาชิกที่ login ผ่านช่องสมาชิก
  // จะได้สิทธิ์ admin โดยอัตโนมัติแค่มี role === 'staff_m5' ในฐานข้อมูล
  const isSuperController = !!currentUser && data.controllers.includes(currentUser.id);
  const isModerator = !!currentUser && (data.moderators || []).includes(currentUser.id);
  const isController = isSuperController || isModerator;
  const isNormalStudent = !!currentUser && !isController;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (lightTheme) {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
    }
  }, [lightTheme]);

  useEffect(() => {
    if (currentUser && !isController && currentUser.assigned_duty !== 'stand' && currentTab === 'choreo') {
      setCurrentTab('dashboard');
    }
  }, [currentUser, isController, currentTab]);
  const standApplicants = data.students.filter((s: Student) => s.duties?.['stand'] === 'approved');
  const seatedStudents = data.students.filter((s: Student) => s.seat);
  const unassignedStudents = data.students.filter((s: Student) => {
    const activeDuties = Object.entries(s.duties || {}).filter(([_, status]) => status === 'approved');
    return activeDuties.length === 0;
  });

  const detectedStudent = data.students.find(
    (s: Student) => s.classroom === loginClassroom && String(s.number) === String(loginNumber)
  );
  // roleLabel — now imported from lib/helpers

  const dutyLabel = (duty: Duty) => {
    const dynamic = data.specialDuties.find((item: SpecialDuty) => item.id === duty);
    if (dynamic) return dynamic.title;
    switch (duty) {
      case 'none':
        return 'ยังไม่มีหน้าที่';
      case 'stand':
        return 'สแตนเชียร์';
      case 'athlete':
        return 'นักกีฬา';
      case 'procession':
        return data.processionTitle || 'เดินขบวนพาเหรด';
      case 'staff':
        return 'พี่คุมงาน / สตาฟ';
      default:
        return duty;
    }
  };

  const dutyOptions = useMemo(() => {
    return [
      { id: 'none', label: 'ยังไม่มีหน้าที่' },
      { id: 'stand', label: 'สแตนเชียร์' },
      { id: 'athlete', label: 'นักกีฬา' },
      { id: 'procession', label: data.processionTitle || 'ขบวนพาเหรด' },
      ...data.specialDuties.map((item: SpecialDuty) => ({ id: item.id, label: item.title })),
    ];
  }, [data.specialDuties]);

  const dutyCounts = useMemo(() => {
    return dutyOptions.map((option) => {
      if (option.id === 'none') {
        return {
          ...option,
          count: data.students.filter((s: Student) => {
            const activeDuties = Object.entries(s.duties || {}).filter(([_, status]) => status === 'approved');
            return activeDuties.length === 0;
          }).length,
        };
      }
      return {
        ...option,
        count: data.students.filter((s: Student) => s.duties?.[option.id] === 'approved').length,
      };
    });
  }, [data.students, dutyOptions]);

  

  const getSeatOwner = (seatLabel: string) => {
    return data.students.find((s: Student) => s.seat === seatLabel);
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const student = data.students.find(
      (s: Student) => s.classroom === loginClassroom && String(s.number) === String(loginNumber) && s.id === loginStudentId
    );
    if (!student) {
      setLoginError('ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบห้อง เลขที่ และรหัสประจำตัว');
      return;
    }
    setCurrentUserId(student.id);
    setCurrentTab('dashboard');
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');

    const staffMember = data.students.find(
      (s: Student) => s.id === staffUsername
    );
    if (!staffMember) {
      setStaffError('ไม่พบรหัสนักเรียนนี้ในระบบ');
      return;
    }

    const isAllowed = data.controllers.includes(staffMember.id) || (data.moderators || []).includes(staffMember.id);

    if (!isAllowed) {
      setStaffError('รหัสนักเรียนนี้ไม่มีสิทธิ์เข้าถึงส่วนผู้ควบคุม/ผู้ดูแล');
      return;
    }

    try {
      const response = await fetch('/api/auth/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: staffUsername,
          password: staffPassword,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setCurrentUserId(staffMember.id);
        setCurrentTab('admin');
      } else {
        setStaffError(result.message || 'รหัสผ่าน Staff ไม่ถูกต้อง');
      }
    } catch (err) {
      console.error(err);
      setStaffError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อตรวจสอบรหัสผ่านได้');
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setLoginNumber('');
    setLoginStudentId('');
    setStaffUsername('');
    setStaffPassword('');
    setLoginError('');
    setStaffError('');
  };

  const applyDuty = (duty: Duty) => {
    if (!currentUser) return;
    const currentDuties = currentUser.duties || {};
    if (currentDuties[duty]) {
      alert('คุณได้ยื่นขอหรือได้รับอนุมัติหน้าที่นี้ไปแล้ว');
      return;
    }
    const nextStatus = duty === 'stand' ? 'approved' : 'pending_selection';
    updateStudent(currentUser.id, {
      duties: { ...currentDuties, [duty]: nextStatus }
    });
  };

  const cancelOwnDuty = (duty: Duty) => {
    if (!currentUser) return;
    if (duty === 'stand' && data.standLocked) {
      alert('ระบบล็อกการลงสแตนเชียร์แล้ว ไม่สามารถยกเลิกหน้าที่ได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
      return;
    }
    if (confirm(`ต้องการยกเลิกหน้าที่ "${dutyLabel(duty)}" ใช่หรือไม่?`)) {
      updateStudent(currentUser.id, {
        duties: { ...(currentUser.duties || {}), [duty]: 'none' },
        seat: duty === 'stand' ? undefined : currentUser.seat
      });
    }
  };

  const handleSeatClick = (row: string, colNum: number) => {
    if (!currentUser) return;
    if (isModerator) return; // ผู้ดูแลระบบสแตนดูอย่างเดียว ห้ามแก้ไข
    const seatLabel = `${row}${colNum}`;
    const owner = getSeatOwner(seatLabel);

    if (isSuperController || (!!currentUser && currentUser.role === 'admin_president')) {
      setSelectedSeatForAssign(seatLabel);
      setAssignSearchQuery('');
      return;
    }

    if (currentUser.assigned_duty !== 'stand') return;
    if (owner) {
      if (owner.id === currentUser.id) {
        if (data.standLocked) {
          alert('ระบบล็อกการจองสแตนเชียร์แล้ว ไม่สามารถยกเลิกการจองได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
          return;
        }
        if (confirm('ต้องการยกเลิกการจองที่นั่งของคุณใช่หรือไม่?')) {
          releaseSeat(seatLabel, currentUser || undefined);
        }
      } else {
        alert(`ที่นั่งนี้ถูกจองแล้วโดย ${owner.fullname} (${owner.classroom})`);
      }
      return;
    }

    if (data.standLocked) {
      alert('ระบบล็อกการจองสแตนเชียร์แล้ว ไม่สามารถจองที่นั่งเพิ่มได้ หากต้องการเปลี่ยนกรุณาติดต่อผู้ควบคุม');
      return;
    }

    if (confirm(`คุณต้องการจองที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
      bookSeat(currentUser.id, seatLabel, currentUser || undefined);
    }
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || !newAnnouncementTitle.trim()) return;
    const announcement: Announcement = {
      id: `a_${Date.now()}`,
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      image: newAnnouncementImage || undefined,
      date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      createdBy: currentUser.fullname,
    };
    saveAnnouncements([announcement, ...data.announcements], currentUser, 'เพิ่มประกาศ', announcement.title);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    setNewAnnouncementImage('');
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!currentUser || !isController) return;
    const targetAnn = data.announcements.find((a: Announcement) => a.id === announcementId);
    if (!targetAnn) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประกาศ "${targetAnn.title}"?`)) {
      const nextAnnouncements = data.announcements.filter((a: Announcement) => a.id !== announcementId);
      saveAnnouncements(nextAnnouncements, currentUser, 'ลบประกาศ', targetAnn.title);
    }
  };

  const handleColorHouseSubmit = async (photos: string[], taggedIds: string[]) => {
    if (!currentUser) return;
    
    const weekKey = getISOWeekKey(new Date());
    const taggedNames = taggedIds.map(id => {
      if (id === currentUser.id) return currentUser.fullname;
      const found = data.students.find(s => s.id === id);
      return found ? found.fullname : `รหัส ${id}`;
    });

    const newCheckin: ColorHouseCheckin = {
      id: `ch_${Date.now()}`,
      submitterId: currentUser.id,
      submitterName: currentUser.fullname,
      date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      weekKey: weekKey,
      photos: photos,
      taggedStudentIds: taggedIds,
      taggedStudentNames: taggedNames,
      status: 'pending'
    };

    const nextCheckins = [newCheckin, ...(data.colorHouseCheckins || [])];
    saveColorHouseCheckins(nextCheckins, currentUser, 'ส่งรายงานตัวเข้าบ้านสี', `จำนวนแท็ก ${taggedIds.length} คน`);
  };

  const handleColorHouseApprove = async (id: string, note?: string) => {
    if (!currentUser || (!isController && !isModerator)) return;
    
    const target = (data.colorHouseCheckins || []).find(c => c.id === id);
    if (!target) return;

    const nextCheckins = (data.colorHouseCheckins || []).map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'approved' as const,
          approvedBy: currentUser.fullname,
          approvedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
          note: note || undefined
        };
      }
      return c;
    });

    saveColorHouseCheckins(nextCheckins, currentUser, 'อนุมัติการเช็คชื่อเข้าบ้านสี', `ผู้ส่ง ${target.submitterName}`);
  };

  const handleColorHouseReject = async (id: string, note?: string) => {
    if (!currentUser || (!isController && !isModerator)) return;
    
    const target = (data.colorHouseCheckins || []).find(c => c.id === id);
    if (!target) return;

    const nextCheckins = (data.colorHouseCheckins || []).map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'rejected' as const,
          approvedBy: currentUser.fullname,
          approvedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
          note: note || undefined
        };
      }
      return c;
    });

    saveColorHouseCheckins(nextCheckins, currentUser, 'ปฏิเสธการเช็คชื่อเข้าบ้านสี', `ผู้ส่ง ${target.submitterName} (เหตุผล: ${note || '-'})`);
  };

  // Special duties, athlete QR, and procession configs are now managed within AdminTab component


  const handleExportLogsToCSV = () => {
    const backendLogs = data.logs.filter(log => log.actorRole !== 'สมาชิก');
    if (backendLogs.length === 0) {
      alert('ไม่มีประวัติการบันทึกกิจกรรมให้ส่งออกครับ');
      return;
    }
    
    const headers = ['วันที่-เวลา', 'บทบาท', 'ผู้บันทึก', 'กิจกรรม', 'เป้าหมายที่ถูกจัดการ'];
    const rows = backendLogs.map(log => {
      const formattedDate = new Date(log.timestamp).toLocaleString('th-TH');
      return [
        formattedDate,
        log.actorRole || '',
        log.actorName || '',
        log.action || '',
        log.targetName || ''
      ];
    });
    
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pink69_activity_logs_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const newReport: SystemReport = {
      id: 'rep_' + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.fullname,
      classroom: currentUser.classroom,
      number: currentUser.number,
      subject: reportSubject,
      description: reportDescription.trim(),
      status: 'pending',
      timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
    };
    const nextReports = [newReport, ...data.reports];
    saveSystemReports(nextReports);
    setReportDescription('');
    alert('ส่งรายงานปัญหาเรียบร้อยแล้ว สตาฟ/ผู้ดูแลจะรีบดำเนินการตรวจสอบให้ครับ');
  };

  const handleSubmitGuestReport = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = guestReportName.trim();
    const cleanId = guestReportStudentId.trim();
    if (!cleanName) {
      alert('กรุณากรอกชื่อ-นามสกุลจริงเพื่อให้ผู้ควบคุมค้นหาตัวท่านและแก้ไขได้ครับ');
      return;
    }
    const newReport: SystemReport = {
      id: 'rep_' + Date.now(),
      studentId: cleanId || 'GUEST',
      studentName: cleanName,
      classroom: guestReportClassroom,
      number: guestReportNumber.trim(),
      subject: guestReportSubject,
      description: guestReportDescription.trim(),
      status: 'pending',
      timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
    };
    const nextReports = [newReport, ...data.reports];
    saveSystemReports(nextReports);

    // reset inputs
    setGuestReportName('');
    setGuestReportNumber('');
    setGuestReportStudentId('');
    setGuestReportDescription('');
    setGuestReportSubject('login_issue');
    setShowGuestReportModal(false);
    
    alert('ส่งรายงานปัญหาเข้าระบบไม่ได้/ข้อมูลผิดพลาดเรียบร้อยแล้ว สตาฟ/ผู้ควบคุมจะทำการตรวจสอบและอัปเดตข้อมูลของท่านในระบบให้ครับ');
  };

  const handleUploadAthletePhoto = async (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToDataUrl(file);
      setCropSrc(base64);
      setCropStudentId(studentId);
      setCropZoom(1);
      setCropX(0);
      setCropY(0);
    } catch (err) {
      console.error('Failed to load athlete photo:', err);
      alert('เกิดข้อผิดพลาดในการโหลดรูปภาพครับ');
    }
  };

  const handleConfirmCrop = () => {
    if (!cropSrc || !cropStudentId) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // The preview container is 240x320. Canvas is 300x400. Ratio = 1.25.
      const ratio = 1.25;

      ctx.save();
      // Move origin to center of canvas
      ctx.translate(150, 200);
      // Apply translation from preview (multiplied by ratio)
      ctx.translate(cropX * ratio, cropY * ratio);
      // Apply scaling (cropZoom)
      ctx.scale(cropZoom, cropZoom);

      // Draw image centered so it covers the viewport initially
      const imgRatio = img.width / img.height;
      const targetRatio = 300 / 400;

      let drawW, drawH;
      if (imgRatio > targetRatio) {
        drawH = 400;
        drawW = 400 * imgRatio;
      } else {
        drawW = 300;
        drawH = 300 / imgRatio;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      try {
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        updateStudent(cropStudentId, { avatar: croppedBase64 }, currentUser || undefined, 'อัปโหลดและครอบตัดรูปภาพนักกีฬา');
      } catch (err) {
        console.error('Failed to export crop:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพที่ครอปครับ');
      }

      // Close modal and clean up
      setCropSrc(null);
      setCropStudentId(null);
    };
    img.src = cropSrc;
  };

  const handleCropStart = (clientX: number, clientY: number) => {
    setIsDraggingCrop(true);
    setDragStart({ x: clientX - cropX, y: clientY - cropY });
  };

  const handleCropMove = (clientX: number, clientY: number) => {
    if (!isDraggingCrop) return;
    setCropX(clientX - dragStart.x);
    setCropY(clientY - dragStart.y);
  };

  const handleCropEnd = () => {
    setIsDraggingCrop(false);
  };

  const handleResolveReport = (reportId: string) => {
    if (!currentUser || !isController) return;
    const nextReports = data.reports.map((r: SystemReport) => {
      if (r.id === reportId) {
        return { ...r, status: 'resolved' as const };
      }
      return r;
    });
    saveSystemReports(nextReports);
  };

  const handleDeleteReport = (reportId: string) => {
    if (!currentUser || !isController) return;
    if (!confirm('คุณแน่ใจว่าต้องการลบคำร้องรายงานปัญหานี้หรือไม่?')) return;
    const nextReports = data.reports.filter((r: SystemReport) => r.id !== reportId);
    saveSystemReports(nextReports);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        lightTheme={lightTheme}
        setLightTheme={setLightTheme}
        loginTab={loginTab}
        setLoginTab={setLoginTab}
        loginClassroom={loginClassroom}
        setLoginClassroom={setLoginClassroom}
        loginNumber={loginNumber}
        setLoginNumber={setLoginNumber}
        loginStudentId={loginStudentId}
        setLoginStudentId={setLoginStudentId}
        detectedStudent={detectedStudent || null}
        loginError={loginError}
        staffUsername={staffUsername}
        setStaffUsername={setStaffUsername}
        staffPassword={staffPassword}
        setStaffPassword={setStaffPassword}
        staffError={staffError}
        handleMemberLogin={handleMemberLogin}
        handleStaffLogin={handleStaffLogin}
        classrooms={classrooms}
        mounted={mounted}
        showGuestReportModal={showGuestReportModal}
        setShowGuestReportModal={setShowGuestReportModal}
        guestReportName={guestReportName}
        setGuestReportName={setGuestReportName}
        guestReportClassroom={guestReportClassroom}
        setGuestReportClassroom={setGuestReportClassroom}
        guestReportNumber={guestReportNumber}
        setGuestReportNumber={setGuestReportNumber}
        guestReportStudentId={guestReportStudentId}
        setGuestReportStudentId={setGuestReportStudentId}
        guestReportSubject={guestReportSubject}
        setGuestReportSubject={setGuestReportSubject}
        guestReportDescription={guestReportDescription}
        setGuestReportDescription={setGuestReportDescription}
        handleSubmitGuestReport={handleSubmitGuestReport}
      />
    );
  }

  // บังคับกรอกช่องทางติดต่อสำหรับสมาชิกทั่วไปที่ยังไม่มีข้อมูลติดต่อ
  const needsContact = !isController && (!currentUser.contact || currentUser.contact.trim() === '');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue.trim()) {
      setContactError('กรุณากรอกข้อมูลช่องทางการติดต่อ');
      return;
    }
    const formattedContact = `${contactType}: ${contactValue.trim()}`;
    updateStudentContact(currentUser.id, formattedContact);
    
    // อัปเดตข้อมูล State ในหน้าจอทันทีเพื่อปิดป๊อปอัพ
    setData(getStoredData());
    setContactValue('');
    setContactError('');
  };

  if (needsContact) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-carbon-dark">
        <div className="w-full max-w-[460px] glass-panel rounded-[32px] p-8 shadow-2xl shadow-pink-primary/10 relative overflow-hidden border border-pink-primary/15 text-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-primary via-pink-accent to-pink-primary" />
          
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-primary/15 to-pink-accent/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-primary/30 shadow-md shadow-pink-primary/10">
            <Award size={36} className="text-pink-primary drop-shadow-[0_2px_8px_rgba(255,46,147,0.4)]" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">ยินดีต้อนรับสู่คณะสีชมพู</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            กรุณาระบุช่องทางการติดต่อ เพื่อความสะดวกสำหรับพี่สตาฟและผู้ควบคุมในการประสานงานดูแล
          </p>

          <form onSubmit={handleSaveContact} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                เลือกประเภทช่องทางติดต่อ
              </label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as 'Line' | 'IG')}
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer"
              >
                <option value="Line">Line ID</option>
                <option value="IG">Instagram (IG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                ป้อนไอดีของคุณ
              </label>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactType === 'Line' ? 'ตัวอย่าง: line_username' : 'ตัวอย่าง: ig_username'}
                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                required
              />
            </div>

            {contactError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl text-center">
                {contactError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-primary to-pink-accent hover:from-pink-accent hover:to-pink-primary text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-pink-primary/20 hover:shadow-pink-primary/35 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              บันทึกข้อมูลและเข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-carbon-dark text-text-primary">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        isController={isController}
        lightTheme={lightTheme}
        setCurrentTab={setCurrentTab}
        setLightTheme={setLightTheme}
        handleLogout={handleLogout}
        isSupabaseConnected={getSupabaseConnectionStatus()}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {currentTab === 'dashboard' && (
          <ErrorBoundary>
            <DashboardTab
              data={data}
              currentUser={currentUser}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'announcements' && (
          <ErrorBoundary>
            <AnnouncementsTab
              data={data}
              isController={isController}
              newAnnouncementTitle={newAnnouncementTitle}
              setNewAnnouncementTitle={setNewAnnouncementTitle}
              newAnnouncementContent={newAnnouncementContent}
              setNewAnnouncementContent={setNewAnnouncementContent}
              newAnnouncementImage={newAnnouncementImage}
              setNewAnnouncementImage={setNewAnnouncementImage}
              addAnnouncement={addAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'registry' && isController && (
          <ErrorBoundary>
            <RegistryTab
              data={data}
              currentUser={currentUser}
              isController={isController}
              isModerator={isModerator}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'choreo' && (
          <ErrorBoundary>
            <CardStuntTab
              data={data}
              currentUser={currentUser!}
              isController={isController}
              isSuperController={isSuperController}
              lightTheme={lightTheme}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'colorhouse' && (
          <ErrorBoundary>
            <ColorHouseTab
              data={data}
              currentUser={currentUser!}
              isController={isController}
              isModerator={isModerator}
              onSubmitCheckin={handleColorHouseSubmit}
              onApproveCheckin={handleColorHouseApprove}
              onRejectCheckin={handleColorHouseReject}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'athlete_events' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">🏆 รายการแข่งของฉัน</h2>
              <p className="text-sm text-text-secondary">ตารางรายการแข่งขันกีฬาของคุณและข้อมูลเพื่อนร่วมทีมในรายการเดียวกัน</p>
            </div>

            {(() => {
              const userIdToFilter = currentUser?.id || '';
              const myEvents = data.sports.filter((event: SportsEvent) => 
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
                      คุณยังไม่ได้ถูกจัดรายชื่อลงในรายการแข่งขันกีฬาใดๆ ในขณะนี้ หากมีข้อสงสัย กรุณาติดต่อผู้ควบคุมระบบหรือหัวหน้างานฝ่ายสตาฟกีฬา
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
                            <h3 className="text-lg sm:text-xl font-bold text-text-primary mt-2">
                              {event.name}
                            </h3>
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
                              const shortName = nicknameMatch ? nicknameMatch[1] : athlete.fullname.split(' ')[0];

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
                                        <span className="text-[8px] mt-1 text-center font-medium opacity-60">ไม่มีรูป</span>
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
            })()}
          </section>
        )}

        {currentTab === 'admin' && isController && (
          <ErrorBoundary>
            <AdminTab
              data={data}
              currentUser={currentUser}
              isController={isController}
              isSuperController={isSuperController}
              saveSystemConfig={saveSystemConfig}
              getSeatOwner={getSeatOwner}
              handleSeatClick={handleSeatClick}
              addSportsEvent={addSportsEvent}
              removeSportsEvent={removeSportsEvent}
              removeAthleteFromEvent={removeAthleteFromEvent}
              assignAthleteToEvent={assignAthleteToEvent}
              handleExportLogsToCSV={handleExportLogsToCSV}
              handleUploadAthletePhoto={handleUploadAthletePhoto}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'reports' && (
          <ErrorBoundary>
            <ReportsTab
              data={data}
              currentUser={currentUser}
              isController={isController}
              reportSubject={reportSubject}
              setReportSubject={setReportSubject}
              reportDescription={reportDescription}
              setReportDescription={setReportDescription}
              reportFilter={reportFilter}
              setReportFilter={setReportFilter}
              handleSubmitReport={handleSubmitReport}
              handleResolveReport={handleResolveReport}
              handleDeleteReport={handleDeleteReport}
            />
          </ErrorBoundary>
        )}

        {cropSrc && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative font-semibold text-white">
              <button 
                onClick={() => {
                  setCropSrc(null);
                  setCropStudentId(null);
                }} 
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">ครอบตัดรูปภาพนักกีฬา</h3>
              <p className="text-xs text-text-secondary mb-4">คลิกลากที่รูปภาพเพื่อเลื่อนตำแหน่ง และใช้แถบซูมด้านล่างเพื่อปรับขนาด</p>
              
              <div className="flex flex-col items-center gap-4">
                {/* Crop container with 3:4 aspect ratio */}
                <div 
                  className="w-[240px] h-[320px] bg-black border border-pink-primary/30 relative overflow-hidden rounded-2xl shadow-lg shadow-pink-primary/10 select-none cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleCropStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleCropMove(e.clientX, e.clientY)}
                  onMouseUp={handleCropEnd}
                  onMouseLeave={handleCropEnd}
                  onTouchStart={(e) => handleCropStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleCropMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleCropEnd}
                >
                  <img 
                    src={cropSrc} 
                    alt="Preview crop" 
                    draggable={false}
                    className="absolute max-w-none origin-center pointer-events-none"
                    style={{
                      transform: `translate(${cropX}px, ${cropY}px) scale(${cropZoom})`,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Grid Lines for reference */}
                  <div className="absolute inset-0 border border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-white/10" />
                    <div className="border-r border-white/10" />
                    <div />
                  </div>
                </div>

                {/* Zoom Control */}
                <div className="w-full space-y-1.5">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>ซูมรูปภาพ (Zoom)</span>
                    <span className="font-bold text-pink-primary">{Math.round(cropZoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="0.05" 
                    value={cropZoom} 
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-carbon-dark rounded-lg appearance-none cursor-pointer accent-pink-primary"
                  />
                </div>

                <div className="flex w-full gap-3 mt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setCropSrc(null);
                      setCropStudentId(null);
                    }} 
                    className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmCrop}
                    className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                  >
                    ยืนยันการครอป
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSeatForAssign && (() => {
          const seatLabel = selectedSeatForAssign;
          const owner = getSeatOwner(seatLabel);
          
          const filteredStudentsForAssign = data.students.filter((student: Student) => {
            if (student.seat === seatLabel) return false;
            
            const q = assignSearchQuery.trim().toLowerCase();
            if (!q) {
              return student.assigned_duty === 'stand' && !student.seat;
            }
            return (
              student.fullname.toLowerCase().includes(q) ||
              student.id.includes(q) ||
              student.classroom.toLowerCase().includes(q)
            );
          });

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-lg bg-carbon-card border border-pink-primary/25 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] font-semibold text-white">
                <button 
                  onClick={() => {
                    setSelectedSeatForAssign(null);
                    setAssignSearchQuery('');
                  }} 
                  className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                  type="button"
                >
                  <X size={20} />
                </button>
                
                <div className="mb-4 font-sans">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📍 จัดการที่นั่ง {seatLabel}</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">ค้นหาและเลือกสมาชิกใส่ที่นั่งนี้โดยตรง</p>
                </div>

                {/* Current Occupant Details */}
                <div className="bg-carbon-dark/60 border border-pink-primary/10 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 font-sans">
                  <div>
                    <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">ผู้ครอบครองปัจจุบัน</span>
                    {owner ? (
                      <div className="mt-1">
                        <span className="font-bold text-white">{owner.fullname}</span>
                        <span className="text-xs text-text-secondary ml-2">({owner.classroom} เลขที่ {owner.number})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-tertiary mt-1 block">ว่าง (ยังไม่มีใครจอง)</span>
                    )}
                  </div>
                  {owner && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`ต้องการปลด ${owner.fullname} ออกจากที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
                          releaseSeat(seatLabel, currentUser || undefined);
                          setSelectedSeatForAssign(null);
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      ❌ ปลดที่นั่ง
                    </button>
                  )}
                </div>

                {/* Search Member input */}
                <div className="space-y-2 mb-3 font-sans">
                  <label className="text-xs text-text-secondary block font-semibold">ค้นหาสมาชิก</label>
                  <input
                    type="text"
                    value={assignSearchQuery}
                    onChange={(e) => setAssignSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อสมาชิก, รหัสประจำตัว, หรือห้องเรียน..."
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-primary text-white"
                  />
                </div>

                {/* Students List */}
                <div className="flex-1 overflow-y-auto space-y-2 min-h-[150px] max-h-[35vh] pr-1 scrollbar-thin font-sans">
                  <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider mb-1">
                    {assignSearchQuery ? 'ผลลัพธ์การค้นหา' : 'แนะนำ (สมาชิกสแตนเชียร์ที่ยังไม่มีที่นั่ง)'}
                  </span>
                  
                  {filteredStudentsForAssign.length > 0 ? (
                    filteredStudentsForAssign.map((student: Student, idx: number) => {
                      const displayDuty = student.assigned_duty !== 'none'
                        ? student.assigned_duty === 'stand' ? '📣 สแตนเชียร์'
                          : student.assigned_duty === 'athlete' ? '🏃 นักกีฬา'
                          : student.assigned_duty === 'cheerleader' ? '💃 เชียร์ลีดเดอร์'
                          : student.assigned_duty === 'staff' ? '👔 สตาฟ'
                          : `🛠️ ${student.assigned_duty}`
                        : '❌ ไม่มีหน้าที่';
                      
                      return (
                        <div 
                          key={`${student.id}_${idx}`} 
                          className="bg-carbon-dark/40 hover:bg-pink-primary/5 border border-pink-primary/5 rounded-xl p-3 flex items-center justify-between gap-3 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white text-xs sm:text-sm">{student.fullname}</span>
                              <span className="text-[10px] text-text-secondary">({student.classroom} เลขประจำตัว {student.id})</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px]">
                              <span className="text-text-secondary">หน้าที่: <span className="text-white font-medium">{displayDuty}</span></span>
                              {student.seat && (
                                <span className="text-yellow-500">จองอยู่: <span className="font-bold">{student.seat}</span></span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (student.seat) {
                                  if (confirm(`ต้องการย้าย ${student.fullname} จากที่นั่ง ${student.seat} มายังที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
                                    releaseSeat(student.seat, currentUser || undefined);
                                    bookSeat(student.id, seatLabel, currentUser || undefined);
                                    setSelectedSeatForAssign(null);
                                  }
                              } else if (student.assigned_duty !== 'stand') {
                                if (confirm(`${student.fullname} ปัจจุบันมีหน้าที่เป็น "${displayDuty}". ต้องการเปลี่ยนเป็น "สแตนเชียร์" และจองที่นั่ง ${seatLabel} ใช่หรือไม่?`)) {
                                  bookSeat(student.id, seatLabel, currentUser || undefined);
                                  setSelectedSeatForAssign(null);
                                }
                              } else {
                                bookSeat(student.id, seatLabel, currentUser || undefined);
                                setSelectedSeatForAssign(null);
                              }
                            }}
                            className="bg-pink-primary hover:bg-pink-accent text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                          >
                            📌 ใส่ที่นั่งนี้
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-text-tertiary">
                      {assignSearchQuery ? 'ไม่พบสมาชิกที่ตรงกับเงื่อนไข' : 'ไม่มีสมาชิกสแตนเชียร์ที่ยังไม่มีที่นั่ง'}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-pink-primary/5 mt-4 font-sans">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedSeatForAssign(null);
                      setAssignSearchQuery('');
                    }} 
                    className="w-full bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* editingSpecialDuty modal is now handled locally in AdminTab component */}
      </div>



    </main>
  );
}

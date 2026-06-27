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
  saveStoredData,
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
import { Panel, StatCard, MiniCount, DutyCard } from '../components/ui';
import { EditSegmentsModal } from '../components/modals/EditSegmentsModal';
import { SeatGrid } from '../components/ui/SeatGrid';
import { Navbar } from '../components/layout/Navbar';
import { LoginScreen } from '../components/layout/LoginScreen';
import { AnnouncementsTab } from '../components/tabs/AnnouncementsTab';
import { ReportsTab } from '../components/tabs/ReportsTab';
import { AthleteTab } from '../components/tabs/AthleteTab';
import { RegistryTab } from '../components/tabs/RegistryTab';
import { AdminTab } from '../components/tabs/AdminTab';
import { DashboardTab } from '../components/tabs/DashboardTab';
import { CardStuntTab } from '../components/tabs/CardStuntTab';

// classroomSortKey, createId, fileToDataUrl — now imported from lib/helpers



// segmentThaiGraphemes — imported from lib/helpers


// Helper: get full text of a segment (all words joined)
// getSegmentText — imported from lib/helpers


// Helper: get only tagged words (for card stunt / แปรอักษร)
// getSegmentTaggedWords — imported from lib/helpers


// Helper: build flat list of (segmentIndex, wordText) for tagged words across all segments
// This is the "sub-segment" list used in karaoke/playback
// SubSegment, buildSubSegments — imported from lib/helpers




// segmentThaiWords — imported from lib/helpers


// getWordBoundaries — imported from lib/helpers


// ArmPose, ArmPoseEquipment — imported from ./types


// isArmPoseString — imported from lib/helpers


// parseArmPose — imported from lib/helpers

// serializeArmPose — imported from lib/helpers


// getEquipmentDisplayName — imported from lib/helpers


// getEquipmentColor — imported from lib/helpers


const ArmPoseMiniSVG: React.FC<{ pose: ArmPoseEquipment; className?: string }> = ({ pose, className }) => {
  const { 
    leftArm, 
    rightArm, 
    color,
    armThickness = 8,
    armLength = 50,
    centerX = 50,
    centerY = 45,
    shoulderDistance = 10
  } = pose;

  const L1 = armLength * 0.45; // Upper arm length
  const L2 = armLength * 0.38; // Forearm length
  const L3 = armLength * 0.17; // Hand length

  const leftShoulder = { x: centerX - (shoulderDistance / 2), y: centerY };
  const rightShoulder = { x: centerX + (shoulderDistance / 2), y: centerY };

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Left Arm calculations (outward/upward is counter-clockwise/positive)
  const A_left = degToRad(leftArm.upperArmAngle);
  const leftElbow = {
    x: leftShoulder.x - L1 * Math.sin(A_left),
    y: leftShoulder.y + L1 * Math.cos(A_left)
  };

  const A_left_fore = A_left + degToRad(leftArm.forearmAngle);
  const leftWrist = {
    x: leftElbow.x - L2 * Math.sin(A_left_fore),
    y: leftElbow.y + L2 * Math.cos(A_left_fore)
  };

  const A_left_hand = A_left_fore + degToRad(leftArm.handAngle);
  const leftFingerTip = {
    x: leftWrist.x - L3 * Math.sin(A_left_hand),
    y: leftWrist.y + L3 * Math.cos(A_left_hand)
  };

  // Right Arm calculations (outward/upward is clockwise/positive)
  const A_right = degToRad(rightArm.upperArmAngle);
  const rightElbow = {
    x: rightShoulder.x + L1 * Math.sin(A_right),
    y: rightShoulder.y + L1 * Math.cos(A_right)
  };

  const A_right_fore = A_right + degToRad(rightArm.forearmAngle);
  const rightWrist = {
    x: rightElbow.x + L2 * Math.sin(A_right_fore),
    y: rightElbow.y + L2 * Math.cos(A_right_fore)
  };

  const A_right_hand = A_right_fore + degToRad(rightArm.handAngle);
  const rightFingerTip = {
    x: rightWrist.x + L3 * Math.sin(A_right_hand),
    y: rightWrist.y + L3 * Math.cos(A_right_hand)
  };

  const strokeColor = armThickness;
  const strokeOutline = armThickness + 6;
  const gloveColor = Math.max(2, armThickness - 1);
  const gloveOutline = gloveColor + 5;

  return (
    <svg viewBox="0 0 100 100" className={className || "w-full h-full"} style={{ overflow: 'visible' }}>
      {/* Left Upper Arm Outline */}
      <line
        x1={leftShoulder.x}
        y1={leftShoulder.y}
        x2={leftElbow.x}
        y2={leftElbow.y}
        stroke="#000000"
        strokeWidth={strokeOutline}
        strokeLinecap="round"
      />
      {/* Left Upper Arm Color */}
      <line
        x1={leftShoulder.x}
        y1={leftShoulder.y}
        x2={leftElbow.x}
        y2={leftElbow.y}
        stroke={color}
        strokeWidth={strokeColor}
        strokeLinecap="round"
      />

      {/* Left Forearm Outline */}
      <line
        x1={leftElbow.x}
        y1={leftElbow.y}
        x2={leftWrist.x}
        y2={leftWrist.y}
        stroke="#000000"
        strokeWidth={strokeOutline}
        strokeLinecap="round"
      />
      {/* Left Forearm Color */}
      <line
        x1={leftElbow.x}
        y1={leftElbow.y}
        x2={leftWrist.x}
        y2={leftWrist.y}
        stroke={color}
        strokeWidth={strokeColor}
        strokeLinecap="round"
      />

      {/* Left Hand Glove Outline */}
      <line
        x1={leftWrist.x}
        y1={leftWrist.y}
        x2={leftFingerTip.x}
        y2={leftFingerTip.y}
        stroke="#000000"
        strokeWidth={gloveOutline}
        strokeLinecap="round"
      />
      {/* Left Hand (Glove) */}
      <line
        x1={leftWrist.x}
        y1={leftWrist.y}
        x2={leftFingerTip.x}
        y2={leftFingerTip.y}
        stroke={color}
        strokeWidth={gloveColor}
        strokeLinecap="round"
      />

      {/* Right Upper Arm Outline */}
      <line
        x1={rightShoulder.x}
        y1={rightShoulder.y}
        x2={rightElbow.x}
        y2={rightElbow.y}
        stroke="#000000"
        strokeWidth={strokeOutline}
        strokeLinecap="round"
      />
      {/* Right Upper Arm Color */}
      <line
        x1={rightShoulder.x}
        y1={rightShoulder.y}
        x2={rightElbow.x}
        y2={rightElbow.y}
        stroke={color}
        strokeWidth={strokeColor}
        strokeLinecap="round"
      />

      {/* Right Forearm Outline */}
      <line
        x1={rightElbow.x}
        y1={rightElbow.y}
        x2={rightWrist.x}
        y2={rightWrist.y}
        stroke="#000000"
        strokeWidth={strokeOutline}
        strokeLinecap="round"
      />
      {/* Right Forearm Color */}
      <line
        x1={rightElbow.x}
        y1={rightElbow.y}
        x2={rightWrist.x}
        y2={rightWrist.y}
        stroke={color}
        strokeWidth={strokeColor}
        strokeLinecap="round"
      />

      {/* Right Hand Glove Outline */}
      <line
        x1={rightWrist.x}
        y1={rightWrist.y}
        x2={rightFingerTip.x}
        y2={rightFingerTip.y}
        stroke="#000000"
        strokeWidth={gloveOutline}
        strokeLinecap="round"
      />
      {/* Right Hand (Glove) */}
      <line
        x1={rightWrist.x}
        y1={rightWrist.y}
        x2={rightFingerTip.x}
        y2={rightFingerTip.y}
        stroke={color}
        strokeWidth={gloveColor}
        strokeLinecap="round"
      />
    </svg>
  );
};

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

  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryDuty, setRegistryDuty] = useState('all');
  const [registryClassroom, setRegistryClassroom] = useState('all');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [newAnnouncementImage, setNewAnnouncementImage] = useState('');
  // Admin/Controller inputs and modal states are now handled inside AdminTab component
  const [registryTab, setRegistryTab] = useState<'all_members' | 'requests'>('all_members');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<'all' | 'stand' | 'athlete' | 'procession' | 'special' | 'no_duty'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCheckboxDragActive, setIsCheckboxDragActive] = useState<boolean>(false);
  const [checkboxDragMode, setCheckboxDragMode] = useState<'select' | 'deselect' | null>(null);
  // Controller roles management states are now handled inside AdminTab component
  const [adminSubTab, setAdminSubTab] = useState<'stand' | 'athlete' | 'procession' | 'special_duty' | 'logs' | 'roles'>('stand');
  
  
  // Import Members States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Export Members States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Add New Member States
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberRoom, setNewMemberRoom] = useState('');
  const [newMemberNum, setNewMemberNum] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberError, setNewMemberError] = useState('');
  const [lightTheme, setLightTheme] = useState<boolean>(true);
  // Seat assignment modal state (used by handleSeatClick and seat modal in page.tsx)
  const [selectedSeatForAssign, setSelectedSeatForAssign] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState<string>('');
  
  // Registry modals are now handled locally inside RegistryTab component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsCheckboxDragActive(false);
      setCheckboxDragMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  
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
    setSelectedStudentIds([]);
  }, [registrySearch, registryDuty, registryClassroom, registryTab, registryCategoryFilter, currentTab]);

  useEffect(() => {
    setMounted(true);
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

  const isSuperController = !!currentUser && (data.controllers.includes(currentUser.id) || currentUser.role === 'staff_m5');
  const isModerator = !!currentUser && ((data.moderators || []).includes(currentUser.id) || currentUser.role === 'moderator');
  const isController = isSuperController || isModerator || (!!currentUser && currentUser.role === 'admin_president');
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
    (s: Student) => s.classroom === loginClassroom && s.number === loginNumber
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

  const filteredRegistry = useMemo(() => {
    const query = registrySearch.trim().toLowerCase();
    return data.students.filter((student: Student) => {
      // 1. Text Search
      let matchesText = !query;
      if (query) {
        // ลองแยกคำค้นหาเผื่อพิมพ์ห้องกับเลขที่คู่กัน เช่น "5/15" หรือ "ม.5/8 3" หรือ "ม.5/8 เลขที่ 3"
        const tokens = query.split(/[\s/]+/); // แยกด้วยเว้นวรรค หรือ เครื่องหมาย /
        
        if (tokens.length >= 2) {
          // กรณีป้อนค้นหาสองเงื่อนไข เช่น "5" และ "15" (หมายถึงห้อง 5/x และ เลขที่ 15 หรือกลับกัน)
          // เช็กว่ามี token ตัวใดตัวหนึ่งตรงกับห้องเรียน และอีกตัวตรงกับเลขที่
          const hasClassroomMatch = tokens.some(tok => 
            student.classroom.toLowerCase().includes(tok) || 
            `ม.${tok}`.includes(student.classroom.toLowerCase())
          );
          const hasNumberMatch = tokens.some(tok => 
            student.number === tok || 
            `เลขที่${tok}`.includes(student.number)
          );
          
          if (hasClassroomMatch && hasNumberMatch) {
            matchesText = true;
          }
        }
        
        // ถ้าค้นหาแบบละเอียดด้านบนไม่เจอ ให้ค้นหาแบบข้อความปกติทั่วไป
        if (!matchesText) {
          // เช็กแบบครอบคลุม
          const searchString = `${student.fullname} ${student.id} ${student.classroom} เลขที่ ${student.number}`.toLowerCase();
          matchesText = searchString.includes(query) || 
                        student.classroom.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '')) ||
                        `${student.classroom}/${student.number}`.toLowerCase().includes(query) ||
                        `${student.classroom.replace('ม.', '')}/${student.number}`.toLowerCase().includes(query);
        }
      }

      // 2. Classroom Selector
      const matchesClassroom = registryClassroom === 'all' || student.classroom === registryClassroom;

      // 3. Tab: all members vs pending requests
      let matchesTab = true;
      if (registryTab === 'requests') {
        matchesTab = Object.values(student.duties || {}).some(status => status === 'pending_selection');
      }

      // 4. Category Filter (แยกตามหมวดหมู่หน้าที่)
      let matchesCategory = true;
      if (registryCategoryFilter === 'stand') {
        matchesCategory = student.duties?.['stand'] !== undefined;
      } else if (registryCategoryFilter === 'athlete') {
        matchesCategory = student.duties?.['athlete'] !== undefined;
      } else if (registryCategoryFilter === 'procession') {
        matchesCategory = student.duties?.['procession'] !== undefined;
      } else if (registryCategoryFilter === 'special') {
        const hasSpecial = Object.keys(student.duties || {}).some(k => k !== 'stand' && k !== 'athlete' && k !== 'procession');
        matchesCategory = hasSpecial;
      } else if (registryCategoryFilter === 'no_duty') {
        matchesCategory = !student.duties || !Object.values(student.duties).some(v => v === 'approved');
      }

      // 5. Normal Duty Selector (if applicable)
      // 'has_duty' = มีหน้าที่ที่ approved อย่างน้อย 1 หน้าที่
      let matchesDuty = true;
      if (registryDuty === 'has_duty') {
        matchesDuty = Object.values(student.duties || {}).some(s => s === 'approved');
      } else if (registryDuty === 'pending') {
        matchesDuty = Object.values(student.duties || {}).some(s => s === 'pending_selection');
      } else if (registryDuty === 'none') {
        matchesDuty = !student.duties || !Object.values(student.duties || {}).some(s => s === 'approved');
      } else if (registryDuty !== 'all') {
        matchesDuty = student.duties?.[registryDuty] !== undefined;
      }

      return matchesText && matchesClassroom && matchesTab && matchesCategory && matchesDuty;
    });
  }, [data.students, registryClassroom, registryDuty, registrySearch, registryTab, registryCategoryFilter]);

  const getSeatOwner = (seatLabel: string) => {
    return data.students.find((s: Student) => s.seat === seatLabel);
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const student = data.students.find(
      (s: Student) => s.classroom === loginClassroom && s.number === loginNumber && s.id === loginStudentId
    );
    if (!student) {
      setLoginError('ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบห้อง เลขที่ และรหัสประจำตัว');
      return;
    }
    setCurrentUserId(student.id);
    setCurrentTab('dashboard');
  };

  const handleStaffLogin = (e: React.FormEvent) => {
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

    if (isAllowed && staffPassword === '123') {
      setCurrentUserId(staffMember.id);
      setCurrentTab('admin');
      return;
    }

    setStaffError('รหัสนักเรียนนี้ไม่มีสิทธิ์เข้าถึงส่วนผู้ควบคุม/ผู้ดูแล หรือรหัสผ่านไม่ถูกต้อง');
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

  // Special duties, athlete QR, and procession configs are now managed within AdminTab component

  const handleImportData = () => {
    if (!currentUser || !isController) return;
    setImportError('');
    setImportSuccess('');

    const text = importText.trim();
    if (!text) {
      setImportError('กรุณากรอกหรือวางข้อมูลก่อนกดนำเข้าครับ!');
      return;
    }

    let parsedStudents: Student[] = [];

    // 1. ลอง Parse เป็น JSON
    if (text.startsWith('[') && text.endsWith(']')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsedStudents = parsed.map((item: any) => {
            if (!item.id || !item.fullname) {
              throw new Error('ข้อมูลนักเรียนต้องมีฟิลด์ รหัสประจำตัว (id) และชื่อ-นามสกุล (fullname)');
            }
            // อนุมานบทบาทหากไม่มี
            let role = item.role;
            if (!role && item.classroom) {
              const match = item.classroom.match(/ม\.(\d+)/);
              if (match) {
                const grade = Number(match[1]);
                role = grade <= 3 ? 'student_m13' : 'student_m46';
              } else {
                role = 'student_m13';
              }
            }

            // จัดโครงสร้างหน้าที่
            const assigned_duty = item.assigned_duty || 'none';
            const duty_status = item.duty_status || 'none';
            const duties = item.duties || {};
            if (assigned_duty !== 'none' && !duties[assigned_duty]) {
              duties[assigned_duty] = duty_status;
            }

            return {
              id: String(item.id),
              fullname: String(item.fullname),
              classroom: String(item.classroom || ''),
              number: String(item.number || ''),
              role: role || 'student_m13',
              assigned_duty,
              duty_status,
              duties,
              seat: item.seat || undefined,
              avatar: item.avatar || undefined,
            } as Student;
          });
        } else {
          setImportError('JSON ต้องเป็นอาร์เรย์ของข้อมูลสมาชิกเท่านั้น');
          return;
        }
      } catch (e: any) {
        setImportError(`การอ่านข้อมูล JSON ผิดพลาด: ${e.message}`);
        return;
      }
    } else {
      // 2. ลอง Parse เป็น CSV หรือ TSV (จากการก๊อปวางในชีต)
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) {
        setImportError('ไม่พบข้อมูลในระบบ');
        return;
      }

      // เช็คตัวแบ่งคั่น (Tab หรือ Comma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      const parsedRows = lines.map(line => {
        const cells: string[] = [];
        let inQuotes = false;
        let currentCell = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim());
        return cells.map(c => c.replace(/^["']|["']$/g, ''));
      });

      // ค้นหาคอลัมน์จากหัวข้อ
      let idIdx = -1;
      let nameIdx = -1;
      let classIdx = -1;
      let numIdx = -1;
      let dutyIdx = -1;
      let statusIdx = -1;
      let seatIdx = -1;
      let standIdx = -1;
      let athleteIdx = -1;
      let processionIdx = -1;
      let specialIdx = -1;

      const headers = parsedRows[0].map(h => h.toLowerCase().trim());
      
      const idKeys = ['id', 'รหัส', 'ประจำตัว', 'student_id'];
      const nameKeys = ['fullname', 'name', 'ชื่อ', 'นามสกุล', 'ชื่อ-นามสกุล'];
      const classKeys = ['class', 'ห้อง', 'เรียน', 'classroom'];
      const numKeys = ['num', 'เลขที่', 'number', 'class_number', 'seat_no'];
      const dutyKeys = ['duty', 'หน้าที่', 'assigned_duty'];
      const statusKeys = ['status', 'สถานะ', 'duty_status'];
      const seatKeys = ['seat', 'ที่นั่ง'];

      headers.forEach((h, idx) => {
        if (idKeys.some(k => h.includes(k))) idIdx = idx;
        else if (nameKeys.some(k => h.includes(k))) nameIdx = idx;
        else if (classKeys.some(k => h.includes(k))) classIdx = idx;
        else if (numKeys.some(k => h.includes(k))) numIdx = idx;
        else if (h.includes('สแตนด์เชียร์') || h.includes('สแตนด์')) standIdx = idx;
        else if (h.includes('นักกีฬา')) athleteIdx = idx;
        else if (h.includes('ขบวนพาเหรด') || h.includes('ขบวน')) processionIdx = idx;
        else if (h.includes('หน้าที่พิเศษ')) specialIdx = idx;
        else if (dutyKeys.some(k => h.includes(k))) dutyIdx = idx;
        else if (statusKeys.some(k => h.includes(k))) statusIdx = idx;
        else if (seatKeys.some(k => h.includes(k))) seatIdx = idx;
      });

      let hasHeader = idIdx !== -1 && nameIdx !== -1;

      if (!hasHeader) {
        idIdx = 0;
        nameIdx = 1;
        classIdx = 2;
        numIdx = 3;
        dutyIdx = 4;
        statusIdx = 5;
        seatIdx = 6;
      }

      const isNewExportFormat = standIdx !== -1 || athleteIdx !== -1 || processionIdx !== -1 || specialIdx !== -1;
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < parsedRows.length; i++) {
        const cells = parsedRows[i];
        if (cells.length < 2 || !cells[idIdx] || !cells[nameIdx]) continue;

        const studentId = String(cells[idIdx] || '').trim();
        const fullname = String(cells[nameIdx] || '').trim();
        const classroom = classIdx !== -1 && cells[classIdx] ? String(cells[classIdx]).trim() : '';
        const number = numIdx !== -1 && cells[numIdx] ? String(cells[numIdx]).trim() : '';
        const seat = seatIdx !== -1 && cells[seatIdx] ? String(cells[seatIdx]).trim() : '';

        if (!studentId || !fullname) continue;

        let role = 'student_m13';
        if (classroom) {
          const match = classroom.match(/ม\.(\d+)/);
          if (match) {
            const grade = Number(match[1]);
            role = grade <= 3 ? 'student_m13' : 'student_m46';
          }
        }

        const duties: Record<string, any> = {};
        let assigned_duty = 'none';
        let duty_status = 'none';

        if (isNewExportFormat) {
          // 1. อ่านสแตนด์เชียร์
          if (standIdx !== -1 && cells[standIdx]) {
            const statusVal = String(cells[standIdx]).trim();
            if (statusVal !== '-' && statusVal !== '') {
              const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
              duties['stand'] = status;
              assigned_duty = 'stand';
              duty_status = status;
            }
          }
          // 2. อ่านนักกีฬา
          if (athleteIdx !== -1 && cells[athleteIdx]) {
            const statusVal = String(cells[athleteIdx]).trim();
            if (statusVal !== '-' && statusVal !== '') {
              const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
              duties['athlete'] = status;
              assigned_duty = 'athlete';
              duty_status = status;
            }
          }
          // 3. อ่านขบวนพาเหรด
          if (processionIdx !== -1 && cells[processionIdx]) {
            const statusVal = String(cells[processionIdx]).trim();
            if (statusVal !== '-' && statusVal !== '') {
              const status = statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') ? 'approved' : 'pending_selection';
              duties['procession'] = status;
              assigned_duty = 'procession';
              duty_status = status;
            }
          }
          // 4. อ่านหน้าที่พิเศษ
          if (specialIdx !== -1 && cells[specialIdx]) {
            const specialVal = String(cells[specialIdx]).trim();
            if (specialVal !== '-' && specialVal !== '') {
              const parts = specialVal.split(',').map(p => p.trim()).filter(Boolean);
              parts.forEach(part => {
                const subParts = part.split(':').map(sp => sp.trim());
                if (subParts.length >= 1) {
                  const thDuty = subParts[0];
                  const rawStatus = subParts[1] || 'อนุมัติแล้ว';
                  
                  let engDuty = 'staff';
                  const thLower = thDuty.toLowerCase();
                  if (thLower.includes('หลีด') || thLower.includes('cheer')) engDuty = 'cheerleader';
                  else if (thLower.includes('ดรัม') || thLower.includes('drummer') || thLower.includes('major')) engDuty = 'drummer';
                  else if (thLower.includes('ดุริยางค์') || thLower.includes('band') || thLower.includes('วงโย')) engDuty = 'band';
                  else if (thLower.includes('กลอง') || thLower.includes('drum')) engDuty = 'drum';
                  else if (thLower.includes('ถือป้าย')) engDuty = 'drum';
                  else if (thLower.includes('สตาฟ') || thLower.includes('staff')) engDuty = 'staff';
                  
                  const status = rawStatus.includes('รอคัดเลือก') || rawStatus.includes('รออนุมัติ') ? 'pending_selection' : 'approved';
                  duties[engDuty] = status;
                  assigned_duty = engDuty;
                  duty_status = status;
                }
              });
            }
          }
        } else {
          // ใช้ fallback โครงสร้างแบบเดิม
          const rawDuty = dutyIdx !== -1 && cells[dutyIdx] ? String(cells[dutyIdx]).trim() : 'none';
          const rawStatus = statusIdx !== -1 && cells[statusIdx] ? String(cells[statusIdx]).trim() : 'none';

          const dutyLower = rawDuty.toLowerCase();
          if (dutyLower.includes('สแตน') || dutyLower.includes('stand')) assigned_duty = 'stand';
          else if (dutyLower.includes('หลีด') || dutyLower.includes('cheer')) assigned_duty = 'cheerleader';
          else if (dutyLower.includes('ดรัม') || dutyLower.includes('drummer') || dutyLower.includes('major')) assigned_duty = 'drummer';
          else if (dutyLower.includes('ดุริยางค์') || dutyLower.includes('band') || dutyLower.includes('ดนตรี')) assigned_duty = 'band';
          else if (dutyLower.includes('กลอง') || dutyLower.includes('drum')) assigned_duty = 'drum';
          else if (dutyLower.includes('นักกีฬา') || dutyLower.includes('athlete')) assigned_duty = 'athlete';
          else if (dutyLower.includes('staff') || dutyLower.includes('สตาฟ') || dutyLower.includes('ผู้ดูแล')) assigned_duty = 'staff';

          const statusLower = rawStatus.toLowerCase();
          if (statusLower.includes('อนุมัติ') || statusLower.includes('approve') || statusLower.includes('ใช่') || statusLower === 'y') duty_status = 'approved';
          else if (statusLower.includes('รอ') || statusLower.includes('pending')) duty_status = 'pending_selection';

          if (assigned_duty !== 'none' && duty_status === 'none') {
            duty_status = 'approved';
          }
          if (assigned_duty !== 'none') {
            duties[assigned_duty] = duty_status;
          }
        }

        parsedStudents.push({
          id: studentId,
          fullname,
          classroom,
          number,
          role,
          assigned_duty,
          duty_status,
          duties,
          seat: (seat !== '-' && seat !== '') ? seat : undefined,
        } as Student);
      }
    }

    if (parsedStudents.length === 0) {
      setImportError('ไม่พบข้อมูลนักเรียนที่ถูกต้อง กรุณาตรวจสอบฟอร์แมตข้อมูลอีกครั้งครับ');
      return;
    }

    importStudentsData(parsedStudents, importMode, currentUser);
    
    setData(getStoredData());
    setImportSuccess(`นำเข้าข้อมูลสมาชิกสำเร็จจำนวน ${parsedStudents.length} คน เรียบร้อยแล้ว!`);
    setImportText('');
    
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportSuccess('');
    }, 1500);
  };

  const handleExportLogsToCSV = () => {
    if (data.logs.length === 0) {
      alert('ไม่มีประวัติการบันทึกกิจกรรมให้ส่งออกครับ');
      return;
    }
    
    const headers = ['วันที่-เวลา', 'บทบาท', 'ผู้บันทึก', 'กิจกรรม', 'เป้าหมายที่ถูกจัดการ'];
    const rows = data.logs.map(log => {
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
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {currentTab === 'dashboard' && (
          <DashboardTab
            data={data}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'announcements' && (
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
          />
        )}

        {currentTab === 'registry' && isController && (
          <RegistryTab
            data={data}
            currentUser={currentUser}
            isController={isController}
            isModerator={isModerator}
            registryTab={registryTab}
            setRegistryTab={setRegistryTab}
            registryCategoryFilter={registryCategoryFilter}
            setRegistryCategoryFilter={setRegistryCategoryFilter}
            registrySearch={registrySearch}
            setRegistrySearch={setRegistrySearch}
            registryDuty={registryDuty}
            setRegistryDuty={setRegistryDuty}
            registryClassroom={registryClassroom}
            setRegistryClassroom={setRegistryClassroom}
            dutyOptions={dutyOptions}
            classrooms={classrooms}
            selectedStudentIds={selectedStudentIds}
            setSelectedStudentIds={setSelectedStudentIds}
            isCheckboxDragActive={isCheckboxDragActive}
            setIsCheckboxDragActive={setIsCheckboxDragActive}
            checkboxDragMode={checkboxDragMode}
            setCheckboxDragMode={setCheckboxDragMode}
            filteredRegistry={filteredRegistry}
            updateStudent={updateStudent}
            updateMultipleStudents={updateMultipleStudents}
            deleteStudent={deleteStudent}
            setIsAddMemberOpen={setIsAddMemberOpen}
            setIsExportModalOpen={setIsExportModalOpen}
            setIsImportModalOpen={setIsImportModalOpen}
            setNewMemberName={setNewMemberName}
            setNewMemberNickname={setNewMemberNickname}
            setNewMemberRoom={setNewMemberRoom}
            setNewMemberNum={setNewMemberNum}
            setNewMemberId={setNewMemberId}
            setNewMemberError={setNewMemberError}
            setImportError={setImportError}
            setImportSuccess={setImportSuccess}
            setImportText={setImportText}
          />
        )}

        {currentTab === 'choreo' && (
          <CardStuntTab
            data={data}
            currentUser={currentUser!}
            isController={isController}
            isSuperController={isSuperController}
            lightTheme={lightTheme}
          />
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
          <AdminTab
            data={data}
            currentUser={currentUser}
            isController={isController}
            isSuperController={isSuperController}
            adminSubTab={adminSubTab}
            setAdminSubTab={setAdminSubTab}
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
        )}

        {currentTab === 'reports' && (
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

      {/* Add New Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-carbon-card border border-green-500/20 rounded-3xl p-6 shadow-2xl relative font-sans text-text-primary">
            <button
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Plus size={20} className="text-green-400" /> เพิ่มสมาชิกใหม่
            </h3>
            <p className="text-xs text-text-secondary mb-5">กรอกข้อมูลสมาชิกที่ต้องการเพิ่มเข้าระบบ</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อจริง <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="ชื่อ นามสกุล"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ชื่อเล่น</label>
                  <input
                    type="text"
                    value={newMemberNickname}
                    onChange={(e) => setNewMemberNickname(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น เตโช"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">ห้องเรียน <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberRoom}
                    onChange={(e) => setNewMemberRoom(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น ม.1/8"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-semibold">เลขที่ <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newMemberNum}
                    onChange={(e) => setNewMemberNum(e.target.value)}
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white"
                    placeholder="เช่น 5"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-semibold">รหัสนักเรียน (5 หลัก) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  maxLength={5}
                  className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white font-mono"
                  placeholder="เช่น 42324"
                />
              </div>

              {newMemberError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{newMemberError}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="flex-1 bg-carbon-dark hover:bg-carbon-light border border-pink-primary/10 text-text-secondary py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const name = newMemberName.trim();
                  const room = newMemberRoom.trim();
                  const num = newMemberNum.trim();
                  const id = newMemberId.trim();
                  if (!name) { setNewMemberError('กรุณากรอกชื่อจริง'); return; }
                  if (!room) { setNewMemberError('กรุณากรอกห้องเรียน'); return; }
                  if (!num) { setNewMemberError('กรุณากรอกเลขที่'); return; }
                  if (!id || id.length !== 5) { setNewMemberError('รหัสนักเรียนต้องมี 5 หลัก'); return; }
                  if (data.students.some((s: Student) => s.id === id)) {
                    setNewMemberError(`รหัส ${id} มีในระบบแล้ว`);
                    return;
                  }
                  const nick = newMemberNickname.trim();
                  const fullname = nick ? `${name} (${nick})` : name;
                  const gradeMatch = room.match(/ม\.(\d+)/);
                  const grade = gradeMatch ? Number(gradeMatch[1]) : 1;
                  const newStudent: Student = {
                    id,
                    fullname,
                    classroom: room,
                    number: num,
                    role: grade <= 3 ? 'student_m13' : grade === 4 ? 'student_m4' : 'student_m5',
                    assigned_duty: 'none',
                    duty_status: 'none',
                    duties: {},
                  };
                  importStudentsData([newStudent], 'merge', currentUser || undefined);
                  setIsAddMemberOpen(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-600/20 cursor-pointer"
              >
                เพิ่มสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Members Modal */}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative font-sans text-text-primary">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">📤 ส่งออกข้อมูลสมาชิก</h3>
            <p className="text-xs text-text-secondary mb-5">เลือกรูปแบบที่ต้องการส่งออก — ครอบคลุมข้อมูลสมาชิกทั้ง {data.students.length} คน</p>

            <div className="space-y-3">
              {/* Export JSON */}
              <button
                onClick={() => {
                  const exportData = data.students.map((s: Student) => ({
                    id: s.id,
                    fullname: s.fullname,
                    classroom: s.classroom,
                    number: s.number,
                    role: s.role,
                    duties: s.duties || {},
                    seat: s.seat || null,
                  }));
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `pink69_members_${new Date().toISOString().slice(0,10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗂️</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">Export JSON</p>
                    <p className="text-xs text-text-tertiary mt-0.5">สำหรับนำเข้ากลับเข้าระบบ PINK69 หรือใช้กับเว็บแอปอื่น</p>
                  </div>
                  <Download size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  // สร้าง map จาก id → ชื่อหน้าที่ โดยรวม fixed duties + special duties จาก data
                  const dutyLabel: Record<string, string> = {
                    stand: 'สแตนด์เชียร์',
                    athlete: 'นักกีฬา',
                    procession: data.processionTitle || 'ขบวนพาเหรด',
                  };
                  // เพิ่มหน้าที่พิเศษทั้งหมดที่มีในระบบ (รวม dynamic ID แบบ special_TIMESTAMP)
                  (data.specialDuties || []).forEach((sd: { id: string; title: string }) => {
                    dutyLabel[sd.id] = sd.title;
                  });
                  const statusLabel: Record<string, string> = {
                    approved: 'อนุมัติแล้ว',
                    pending: 'รอพิจารณา',
                    pending_selection: 'รอคัดเลือก',
                    rejected: 'ถูกปฏิเสธ',
                    none: '-',
                  };
                  const headers = ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'ห้องเรียน', 'เลขที่', 'สแตนด์เชียร์', 'นักกีฬา', 'ขบวนพาเหรด', 'หน้าที่พิเศษ', 'หน้าที่ทั้งหมด', 'ที่นั่งแสตน'];
                  const rows = data.students.map((s: Student) => {
                    // แยกชื่อเล่นออกจากวงเล็บ เช่น "สมชาย ใจดี (เตโช)" → ชื่อเล่น = "เตโช"
                    const nicknameMatch = s.fullname.match(/\(([^)]+)\)\s*$/);
                    const nickname = nicknameMatch ? nicknameMatch[1] : '';
                    const realName = s.fullname.replace(/\s*\([^)]+\)\s*$/, '').trim();

                    const duties = s.duties || {};

                    // รวมหน้าที่ทั้งหมด (approved และ pending_selection) เป็น string เดียว
                    const allDutiesSummary = Object.entries(duties)
                      .filter(([, v]) => v === 'approved' || v === 'pending_selection')
                      .map(([k, v]) => {
                        const name = dutyLabel[k] || k;
                        if (v === 'pending_selection') return `${name} (รอคัดเลือก)`;
                        return name;
                      })
                      .join(', ');

                    // หน้าที่พิเศษ (ไม่ใช่ stand/athlete/procession) แสดงทุกสถานะ
                    const specialDuties = Object.entries(duties)
                      .filter(([k]) => k !== 'stand' && k !== 'athlete' && k !== 'procession')
                      .map(([k, v]) => `${dutyLabel[k] || k}: ${statusLabel[v] || v}`)
                      .join(', ');

                    return [
                      s.id,
                      realName,
                      nickname,
                      s.classroom,
                      s.number,
                      statusLabel[duties['stand'] || 'none'] || '-',
                      statusLabel[duties['athlete'] || 'none'] || '-',
                      statusLabel[duties['procession'] || 'none'] || '-',
                      specialDuties || '-',
                      allDutiesSummary || '-',
                      s.seat || '-',
                    ];
                  });
                  const csvContent = [headers, ...rows].map(r => r.map((c: string | number | null | undefined) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
                  const BOM = '\uFEFF';
                  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `pink69_members_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">Export CSV</p>
                    <p className="text-xs text-text-tertiary mt-0.5">เปิดด้วย Excel / Google Sheets ได้เลย รองรับภาษาไทย</p>
                  </div>
                  <Download size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>

              {/* Copy JSON to clipboard */}
              <button
                onClick={() => {
                  const exportData = data.students.map((s: Student) => ({
                    id: s.id,
                    fullname: s.fullname,
                    classroom: s.classroom,
                    number: s.number,
                    role: s.role,
                    duties: s.duties || {},
                    seat: s.seat || null,
                  }));
                  navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
                    alert('✅ คัดลอก JSON ไปยัง Clipboard แล้ว!');
                  });
                }}
                className="w-full bg-carbon-dark/60 hover:bg-carbon-dark border border-pink-primary/10 hover:border-pink-primary/30 text-left px-5 py-4 rounded-2xl transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-pink-accent transition-colors">คัดลอก JSON</p>
                    <p className="text-xs text-text-tertiary mt-0.5">Copy JSON ไปยัง Clipboard เพื่อวางที่อื่นได้เลย</p>
                  </div>
                  <Copy size={16} className="ml-auto text-text-tertiary group-hover:text-pink-accent transition-colors" />
                </div>
              </button>
            </div>

            <p className="text-[11px] text-text-tertiary text-center mt-4">ข้อมูลที่ส่งออก ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      )}

      {/* Import Members Modal — Global, renders from any tab */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans text-text-primary">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              📥 นำเข้าข้อมูลสมาชิกสีชมพู (Google Sheets / CSV)
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              ปรับปรุงและลงทะเบียนข้อมูลนักเรียนทีละหลายๆ คนพร้อมกันอย่างสะดวก
            </p>

            <div className="space-y-4">
              {/* ข้อมูลโครงสร้างคอลัมน์ */}
              <div className="bg-carbon-dark/50 border border-pink-primary/10 rounded-xl p-4 text-xs space-y-2">
                <p className="font-bold text-pink-accent">💡 รูปแบบคอลัมน์ใน Google Sheets / CSV ที่แนะนำ:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-text-secondary font-mono bg-carbon-dark/60 p-2.5 rounded-lg border border-pink-primary/5">
                  <div>A: รหัสประจำตัว (5 หลัก)</div>
                  <div>B: ชื่อ-นามสกุล</div>
                  <div>C: ห้องเรียน (เช่น ม.1/8)</div>
                  <div>D: เลขที่</div>
                  <div>E: หน้าที่ (เช่น stand, athlete)</div>
                  <div>F: สถานะ (เช่น approved)</div>
                  <div>G: ที่นั่ง (เช่น A1)</div>
                </div>
                <p className="text-[11px] text-text-tertiary">
                  * ระบบจะวิเคราะห์หาชื่อคอลัมน์อัตโนมัติ (เช่น 'รหัส', 'ชื่อ', 'ห้อง', 'เลขที่', 'หน้าที่', 'ที่นั่ง') หากใช้ชื่อคอลัมน์เหล่านี้สามารถสลับลำดับคอลัมน์ในชีตได้อิสระ!
                </p>
              </div>

              {/* การเลือกโหมดนำเข้า */}
              <div className="bg-carbon-dark/30 p-3.5 rounded-xl border border-pink-primary/5 space-y-3 text-sm">
                <span className="font-semibold text-text-secondary block">🔄 โหมดการนำเข้า:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Merge */}
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      importMode === 'merge'
                        ? 'bg-pink-primary/15 border-pink-primary text-text-primary'
                        : 'bg-carbon-dark/40 border-pink-primary/10 text-text-secondary hover:border-pink-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${importMode === 'merge' ? 'border-pink-primary bg-pink-primary' : 'border-text-tertiary'}`} />
                      <span className="text-xs font-bold">ผสานข้อมูล (Merge)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed pl-5">
                      เพิ่มคนใหม่ และอัปเดตข้อมูลเฉพาะคนที่อยู่ในไฟล์ คนที่ไม่ได้อยู่ในไฟล์จะยังคงอยู่ในระบบเหมือนเดิม
                    </p>
                    <p className="text-[11px] text-amber-400/80 leading-relaxed pl-5 mt-1.5">
                      ⚠️ ถ้ามีเด็กย้ายออกหรือข้อมูลเก่า เลขที่อาจเลื่อนได้ — ต้องใส่ข้อมูลของทุกคนในห้องให้ครบ ไม่ใช่แค่บางคน
                    </p>
                  </button>

                  {/* Replace */}
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-red-500/15 border-red-500 text-text-primary'
                        : 'bg-carbon-dark/40 border-pink-primary/10 text-text-secondary hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${importMode === 'replace' ? 'border-red-500 bg-red-500' : 'border-text-tertiary'}`} />
                      <span className="text-xs font-bold">⚠️ เขียนทับทั้งหมด (Replace)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed pl-5">
                      ลบข้อมูลทุกคนออกก่อน แล้วใส่ข้อมูลจากไฟล์เข้ามาแทน เหมาะเมื่อต้องการรีเซ็ตรายชื่อใหม่ทั้งหมด
                    </p>
                    <p className="text-[11px] text-red-400/80 leading-relaxed pl-5 mt-1.5">
                      🚨 แก้ปัญหาเลขที่เลื่อนได้ แต่ข้อมูลที่จอง/สมัครหน้าที่ของทุกคนจะถูกลบตามด้วย — ใช้เมื่อแน่ใจว่าไฟล์มีข้อมูลทุกคนครบแล้วเท่านั้น
                    </p>
                  </button>
                </div>
              </div>


              {/* กล่องกรอกข้อมูล */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  วางข้อมูลตาราง (TSV จาก Sheets/Excel) หรืออาร์เรย์ JSON:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`วางข้อมูลลงที่นี่ เช่น คลุมตารางใน Google Sheet แล้วกด Ctrl+C และมาวางในกล่องนี้ได้ทันที\n\nตัวอย่างข้อมูล:\nรหัสประจำตัว\tชื่อ-นามสกุล\tห้อง\tเลขที่\tหน้าที่\tสถานะ\tที่นั่ง\n42324\tกฤษณพล ถาวงค์ (เตโช)\tม.1/8\t1\tstand\tapproved\tA1`}
                  className="w-full h-40 bg-carbon-dark border border-pink-primary/10 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-primary text-white font-mono resize-none"
                />
              </div>

              {/* ปุ่มอัปโหลดไฟล์ */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <label className="flex items-center gap-1.5 bg-carbon-light/80 hover:bg-carbon-light text-text-primary px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-pink-primary/10 active:scale-95">
                  📂 หรือเลือกไฟล์ข้อมูล (CSV / JSON)
                  <input
                    type="file"
                    accept=".csv,.tsv,.json,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImportText(event.target?.result as string || '');
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
                
                <div className="text-[11px] text-text-tertiary">
                  รองรับไฟล์ .csv, .tsv, .json และ .txt
                </div>
              </div>

              {/* แสดงข้อผิดพลาด/สำเร็จ */}
              {importError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* รายละเอียดสคริปต์ Google Sheets */}
              <details className="group border border-pink-primary/10 rounded-xl bg-carbon-dark/20 overflow-hidden transition-all duration-300">
                <summary className="flex items-center justify-between p-3 text-xs font-bold text-text-secondary cursor-pointer hover:bg-carbon-dark/50 select-none">
                  <span>🛠️ วิธีเชื่อมต่อและสคริปต์สำหรับ Google Sheets</span>
                  <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                </summary>
                <div className="p-3 border-t border-pink-primary/5 text-xs text-text-secondary space-y-2.5">
                  <p>นำโค้ดด้านล่างไปใส่ใน Google Sheet เพื่อเพิ่มเมนูส่งออกข้อมูลสมาชิกได้ทันที:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>ในหน้า Google Sheet ของคุณ ไปที่ **ส่วนขยาย (Extensions) &gt; Apps Script**</li>
                    <li>ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดด้านล่างนี้ลงไป</li>
                    <li>กดปุ่ม **บันทึก (Save)** และรีเฟรชหน้า Google Sheet</li>
                    <li>จะมีเมนูใหม่ปรากฏขึ้นชื่อ **"🌸 ระบบสีชมพู (PINK69)" &gt; "ส่งออกข้อมูลสมาชิก"**</li>
                  </ol>
                  <textarea
                    readOnly
                    value={`/**
 * ============================================================
 *  SECHOMPOO — Google Apps Script สำหรับจัดการข้อมูลนักเรียน (PINK69 Version)
 *  วิธีใช้:
 *  1. เปิด Google Sheets
 *  2. ไปที่ Extensions → Apps Script
 *  3. วางโค้ดนี้ทั้งหมดลงไป แทนที่โค้ดเดิม
 *  4. กด Save แล้วกด Run → setupSheet
 *  5. อนุญาต Permission แล้วกลับมาที่ Sheets
 * ============================================================
 */

// ===== ตั้งค่า Sheet =====
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName('นักเรียน');
  if (!sheet) {
    sheet = ss.insertSheet('นักเรียน');
  }
  sheet.clear();
  
  const headers = ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'ห้องเรียน', 'เลขที่', 'สแตนด์เชียร์', 'นักกีฬา', 'ขบวนพาเหรด', 'หน้าที่พิเศษ', 'หน้าที่ทั้งหมด', 'ที่นั่งแสตน'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  
  headerRow.setBackground('#FF2E93');
  headerRow.setFontColor('#ffffff');
  headerRow.setFontWeight('bold');
  headerRow.setFontSize(11);
  headerRow.setHorizontalAlignment('center');
  
  sheet.setColumnWidth(1, 110);  // รหัสนักเรียน
  sheet.setColumnWidth(2, 180);  // ชื่อ-นามสกุล
  sheet.setColumnWidth(3, 90);   // ชื่อเล่น
  sheet.setColumnWidth(4, 80);   // ห้องเรียน
  sheet.setColumnWidth(5, 70);   // เลขที่
  sheet.setColumnWidth(6, 120);  // สแตนด์เชียร์
  sheet.setColumnWidth(7, 120);  // นักกีฬา
  sheet.setColumnWidth(8, 120);  // ขบวนพาเหรด
  sheet.setColumnWidth(9, 150);  // หน้าที่พิเศษ
  sheet.setColumnWidth(10, 150); // หน้าที่ทั้งหมด
  sheet.setColumnWidth(11, 90);  // ที่นั่งแสตน
  
  sheet.setFrozenRows(1);
  createMenu();
  SpreadsheetApp.getUi().alert('✅ ตั้งค่าสำเร็จ!');
}

function createMenu() {
  SpreadsheetApp.getUi()
    .createMenu('🌸 ระบบสีชมพู (PINK69)')
    .addItem('📥 Export JSON (สำหรับเว็บแอป PINK69)', 'exportJSON')
    .addSeparator()
    .addItem('↕️ เรียงตามห้อง และเลขที่', 'sortData')
    .addItem('📊 สรุปจำนวนนักเรียน', 'showSummary')
    .addToUi();
}

function onOpen() {
  createMenu();
}

function exportJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('นักเรียน');
  if (!sheet) { SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet'); return; }
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) { SpreadsheetApp.getUi().alert('❌ ยังไม่มีข้อมูล'); return; }
  const rows = data.slice(1);
  const members = [];
  
  rows.forEach(row => {
    const studentId = String(row[0] || '').trim();
    const name = String(row[1] || '').trim();
    const nickname = String(row[2] || '').trim();
    const classroom = String(row[3] || '').trim();
    const number = String(row[4] || '').trim();
    
    const rawStand = String(row[5] || '').trim();
    const rawAthlete = String(row[6] || '').trim();
    const rawProcession = String(row[7] || '').trim();
    const rawSpecial = String(row[8] || '').trim();
    const seat = String(row[10] || '').trim(); // คอลัมน์ที่ 11
    
    if (!studentId || !name) return;
    
    const getStatus = (statusVal) => {
      if (statusVal.includes('อนุมัติ') || statusVal.includes('approve') || statusVal.includes('ใช่') || statusVal.toLowerCase() === 'y') return 'approved';
      if (statusVal.includes('รอ') || statusVal.includes('pending')) return 'pending_selection';
      return 'none';
    };
    
    const duties = {};
    let assigned_duty = 'none';
    let duty_status = 'none';
    
    if (rawStand !== '-' && rawStand !== '') {
      const s = getStatus(rawStand);
      if (s !== 'none') { duties['stand'] = s; assigned_duty = 'stand'; duty_status = s; }
    }
    if (rawAthlete !== '-' && rawAthlete !== '') {
      const s = getStatus(rawAthlete);
      if (s !== 'none') { duties['athlete'] = s; assigned_duty = 'athlete'; duty_status = s; }
    }
    if (rawProcession !== '-' && rawProcession !== '') {
      const s = getStatus(rawProcession);
      if (s !== 'none') { duties['procession'] = s; assigned_duty = 'procession'; duty_status = s; }
    }
    
    if (rawSpecial !== '-' && rawSpecial !== '') {
      const parts = rawSpecial.split(',').map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        const subParts = part.split(':').map(sp => sp.trim());
        if (subParts.length >= 1) {
          const thDuty = subParts[0];
          const rawStatus = subParts[1] || 'อนุมัติแล้ว';
          
          let engDuty = 'staff';
          const thLower = thDuty.toLowerCase();
          if (thLower.includes('หลีด') || thLower.includes('cheer')) engDuty = 'cheerleader';
          else if (thLower.includes('ดรัม') || thLower.includes('drummer') || thLower.includes('major')) engDuty = 'drummer';
          else if (thLower.includes('ดุริยางค์') || thLower.includes('band') || thLower.includes('วงโย')) engDuty = 'band';
          else if (thLower.includes('กลอง') || thLower.includes('drum')) engDuty = 'drum';
          else if (thLower.includes('ถือป้าย')) engDuty = 'drum';
          else if (thLower.includes('สตาฟ') || thLower.includes('staff')) engDuty = 'staff';
          
          const s = rawStatus.includes('รอคัดเลือก') || rawStatus.includes('รออนุมัติ') ? 'pending_selection' : 'approved';
          duties[engDuty] = s;
          assigned_duty = engDuty;
          duty_status = s;
        }
      });
    }
    
    let formattedName = name;
    if (nickname && !name.includes(\`(\${nickname})\`)) {
      formattedName = \`\${name} (\${nickname})\`;
    }
    
    let role = 'student_m13';
    let grade = 5;
    const gradeMatch = classroom.match(/ม\\.(\\d+)/);
    if (gradeMatch) {
      grade = Number(gradeMatch[1]);
    }
    role = grade <= 3 ? 'student_m13' : 'student_m46';
    
    members.push({
      id: studentId,
      fullname: formattedName,
      classroom: classroom,
      number: number,
      role: role,
      assigned_duty: assigned_duty,
      duty_status: duty_status,
      duties: duties,
      seat: (seat !== '-' && seat !== '') ? seat : undefined
    });
  });
  
  const jsonString = JSON.stringify(members, null, 2);
  const htmlOutput = HtmlService.createHtmlOutput(
    '<h3>🎉 Export สำเร็จ!</h3>' +
    '<p style="font-size:12px;">คลิกในกล่องด้านล่างแล้วกด Ctrl+C เพื่อคัดลอก JSON แล้วนำไปวางในหน้า Import ของเว็บแอป PINK69 ได้เลย</p>' +
    '<textarea style="width:100%;height:280px;font-family:monospace;font-size:11px;" readonly onclick="this.select()">' + jsonString + '</textarea>'
  ).setWidth(600).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🌸 ส่งออกข้อมูลสำหรับ PINK69');
}

function sortData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('นักเรียน');
  if (!sheet) { SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet'); return; }
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  // เรียงลำดับตามห้อง (คอลัมน์ 4) และเลขที่ (คอลัมน์ 5)
  range.sort([{column: 4, ascending: true}, {column: 5, ascending: true}]);
  SpreadsheetApp.getUi().alert('✅ เรียงข้อมูลสำเร็จ!');
}

function showSummary() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('นักเรียน');
  if (!sheet) { SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet'); return; }
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  let total = rows.length;
  let standCount = 0;
  let athleteCount = 0;
  let processionCount = 0;
  
  rows.forEach(row => {
    if (String(row[5] || '').includes('อนุมัติ')) standCount++;
    if (String(row[6] || '').includes('อนุมัติ')) athleteCount++;
    if (String(row[7] || '').includes('อนุมัติ')) processionCount++;
  });
  
  const msg = '📊 สรุปสถิติสมาชิกสีชมพู:\\n\\n' +
              '• จำนวนนักเรียนทั้งหมด: ' + total + ' คน\\n' +
              '• สแตนด์เชียร์ (อนุมัติแล้ว): ' + standCount + ' คน\\n' +
              '• นักกีฬา (อนุมัติแล้ว): ' + athleteCount + ' คน\\n' +
              '• ขบวนพาเหรด (อนุมัติแล้ว): ' + processionCount + ' คน';
  SpreadsheetApp.getUi().alert(msg);
}`}
                    className="w-full h-32 bg-carbon-dark border border-pink-primary/10 rounded-lg p-2 text-[10px] text-text-secondary font-mono resize-none focus:outline-none"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>
              </details>

              {/* ปุ่มยืนยัน / ยกเลิก */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-text-primary py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer font-bold active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleImportData}
                  className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 cursor-pointer font-bold active:scale-95"
                >
                  นำเข้าข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

// Panel — imported from components/ui

// StatCard — imported from components/ui

// MiniCount — imported from components/ui

// DutyCard — imported from components/ui

// SeatGrid — imported from components/ui/SeatGrid

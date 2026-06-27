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
  const [newDutyTitle, setNewDutyTitle] = useState('');
  const [newDutyLimit, setNewDutyLimit] = useState('10');
  const [newDutyLineLink, setNewDutyLineLink] = useState('');
  const [newDutyQr, setNewDutyQr] = useState('');
  const [newAthleteLineLink, setNewAthleteLineLink] = useState(data.athleteQr.lineLink || '');
  const [newAthleteQr, setNewAthleteQr] = useState(data.athleteQr.qrCode || '');
  const [newProcessionLineLink, setNewProcessionLineLink] = useState(data.processionQr?.lineLink || '');
  const [newProcessionQr, setNewProcessionQr] = useState(data.processionQr?.qrCode || '');
  const [newProcessionLimit, setNewProcessionLimit] = useState(String(data.processionLimit || 150));
  const [newProcessionTitle, setNewProcessionTitle] = useState(data.processionTitle || 'ขบวนพาเหรด');
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('กรีฑา');
  const [newEventSubcategory, setNewEventSubcategory] = useState('ลู่'); // ลู่ หรือ ลาน
  const [newEventGender, setNewEventGender] = useState('ชาย'); // ชาย, หญิง, ผสม
  const [newEventLimit, setNewEventLimit] = useState('1'); // จำนวนคน
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [registryTab, setRegistryTab] = useState<'all_members' | 'requests'>('all_members');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<'all' | 'stand' | 'athlete' | 'procession' | 'special' | 'no_duty'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCheckboxDragActive, setIsCheckboxDragActive] = useState<boolean>(false);
  const [checkboxDragMode, setCheckboxDragMode] = useState<'select' | 'deselect' | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<'stand' | 'athlete' | 'procession' | 'special_duty' | 'logs' | 'roles'>('stand');
  const [newControllerId, setNewControllerId] = useState('');
  const [newModeratorId, setNewModeratorId] = useState('');
  const [rolesError, setRolesError] = useState('');
  const [rolesSuccess, setRolesSuccess] = useState('');
  
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
  const [selectedSongId, setSelectedSongId] = useState<string>(() => {
    const initialData = getStoredData();
    return initialData.songs[0]?.id || 'song_1';
  });
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per word
  const [dragColor, setDragColor] = useState<string>('ชมพู');
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const activeSegRef = React.useRef(activeSegmentIndex);
  const activeWordRef = React.useRef(activeWordIndex);

  useEffect(() => {
    activeSegRef.current = activeSegmentIndex;
  }, [activeSegmentIndex]);

  useEffect(() => {
    activeWordRef.current = activeWordIndex;
  }, [activeWordIndex]);
  
  // Add song modal
  const [showAddSongModal, setShowAddSongModal] = useState<boolean>(false);
  const [addSongTitle, setAddSongTitle] = useState<string>('');
  const [addSongLyrics, setAddSongLyrics] = useState<string>('');
  const [addSongEquipment, setAddSongEquipment] = useState<string[]>(['ชมพู', 'ขาว', 'ร่ม']);
  const [newEquipColor, setNewEquipColor] = useState<string>('#ff007f');
  const [editSongEquipColor, setEditSongEquipColor] = useState<string>('#ff007f');
  const [selectedSeatForAssign, setSelectedSeatForAssign] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState<string>('');
  const [editingSpecialDuty, setEditingSpecialDuty] = useState<SpecialDuty | null>(null);
  const [editDutyTitle, setEditDutyTitle] = useState<string>('');
  const [editDutyLimit, setEditDutyLimit] = useState<string>('');
  const [editDutyLineLink, setEditDutyLineLink] = useState<string>('');
  const [editDutyQr, setEditDutyQr] = useState<string>('');
  
  const [lightTheme, setLightTheme] = useState<boolean>(true);
  
  // Registry modals are now handled locally inside RegistryTab component
  
  // Ref and Effect for karaoke horizontal scrolling with dynamic word widths
  const karaokeContainerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (karaokeContainerRef.current) {
      const activeEl = karaokeContainerRef.current.querySelector('.karaoke-active');
      if (activeEl) {
        const container = karaokeContainerRef.current;
        const leftOffset = (activeEl as HTMLElement).offsetLeft - container.clientWidth / 2 + (activeEl as HTMLElement).clientWidth / 2;
        container.scrollTo({
          left: leftOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSegmentIndex, selectedSongId]);

  useEffect(() => {
    setActiveWordIndex(0);
  }, [activeSegmentIndex, selectedSongId]);

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
  const [showEditSegmentsModal, setShowEditSegmentsModal] = useState<boolean>(false);
  const [showArmPoseModal, setShowArmPoseModal] = useState<boolean>(false);
  const [showWholePagePreview, setShowWholePagePreview] = useState<boolean>(false);

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
    if (!isPlaying) return;
    const currentSong = data.songs.find((s: any) => s.id === selectedSongId);
    if (!currentSong || currentSong.segments.length === 0) {
      setIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      const segIdx = activeSegRef.current;
      const wordIdx = activeWordRef.current;
      const seg = currentSong.segments[segIdx];
      const wordsCount = seg?.words?.length || 0;
      
      if (wordIdx < wordsCount - 1) {
        setActiveWordIndex(wordIdx + 1);
      } else {
        // Go to next segment
        let nextSegIdx = segIdx + 1;
        if (nextSegIdx >= currentSong.segments.length) {
          nextSegIdx = 0;
        }
        setActiveSegmentIndex(nextSegIdx);
        setActiveWordIndex(0);
      }
    }, playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedSongId, data.songs]);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [registrySearch, registryDuty, registryClassroom, registryTab, registryCategoryFilter, currentTab]);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribe(() => {
      const next = getStoredData();
      setData(next);
      setNewAthleteLineLink(next.athleteQr.lineLink || '');
      setNewAthleteQr(next.athleteQr.qrCode || '');
      setNewProcessionLineLink(next.processionQr?.lineLink || '');
      setNewProcessionQr(next.processionQr?.qrCode || '');
      setNewProcessionLimit(String(next.processionLimit || 150));
      setNewProcessionTitle(next.processionTitle || 'ขบวนพาเหรด');
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
    const song = data.songs.find((s: Song) => s.id === songId);
    if (song?.isLocked) return;
    const targetValue = value === '' ? 'none' : value;
    const nextSongs = data.songs.map((song: Song) => {
      if (song.id === songId) {
        const nextSegments = song.segments.map((seg, idx) => {
          if (idx === segmentIndex) {
            const currentResolved = getResolvedVisuals(song, segmentIndex, wordIndex);
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
        return { ...song, segments: nextSegments };
      }
      return song;
    });
    saveSongs(nextSongs); // Silently save visuals for smooth drawing performance
  };

  const handleBulkUpdateVisuals = (songId: string, segmentIndex: number, wordIndex: number, mode: 'fill' | 'clear', value?: string) => {
    if (!currentUser || !isController) return;
    const song = data.songs.find((s: Song) => s.id === songId);
    if (song?.isLocked) {
      alert(`เพลง "${song.title}" ถูกล็อกอยู่ ไม่สามารถแก้ไขแผนผังแปรอักษรได้ กรุณาปลดล็อกก่อนครับ`);
      return;
    }
    const targetValue = (mode === 'fill' && (value === '' || !value)) ? 'none' : (value || '');
    const nextSongs = data.songs.map((song: Song) => {
      if (song.id === songId) {
        const nextSegments = song.segments.map((seg, idx) => {
          if (idx === segmentIndex) {
            const currentResolved = getResolvedVisuals(song, segmentIndex, wordIndex);
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
        return { ...song, segments: nextSegments };
      }
      return song;
    });
    const songName = song ? song.title : 'ไม่ระบุชื่อเพลง';
    const segment = song?.segments[segmentIndex];
    const word = segment?.words[wordIndex];
    const wordText = word ? word.text : `คำที่ ${wordIndex + 1}`;
    saveSongs(
      nextSongs, 
      currentUser, 
      mode === 'fill' 
        ? `เทสีแปรอักษรทั้งหมดเป็น "${value}" ของคำว่า "${wordText}" ในเพลง "${songName}"` 
        : `ล้างแผนผังแปรอักษรทั้งหมด ของคำว่า "${wordText}" ในเพลง "${songName}"`
    );
  };

  const handleCopyPreviousWordVisuals = (songId: string, segmentIndex: number, wordIndex: number) => {
    if (!currentUser || !isController) return;
    const song = data.songs.find((s: Song) => s.id === songId);
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

    // ดึง resolved visuals ของคำก่อนหน้า
    const prevResolved = getResolvedVisuals(song, prevSegIdx, prevWordIdx);

    const copiedVisuals: Record<string, string> = {};
    rows.forEach(r => {
      columns.forEach(c => {
        const label = `${r}${c}`;
        const val = prevResolved[label];
        copiedVisuals[label] = (val && val !== 'none') ? val : 'none';
      });
    });

    const nextSongs = data.songs.map((s: Song) => {
      if (s.id === songId) {
        const nextSegments = s.segments.map((seg, idx) => {
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
        return { ...s, segments: nextSegments };
      }
      return s;
    });

    const currentWord = song.segments[segmentIndex]?.words[wordIndex];
    const currentWordText = currentWord ? currentWord.text : `คำที่ ${wordIndex + 1}`;
    const prevSegment = song.segments[prevSegIdx];
    const prevWord = prevSegment?.words[prevWordIdx];
    const prevWordText = prevWord ? prevWord.text : `คำก่อนหน้า`;

    saveSongs(
      nextSongs,
      currentUser,
      `คัดลอกรูปแบบแปรอักษรจากคำว่า "${prevWordText}" มายังคำว่า "${currentWordText}"`
    );
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

  const addSpecialDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || currentUser.role === 'moderator' || !newDutyTitle.trim()) return;
    const id = `special_${Date.now()}`;
    
    // หากกรอก 0 หรือเว้นว่าง หรือค่าผิดปกติ ให้ปรับเป็น 9999 (ซึ่งจะแสดงผลว่า "ไม่จำกัด")
    const parseLimit = Number(newDutyLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;

    const nextDuty: SpecialDuty = {
      id,
      title: newDutyTitle.trim(),
      icon: 'S',
      limit: limitValue,
      lineLink: newDutyLineLink.trim(),
      qrCode: newDutyQr,
    };
    saveSystemConfig(
      { specialDuties: [...data.specialDuties, nextDuty] },
      currentUser,
      `เพิ่มหน้าที่พิเศษ ${nextDuty.title} (โควตา: ${nextDuty.limit === 9999 ? 'ไม่จำกัด' : `${nextDuty.limit} คน`})`
    );
    setNewDutyTitle('');
    setNewDutyLimit('10');
    setNewDutyLineLink('');
    setNewDutyQr('');
  };

  const removeSpecialDuty = (id: string) => {
    if (!currentUser || !isController || currentUser.role === 'moderator') return;
    const duty = data.specialDuties.find((item: SpecialDuty) => item.id === id);
    if (!duty || !confirm(`ต้องการลบหน้าที่ ${duty.title} ใช่หรือไม่?`)) return;
    saveSystemConfig(
      { specialDuties: data.specialDuties.filter((item: SpecialDuty) => item.id !== id) },
      currentUser,
      `ลบหน้าที่พิเศษ ${duty.title}`
    );
  };

  const updateSpecialDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isController || currentUser.role === 'moderator' || !editingSpecialDuty || !editDutyTitle.trim()) return;

    const parseLimit = Number(editDutyLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;

    const changes: string[] = [];
    if (editingSpecialDuty.title !== editDutyTitle.trim()) {
      changes.push(`ชื่อ "${editingSpecialDuty.title}" ➔ "${editDutyTitle.trim()}"`);
    }
    if (editingSpecialDuty.limit !== limitValue) {
      const oldLimit = editingSpecialDuty.limit === 9999 ? 'ไม่จำกัด' : `${editingSpecialDuty.limit} คน`;
      const newLimit = limitValue === 9999 ? 'ไม่จำกัด' : `${limitValue} คน`;
      changes.push(`โควตา ${oldLimit} ➔ ${newLimit}`);
    }
    if (editingSpecialDuty.lineLink !== editDutyLineLink.trim()) {
      changes.push('ปรับปรุงลิงก์กลุ่ม');
    }
    if (editingSpecialDuty.qrCode !== editDutyQr) {
      changes.push('ปรับปรุง QR Code');
    }

    const logMessage = changes.length > 0 
      ? `แก้ไขหน้าที่พิเศษ ${editDutyTitle.trim()} (${changes.join(', ')})`
      : `แก้ไขหน้าที่พิเศษ ${editDutyTitle.trim()}`;

    const updatedDuties = data.specialDuties.map((item: SpecialDuty) => {
      if (item.id === editingSpecialDuty.id) {
        return {
          ...item,
          title: editDutyTitle.trim(),
          limit: limitValue,
          lineLink: editDutyLineLink.trim(),
          qrCode: editDutyQr,
        };
      }
      return item;
    });

    saveSystemConfig(
      { specialDuties: updatedDuties },
      currentUser,
      logMessage
    );
    setEditingSpecialDuty(null);
    setEditDutyTitle('');
    setEditDutyLimit('');
    setEditDutyLineLink('');
    setEditDutyQr('');
  };

  const saveAthleteQr = () => {
    if (!currentUser || !isController) return;
    saveSystemConfig(
      { athleteQr: { qrCode: newAthleteQr, lineLink: newAthleteLineLink } },
      currentUser,
      'อัปเดต QR กลุ่มนักกีฬา'
    );
  };

  const saveProcessionConfig = () => {
    if (!currentUser || !isController) return;
    const parseLimit = Number(newProcessionLimit);
    const limitValue = (isNaN(parseLimit) || parseLimit <= 0) ? 9999 : parseLimit;
    const cleanTitle = newProcessionTitle.trim() || 'ขบวนพาเหรด';
    saveSystemConfig(
      { 
        processionQr: { qrCode: newProcessionQr, lineLink: newProcessionLineLink },
        processionLimit: limitValue,
        processionTitle: cleanTitle
      },
      currentUser,
      `อัปเดตตั้งค่าขบวนพาเหรด (ชื่อ: ${cleanTitle}, โควตา: ${limitValue === 9999 ? 'ไม่จำกัด' : `${limitValue} คน`})`
    );
  };

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
        detectedStudent={detectedStudent}
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
          <section className="space-y-8 animate-fadeIn">
            {/* Rich Gradient Hero Section with Conic/Radial Glow Effect */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-carbon-card via-carbon-card/90 to-carbon-light/35 border border-pink-primary/15 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-primary/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-widest text-pink-primary font-bold bg-pink-primary/10 px-3 py-1 rounded-full border border-pink-primary/20">Dashboard</span>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-2 tracking-tight text-text-primary">ระบบจัดการหน้าที่สีชมพู</h1>
                <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
                  รวมสมัครหน้าที่ ประกาศสำคัญ ทะเบียนการทำงาน และการจองสแตนเชียร์ของพวกเราคณะสีชมพูไว้ในระบบเดียวแบบเรียลไทม์
                </p>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Members - Pink Theme */}
                  <div className="bg-pink-primary/10 border border-pink-primary/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-pink-primary/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-primary/20 text-pink-primary flex items-center justify-center border border-pink-primary/30">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">สมาชิกทั้งหมด</p>
                        <p className="text-xl font-bold text-text-primary mt-0.5">{data.students.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Duties - Emerald Green Theme */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-emerald-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">มีหน้าที่แล้ว</p>
                        <p className="text-xl font-bold text-emerald-500 mt-0.5">{data.students.length - unassignedStudents.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Unassigned Duties - Violet/Rose Theme */}
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-rose-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">ยังไม่มีหน้าที่</p>
                        <p className="text-xl font-bold text-rose-500 mt-0.5">{unassignedStudents.length} คน</p>
                      </div>
                    </div>
                  </div>

                  {/* Seated Stand - Gold/Yellow Theme */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm hover:border-yellow-500/45 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary font-medium">จองสแตนแล้ว</p>
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">{seatedStudents.length} / 180 คน</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="สถานะหน้าที่ของคุณ">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <p className="text-sm text-text-secondary">หน้าที่ปัจจุบัน</p>
                    <p className="text-2xl font-bold text-pink-primary">{dutyLabel(currentUser.assigned_duty)}</p>
                    {currentUser.seat ? (
                      <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg w-max text-green-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        ที่นั่งรหัส {currentUser.seat}
                      </div>
                    ) : currentUser.duty_status === 'pending_selection' ? (
                      <div className="flex items-center gap-1.5 mt-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg w-max text-yellow-500 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        รอคัดเลือก / รออนุมัติ
                      </div>
                    ) : currentUser.assigned_duty !== 'none' && currentUser.duty_status === 'approved' ? (
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-1.5 bg-pink-primary/10 border border-pink-primary/20 px-3 py-1 rounded-lg w-max text-pink-primary text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-pink-primary"></span>
                          ยืนยันหน้าที่เรียบร้อย
                        </div>
                        {(() => {
                          let qrCode = '';
                          let lineLink = '';
                          
                          if (currentUser.assigned_duty === 'athlete') {
                            qrCode = data.athleteQr?.qrCode;
                            lineLink = data.athleteQr?.lineLink;
                          } else if (currentUser.assigned_duty === 'procession') {
                            qrCode = data.processionQr?.qrCode;
                            lineLink = data.processionQr?.lineLink;
                          } else {
                            const spec = data.specialDuties.find((sd: SpecialDuty) => sd.id === currentUser.assigned_duty);
                            if (spec) {
                              qrCode = spec.qrCode || '';
                              lineLink = spec.lineLink || '';
                            }
                          }
                          
                          if (!qrCode && !lineLink) return null;
                          return (
                            <div className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-3 space-y-2 mt-2 w-max max-w-xs text-xs font-sans">
                              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">ช่องทางติดต่อหัวหน้ากลุ่ม</p>
                              {qrCode && <img src={qrCode} alt="QR กลุ่มประสานงาน" className="max-h-36 rounded-lg mx-auto border border-pink-primary/10" />}
                              {lineLink && <a href={lineLink} target="_blank" rel="noreferrer" className="block text-center text-[11px] text-pink-primary hover:text-pink-accent font-semibold">เข้ากลุ่มไลน์ติดตามข่าวสาร</a>}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-text-tertiary mt-2">กรุณาติดต่อพี่ควบคุมสี</p>
                    )}
                  </div>
                </div>
              </Panel>
              <Panel title="กระดานข่าวล่าสุด">
                <div className="space-y-3">
                  {data.announcements.slice(0, 2).map((item: Announcement) => (
                    <div key={item.id} className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-4 hover:border-pink-primary/15 transition-all duration-300">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-white text-sm line-clamp-1">{item.title}</p>
                        <span className="text-[10px] text-text-tertiary whitespace-nowrap bg-carbon-light px-2 py-0.5 rounded-full">{item.date}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        )}

        {/* Removed Apply tab content */}

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
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Student personal instruction panel */}
                        <div className="lg:col-span-7 space-y-6">
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

                            {/* Song selector for student */}
                            <div>
                              <label className="text-xs text-text-secondary block mb-1.5">เลือกเพลงเชียร์</label>
                              <select
                                value={selectedSongId}
                                onChange={(e) => {
                                  setSelectedSongId(e.target.value);
                                  setActiveSegmentIndex(0);
                                }}
                                className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                              >
                                {data.songs.map((song: Song) => (
                                  <option key={song.id} value={song.id}>{song.title}</option>
                                ))}
                              </select>
                            </div>

                            {/* Practice Mode Simulation for Student */}
                            {currentSong && (() => {
                              const getSegmentColorStyle = (seg: any) => {
                                const action = seg.visuals[mySeat] || 'none';
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
                                    textClass: lightTheme ? 'text-slate-800' : 'text-white',
                                    shadowStyle: undefined,
                                    bgClass: 'bg-white text-slate-800 border-gray-300',
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

                              const currentStyle = getSegmentColorStyle(currentSong.segments[activeSegmentIndex] || {});

                              return (
                                  <div className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-pink-primary/5">
                                      <span className="text-xs font-bold text-pink-accent">โหมดซ้อมร้องเพลงและชูเพลต (ส่วนตัว)</span>
                                      <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                          isPlaying ? 'bg-yellow-500 text-white' : 'bg-pink-primary text-white'
                                        }`}
                                      >
                                        {isPlaying ? '⏸ หยุดจำลอง' : '▶ เริ่มจำลอง'}
                                      </button>
                                    </div>

                                    {/* Speed Control Slider & Input like Image 2 */}
                                    <div className="space-y-2 pt-1">
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
                                            className="w-20 bg-carbon-card border border-pink-primary/10 rounded-lg px-2 py-1 text-xs text-center text-pink-primary font-bold focus:outline-none focus:border-pink-primary"
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
                                        className="w-full accent-pink-primary cursor-pointer"
                                      />
                                    </div>

                                  {/* Horizontal Scrolling Karaoke Bar */}
                                  <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-4 text-center relative overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[120px] w-full">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-primary/5 to-transparent animate-pulse pointer-events-none" />
                                    
                                    {/* Action indicator badge */}
                                    {(() => {
                                      const resolvedCurrent = getResolvedVisuals(currentSong, activeSegmentIndex, activeWordIndex);
                                      const currentStyle = getSegmentColorStyle({ visuals: resolvedCurrent });
                                      return (
                                        <div className="flex flex-col items-center">
                                          <div className={`mb-3 px-3 py-1 rounded-full text-[11px] font-bold transition-all border uppercase tracking-wider ${currentStyle.bgClass} ${currentStyle.textClass}`} style={currentStyle.bgStyle}>
                                            คิวเพลตของคุณ: {currentStyle.label}
                                          </div>
                                          {currentStyle.isArmPose && currentStyle.pose && (
                                            <div className="w-16 h-16 mb-2 bg-carbon-dark/50 rounded-xl p-1 border border-pink-primary/10">
                                              <ArmPoseMiniSVG pose={currentStyle.pose} />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}

                                    {/* Scroll Wrapper */}
                                    <div className="w-full max-w-2xl relative overflow-hidden py-2">
                                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-carbon-card to-transparent pointer-events-none z-10" />
                                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-carbon-card to-transparent pointer-events-none z-10" />

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
                                              onClick={() => {
                                                setIsPlaying(false);
                                                setActiveSegmentIndex(idx);
                                                setActiveWordIndex(0);
                                              }}
                                              style={shadowStyle}
                                              className={`transition-all duration-300 cursor-pointer rounded-xl px-4 py-1.5 font-bold whitespace-nowrap flex-shrink-0 text-center mx-3 hover:scale-105 flex items-center gap-1.5 ${textClass} ${opacityClass}`}
                                            >
                                              {seg.words.map((word, wIdx) => {
                                                const wordResolved = getResolvedVisuals(currentSong, idx, wIdx);
                                                const seatAction = wordResolved[mySeat] || 'none';
                                                
                                                const act = seatAction.toLowerCase().trim();
                                                let wordColorClass = 'text-text-secondary/60';
                                                if (act.includes('ชมพู') || act.includes('pink')) wordColorClass = 'text-pink-primary';
                                                else if (act.includes('ขาว') || act.includes('white')) wordColorClass = lightTheme ? 'text-slate-800' : 'text-white';
                                                else if (act.includes('เหลือง') || act.includes('yellow') || act.includes('ร่ม')) wordColorClass = 'text-yellow-400';
                                                else if (act.includes('น้ำเงิน') || act.includes('blue')) wordColorClass = 'text-blue-400';
                                                else if (act.includes('เขียว') || act.includes('green')) wordColorClass = 'text-green-400';
                                                else if (act.includes('แดง') || act.includes('red')) wordColorClass = 'text-red-400';

                                                const isWordActive = isActive && activeWordIndex === wIdx;

                                                return (
                                                  <span
                                                    key={wIdx}
                                                    className={`transition-all duration-200 ${wordColorClass} ${
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

                                  {/* Action display */}
                                  {(() => {
                                    const resolvedCurrent = getResolvedVisuals(currentSong, activeSegmentIndex, activeWordIndex);
                                    const currentMyAction = resolvedCurrent[mySeat] || 'none';
                                    const actionColorStyle = getSeatColorStyle(currentMyAction, currentSong.equipment);
                                    return (
                                      <div
                                        style={actionColorStyle.style}
                                        className={`border rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-1 transition-all ${actionColorStyle.className}`}
                                      >
                                        <span className="text-[10px] uppercase opacity-75">สิ่งที่ต้องทำสำหรับที่นั่งคุณ</span>
                                        <h4 className="text-xl font-black tracking-wider">
                                          {getActionText(currentMyAction)}
                                        </h4>
                                        <span className="text-[11px] opacity-75 mt-2">
                                          อุปกรณ์ที่ใช้: {currentMyAction || 'ไม่ต้องใช้'}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Cheering Lyrics Panel (Replacing the leaked grid) */}
                        <div className="lg:col-span-5 space-y-6">
                          <Panel title={`เนื้อเพลง "${currentSong?.title || ''}"`}>
                            <div className="p-4 bg-carbon-dark/40 border border-pink-primary/10 rounded-2xl max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin space-y-3">
                              {currentSong?.segments.map((seg, idx) => {
                                const isActive = activeSegmentIndex === idx;
                                return (
                                  <div
                                    key={seg.id}
                                    onClick={() => { setIsPlaying(false); setActiveSegmentIndex(idx); setActiveWordIndex(0); }}
                                    className={`cursor-pointer rounded-xl px-3 py-2 transition-all border ${
                                      isActive
                                        ? 'bg-pink-primary/10 border-pink-primary/30 scale-[1.01]'
                                        : 'bg-transparent border-transparent hover:bg-carbon-light/30 hover:border-pink-primary/10'
                                    }`}
                                  >
                                    <span className="text-[10px] text-pink-accent/60 font-semibold block mb-1">ท่อนที่ {idx + 1}</span>
                                    <div className="flex flex-wrap gap-1 items-center">
                                      {(seg.words || []).map((word, wIdx) => {
                                        const wordResolved = getResolvedVisuals(currentSong, idx, wIdx);
                                        const wordAction = wordResolved[mySeat] || 'none';
                                        const isWordActive = isActive && activeWordIndex === wIdx;
                                        
                                        const act = wordAction.toLowerCase().trim();
                                        let wordColorClass = 'text-text-secondary/60';
                                        if (act.includes('ชมพู') || act.includes('pink')) wordColorClass = 'text-pink-primary';
                                        else if (act.includes('ขาว') || act.includes('white')) wordColorClass = lightTheme ? 'text-slate-800' : 'text-white';
                                        else if (act.includes('เหลือง') || act.includes('yellow') || act.includes('ร่ม')) wordColorClass = 'text-yellow-400';
                                        else if (act.includes('น้ำเงิน') || act.includes('blue')) wordColorClass = 'text-blue-400';
                                        else if (act.includes('เขียว') || act.includes('green')) wordColorClass = 'text-green-400';
                                        else if (act.includes('แดง') || act.includes('red')) wordColorClass = 'text-red-400';

                                        const hexMatch = act.match(/\((#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\)$/);
                                        let customWordStyle: React.CSSProperties = {};
                                        if (hexMatch && !isWordActive) {
                                          customWordStyle = { color: hexMatch[1] };
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
                                            style={customWordStyle}
                                            className={`text-sm font-bold transition-all rounded-md px-1.5 py-0.5 cursor-pointer hover:bg-carbon-light/40 select-none ${
                                              isWordActive
                                                ? `${wordColorClass} ring-2 ring-pink-primary bg-carbon-light scale-110 shadow-sm text-text-primary`
                                                : word.isTagged
                                                  ? `${wordColorClass} ring-1 ring-current/40 bg-current/5`
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

                      </div>
                    );
                  })()

                )}
              </>
            )}

            {/* CONTROLLER / STAFF VIEW */}
            {isController && (
              (() => {
                const currentSong = data.songs.find((s: Song) => s.id === selectedSongId) || data.songs[0];
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
                              {data.songs.map((song: Song) => (
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
                            
                            {/* Color Palette selectors */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-text-secondary mr-1">แปรงทาสี:</span>
                              {currentSong.equipment
                                .filter(equip => !isArmPoseString(equip))
                                .map(equip => {
                                  const btnStyle = getSeatColorStyle(equip, currentSong.equipment);
                                  return (
                                    <button
                                      key={equip}
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
                                onClick={() => setDragColor('')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border bg-carbon-light border-red-500/20 text-red-400 transition-all ${
                                  dragColor === '' ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-carbon-card font-black scale-105' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                ยางลบ (ลบโค้ด)
                              </button>
                            </div>
                          </div>

                          {/* Karaoke/Lyrics Simulation Player */}
                          {(() => {
                            // Helper to get active plate styling
                            const getSegmentColorStyle = (seg: any) => {
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

                            const getWordColorStyle = (w: any, seg: any, resolvedVis?: any) => {
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
                                        onClick={() => setActiveWordIndex(wIdx)}
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
                                          onClick={() => {
                                            setIsPlaying(false);
                                            setActiveSegmentIndex(idx);
                                            setActiveWordIndex(0);
                                          }}
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


                          {/* Shortcuts */}
                          <div className="flex items-center gap-2">
                            <button
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
                              onClick={() => handleBulkUpdateVisuals(selectedSongId, activeSegmentIndex, activeWordIndex, 'clear')}
                              className="bg-carbon-dark hover:bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            >
                              ล้างหน้านี้ทั้งหมด (Clear)
                            </button>
                            {(() => {
                              const hasPrevWord = activeWordIndex > 0 || activeSegmentIndex > 0;
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleCopyPreviousWordVisuals(selectedSongId, activeSegmentIndex, activeWordIndex)}
                                  disabled={!hasPrevWord}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                                    hasPrevWord
                                      ? 'bg-pink-primary/10 hover:bg-pink-primary/20 border-pink-primary/30 text-pink-accent cursor-pointer hover:scale-[1.02] active:scale-95'
                                      : 'bg-carbon-light/20 border-pink-primary/5 text-text-tertiary opacity-50 cursor-not-allowed'
                                  }`}
                                  title={hasPrevWord ? 'คัดลอกรูปแบบการแปรอักษร (resolved) จากคำร้องก่อนหน้านี้' : 'ไม่มีคำก่อนหน้า'}
                                >
                                  📋 คัดลอกคำก่อนหน้า
                                </button>
                              );
                            })()}
                            
                            <button
                              type="button"
                              onClick={() => setShowWholePagePreview(true)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-red-600/10 cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center gap-1"
                            >
                              👁️ พรีวิวทั้งหน้า
                            </button>
                            <span className="text-xs text-text-tertiary ml-auto hidden sm:inline">
                              💡 เทคนิค: คลิกแล้วลากเมาส์เพื่อระบายสีสแตนได้อย่างรวดเร็ว!
                            </span>
                          </div>

                          {/* Visual 180 Seating Grid */}
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-carbon-dark border border-pink-primary/10 p-4 rounded-2xl overflow-auto select-none font-bold">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, minmax(28px, 1fr))', gap: '4px', justifyContent: 'center' }}>
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
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">แผงผู้ควบคุม</h2>
              <p className="text-sm text-text-secondary">เปิดปิดสแตน เพิ่มหน้าที่พิเศษ ตั้งค่า QR และจัดไลน์อัพนักกีฬา</p>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap bg-carbon-card border border-pink-primary/10 rounded-2xl md:rounded-full p-1.5 w-max gap-1 mb-6 shadow-lg">
              {[
                { id: 'stand', label: '📣 จัดการสแตน' },
                { id: 'athlete', label: '🏃 จัดการนักกีฬา' },
                { id: 'procession', label: `🚶 จัดการ${data.processionTitle || 'ขบวนพาเหรด'}` },
                { id: 'special_duty', label: '✨ จัดการหน้าที่พิเศษ' },
                isSuperController ? { id: 'roles', label: '🛡️ สิทธิ์ผู้ดูแล' } : null,
                { id: 'logs', label: '📝 Log ประวัติการทำงาน' }
              ].filter(Boolean).map(sub => (
                <button
                  key={sub!.id}
                  onClick={() => setAdminSubTab(sub!.id as any)}
                  className={`px-4 py-2 rounded-xl md:rounded-full text-xs font-bold transition-all ${
                    adminSubTab === sub!.id
                      ? 'bg-pink-primary text-white shadow-md shadow-pink-primary/20 scale-105'
                      : 'text-text-secondary hover:text-white hover:bg-carbon-light/30'
                  }`}
                >
                  {sub!.label}
                </button>
              ))}
            </div>

            {/* Full-width Stand Booking Control */}
             {adminSubTab === 'stand' && (
            <Panel title="เปิด/ปิดรับสมัครสแตน">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${data.standOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {data.standOpen ? 'กำลังเปิดรับสมัครสแตน' : 'ปิดรับสมัครสแตนอยู่'}
                    </p>
                    <span className="text-text-tertiary">|</span>
                    <p className={`font-bold ${data.standLocked ? 'text-yellow-500' : 'text-text-secondary'}`}>
                      {data.standLocked ? '🔒 ล็อกการเปลี่ยนแปลงที่นั่งแล้ว' : '🔓 เปิดอิสระในการจอง/ยกเลิก'}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    หากสั่งล็อก สมาชิกที่มีรายชื่อบนสแตนแล้วจะไม่สามารถกดยกเลิกที่นั่งหรือถอนตัวได้เพื่อป้องกันความวุ่นวาย
                  </p>
                </div>
                {isSuperController && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => saveSystemConfig({ standOpen: !data.standOpen }, currentUser || undefined, data.standOpen ? 'ปิดรับสมัครสแตน' : 'เปิดรับสมัครสแตน')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${data.standOpen ? 'bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20' : 'bg-green-500/10 hover:bg-green-500 hover:text-white text-green-400 border border-green-500/20'}`}
                    >
                      {data.standOpen ? 'ปิดรับสมัครสแตน' : 'เปิดรับสมัครสแตน'}
                    </button>
                    <button
                      onClick={() => saveSystemConfig({ standLocked: !data.standLocked }, currentUser || undefined, data.standLocked ? 'ปลดล็อกการถอนตัวสแตน' : 'ล็อกการถอนตัวสแตน')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${data.standLocked ? 'bg-yellow-500 text-black font-bold' : 'bg-carbon-light border border-pink-primary/20 text-white hover:bg-pink-primary/25'}`}
                    >
                      {data.standLocked ? '🔓 ปลดล็อกที่นั่ง' : '🔒 ล็อกที่นั่งทั้งหมด'}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-5 border-t border-pink-primary/10 pt-4">
                <SeatGrid currentUser={currentUser || { id: 'dummy', fullname: 'ระบบ', classroom: 'ม.5', role: 'student_m5', assigned_duty: 'none', duty_status: 'none' }} isController={isSuperController} getSeatOwner={getSeatOwner} onSeatClick={handleSeatClick} />
              </div>
            </Panel>
            )}

            {/* Athlete QR Code Settings (Split Athlete Panel) */}
            {adminSubTab === 'athlete' && (
            <Panel title="ตั้งค่าช่องทางการติดต่อกลุ่มนักกีฬา">
              <div className="max-w-md space-y-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">ลิงก์กลุ่มไลน์นักกีฬา</label>
                  <input value={newAthleteLineLink} onChange={(e) => setNewAthleteLineLink(e.target.value)} placeholder="ลิงก์ Line group นักกีฬา" className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">อัปโหลดรูปภาพ QR Code</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                    <ImageIcon size={16} className="text-pink-primary" /> เลือกรูป QR Code
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewAthleteQr(await fileToDataUrl(file));
                    }} />
                  </label>
                </div>
                {newAthleteQr && (
                  <div className="relative mx-auto w-max">
                    <img src={newAthleteQr} alt="QR กลุ่มนักกีฬา" className="max-h-32 rounded-lg border border-pink-primary/10" />
                    <button onClick={() => setNewAthleteQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                  </div>
                )}
                <button onClick={saveAthleteQr} className="w-full bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20">
                  บันทึก QR & ลิงก์นักกีฬา
                </button>
              </div>
            </Panel>
            )}

            {/* Procession Panel */}
            {adminSubTab === 'procession' && (
            <Panel title="ตั้งค่าขบวนพาเหรด">
              <div className="max-w-md space-y-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">ชื่อตำแหน่งงาน</label>
                  <input 
                    type="text"
                    value={newProcessionTitle} 
                    onChange={(e) => setNewProcessionTitle(e.target.value)} 
                    placeholder="เช่น ขบวนพาเหรด" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">ลิงก์กลุ่มไลน์ขบวนพาเหรด</label>
                  <input 
                    value={newProcessionLineLink} 
                    onChange={(e) => setNewProcessionLineLink(e.target.value)} 
                    placeholder="ลิงก์ Line group ขบวนพาเหรด" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">อัปโหลดรูปภาพ QR Code</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                    <ImageIcon size={16} className="text-pink-primary" /> เลือกรูป QR Code
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewProcessionQr(await fileToDataUrl(file));
                    }} />
                  </label>
                </div>
                {newProcessionQr && (
                  <div className="relative mx-auto w-max">
                    <img src={newProcessionQr} alt="QR กลุ่มขบวนพาเหรด" className="max-h-32 rounded-lg border border-pink-primary/10" />
                    <button onClick={() => setNewProcessionQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-secondary block mb-1">จำนวนโควตาคน (ใส่อักษร 0 หรือไม่ใส่เพื่อไม่จำกัดคน)</label>
                  <input 
                    type="number"
                    value={newProcessionLimit} 
                    onChange={(e) => setNewProcessionLimit(e.target.value)} 
                    placeholder="จำนวนโควตาขบวนพาเหรด" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white font-bold" 
                  />
                </div>
                <button onClick={saveProcessionConfig} className="w-full bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20 cursor-pointer font-bold active:scale-95">
                  บันทึกตั้งค่าขบวนพาเหรด
                </button>
              </div>
            </Panel>
            )}

            {/* Special Duties Management Area (Split Special Duties Panel) */}
            {adminSubTab === 'special_duty' && (
            <Panel title="จัดการตำแหน่งหน้าที่พิเศษ">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-primary/10 pb-4 mb-4">
                <span className="text-xs text-text-secondary">กำหนดจำนวนโควตาผู้ปฏิบัติงานในตำแหน่งพิเศษ และตั้งค่าลิงก์/QR กลุ่มสตาฟ</span>
                {currentUser?.role !== 'moderator' && (
                  <button 
                    onClick={() => setShowDutyModal(true)} 
                    className="bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/20 active:scale-95 cursor-pointer w-max"
                  >
                    <Plus size={14} /> เพิ่มหน้าที่พิเศษใหม่
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.specialDuties.map((item: SpecialDuty) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-carbon-dark border border-pink-primary/5 rounded-xl p-3 hover:border-pink-primary/10 transition-all">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-text-secondary">{item.limit === 9999 ? 'รับไม่จำกัด' : `รับ ${item.limit} คน`} · มอบหมายแล้ว {data.students.filter((s: Student) => s.duties?.[item.id] === 'approved').length} คน</p>
                    </div>
                    {currentUser?.role !== 'moderator' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingSpecialDuty(item);
                            setEditDutyTitle(item.title);
                            setEditDutyLimit(item.limit === 9999 ? '0' : String(item.limit));
                            setEditDutyLineLink(item.lineLink || '');
                            setEditDutyQr(item.qrCode || '');
                          }} 
                          className="text-pink-primary hover:text-pink-accent transition-colors p-1 cursor-pointer"
                          title="แก้ไขหน้าที่"
                        >
                          <Settings size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeSpecialDuty(item.id)} 
                          className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                          title="ลบหน้าที่"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
            )}

            {/* Sports Event Panel */}
            {adminSubTab === 'athlete' && (
            <Panel title="รายการแข่งขันกีฬา">
              <div className="flex justify-between items-center mb-5">
                <p className="text-xs text-text-secondary">จัดการและเพิ่มรายการแข่งขันกีฬาหรือกรีฑาลงระบบทะเบียน</p>
                <button 
                  onClick={() => setShowSportsModal(true)} 
                  className="bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-primary/20 active:scale-95"
                >
                  <Plus size={14} /> เพิ่มรายการกีฬาใหม่
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.sports.map((event: SportsEvent) => {
                  const eligibleAthletes = data.students.filter((st: Student) => st.duties?.['athlete'] === 'approved');
                  return (
                    <div key={event.id} className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                      <div className="flex items-center justify-between gap-3 border-b border-pink-primary/5 pb-2">
                        <h3 className="font-bold text-white text-sm sm:text-base">{event.name} ({event.category})</h3>
                        <button 
                          onClick={() => {
                            if (confirm(`ต้องการลบรายการแข่งขัน "${event.name}" ใช่หรือไม่? นักกีฬาในรายการนี้จะหลุดจากตาราง`)) {
                              removeSportsEvent(event.id, currentUser || undefined);
                            }
                          }} 
                          className="text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
                          title="ลบรายการแข่งขัน"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="border-t border-pink-primary/5 pt-3">
                        {event.lineup.length === 0 ? (
                          <div className="w-full text-center py-6 text-text-tertiary text-xs italic bg-carbon-card/30 rounded-xl border border-pink-primary/5">
                            ยังไม่จัดรายชื่อนักกีฬา
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2.5">
                            {event.lineup.map((athleteId) => {
                              const athlete = data.students.find((s: Student) => s.id === athleteId);
                              if (!athlete) return null;

                              // Extract nickname in parentheses, fallback to first name
                              const nicknameMatch = athlete.fullname.match(/\(([^)]+)\)/);
                              const shortName = nicknameMatch ? nicknameMatch[1] : athlete.fullname.split(' ')[0];

                              return (
                                <div 
                                  key={athleteId} 
                                  className="w-[100px] bg-gradient-to-b from-pink-primary/10 to-carbon-card rounded-xl border border-pink-primary/20 overflow-hidden flex flex-col items-center relative text-center group shadow-md shadow-pink-primary/5"
                                >
                                  {/* Delete button (accessible to controllers) */}
                                  {isController && (
                                    <button 
                                      onClick={() => removeAthleteFromEvent(event.id, athleteId, currentUser || undefined)} 
                                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-red-400 hover:text-white p-1 rounded-full z-20 transition-all cursor-pointer shadow-sm"
                                      title="นำนักกีฬาออกจากรายการ"
                                    >
                                      <X size={8} />
                                    </button>
                                  )}
                                  
                                  {/* Photo container */}
                                  <div className="w-full aspect-[3/4] relative bg-carbon-dark/50 flex items-center justify-center overflow-hidden border-b border-pink-primary/10">
                                    {athlete.avatar ? (
                                      <img 
                                        src={athlete.avatar} 
                                        alt={athlete.fullname} 
                                        className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-text-tertiary p-1.5">
                                        <User size={24} className="opacity-40 text-pink-primary" />
                                        <span className="text-[8px] mt-1 text-center font-medium opacity-60">ไม่มีรูป</span>
                                      </div>
                                    )}
                                    
                                    {/* Upload photo overlay (accessible to controllers or the student itself) */}
                                    {(isController || currentUser?.id === athleteId) && (
                                      <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-[8px] text-white cursor-pointer z-10">
                                        <Plus size={12} className="text-pink-primary" />
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

                                  {/* Athlete Details */}
                                  <div className="p-1 w-full flex flex-col justify-center bg-carbon-card/90">
                                    <span 
                                      className="text-[10px] font-bold text-white truncate max-w-full px-0.5 block" 
                                      title={athlete.fullname}
                                    >
                                      {shortName}
                                    </span>
                                    <span className="text-[8px] text-pink-accent font-semibold block">
                                      {athlete.classroom} {athlete.number ? `เลขที่ ${athlete.number}` : ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <select onChange={(e) => {
                        if (e.target.value) {
                          assignAthleteToEvent(event.id, e.target.value, currentUser || undefined);
                          e.currentTarget.value = '';
                        }
                      }} className="w-full bg-carbon-card border border-pink-primary/10 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-pink-primary text-text-secondary cursor-pointer">
                        <option value="">-- ดึงชื่อผู้สมัครนักกีฬาลงตาราง --</option>
                        {eligibleAthletes.map((athlete: Student) => (
                          <option key={athlete.id} value={athlete.id}>{athlete.fullname} ({athlete.classroom} เลขที่ {athlete.number})</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </Panel>
            )}

            {/* Roles Management Tab */}
            {adminSubTab === 'roles' && isSuperController && (
              <Panel title="🛡️ จัดการสิทธิ์การทำงาน (สิทธิ์ผู้ควบคุมและผู้ดูแล)">
                <div className="space-y-6">
                  {/* Status/Error Messages */}
                  {rolesError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                      <span>⚠️ {rolesError}</span>
                    </div>
                  )}
                  {rolesSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2">
                      <span>✓ {rolesSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    {/* 1. Controllers (ผู้ควบคุม) Panel */}
                    <div className="bg-carbon-dark/40 border border-pink-primary/10 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-primary animate-pulse" />
                        รายชื่อผู้ควบคุม (Super Admin)
                      </h3>
                      <p className="text-xs text-text-secondary mb-4">ผู้ควบคุมสามารถตั้งค่าระบบและจัดการสิทธิ์ของทุกคนได้</p>
                      
                      {/* Controllers List */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4 pr-1 scrollbar-thin">
                        {data.controllers.map((id: string) => {
                          const student = data.students.find((s: Student) => s.id === id);
                          return (
                            <div key={id} className="flex items-center justify-between bg-carbon-card/50 p-2.5 rounded-xl border border-pink-primary/5">
                              <div>
                                <span className="font-semibold text-xs text-white block">{student ? student.fullname : `รหัสประจำตัว: ${id}`}</span>
                                <span className="text-[10px] text-text-secondary">{student ? `${student.classroom} · รหัส: ${student.id}` : `ไม่พบข้อมูลโปรไฟล์`}</span>
                              </div>
                              {id !== currentUser?.id && (
                                <button
                                  onClick={() => {
                                    if (confirm(`คุณต้องการถอนสิทธิ์ผู้ควบคุมของ ${student ? student.fullname : id} ใช่หรือไม่?`)) {
                                      const nextControllers = data.controllers.filter((c: string) => c !== id);
                                      saveSystemConfig({ controllers: nextControllers }, currentUser || undefined, `ถอนสิทธิ์ผู้ควบคุมของ ${student ? student.fullname : id} (รหัส: ${id})`);
                                      setRolesSuccess(`ถอนสิทธิ์ผู้ควบคุมสำเร็จ`);
                                      setTimeout(() => setRolesSuccess(''), 3000);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-500 text-xs font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  ถอนสิทธิ์
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Controller Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={5}
                          value={newControllerId}
                          onChange={(e) => setNewControllerId(e.target.value.replace(/\D/g, ''))}
                          placeholder="รหัสนักเรียน 5 หลัก"
                          className="bg-carbon-card border border-pink-primary/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-primary text-white flex-1 font-mono"
                        />
                        <button
                          onClick={() => {
                            setRolesError('');
                            const id = newControllerId.trim();
                            if (id.length !== 5) {
                              setRolesError('รหัสนักเรียนต้องมี 5 หลัก');
                              return;
                            }
                            if (data.controllers.includes(id)) {
                              setRolesError('รหัสนี้เป็นผู้ควบคุมอยู่แล้ว');
                              return;
                            }
                            const student = data.students.find((s: Student) => s.id === id);
                            if (!student) {
                              setRolesError('ไม่พบรหัสนักเรียนนี้ในทะเบียนสี กรุณาเพิ่มสมาชิกเข้าระบบก่อน');
                              return;
                            }
                            const nextControllers = [...data.controllers, id];
                            const nextModerators = (data.moderators || []).filter((m: string) => m !== id);
                            saveSystemConfig({ controllers: nextControllers, moderators: nextModerators }, currentUser || undefined, `แต่งตั้งเป็นผู้ควบคุม: ${student.fullname} (รหัส: ${id})`);
                            setNewControllerId('');
                            setRolesSuccess(`แต่งตั้ง ${student.fullname} เป็นผู้ควบคุมสำเร็จ`);
                            setTimeout(() => setRolesSuccess(''), 3000);
                          }}
                          className="bg-pink-primary hover:bg-pink-accent text-white px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          แต่งตั้ง
                        </button>
                      </div>
                    </div>

                    {/* 2. Moderators (ผู้ดูแล) Panel */}
                    <div className="bg-carbon-dark/40 border border-pink-primary/10 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        รายชื่อผู้ดูแล (Moderator)
                      </h3>
                      <p className="text-xs text-text-secondary mb-4">ผู้ดูแลทำหน้าที่มอบหมายและอนุมัติงาน แต่ไม่สามารถเพิ่ม/ลบสมาชิกหรือจัดสแตนได้</p>
                      
                      {/* Moderators List */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4 pr-1 scrollbar-thin">
                        {(data.moderators || []).length > 0 ? (
                          (data.moderators || []).map((id: string) => {
                            const student = data.students.find((s: Student) => s.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between bg-carbon-card/50 p-2.5 rounded-xl border border-pink-primary/5">
                                <div>
                                  <span className="font-semibold text-xs text-white block">{student ? student.fullname : `รหัสประจำตัว: ${id}`}</span>
                                  <span className="text-[10px] text-text-secondary">{student ? `${student.classroom} · รหัส: ${student.id}` : `ไม่พบข้อมูลโปรไฟล์`}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm(`คุณต้องการถอนสิทธิ์ผู้ดูแลของ ${student ? student.fullname : id} ใช่หรือไม่?`)) {
                                      const nextModerators = (data.moderators || []).filter((m: string) => m !== id);
                                      saveSystemConfig({ moderators: nextModerators }, currentUser || undefined, `ถอนสิทธิ์ผู้ดูแลของ ${student ? student.fullname : id} (รหัส: ${id})`);
                                      setRolesSuccess(`ถอนสิทธิ์ผู้ดูแลสำเร็จ`);
                                      setTimeout(() => setRolesSuccess(''), 3000);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-500 text-xs font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  ถอนสิทธิ์
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-xs text-text-tertiary">
                            ยังไม่มีผู้ดูแลระบบ (เพิ่มได้ที่ช่องกรอกด้านล่าง)
                          </div>
                        )}
                      </div>

                      {/* Add Moderator Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={5}
                          value={newModeratorId}
                          onChange={(e) => setNewModeratorId(e.target.value.replace(/\D/g, ''))}
                          placeholder="รหัสนักเรียน 5 หลัก"
                          className="bg-carbon-card border border-pink-primary/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-primary text-white flex-1 font-mono"
                        />
                        <button
                          onClick={() => {
                            setRolesError('');
                            const id = newModeratorId.trim();
                            if (id.length !== 5) {
                              setRolesError('รหัสนักเรียนต้องมี 5 หลัก');
                              return;
                            }
                            if ((data.moderators || []).includes(id)) {
                              setRolesError('รหัสนี้เป็นผู้ดูแลอยู่แล้ว');
                              return;
                            }
                            if (data.controllers.includes(id)) {
                              setRolesError('รหัสนี้เป็นผู้ควบคุมอยู่แล้ว ไม่จำเป็นต้องแต่งตั้งเป็นผู้ดูแล');
                              return;
                            }
                            const student = data.students.find((s: Student) => s.id === id);
                            if (!student) {
                              setRolesError('ไม่พบรหัสนักเรียนนี้ในทะเบียนสี กรุณาเพิ่มสมาชิกเข้าระบบก่อน');
                              return;
                            }
                            const nextModerators = [...(data.moderators || []), id];
                            saveSystemConfig({ moderators: nextModerators }, currentUser || undefined, `แต่งตั้งเป็นผู้ดูแล: ${student.fullname} (รหัส: ${id})`);
                            setNewModeratorId('');
                            setRolesSuccess(`แต่งตั้ง ${student.fullname} เป็นผู้ดูแลสำเร็จ`);
                            setTimeout(() => setRolesSuccess(''), 3000);
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          แต่งตั้ง
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* Controller Action Log History Panel */}
            {adminSubTab === 'logs' && (
            <Panel title="📝 ประวัติการบันทึกข้อมูลการทำงาน (Log History)">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-pink-primary/10">
                <span className="text-xs text-text-secondary">ประวัติกิจกรรมและการบันทึกข้อมูลทั้งหมดในระบบ</span>
                <button
                  onClick={handleExportLogsToCSV}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-md shadow-green-600/10 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer w-max"
                >
                  📥 ส่งออก Log เป็น CSV
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs sm:text-sm">
                {data.logs.length === 0 ? (
                  <p className="text-text-tertiary text-center italic py-4">ยังไม่มีประวัติการบันทึกกิจกรรมในระบบ</p>
                ) : (
                  data.logs.map((log) => (
                    <div key={log.id} className="bg-carbon-dark border border-pink-primary/5 rounded-xl p-3 hover:border-pink-primary/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-2">
                        <span className="bg-pink-primary/10 text-pink-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                          {log.actorRole}
                        </span>
                        <span className="font-bold text-white">{log.actorName}</span>
                        <span className="text-text-secondary">{log.action}</span>
                        {log.targetName && (
                          <span className="text-pink-primary font-medium">({log.targetName})</span>
                        )}
                      </div>
                      <span className="text-text-tertiary text-[10px] sm:text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Panel>
            )}

            {/* Popup Add Sport Modal */}
            {showSportsModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
                  <button 
                    onClick={() => {
                      setShowSportsModal(false);
                      setNewEventName('');
                    }} 
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-4">เพิ่มรายการแข่งขันกีฬาใหม่</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ชื่อรายการแข่งขัน</label>
                      <input 
                        value={newEventName} 
                        onChange={(e) => setNewEventName(e.target.value)} 
                        placeholder="เช่น วิ่ง 100 เมตร, ฟุตบอล, บาสเกตบอล" 
                        className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ประเภทการแข่งขัน</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['ลู่', 'ลาน', 'ทั่วไป'].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setNewEventSubcategory(sub)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                              newEventSubcategory === sub
                                ? 'bg-pink-primary/25 border-pink-primary text-pink-accent'
                                : 'bg-carbon-dark border-pink-primary/10 text-text-secondary hover:text-white'
                            }`}
                          >
                            {sub === 'ทั่วไป' ? 'ทั่วไป (ไม่ใช่กรีฑา)' : `กรีฑาประเภท${sub}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">เพศ</label>
                        <select
                          value={newEventGender}
                          onChange={(e) => setNewEventGender(e.target.value)}
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-primary text-white cursor-pointer"
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="ผสม">ผสม (Co-ed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">จำนวนผู้เล่น (คน)</label>
                        <input
                          type="number"
                          min="1"
                          value={newEventLimit}
                          onChange={(e) => setNewEventLimit(e.target.value)}
                          placeholder="เช่น 1 หรือ 11"
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setShowSportsModal(false);
                          setNewEventName('');
                        }} 
                        className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={() => {
                          if (!newEventName.trim()) return;
                          
                          // สร้างชื่อรายการกีฬาแบบอัตโนมัติ: "ชื่อการแข่งขัน เพศ (จำนวนคน) [ถ้ามี ลู่/ลาน]"
                          // เช่น: วิ่ง 100 เมตร ชาย (1 คน) (ประเภทลู่)
                          let formattedName = `${newEventName.trim()} ${newEventGender}`;
                          if (newEventLimit && parseInt(newEventLimit) > 0) {
                            formattedName += ` (${newEventLimit} คน)`;
                          }
                          if (newEventSubcategory !== 'ทั่วไป') {
                            formattedName += ` (ประเภท${newEventSubcategory})`;
                          }

                          // กำหนด category อัตโนมัติเป็น กรีฑา ถ้าเป็นประเภทลู่/ลาน นอกนั้นให้เป็นชื่อหลัก/ทั่วไป
                          const finalCategory = newEventSubcategory === 'ทั่วไป' ? 'กีฬา' : 'กรีฑา';

                          addSportsEvent(formattedName, finalCategory, currentUser || undefined);
                          setNewEventName('');
                          setNewEventLimit('1');
                          setShowSportsModal(false);
                        }} 
                        className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                      >
                        เพิ่มรายการกีฬา
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popup Add Special Duty Modal */}
            {showDutyModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative">
                  <button 
                    onClick={() => {
                      setShowDutyModal(false);
                      setNewDutyTitle('');
                      setNewDutyLimit('10');
                      setNewDutyLineLink('');
                      setNewDutyQr('');
                    }} 
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-4">เพิ่มตำแหน่งหน้าที่พิเศษใหม่</h3>
                  <form onSubmit={addSpecialDuty} className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">ชื่อตำแหน่งหน้าที่</label>
                      <input 
                        value={newDutyTitle} 
                        onChange={(e) => setNewDutyTitle(e.target.value)} 
                        placeholder="เช่น ฝ่ายฉาก, สตาฟคุมสแตน" 
                        className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">จำนวนรับสมัคร (คน)</label>
                        <input 
                          type="number" 
                          value={newDutyLimit} 
                          onChange={(e) => setNewDutyLimit(e.target.value)} 
                          placeholder="เช่น 10" 
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">ลิงก์กลุ่มไลน์</label>
                        <input 
                          value={newDutyLineLink} 
                          onChange={(e) => setNewDutyLineLink(e.target.value)} 
                          placeholder="ลิงก์กลุ่มข่าวสาร" 
                          className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-text-secondary block mb-1.5">รูปภาพ QR Code กลุ่ม</label>
                      <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                        <ImageIcon size={16} className="text-pink-primary" /> {newDutyQr ? 'เปลี่ยนรูป QR Code' : 'อัปโหลดรูปภาพ QR Code'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) setNewDutyQr(await fileToDataUrl(file));
                          }} 
                        />
                      </label>
                    </div>

                    {newDutyQr && (
                      <div className="relative mx-auto w-max">
                        <img src={newDutyQr} alt="QR หน้าที่ใหม่" className="max-h-32 rounded-lg border border-pink-primary/10" />
                        <button type="button" onClick={() => setNewDutyQr('')} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowDutyModal(false);
                          setNewDutyTitle('');
                          setNewDutyLimit('10');
                          setNewDutyLineLink('');
                          setNewDutyQr('');
                        }} 
                        className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="submit"
                        onClick={(e) => {
                          addSpecialDuty(e);
                          setShowDutyModal(false);
                        }}
                        className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                      >
                        เพิ่มตำแหน่งหน้าที่
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </section>
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

        {editingSpecialDuty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-carbon-card border border-pink-primary/20 rounded-3xl p-6 shadow-2xl relative font-semibold text-white">
              <button 
                onClick={() => {
                  setEditingSpecialDuty(null);
                  setEditDutyTitle('');
                  setEditDutyLimit('');
                  setEditDutyLineLink('');
                  setEditDutyQr('');
                }} 
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-lg font-bold text-white mb-4 font-sans">⚙️ แก้ไขตำแหน่งหน้าที่พิเศษ</h3>
              
              <form onSubmit={updateSpecialDuty} className="space-y-4 font-sans">
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-bold">ชื่อตำแหน่งหน้าที่</label>
                  <input 
                    value={editDutyTitle} 
                    onChange={(e) => setEditDutyTitle(e.target.value)} 
                    placeholder="เช่น ฝ่ายฉาก, สตาฟคุมสแตน" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-bold">จำนวนที่รับสมัคร (คน)</label>
                  <input 
                    type="number"
                    value={editDutyLimit} 
                    onChange={(e) => setEditDutyLimit(e.target.value)} 
                    placeholder="ใส่ 0 หรือเว้นว่างเพื่อรับไม่จำกัด" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-bold">ลิงก์กลุ่มไลน์หน้าที่พิเศษ (Line Link)</label>
                  <input 
                    type="text"
                    value={editDutyLineLink} 
                    onChange={(e) => setEditDutyLineLink(e.target.value)} 
                    placeholder="ลิงก์กลุ่มไลน์ส่งงานสตาฟ (ถ้ามี)" 
                    className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white" 
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1.5 font-bold">รูปภาพ QR Code กลุ่มไลน์</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-carbon-dark border border-dashed border-pink-primary/20 rounded-xl py-4 cursor-pointer hover:border-pink-primary/50 text-xs text-text-secondary hover:text-white transition-all">
                    <ImageIcon size={16} className="text-pink-primary" /> เลือกรูป QR Code
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditDutyQr(await fileToDataUrl(file));
                    }} />
                  </label>
                </div>

                {editDutyQr && (
                  <div className="relative mx-auto w-max bg-carbon-dark/50 p-2 rounded-xl border border-pink-primary/10">
                    <img src={editDutyQr} alt="QR Code Preview" className="w-[120px] h-[120px] object-contain rounded-lg" />
                    <button 
                      type="button" 
                      onClick={() => setEditDutyQr('')}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingSpecialDuty(null);
                      setEditDutyTitle('');
                      setEditDutyLimit('');
                      setEditDutyLineLink('');
                      setEditDutyQr('');
                    }} 
                    className="flex-1 bg-carbon-light hover:bg-carbon-dark border border-pink-primary/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-pink-primary hover:bg-pink-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-primary/20"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
                {currentSong.segments[activeSegmentIndex]?.words.map((w, wIdx) => {
                  const resolvedVisuals = getResolvedVisuals(currentSong, activeSegmentIndex, wIdx);
                  return (
                    <div key={wIdx} className="bg-carbon-dark border border-pink-primary/10 rounded-2xl p-4 flex flex-col items-center space-y-3">
                      <div className="text-center">
                        <span className="text-xs text-text-tertiary">คำที่ {wIdx + 1}</span>
                        <h4 className="text-lg font-bold text-pink-accent mt-0.5">{w.text}</h4>
                      </div>
                      
                      {/* Mini Seating Grid */}
                      <div className="w-full aspect-[20/9] max-w-xs bg-carbon-light/30 border border-pink-primary/5 p-2 rounded-xl">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '1px' }} className="w-full h-full">
                          {rows.map(row => 
                            columns.map(col => {
                              const seatLabel = `${row}${col}`;
                              const val = resolvedVisuals[seatLabel] || '';
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
                })}
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
    </main>
  );
}

// Panel — imported from components/ui

// StatCard — imported from components/ui

// MiniCount — imported from components/ui

// DutyCard — imported from components/ui

// SeatGrid — imported from components/ui/SeatGrid

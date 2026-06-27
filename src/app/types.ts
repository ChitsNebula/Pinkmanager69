// src/app/types.ts
// Central type definitions extracted from page.tsx

// ─── Navigation ──────────────────────────────────────────────────────────────
export type Tab =
  | 'dashboard'
  | 'apply'
  | 'announcements'
  | 'registry'
  | 'choreo'
  | 'admin'
  | 'reports'
  | 'athlete_events';

// ─── Arm Pose ─────────────────────────────────────────────────────────────────
export interface ArmPose {
  upperArmAngle: number;
  forearmAngle: number;
  handAngle: number;
}

export interface ArmPoseEquipment {
  type: 'arm_pose';
  name: string;
  color: string;
  leftArm: ArmPose;
  rightArm: ArmPose;
  isSymmetric: boolean;
  armThickness?: number;
  armLength?: number;
  centerX?: number;
  centerY?: number;
  shoulderDistance?: number;
}

// ─── Card Stunt / Playback ────────────────────────────────────────────────────
export interface SubSegment {
  segmentIndex: number;
  wordText: string;
  segId: string;
  wordIdx: number;
}

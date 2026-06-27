import React from 'react';
import { ArmPoseEquipment } from '../../app/types';

interface ArmPoseMiniSVGProps {
  pose: ArmPoseEquipment;
  className?: string;
}

export const ArmPoseMiniSVG: React.FC<ArmPoseMiniSVGProps> = ({ pose, className }) => {
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

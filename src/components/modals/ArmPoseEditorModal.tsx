import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ArmPose, ArmPoseEquipment } from '../../app/types';
import { ArmPoseMiniSVG } from '../ui/ArmPoseMiniSVG';

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

export function ArmPoseEditorModal({ isOpen, onClose, onSave }: ArmPoseEditorModalProps) {
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

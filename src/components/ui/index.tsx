'use client';

import React from 'react';

// ─── Panel ────────────────────────────────────────────────────────────────────
export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-carbon-card border border-pink-primary/10 rounded-2xl p-5 shadow">
      <h2 className="text-lg font-bold text-pink-primary mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-carbon-card border border-pink-primary/10 rounded-xl flex items-center gap-3 shadow">
      <div className="w-10 h-10 rounded-lg bg-pink-primary/10 flex items-center justify-center text-pink-primary">
        {icon}
      </div>
      <div>
        <span className="block text-xl font-bold text-text-primary">{value}</span>
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
    </div>
  );
}

// ─── MiniCount ────────────────────────────────────────────────────────────────
export function MiniCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-carbon-card border border-pink-primary/10 rounded-xl p-3">
      <p className="text-lg font-bold text-white">{count}</p>
      <p className="text-[11px] text-text-secondary truncate">{label}</p>
    </div>
  );
}

// ─── DutyCard ─────────────────────────────────────────────────────────────────
export function DutyCard({
  title,
  description,
  count,
  limit,
  disabled,
  active,
  onApply,
  onCancel,
  qrCode,
  lineLink,
}: {
  title: string;
  description: string;
  count: number;
  limit?: number;
  disabled: boolean;
  active: boolean;
  onApply: () => void;
  onCancel: () => void;
  qrCode?: string;
  lineLink?: string;
}) {
  return (
    <div
      className={`bg-carbon-card border rounded-2xl p-5 shadow space-y-4 ${
        active ? 'border-pink-primary/60' : 'border-pink-primary/10'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        </div>
        <span className="text-xs text-pink-primary bg-pink-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
          {limit ? (limit === 9999 ? `${count} คน` : `${count}/${limit} คน`) : `${count} คน`}
        </span>
      </div>
      {active ? (
        <div className="space-y-3">
          <div className="text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20 text-sm font-semibold">
            คุณสมัครหน้าที่นี้แล้ว
          </div>
          {(qrCode || lineLink) && (
            <div className="bg-carbon-dark rounded-xl border border-pink-primary/5 p-3 space-y-2">
              {qrCode && (
                <img
                  src={qrCode}
                  alt={`QR ${title}`}
                  className="max-h-44 rounded-lg mx-auto border border-pink-primary/10"
                />
              )}
              {lineLink && (
                <a
                  href={lineLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-sm text-pink-primary hover:text-pink-accent font-semibold"
                >
                  เข้ากลุ่มติดตามข่าวสาร
                </a>
              )}
            </div>
          )}
          <button
            onClick={onCancel}
            className="w-full bg-carbon-light hover:bg-carbon-dark text-red-400 border border-red-500/20 py-2 rounded-lg text-sm font-semibold"
          >
            ยกเลิกใบสมัคร
          </button>
        </div>
      ) : (
        <button
          onClick={onApply}
          disabled={disabled}
          className="w-full bg-pink-primary hover:bg-pink-accent disabled:bg-carbon-light disabled:text-text-tertiary disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          สมัครหน้าที่นี้
        </button>
      )}
    </div>
  );
}

export { ErrorBoundary } from './ErrorBoundary';


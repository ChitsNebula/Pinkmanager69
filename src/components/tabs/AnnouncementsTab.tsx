'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Announcement } from '../../app/store';
import { Panel } from '../ui';
import { fileToDataUrl } from '../../lib/helpers';

interface AnnouncementsTabProps {
  data: { announcements: Announcement[] };
  isController: boolean;
  newAnnouncementTitle: string;
  setNewAnnouncementTitle: (val: string) => void;
  newAnnouncementContent: string;
  setNewAnnouncementContent: (val: string) => void;
  newAnnouncementImage: string;
  setNewAnnouncementImage: (val: string) => void;
  addAnnouncement: (e: React.FormEvent) => void;
}

export function AnnouncementsTab({
  data,
  isController,
  newAnnouncementTitle,
  setNewAnnouncementTitle,
  newAnnouncementContent,
  setNewAnnouncementContent,
  newAnnouncementImage,
  setNewAnnouncementImage,
  addAnnouncement,
}: AnnouncementsTabProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">ประกาศสีชมพู</h2>
        <p className="text-sm text-text-secondary">
          สมาชิกอ่านได้ทุกคน ผู้ควบคุมเท่านั้นที่เพิ่มประกาศและแนบรูปได้
        </p>
      </div>

      {isController && (
        <Panel title="เพิ่มประกาศ">
          <form onSubmit={addAnnouncement} className="space-y-4">
            <input
              value={newAnnouncementTitle}
              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
              placeholder="หัวข้อประกาศ"
              className="w-full bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
              required
            />
            <textarea
              value={newAnnouncementContent}
              onChange={(e) => setNewAnnouncementContent(e.target.value)}
              placeholder="รายละเอียดประกาศ"
              className="w-full min-h-28 bg-carbon-dark border border-pink-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-primary text-white"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-carbon-dark border border-pink-primary/10 rounded-lg px-3 py-2 text-xs cursor-pointer hover:border-pink-primary/50">
                <ImageIcon size={16} /> แนบรูป
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setNewAnnouncementImage(await fileToDataUrl(file));
                  }}
                />
              </label>
              {newAnnouncementImage && (
                <button
                  type="button"
                  onClick={() => setNewAnnouncementImage('')}
                  className="text-xs text-red-400"
                >
                  ลบรูป
                </button>
              )}
              <button className="ml-auto bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
                เพิ่มประกาศ
              </button>
            </div>
            {newAnnouncementImage && (
              <img
                src={newAnnouncementImage}
                alt="preview"
                className="max-h-64 rounded-xl border border-pink-primary/10 object-cover"
              />
            )}
          </form>
        </Panel>
      )}

      <div className="space-y-4">
        {data.announcements.map((item: Announcement) => (
          <article
            key={item.id}
            className="bg-carbon-card border border-pink-primary/10 rounded-2xl overflow-hidden shadow"
          >
            {item.image && (
              <img
                src={item.image}
                alt=""
                className="w-full max-h-[500px] object-contain bg-carbon-dark/80"
              />
            )}
            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
                <span className="text-[11px] text-text-tertiary">{item.date}</span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{item.content}</p>
              <p className="text-xs text-pink-primary mt-3">โดย {item.createdBy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

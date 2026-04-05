"use client";

import RichTextArea from "@/components/resume/RichTextArea";
import type { CoverLetterData, CoverLetterProfile } from "@/types/coverLetter";

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-white/70">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
      />
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wide text-white/50">{children}</div>;
}

export const STARTER_BODY = `<p>I am writing to express my strong interest in the role. With my background and skills aligned with your team’s needs, I am excited about the opportunity to contribute.</p><p>In my recent experience, I have focused on delivering clear impact through collaboration and ownership. I would welcome the chance to discuss how I can support your goals.</p><p>Thank you for your time and consideration. I look forward to hearing from you.</p>`;

type Props = {
  letter: CoverLetterData;
  onChange: (patch: Partial<CoverLetterData>) => void;
  onProfileChange: (patch: Partial<CoverLetterProfile>) => void;
  onInsertStarter: () => void;
};

export default function CoverLetterForm({ letter, onChange, onProfileChange, onInsertStarter }: Props) {
  const p = letter.profile;

  return (
    <div className="space-y-5">

      <div className="rounded-2xl border border-white/10 p-4">
        <SectionTitle>Date</SectionTitle>
        <p className="mt-1 text-[11px] text-white/45">Leave empty to hide the date on the preview.</p>
        <div className="mt-3">
          <TextInput
            label=""
            value={letter.dateStr}
            onChange={(v) => onChange({ dateStr: v })}
            placeholder="e.g. April 4, 2026"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4">
        <SectionTitle>Profile</SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput label="Full name" value={p.fullName} onChange={(v) => onProfileChange({ fullName: v })} />
          <TextInput label="Location" value={p.location} onChange={(v) => onProfileChange({ location: v })} />
          <TextInput label="Phone" value={p.phone} onChange={(v) => onProfileChange({ phone: v })} />
          <TextInput label="Email" value={p.email} onChange={(v) => onProfileChange({ email: v })} />
          <TextInput label="LinkedIn" value={p.linkedin} onChange={(v) => onProfileChange({ linkedin: v })} placeholder="URL" />
          <TextInput label="GitHub" value={p.github} onChange={(v) => onProfileChange({ github: v })} placeholder="URL" />
          <div className="sm:col-span-2">
            <TextInput label="Portfolio" value={p.portfolio} onChange={(v) => onProfileChange({ portfolio: v })} placeholder="URL" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4">
        <SectionTitle>Recipient</SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput label="Name" value={letter.recipientName} onChange={(v) => onChange({ recipientName: v })} placeholder="e.g. Jane Smith" />
          <TextInput label="Title" value={letter.recipientTitle} onChange={(v) => onChange({ recipientTitle: v })} placeholder="e.g. Hiring Manager" />
          <div className="sm:col-span-2">
            <TextInput label="Company" value={letter.companyName} onChange={(v) => onChange({ companyName: v })} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4">
        <SectionTitle>Salutation</SectionTitle>
        <div className="mt-3">
          <TextInput label="Salutation" value={letter.salutation} onChange={(v) => onChange({ salutation: v })} placeholder="Dear Hiring Manager," />
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onInsertStarter}
          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/15"
        >
          Insert starter paragraphs
        </button>
        <RichTextArea
          label="Body"
          value={letter.bodyHtml}
          onChange={(v) => onChange({ bodyHtml: v })}
          placeholder="Write why you fit this role — 3 short paragraphs work well."
        />
      </div>

      <TextInput label="Closing line" value={letter.closingLine} onChange={(v) => onChange({ closingLine: v })} placeholder="Sincerely," />

      <TextInput label="Signature" value={letter.signature} onChange={(v) => onChange({ signature: v })} placeholder="Your name" />
    </div>
  );
}

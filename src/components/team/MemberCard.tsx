'use client';

import type { Member } from '@/types/team';
import { accentClasses, getWorkgroup } from '@/lib/team';
import Avatar from './Avatar';

interface MemberCardProps {
  member: Member;
  onOpen: (member: Member, trigger: HTMLButtonElement) => void;
}

export default function MemberCard({ member, onOpen }: MemberCardProps) {
  const group = getWorkgroup(member.teamId);
  const accent = accentClasses[group.accent];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-brand-blue has-[button:focus-visible]:ring-offset-2">
      <Avatar
        src={member.photo}
        name={member.name}
        sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw"
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${accent.tag}`}>
          <span aria-hidden="true" className={`size-1.5 rounded-full ${accent.dot}`} />
          {group.name}
        </span>
        <h4 className="mt-3 text-lg leading-snug font-bold text-ink">{member.name}</h4>
        <p className="mt-0.5 text-sm font-medium text-muted">{member.company}</p>
        <p className="mt-1 text-sm text-subtle">{member.role}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{member.summary}</p>
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={(e) => onOpen(member, e.currentTarget)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full text-sm font-semibold text-brand-blue focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-brand-blue-strong"
          >
            Lihat Profil
            <span className="sr-only"> {member.name}</span>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none" className="transition-transform motion-safe:group-hover:translate-x-0.5">
              <path d="M5 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

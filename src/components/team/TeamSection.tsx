'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { site } from '@/config/site';
import { members, workgroups } from '@/data/team';
import type { Member } from '@/types/team';
import TeamFilter, { type FilterValue } from './TeamFilter';
import MemberCard from './MemberCard';
import MemberDetail from './MemberDetail';

interface TeamSectionProps {
  /** Sorotan mentor, tampil paling awal. */
  mentors?: React.ReactNode;
  /** Asisten kelas, tampil setelah daftar anggota. */
  assistants?: React.ReactNode;
}

export default function TeamSection({ mentors, assistants }: TeamSectionProps) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selected, setSelected] = useState<Member | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const counts = useMemo(() => {
    const result = { all: members.length } as Record<FilterValue, number>;
    for (const g of workgroups) result[g.id] = members.filter((m) => m.teamId === g.id).length;
    return result;
  }, []);

  const visible = filter === 'all' ? members : members.filter((m) => m.teamId === filter);
  const filterLabel = filter === 'all' ? 'semua tim' : workgroups.find((g) => g.id === filter)?.name;

  const open = useCallback((member: Member, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelected(member);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    // Kembalikan fokus ke tombol kartu yang membuka panel.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <section id="tim" aria-labelledby="tim-title" className="bg-canvas py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.12em] text-brand-blue uppercase sm:text-[13px]">Profil Personel</p>
          <h2 id="tim-title" className="mt-3 text-3xl leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
            {site.team.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{site.team.description}</p>
        </div>

        {mentors}

        <div className="mt-16 sm:mt-20">
          <h3 id="anggota-title" className="text-2xl leading-tight font-extrabold tracking-[-0.015em] text-ink sm:text-3xl">
            {site.team.membersTitle}
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{site.team.membersDescription}</p>
        </div>

        <div className="mt-8">
          <TeamFilter groups={workgroups} counts={counts} value={filter} onChange={setFilter} />
          <p aria-live="polite" className="mt-4 text-sm text-subtle">
            Menampilkan {visible.length} anggota — {filterLabel}
          </p>
        </div>

        <ul aria-labelledby="anggota-title" className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} onOpen={open} />
            </li>
          ))}
        </ul>

        {assistants}
      </div>

      <MemberDetail member={selected} onClose={close} />
    </section>
  );
}

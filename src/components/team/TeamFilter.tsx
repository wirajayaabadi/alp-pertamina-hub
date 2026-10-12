'use client';

import type { TeamId, Workgroup } from '@/types/team';
import { accentClasses } from '@/lib/team';

export type FilterValue = 'all' | TeamId;

interface TeamFilterProps {
  groups: Workgroup[];
  counts: Record<FilterValue, number>;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

/** Chip pada layar lebar, dropdown ringkas pada ponsel. Keduanya berbagi state yang sama. */
export default function TeamFilter({ groups, counts, value, onChange }: TeamFilterProps) {
  const options: Array<{ id: FilterValue; label: string; dot?: string }> = [
    { id: 'all', label: 'Semua Tim' },
    ...groups.map((g) => ({ id: g.id, label: g.name, dot: accentClasses[g.accent].dot })),
  ];

  return (
    <div>
      <label className="block sm:hidden">
        <span className="mb-2 block text-sm font-semibold text-ink">Filter kelompok kerja</span>
        <span className="relative block">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as FilterValue)}
            className="min-h-12 w-full appearance-none rounded-xl border border-line bg-white py-3 pr-10 pl-4 text-base font-medium text-ink shadow-card"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} ({counts[o.id]})
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-subtle"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>

      <div role="group" aria-label="Filter kelompok kerja" className="hidden flex-wrap gap-2 sm:flex">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                active
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-muted hover:border-subtle/50 hover:text-ink'
              }`}
            >
              {o.dot && <span aria-hidden="true" className={`size-2 rounded-full ${o.dot}`} />}
              {o.label}
              <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-subtle'}`}>{counts[o.id]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

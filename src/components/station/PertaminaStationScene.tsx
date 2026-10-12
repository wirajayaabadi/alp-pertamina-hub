'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { StationSceneController } from '@/lib/station/scene';
import StationFallback from './StationFallback';

type Status = 'loading' | 'ready' | 'error';

const SCENE_LABEL =
  'Miniatur 3D SPBU Pertamina: kanopi putih beraksen merah dengan logo Pertamina, dua dispenser BBM dengan selang, papan identitas SPBU, bangunan layanan, dan sebuah mobil yang masuk, berhenti di dispenser, lalu keluar.';

/**
 * Integrasi React dengan adegan Three.js. Modul 3D dimuat terpisah (dynamic import)
 * sehingga konten hero tidak menunggu three.js.
 */
export default function PertaminaStationScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<StationSceneController | null>(null);
  const reducedMotion = useReducedMotion();
  const reducedRef = useRef(reducedMotion);

  const [status, setStatus] = useState<Status>('loading');
  const [contextLost, setContextLost] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [canRotate, setCanRotate] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let controller: StationSceneController | null = null;

    (async () => {
      try {
        // Teks di canvas memakai font halaman; tunggu font siap terlebih dahulu.
        await document.fonts.ready;
        const { createStationScene } = await import('@/lib/station/scene');
        if (cancelled) return;
        controller = createStationScene(mount, {
          fontFamily: getComputedStyle(mount).fontFamily,
          logoSrc: site.brand.logoSrc,
          reducedMotion: reducedRef.current,
          onReady: () => !cancelled && setStatus('ready'),
          onContextLost: () => {
            if (cancelled) return;
            setContextLost(true);
            setStatus('error');
          },
          onContextRestored: () => {
            if (cancelled) return;
            setContextLost(false);
            setStatus('ready');
          },
          onPlayingChange: (next) => !cancelled && setPlaying(next),
          onViewChange: (next) => !cancelled && setRotated(next),
        });
        controllerRef.current = controller;
        setCanRotate(controller.canRotate);
        setPlaying(!reducedRef.current);
      } catch (error) {
        if (cancelled) return;
        console.error('SPBU 3D: adegan gagal dimulai', error);
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      controller?.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    reducedRef.current = reducedMotion;
    controllerRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  const ready = status === 'ready';
  const failed = status === 'error';

  return (
    <div className="scene-backdrop relative h-full w-full overflow-hidden sm:rounded-[28px]">
      <div
        ref={mountRef}
        role="img"
        aria-label={SCENE_LABEL}
        className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {status === 'loading' && (
        <div role="status" className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-muted shadow-card">
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-brand-blue/20 border-t-brand-blue motion-safe:animate-spin"
            />
            Menyiapkan SPBU 3D…
          </span>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col">
          <StationFallback className="min-h-0 flex-1" />
          <p role="status" className="mx-4 mb-4 self-center rounded-full bg-white/90 px-4 py-2 text-center text-xs font-medium text-muted shadow-card">
            {contextLost
              ? 'Tampilan 3D terhenti sementara. Ilustrasi statis ditampilkan hingga grafis pulih.'
              : 'Tampilan 3D tidak tersedia di perangkat ini. Menampilkan ilustrasi statis.'}
          </p>
        </div>
      )}

      {ready && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
          <p className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-muted shadow-card backdrop-blur">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${playing ? 'bg-brand-green' : 'bg-subtle'}`} />
            <span aria-live="polite">{playing ? 'Animasi berjalan' : 'Animasi dijeda'}</span>
            {canRotate && <span className="hidden text-subtle md:inline">· Seret untuk memutar</span>}
          </p>
          <div className="pointer-events-auto flex gap-2">
            {canRotate && rotated && (
              <button
                type="button"
                onClick={() => controllerRef.current?.resetView()}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-canvas"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10a6 6 0 1 0 1.8-4.3M4 4v3.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sudut awal
              </button>
            )}
            <button
              type="button"
              aria-label={playing ? 'Jeda animasi' : 'Putar animasi'}
              onClick={() => (playing ? controllerRef.current?.pause() : controllerRef.current?.play())}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-3.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-ink/85"
            >
              {playing ? (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="1.5" width="2.6" height="9" rx=".6" />
                  <rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" />
                </svg>
              ) : (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 1.6v8.8L10.4 6z" />
                </svg>
              )}
              <span aria-hidden="true">
                {playing ? 'Jeda' : 'Putar'}
                <span className="hidden sm:inline"> animasi</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

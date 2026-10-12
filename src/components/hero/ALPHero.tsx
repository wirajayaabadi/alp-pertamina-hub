import { site } from '@/config/site';
import PertaminaStationScene from '@/components/station/PertaminaStationScene';

/** Hero: teks & tombol sebagai HTML biasa (tetap tersedia saat adegan 3D dimuat atau gagal). */
export default function ALPHero() {
  const { label, title, description, cta, scrollHint } = site.hero;

  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col bg-gradient-to-b from-white via-white to-canvas pt-[var(--nav-h)]"
    >
      <div className="hero-grid mx-auto w-full max-w-7xl flex-1 gap-y-6 px-4 pt-8 pb-12 sm:px-6 sm:pt-10 lg:gap-y-8 lg:px-8 lg:py-10">
        <div className="hero-copy self-end">
          <p className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.12em] text-brand-blue uppercase sm:text-[13px]">
            <span aria-hidden="true" className="flex h-[3px] w-7 overflow-hidden rounded-full">
              <span className="flex-1 bg-brand-red" />
              <span className="flex-1 bg-brand-blue" />
              <span className="flex-1 bg-brand-green" />
            </span>
            {label}
          </p>
          <h1
            id="hero-title"
            className="mt-4 text-[2.25rem] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>
        </div>

        <div className="hero-scene -mx-4 sm:mx-0">
          <PertaminaStationScene />
        </div>

        <div className="hero-cta self-start">
          <a
            href="#tim"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand-red-strong px-7 text-base font-semibold text-white shadow-[0_10px_24px_-10px_rgb(208_20_43/0.7)] transition-colors hover:bg-brand-red-deep sm:w-auto"
          >
            {cta}
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 hidden lg:block [@media(max-height:780px)]:hidden"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 text-xs font-medium text-subtle">
          <span className="flex h-7 w-[18px] justify-center rounded-full border-2 border-subtle/50 pt-1">
            <span className="h-1.5 w-1 rounded-full bg-subtle" />
          </span>
          {scrollHint}
        </div>
      </div>
    </section>
  );
}

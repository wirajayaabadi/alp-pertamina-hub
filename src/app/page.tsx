import SiteHeader from '@/components/navigation/SiteHeader';
import ALPHero from '@/components/hero/ALPHero';
import TeamSection from '@/components/team/TeamSection';
import MentorSection from '@/components/mentors/MentorSection';
import SiteFooter from '@/components/footer/SiteFooter';

export default function HomePage() {
  return (
    <>
      <a
        href="#tim"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0"
      >
        Lewati ke profil tim
      </a>
      <SiteHeader />
      <main>
        <ALPHero />
        <TeamSection>
          <MentorSection />
        </TeamSection>
      </main>
      <SiteFooter />
    </>
  );
}

import { Link } from '@/i18n/routing';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './about.module.css';
import Gift from 'lucide-react/dist/esm/icons/gift';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Zap from 'lucide-react/dist/esm/icons/zap';
import UserX from 'lucide-react/dist/esm/icons/user-x';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Globe from 'lucide-react/dist/esm/icons/globe';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('about_title'),
    description: t('about_desc'),
    openGraph: {
      title: t('about_title'),
      description: t('about_desc'),
      url: `https://ilove-doc.com/${locale}/about`,
      siteName: 'iLoveDoc',
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `https://ilove-doc.com/${locale}/about`,
    },
  };
}

export default function AboutPage() {
  const tFooter = useTranslations('Footer');
  const tAbout = useTranslations('About');
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              {tFooter('about')}
            </h1>
            <p className={styles.heroSubtitle}>
              {tAbout('mission_title')}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{tAbout('mission_title')}</h2>
            <div className={styles.missionCard}>
              <p dangerouslySetInnerHTML={{ __html: tAbout.raw('mission_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tAbout.raw('mission_p2') }} />
            </div>
          </div>
        </section>

        {/* Ad slot under mission */}
        <AdUnit slot="about-mission-bottom" format="horizontal" />

        {/* Pourquoi iLoveDoc */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{tAbout('why_title')}</h2>
            <div className={styles.advantagesGrid}>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Gift size={40} color="#7c3aed" />
                </div>
                <h3>{tAbout('why_1_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('why_1_desc') }} />
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Lock size={40} color="#f97316" />
                </div>
                <h3>{tAbout('why_2_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('why_2_desc') }} />
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Zap size={40} color="#eab308" />
                </div>
                <h3>{tAbout('why_3_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('why_3_desc') }} />
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <UserX size={40} color="#ef4444" />
                </div>
                <h3>{tAbout('why_4_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('why_4_desc') }} />
              </div>
            </div>
          </div>
        </section>

        {/* Expertise / E-E-A-T */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{tAbout('expertise_title')}</h2>
            <div className={styles.expertiseGrid}>
              <div className={styles.expertiseCard}>
                <h3>{tAbout('exp_1_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('exp_1_desc') }} />
              </div>
              <div className={styles.expertiseCard}>
                <h3>{tAbout('exp_2_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('exp_2_desc') }} />
              </div>
              <div className={styles.expertiseCard}>
                <h3>{tAbout('exp_3_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('exp_3_desc') }} />
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{tAbout('tech_title')}</h2>
            <div className={styles.techCard}>
              <div className={styles.techContent}>
                <h3>{tAbout('tech_subtitle')}</h3>
                <p dangerouslySetInnerHTML={{ __html: tAbout.raw('tech_desc') }} />
              </div>
              <div className={styles.techVisual}>
                <div className={styles.techDiagram}>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <FileText size={28} color="#7c3aed" />
                    </span>
                    <span>{tAbout('tech_step_1')}</span>
                  </div>
                  <div className={styles.diagramArrow}>→</div>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Globe size={28} color="#4f46e5" />
                    </span>
                    <span>{tAbout('tech_step_2')}</span>
                  </div>
                  <div className={styles.diagramArrow}>→</div>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <CheckCircle size={28} color="#10b981" />
                    </span>
                    <span>{tAbout('tech_step_3')}</span>
                  </div>
                </div>
                <p className={styles.techNote}>{tAbout('tech_note')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad slot under technology */}
        <AdUnit slot="about-technology-bottom" format="horizontal" />

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>{tAbout('cta_title')}</h2>
            <p className={styles.ctaText}>{tAbout('cta_desc')}</p>
            <Link href="/" className={styles.ctaButton}>
              {tAbout('cta_btn')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { Link } from '@/i18n/routing';
import Header from '@/components/common/Header';

import { getTranslations, setRequestLocale } from 'next-intl/server';
import Footer from '@/components/common/Footer';
import styles from './legal.module.css';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('privacy_title'),
    description: t('privacy_desc'),
    openGraph: {
      title: t('privacy_title'),
      description: t('privacy_desc'),
      url: `https://ilove-doc.com/${locale}/privacy`,
      siteName: 'iLoveDoc',
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `https://ilove-doc.com/${locale}/privacy`,
    },
  };
}

import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tFooter = await getTranslations({ locale, namespace: 'Footer' });
  const tPrivacy = await getTranslations({ locale, namespace: 'Privacy' });
  return (
    <>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>
              {tFooter('privacy')}
            </h1>

          </header>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>{tPrivacy('intro_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('intro_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('intro_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('data_title')}</h2>
              <h3>{tPrivacy('data_nav_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('data_nav_desc') }} />
              <div dangerouslySetInnerHTML={{ __html: tPrivacy.raw('data_nav_list') }} />

              <h3>{tPrivacy('data_form_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('data_form_desc') }} />

              <h3>{tPrivacy('data_pdf_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('data_pdf_desc') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('cookies_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_desc') }} />

              <h3>{tPrivacy('cookies_ess_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ess_desc') }} />

              <h3>{tPrivacy('cookies_ana_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ana_desc') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ana_link') }} />

              <h3>{tPrivacy('cookies_ads_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ads_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ads_p2') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ads_p3') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_ads_p4') }} />

              <h3>{tPrivacy('cookies_opt_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_opt_desc') }} />
              <div dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_opt_list') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('cookies_opt_note') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('adsense_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('adsense_desc') }} />
              <div dangerouslySetInnerHTML={{ __html: tPrivacy.raw('adsense_list') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('adsense_note') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('rgpd_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('rgpd_desc') }} />
              <div dangerouslySetInnerHTML={{ __html: tPrivacy.raw('rgpd_list') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('rgpd_contact') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('rgpd_cnil') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('retention_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('retention_desc') }} />
              <div dangerouslySetInnerHTML={{ __html: tPrivacy.raw('retention_list') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('modifications_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('modifications_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('modifications_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tPrivacy('contact_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tPrivacy.raw('contact_desc') }} />
              <ul>
                <li dangerouslySetInnerHTML={{ __html: tPrivacy.raw('contact_email') }} />
                <li>
                  <strong>Via notre formulaire :</strong>{' '}
                  <Link href="/contact">Page de contact</Link>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

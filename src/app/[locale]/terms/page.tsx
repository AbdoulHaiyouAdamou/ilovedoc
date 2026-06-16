import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import styles from '../privacy/legal.module.css';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – iLoveDoc",
  description:
    "Conditions générales d'utilisation du site iLoveDoc. Consultez les règles d'accès et d'utilisation de nos outils PDF gratuits en ligne.",
  openGraph: {
    title: "Conditions Générales d'Utilisation – iLoveDoc",
    description:
      "Conditions générales d'utilisation de nos outils PDF gratuits.",
    url: 'https://ilovedoc.com/terms',
    siteName: 'iLoveDoc',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: 'https://ilovedoc.com/terms',
  },
};

export default function TermsPage() {
  const tFooter = useTranslations('Footer');
  const tTerms = useTranslations('Terms');
  return (
    <>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>
              {tFooter('terms')}
            </h1>

          </header>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>{tTerms('intro_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('intro_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('intro_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('access_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('access_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('access_p2') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('access_p3') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('ip_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('ip_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('ip_p2') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('ip_p3') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('resp_title')}</h2>
              <h3>{tTerms('resp_lim_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('resp_lim_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('resp_lim_p2') }} />

              <h3>{tTerms('resp_client_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('resp_client_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('resp_client_p2') }} />

              <h3>{tTerms('resp_links_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('resp_links_p1') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('privacy_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('privacy_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('privacy_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('acceptable_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('acceptable_p1') }} />
              <div dangerouslySetInnerHTML={{ __html: tTerms.raw('acceptable_list') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('mod_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('mod_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('mod_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('law_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('law_p1') }} />
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('law_p2') }} />
            </section>

            <section className={styles.section}>
              <h2>{tTerms('contact_title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: tTerms.raw('contact_p1') }} />
              <ul>
                <li dangerouslySetInnerHTML={{ __html: tTerms.raw('contact_email') }} />
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

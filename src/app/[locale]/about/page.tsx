import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './about.module.css';
import { Gift, Lock, Zap, UserX, FileText, Globe, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos de iLoveDoc – Outils PDF Gratuits en Ligne',
  description:
    'Découvrez iLoveDoc : des outils PDF gratuits, sécurisés et rapides. Traitement 100% côté client, sans envoi de fichiers sur un serveur. Fusionnez, compressez, convertissez vos PDF en toute confidentialité.',
  keywords: [
    'iLoveDoc',
    'outils PDF gratuits',
    'fusionner PDF',
    'compresser PDF',
    'convertir PDF',
    'traitement PDF en ligne',
    'PDF sécurisé',
  ],
  openGraph: {
    title: 'À Propos de iLoveDoc – Outils PDF Gratuits en Ligne',
    description:
      'Des outils PDF puissants, gratuits et 100% sécurisés. Aucun fichier envoyé sur un serveur.',
    url: 'https://ilovedoc.com/about',
    siteName: 'iLoveDoc',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: 'https://ilovedoc.com/about',
  },
};

export default function AboutPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              {tTools('about.name')}
            </h1>
            <p className={styles.heroSubtitle}>
              {tTools('about.description')}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Notre Mission</h2>
            <div className={styles.missionCard}>
              <p>
                Chez <strong>iLoveDoc</strong>, nous croyons que tout le monde
                mérite un accès libre et gratuit à des outils PDF professionnels.
                Notre mission est de rendre la gestion de documents PDF simple,
                rapide et sécurisée — sans inscription, sans frais cachés et
                surtout sans jamais compromettre la confidentialité de vos
                fichiers.
              </p>
              <p>
                Chaque document que vous traitez reste sur <em>votre</em>{' '}
                appareil. Aucun fichier n&apos;est envoyé sur un serveur
                distant. C&apos;est notre engagement fondamental.
              </p>
            </div>
          </div>
        </section>

        {/* Ad slot under mission */}
        <AdUnit slot="about-mission-bottom" format="horizontal" />

        {/* Pourquoi iLoveDoc */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Pourquoi iLoveDoc ?</h2>
            <div className={styles.advantagesGrid}>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Gift size={40} color="#7c3aed" />
                </div>
                <h3>100 % Gratuit</h3>
                <p>
                  Tous nos outils sont entièrement gratuits, sans limite de
                  fichiers ni filigrane ajouté. Pas de plan premium caché.
                </p>
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Lock size={40} color="#f97316" />
                </div>
                <h3>Sécurisé &amp; Privé</h3>
                <p>
                  Vos fichiers ne quittent jamais votre navigateur. Le traitement
                  se fait intégralement côté client grâce à des technologies
                  modernes.
                </p>
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Zap size={40} color="#eab308" />
                </div>
                <h3>Ultra-Rapide</h3>
                <p>
                  Pas d&apos;envoi réseau, pas d&apos;attente serveur. Vos
                  documents sont traités instantanément sur votre machine.
                </p>
              </div>
              <div className={styles.advantageCard}>
                <div className={styles.advantageIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <UserX size={40} color="#ef4444" />
                </div>
                <h3>Sans Inscription</h3>
                <p>
                  Aucun compte requis. Accédez immédiatement à tous les outils
                  sans partager vos informations personnelles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise / E-E-A-T */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Notre Expertise</h2>
            <div className={styles.expertiseGrid}>
              <div className={styles.expertiseCard}>
                <h3>Développeurs Spécialisés</h3>
                <p>
                  iLoveDoc est développé par une équipe d&apos;ingénieurs
                  logiciels passionnés, spécialisés dans les technologies web
                  modernes (React, Next.js, TypeScript) et le traitement de
                  documents numériques.
                </p>
              </div>
              <div className={styles.expertiseCard}>
                <h3>Standards du Web</h3>
                <p>
                  Nous suivons les meilleures pratiques de l&apos;industrie :
                  accessibilité (WCAG), performance (Core Web Vitals),
                  référencement (SEO) et sécurité (CSP, HTTPS).
                </p>
              </div>
              <div className={styles.expertiseCard}>
                <h3>Open Source &amp; Transparent</h3>
                <p>
                  Notre code s&apos;appuie sur des bibliothèques open-source
                  reconnues comme <code>pdf-lib</code>. Nous valorisons la
                  transparence et la confiance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Notre Technologie</h2>
            <div className={styles.techCard}>
              <div className={styles.techContent}>
                <h3>Traitement 100 % Côté Client</h3>
                <p>
                  Contrairement aux autres services en ligne, iLoveDoc effectue <strong>toutes les opérations directement dans votre navigateur</strong>. Vos fichiers ne transitent jamais sur Internet, ce qui vous garantit une confidentialité totale et une vitesse maximale.
                </p>
              </div>
              <div className={styles.techVisual}>
                <div className={styles.techDiagram}>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <FileText size={28} color="#7c3aed" />
                    </span>
                    <span>Votre fichier</span>
                  </div>
                  <div className={styles.diagramArrow}>→</div>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Globe size={28} color="#4f46e5" />
                    </span>
                    <span>Navigateur</span>
                  </div>
                  <div className={styles.diagramArrow}>→</div>
                  <div className={styles.diagramStep}>
                    <span className={styles.diagramEmoji} style={{ display: 'flex', justifyContent: 'center' }}>
                      <CheckCircle size={28} color="#10b981" />
                    </span>
                    <span>Résultat</span>
                  </div>
                </div>
                <p className={styles.techNote}>
                  Aucun serveur impliqué — tout reste chez vous.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad slot under technology */}
        <AdUnit slot="about-technology-bottom" format="horizontal" />

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>
              Prêt à simplifier vos documents ?
            </h2>
            <p className={styles.ctaText}>
              Essayez nos outils PDF gratuitement — aucune inscription requise.
            </p>
            <Link href="/" className={styles.ctaButton}>
              Découvrir nos outils
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

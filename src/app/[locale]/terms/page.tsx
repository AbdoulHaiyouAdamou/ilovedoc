import type { Metadata } from 'next';
import Link from 'next/link';
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
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  return (
    <>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>
              {tTools('terms.name')}
            </h1>
            <p className={styles.lastUpdated}>
              {tTools('terms.description')}
            </p>
          </header>

          <div className={styles.content}>
            {/* 1. Objet */}
            <section className={styles.section}>
              <h2>1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (ci-après
                « CGU ») ont pour objet de définir les modalités et conditions
                d&apos;accès et d&apos;utilisation du site{' '}
                <strong>iLoveDoc</strong>, accessible à l&apos;adresse{' '}
                <a href="https://ilovedoc.com">https://ilovedoc.com</a>{' '}
                (ci-après « le Site »).
              </p>
              <p>
                L&apos;utilisation du Site implique l&apos;acceptation pleine et
                entière des présentes CGU. Si vous n&apos;acceptez pas ces
                conditions, vous devez cesser immédiatement d&apos;utiliser le
                Site.
              </p>
            </section>

            {/* 2. Accès au service */}
            <section className={styles.section}>
              <h2>2. Accès au Service</h2>
              <p>
                Le Site est accessible gratuitement à tout utilisateur disposant
                d&apos;un accès Internet et d&apos;un navigateur web moderne.
                Aucune inscription ni création de compte n&apos;est requise pour
                utiliser les outils proposés.
              </p>
              <p>
                L&apos;éditeur du Site se réserve le droit de suspendre,
                modifier ou interrompre l&apos;accès au Site ou à tout ou
                partie de ses services, à tout moment et sans préavis, notamment
                pour des raisons de maintenance, de mise à jour ou pour tout
                autre motif jugé nécessaire, sans que cela ne puisse donner
                lieu à une quelconque indemnisation.
              </p>
              <p>
                L&apos;utilisateur est responsable de la compatibilité de son
                équipement informatique et de son accès Internet avec le Site.
              </p>
            </section>

            {/* 3. Propriété intellectuelle */}
            <section className={styles.section}>
              <h2>3. Propriété Intellectuelle</h2>
              <p>
                L&apos;ensemble des éléments constituant le Site (textes,
                graphismes, images, logos, icônes, sons, logiciels, mise en
                page, base de données, code source, etc.) est protégé par les
                dispositions du Code de la propriété intellectuelle et par les
                conventions internationales relatives à la propriété
                intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication,
                adaptation, totale ou partielle, de ces éléments, quel que soit
                le moyen ou le procédé utilisé, est interdite sans
                l&apos;autorisation écrite préalable de l&apos;éditeur du Site.
              </p>
              <p>
                Les documents PDF traités par les utilisateurs via les outils du
                Site restent la propriété exclusive de leurs auteurs ou
                détenteurs de droits respectifs. iLoveDoc n&apos;acquiert aucun
                droit sur ces documents.
              </p>
            </section>

            {/* 4. Responsabilité */}
            <section className={styles.section}>
              <h2>4. Responsabilité</h2>
              <h3>4.1 Limitation de responsabilité</h3>
              <p>
                Le Site et ses outils sont fournis « en l&apos;état », sans
                aucune garantie expresse ou implicite. L&apos;éditeur du Site
                ne garantit pas que les services seront exempts d&apos;erreurs,
                de défauts ou de virus, ni que les résultats obtenus seront
                exacts ou fiables.
              </p>
              <p>
                En aucun cas l&apos;éditeur ne pourra être tenu responsable de
                tout dommage direct ou indirect, y compris mais sans s&apos;y
                limiter, la perte de données, de profits ou d&apos;opportunités
                commerciales, résultant de l&apos;utilisation ou de
                l&apos;impossibilité d&apos;utiliser le Site.
              </p>

              <h3>4.2 Traitement côté client</h3>
              <p>
                Tous les traitements PDF sont effectués localement dans le
                navigateur de l&apos;utilisateur. L&apos;éditeur du Site ne
                peut en aucun cas être tenu responsable de la perte de fichiers
                due à un dysfonctionnement du navigateur, du système
                d&apos;exploitation ou de tout autre logiciel tiers.
              </p>
              <p>
                L&apos;utilisateur est encouragé à conserver des copies de
                sauvegarde de ses documents avant tout traitement.
              </p>

              <h3>4.3 Liens hypertextes</h3>
              <p>
                Le Site peut contenir des liens vers des sites tiers.
                L&apos;éditeur n&apos;exerce aucun contrôle sur le contenu de
                ces sites et décline toute responsabilité quant à leur contenu
                ou aux pratiques de collecte de données de ces tiers.
              </p>
            </section>

            {/* 5. Données personnelles */}
            <section className={styles.section}>
              <h2>5. Données Personnelles</h2>
              <p>
                Le traitement des données personnelles dans le cadre de
                l&apos;utilisation du Site est régi par notre{' '}
                <Link href="/privacy">Politique de Confidentialité</Link>, qui
                fait partie intégrante des présentes CGU.
              </p>
              <p>
                En utilisant le Site, l&apos;utilisateur reconnaît avoir pris
                connaissance de ladite politique et en accepte les termes.
              </p>
            </section>

            {/* 6. Utilisation acceptable */}
            <section className={styles.section}>
              <h2>6. Utilisation Acceptable</h2>
              <p>L&apos;utilisateur s&apos;engage à ne pas utiliser le Site pour :</p>
              <ul>
                <li>
                  Toute activité illégale ou contraire à l&apos;ordre public et
                  aux bonnes mœurs.
                </li>
                <li>
                  Porter atteinte aux droits de propriété intellectuelle de
                  tiers.
                </li>
                <li>
                  Tenter de compromettre la sécurité ou le fonctionnement du
                  Site (attaques DDoS, injection de code, etc.).
                </li>
                <li>
                  Utiliser des robots, scrapers ou tout autre outil automatisé
                  pour accéder au contenu du Site de manière non autorisée.
                </li>
                <li>
                  Diffuser du contenu haineux, diffamatoire, discriminatoire ou
                  incitant à la violence.
                </li>
              </ul>
            </section>

            {/* 7. Modifications */}
            <section className={styles.section}>
              <h2>7. Modifications des CGU</h2>
              <p>
                L&apos;éditeur se réserve le droit de modifier les présentes CGU
                à tout moment. Les modifications prendront effet dès leur
                publication sur le Site. La date de dernière mise à jour est
                indiquée en haut de cette page.
              </p>
              <p>
                L&apos;utilisation continue du Site après la publication de
                modifications vaut acceptation des nouvelles CGU.
                L&apos;utilisateur est invité à consulter régulièrement cette
                page.
              </p>
            </section>

            {/* 8. Droit applicable */}
            <section className={styles.section}>
              <h2>8. Droit Applicable et Juridiction</h2>
              <p>
                Les présentes CGU sont régies par le droit français. En cas de
                litige relatif à l&apos;interprétation ou à l&apos;exécution
                des présentes, les parties s&apos;engagent à rechercher une
                solution amiable avant tout recours juridictionnel.
              </p>
              <p>
                À défaut de résolution amiable, les tribunaux compétents de
                Paris (France) seront seuls compétents pour connaître du litige.
              </p>
            </section>

            {/* 9. Contact */}
            <section className={styles.section}>
              <h2>9. Contact</h2>
              <p>
                Pour toute question relative aux présentes CGU, vous pouvez nous
                contacter :
              </p>
              <ul>
                <li>
                  <strong>Par email :</strong>{' '}
                  <a href="mailto:nexuslogic.pro@gmail.com">
                    nexuslogic.pro@gmail.com
                  </a>
                </li>
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

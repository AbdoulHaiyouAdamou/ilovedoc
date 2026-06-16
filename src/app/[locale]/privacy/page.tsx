import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import styles from './legal.module.css';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité – iLoveDoc',
  description:
    'Politique de confidentialité de iLoveDoc. Découvrez comment nous protégeons vos données personnelles, notre utilisation des cookies et vos droits RGPD.',
  openGraph: {
    title: 'Politique de Confidentialité – iLoveDoc',
    description:
      'Politique de confidentialité et protection des données personnelles.',
    url: 'https://ilovedoc.com/privacy',
    siteName: 'iLoveDoc',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: 'https://ilovedoc.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>Politique de Confidentialité</h1>
            <p className={styles.lastUpdated}>
              Dernière mise à jour : 26 mai 2026
            </p>
          </header>

          <div className={styles.content}>
            {/* 1. Introduction */}
            <section className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                Bienvenue sur <strong>iLoveDoc</strong> (ci-après « le Site »),
                accessible à l&apos;adresse{' '}
                <a href="https://ilovedoc.com">https://ilovedoc.com</a>. La
                protection de vos données personnelles est une priorité pour
                nous. La présente politique de confidentialité décrit quelles
                informations nous collectons, comment nous les utilisons et
                quels sont vos droits.
              </p>
              <p>
                En utilisant le Site, vous acceptez les pratiques décrites dans
                cette politique. Si vous n&apos;acceptez pas ces conditions,
                veuillez ne pas utiliser le Site.
              </p>
            </section>

            {/* 2. Données collectées */}
            <section className={styles.section}>
              <h2>2. Données Collectées</h2>
              <h3>2.1 Données de navigation</h3>
              <p>
                Lorsque vous visitez le Site, nous pouvons collecter
                automatiquement certaines informations techniques via des
                cookies et technologies similaires :
              </p>
              <ul>
                <li>Adresse IP (anonymisée)</li>
                <li>Type et version du navigateur</li>
                <li>Système d&apos;exploitation</li>
                <li>Pages visitées et temps de consultation</li>
                <li>Source de trafic (referrer)</li>
                <li>Résolution d&apos;écran et langue du navigateur</li>
              </ul>

              <h3>2.2 Données de formulaire</h3>
              <p>
                Si vous utilisez notre formulaire de contact, nous collectons
                les informations que vous fournissez volontairement : nom,
                adresse email, sujet et contenu du message. Ces données sont
                utilisées exclusivement pour répondre à votre demande.
              </p>

              <h3>2.3 Fichiers PDF</h3>
              <p>
                <strong>
                  iLoveDoc ne collecte, ne stocke et ne transfère aucun fichier
                  PDF.
                </strong>{' '}
                Tous les traitements de documents (fusion, compression,
                conversion, etc.) sont effectués intégralement dans votre
                navigateur, côté client, grâce à la bibliothèque{' '}
                <code>pdf-lib</code>. Aucun fichier n&apos;est envoyé vers nos
                serveurs ni vers des serveurs tiers.
              </p>
            </section>

            {/* 3. Cookies */}
            <section className={styles.section}>
              <h2>3. Utilisation des Cookies</h2>
              <p>Le Site utilise différents types de cookies :</p>

              <h3>3.1 Cookies essentiels</h3>
              <p>
                Ces cookies sont nécessaires au fonctionnement du Site (par
                exemple, préférences d&apos;affichage, mode sombre). Ils ne
                collectent pas de données personnelles identifiables.
              </p>

              <h3>3.2 Cookies analytiques</h3>
              <p>
                Nous utilisons <strong>Google Analytics</strong> pour
                comprendre comment les visiteurs interagissent avec le Site.
                Google Analytics utilise des cookies pour collecter des
                informations de manière anonymisée (pages visitées, durée des
                sessions, etc.). Ces données nous aident à améliorer
                l&apos;expérience utilisateur.
              </p>
              <p>
                Pour en savoir plus sur la manière dont Google utilise les
                données :{' '}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://policies.google.com/technologies/partner-sites
                </a>
              </p>

              <h3>3.3 Cookies publicitaires (Google AdSense)</h3>
              <p>
                Le Site utilise <strong>Google AdSense</strong> pour afficher
                des annonces publicitaires. Google AdSense et ses partenaires
                publicitaires tiers peuvent utiliser des cookies pour diffuser
                des annonces basées sur vos visites antérieures sur ce site ou
                sur d&apos;autres sites.
              </p>
              <p>
                <strong>
                  Google, en tant que fournisseur tiers, utilise des cookies
                  pour diffuser des annonces sur le Site.
                </strong>{' '}
                L&apos;utilisation par Google du cookie DART lui permet de
                diffuser des annonces aux utilisateurs en fonction de leur
                visite sur le Site et sur d&apos;autres sites Internet.
              </p>
              <p>
                Les fournisseurs tiers, y compris Google, utilisent des cookies
                pour diffuser des annonces en fonction des visites antérieures
                de l&apos;utilisateur sur votre site Web ou sur d&apos;autres
                sites Web.
              </p>
              <p>
                L&apos;utilisation de cookies publicitaires par Google permet à
                Google et à ses partenaires de diffuser des annonces à vos
                utilisateurs en fonction de leur visite sur vos sites et/ou
                d&apos;autres sites Internet.
              </p>

              <h3>3.4 Désactivation des cookies</h3>
              <p>Vous pouvez gérer vos préférences de cookies de plusieurs manières :</p>
              <ul>
                <li>
                  <strong>Paramètres du navigateur :</strong> La plupart des
                  navigateurs vous permettent de refuser ou supprimer les
                  cookies via leurs paramètres de confidentialité.
                </li>
                <li>
                  <strong>Opt-out Google Ads :</strong> Vous pouvez désactiver
                  la publicité personnalisée en visitant les{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Paramètres des annonces Google
                  </a>
                  .
                </li>
                <li>
                  <strong>Opt-out général :</strong> Vous pouvez désactiver les
                  cookies publicitaires tiers en visitant{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.aboutads.info/choices/
                  </a>{' '}
                  ou{' '}
                  <a
                    href="https://www.youronlinechoices.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.youronlinechoices.eu/
                  </a>
                  .
                </li>
                <li>
                  <strong>NAI Opt-out :</strong> Visitez le site de la{' '}
                  <a
                    href="https://optout.networkadvertising.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Network Advertising Initiative
                  </a>{' '}
                  pour désactiver les cookies de réseaux publicitaires
                  participants.
                </li>
              </ul>
              <p>
                Veuillez noter que la désactivation des cookies peut affecter
                certaines fonctionnalités du Site.
              </p>
            </section>

            {/* 4. Google AdSense */}
            <section className={styles.section}>
              <h2>4. Google AdSense et Fournisseurs Tiers</h2>
              <p>
                iLoveDoc affiche des annonces via le programme{' '}
                <strong>Google AdSense</strong>. Dans ce cadre :
              </p>
              <ul>
                <li>
                  Des fournisseurs tiers, y compris Google, utilisent des
                  cookies pour diffuser des annonces en fonction des visites
                  antérieures de l&apos;utilisateur sur le Site ou sur
                  d&apos;autres sites.
                </li>
                <li>
                  Google utilise le cookie DoubleClick (DART) pour permettre,
                  à lui-même et à ses partenaires, de diffuser des annonces
                  basées sur la visite des utilisateurs sur le Site et/ou sur
                  d&apos;autres sites Internet.
                </li>
                <li>
                  Les utilisateurs peuvent désactiver l&apos;utilisation du
                  cookie DART en se rendant dans les{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    paramètres de publicité Google
                  </a>
                  .
                </li>
              </ul>
              <p>
                Pour plus d&apos;informations sur la manière dont Google gère
                les données dans ses produits publicitaires, consultez la{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  politique de confidentialité de Google
                </a>
                .
              </p>
            </section>

            {/* 5. Droits RGPD */}
            <section className={styles.section}>
              <h2>5. Vos Droits (RGPD)</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés, vous disposez des
                droits suivants concernant vos données personnelles :
              </p>
              <ul>
                <li>
                  <strong>Droit d&apos;accès :</strong> Vous pouvez obtenir la
                  confirmation que des données vous concernant sont ou ne sont
                  pas traitées et, lorsqu&apos;elles le sont, l&apos;accès à
                  ces données.
                </li>
                <li>
                  <strong>Droit de rectification :</strong> Vous pouvez obtenir
                  la rectification de données inexactes ou incomplètes.
                </li>
                <li>
                  <strong>Droit à l&apos;effacement :</strong> Vous pouvez
                  obtenir l&apos;effacement de vos données dans les cas prévus
                  par la réglementation.
                </li>
                <li>
                  <strong>Droit à la limitation du traitement :</strong> Vous
                  pouvez demander la limitation du traitement de vos données
                  dans certaines circonstances.
                </li>
                <li>
                  <strong>Droit à la portabilité :</strong> Vous pouvez
                  recevoir vos données dans un format structuré, couramment
                  utilisé et lisible par machine.
                </li>
                <li>
                  <strong>Droit d&apos;opposition :</strong> Vous pouvez vous
                  opposer au traitement de vos données pour des motifs
                  légitimes.
                </li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à l&apos;adresse :{' '}
                <a href="mailto:contact@ilovedoc.com">contact@ilovedoc.com</a>.
                Nous répondrons à votre demande dans un délai de 30 jours.
              </p>
              <p>
                Vous avez également le droit d&apos;introduire une réclamation
                auprès de la{' '}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Commission Nationale de l&apos;Informatique et des Libertés
                  (CNIL)
                </a>
                .
              </p>
            </section>

            {/* 6. Conservation */}
            <section className={styles.section}>
              <h2>6. Conservation des Données</h2>
              <p>
                Les données collectées sont conservées pour la durée nécessaire
                à la finalité pour laquelle elles ont été collectées :
              </p>
              <ul>
                <li>
                  <strong>Données de navigation (analytics) :</strong>{' '}
                  Conservées pendant 26 mois maximum, conformément aux
                  recommandations de la CNIL.
                </li>
                <li>
                  <strong>Données de contact :</strong> Conservées pendant 3
                  ans à compter du dernier contact.
                </li>
                <li>
                  <strong>Cookies :</strong> La durée de vie des cookies ne
                  dépasse pas 13 mois conformément à la réglementation en
                  vigueur.
                </li>
                <li>
                  <strong>Fichiers PDF :</strong> Aucune conservation — les
                  fichiers ne quittent jamais votre navigateur.
                </li>
              </ul>
            </section>

            {/* 7. Modifications */}
            <section className={styles.section}>
              <h2>7. Modifications de cette Politique</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de
                confidentialité à tout moment. Toute modification sera publiée
                sur cette page avec une date de mise à jour révisée. Nous vous
                encourageons à consulter régulièrement cette page pour rester
                informé de nos pratiques en matière de protection des données.
              </p>
              <p>
                En cas de modifications substantielles, nous afficherons un
                avis visible sur le Site pour vous en informer.
              </p>
            </section>

            {/* 8. Contact */}
            <section className={styles.section}>
              <h2>8. Contact</h2>
              <p>
                Pour toute question relative à cette politique de
                confidentialité ou pour exercer vos droits, vous pouvez nous
                contacter :
              </p>
              <ul>
                <li>
                  <strong>Par email :</strong>{' '}
                  <a href="mailto:contact@ilovedoc.com">
                    contact@ilovedoc.com
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

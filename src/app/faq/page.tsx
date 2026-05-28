'use client';

import { useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './faq.module.css';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Conservez-vous une copie de mes fichiers une fois traités ?',
    a: "Absolument pas. iLoveDoc effectue tous les traitements directement dans votre navigateur (côté client). Vos fichiers ne quittent jamais votre appareil et ne sont jamais envoyés sur un serveur distant. Ils restent 100 % sous votre contrôle et en sécurité.",
  },
  {
    q: "Les fichiers d'entreprise sont-ils en sécurité avec votre service ?",
    a: "Oui. Puisque le traitement est effectué localement dans votre propre navigateur, aucun tiers (y compris nous-mêmes) ne peut accéder à vos documents professionnels. C'est la solution idéale pour le respect du RGPD et la stricte confidentialité d'entreprise.",
  },
  {
    q: 'Quelle est la configuration système minimale ?',
    a: "Un navigateur moderne (Chrome, Firefox, Safari ou Edge) avec connexion Internet. Comme les calculs sont effectués localement par votre appareil, une mémoire vive suffisante est conseillée pour les documents très volumineux.",
  },
  {
    q: 'Comment puis-je télécharger mes fichiers ?',
    a: "Dès que l'opération de traitement de document est terminée, un bouton de téléchargement apparaît pour enregistrer le fichier généré directement sur votre appareil.",
  },
  {
    q: 'Puis-je convertir mes PDF numérisés en documents modifiables ?',
    a: "Oui. Nos outils d'OCR (Reconnaissance Optique de Caractères) et d'édition extraient le texte de vos PDF scannés pour le rendre sélectionnable et éditable directement.",
  },
  {
    q: 'Pourquoi ma conversion est-elle si longue ?',
    a: "La vitesse dépend principalement de la puissance de calcul de votre appareil et de la taille du fichier, car le traitement s'effectue localement sur votre ordinateur sans dépendre de serveurs externes.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item opened by default to match screenshot

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Notre équipe d&apos;assistance répond à ces questions quasiment tous les jours
          </h1>
          <p className={styles.heroSubtitle}>
            Nous avons pensé que cela vous serait également utile
          </p>
        </section>

        {/* Top ad placement */}
        <AdUnit slot="faq-top" format="horizontal" />

        {/* Content Container */}
        <div className={styles.container}>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={styles.faqChevron}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  <div
                    className={`${styles.faqAnswer} ${
                      isOpen ? styles.faqAnswerActive : ''
                    }`}
                  >
                    <div className={styles.answerContent}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom ad placement */}
          <AdUnit slot="faq-bottom" format="horizontal" />
        </div>
      </main>
      <Footer />
    </>
  );
}

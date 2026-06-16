'use client';

import { useState } from 'react';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './faq.module.css';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const tFooter = useTranslations('Footer');
  const tCommon = useTranslations('Common');
  const tFaq = useTranslations('Faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item opened by default to match screenshot

  const FAQ_ITEMS = [
    { q: tFaq('item0_q'), a: tFaq('item0_a') },
    { q: tFaq('item1_q'), a: tFaq('item1_a') },
    { q: tFaq('item2_q'), a: tFaq('item2_a') },
    { q: tFaq('item3_q'), a: tFaq('item3_a') },
    { q: tFaq('item4_q'), a: tFaq('item4_a') },
    { q: tFaq('item5_q'), a: tFaq('item5_a') }
  ];

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
            {tFooter('faq')}
          </h1>
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

import { Link } from '@/i18n/routing';
import { Shield, Zap, Unlock } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ToolCard from '@/components/common/ToolCard';
import AdUnit from '@/components/common/AdUnit';
import JsonLd from '@/components/common/JsonLd';
import Hero from '@/components/home/Hero';
import { tools } from '@/config/tools';

export const metadata = {
  title: 'iLoveDoc - Outils PDF en ligne gratuits',
  description: 'Fusionnez, divisez, compressez et convertissez vos fichiers PDF gratuitement. Traitement sécurisé directement dans votre navigateur sans aucune inscription.',
};

import { useTranslations } from 'next-intl';

export default function Home() {
  const tHome = useTranslations('Home');
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Est-ce que iLoveDoc est vraiment gratuit ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, tous les outils de base de iLoveDoc sont entièrement gratuits et utilisables sans aucune inscription.'
        }
      },
      {
        '@type': 'Question',
        name: 'Mes fichiers sont-ils en sécurité ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolument. Contrairement aux autres plateformes, iLoveDoc traite vos fichiers directement dans votre navigateur. Vos documents ne sont jamais téléchargés sur nos serveurs.'
        }
      }
    ]
  };

  return (
    <>
      <Header />
      <JsonLd data={faqData} />
      <main>
        <Hero />

        <section className="tools-section">
          <div className="container">
            <AdUnit slot="ad-top-home" format="horizontal" />
            
            <div className="tool-grid">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} slug={tool.slug} />
              ))}
            </div>

            <AdUnit slot="ad-bottom-home" format="horizontal" />
          </div>
        </section>

        <section className="features-section glass">
          <div className="container">
            <h2 className="section-title text-center">{tHome('why_choose')}</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><Shield size={32} color="var(--primary-color, #7c3aed)" /></div>
                <h3>{tHome('security_title')}</h3>
                <p>{tHome('security_desc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Zap size={32} color="var(--primary-color, #7c3aed)" /></div>
                <h3>{tHome('speed_title')}</h3>
                <p>{tHome('speed_desc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Unlock size={32} color="var(--primary-color, #7c3aed)" /></div>
                <h3>{tHome('no_signup_title')}</h3>
                <p>{tHome('no_signup_desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

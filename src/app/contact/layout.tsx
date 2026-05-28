import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact – iLoveDoc | Outils PDF Gratuits',
  description:
    "Contactez l'équipe iLoveDoc pour toute question, suggestion ou problème technique. Nous répondons sous 48 heures.",
  openGraph: {
    title: 'Contact – iLoveDoc',
    description:
      'Contactez-nous pour toute question ou suggestion concernant nos outils PDF gratuits.',
    url: 'https://ilovedoc.com/contact',
    siteName: 'iLoveDoc',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: 'https://ilovedoc.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

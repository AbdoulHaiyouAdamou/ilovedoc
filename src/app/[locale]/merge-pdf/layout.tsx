import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fusionner PDF - Combinez vos fichiers PDF en ligne | iLoveDoc',
  description:
    'Fusionnez plusieurs fichiers PDF en un seul document. Gratuit, rapide et sécurisé. Aucune inscription requise.',
  alternates: {
    canonical: '/merge-pdf',
  },
  openGraph: {
    title: 'Fusionner PDF - Combinez vos fichiers PDF en ligne | iLoveDoc',
    description:
      'Fusionnez plusieurs fichiers PDF en un seul document. Gratuit, rapide et sécurisé.',
    type: 'website',
  },
};

export default function MergePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

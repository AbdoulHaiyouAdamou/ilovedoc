import { useEffect } from 'react';
import JpgToPdfPage from '../jpg-to-pdf/page';

export default function PngToPdfPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return <JpgToPdfPage slug="png-to-pdf" />;
}

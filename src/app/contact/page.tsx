'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './contact.module.css';

import { Mail, Clock, ShieldAlert } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const FAQ_ITEMS = [
  {
    q: 'iLoveDoc est-il vraiment gratuit ?',
    a: 'Oui, tous nos outils sont 100 % gratuits, sans limite et sans inscription requise.',
  },
  {
    q: 'Mes fichiers sont-ils envoyés sur un serveur ?',
    a: 'Non. Tous les traitements sont effectués directement dans votre navigateur. Aucun fichier ne quitte votre appareil.',
  },
  {
    q: 'Quels navigateurs sont supportés ?',
    a: 'iLoveDoc fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, Edge (versions récentes).',
  },
  {
    q: 'Puis-je traiter des fichiers volumineux ?',
    a: 'Le traitement se fait côté client, donc la limite dépend de la mémoire de votre appareil. La plupart des documents de taille courante sont pris en charge sans problème.',
  },
  {
    q: 'Comment signaler un bug ?',
    a: "Utilisez le formulaire de contact ci-dessus avec le sujet « Bug / Problème technique » et décrivez le problème rencontré.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Le nom est requis.';
    if (!formData.email.trim()) {
      errs.email = "L'adresse email est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Veuillez entrer une adresse email valide.';
    }
    if (!formData.subject.trim()) errs.subject = 'Le sujet est requis.';
    if (!formData.message.trim()) {
      errs.message = 'Le message est requis.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Le message doit contenir au moins 10 caractères.';
    }
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Simulate submission (no backend)
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Contactez-nous</h1>
          <p className={styles.heroSubtitle}>
            Une question, une suggestion ou un problème ? Nous sommes là pour
            vous aider.
          </p>
        </section>

        {/* Top ad placement */}
        <AdUnit slot="contact-top" format="horizontal" />

        <div className={styles.contentGrid}>
          {/* Form */}
          <section className={styles.formSection}>
            <h2 className={styles.formTitle}>Envoyez-nous un message</h2>

            {status === 'success' && (
              <div className={styles.successBanner}>
                ✅ Merci ! Votre message a bien été envoyé. Nous vous
                répondrons dans les meilleurs délais.
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorBanner}>
                ❌ Une erreur est survenue. Veuillez réessayer plus tard.
              </div>
            )}

            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.field}>
                <label htmlFor="name">Nom complet</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ''}
                />
                {errors.name && (
                  <span className={styles.fieldError}>{errors.name}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && (
                  <span className={styles.fieldError}>{errors.email}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="subject">Sujet</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? styles.inputError : ''}
                >
                  <option value="">— Choisir un sujet —</option>
                  <option value="question">Question générale</option>
                  <option value="bug">Bug / Problème technique</option>
                  <option value="suggestion">Suggestion d&apos;amélioration</option>
                  <option value="partnership">Partenariat / Collaboration</option>
                  <option value="other">Autre</option>
                </select>
                {errors.subject && (
                  <span className={styles.fieldError}>{errors.subject}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Décrivez votre demande en détail…"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? styles.inputError : ''}
                />
                {errors.message && (
                  <span className={styles.fieldError}>{errors.message}</span>
                )}
              </div>

              <button type="submit" className={styles.submitBtn}>
                Envoyer le message
              </button>
            </form>
          </section>

          {/* Contact Info */}
          <aside className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3>Informations de contact</h3>
              <ul className={styles.infoList}>
                <li>
                  <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <Mail size={18} color="var(--color-primary, #7c3aed)" />
                  </span>
                  <div>
                    <strong>Email</strong>
                    <br />
                    <a href="mailto:contact@ilovedoc.com">
                      contact@ilovedoc.com
                    </a>
                  </div>
                </li>
                <li>
                  <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <Clock size={18} color="var(--color-primary, #7c3aed)" />
                  </span>
                  <div>
                    <strong>Temps de réponse</strong>
                    <br />
                    Sous 48 heures ouvrées
                  </div>
                </li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3>Suivez-nous</h3>
              <div className={styles.socialLinks}>
                <a
                  href="https://twitter.com/ilovedoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Twitter
                </a>
                <a
                  href="https://github.com/ilovedoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3>Liens utiles</h3>
              <ul className={styles.usefulLinks}>
                <li>
                  <Link href="/privacy">Politique de confidentialité</Link>
                </li>
                <li>
                  <Link href="/terms">Conditions d&apos;utilisation</Link>
                </li>
                <li>
                  <Link href="/about">À propos</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <h2 className={styles.sectionTitle}>Questions Fréquentes</h2>
            <div className={styles.faqList}>
              {FAQ_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.q}</span>
                    <span className={styles.faqChevron}>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className={styles.faqAnswer}>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom ad placement */}
        <AdUnit slot="contact-bottom" format="horizontal" />
      </main>
      <Footer />
    </>
  );
}

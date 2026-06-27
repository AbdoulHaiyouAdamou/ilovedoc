'use client';

import { useState, type FormEvent } from 'react';
import { Link } from '@/i18n/routing';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import styles from './contact.module.css';

import Mail from 'lucide-react/dist/esm/icons/mail';
import Clock from 'lucide-react/dist/esm/icons/clock';

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

export default function ContactPage() {
  const tFooter = useTranslations('Footer');
  const tCommon = useTranslations('Common');
  const tContact = useTranslations('Contact');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FAQ_ITEMS = [
    { q: tContact('faq_item0_q'), a: tContact('faq_item0_a') },
    { q: tContact('faq_item1_q'), a: tContact('faq_item1_a') },
    { q: tContact('faq_item2_q'), a: tContact('faq_item2_a') },
    { q: tContact('faq_item3_q'), a: tContact('faq_item3_a') },
    { q: tContact('faq_item4_q'), a: tContact('faq_item4_a') }
  ];

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = tContact('error_name_required');
    if (!formData.email.trim()) {
      errs.email = tContact('error_email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = tContact('error_email_invalid');
    }
    if (!formData.subject.trim()) errs.subject = tContact('error_subject_required');
    if (!formData.message.trim()) {
      errs.message = tContact('error_message_required');
    } else if (formData.message.trim().length < 10) {
      errs.message = tContact('error_message_min');
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setStatus('sending');
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Cacher le message de succès après 5 secondes
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {tFooter('contact')}
          </h1>
        </section>

        {/* Top ad placement */}
        <AdUnit slot="contact-top" format="horizontal" />

        <div className={styles.contentGrid}>
          {/* Form */}
          <section className={styles.formSection}>
            <h2 className={styles.formTitle}>{tContact('form_title')}</h2>

            {status === 'success' && (
              <div className={styles.successBanner}>
                {tContact('success_message')}
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorBanner}>
                {tContact('error_message')}
              </div>
            )}

            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.field}>
                <label htmlFor="name">{tContact('label_name')}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={tContact('placeholder_name')}
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ''}
                />
                {errors.name && (
                  <span className={styles.fieldError}>{errors.name}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">{tContact('label_email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={tContact('placeholder_email')}
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && (
                  <span className={styles.fieldError}>{errors.email}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="subject">{tContact('label_subject')}</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? styles.inputError : ''}
                >
                  <option value="">{tContact('select_subject')}</option>
                  <option value="question">{tContact('subject_option_question')}</option>
                  <option value="bug">{tContact('subject_option_bug')}</option>
                  <option value="suggestion">{tContact('subject_option_suggestion')}</option>
                  <option value="partnership">{tContact('subject_option_partnership')}</option>
                  <option value="other">{tContact('subject_option_other')}</option>
                </select>
                {errors.subject && (
                  <span className={styles.fieldError}>{errors.subject}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="message">{tContact('label_message')}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder={tContact('placeholder_message')}
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? styles.inputError : ''}
                />
                {errors.message && (
                  <span className={styles.fieldError}>{errors.message}</span>
                )}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
                {status === 'sending' ? tContact('btn_sending') : tContact('btn_submit')}
              </button>
            </form>
          </section>

          {/* Contact Info */}
          <aside className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3>{tContact('info_title')}</h3>
              <ul className={styles.infoList}>
                <li>
                  <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <Mail size={18} color="var(--color-primary, #7c3aed)" />
                  </span>
                  <div>
                    <strong>{tContact('info_email')}</strong>
                    <br />
                    <a href="mailto:nexuslogic.pro@gmail.com">
                      nexuslogic.pro@gmail.com
                    </a>
                  </div>
                </li>
                <li>
                  <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <Clock size={18} color="var(--color-primary, #7c3aed)" />
                  </span>
                  <div>
                    <strong>{tContact('info_response_time')}</strong>
                    <br />
                    {tContact('info_response_val')}
                  </div>
                </li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3>{tContact('info_follow')}</h3>
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
              <h3>{tContact('info_links')}</h3>
              <ul className={styles.usefulLinks}>
                <li>
                  <Link href="/privacy">{tFooter('privacy')}</Link>
                </li>
                <li>
                  <Link href="/terms">{tFooter('terms')}</Link>
                </li>
                <li>
                  <Link href="/about">{tFooter('about')}</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <h2 className={styles.sectionTitle}>{tContact('faq_title')}</h2>
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

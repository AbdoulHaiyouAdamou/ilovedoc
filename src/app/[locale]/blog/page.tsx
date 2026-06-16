import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { blogPosts } from '@/config/blog';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog iLoveDoc - Guides et Astuces PDF en Ligne',
  description:
    'Découvrez tous nos guides pratiques, conseils et astuces pour éditer, fusionner, convertir et sécuriser vos fichiers PDF en toute simplicité.',
  keywords: [
    'blog pdf',
    'astuces pdf',
    'guides pdf',
    'iLoveDoc',
    'signatures électroniques légales',
    'fusionner pdf et jpg',
    'modifier pdf sans adobe'
  ],
  openGraph: {
    title: 'Blog iLoveDoc - Guides et Astuces PDF en Ligne',
    description:
      'Guides pratiques, conseils et astuces pour simplifier la gestion de vos fichiers PDF.',
    url: 'https://ilovedoc.com/blog',
    siteName: 'iLoveDoc',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: 'https://ilovedoc.com/blog',
  },
};

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const gridPosts = blogPosts.slice(1);

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Banner */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Blog</h1>
          <p className={styles.heroSubtitle}>
            Découvrez nos guides, astuces et conseils sur la gestion de vos documents PDF.
          </p>
        </section>

        <div className={styles.container}>
          {/* Featured Post (Article à la une) */}
          {featuredPost && (
            <section className={styles.featuredSection}>
              <div className={styles.featuredPost}>
                <div
                  className={styles.featuredImage}
                  style={{
                    background: `linear-gradient(135deg, ${featuredPost.colors[0]}, ${featuredPost.colors[1]})`
                  }}
                >
                  <span>{featuredPost.title.split(' : ')[0]}</span>
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.meta}>
                    <span className={styles.categoryTag}>{featuredPost.category}</span>
                    <span>•</span>
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                  <p className={styles.featuredDescription}>
                    {featuredPost.description}
                  </p>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className={styles.readMoreBtn}
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Ad slot between Featured and grid */}
          <AdUnit slot="blog-featured-middle" format="horizontal" />

          {/* Grid section */}
          <section>
            <h2 className={styles.gridTitle}>Tous les articles</h2>
            <div className={styles.blogGrid}>
              {gridPosts.map((post) => (
                <article key={post.slug} className={styles.blogCard}>
                  <div
                    className={styles.cardImage}
                    style={{
                      background: `linear-gradient(135deg, ${post.colors[0]}, ${post.colors[1]})`
                    }}
                  >
                    <span>{post.category}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      <span className={styles.categoryTag}>{post.category}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <p className={styles.cardDescription}>{post.description}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className={styles.readMoreBtn}
                    >
                      En savoir plus
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Ad slot at the bottom of blog */}
          <AdUnit slot="blog-bottom" format="horizontal" />
        </div>
      </main>
      <Footer />
    </>
  );
}

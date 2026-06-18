import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { blogPosts, getPostBySlug } from '@/config/blog';
import styles from '../blog.module.css';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article non trouvé | iLoveDoc',
    };
  }

  const tBlogPosts = await getTranslations('BlogPosts');
  const title = tBlogPosts(`${post.slug}.title`);
  const description = tBlogPosts(`${post.slug}.description`);

  return {
    title: `${title} | Blog iLoveDoc`,
    description: description,
    openGraph: {
      title: `${title} | Blog iLoveDoc`,
      description: description,
      url: `https://ilovedoc.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['iLoveDoc'],
    },
    alternates: {
      canonical: `https://ilovedoc.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tFooter = await getTranslations({ locale: (await params).locale, namespace: 'Footer' });
  const tBlog = await getTranslations({ locale: (await params).locale, namespace: 'Blog' });
  const tBlogPosts = await getTranslations({ locale: (await params).locale, namespace: 'BlogPosts' });

  // Get 3 recommended posts (excluding the current one)
  const recommended = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const localizedPost = {
    ...post,
    title: tBlogPosts(`${post.slug}.title`),
    subtitle: tBlogPosts(`${post.slug}.subtitle`),
    description: tBlogPosts(`${post.slug}.description`),
    date: tBlogPosts(`${post.slug}.date`),
    category: tBlogPosts(`${post.slug}.category`),
    readTime: tBlogPosts(`${post.slug}.readTime`),
  };

  const localizedRecommended = recommended.map((item) => ({
    ...item,
    title: tBlogPosts(`${item.slug}.title`),
    description: tBlogPosts(`${item.slug}.description`),
    date: tBlogPosts(`${item.slug}.date`),
    category: tBlogPosts(`${item.slug}.category`),
  }));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.articleContainer}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">{tBlog('back_home')}</Link>
            <span>/</span>
            <Link href="/blog">{tFooter('blog')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
              {localizedPost.category}
            </span>
          </nav>

          {/* Article Header */}
          <header className={styles.articleHeader}>
            <span className={styles.categoryTag}>{localizedPost.category}</span>
            <h1 className={styles.articleTitle}>{localizedPost.title}</h1>
            <p className={styles.articleSubtitle}>{localizedPost.subtitle}</p>

            <div className={styles.articleMeta}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                {localizedPost.date}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                {localizedPost.readTime} {tBlog('read_time_suffix')}
              </span>
            </div>

            {/* Share buttons */}
            <div className={styles.shareContainer}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '6px' }}>
                {tBlog('share')}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://ilovedoc.com/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareBtn} ${styles.shareBtnFb}`}
                aria-label={tBlog('fb_label')}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=https://ilovedoc.com/blog/${post.slug}&text=${encodeURIComponent(localizedPost.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareBtn} ${styles.shareBtnTw}`}
                aria-label={tBlog('x_label')}
              >
                <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>𝕏</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://ilovedoc.com/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareBtn} ${styles.shareBtnLi}`}
                aria-label={tBlog('li_label')}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </header>

          {/* Ad slot under header */}
          <AdUnit slot="blog-post-top" format="horizontal" />

          {/* Article Content */}
          <article className={styles.articleBody}>
            {post.content.map((section, idx) => {
              if (section.type === 'paragraph') {
                return <p key={idx}>{tBlogPosts(`${post.slug}.content.${idx}`)}</p>;
              }
              if (section.type === 'heading') {
                return <h2 key={idx}>{tBlogPosts(`${post.slug}.content.${idx}`)}</h2>;
              }
              if (section.type === 'list' && section.items) {
                return (
                  <ul key={idx} className={styles.articleList}>
                    {section.items.map((_, itemIdx) => (
                      <li key={itemIdx}>{tBlogPosts(`${post.slug}.content.${idx}_item${itemIdx}`)}</li>
                    ))}
                  </ul>
                );
              }
              if (section.type === 'conclusion') {
                return (
                  <div key={idx} className={styles.postConclusion}>
                    <p>{tBlogPosts(`${post.slug}.content.${idx}`)}</p>
                  </div>
                );
              }
              return null;
            })}
          </article>

          {/* Ad slot under article body */}
          <AdUnit slot="blog-post-bottom" format="horizontal" />

          {/* Back to Blog */}
          <div style={{ marginTop: '3.5rem', display: 'flex' }}>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                fontSize: '0.95rem'
              }}
            >
              <ArrowLeft size={16} />
              {tBlog('back_to_blog')}
            </Link>
          </div>

          {/* Recommended Articles */}
          {localizedRecommended.length > 0 && (
            <section className={styles.recommendedSection}>
              <h3 className={styles.recommendedTitle}>{tBlog('recommended_articles')}</h3>
              <div className={styles.blogGrid}>
                {localizedRecommended.map((item) => (
                  <article key={item.slug} className={styles.blogCard}>
                    <div
                      className={styles.cardImage}
                      style={{
                        background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`
                      }}
                    >
                      <span>{item.category}</span>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.meta}>
                        <span className={styles.categoryTag}>{item.category}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className={styles.cardTitle}>{item.title}</h4>
                      <p className={styles.cardDescription}>{item.description}</p>
                      <Link
                        href={`/blog/${item.slug}`}
                        className={styles.readMoreBtn}
                      >
                        {tBlog('read_more')}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

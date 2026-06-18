import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { blogPosts } from '@/config/blog';
import styles from './blog.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const tBlog = await getTranslations({ locale, namespace: 'Blog' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com';

  const title = `${t('blog')} | iLoveDoc`;
  const description = tBlog('title') + ' - ' + tBlog('subtitle');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/blog`,
      siteName: 'iLoveDoc',
      type: 'website',
      locale,
    },
  };
}

export default function BlogPage() {
  const tFooter = useTranslations('Footer');
  const tCommon = useTranslations('Common');
  const tBlog = useTranslations('Blog');
  const tBlogPosts = useTranslations('BlogPosts');

  const featuredPost = blogPosts[0];
  const gridPosts = blogPosts.slice(1);

  // Localize a post object helper
  const localizePost = (post: typeof blogPosts[0]) => {
    if (!post) return null;
    return {
      ...post,
      title: tBlogPosts(`${post.slug}.title`),
      subtitle: tBlogPosts(`${post.slug}.subtitle`),
      description: tBlogPosts(`${post.slug}.description`),
      date: tBlogPosts(`${post.slug}.date`),
      category: tBlogPosts(`${post.slug}.category`),
      readTime: tBlogPosts(`${post.slug}.readTime`),
    };
  };

  const localizedFeatured = featuredPost ? localizePost(featuredPost) : null;
  const localizedGridPosts = gridPosts.map(localizePost).filter(Boolean) as NonNullable<ReturnType<typeof localizePost>>[];

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Banner */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {tFooter('blog')}
          </h1>
        </section>

        <div className={styles.container}>
          {/* Featured Post (Article à la une) */}
          {localizedFeatured && (
            <section className={styles.featuredSection}>
              <div className={styles.featuredPost}>
                <div
                  className={styles.featuredImage}
                  style={{
                    background: `linear-gradient(135deg, ${localizedFeatured.colors[0]}, ${localizedFeatured.colors[1]})`
                  }}
                >
                  <span>{localizedFeatured.title.split(' : ')[0]}</span>
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.meta}>
                    <span className={styles.categoryTag}>{localizedFeatured.category}</span>
                    <span>•</span>
                    <span>{localizedFeatured.date}</span>
                    <span>•</span>
                    <span>{localizedFeatured.readTime}</span>
                  </div>
                  <h2 className={styles.featuredTitle}>{localizedFeatured.title}</h2>
                  <p className={styles.featuredDescription}>
                    {localizedFeatured.description}
                  </p>
                  <Link
                    href={`/blog/${localizedFeatured.slug}`}
                    className={styles.readMoreBtn}
                  >
                    {tBlog('read_more')}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Ad slot between Featured and grid */}
          <AdUnit slot="blog-featured-middle" format="horizontal" />

          {/* Grid section */}
          <section>
            <h2 className={styles.gridTitle}>{tBlog('all_articles')}</h2>
            <div className={styles.blogGrid}>
              {localizedGridPosts.map((post) => (
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
                      {tBlog('read_more')}
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

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate, readingTimeText } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?status=published&limit=6&sort=publishedAt&order=desc`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'ContentNest – Headless CMS & Blog',
  description: 'A modern headless CMS and blog platform for high-performance, SEO-optimized publishing.',
};

export default async function HomePage() {
  const posts = await getFeaturedPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Modern Content, <span className="text-primary">Delivered Fast</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ContentNest is a headless CMS and blog platform built for performance, SEO, and
            multi-channel publishing.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/blog"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Read the Blog
            </Link>
            <Link
              href="/admin"
              className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition"
            >
              Go to Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Latest Posts</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 bg-muted">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {post.categories?.slice(0, 2).map((cat) => (
                        <span
                          key={typeof cat === 'string' ? cat : cat._id}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {typeof cat === 'string' ? cat : cat.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
                      <span>{readingTimeText(post.readingTime)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {posts.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition"
              >
                View All Posts →
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

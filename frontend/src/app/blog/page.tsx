import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate, readingTimeText } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

async function getPosts(searchParams: Record<string, string>): Promise<{
  data: Post[];
  total: number;
  totalPages: number;
  page: number;
}> {
  const params = new URLSearchParams({ status: 'published', limit: '12', ...searchParams });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return { data: [], total: 0, totalPages: 1, page: 1 };
  return res.json();
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest articles and insights from ContentNest.',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { data: posts, totalPages, page } = await getPosts(params);
  const currentPage = parseInt(params.page || '1', 10);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto py-16 px-4 w-full">
        <h1 className="text-4xl font-bold mb-10">Blog</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.featuredImage && (
                  <div className="relative h-44 bg-muted">
                    <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border transition ${
                  p === currentPage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

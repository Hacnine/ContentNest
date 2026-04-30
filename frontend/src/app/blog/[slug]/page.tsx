import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types';
import { formatDate, readingTimeText } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PostTracker from '@/components/blog/PostTracker';

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || null;
}

async function getRelatedPosts(id: string): Promise<Post[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/related`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      images: post.seo?.ogImage ? [post.seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    keywords: post.seo?.keywords,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, related] = await Promise.all([getPost(slug), null]);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post._id);

  const authorName = typeof post.author === 'object' ? post.author.name : 'Author';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <PostTracker postId={post._id} postSlug={post.slug} postTitle={post.title} />

      <main className="flex-1 max-w-4xl mx-auto py-12 px-4 w-full">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-4">
          {post.categories?.map((cat) => (
            <Link
              key={typeof cat === 'string' ? cat : cat._id}
              href={`/blog?category=${typeof cat === 'string' ? cat : cat._id}`}
              className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition"
            >
              {typeof cat === 'string' ? cat : cat.name}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-8">
          <span>{authorName}</span>
          <span>·</span>
          <span>{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
          <span>·</span>
          <span>{readingTimeText(post.readingTime)}</span>
        </div>

        {post.featuredImage && (
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-8 pt-8 border-t border-border">
            {post.tags.map((tag) => (
              <Link
                key={typeof tag === 'string' ? tag : tag._id}
                href={`/blog?tag=${typeof tag === 'string' ? tag : tag._id}`}
                className="text-sm border border-border px-3 py-1 rounded-full hover:bg-muted transition"
              >
                #{typeof tag === 'string' ? tag : tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related._id}
                  href={`/blog/${related.slug}`}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

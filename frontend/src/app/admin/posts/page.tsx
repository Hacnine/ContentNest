'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPosts, deletePost } from '@/store/slices/postsSlice';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function PostsListPage() {
  const dispatch = useAppDispatch();
  const { posts, loading, total, totalPages, page } = useAppSelector((s) => s.posts);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPosts({
      page: currentPage,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
    }));
  }, [dispatch, currentPage, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    dispatch(deletePost(id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'published', 'draft', 'scheduled', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No posts found.{' '}
            <Link href="/admin/posts/new" className="text-primary hover:underline">
              Create your first post
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post: Post) => (
                <tr key={post._id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm line-clamp-1">{post.title}</div>
                    <div className="text-xs text-muted-foreground">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                    {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/posts/${post._id}/edit`}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      {post.status === 'published' && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post._id, post.title)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-lg border text-sm transition ${
                p === currentPage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AnalyticsSummary } from '@/types';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalMedia: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/posts?limit=1').catch(() => null),
      api.get('/analytics/summary?days=30').catch(() => null),
    ]).then(([postsRes, analyticsRes]) => {
      if (postsRes?.data) {
        setStats({
          totalPosts: postsRes.data.total || 0,
          publishedPosts: 0,
          draftPosts: 0,
          totalMedia: 0,
        });
      }
      if (analyticsRes?.data?.data) {
        setAnalytics(analyticsRes.data.data);
      }
    });
  }, []);

  const cards = [
    { label: 'Total Posts', value: stats?.totalPosts ?? '—', href: '/admin/posts', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Views (30d)', value: analytics?.totalViews ?? '—', href: '/admin/analytics', color: 'bg-green-50 text-green-700' },
    { label: 'Unique Visitors (30d)', value: analytics?.uniqueVisitors ?? '—', href: '/admin/analytics', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`${card.color} rounded-xl p-6 flex flex-col gap-1 hover:opacity-90 transition`}
          >
            <span className="text-3xl font-bold">{card.value}</span>
            <span className="text-sm font-medium">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Popular Posts */}
      {analytics?.popularPosts && analytics.popularPosts.length > 0 && (
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Popular Posts (Last 30 Days)</h2>
          <div className="divide-y divide-border">
            {analytics.popularPosts.slice(0, 5).map((post) => (
              <div key={post.postId} className="flex items-center justify-between py-3">
                <Link href={`/blog/${post.slug}`} className="text-sm hover:text-primary truncate flex-1">
                  {post.title || post.slug}
                </Link>
                <span className="text-sm text-muted-foreground ml-4">{post.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Link
          href="/admin/posts/new"
          className="bg-primary text-primary-foreground rounded-xl p-6 flex items-center gap-3 hover:opacity-90 transition"
        >
          <span className="text-2xl">✏️</span>
          <div>
            <div className="font-semibold">New Post</div>
            <div className="text-sm opacity-80">Start writing a new article</div>
          </div>
        </Link>
        <Link
          href="/admin/media"
          className="bg-background border border-border rounded-xl p-6 flex items-center gap-3 hover:shadow-sm transition"
        >
          <span className="text-2xl">🖼️</span>
          <div>
            <div className="font-semibold">Media Library</div>
            <div className="text-sm text-muted-foreground">Upload and manage files</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

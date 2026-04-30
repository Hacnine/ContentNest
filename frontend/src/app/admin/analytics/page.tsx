'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '@/lib/api';
import { AnalyticsSummary } from '@/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ data: AnalyticsSummary }>(`/analytics/summary?days=${days}`)
      .then(({ data: res }) => {
        setData(res.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading analytics…</div>
      ) : !data ? (
        <div className="text-center py-12 text-muted-foreground">No analytics data available.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="bg-background border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm mb-1">Total Views</p>
              <p className="text-3xl font-bold">{data.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-background border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm mb-1">Unique Visitors</p>
              <p className="text-3xl font-bold">{data.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>

          {/* Views Over Time */}
          {data.viewsByDate?.length > 0 && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Views Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.viewsByDate}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Popular Posts */}
          {data.popularPosts?.length > 0 && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Popular Posts</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.popularPosts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                    width={180}
                    tickFormatter={(v: string) => v?.length > 25 ? `${v.slice(0, 25)}…` : v}
                  />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

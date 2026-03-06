'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

type AnalyticsResponse = { metrics?: Array<{ id: string; metric?: string; value?: number }> };

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<AnalyticsResponse>('/api/admin/analytics');
        setData(response);
      } catch (_error) {
        setError('Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Sales analytics and store health overview.</p>
      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading metrics...
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{error}</p>
      ) : data?.metrics?.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {data.metrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent>
                <p className="text-sm font-semibold text-foreground">{metric.metric || 'Metric'}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-600">No metrics available yet.</p>
      )}
    </div>
  );
}

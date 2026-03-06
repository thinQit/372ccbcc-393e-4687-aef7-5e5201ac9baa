'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

type TemplatesResponse = { templates?: Array<{ id: string; name?: string; rating_avg?: number; is_active?: boolean }> };

export default function TemplatesPage() {
  const [data, setData] = useState<TemplatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<TemplatesResponse>('/api/admin/templates');
        setData(response);
      } catch (_error) {
        setError('Unable to load templates.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Template Management</h1>
      <p className="mt-2 text-sm text-slate-600">Preview, rate, and activate storefront templates.</p>
      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading templates...
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{error}</p>
      ) : data?.templates?.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {data.templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{template.name || 'Template'}</p>
                <p className="text-xs text-slate-500">Rating {template.rating_avg ?? 0}</p>
                <p className="text-xs text-slate-500">{template.is_active ? 'Active' : 'Inactive'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-600">No templates uploaded yet.</p>
      )}
    </div>
  );
}

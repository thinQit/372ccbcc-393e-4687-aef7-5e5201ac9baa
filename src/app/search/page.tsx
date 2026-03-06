'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

type Book = { id: string; title?: string; price_cents?: number; authors?: string[] };

type BooksResponse = { results: Book[]; total: number; page: number; limit: number };

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [data, setData] = useState<BooksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<BooksResponse>(`/api/books?q=${encodeURIComponent(query)}`);
        setData(response);
      } catch (_error) {
        setError('Unable to load search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Search Results</h1>
      <p className="mt-2 text-sm text-slate-600">Showing results for “{query || 'All books'}”</p>
      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Searching catalog...
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{error}</p>
      ) : data?.results?.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {data.results.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <Card className="h-full hover:shadow-md">
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{book.title || 'Untitled Book'}</p>
                  <p className="text-xs text-slate-500">{book.authors?.join(', ') || 'Multiple authors'}</p>
                  <p className="text-xs text-slate-500">${((book.price_cents || 0) / 100).toFixed(2)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-600">No results. Try another keyword.</p>
      )}
    </div>
  );
}

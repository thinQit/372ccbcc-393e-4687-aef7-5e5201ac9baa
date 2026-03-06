'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type Book = { id: string; title?: string; seo_meta?: Record<string, unknown> };

type BooksResponse = { results?: Book[] };

export default function SeoPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [seoJson, setSeoJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await api.get<BooksResponse>('/api/books?limit=20');
        setBooks(response?.results ?? []);
      } catch (_error) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!selectedBookId) {
      setMessage('Select a book to update SEO metadata.');
      return;
    }
    try {
      const parsed = seoJson ? JSON.parse(seoJson) : {};
      await api.put<{ book: Book }>(`/api/admin/seo/${selectedBookId}`, { seo_meta: parsed });
      setMessage('SEO metadata updated.');
    } catch (_error) {
      setMessage('Unable to update SEO metadata. Ensure JSON is valid.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">SEO Management</h1>
      <p className="mt-2 text-sm text-slate-600">Update SEO metadata for books and store pages.</p>
      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading books...
        </div>
      ) : books.length ? (
        <Card className="mt-6">
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="text-sm font-semibold text-foreground">
                Select book
                <select
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={selectedBookId}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedBookId(event.target.value)}
                >
                  <option value="">Choose a book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title || 'Untitled Book'}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="SEO JSON"
                placeholder='{"title":"New title","description":"Meta description"}'
                value={seoJson}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSeoJson(event.target.value)}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Save SEO metadata
              </button>
            </form>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </CardContent>
        </Card>
      ) : (
        <p className="mt-6 text-sm text-slate-600">No books available to update.</p>
      )}
    </div>
  );
}

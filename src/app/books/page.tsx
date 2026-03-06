'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type Book = { id: string; title?: string; price_cents?: number; rating_avg?: number; authors?: string[] };

type BooksResponse = { results: Book[]; total: number; page: number; limit: number };

export default function BooksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [author, setAuthor] = useState(searchParams.get('author') ?? '');
  const [genre, setGenre] = useState(searchParams.get('genre') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [data, setData] = useState<BooksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setAuthor(searchParams.get('author') ?? '');
    setGenre(searchParams.get('genre') ?? '');
    setSort(searchParams.get('sort') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<BooksResponse>(`/api/books?${searchParams.toString()}`);
        setData(response);
      } catch (_error) {
        setError('Unable to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (author) params.set('author', author);
    if (genre) params.set('genre', genre);
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    router.push(`/books?${params.toString()}`);
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books Catalog</h1>
          <p className="text-sm text-slate-500">Browse by genre, author, or bestseller status.</p>
        </div>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>
          <Input
            name="q"
            placeholder="Search title or keyword"
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          <Input
            name="author"
            placeholder="Author"
            value={author}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAuthor(event.target.value)}
          />
          <select
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            value={genre}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setGenre(event.target.value)}
          >
            <option value="">All genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-fiction">Non-fiction</option>
            <option value="Business">Business</option>
            <option value="Design">Design</option>
          </select>
          <select
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            value={sort}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSort(event.target.value)}
          >
            <option value="">Sort</option>
            <option value="bestsellers">Bestsellers</option>
            <option value="newest">Newest</option>
            <option value="price">Price</option>
          </select>
          <button
            type="submit"
            className="col-span-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Apply filters
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading books...
        </div>
      ) : error ? (
        <p className="text-sm text-error">{error}</p>
      ) : data?.results?.length ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>{data?.total ?? 0} results</span>
            <span>Page {data?.page ?? 1}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {data?.results?.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <Card className="h-full transition hover:shadow-md">
                  <CardContent className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{book.title || 'Untitled Book'}</h3>
                    <p className="text-sm text-slate-500">
                      {book.authors?.join(', ') || 'Multiple authors'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>${((book.price_cents || 0) / 100).toFixed(2)}</span>
                      <span>{book.rating_avg ? `${book.rating_avg.toFixed(1)}★` : 'New'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
              disabled={(data?.page ?? 1) <= 1}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handlePageChange(Math.max(1, (data?.page ?? 1) - 1));
              }}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
              disabled={(data?.results?.length ?? 0) < (data?.limit ?? 12)}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handlePageChange((data?.page ?? 1) + 1);
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-600">No books found. Try adjusting your filters.</p>
      )}
    </div>
  );
}

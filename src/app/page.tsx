'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

type Book = {
  id: string;
  title?: string;
  authors?: string[];
  price_cents?: number;
  rating_avg?: number;
};

type FeaturedResponse = { results: Book[]; total: number; page: number; limit: number };

type RecommendationsResponse = { recommendations: Book[] };

export default function HomePage() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredResponse, recResponse] = await Promise.all([
          api.get<FeaturedResponse>('/api/books?limit=4'),
          api.get<RecommendationsResponse>('/api/recommendations')
        ]);
        setFeatured(featuredResponse?.results ?? []);
        setRecommendations(recResponse?.recommendations ?? []);
      } catch (_error) {
        setError('Unable to load recommendations right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              BookShop — Modern book commerce
            </span>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Discover a curated world of books, shipped with care.
            </h1>
            <p className="text-lg text-slate-600">
              Browse thousands of titles, enjoy personalized recommendations, and check out securely with Stripe. BookShop
              keeps your reading list and orders organized from any device.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Shop the catalog
              </Link>
              <Link
                href="/account/register"
                className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Create an account
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            <Image
              src="/images/hero.jpg"
              alt="BookShop hero"
              width={1200}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Smart discovery',
              description: 'Search by title, author, or genre with fast suggestions and rich filters.'
            },
            {
              title: 'Secure checkout',
              description: 'Stripe-powered payments with clear totals, taxes, and delivery estimates.'
            },
            {
              title: 'Admin control',
              description: 'Inventory, templates, analytics, and SEO tools in one modern dashboard.'
            }
          ].map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardContent className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Curated stories, updated daily</h2>
            <p className="text-slate-600">
              Explore new releases, award winners, and staff picks. BookShop surfaces the best titles with rich metadata
              and trusted reviews.
            </p>
            <Link
              href="/books"
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse all books
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/feature.jpg"
              alt="Bookshop feature collection"
              width={1200}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Trending right now</h2>
          <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
            Explore search
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner />
            Loading personalized picks...
          </div>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : featured.length ? (
          <div className="grid gap-6 md:grid-cols-4">
            {featured.map((book) => (
              <Card key={book.id}>
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{book.title || 'Untitled Book'}</p>
                  <p className="text-xs text-slate-500">
                    {book.authors?.join(', ') || 'Multiple authors'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>${((book.price_cents || 0) / 100).toFixed(2)}</span>
                    <span>{book.rating_avg ? `${book.rating_avg.toFixed(1)}★` : 'New'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No trending books yet. Check back soon.</p>
        )}
      </section>

      <section className="bg-primary/5">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recommended for you</h2>
            <Link href="/account/login" className="text-sm font-semibold text-primary hover:underline">
              Sign in for more
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Spinner />
              Loading recommendations...
            </div>
          ) : recommendations.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {recommendations.map((book) => (
                <Card key={book.id}>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{book.title || 'Untitled Book'}</p>
                    <p className="text-xs text-slate-500">${((book.price_cents || 0) / 100).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">
                      {book.authors?.join(', ') || 'Personalized suggestion'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No recommendations yet. Start browsing to personalize your feed.</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: '1.2M+', value: 'Books shipped worldwide' },
            { label: '4.9/5', value: 'Average customer rating' },
            { label: '24/7', value: 'Order tracking access' }
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stat.label}</p>
                <p className="text-sm text-slate-600">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/cta.jpg"
              alt="BookShop checkout experience"
              width={1200}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Ready to build your next reading list?</h2>
            <p className="text-slate-600">
              Join BookShop for personalized recommendations, fast shipping, and secure checkout. Start with a curated
              bundle or explore our full catalog.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Start shopping
              </Link>
              <Link
                href="/account/register"
                className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div>
            <p className="text-sm font-semibold text-foreground">BookShop</p>
            <p className="text-xs text-slate-500">Modern commerce for physical books.</p>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-slate-500">
            <Link href="/books">Catalog</Link>
            <Link href="/account/login">Sign In</Link>
            <Link href="/admin/dashboard">Admin</Link>
          </div>
          <p className="text-xs text-slate-400">© 2025 BookShop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

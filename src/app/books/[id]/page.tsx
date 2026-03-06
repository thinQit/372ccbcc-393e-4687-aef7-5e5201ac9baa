'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';

type BookDetailResponse = {
  book?: { id: string; title?: string; description?: string; price_cents?: number; stock?: number; rating_avg?: number };
  recommendations?: Array<{ id: string; title?: string }>;
  reviews?: Array<{ id: string; title?: string; body?: string; rating?: number }>;
};

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<BookDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<BookDetailResponse>(`/api/books/${params.id}`);
        setData(response);
      } catch (_error) {
        setError('Unable to load book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [params.id]);

  const handleAddToCart = async () => {
    setMessage(null);
    try {
      await api.post<{ cart: unknown }>('/api/cart/items', { book_id: params.id, quantity: 1 });
      setMessage('Added to cart.');
    } catch (_error) {
      setMessage('Unable to add to cart.');
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    try {
      await api.post<{ review: unknown }>(`/api/books/${params.id}/reviews`, {
        rating: Number(reviewRating),
        title: reviewTitle,
        body: reviewBody
      });
      setReviewTitle('');
      setReviewBody('');
      setMessage('Review submitted for moderation.');
    } catch (_error) {
      setMessage('Unable to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading book details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Book Details</h1>
        <p className="mt-4 text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!data?.book) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Book Details</h1>
        <p className="mt-4 text-sm text-slate-600">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <Badge variant={data.book.stock && data.book.stock > 0 ? 'success' : 'error'}>
              {data.book.stock && data.book.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">{data.book.title || 'Book details'}</h1>
            <p className="text-slate-600">{data.book.description || 'No description available.'}</p>
            <p className="text-lg font-semibold text-foreground">
              ${((data.book.price_cents || 0) / 100).toFixed(2)}
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handleAddToCart();
              }}
            >
              Add to cart
            </button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
              <ul className="text-sm text-slate-600">
                {data.recommendations?.length
                  ? data.recommendations.map((rec) => <li key={rec.id}>{rec.title || 'Suggested book'}</li>)
                  : 'No recommendations yet.'}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Customer Reviews</h2>
              {data.reviews?.length ? (
                data.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-2 last:border-b-0">
                    <p className="text-sm font-semibold text-foreground">{review.title || 'Review'}</p>
                    <p className="text-xs text-slate-500">Rating: {review.rating ?? 'N/A'}</p>
                    <p className="text-sm text-slate-600">{review.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews yet. Be the first to review this book.</p>
              )}
            </CardContent>
          </Card>
          {isAuthenticated ? (
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Write a review</h3>
                <form className="space-y-3" onSubmit={handleReviewSubmit}>
                  <label className="text-sm font-semibold text-foreground">
                    Rating
                    <select
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                      value={reviewRating}
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setReviewRating(event.target.value)}
                    >
                      {['5', '4', '3', '2', '1'].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Input
                    label="Title"
                    value={reviewTitle}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReviewTitle(event.target.value)}
                  />
                  <label className="text-sm font-semibold text-foreground">
                    Review
                    <textarea
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                      rows={4}
                      value={reviewBody}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setReviewBody(event.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Submit review
                  </button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-slate-600">Sign in to leave a review.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

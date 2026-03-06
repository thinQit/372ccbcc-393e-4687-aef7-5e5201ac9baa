'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type CartItem = { id: string; book_id?: string; title?: string; quantity?: number; price_cents?: number };

type CartResponse = { cart?: { items?: CartItem[]; total_cents?: number; currency?: string } };

export default function CartPage() {
  const [data, setData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CartResponse>('/api/cart');
      setData(response);
    } catch (_error) {
      setError('Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (item: CartItem, value: number) => {
    if (!item.book_id) return;
    setUpdatingId(item.id);
    try {
      const response = await api.post<CartResponse>('/api/cart/items', {
        book_id: item.book_id,
        quantity: value
      });
      setData(response);
    } catch (_error) {
      setError('Unable to update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const response = await api.delete<CartResponse>(`/api/cart/items/${itemId}`);
      setData(response);
    } catch (_error) {
      setError('Unable to remove item.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading your cart...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="mt-4 text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!data?.cart?.items?.length) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="mt-4 text-slate-600">Your cart is empty. Start exploring the catalog.</p>
        <Link
          href="/books"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Browse books
        </Link>
      </div>
    );
  }

  const subtotal = data?.cart?.total_cents ?? 0;
  const tax = Math.round(subtotal * 0.08);
  const shipping = subtotal > 0 ? 699 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Your Cart</h1>
      <div className="mt-6 space-y-4">
        {data.cart.items?.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title || 'Book item'}</p>
                <p className="text-xs text-slate-500">${((item.price_cents || 0) / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity ?? 1}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleQuantityChange(item, Math.max(1, Number(event.target.value)))
                  }
                  className="w-20"
                />
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground"
                  disabled={updatingId === item.id}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    handleRemove(item.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 rounded-md border border-border bg-white p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>Estimated tax</span>
          <span>${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>Shipping</span>
          <span>${(shipping / 100).toFixed(2)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

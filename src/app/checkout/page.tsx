'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type CartResponse = { cart?: { id?: string; total_cents?: number; currency?: string } };

type CheckoutResponse = { checkout_url?: string };

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await api.get<CartResponse>('/api/cart');
        setCart(response);
      } catch (_error) {
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api.post<CheckoutResponse>('/api/checkout', {
        cart_id: formData.get('cart_id'),
        shipping_address: { line1: formData.get('shipping_address') },
        billing_address: { line1: formData.get('billing_address') },
        payment_method: 'stripe'
      });
      setMessage(`Checkout session created. Visit: ${response?.checkout_url ?? 'Stripe checkout'}`);
    } catch (_error) {
      setMessage('Checkout failed. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading checkout...
        </div>
      </div>
    );
  }

  if (!cart?.cart?.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-4 text-slate-600">Your cart is empty. Add books before checking out.</p>
        <Link
          href="/books"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <Card className="mt-6">
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="cart_id" label="Cart ID" defaultValue={cart.cart.id} required />
            <Input name="shipping_address" label="Shipping address" placeholder="123 Main St" required />
            <Input name="billing_address" label="Billing address" placeholder="123 Main St" required />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {submitting ? 'Processing...' : 'Start Stripe checkout'}
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        </CardContent>
      </Card>
      <div className="mt-6 rounded-md border border-border bg-white p-4 text-sm text-slate-600">
        <p>Order total: ${(Number(cart.cart.total_cents ?? 0) / 100).toFixed(2)}</p>
        <p>Currency: {cart.cart.currency ?? 'USD'}</p>
      </div>
    </div>
  );
}

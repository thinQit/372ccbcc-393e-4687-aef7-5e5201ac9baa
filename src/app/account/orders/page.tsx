'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

type OrdersResponse = { orders?: Array<{ id: string; status?: string; total_cents?: number; created_at?: string }> };

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<OrdersResponse>('/api/orders');
        setData(response);
      } catch (_error) {
        setError('Unable to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Order History</h1>
      {error && <p className="mt-4 text-sm text-error">{error}</p>}
      <div className="mt-6 space-y-4">
        {data?.orders?.length ? (
          data.orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">Status: {order.status || 'processing'}</p>
                  <p className="text-xs text-slate-500">
                    Placed: {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">${((order.total_cents || 0) / 100).toFixed(2)}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-slate-600">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

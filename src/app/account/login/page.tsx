'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);
    try {
      await login(String(formData.get('email')), String(formData.get('password')));
      setMessage('Logged in successfully.');
    } catch (_error) {
      setMessage('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">Sign In</h1>
      <Card className="mt-6">
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="email" label="Email" type="email" required />
            <Input name="password" label="Password" type="password" required />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

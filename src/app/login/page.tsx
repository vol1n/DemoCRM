'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = useSearchParams().get('callbackUrl') ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setError(null);

    const res = await signIn('email', {
      email,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>

      {submitted ? (
        <p className="text-green-600">
          ✅ Check your email for a login link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="w-full">
            Send Magic Link
          </Button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}

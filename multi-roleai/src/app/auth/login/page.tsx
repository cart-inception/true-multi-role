'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primaryBackground">
      <div className="w-full max-w-md rounded-lg bg-secondaryBackground p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-primaryText">Sign in to Multi-RoleAI</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-900/20 p-3 text-accentRed">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondaryText">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-3 py-2 text-primaryText shadow-sm focus:border-borderAccent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondaryText">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-3 py-2 text-primaryText shadow-sm focus:border-borderAccent focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-accentBlue px-4 py-2 text-primaryText shadow-sm hover:bg-accentBlue/90 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-secondaryText">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-accentBlue hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

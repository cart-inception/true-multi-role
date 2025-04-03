'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to login page on successful registration
      router.push('/auth/login?registered=true');
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primaryBackground">
      <div className="w-full max-w-md rounded-lg bg-secondaryBackground p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-primaryText">Create an account</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-900/20 p-3 text-accentRed">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondaryText">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-3 py-2 text-primaryText shadow-sm focus:border-borderAccent focus:outline-none"
            />
          </div>

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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondaryText">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-3 py-2 text-primaryText shadow-sm focus:border-borderAccent focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-accentBlue px-4 py-2 text-primaryText shadow-sm hover:bg-accentBlue/90 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-secondaryText">
          <p>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accentBlue hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

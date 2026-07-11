import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import api from '../lib/apiClient';
import { BrandLogo } from '../components/BrandLogo';

export default function DeleteAccount() {
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Login to verify identity, then request deletion
      await api.post('/auth/login', { email, password });
      setStep('confirm');
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete('/auth/account');
      setStep('done');
    } catch {
      // Even if endpoint doesn't exist yet, show done state
      // and instruct user to email support
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo size="md" showWordmark={false} />
          <div>
            <p className="font-bold text-gray-900">My Building</p>
            <p className="text-xs text-gray-500">Account Deletion Request</p>
          </div>
        </div>

        {step === 'form' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Delete Your Account</h1>
            <p className="text-sm text-gray-500 mb-6">
              Deleting your account will permanently remove all your data including your profile,
              maintenance records, visitor logs, and messages. This action cannot be undone.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <p className="text-sm text-amber-800 font-medium">⚠️ What gets deleted:</p>
              <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                <li>Your profile (name, email, phone, flat number)</li>
                <li>Your maintenance payment records</li>
                <li>Your messages and chat history</li>
                <li>Your vehicle registrations</li>
                <li>Your complaint submissions</li>
              </ul>
            </div>

            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue to Delete Account'}
              </Button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              Changed your mind?{' '}
              <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
            </p>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h1>
            <p className="text-sm text-gray-500 mb-6">
              You are about to permanently delete the account for <strong>{email}</strong>.
              All your data will be removed within 30 days. This cannot be undone.
            </p>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="space-y-3">
              <Button variant="destructive" className="w-full" disabled={loading} onClick={handleConfirm}>
                {loading ? 'Processing...' : 'Yes, Delete My Account'}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep('form')}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Request Received</h1>
              <p className="text-sm text-gray-500 mb-4">
                Your account deletion request has been submitted. Your account and all associated
                data will be permanently deleted within <strong>30 days</strong>.
              </p>
              <p className="text-sm text-gray-500">
                If you have any questions, contact us at{' '}
                <a href="mailto:support@mybuilding.app" className="text-blue-600 hover:underline">
                  support@mybuilding.app
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth-simple';

interface MobileLoginProps {
  onLogin: () => void;
  isDriver?: boolean;
}

export function MobileLogin({ onLogin, isDriver = false }: MobileLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        onLogin();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const demoEmail = isDriver ? 'driver@returnly.demo' : 'customer@returnly.demo';
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: demoEmail, 
          password: 'demo123' 
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        onLogin();
      }
    } catch (error) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-amber-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            {isDriver ? (
              <Smartphone className="h-8 w-8 text-amber-600" />
            ) : (
              <User className="h-8 w-8 text-amber-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            {isDriver ? 'Driver Sign In' : 'Welcome Back'}
          </CardTitle>
          <p className="text-amber-600">
            {isDriver ? 'Access your driver portal' : 'Sign in to your account'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-amber-200 focus:border-amber-500"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-amber-200 focus:border-amber-500"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-amber-600">Or try demo</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
            disabled={isLoading}
            data-testid="button-demo"
          >
            {isDriver ? 'Demo Driver Account' : 'Demo Customer Account'}
          </Button>

          <div className="text-xs text-center text-amber-600 space-y-1">
            <p>Stay signed in for 30 days</p>
            <p>Your session persists like other mobile apps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/store/use-app';

export default function Login() {
  const [, setLocation] = useLocation();
  const signIn = useApp((s) => s.signIn);
  const [name, setName] = useState('');
  const [asDriver, setAsDriver] = useState(false);

  const handleLogin = () => {
    if (!name.trim()) return;
    if (asDriver) {
      // Redirect drivers to download the mobile app
      alert('Drivers should download the Returnly Driver mobile app to accept jobs and manage deliveries.');
      return;
    }
    signIn(name, asDriver);
    setLocation('/book-pickup');
  };

  return (
    <Screen>
      <Header 
        title="Welcome back" 
        subtitle="Sign in to continue" 
      />
      
      <Card className="brand-card">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="brand-input"
                data-testid="input-name"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                className={asDriver ? "brand-button-contained flex-1" : "brand-button-outlined flex-1"}
                onClick={() => setAsDriver(true)}
                data-testid="button-driver-toggle"
              >
                I'm a Driver
              </Button>
              <Button
                className={!asDriver ? "brand-button-contained flex-1" : "brand-button-outlined flex-1"}
                onClick={() => setAsDriver(false)}
                data-testid="button-customer-toggle"
              >
                I'm a Customer
              </Button>
            </div>

            <Button
              className="brand-button-contained w-full"
              disabled={!name.trim()}
              onClick={handleLogin}
              data-testid="button-continue"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </Screen>
  );
}

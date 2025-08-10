import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <Screen>
      <Header 
        title="Returnly" 
        subtitle="Reverse delivery for returns, exchanges, and donations." 
      />
      
      <Card className="brand-card mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Make returns effortless
          </h2>
          <p className="text-muted-foreground mb-4">
            Schedule a pickup, hand off your item, and we'll return it for you.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              className="brand-button-contained" 
              onClick={() => setLocation('/book-pickup')}
              data-testid="button-book-pickup"
            >
              Book a Pickup
            </Button>
            <Button 
              variant="outline" 
              className="brand-button-outlined"
              onClick={() => setLocation('/login')}
              data-testid="button-sign-in"
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="brand-card">
        <CardContent className="p-4 flex items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
               style={{ backgroundColor: 'rgba(255, 140, 66, 0.2)' }}>
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Want to earn as a driver?</h3>
            <p className="text-muted-foreground text-sm">
              Download the Returnly Driver app to start accepting pickup jobs.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="brand-button-outlined text-sm px-4 py-2"
            onClick={() => window.open('https://apps.apple.com/app/returnly-driver', '_blank')}
            data-testid="button-download-driver-app"
          >
            Download App
          </Button>
        </CardContent>
      </Card>
    </Screen>
  );
}

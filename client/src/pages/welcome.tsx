import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Star, MapPin, Clock, Package, CreditCard } from 'lucide-react';

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <Screen>
      <Header 
        title="Returnly" 
        subtitle="Your returns delivered. Zero hassle." 
      />
      
      {/* Promotional Banner */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-4">
        <CardContent className="p-6 text-center">
          <div className="text-xl font-bold mb-2">🎉 Limited Time: 50% OFF First Return</div>
          <div className="bg-white/20 inline-block px-3 py-1 rounded-lg font-semibold">
            Use code: RETURN50
          </div>
        </CardContent>
      </Card>
      
      {/* Main CTA */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Book Your Return Pickup
          </h2>
          <p className="text-muted-foreground mb-4 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              From $7.99
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Pick up in 2 hours
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              500+ retail partners
            </span>
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button 
              className="brand-button-contained text-lg px-6 py-3" 
              onClick={() => setLocation('/book-pickup')}
              data-testid="button-book-pickup"
            >
              Start Return 📦
            </Button>
            <Button 
              variant="outline" 
              className="brand-button-outlined px-6 py-3"
              onClick={() => setLocation('/order-status/DEMO01')}
              data-testid="button-track-order"
            >
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Reviews */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            What Our Customers Say
          </h2>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Saved me 2 hours at the mall! Driver was super friendly."
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                — Sarah M., San Francisco
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Perfect for busy parents. Returned 3 packages while kids napped."
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                — Mike D., Austin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            📋 How Returnly Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="font-medium">Book pickup online or in app</span>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-medium">Hand package to our driver</span>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-medium">We handle the return for you</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retail Partners */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            🏪 Trusted Retail Partners
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {['Target', 'Best Buy', "Macy's", 'REI', 'Nike', '+495 more'].map((retailer) => (
              <div 
                key={retailer}
                className="bg-white border border-gray-200 rounded-lg p-3 text-center font-semibold text-sm"
              >
                {retailer}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Deals */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            💰 Current Deals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg border-2 border-green-500 text-center">
              <h3 className="font-bold text-lg mb-2">Bundle Returns</h3>
              <p className="text-sm text-muted-foreground mb-2">Return 3+ items, save 25%</p>
              <div className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm">
                BUNDLE25
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border-2 border-green-500 text-center">
              <h3 className="font-bold text-lg mb-2">Student Discount</h3>
              <p className="text-sm text-muted-foreground mb-2">15% off with .edu email</p>
              <div className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm">
                STUDENT15
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Section */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6 flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
               style={{ backgroundColor: 'rgba(255, 140, 66, 0.2)' }}>
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Earn as a Returnly Driver</h3>
            <p className="text-muted-foreground text-sm mb-1">
              $18-25/hour • Flexible schedule • Weekly pay
            </p>
          </div>
          <Button 
            className="brand-button-contained"
            onClick={() => alert('Driver Portal\n\nComing soon to App Store & Google Play!\n\nEarn up to $25/hour with flexible scheduling.')}
            data-testid="button-apply-driver"
          >
            Apply Now
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="brand-card border-t-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <button 
              onClick={() => setLocation('/login')}
              className="hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">
              Help Center
            </button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">
              About Us
            </button>
            <span>•</span>
            <button 
              onClick={() => setLocation('/design-system-demo')}
              className="hover:text-primary transition-colors font-medium"
            >
              Design System
            </button>
          </div>
        </CardContent>
      </Card>
    </Screen>
  );
}

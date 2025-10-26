import React from 'react';
import { 
  AppScreen,
  AppBar, 
  Button, 
  Card, 
  CardContent, 
  Input,
  FlexStack,
  ResponsiveGrid,
  CustomerOrderCard,
  useToast 
} from '@/components/design-system';
import { Package2, MapPin, Phone, User, CreditCard } from 'lucide-react';
import { ReturnItIcon } from '@/components/ReturnItLogo';
import { useLocation, Link } from 'wouter';

type MobileView = 'welcome' | 'login' | 'book-return' | 'order-status';

export default function MobileAppDemo() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = React.useState<MobileView>('welcome');
  const { addToast } = useToast();

  const renderWelcome = () => (
    <AppScreen>
      {/* Mobile Welcome Screen */}
      <FlexStack gap="lg" align="center" className="py-8">
        {/* Real Logo */}
        <div className="w-20 h-20 flex items-center justify-center">
          <Link href="/">
            <ReturnItIcon size={64} className="text-[#A47C48] cursor-pointer" />
          </Link>
        </div>
        
        {/* Hero Text */}
        <FlexStack gap="sm" align="center" className="text-center">
          <h1 className="text-[28px] leading-[34px] font-extrabold text-[#1A1A1A]">
            Return It
          </h1>
          <p className="text-[16px] leading-[24px] text-[#7B5E3B] max-w-xs">
            Hassle-free returns with professional pickup service
          </p>
        </FlexStack>

        {/* Main CTA */}
        <FlexStack gap="md" className="w-full">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full h-12"
            onClick={() => setCurrentView('book-return')}
          >
            Book Return
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12"
            onClick={() => setCurrentView('login')}
          >
            Sign In
          </Button>
        </FlexStack>

        {/* Driver CTA Card */}
        <Card className="w-full mt-4 bg-gradient-to-r from-[#A47C48] to-[#8B5A2B] text-white border-none">
          <CardContent className="p-4 text-center">
            <h3 className="text-[16px] leading-[24px] font-semibold mb-1">
              Want to earn $18-25/hour?
            </h3>
            <p className="text-[13px] leading-[18px] opacity-90 mb-3">
              Join as a driver and pick up packages in your area
            </p>
            <Button variant="secondary" size="sm" className="bg-white text-[#A47C48]">
              Become a Driver
            </Button>
          </CardContent>
        </Card>
      </FlexStack>
    </AppScreen>
  );

  const renderLogin = () => (
    <AppScreen 
      header={
        <AppBar 
          title="Sign In" 
          showBack 
          onBack={() => setCurrentView('welcome')} 
        />
      }
    >
      <FlexStack gap="lg" className="py-6">
        <FlexStack gap="md">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            leftIcon={<User className="h-4 w-4" />}
          />
          
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            type="tel"
            leftIcon={<Phone className="h-4 w-4" />}
          />
        </FlexStack>

        {/* Role Selection */}
        <Card>
          <CardContent className="p-4">
            <p className="text-[13px] leading-[18px] font-medium text-[#1A1A1A] mb-3">
              I want to:
            </p>
            <ResponsiveGrid columns={{ default: 2 }} gap="sm">
              <Button variant="primary" size="sm">Customer</Button>
              <Button variant="outline" size="sm">Driver</Button>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Button 
          variant="primary" 
          size="lg" 
          className="w-full mt-4"
          onClick={() => {
            addToast({ variant: 'success', title: 'Signed in!', description: 'Welcome to Return It' });
            setCurrentView('book-return');
          }}
        >
          Continue
        </Button>
      </FlexStack>
    </AppScreen>
  );

  const renderBookPickup = () => (
    <AppScreen 
      header={
        <AppBar 
          title="Book Pickup" 
          showBack 
          onBack={() => setCurrentView('welcome')} 
        />
      }
    >
      <FlexStack gap="md" className="py-4">
        {/* Address Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#1A1A1A] mb-3">
              Pickup Address
            </h3>
            <FlexStack gap="sm">
              <Input placeholder="Street Address" leftIcon={<MapPin className="h-4 w-4" />} />
              <ResponsiveGrid columns={{ default: 2 }} gap="sm">
                <Input placeholder="City" />
                <Input placeholder="ZIP" />
              </ResponsiveGrid>
            </FlexStack>
          </CardContent>
        </Card>

        {/* Return Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#1A1A1A] mb-3">
              Return Details
            </h3>
            <FlexStack gap="sm">
              <Input placeholder="Retailer (e.g., Target, Best Buy)" />
              <Input placeholder="Item description" />
            </FlexStack>
          </CardContent>
        </Card>

        {/* Package Size */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#1A1A1A] mb-3">
              Package Size
            </h3>
            <ResponsiveGrid columns={{ default: 3 }} gap="sm">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="primary" size="sm">Medium</Button>
              <Button variant="outline" size="sm">Large</Button>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-[#A47C48] text-white border-[#A47C48]">
          <CardContent className="p-4 text-center">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-[13px] leading-[18px] opacity-90">Total Cost</p>
                <p className="text-[22px] leading-[28px] font-bold">$12.99</p>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-[#A47C48]"
                onClick={() => {
                  addToast({ variant: 'success', title: 'Order Created!', description: 'Your pickup is scheduled.' });
                  setCurrentView('order-status');
                }}
                icon={<CreditCard className="h-4 w-4" />}
              >
                Pay & Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </FlexStack>
    </AppScreen>
  );

  const renderOrderStatus = () => (
    <AppScreen 
      header={
        <AppBar 
          title="Order Status" 
          showAction
          onAction={() => addToast({ variant: 'info', title: 'More options coming soon!' })}
        />
      }
    >
      <FlexStack gap="md" className="py-4">
        <CustomerOrderCard
          id="RET001"
          retailer="Target"
          address="123 Main St, San Francisco, CA"
          status="assigned"
          createdAt={new Date()}
          price={12.99}
          onAdvance={() => {
            addToast({ variant: 'success', title: 'Order Advanced!', description: 'Driver is on the way.' });
          }}
        />
        
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#1A1A1A] mb-3">
              Quick Actions
            </h3>
            <ResponsiveGrid columns={{ default: 2 }} gap="sm">
              <Button variant="outline" size="sm">Contact Driver</Button>
              <Button variant="outline" size="sm">Update Address</Button>
              <Button variant="outline" size="sm">Add Items</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('book-return')}>
                New Return
              </Button>
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </FlexStack>
    </AppScreen>
  );

  const renderNavigation = () => (
    <Card className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto border-2 border-[#FF8C42]">
      <CardContent className="p-3">
        <ResponsiveGrid columns={{ default: 4 }} gap="sm">
          <Button 
            variant={currentView === 'welcome' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setCurrentView('welcome')}
          >
            Welcome
          </Button>
          <Button 
            variant={currentView === 'login' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setCurrentView('login')}
          >
            Login
          </Button>
          <Button 
            variant={currentView === 'book-return' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setCurrentView('book-return')}
          >
            Book
          </Button>
          <Button 
            variant={currentView === 'order-status' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setCurrentView('order-status')}
          >
            Status
          </Button>
        </ResponsiveGrid>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-transparent relative">
      {/* Back to Design System */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/design-system-demo')}
        >
          ← Design System
        </Button>
      </div>

      {/* Current View */}
      <div className="pb-20"> {/* Space for bottom navigation */}
        {currentView === 'welcome' && renderWelcome()}
        {currentView === 'login' && renderLogin()}
        {currentView === 'book-return' && renderBookPickup()}
        {currentView === 'order-status' && renderOrderStatus()}
      </div>

      {/* Bottom Navigation */}
      {renderNavigation()}
    </div>
  );
}
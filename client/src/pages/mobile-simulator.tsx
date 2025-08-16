import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { ArrowLeft, Package, Car, MapPin, Camera, DollarSign, Clock } from 'lucide-react';
import { ReturnItIcon } from '@/components/ReturnItLogo';

export default function MobileSimulator() {
  const [currentApp, setCurrentApp] = useState<'customer' | 'driver'>('customer');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [address, setAddress] = useState('');
  const [packages, setPackages] = useState(1);

  const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-[350px] mx-auto bg-black rounded-[2.5rem] p-3 shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
      <div className="bg-white rounded-[2rem] h-full w-full overflow-hidden relative">
        {/* Phone Notch */}
        <div className="h-8 bg-black rounded-t-[2rem] flex justify-center items-center relative">
          <div className="w-20 h-1.5 bg-gray-800 rounded-full"></div>
          {/* Speaker */}
          <div className="absolute top-2 w-12 h-1 bg-gray-700 rounded-full"></div>
        </div>
        {/* App Content - Vertical Scrolling Only */}
        <div className="h-[calc(100%-32px)] w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );

  const CustomerApp = () => (
    <div className="h-full bg-amber-50 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#A47C48] text-white p-4 text-center w-full">
        <div className="flex items-center justify-center mb-2">
          <ReturnItIcon size={24} className="text-white mr-2" />
          <h1 className="text-xl font-bold">ReturnIt</h1>
        </div>
        <p className="text-sm opacity-90">Customer App</p>
      </div>

      <div className="p-4 space-y-4 w-full">
        {currentScreen === 'home' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Book a Return Pickup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Pickup Address
                  </label>
                  <Input
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border-amber-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Number of Packages
                  </label>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPackages(Math.max(1, packages - 1))}
                      className="w-8 h-8 p-0 border-amber-300 flex-shrink-0"
                    >
                      -
                    </Button>
                    <span className="text-lg font-bold text-amber-900 min-w-[2rem] text-center">{packages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPackages(packages + 1)}
                      className="w-8 h-8 p-0 border-amber-300 flex-shrink-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => setCurrentScreen('tracking')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Book Pickup - $3.99
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 text-xs sm:text-sm px-2"
                onClick={() => setCurrentScreen('history')}
              >
                Order History
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 text-xs sm:text-sm px-2"
                onClick={() => setCurrentApp('driver')}
              >
                Driver App
              </Button>
            </div>
          </>
        )}

        {currentScreen === 'tracking' && (
          <>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🚗</div>
                <h3 className="font-bold text-blue-900">Driver En Route</h3>
                <p className="text-sm text-blue-700">Mike will arrive in 15 minutes</p>
                <p className="text-xs text-blue-600 mt-2">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {address || '123 Main St, St. Louis'}
                </p>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </>
        )}

        {currentScreen === 'history' && (
          <>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-amber-900">Today</p>
                      <p className="text-sm text-green-600">In Progress</p>
                      <p className="text-xs text-gray-600">{packages} packages - $3.99</p>
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-amber-900">Yesterday</p>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xs text-gray-600">1 package - $3.99</p>
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const DriverApp = () => (
    <div className="h-full bg-green-50 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#A47C48] text-white p-4 text-center w-full">
        <div className="flex items-center justify-center mb-2">
          <ReturnItIcon size={24} className="text-white mr-2" />
          <h1 className="text-xl font-bold">ReturnIt Driver</h1>
        </div>
        <p className="text-sm opacity-90">Driver App</p>
      </div>

      <div className="p-4 space-y-4 w-full">
        <h2 className="text-lg font-bold text-green-900">Available Jobs</h2>
        
        <Card className="border-green-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-green-900 mb-2">Pickup Job #1234</h3>
            <div className="space-y-1 text-sm">
              <p className="flex items-center text-gray-700">
                <MapPin className="w-3 h-3 mr-1" />
                123 Main St, St. Louis
              </p>
              <p className="flex items-center text-gray-700">
                <Package className="w-3 h-3 mr-1" />
                2 packages
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="w-3 h-3 mr-1" />
                ASAP Pickup
              </p>
              <p className="flex items-center font-bold text-green-700">
                <DollarSign className="w-3 h-3 mr-1" />
                Earn $6.29 (70%)
              </p>
            </div>
            
            <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
              <Car className="w-4 h-4 mr-2" />
              Accept Job
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-green-900 mb-2">Pickup Job #1235</h3>
            <div className="space-y-1 text-sm">
              <p className="flex items-center text-gray-700">
                <MapPin className="w-3 h-3 mr-1" />
                456 Oak Ave, Clayton
              </p>
              <p className="flex items-center text-gray-700">
                <Package className="w-3 h-3 mr-1" />
                1 package
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="w-3 h-3 mr-1" />
                2-4 PM Today
              </p>
              <p className="flex items-center font-bold text-green-700">
                <DollarSign className="w-3 h-3 mr-1" />
                Earn $6.29 (70%)
              </p>
            </div>
            
            <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
              <Camera className="w-4 h-4 mr-2" />
              Accept Job
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full border-red-300 text-red-700"
          onClick={() => setCurrentApp('customer')}
        >
          Switch to Customer App
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-amber-800 hover:text-amber-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Platform
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Mobile App Demo</h1>
              <p className="text-amber-700">Test both customer and driver apps</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Simulator */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Phone Simulator - Always Vertical */}
          <div className="w-full max-w-sm mx-auto lg:mx-0 flex-shrink-0">
            <PhoneFrame>
              {currentApp === 'customer' ? <CustomerApp /> : <DriverApp />}
            </PhoneFrame>
          </div>

          {/* Controls */}
          <div className="space-y-6 flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">App Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-2">Current App:</p>
                  <div className="flex space-x-2">
                    <Button
                      variant={currentApp === 'customer' ? 'default' : 'outline'}
                      onClick={() => {
                        setCurrentApp('customer');
                        setCurrentScreen('home');
                      }}
                      className={currentApp === 'customer' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-300 text-amber-700'}
                    >
                      Customer App
                    </Button>
                    <Button
                      variant={currentApp === 'driver' ? 'default' : 'outline'}
                      onClick={() => {
                        setCurrentApp('driver');
                        setCurrentScreen('home');
                      }}
                      className={currentApp === 'driver' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700'}
                    >
                      Driver App
                    </Button>
                  </div>
                </div>

                {currentApp === 'customer' && (
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-2">Customer Screens:</p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-amber-300 text-amber-700"
                        onClick={() => setCurrentScreen('home')}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Book Pickup
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-amber-300 text-amber-700"
                        onClick={() => setCurrentScreen('tracking')}
                      >
                        <Car className="w-4 h-4 mr-2" />
                        Track Delivery
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-amber-300 text-amber-700"
                        onClick={() => setCurrentScreen('history')}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Order History
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">App Features</CardTitle>
              </CardHeader>
              <CardContent>
                {currentApp === 'customer' ? (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-amber-700">
                      <Package className="w-4 h-4 mr-2" />
                      Book return pickups
                    </p>
                    <p className="flex items-center text-amber-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      Real-time tracking
                    </p>
                    <p className="flex items-center text-amber-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Secure payments
                    </p>
                    <p className="flex items-center text-amber-700">
                      <Clock className="w-4 h-4 mr-2" />
                      Order history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-green-700">
                      <Car className="w-4 h-4 mr-2" />
                      Accept delivery jobs
                    </p>
                    <p className="flex items-center text-green-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      GPS navigation
                    </p>
                    <p className="flex items-center text-green-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Package verification
                    </p>
                    <p className="flex items-center text-green-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      70% earnings split
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
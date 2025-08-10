import React from 'react';
import { Screen } from '@/components/screen';
import { 
  Button, 
  Card, 
  CardContent, 
  CardTitle,
  Input, 
  TextArea,
  Chip, 
  Stepper,
  AppBar,
  CustomerOrderCard,
  DriverJobCard,
  useToast 
} from '@/components/design-system';
import { Package, User, Settings } from 'lucide-react';

export default function DesignSystemDemo() {
  const { addToast } = useToast();
  const [selectedChip, setSelectedChip] = React.useState<string>('medium');

  const showToast = (variant: 'default' | 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      variant,
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      description: 'This is a sample toast notification.',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <AppBar 
        title="Design System Demo" 
        showBack 
        showAction
        onBack={() => window.history.back()}
        onAction={() => addToast({ variant: 'info', title: 'More actions', description: 'Additional options coming soon!' })}
      />
      
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Buttons */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Buttons</CardTitle>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="default">Default</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon={<Package />}>With Icon</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Inputs</CardTitle>
            <div className="space-y-4 max-w-md">
              <Input 
                label="Name"
                placeholder="Enter your full name"
                helper="This will be shown on your order"
              />
              <Input 
                label="Email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<User className="h-4 w-4" />}
              />
              <Input 
                label="Phone (Error State)"
                placeholder="Enter phone number"
                error="Please enter a valid phone number"
              />
              <TextArea 
                label="Special Instructions"
                placeholder="Gate codes, fragile items, etc."
                helper="Optional additional information for the driver"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chips and Status */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Chips & Status</CardTitle>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Package Size Selection</p>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <Chip
                      key={size}
                      label={size.charAt(0).toUpperCase() + size.slice(1)}
                      selected={selectedChip === size}
                      onClick={() => setSelectedChip(size)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Status Pills</p>
                <div className="flex flex-wrap gap-2">
                  <Chip label="Created" status="created" shape="pill" />
                  <Chip label="Assigned" status="assigned" shape="pill" />
                  <Chip label="Picked Up" status="picked_up" shape="pill" />
                  <Chip label="Completed" status="completed" shape="pill" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Order Status Stepper</p>
                <Stepper currentStatus="picked_up" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Cards */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Order Cards</CardTitle>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Customer Order Card</p>
                <CustomerOrderCard
                  id="RET001"
                  retailer="Target"
                  address="123 Main St, San Francisco, CA"
                  status="picked_up"
                  createdAt={new Date()}
                  price={12.99}
                  onAdvance={() => addToast({ variant: 'info', title: 'Order Advanced', description: 'Order status updated successfully!' })}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Driver Job Card</p>
                <DriverJobCard
                  id="JOB123"
                  retailer="Best Buy"
                  address="456 Oak Ave, San Francisco, CA"
                  status="available"
                  estimatedEarning={15}
                  distance="1.2 mi"
                  onAccept={() => addToast({ variant: 'success', title: 'Job Accepted', description: 'You can now proceed to pickup location.' })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Toast Notifications</CardTitle>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => showToast('default')}>Default Toast</Button>
              <Button variant="secondary" onClick={() => showToast('success')}>Success Toast</Button>
              <Button variant="secondary" onClick={() => showToast('error')}>Error Toast</Button>
              <Button variant="secondary" onClick={() => showToast('warning')}>Warning Toast</Button>
              <Button variant="secondary" onClick={() => showToast('info')}>Info Toast</Button>
            </div>
          </CardContent>
        </Card>

        {/* Typography Scale */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Typography</CardTitle>
            <div className="space-y-3">
              <div className="text-[28px] leading-[34px] font-extrabold text-[#1A1A1A]">
                H1 Heading (28px/34px, weight 800)
              </div>
              <div className="text-[22px] leading-[28px] font-bold text-[#1A1A1A]">
                H2 Heading (22px/28px, weight 700)
              </div>
              <div className="text-[16px] leading-[24px] font-normal text-[#1A1A1A]">
                Body Text (16px/24px, weight 400) - This is the main body text used throughout the application for readable content and descriptions.
              </div>
              <div className="text-[13px] leading-[18px] font-normal text-[#7B5E3B]">
                Caption Text (13px/18px, weight 400) - Used for helper text, labels, and secondary information.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Color Palette</CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#D2B48C] rounded-[10px]"></div>
                <p className="text-sm font-medium">Cardboard #D2B48C</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#F8F7F4] border border-[#D2B48C] rounded-[10px]"></div>
                <p className="text-sm font-medium">Off White #F8F7F4</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#1A1A1A] rounded-[10px]"></div>
                <p className="text-sm font-medium">Barcode #1A1A1A</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#7B5E3B] rounded-[10px]"></div>
                <p className="text-sm font-medium">Tape Brown #7B5E3B</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#FF8C42] rounded-[10px]"></div>
                <p className="text-sm font-medium">Accent Orange #FF8C42</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-[#2E7D32] rounded-[10px]"></div>
                <p className="text-sm font-medium">Success Green #2E7D32</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Demo */}
        <Card className="bg-gradient-to-r from-[#FF8C42] to-[#e07530] text-white border-none">
          <CardContent className="p-6">
            <CardTitle className="mb-4 text-white">📱 Mobile-First Experience</CardTitle>
            <p className="text-white/90 mb-4">
              See how the design system works in a mobile-first app experience with responsive layouts and touch-friendly interactions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/mobile-app-demo'}
                className="bg-white text-[#FF8C42] hover:bg-gray-50"
              >
                View Mobile App Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="border-white text-white hover:bg-white/10"
              >
                Back to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/store/use-app';

export default function OrderStatus() {
  const [location, setLocation] = useLocation();
  const orders = useApp((s) => s.orders);
  const updateOrder = useApp((s) => s.updateOrder);

  // Extract order ID from URL
  const orderId = location.split('/').pop();
  const order = orderId ? orders[orderId] : undefined;

  if (!order) {
    return (
      <Screen>
        <Header title="Order not found" />
        <Button 
          className="brand-button-contained"
          onClick={() => setLocation('/book-pickup')}
          data-testid="button-back-to-booking"
        >
          Back to booking
        </Button>
      </Screen>
    );
  }

  const steps = ['created', 'assigned', 'picked_up', 'dropped_off', 'refunded'];
  const currentIndex = steps.indexOf(order.status);

  const formatDate = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, 'MMM d, h:mma');
  };

  const handleAdvanceStatus = () => {
    if (currentIndex < steps.length - 1) {
      updateOrder(order.id, { status: steps[currentIndex + 1] });
    }
  };

  return (
    <Screen>
      <Header 
        title={`Order #${order.id}`}
        subtitle={`Created ${formatDate(order.createdAt)}`}
      />
      
      <Card className="brand-card">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-foreground mb-1">
            {order.retailer}
          </h2>
          <p className="text-muted-foreground mb-4">
            {order.pickupAddress}
          </p>

          <Separator className="my-4" />

          <p className="text-foreground font-medium mb-3">Status</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {steps.map((step, idx) => (
              <span
                key={step}
                className={`brand-chip ${idx <= currentIndex ? 'brand-chip-selected' : ''}`}
                data-testid={`status-${step}`}
              >
                {step.replace('_', ' ')}
              </span>
            ))}
          </div>

          {currentIndex < steps.length - 1 && (
            <Button
              variant="outline"
              className="brand-button-outlined w-full mb-2"
              onClick={handleAdvanceStatus}
              data-testid="button-advance-status"
            >
              Advance (demo)
            </Button>
          )}

          <Button
            className="brand-button-contained w-full"
            onClick={() => setLocation('/')}
            data-testid="button-done"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    </Screen>
  );
}

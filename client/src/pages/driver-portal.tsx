import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { useApp } from '@/store/use-app';

export default function DriverPortal() {
  const orders = useApp((s) => s.orders);
  const updateOrder = useApp((s) => s.updateOrder);
  
  const openJobs = Object.values(orders).filter(
    (order) => order.status === 'created' || order.status === 'assigned'
  );

  const handleAcceptJob = (orderId: string) => {
    updateOrder(orderId, { status: 'assigned' });
  };

  const handlePickedUp = (orderId: string) => {
    updateOrder(orderId, { status: 'picked_up' });
  };

  const handleDroppedOff = (orderId: string) => {
    updateOrder(orderId, { status: 'dropped_off' });
  };

  return (
    <Screen>
      <Header 
        title="Driver Portal" 
        subtitle="Accept jobs and get paid fast" 
      />
      
      {openJobs.length === 0 ? (
        <EmptyState 
          title="No open jobs" 
          subtitle="New return pickups will appear here." 
        />
      ) : (
        <div className="space-y-3">
          {openJobs.map((order) => (
            <Card key={order.id} className="brand-card">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  #{order.id} • {order.retailer}
                </h3>
                <p className="text-muted-foreground mb-3">
                  {order.pickupAddress}
                </p>
                
                <div className="flex gap-2">
                  {order.status === 'created' && (
                    <Button
                      className="brand-button-contained"
                      onClick={() => handleAcceptJob(order.id)}
                      data-testid={`button-accept-${order.id}`}
                    >
                      Accept
                    </Button>
                  )}
                  
                  {order.status === 'assigned' && (
                    <>
                      <Button
                        variant="outline"
                        className="brand-button-outlined"
                        onClick={() => handlePickedUp(order.id)}
                        data-testid={`button-picked-up-${order.id}`}
                      >
                        Picked Up
                      </Button>
                      <Button
                        className="brand-button-contained"
                        onClick={() => handleDroppedOff(order.id)}
                        data-testid={`button-dropped-off-${order.id}`}
                      >
                        Dropped Off
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}

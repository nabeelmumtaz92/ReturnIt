import { useState } from 'react';
import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/store/use-app';

export default function BookPickup() {
  const [, setLocation] = useLocation();
  const createOrder = useApp((s) => s.createOrder);
  const user = useApp((s) => s.user);

  const [name, setName] = useState(user?.name ?? '');
  const [pickupAddress, setPickupAddress] = useState('123 Main St');
  const [retailer, setRetailer] = useState('Target');
  const [notes, setNotes] = useState('');
  const price = 15;

  const handleCreateOrder = () => {
    if (!name.trim() || !pickupAddress.trim() || !retailer.trim()) return;
    
    const id = createOrder({
      customerName: name,
      pickupAddress,
      retailer,
      notes,
      price
    });
    setLocation(`/order-status/${id}`);
  };

  return (
    <Screen>
      <Header 
        title="Book a pickup" 
        subtitle="We'll handle the return for you" 
      />
      
      <Card className="brand-card">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Your name</Label>
              <Input
                id="customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="brand-input"
                data-testid="input-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-address">Pickup address</Label>
              <Input
                id="pickup-address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="brand-input"
                data-testid="input-pickup-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailer">Retailer</Label>
              <Input
                id="retailer"
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                className="brand-input"
                data-testid="input-retailer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="brand-input"
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <Separator className="my-4" />

            <p className="text-lg font-semibold text-foreground mb-4">
              Estimated price: ${price}
            </p>

            <Button
              className="brand-button-contained w-full"
              onClick={handleCreateOrder}
              disabled={!name.trim() || !pickupAddress.trim() || !retailer.trim()}
              data-testid="button-create-order"
            >
              Pay & Create Order (mock)
            </Button>
          </div>
        </CardContent>
      </Card>
    </Screen>
  );
}

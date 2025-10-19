import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TipModalProps {
  orderId: string;
  trackingNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TIPS = [
  { label: '$2', value: 2 },
  { label: '$3', value: 3 },
  { label: '$5', value: 5 },
  { label: '$10', value: 10 }
];

export function TipModal({ orderId, trackingNumber, isOpen, onClose }: TipModalProps) {
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitTip = async () => {
    const tipAmount = customTip ? parseFloat(customTip) : selectedTip;

    if (!tipAmount || tipAmount <= 0) {
      toast({
        title: 'Invalid tip',
        description: 'Please select or enter a tip amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(`/api/orders/${orderId}/tip`, {
        method: 'POST',
        body: JSON.stringify({ tipAmount })
      });

      toast({
        title: 'Tip added!',
        description: `$${tipAmount.toFixed(2)} tip added to your order`
      });

      // Invalidate order queries
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add tip. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Add a Tip
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for great service on order {trackingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset tip buttons */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_TIPS.map((tip) => (
              <Button
                key={tip.value}
                variant={selectedTip === tip.value ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedTip(tip.value);
                  setCustomTip('');
                }}
                className="h-16"
                data-testid={`button-tip-${tip.value}`}
              >
                {tip.label}
              </Button>
            ))}
          </div>

          {/* Custom tip input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Or enter custom amount:</label>
            <div className="flex items-center gap-2">
              <span className="text-lg">$</span>
              <input
                type="number"
                min="0"
                step="0.50"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setSelectedTip(0);
                }}
                className="flex-1 px-3 py-2 border border-input rounded-md"
                data-testid="input-custom-tip"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-skip-tip"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitTip}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || (!selectedTip && !customTip)}
              data-testid="button-submit-tip"
            >
              {isSubmitting ? 'Processing...' : 'Add Tip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

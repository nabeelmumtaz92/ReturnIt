import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Heart, Star, DollarSign } from 'lucide-react';

interface PostDeliveryTipPromptProps {
  orderId: string;
  currentTip: number;
  driverName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDeliveryTipPrompt({
  orderId,
  currentTip,
  driverName = 'your driver',
  isOpen,
  onClose
}: PostDeliveryTipPromptProps) {
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTipMutation = useMutation({
    mutationFn: async (tipAmount: number) => {
      return apiRequest('POST', `/api/orders/${orderId}/tip`, { tipAmount });
    },
    onSuccess: () => {
      toast({
        title: 'Thank you! 💯',
        description: `Your tip has been added. ${driverName} will receive 100% of it!`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tracking/${orderId}`] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add tip',
        variant: 'destructive',
      });
    },
  });

  const handleAddTip = () => {
    const tipAmount = customTip ? parseFloat(customTip) : selectedTip;
    
    if (tipAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please select or enter a tip amount',
        variant: 'destructive',
      });
      return;
    }

    addTipMutation.mutate(tipAmount);
  };

  const handleSkip = () => {
    // Store that user dismissed the prompt so we don't show it again
    localStorage.setItem(`tip-prompt-dismissed-${orderId}`, 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Was {driverName} awesome?
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Show your appreciation for great service!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 100% to driver banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-center justify-center">
              <span className="text-3xl">💯</span>
              <div>
                <div className="text-sm">100% of your tip goes</div>
                <div className="text-lg">directly to {driverName}!</div>
              </div>
            </div>
          </div>

          {/* Current tip display */}
          {currentTip > 0 && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
              <p className="text-sm text-amber-800">
                You already tipped <span className="font-bold">${currentTip.toFixed(2)}</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">Add more below to show extra appreciation</p>
            </div>
          )}

          {/* Quick tip buttons */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Quick Tip Amounts:</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={selectedTip === 3 ? "default" : "outline"}
                onClick={() => {
                  setSelectedTip(3);
                  setCustomTip('');
                }}
                className={selectedTip === 3 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                data-testid="button-tip-3"
              >
                <DollarSign className="h-4 w-4" />
                3
              </Button>
              <Button
                type="button"
                variant={selectedTip === 5 ? "default" : "outline"}
                onClick={() => {
                  setSelectedTip(5);
                  setCustomTip('');
                }}
                className={selectedTip === 5 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                data-testid="button-tip-5"
              >
                <DollarSign className="h-4 w-4" />
                5
              </Button>
              <Button
                type="button"
                variant={selectedTip === 8 ? "default" : "outline"}
                onClick={() => {
                  setSelectedTip(8);
                  setCustomTip('');
                }}
                className={selectedTip === 8 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                data-testid="button-tip-8"
              >
                <DollarSign className="h-4 w-4" />
                8
              </Button>
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="customTip" className="text-sm font-semibold">Or Enter Custom Amount:</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="customTip"
                type="number"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setSelectedTip(0);
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-7"
                data-testid="input-custom-tip"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              data-testid="button-skip-tip"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleAddTip}
              disabled={addTipMutation.isPending || (selectedTip === 0 && !customTip)}
              className="flex-1 bg-[#B8956A] hover:bg-[#A07A4F]"
              data-testid="button-add-tip"
            >
              <Heart className="h-4 w-4 mr-2" />
              {addTipMutation.isPending ? 'Adding...' : 'Add Tip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

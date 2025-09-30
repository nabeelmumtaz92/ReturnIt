import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DollarSign, Save, Loader2 } from "lucide-react";

export function PricingSettings() {
  const { toast } = useToast();
  const [price, setPrice] = useState<string>("3.99");

  // Fetch current base price setting
  const { data: basePriceSetting, isLoading } = useQuery<any>({
    queryKey: ['/api/settings/base_price']
  });

  // Update price when data loads
  useEffect(() => {
    if (basePriceSetting?.value?.price) {
      setPrice(basePriceSetting.value.price.toString());
    }
  }, [basePriceSetting]);

  // Update base price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async (newPrice: number) => {
      return await apiRequest('/api/admin/settings/base_price', 'PUT', {
        value: { price: newPrice },
        description: 'Base flat fee for all deliveries',
        category: 'pricing'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/base_price'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Base price updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update price",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    updatePriceMutation.mutate(parsedPrice);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Configuration
        </CardTitle>
        <CardDescription>
          Set the base flat fee for all delivery services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-price">Base Delivery Fee ($)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="base-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
                placeholder="3.99"
                data-testid="input-base-price"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={updatePriceMutation.isPending}
              data-testid="button-save-price"
            >
              {updatePriceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Current price: ${(basePriceSetting as any)?.value?.price || price || "3.99"}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How pricing works</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• This is the base flat fee charged for all deliveries</li>
            <li>• Additional fees (surge pricing, special handling) can be added separately</li>
            <li>• Price changes apply to all new orders immediately</li>
            <li>• Existing orders retain their original pricing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

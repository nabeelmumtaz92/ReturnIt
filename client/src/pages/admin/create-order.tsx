import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required").transform(Number),
  pickupStreetAddress: z.string().min(1, "Street address is required"),
  pickupCity: z.string().min(1, "City is required"),
  pickupState: z.string().length(2, "State must be 2 characters"),
  pickupZipCode: z.string().length(5, "ZIP code must be 5 digits"),
  retailer: z.string().min(1, "Retailer is required"),
  itemCategory: z.string().min(1, "Item category is required"),
  serviceTier: z.enum(["standard", "priority", "instant"]),
  pickupInstructions: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export default function CreateOrder() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      userId: "",
      pickupStreetAddress: "",
      pickupCity: "",
      pickupState: "",
      pickupZipCode: "",
      retailer: "",
      itemCategory: "",
      serviceTier: "standard",
      pickupInstructions: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderFormData) => {
      return await apiRequest('/api/admin/orders/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      setLocation('/admin/orders');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateOrderFormData) => {
    createOrderMutation.mutate(data);
  };

  const pricingTiers = {
    standard: { price: 6.99, driver: 5.00 },
    priority: { price: 9.99, driver: 8.00 },
    instant: { price: 12.99, driver: 10.00 },
  };

  const selectedTierPricing = pricingTiers[form.watch("serviceTier") as keyof typeof pricingTiers];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Manual Order</h1>
        <p className="text-muted-foreground">Create a new return order for a customer</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer User ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter customer user ID"
                            data-testid="input-userId"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pickup Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pickupStreetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main St" data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pickupCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="St. Louis" data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pickupState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="MO" maxLength={2} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pickupZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="63101" maxLength={5} data-testid="input-zipcode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Return Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="retailer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retailer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Target, Walmart, Amazon, etc." data-testid="input-retailer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="itemCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                            <SelectItem value="Beauty & Health">Beauty & Health</SelectItem>
                            <SelectItem value="Books & Media">Books & Media</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special instructions for the driver..."
                            rows={3}
                            data-testid="textarea-instructions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="serviceTier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Tier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tier">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard ($6.99)</SelectItem>
                            <SelectItem value="priority">Priority ($9.99)</SelectItem>
                            <SelectItem value="instant">Instant ($12.99)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer Pays:</span>
                      <span className="font-bold" data-testid="price-customer">${selectedTierPricing.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Driver Earns:</span>
                      <span className="font-medium text-green-600" data-testid="price-driver">${selectedTierPricing.driver}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee:</span>
                      <span className="font-medium" data-testid="price-fee">${(selectedTierPricing.price - selectedTierPricing.driver).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createOrderMutation.isPending}
                    data-testid="button-create-order"
                  >
                    {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingBag, CheckCircle2, Building2 } from "lucide-react";

// Validation schema for company selection step
const selectSchema = z.object({
  companyId: z.number({ required_error: "Please select a company" }),
  acceptedTerms: z.boolean().optional(),
});

// Validation schema for final registration step
const registrationSchema = z.object({
  companyId: z.number({ required_error: "Please select a company" }),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RetailerRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  const { data: companiesData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const form = useForm<RegistrationFormData>({
    // No resolver - we'll do manual validation in onSubmit based on step
    defaultValues: {
      acceptedTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      return await apiRequest("POST", "/api/retailer/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailer/dashboard"] });
      setStep('success');
      setTimeout(() => {
        setLocation("/retailer/dashboard");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to register retailer account",
      });
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Current step:', step);
    console.log('Form errors:', form.formState.errors);
    
    if (step === 'select') {
      // Only validate companyId in select step
      const selectResult = selectSchema.safeParse(data);
      if (!selectResult.success) {
        console.log('Select validation failed:', selectResult.error);
        return;
      }
      setStep('confirm');
    } else if (step === 'confirm') {
      // Validate full registration in confirm step
      const registrationResult = registrationSchema.safeParse(data);
      if (!registrationResult.success) {
        console.log('Registration validation failed:', registrationResult.error);
        return;
      }
      registerMutation.mutate(data);
    }
  };
  
  // Log form value changes
  const watchedCompanyId = form.watch('companyId');
  console.log('Watched companyId:', watchedCompanyId);

  const selectedCompany = companiesData?.find(
    (c: any) => c.id === form.watch('companyId')
  );

  if (loadingCompanies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your retailer account has been created. You're being redirected to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join Return It for Retailers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Streamline your return process and gain valuable insights
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'select' ? 'Select Your Company' : 'Confirm Registration'}
            </CardTitle>
            <CardDescription>
              {step === 'select'
                ? 'Choose your company from the list below'
                : 'Review and confirm your registration details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 'select' && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Select your company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companiesData?.map((company: any) => (
                              <SelectItem
                                key={company.id}
                                value={company.id.toString()}
                                data-testid={`option-company-${company.id}`}
                              >
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Don't see your company? Contact support@returnit.online
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {step === 'confirm' && selectedCompany && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-gray-800 p-4 rounded-lg border border-orange-200 dark:border-gray-700">
                      <div className="flex items-start space-x-3">
                        <Building2 className="h-6 w-6 text-orange-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                          {selectedCompany.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {selectedCompany.description}
                            </p>
                          )}
                          {selectedCompany.category && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Category: {selectedCompany.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold mb-2">What's Included:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>14-day free trial</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>100 included orders per month</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Real-time analytics dashboard</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>API access for integrations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Location and policy management</span>
                        </li>
                      </ul>
                    </div>

                    <FormField
                      control={form.control}
                      name="acceptedTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-accept-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the{" "}
                              <a
                                href="/terms"
                                target="_blank"
                                className="text-orange-600 hover:underline"
                              >
                                Terms & Conditions
                              </a>{" "}
                              and{" "}
                              <a
                                href="/privacy"
                                target="_blank"
                                className="text-orange-600 hover:underline"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  {step === 'confirm' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('select')}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={registerMutation.isPending}
                    data-testid="button-continue"
                  >
                    {registerMutation.isPending
                      ? "Registering..."
                      : step === 'select'
                      ? "Continue"
                      : "Complete Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

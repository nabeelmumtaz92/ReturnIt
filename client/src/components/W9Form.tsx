import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const w9FormSchema = z.object({
  taxId: z.string()
    .min(9, "Tax ID must be at least 9 digits")
    .max(11, "Tax ID must be at most 11 characters")
    .regex(/^[\d-]+$/, "Tax ID must contain only digits and dashes"),
  taxIdType: z.enum(["ssn", "ein"]),
  businessClassification: z.enum([
    "individual",
    "sole_proprietor",
    "c_corporation",
    "s_corporation",
    "partnership",
    "trust_estate",
    "llc",
    "other"
  ]),
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 letters"),
  zipCode: z.string()
    .min(5, "ZIP code must be at least 5 digits")
    .max(10, "ZIP code must be at most 10 characters"),
  signature: z.string().min(1, "Signature is required"),
  certificationConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm the certification",
  }),
});

type W9FormData = z.infer<typeof w9FormSchema>;

interface W9FormProps {
  onSuccess?: () => void;
}

const certificationText = `Under penalties of perjury, I certify that:
1. The number shown on this form is my correct taxpayer identification number, and
2. I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding, or (c) the IRS has notified me that I am no longer subject to backup withholding, and
3. I am a U.S. citizen or other U.S. person, and
4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.`;

export function W9Form({ onSuccess }: W9FormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<W9FormData>({
    resolver: zodResolver(w9FormSchema),
    defaultValues: {
      taxId: "",
      taxIdType: "ssn",
      businessClassification: "individual",
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      signature: "",
      certificationConfirmed: false,
    },
  });

  const submitW9Mutation = useMutation({
    mutationFn: async (data: W9FormData) => {
      const { certificationConfirmed, ...formData } = data;
      return await apiRequest("POST", "/api/driver/w9", {
        ...formData,
        certificationText,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "W-9 Submitted Successfully",
        description: "Your tax information has been securely stored.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/w9"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit W-9 form. Please try again.",
      });
    },
  });

  const onSubmit = (data: W9FormData) => {
    submitW9Mutation.mutate(data);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold">W-9 Form Submitted</h3>
            <p className="text-center text-muted-foreground">
              Your tax information has been securely stored. You can now proceed with driver onboarding.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>IRS Form W-9</CardTitle>
        <CardDescription>
          Request for Taxpayer Identification Number and Certification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This information is required by the IRS for tax reporting purposes. Your data is stored securely and used only for tax compliance.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tax ID Type */}
          <div className="space-y-2">
            <Label htmlFor="taxIdType">Tax ID Type</Label>
            <Select
              value={form.watch("taxIdType")}
              onValueChange={(value) => form.setValue("taxIdType", value as "ssn" | "ein")}
            >
              <SelectTrigger id="taxIdType" data-testid="select-taxIdType">
                <SelectValue placeholder="Select tax ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
                <SelectItem value="ein">Employer Identification Number (EIN)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.taxIdType && (
              <p className="text-sm text-red-600">{form.formState.errors.taxIdType.message}</p>
            )}
          </div>

          {/* Tax ID */}
          <div className="space-y-2">
            <Label htmlFor="taxId">
              {form.watch("taxIdType") === "ssn" ? "Social Security Number" : "Employer Identification Number"}
            </Label>
            <Input
              id="taxId"
              data-testid="input-taxId"
              type="text"
              placeholder={form.watch("taxIdType") === "ssn" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
              {...form.register("taxId")}
              className="font-mono"
            />
            {form.formState.errors.taxId && (
              <p className="text-sm text-red-600">{form.formState.errors.taxId.message}</p>
            )}
          </div>

          {/* Business Classification */}
          <div className="space-y-2">
            <Label htmlFor="businessClassification">Business Classification</Label>
            <Select
              value={form.watch("businessClassification")}
              onValueChange={(value) => form.setValue("businessClassification", value as any)}
            >
              <SelectTrigger id="businessClassification" data-testid="select-businessClassification">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual/Sole Proprietor</SelectItem>
                <SelectItem value="sole_proprietor">Sole Proprietor or Single-Member LLC</SelectItem>
                <SelectItem value="c_corporation">C Corporation</SelectItem>
                <SelectItem value="s_corporation">S Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="trust_estate">Trust/Estate</SelectItem>
                <SelectItem value="llc">Limited Liability Company</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.businessClassification && (
              <p className="text-sm text-red-600">{form.formState.errors.businessClassification.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (as shown on tax return)</Label>
            <Input
              id="fullName"
              data-testid="input-fullName"
              type="text"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              data-testid="input-address"
              type="text"
              {...form.register("address")}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                data-testid="input-city"
                type="text"
                {...form.register("city")}
              />
              {form.formState.errors.city && (
                <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                data-testid="input-state"
                type="text"
                maxLength={2}
                placeholder="MO"
                {...form.register("state")}
              />
              {form.formState.errors.state && (
                <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                data-testid="input-zipCode"
                type="text"
                {...form.register("zipCode")}
              />
              {form.formState.errors.zipCode && (
                <p className="text-sm text-red-600">{form.formState.errors.zipCode.message}</p>
              )}
            </div>
          </div>

          {/* Certification */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <h4 className="font-semibold">Certification</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {certificationText}
            </p>

            <div className="space-y-2">
              <Label htmlFor="signature">Electronic Signature (Type your full name)</Label>
              <Input
                id="signature"
                data-testid="input-signature"
                type="text"
                placeholder="Type your full name"
                {...form.register("signature")}
                className="font-mono"
              />
              {form.formState.errors.signature && (
                <p className="text-sm text-red-600">{form.formState.errors.signature.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="certificationConfirmed"
                data-testid="checkbox-certificationConfirmed"
                checked={form.watch("certificationConfirmed")}
                onCheckedChange={(checked) => 
                  form.setValue("certificationConfirmed", checked as boolean)
                }
              />
              <Label
                htmlFor="certificationConfirmed"
                className="text-sm font-normal leading-tight cursor-pointer"
              >
                I certify that the information provided above is true, correct, and complete under penalties of perjury.
              </Label>
            </div>
            {form.formState.errors.certificationConfirmed && (
              <p className="text-sm text-red-600">{form.formState.errors.certificationConfirmed.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              data-testid="button-submit-w9"
              disabled={submitW9Mutation.isPending}
              className="min-w-[150px]"
            >
              {submitW9Mutation.isPending ? "Submitting..." : "Submit W-9"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

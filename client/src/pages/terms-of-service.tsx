import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-white to-transparent">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-foreground"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/">
              <div className="text-xl font-bold text-foreground cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105">
                Return It
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/90 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-accent p-3 rounded-full">
                <Scale className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Effective Date: August 14, 2025
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Welcome to Return It, LLC ("Company," "we," "our," or "us"). These Terms of Service ("Terms") govern 
                your use of our return delivery services, driver platform, and admin dashboard (collectively, the 
                "Services"). By using the Services, you agree to these Terms.
              </p>

              <div className="bg-accent border-l-4 border-primary p-4 rounded">
                <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  1. Eligibility
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Customers:</strong> You must be at least 18 years old to create an account and use the Services. 
                  Parents/guardians are responsible if minors use an account.</p>
                  <p><strong>Drivers:</strong> You must be at least 18 years old to provide Services, or 19 years old if required by state law 
                  (Arizona, California, Colorado, Delaware, Florida, Georgia, Idaho, Kentucky, Montana, New Jersey, 
                  New Mexico, Texas, Utah, West Virginia).</p>
                  <p><strong>Alcohol Returns/Deliveries (if applicable):</strong> You must be 21 years old or older with valid 
                  government-issued identification.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">2. Services</h2>
                <p className="text-gray-700">
                  Return It provides return delivery services by connecting customers with independent drivers. Drivers 
                  operate as independent contractors and not employees of Return It.
                </p>

                <h2 className="text-xl font-semibold text-foreground">3. Accounts</h2>
                <p className="text-gray-700">
                  You must register with accurate information and maintain account confidentiality. Admins may use 
                  "impersonation mode" for troubleshooting, with all activity logged.
                </p>

                <h2 className="text-xl font-semibold text-foreground">4. Payments</h2>
                <p className="text-gray-700">
                  Customers agree to pay service fees and applicable charges. Drivers agree to payout terms, including 
                  instant payout fees, as displayed in the dashboard. All payments are logged in the Payment Records 
                  and Driver Payouts systems.
                </p>

                <h2 className="text-xl font-semibold text-foreground">5. Cancellations & Refunds</h2>
                <p className="text-gray-700">
                  Customers may cancel orders in line with policies displayed in the app/dashboard. Refunds, if 
                  applicable, are processed according to our policy.
                </p>

                <h2 className="text-xl font-semibold text-foreground">6. Prohibited Conduct</h2>
                <p className="text-gray-700">
                  Fraud, harassment, unsafe conduct, or misuse of the Services is prohibited. Violations may lead to 
                  suspension or termination of accounts.
                </p>

                <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
                <p className="text-gray-700">
                  Services are provided "as is." Return It is not liable for indirect damages, lost items, or failures caused 
                  by third parties.
                </p>

                <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
                <p className="text-gray-700">
                  We may suspend or terminate accounts for violations. You may close your account at any time.
                </p>

                <h2 className="text-xl font-semibold text-foreground">9. Dispute Resolution</h2>
                <p className="text-gray-700">
                  Disputes should first be addressed internally. Unresolved disputes will be settled by binding arbitration 
                  in Missouri, unless prohibited by law.
                </p>

                <h2 className="text-xl font-semibold text-foreground">10. Changes</h2>
                <p className="text-gray-700">
                  We may update these Terms at any time. Continued use of the Services means you accept the updates.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
                <p className="text-gray-700">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-700">Email: <a href="mailto:support@returnit.online" className="text-primary hover:text-primary">support@returnit.online</a></p>
                  <p className="text-gray-700">Return It, LLC – 1214 Devonworth Drive, St. Louis, MO, 63017</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
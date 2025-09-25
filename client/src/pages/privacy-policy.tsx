import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, UserCheck } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-800 hover:text-amber-900"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/">
              <div className="text-xl font-bold text-amber-900 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105">
                Return It
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-amber-900">
              Privacy Policy
            </CardTitle>
            <p className="text-amber-700 mt-2">
              Effective Date: August 14, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-amber max-w-none">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. This Privacy Policy explains how Return It, LLC ("we," "our," or "us") 
                collects, uses, and protects personal information.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <h2 className="text-xl font-semibold text-amber-900 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  1. Information We Collect
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>From Customers:</strong> Name, contact details, addresses, payment info, order history.</p>
                  <p><strong>From Drivers:</strong> Name, contact details, driver's license, insurance info, payout preferences, 
                  performance data.</p>
                  <p><strong>Automatically:</strong> Device info, usage data, cookies, and driver location data while active.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-amber-900">2. How We Use Information</h2>
                <p className="text-gray-700">
                  We use data to provide and improve Services, process payments and driver payouts, communicate 
                  with customers and drivers, and ensure safety and compliance (fraud prevention, issue resolution).
                </p>

                <h2 className="text-xl font-semibold text-amber-900">3. Sharing of Information</h2>
                <p className="text-gray-700">
                  Information may be shared with payment processors, tax authorities (e.g., 1099 filings), and contracted 
                  service providers. Data is never sold to third parties for advertising.
                </p>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <h2 className="text-xl font-semibold text-amber-900 mb-3 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    4. Data Security
                  </h2>
                  <p className="text-gray-700">
                    Encryption, secure storage, and role-based access controls are used. Admin impersonation is logged 
                    and restricted to troubleshooting.
                  </p>
                </div>

                <h2 className="text-xl font-semibold text-amber-900">5. Data Retention</h2>
                <p className="text-gray-700">
                  Customer/driver data is kept while accounts are active or as legally required. You may request deletion 
                  of your data, subject to legal/tax obligations.
                </p>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                  <h2 className="text-xl font-semibold text-amber-900 mb-3 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    6. Your Rights
                  </h2>
                  <p className="text-gray-700">
                    You may access, correct, delete, or request exports of your data, and opt out of marketing 
                    communications.
                  </p>
                </div>

                <h2 className="text-xl font-semibold text-amber-900">7. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our Services are not directed to individuals under 18.
                </p>

                <h2 className="text-xl font-semibold text-amber-900">8. International Data Transfers</h2>
                <p className="text-gray-700">
                  Data may be processed outside your country, with appropriate safeguards in place.
                </p>

                <h2 className="text-xl font-semibold text-amber-900">9. Changes</h2>
                <p className="text-gray-700">
                  Updates will be posted here. Continued use of Services indicates acceptance.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
                <h2 className="text-xl font-semibold text-amber-900 mb-4">10. Contact Us</h2>
                <p className="text-gray-700 mb-3">
                  For questions about privacy or to exercise your rights, contact us:
                </p>
                <div className="space-y-1">
                  <p className="text-gray-700">Email: <a href="mailto:support@returnit.online" className="text-amber-600 hover:text-amber-700">support@returnit.online</a></p>
                  <p className="text-gray-700">ReturnIt, LLC – 1214 Devonworth Drive, St. Louis, MO, 63017</p>
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
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Last Updated: November 1, 2025
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Return It ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our mobile application and 
                website (collectively, the "Service").
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-800 font-medium">
                  If you do not agree with the terms of this privacy policy, please do not access the Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-foreground">1.1 Personal Information You Provide</h3>
                <p className="text-gray-700">
                  We collect information that you voluntarily provide when you register, book services, apply as a driver, 
                  or contact support:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li><strong>Contact Information:</strong> Name, email, phone number, mailing address</li>
                  <li><strong>Account Credentials:</strong> Username, encrypted password</li>
                  <li><strong>Identity Verification (Drivers):</strong> DOB, driver's license, SSN (for tax reporting via Stripe Identity)</li>
                  <li><strong>Financial Information:</strong> Payment cards (via Stripe), bank accounts for payouts, debit cards for instant pay</li>
                  <li><strong>Return Details:</strong> Store locations, item descriptions, values, photos of items/receipts/tags</li>
                  <li><strong>Communications:</strong> In-app messages, support inquiries</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">1.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li><strong>Device Information:</strong> Device type, OS, unique identifiers, network information</li>
                  <li><strong>Location Data:</strong> Real-time GPS (when enabled) for driver matching and tracking</li>
                  <li><strong>Usage Data:</strong> Features used, pages viewed, time spent, interactions</li>
                  <li><strong>Log Data:</strong> IP address, browser type, access times</li>
                  <li><strong>Camera Access:</strong> Photos for package verification and proof of purchase</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">1.3 Third-Party Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li><strong>Social Media:</strong> Google, Apple, Facebook (name, email, profile photo)</li>
                  <li><strong>Payment Processors:</strong> Stripe, PayPal (transaction confirmations)</li>
                  <li><strong>Background Checks:</strong> Stripe Identity (driver verification)</li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mt-6">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li><strong>Service Delivery:</strong> Process bookings, match drivers, facilitate deliveries</li>
                  <li><strong>Payments:</strong> Charge customers, pay drivers, process refunds, instant payouts ($0.50 fee)</li>
                  <li><strong>Communications:</strong> Booking confirmations, updates, support, promotions (opt-out available)</li>
                  <li><strong>Safety & Security:</strong> Verify identities, conduct background checks, prevent fraud</li>
                  <li><strong>Legal Compliance:</strong> Generate 1099-NEC tax forms, respond to legal requests</li>
                  <li><strong>Analytics:</strong> Understand usage, improve UX, develop features, optimize routes</li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mt-6">3. How We Share Your Information</h2>
                <p className="text-gray-700 font-medium">
                  We do NOT sell your personal information. We share data only with:
                </p>

                <h3 className="text-xl font-semibold text-foreground">3.1 Service Providers</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li><strong>Stripe:</strong> Payments, identity verification, payouts, 1099 forms</li>
                  <li><strong>PayPal:</strong> Alternative payments</li>
                  <li><strong>Google Maps/Mapbox:</strong> Location services, routing, tracking</li>
                  <li><strong>Resend:</strong> Transactional emails</li>
                  <li><strong>Expo:</strong> Push notifications</li>
                  <li><strong>Replit App Storage (GCS):</strong> Secure file storage</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">3.2 Between Users</h3>
                <p className="text-gray-700 text-sm">
                  Limited info shared to facilitate deliveries: first name, locations, phone, order details, ratings.
                </p>

                <h3 className="text-xl font-semibold text-foreground">3.3 Legal Requirements</h3>
                <p className="text-gray-700 text-sm">
                  We may disclose information if required by law, court order, or to protect our rights and safety.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">4. Data Security</h2>
                <p className="text-gray-700">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>TLS/HTTPS encryption for data in transit</li>
                  <li>Bcrypt password hashing</li>
                  <li>PCI-compliant payment processing (all card data handled by Stripe)</li>
                  <li>Secure session management with PostgreSQL storage</li>
                  <li>HMAC-SHA256 signed URLs for sensitive documents (72-hour expiration)</li>
                  <li>Private object storage with ACL policies for tax documents</li>
                  <li>Rate limiting to prevent abuse</li>
                </ul>
                <p className="text-gray-700 text-sm mt-2">
                  <strong>Note:</strong> No method of transmission over the Internet is 100% secure. While we strive 
                  to protect your information, we cannot guarantee absolute security.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">5. Your Privacy Rights</h2>
                
                <h3 className="text-xl font-semibold text-foreground">5.1 General Rights</h3>
                <p className="text-gray-700 text-sm">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Disable location services (may limit app functionality)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">5.2 GDPR Rights (EU Users)</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent</li>
                  <li>Right to lodge complaints with supervisory authorities</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground">5.3 CCPA Rights (California Users)</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed</li>
                  <li>Right to opt-out of sale of personal information (we do NOT sell data)</li>
                  <li>Right to non-discrimination for exercising rights</li>
                </ul>

                <p className="text-gray-700 text-sm mt-2">
                  To exercise these rights, email <a href="mailto:privacy@returnit.online" className="text-primary hover:underline">privacy@returnit.online</a>
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">6. Data Retention</h2>
                <p className="text-gray-700 text-sm">
                  We retain personal information for as long as necessary to provide services and comply with legal 
                  obligations. Tax documents (1099 forms) are retained for 7 years per IRS requirements. You may request 
                  deletion at any time, subject to legal retention requirements.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">7. Children's Privacy</h2>
                <p className="text-gray-700 text-sm">
                  Our Service is not intended for children under 18. We do not knowingly collect information from minors. 
                  If you believe we have collected information from a minor, contact us immediately.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">8. International Data Transfers</h2>
                <p className="text-gray-700 text-sm">
                  Your information may be transferred to and processed in the United States or other countries. By using 
                  the Service, you consent to such transfers. We ensure adequate safeguards are in place for international 
                  transfers.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">9. Changes to This Policy</h2>
                <p className="text-gray-700 text-sm">
                  We may update this Privacy Policy from time to time. Material changes will be posted with an updated 
                  "Last Updated" date. Continued use of the Service after changes constitutes acceptance.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-6">10. Contact Us</h2>
                <p className="text-gray-700 text-sm">
                  For questions about this Privacy Policy or to exercise your rights:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4">
                  <p className="text-gray-700 text-sm"><strong>Email:</strong> privacy@returnit.online</p>
                  <p className="text-gray-700 text-sm"><strong>Address:</strong> Return It, LLC – 1214 Devonworth Drive, St. Louis, MO, 63017</p>
                  <p className="text-gray-700 text-sm"><strong>Website:</strong> https://returnit.online</p>
                </div>
              </div>

              <div className="mt-12 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Our Commitment to Your Privacy</h3>
                    <p className="text-sm text-gray-700">
                      We are committed to protecting your personal information and being transparent about our data 
                      practices. Your trust is paramount to us, and we continuously work to safeguard your data.
                    </p>
                  </div>
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

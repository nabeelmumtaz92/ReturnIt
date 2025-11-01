import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const lastUpdated = "November 1, 2025";
  
  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8B7355] dark:text-[#B8956A] mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-6 border-[#B8956A] dark:border-[#8B7355]">
          <CardContent className="pt-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Return It ("we," "us," or "our") operates a reverse delivery service platform connecting customers with drivers for pickup and return services. We are committed to protecting your privacy and handling your data transparently. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and services.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold mb-2">1.1 Account Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>Password (encrypted and securely stored)</li>
                  <li>Account type (customer, driver, or admin)</li>
                  <li>Profile photo (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.2 Customer Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pickup and drop-off addresses</li>
                  <li>Order details (item names, descriptions, values)</li>
                  <li>Receipt photos and package verification photos</li>
                  <li>Payment information (processed securely via Stripe)</li>
                  <li>Order history and tracking information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.3 Driver Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Real-time GPS location during active deliveries</li>
                  <li>Identity verification documents (via Stripe Identity)</li>
                  <li>Driver's license and vehicle information</li>
                  <li>Bank account or debit card information (for payouts)</li>
                  <li>Earnings data and tax information (1099-NEC forms)</li>
                  <li>Background check results and verification status</li>
                  <li>Delivery performance metrics and reviews</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.4 Automatically Collected Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Device information (type, operating system, unique identifiers)</li>
                  <li>IP address and approximate location</li>
                  <li>App usage data and interaction analytics</li>
                  <li>Crash reports and performance diagnostics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We use collected information for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service Delivery:</strong> Process orders, coordinate pickups, and facilitate deliveries</li>
                <li><strong>Payment Processing:</strong> Handle transactions, payouts, and refunds via Stripe</li>
                <li><strong>Real-Time Tracking:</strong> Provide GPS tracking for active orders</li>
                <li><strong>Driver Verification:</strong> Conduct background checks and identity verification for safety</li>
                <li><strong>Tax Compliance:</strong> Generate and distribute 1099-NEC forms to drivers earning over $600 annually</li>
                <li><strong>Customer Support:</strong> Respond to inquiries and resolve issues</li>
                <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance features and performance</li>
                <li><strong>Fraud Prevention:</strong> Detect and prevent fraudulent activities</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory requirements and enforce our Terms of Service</li>
                <li><strong>Marketing:</strong> Send promotional communications (you can opt out anytime)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                3. Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We share your information with:</p>
              
              <div>
                <h3 className="font-semibold mb-2">3.1 Service Providers</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Stripe:</strong> Payment processing, payouts, and identity verification</li>
                  <li><strong>Google Maps:</strong> Address autocomplete and GPS tracking</li>
                  <li><strong>Resend:</strong> Email delivery service</li>
                  <li><strong>Neon:</strong> Database hosting</li>
                  <li><strong>Replit:</strong> Application hosting and object storage</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.2 Between Platform Users</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Customers see driver name, photo, and real-time location during delivery</li>
                  <li>Drivers see customer name, phone number, and delivery addresses</li>
                  <li>Limited information sharing necessary to complete transactions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.3 Legal Requirements</h3>
                <p>We may disclose information to comply with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Legal obligations, court orders, or government requests</li>
                  <li>IRS reporting requirements (1099-NEC forms)</li>
                  <li>Law enforcement investigations</li>
                  <li>Protection of our rights and safety of our users</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.4 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS encryption</li>
                <li><strong>Password Protection:</strong> Bcrypt hashing for password storage</li>
                <li><strong>PCI Compliance:</strong> Payment card data never stored on our servers (handled by Stripe)</li>
                <li><strong>Access Controls:</strong> Role-based permissions limit data access</li>
                <li><strong>Secure Sessions:</strong> Session-based authentication with secure cookies</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              </ul>
              <p className="mt-4 text-sm">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                5. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We retain your information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations (e.g., 7 years for tax records)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our platform and prevent fraud</li>
              </ul>
              <p className="mt-4">
                Upon account deletion, we will remove or anonymize your personal data within 90 days, except where retention is required by law.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                6. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>Depending on your location, you may have the following rights:</p>
              
              <div>
                <h3 className="font-semibold mb-2">6.1 General Rights</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 California Residents (CCPA)</h3>
                <p>California residents have additional rights including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Know what personal information is collected, used, and shared</li>
                  <li>Delete personal information held by businesses</li>
                  <li>Opt-out of the sale of personal information (we do not sell your data)</li>
                  <li>Non-discrimination for exercising privacy rights</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.3 European Residents (GDPR)</h3>
                <p>EU/EEA residents have rights under GDPR including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Right to be forgotten</li>
                  <li>Object to data processing</li>
                  <li>Restrict processing of your data</li>
                  <li>Lodge a complaint with supervisory authorities</li>
                </ul>
              </div>

              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@returnit.online" className="text-[#8B7355] dark:text-[#B8956A] underline">privacy@returnit.online</a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                7. Location Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>Our platform uses location data for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Customers:</strong> Address autocomplete and service availability checks</li>
                <li><strong>Drivers:</strong> Real-time GPS tracking during active deliveries, route optimization, and job matching</li>
              </ul>
              <p className="mt-4">
                Drivers can control location permissions in their device settings. Disabling location services will prevent acceptance of new delivery jobs. Customer real-time tracking is only active when a driver is assigned to their order.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                8. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:support@returnit.online" className="text-[#8B7355] dark:text-[#B8956A] underline">support@returnit.online</a>, and we will delete such information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                9. Third-Party Links
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>
                Our platform may contain links to third-party websites or services (e.g., retailer websites, Stripe). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                10. Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authentication and session management</li>
                <li>Remembering user preferences</li>
                <li>Analytics and performance monitoring</li>
                <li>Advertising and marketing (with your consent)</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may limit your ability to use certain features of our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                11. Changes to This Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Updating the "Last Updated" date at the top of this policy</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice in our app or website</li>
              </ul>
              <p className="mt-4">
                Your continued use of our services after changes take effect constitutes acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] dark:text-[#B8956A]">
                12. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:privacy@returnit.online" className="text-[#8B7355] dark:text-[#B8956A] underline">privacy@returnit.online</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@returnit.online" className="text-[#8B7355] dark:text-[#B8956A] underline">support@returnit.online</a></p>
                <p><strong>Website:</strong> <a href="https://returnit.online" className="text-[#8B7355] dark:text-[#B8956A] underline">https://returnit.online</a></p>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8956A] dark:border-[#8B7355] bg-[#B8956A]/5 dark:bg-[#8B7355]/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Return It is committed to transparency and protecting your privacy. This policy is effective as of {lastUpdated} and applies to all users of our platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
                  operate as independent contractors and not employees of Return It. ReturnIt acts solely as the 
                  customer's agent for transportation purposes.
                </p>

                <h2 className="text-xl font-semibold text-foreground">3. Accounts</h2>
                <p className="text-gray-700">
                  You must register with accurate information and maintain account confidentiality. You are responsible 
                  for all activity under your account. Admins may use "impersonation mode" for troubleshooting, with 
                  all activity logged.
                </p>

                <h2 className="text-xl font-semibold text-foreground">4. Payments</h2>
                <p className="text-gray-700">
                  All service fees are due at booking. Customers agree to pay all fees and charges. Drivers agree to 
                  payout terms, including instant payout fees ($0.50 per transaction). All payments processed through 
                  Stripe. Refunds provided solely at ReturnIt's discretion for service failures directly attributable 
                  to ReturnIt (not drivers or retailers).
                </p>

                <h2 className="text-xl font-semibold text-foreground">5. Prohibited Conduct & Items</h2>
                <p className="text-gray-700 mb-2">
                  Fraud, harassment, unsafe conduct, or misuse of the Services is prohibited. You may not use the 
                  Services to return:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Hazardous materials, explosives, or flammable items</li>
                  <li>Illegal drugs, paraphernalia, or weapons</li>
                  <li>Stolen or counterfeit goods</li>
                  <li>Items that violate any law or regulation</li>
                </ul>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-600" />
                    6. LIMITATION OF LIABILITY
                  </h2>
                  <div className="space-y-2 text-gray-800 font-medium text-sm">
                    <p className="uppercase">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, RETURNIT SHALL NOT BE LIABLE FOR ANY:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                      <li>LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
                      <li>DAMAGE TO OR LOSS OF PROPERTY DURING PICKUP, TRANSPORT, OR DELIVERY</li>
                      <li>ACTS OR OMISSIONS OF INDEPENDENT CONTRACTOR DRIVERS</li>
                      <li>DELAYED, FAILED, OR INCOMPLETE DELIVERIES</li>
                      <li>RETAILER REFUSAL TO ACCEPT RETURNS OR PROCESS REFUNDS</li>
                    </ul>
                    <p className="font-bold mt-3">
                      IN NO EVENT SHALL RETURNIT'S TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC 
                      SERVICE, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS LESS.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">7. INDEMNIFICATION</h2>
                  <p className="text-gray-800 text-sm">
                    You agree to indemnify, defend, and hold harmless ReturnIt, its officers, directors, employees, and 
                    agents from all losses, expenses, damages, and costs, including attorneys' fees, resulting from:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-800 text-sm mt-2">
                    <li>Your violation of these Terms or any law</li>
                    <li>Items you ship or have delivered through the Services</li>
                    <li>Claims arising from driver services performed on your behalf</li>
                    <li>False or misleading information provided by you</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-foreground mt-6">8. Disclaimer of Warranties</h2>
                <p className="text-gray-700">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. ReturnIt 
                  does not warrant that the Services will be uninterrupted, secure, or error-free, or that defects 
                  will be corrected.
                </p>

                <h2 className="text-xl font-semibold text-foreground">9. Driver Relationship</h2>
                <p className="text-gray-700">
                  All drivers are independent contractors, not employees of ReturnIt. Drivers are solely responsible 
                  for their own actions, vehicles, insurance, and compliance with laws. ReturnIt does not guarantee 
                  driver availability, performance, or conduct.
                </p>

                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-600" />
                    10. PROHIBITED ACTIVITIES & CYBERSECURITY
                  </h2>
                  <div className="space-y-2 text-gray-800 text-sm">
                    <p className="font-bold">
                      YOU EXPRESSLY AGREE NOT TO ENGAGE IN ANY OF THE FOLLOWING PROHIBITED ACTIVITIES:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Hacking & Unauthorized Access:</strong> Attempting to gain unauthorized access to any portion of the Service, our servers, databases, or any systems connected to the Service</li>
                      <li><strong>Reverse Engineering:</strong> Reverse engineering, decompiling, disassembling, or attempting to derive source code from the Service or any proprietary algorithms</li>
                      <li><strong>Data Mining:</strong> Using automated tools (bots, scrapers, crawlers) to extract data from the Service without express written permission</li>
                      <li><strong>Security Breaches:</strong> Circumventing, disabling, or interfering with security features, authentication measures, or access controls</li>
                      <li><strong>System Interference:</strong> Introducing viruses, malware, ransomware, trojans, worms, or any malicious code</li>
                      <li><strong>DDoS Attacks:</strong> Conducting denial-of-service attacks or attempting to overload our infrastructure</li>
                      <li><strong>SQL Injection:</strong> Attempting SQL injection, XSS attacks, CSRF attacks, or any code injection techniques</li>
                      <li><strong>API Abuse:</strong> Exceeding rate limits, making excessive API calls, or abusing webhooks</li>
                      <li><strong>Account Compromise:</strong> Accessing another user's account without authorization or sharing credentials</li>
                      <li><strong>Data Theft:</strong> Stealing, copying, or exfiltrating user data, payment information, or proprietary business data</li>
                    </ul>
                    <p className="font-bold mt-4 text-red-900">
                      VIOLATIONS WILL RESULT IN IMMEDIATE ACCOUNT TERMINATION, CRIMINAL PROSECUTION UNDER THE COMPUTER 
                      FRAUD AND ABUSE ACT (CFAA) 18 U.S.C. § 1030, AND CIVIL LIABILITY FOR ALL DAMAGES.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    11. INTELLECTUAL PROPERTY & LICENSE
                  </h2>
                  <div className="space-y-3 text-gray-800 text-sm">
                    <p className="font-bold text-gray-900">
                      © 2025 Return It, LLC. ALL RIGHTS RESERVED.
                    </p>
                    
                    <h3 className="font-bold text-gray-900 mt-3">Proprietary Rights</h3>
                    <p>
                      All content, features, functionality, software, algorithms, user interfaces, designs, graphics, 
                      logos, trademarks, service marks, and proprietary technology (including but not limited to the 
                      "Return Graph" routing system, AI-powered order matching, and real-time tracking algorithms) 
                      are the exclusive property of Return It, LLC and are protected by:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>United States and international copyright laws</li>
                      <li>Trademark and service mark laws</li>
                      <li>Patent laws (pending and granted)</li>
                      <li>Trade secret laws</li>
                      <li>Other intellectual property rights and unfair competition laws</li>
                    </ul>

                    <h3 className="font-bold text-gray-900 mt-3">Patent Protection</h3>
                    <p>
                      The following proprietary systems are protected by pending or granted U.S. patents:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-xs">
                      <li>Return Graph™ - Self-learning reverse logistics knowledge graph routing system</li>
                      <li>Multi-stop batch optimization with cluster detection algorithm</li>
                      <li>Real-time driver-customer matching using AI and geographic proximity</li>
                      <li>Two-way exchange logistics system with in-store coordination</li>
                      <li>Photo verification and proof-of-purchase validation system</li>
                    </ul>

                    <h3 className="font-bold text-gray-900 mt-3">Limited License Grant</h3>
                    <p>
                      Subject to your compliance with these Terms, ReturnIt grants you a limited, non-exclusive, 
                      non-transferable, revocable license to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access and use the Service for personal, non-commercial purposes (customers)</li>
                      <li>Access and use the driver application to provide delivery services (drivers)</li>
                      <li>View and download materials solely for your own use</li>
                    </ul>

                    <h3 className="font-bold text-gray-900 mt-3">Open Source Components</h3>
                    <p>
                      Portions of the Service may include open-source software licensed under the MIT License 
                      and other permissive licenses. Such components remain subject to their original licenses. 
                      Attribution and license notices are available upon request.
                    </p>

                    <p className="font-bold mt-4 text-purple-900">
                      You may NOT: copy, modify, distribute, sell, lease, sublicense, reverse engineer, create 
                      derivative works, or use the Service for competitive purposes.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    12. VIOLATIONS & LEGAL REPERCUSSIONS
                  </h2>
                  <div className="space-y-3 text-gray-800 text-sm">
                    <p className="font-bold">
                      Violations of these Terms may result in the following consequences:
                    </p>

                    <h3 className="font-semibold text-gray-900">Civil Penalties</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Immediate Account Termination:</strong> Permanent ban from the platform</li>
                      <li><strong>Monetary Damages:</strong> Liability for actual damages, lost profits, and business interruption costs</li>
                      <li><strong>Injunctive Relief:</strong> Court orders prohibiting further violations</li>
                      <li><strong>Attorneys' Fees:</strong> Full reimbursement of ReturnIt's legal costs</li>
                      <li><strong>Statutory Damages:</strong> Up to $150,000 per copyright violation under 17 U.S.C. § 504(c)</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900 mt-3">Criminal Prosecution</h3>
                    <p>Cybersecurity violations may result in federal criminal prosecution under:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Computer Fraud and Abuse Act (CFAA):</strong> 18 U.S.C. § 1030 - Up to 10 years imprisonment and $250,000 fines</li>
                      <li><strong>Wire Fraud:</strong> 18 U.S.C. § 1343 - Up to 20 years imprisonment</li>
                      <li><strong>Identity Theft:</strong> 18 U.S.C. § 1028 - Up to 15 years imprisonment</li>
                      <li><strong>Economic Espionage Act:</strong> 18 U.S.C. § 1831 - Up to 15 years imprisonment and $5 million fines</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900 mt-3">Intellectual Property Violations</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Patent Infringement:</strong> Treble damages (3x actual damages) under 35 U.S.C. § 284</li>
                      <li><strong>Copyright Infringement:</strong> Statutory damages and criminal prosecution under 18 U.S.C. § 2319</li>
                      <li><strong>Trademark Infringement:</strong> Damages, profits disgorgement, and injunctions under 15 U.S.C. § 1117</li>
                      <li><strong>Trade Secret Theft:</strong> Criminal prosecution under 18 U.S.C. § 1832</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900 mt-3">Reporting to Authorities</h3>
                    <p>
                      ReturnIt reserves the right to report suspected criminal activity to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Federal Bureau of Investigation (FBI) Cyber Crimes Division</li>
                      <li>U.S. Secret Service (payment fraud)</li>
                      <li>Department of Justice Computer Crime and Intellectual Property Section</li>
                      <li>State and local law enforcement agencies</li>
                    </ul>

                    <p className="font-bold mt-4 bg-orange-100 p-3 rounded border border-orange-300">
                      ⚠️ WARNING: We actively monitor for suspicious activity, maintain detailed logs, and prosecute 
                      violations to the fullest extent of the law. Attempting to hack, exploit, or steal from 
                      ReturnIt will result in criminal charges and civil lawsuits.
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-foreground mt-6">13. Termination</h2>
                <p className="text-gray-700">
                  We may suspend or terminate accounts for violations without notice or liability. You may close your 
                  account at any time. All provisions which should survive termination shall survive.
                </p>

                <h2 className="text-xl font-semibold text-foreground">14. Dispute Resolution & Arbitration</h2>
                <p className="text-gray-700 font-medium">
                  ANY DISPUTE ARISING OUT OF THESE TERMS SHALL BE RESOLVED BY BINDING ARBITRATION, rather than in 
                  court. Arbitration conducted by American Arbitration Association (AAA) under Commercial Arbitration 
                  Rules. You waive the right to jury trial and class actions. Governing law: State of Delaware.
                </p>

                <h2 className="text-xl font-semibold text-foreground">15. Changes to Terms</h2>
                <p className="text-gray-700">
                  We may update these Terms at any time. Continued use constitutes acceptance. Material changes will 
                  be posted with updated effective date.
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
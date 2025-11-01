import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, CreditCard, Users, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Policies() {
  const policyVersion = "5.0";
  const lastUpdated = "November 1, 2025";
  const nextReview = "February 1, 2026";

  const policySections = [
    {
      id: "security",
      title: "Security Architecture",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      items: [
        "5-layer security model (Public → Authenticated → Sensitive → Real-time → Tax)",
        "HMAC-SHA256 signed URLs for sensitive documents",
        "Enhanced rate limiting on all endpoints",
        "PCI-DSS Level 1 compliant via Stripe",
      ]
    },
    {
      id: "payment",
      title: "Payment & Financial",
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
      items: [
        "No raw card data stored (PCI compliant)",
        "Instant payouts: $0.50 fee, $5 minimum",
        "Weekly payouts: No fees, automatic",
        "30-day refund window with admin controls",
      ]
    },
    {
      id: "tax",
      title: "Tax Compliance",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      items: [
        "Annual 1099-NEC forms for drivers earning $600+",
        "7-year document retention (IRS requirement)",
        "Automated form generation and email distribution",
        "Secure download portal for drivers",
      ]
    },
    {
      id: "driver",
      title: "Driver Policies",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      items: [
        "Stripe Identity verification required",
        "Background check & driving record review",
        "Minimum 4 jobs/month, ≥4.0 rating, ≥90% completion",
        "Progressive discipline & deactivation grounds",
      ]
    },
  ];

  const complianceCertifications = [
    { name: "PCI-DSS Level 1", status: "Active", color: "green" },
    { name: "SOC 2 Type II", status: "In Progress", color: "yellow" },
    { name: "GDPR Compliant", status: "Active", color: "green" },
    { name: "CCPA Compliant", status: "Active", color: "green" },
    { name: "IRS 1099 Reporting", status: "Active", color: "green" },
  ];

  const handleDownloadPolicy = () => {
    // In production, this would download the actual policy PDF
    window.open('/PLATFORM_POLICIES.md', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Platform Policies</h1>
        <p className="text-muted-foreground">Comprehensive governance and compliance documentation</p>
      </div>

      {/* Policy Overview Card */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Overview
            </CardTitle>
            <Badge className="bg-green-100 text-green-700">Version {policyVersion}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium" data-testid="policy-last-updated">{lastUpdated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Review</p>
              <p className="font-medium" data-testid="policy-next-review">{nextReview}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="font-medium">10 Major Sections</p>
            </div>
          </div>
          
          <Button onClick={handleDownloadPolicy} data-testid="button-download-policy">
            <Download className="h-4 w-4 mr-2" />
            Download Full Policy Document
          </Button>
        </CardContent>
      </Card>

      {/* Policy Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policySections.map((section) => (
          <Card key={section.id} data-testid={`policy-section-${section.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`${section.bgColor} p-2 rounded-full`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {complianceCertifications.map((cert) => (
              <div key={cert.name} className="text-center p-4 border rounded-lg">
                <div className={`inline-block w-3 h-3 rounded-full mb-2 ${
                  cert.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <p className="font-medium text-sm">{cert.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{cert.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Key Policy Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Data Protection & Privacy</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• GDPR & CCPA compliant data handling</li>
              <li>• 7-year retention for tax/financial records</li>
              <li>• TLS 1.3 encryption for all data in transit</li>
              <li>• User rights: access, deletion, portability</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Service Tiers & Pricing</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Standard: $6.99 (driver earns $5.00)</li>
              <li>• Priority: $9.99 (driver earns $8.00)</li>
              <li>• Instant: $12.99 (driver earns $10.00)</li>
              <li>• 100% of customer tips go to driver</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Rate Limiting & Security</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Authentication: 5 attempts per 15 minutes</li>
              <li>• Payment Processing: 10 requests per 5 minutes</li>
              <li>• Tracking Access: 20 requests per 10 minutes</li>
              <li>• API Endpoints: 1000 requests per hour</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Legal Framework</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Agency model: Return It acts as customer's agent</li>
              <li>• Drivers are independent contractors</li>
              <li>• Governing law: Missouri, United States</li>
              <li>• Mandatory arbitration for claims under $10,000</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">General Support</p>
              <p className="text-muted-foreground">support@returnit.online</p>
            </div>
            <div>
              <p className="font-medium mb-1">Legal & Compliance</p>
              <p className="text-muted-foreground">legal@returnit.online</p>
            </div>
            <div>
              <p className="font-medium mb-1">Data Protection Officer</p>
              <p className="text-muted-foreground">privacy@returnit.online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

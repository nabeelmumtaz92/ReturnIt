import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  Smartphone, 
  Truck, 
  Shield, 
  Users, 
  Download,
  CheckCircle,
  CreditCard,
  MapPin,
  Camera,
  MessageCircle,
  BarChart3,
  FileText,
  Clock,
  Star,
  Phone,
  Mail,
  HelpCircle
} from "lucide-react";

export default function ComprehensiveGuidebook() {
  const [selectedGuide, setSelectedGuide] = useState("website");

  const guides = [
    {
      key: "website",
      title: "Return It Website Guide", 
      icon: <Globe className="w-5 h-5" />,
      description: "Complete guide for customers using the Return It website",
      sections: [
        {
          title: "Getting Started",
          items: [
            "Visit returnit.online to access the platform",
            "No account creation required for booking pickups",
            "Email confirmation will be sent for all orders", 
            "Save your tracking number for order updates"
          ]
        },
        {
          title: "Booking a Return Pickup",
          items: [
            "Click 'Book Pickup' on the homepage",
            "Enter your pickup address details",
            "Select the store for your return (one store per order)",
            "Add items with descriptions and values",
            "Choose pickup time window (same-day or next-day)",
            "Review pricing breakdown before confirming",
            "Receive confirmation email with tracking number"
          ]
        },
        {
          title: "Understanding Pricing",
          items: [
            "Base service fee: $3.99 (applies to every order)",
            "Value tier fees: $0-$75 based on total order value",
            "Distance fees: $0.50 per mile from pickup to store",
            "Size upcharges: Medium (free), Large (+$2), XL (+$4)",
            "Service fees: 15-28% of subtotal (varies by tier)",
            "Real-time calculator shows exact costs before booking"
          ]
        }
      ]
    },
    {
      key: "customerApp",
      title: "Customer Mobile App Guide",
      icon: <Smartphone className="w-5 h-5" />,
      description: "Native mobile app for iOS and Android customers",
      sections: [
        {
          title: "App Installation",
          items: [
            "Download from App Store (iOS) or Google Play (Android)",
            "No account creation required for basic use",
            "Optional account for order history and preferences",
            "Push notifications enabled by default",
            "Offline mode for viewing past orders"
          ]
        },
        {
          title: "Mobile Booking",
          items: [
            "Tap 'Book Return' on home screen",
            "Auto-detect location or manually enter address",
            "Use camera to scan item barcodes for quick entry",
            "Photo capture for item condition documentation",
            "Store locator with maps integration",
            "One-tap rebooking for repeat customers"
          ]
        }
      ]
    },
    {
      key: "driverApp",
      title: "Driver Mobile App Guide",
      icon: <Truck className="w-5 h-5" />,
      description: "Professional driver app for iOS and Android",
      sections: [
        {
          title: "Getting Started",
          items: [
            "Complete background check and onboarding",
            "Download Return It Driver app from app store",
            "Login with provided driver credentials",
            "Complete driver tutorial and safety training",
            "Verify vehicle and insurance documentation",
            "Set availability schedule and preferred areas"
          ]
        },
        {
          title: "Job Management",
          items: [
            "View available jobs in your area",
            "Accept/decline jobs based on schedule",
            "See pickup and delivery locations on map",
            "Review item details and customer notes",
            "Estimated earnings displayed for each job",
            "Batch multiple jobs for efficiency"
          ]
        }
      ]
    },
    {
      key: "masterAdmin",
      title: "Master Admin Dashboard Guide",
      icon: <Shield className="w-5 h-5" />,
      description: "Complete administrative control for nabeelmumtaz92@gmail.com and durremumtaz@gmail.com",
      sections: [
        {
          title: "Access & Security",
          items: [
            "Exclusive access for nabeelmumtaz92@gmail.com and durremumtaz@gmail.com",
            "Full platform administrative privileges",
            "Access to all dashboards and employee management",
            "Password: dsm1208 for both accounts",
            "Access to both master admin and employee admin dashboards",
            "Session timeout: 8 hours for security"
          ]
        },
        {
          title: "Dashboard Overview",
          items: [
            "Real-time business metrics and KPIs",
            "Live order tracking and driver status",
            "Revenue analytics and financial reporting",
            "Customer satisfaction scores and feedback",
            "Driver performance metrics and ratings",
            "System health monitoring and alerts"
          ]
        },
        {
          title: "Order Management",
          items: [
            "View all orders across all status levels",
            "Modify order details and pricing",
            "Assign/reassign drivers to orders",
            "Process refunds and adjustments",
            "Handle customer complaints and issues",
            "Export order data for analysis"
          ]
        }
      ]
    },
    {
      key: "employeeAdmin",
      title: "Employee Admin Dashboard Guide",
      icon: <Users className="w-5 h-5" />,
      description: "Employee-level administrative access and responsibilities",
      sections: [
        {
          title: "Employee Access Levels",
          items: [
            "Customer Support Specialist: Order assistance and basic refunds",
            "Operations Coordinator: Driver assignment and scheduling",
            "Financial Analyst: Payment processing and financial reporting",
            "Quality Assurance Manager: Driver monitoring and customer satisfaction",
            "Training Coordinator: Employee onboarding and documentation",
            "Regional Manager: Multi-location oversight and expansion"
          ]
        },
        {
          title: "Daily Operations",
          items: [
            "Monitor real-time order flow and status",
            "Assist customers via chat and phone support",
            "Process routine refunds and adjustments",
            "Coordinate driver assignments for optimal efficiency",
            "Review and escalate complex customer issues",
            "Generate daily operational reports"
          ]
        }
      ]
    }
  ];

  const handleDownloadGuide = (guide: any) => {
    const content = `
# ${guide.title}

${guide.description}

${guide.sections.map((section: any) => `
## ${section.title}

${section.items.map((item: string) => `- ${item}`).join('\n')}
`).join('\n')}

---
Generated from Return It Comprehensive Guidebook
Visit returnit.online for more information
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/\s+/g, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedGuideData = guides.find(g => g.key === selectedGuide);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Return It Comprehensive Guidebooks</h1>
          <p className="text-xl text-gray-600">Complete documentation for all platform users and administrators</p>
        </div>

        {/* Guide Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {guides.map((guide) => (
            <Card 
              key={guide.key}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedGuide === guide.key ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              onClick={() => setSelectedGuide(guide.key)}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  {guide.icon}
                </div>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
                <CardDescription className="text-sm">{guide.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadGuide(guide);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Guide
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Guide Content */}
        {selectedGuideData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedGuideData.icon}
                  <div>
                    <CardTitle>{selectedGuideData.title}</CardTitle>
                    <CardDescription>{selectedGuideData.description}</CardDescription>
                  </div>
                </div>
                <Button onClick={() => handleDownloadGuide(selectedGuideData)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedGuideData.sections.map((section, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="w-4 h-4" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Master Admin Special Access Notice */}
        {selectedGuide === 'masterAdmin' && (
          <Alert className="mt-6 border-border bg-[#f8f7f5] dark:bg-[#231b0f]">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>Master Admin Access:</strong> nabeelmumtaz92@gmail.com and durremumtaz@gmail.com have exclusive access to all administrative functions, including employee admin dashboards, financial controls, and system configuration. Both accounts can access the employee admin dashboard at /employee-dashboard in addition to the master admin dashboard.
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Support & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Phone Support</h4>
                <p className="text-sm text-gray-600">1-800-RETURN-1</p>
                <p className="text-xs text-gray-500">24/7 Available</p>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Email Support</h4>
                <p className="text-sm text-gray-600">support@returnit.online</p>
                <p className="text-xs text-gray-500">Response within 2 hours</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Live Chat</h4>
                <p className="text-sm text-gray-600">Available on all pages</p>
                <p className="text-xs text-gray-500">AI + Human escalation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
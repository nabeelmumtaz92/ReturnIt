import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, BookOpen, Users, Headphones, Settings, Shield, 
  MessageCircle, Phone, Mail, MapPin, Clock, CheckCircle,
  AlertTriangle, Star, Truck, Package, DollarSign, BarChart3,
  ArrowRight, User, Lightbulb, Target, Award
} from 'lucide-react';

export default function EmployeeGuide() {
  const [searchTerm, setSearchTerm] = useState('');

  const guideContent = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="h-5 w-5" />,
      content: [
        {
          title: 'Welcome to Return It',
          description: 'Your comprehensive guide to using the Return It platform effectively',
          steps: [
            'Log in with your company email and password',
            'Complete your profile setup in Account Settings',
            'Review your role permissions and available features',
            'Familiarize yourself with your dashboard layout'
          ]
        },
        {
          title: 'Dashboard Navigation',
          description: 'Understanding your personalized dashboard',
          steps: [
            'Main dashboard shows key metrics for your role',
            'Use sidebar navigation to access different sections',
            'Split view feature allows comparing two sections side-by-side',
            'Back buttons return you to main dashboard from any section'
          ]
        }
      ]
    },
    {
      id: 'customer-support',
      title: 'Customer Support Guide',
      icon: <Headphones className="h-5 w-5" />,
      content: [
        {
          title: 'Handling Customer Inquiries',
          description: 'Best practices for customer support interactions',
          steps: [
            'Always greet customers warmly and professionally',
            'Use the AI support system to quickly find relevant solutions',
            'Document all interactions in the support ticket system',
            'Escalate complex issues to supervisors when needed',
            'Follow up within 24 hours on unresolved issues'
          ]
        },
        {
          title: 'Support Ticket Management',
          description: 'Efficiently managing customer support tickets',
          steps: [
            'Prioritize tickets by urgency: High, Medium, Low',
            'Use predefined responses for common questions',
            'Update ticket status as you work: Open → In Progress → Resolved',
            'Add internal notes for team collaboration',
            'Close tickets only after customer confirmation'
          ]
        },
        {
          title: 'Common Issues & Solutions',
          description: 'Quick reference for frequent customer problems',
          steps: [
            'Order tracking: Use real-time tracking system to provide updates',
            'Pickup delays: Check driver location and contact driver directly',
            'Payment issues: Verify payment method and processing status',
            'Returns policy: Reference company policy document for accurate info',
            'Technical problems: Guide customers through troubleshooting steps'
          ]
        }
      ]
    },
    {
      id: 'order-management',
      title: 'Order Management',
      icon: <Package className="h-5 w-5" />,
      content: [
        {
          title: 'Processing New Orders',
          description: 'Steps for handling incoming order requests',
          steps: [
            'Review order details for completeness and accuracy',
            'Verify customer information and pickup address',
            'Check driver availability in the pickup area',
            'Assign orders to appropriate drivers based on location',
            'Send confirmation notifications to customers'
          ]
        },
        {
          title: 'Order Status Updates',
          description: 'Keeping orders current throughout the process',
          steps: [
            'Monitor order progress: Pending → Assigned → Picked Up → Delivered',
            'Update customers proactively about status changes',
            'Handle exceptions like missed pickups or delivery issues',
            'Process refunds when necessary following company policy',
            'Generate completion reports for management review'
          ]
        }
      ]
    },
    {
      id: 'driver-coordination',
      title: 'Driver Coordination',
      icon: <Truck className="h-5 w-5" />,
      content: [
        {
          title: 'Driver Assignment',
          description: 'Matching drivers with appropriate orders',
          steps: [
            'Review driver locations and availability in real-time',
            'Consider driver ratings and performance history',
            'Factor in vehicle capacity for larger orders',
            'Optimize routes for multiple pickup efficiency',
            'Communicate special instructions clearly to drivers'
          ]
        },
        {
          title: 'Driver Support',
          description: 'Assisting drivers throughout their workday',
          steps: [
            'Provide turn-by-turn directions when GPS fails',
            'Help resolve customer contact issues',
            'Handle driver questions about order details',
            'Coordinate with customers for pickup timing',
            'Report driver performance issues to management'
          ]
        }
      ]
    },
    {
      id: 'system-features',
      title: 'Platform Features',
      icon: <Settings className="h-5 w-5" />,
      content: [
        {
          title: 'Real-Time Tracking',
          description: 'Using the live tracking system effectively',
          steps: [
            'Access driver locations through the tracking dashboard',
            'Monitor order progress with live status updates',
            'Use map view to visualize driver routes and locations',
            'Set up alerts for delayed or problematic orders',
            'Generate location reports for performance analysis'
          ]
        },
        {
          title: 'Communication Tools',
          description: 'Staying connected with team and customers',
          steps: [
            'Use in-app messaging for team communication',
            'Send automated notifications to customers',
            'Make calls directly through the platform when needed',
            'Access customer communication history',
            'Document all communications for future reference'
          ]
        },
        {
          title: 'Reporting & Analytics',
          description: 'Generating insights from platform data',
          steps: [
            'Run daily performance reports for your area',
            'Track key metrics: response time, resolution rate, satisfaction',
            'Export data for external analysis when needed',
            'Share insights with team members and supervisors',
            'Use trends to identify improvement opportunities'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: [
        {
          title: 'Technical Issues',
          description: 'Resolving common technical problems',
          steps: [
            'Clear browser cache and cookies if pages load slowly',
            'Check internet connection for connectivity issues',
            'Try refreshing the page for temporary display problems',
            'Use different browser if features aren\'t working properly',
            'Contact IT support for persistent technical issues'
          ]
        },
        {
          title: 'Account & Access Issues',
          description: 'Solving login and permission problems',
          steps: [
            'Reset password using the "Forgot Password" link',
            'Check with supervisor if you can\'t access certain features',
            'Clear saved login data if having authentication issues',
            'Verify your role permissions with HR department',
            'Contact system administrator for account lockouts'
          ]
        }
      ]
    }
  ];

  const filteredContent = guideContent.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Guide</h1>
              <p className="text-muted-foreground">Complete guide to using the Return It platform</p>
            </div>
            <Badge className="bg-accent text-foreground px-3 py-1">
              <BookOpen className="h-4 w-4 mr-1" />
              Comprehensive Manual
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
            <Input
              placeholder="Search guide topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Guide Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-border sticky top-6">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guideContent.map((section) => (
                    <Button
                      key={section.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-accent/50"
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {section.icon}
                        <span className="text-foreground">{section.title}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {filteredContent.map((section) => (
              <Card key={section.id} id={section.id} className="bg-white border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center text-xl">
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-border pl-4">
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      <ul className="space-y-2">
                        {item.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Reference Card */}
        <Card className="bg-accent border-border mt-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Support Hotline</h4>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
              </div>
              <div className="text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">IT Support</h4>
                <p className="text-sm text-muted-foreground">it@returnit.com</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Hours</h4>
                <p className="text-sm text-muted-foreground">24/7 Operations</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Emergency</h4>
                <p className="text-sm text-muted-foreground">911 or Security</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
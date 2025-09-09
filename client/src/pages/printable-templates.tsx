import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, Download, FileText, Clipboard, QrCode, MapPin,
  Package, User, Clock, Phone, Mail, Star, AlertTriangle,
  CheckCircle, Info, Settings, Calendar, Hash, Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  usedBy: string[];
}

export default function PrintableTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<any>({});

  const templates: PrintTemplate[] = [
    {
      id: 'pickup-receipt',
      name: 'Pickup Receipt',
      description: 'Customer receipt for package pickup confirmation',
      category: 'Customer Documents',
      icon: <FileText className="h-5 w-5" />,
      usedBy: ['customers', 'drivers']
    },
    {
      id: 'delivery-label',
      name: 'Delivery Label',
      description: 'Package shipping and tracking label',
      category: 'Operations',
      icon: <Package className="h-5 w-5" />,
      usedBy: ['drivers', 'operations']
    },
    {
      id: 'driver-checklist',
      name: 'Daily Driver Checklist',
      description: 'Pre-shift inspection and task checklist for drivers',
      category: 'Driver Resources',
      icon: <Clipboard className="h-5 w-5" />,
      usedBy: ['drivers', 'supervisors']
    },
    {
      id: 'incident-report',
      name: 'Incident Report Form',
      description: 'Documentation form for accidents or issues',
      category: 'Safety & Compliance',
      icon: <AlertTriangle className="h-5 w-5" />,
      usedBy: ['drivers', 'admin', 'hr']
    },
    {
      id: 'customer-feedback',
      name: 'Customer Feedback Form',
      description: 'Paper feedback form for service rating',
      category: 'Customer Service',
      icon: <Star className="h-5 w-5" />,
      usedBy: ['customers', 'drivers']
    },
    {
      id: 'route-manifest',
      name: 'Route Manifest',
      description: 'Daily route list with pickup/delivery details',
      category: 'Operations',
      icon: <MapPin className="h-5 w-5" />,
      usedBy: ['drivers', 'dispatch']
    },
    {
      id: 'quality-checklist',
      name: 'Quality Assurance Checklist',
      description: 'Service quality inspection checklist',
      category: 'Quality Control',
      icon: <CheckCircle className="h-5 w-5" />,
      usedBy: ['supervisors', 'admin']
    },
    {
      id: 'emergency-contact',
      name: 'Emergency Contact Card',
      description: 'Wallet-sized emergency contact information',
      category: 'Safety & Compliance',
      icon: <Phone className="h-5 w-5" />,
      usedBy: ['drivers', 'employees']
    }
  ];

  const generateTemplate = async (templateId: string) => {
    let htmlContent = '';
    
    switch (templateId) {
      case 'pickup-receipt':
        htmlContent = generatePickupReceiptHTML();
        break;
      case 'delivery-label':
        htmlContent = generateDeliveryLabelHTML();
        break;
      case 'driver-checklist':
        htmlContent = generateDriverChecklistHTML();
        break;
      case 'incident-report':
        htmlContent = generateIncidentReportHTML();
        break;
      case 'customer-feedback':
        htmlContent = generateCustomerFeedbackHTML();
        break;
      case 'route-manifest':
        htmlContent = generateRouteManifestHTML();
        break;
      case 'quality-checklist':
        htmlContent = generateQualityChecklistHTML();
        break;
      case 'emergency-contact':
        htmlContent = generateEmergencyContactHTML();
        break;
      default:
        return;
    }

    // Create and download PDF-ready HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReturnIt_${templateId.replace('-', '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Generated",
      description: "Your printable template is ready. Open in browser and print or save as PDF.",
    });
  };

  const generatePickupReceiptHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Pickup Receipt</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
.receipt { max-width: 400px; margin: 0 auto; border: 2px solid #92400e; padding: 20px; }
.header { text-align: center; border-bottom: 2px solid #92400e; padding-bottom: 15px; margin-bottom: 15px; }
.logo { font-size: 24px; font-weight: bold; color: #92400e; margin-bottom: 5px; }
.section { margin-bottom: 15px; }
.label { font-weight: bold; color: #92400e; }
.value { margin-left: 10px; }
.footer { border-top: 1px solid #92400e; padding-top: 10px; margin-top: 20px; text-align: center; font-size: 12px; }
.qr-placeholder { width: 60px; height: 60px; border: 1px solid #92400e; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 8px; }
@media print { body { margin: 0; padding: 10px; } .receipt { border: 1px solid #000; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="logo">📦 ReturnIt</div>
    <div>PICKUP RECEIPT</div>
  </div>
  
  <div class="section">
    <div><span class="label">Order ID:</span><span class="value">ORD-2024-____</span></div>
    <div><span class="label">Date:</span><span class="value">________________</span></div>
    <div><span class="label">Time:</span><span class="value">________________</span></div>
  </div>
  
  <div class="section">
    <div class="label">Customer Information:</div>
    <div><span class="label">Name:</span><span class="value">________________________</span></div>
    <div><span class="label">Address:</span><span class="value">________________________</span></div>
    <div><span class="value">________________________</span></div>
    <div><span class="label">Phone:</span><span class="value">________________________</span></div>
  </div>
  
  <div class="section">
    <div class="label">Package Details:</div>
    <div><span class="label">Items:</span><span class="value">________________</span></div>
    <div><span class="label">Weight:</span><span class="value">________________</span></div>
    <div><span class="label">Destination:</span><span class="value">________________________</span></div>
  </div>
  
  <div class="section">
    <div class="label">Driver Information:</div>
    <div><span class="label">Name:</span><span class="value">________________________</span></div>
    <div><span class="label">Signature:</span><span class="value">________________________</span></div>
  </div>
  
  <div class="qr-placeholder">QR CODE</div>
  
  <div class="footer">
    <div><strong>Track your return at returnit.online</strong></div>
    <div>Customer Service: (555) 123-4567</div>
    <div>Thank you for choosing ReturnIt!</div>
  </div>
</div>
</body>
</html>`;

  const generateDeliveryLabelHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Delivery Label</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
.label { width: 4in; height: 6in; border: 2px solid #000; padding: 10px; margin: 0 auto; box-sizing: border-box; }
.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
.logo { font-size: 18px; font-weight: bold; }
.section { margin-bottom: 15px; }
.from, .to { border: 1px solid #000; padding: 8px; margin-bottom: 10px; }
.tracking { font-size: 24px; font-weight: bold; text-align: center; margin: 15px 0; }
.barcode-placeholder { height: 50px; border: 1px solid #000; margin: 10px 0; display: flex; align-items: center; justify-content: center; }
@media print { body { margin: 0; padding: 5px; } }
</style>
</head>
<body>
<div class="label">
  <div class="header">
    <div class="logo">📦 ReturnIt Express</div>
    <div style="font-size: 12px;">DELIVERY LABEL</div>
  </div>
  
  <div class="from">
    <div style="font-weight: bold; font-size: 10px;">FROM:</div>
    <div>_________________________</div>
    <div>_________________________</div>
    <div>_________________________</div>
    <div>Phone: ___________________</div>
  </div>
  
  <div class="to">
    <div style="font-weight: bold; font-size: 12px;">TO:</div>
    <div style="font-size: 16px; font-weight: bold;">_________________________</div>
    <div style="font-size: 14px;">_________________________</div>
    <div style="font-size: 14px;">_________________________</div>
    <div>Phone: ___________________</div>
  </div>
  
  <div class="tracking">ORD-2024-________</div>
  
  <div class="barcode-placeholder">
    BARCODE PLACEHOLDER
  </div>
  
  <div style="text-align: center; font-size: 10px;">
    <div>Date: _______ Weight: _______ Priority: _______</div>
    <div style="margin-top: 10px;">Handle with Care • Track at returnit.online</div>
  </div>
</div>
</body>
</html>`;

  const generateDriverChecklistHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Daily Driver Checklist</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
.header { text-align: center; border-bottom: 2px solid #92400e; padding-bottom: 15px; margin-bottom: 20px; }
.section { margin-bottom: 25px; page-break-inside: avoid; }
.checklist-item { display: flex; align-items: flex-start; margin-bottom: 8px; }
.checkbox { width: 15px; height: 15px; border: 1px solid #000; margin-right: 10px; margin-top: 2px; flex-shrink: 0; }
.signature-line { border-bottom: 1px solid #000; width: 200px; display: inline-block; }
@media print { body { margin: 15px; } .section { page-break-inside: avoid; } }
</style>
</head>
<body>
<div class="header">
  <h1 style="color: #92400e; margin-bottom: 5px;">📦 ReturnIt</h1>
  <h2>Daily Driver Checklist</h2>
  <p>Date: _________________ Driver: _________________</p>
</div>

<div class="section">
  <h3 style="color: #92400e; border-bottom: 1px solid #92400e; padding-bottom: 5px;">Pre-Shift Vehicle Inspection</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Check tire pressure and tread condition</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Verify all lights are working (headlights, taillights, turn signals)</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Test brakes and steering</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Check fluid levels (oil, coolant, brake fluid)</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Inspect mirrors and clean windshield</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Verify GPS and communication devices are working</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #92400e; border-bottom: 1px solid #92400e; padding-bottom: 5px;">Equipment & Supplies</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Handheld scanner/mobile device charged and functioning</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Sufficient packaging materials (boxes, tape, labels)</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Receipt printer paper and pens available</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Protective equipment (gloves, safety vest) on hand</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Customer information sheets and route manifest</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #92400e; border-bottom: 1px solid #92400e; padding-bottom: 5px;">Safety & Documentation</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Review weather conditions and traffic alerts</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Verify emergency contact information is accessible</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Check first aid kit is complete and accessible</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Confirm insurance and registration documents are current</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #92400e; border-bottom: 1px solid #92400e; padding-bottom: 5px;">End-of-Shift Summary</h3>
  <p>Pickups Completed: _______ Deliveries Made: _______</p>
  <p>Miles Driven: _______ Fuel Level: _______</p>
  <p>Issues or Incidents (describe): ________________________________</p>
  <p>_____________________________________________________________</p>
  <p style="margin-top: 20px;">
    Driver Signature: <span class="signature-line"></span> 
    Supervisor Review: <span class="signature-line"></span>
  </p>
</div>
</body>
</html>`;

  const generateCustomerFeedbackHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Customer Feedback Form</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.5; }
.header { text-align: center; border-bottom: 2px solid #92400e; padding-bottom: 15px; margin-bottom: 20px; }
.section { margin-bottom: 20px; }
.rating-row { display: flex; align-items: center; margin-bottom: 10px; }
.rating-label { width: 200px; }
.star-rating { display: flex; margin-left: 10px; }
.star { width: 20px; height: 20px; border: 1px solid #000; margin-right: 5px; }
.text-area { border: 1px solid #000; width: 100%; height: 80px; }
@media print { body { margin: 15px; } }
</style>
</head>
<body>
<div class="header">
  <h1 style="color: #92400e;">📦 ReturnIt</h1>
  <h2>Customer Feedback Form</h2>
  <p>We value your opinion! Please rate your experience.</p>
</div>

<div class="section">
  <p><strong>Order ID:</strong> _________________ <strong>Date:</strong> _________________</p>
  <p><strong>Driver Name:</strong> _________________________________________________</p>
</div>

<div class="section">
  <h3 style="color: #92400e;">Please rate the following (1 = Poor, 5 = Excellent):</h3>
  
  <div class="rating-row">
    <div class="rating-label">Punctuality (On-time pickup):</div>
    <div class="star-rating">
      <div class="star">1</div><div class="star">2</div><div class="star">3</div><div class="star">4</div><div class="star">5</div>
    </div>
  </div>
  
  <div class="rating-row">
    <div class="rating-label">Professionalism:</div>
    <div class="star-rating">
      <div class="star">1</div><div class="star">2</div><div class="star">3</div><div class="star">4</div><div class="star">5</div>
    </div>
  </div>
  
  <div class="rating-row">
    <div class="rating-label">Communication:</div>
    <div class="star-rating">
      <div class="star">1</div><div class="star">2</div><div class="star">3</div><div class="star">4</div><div class="star">5</div>
    </div>
  </div>
  
  <div class="rating-row">
    <div class="rating-label">Careful handling of items:</div>
    <div class="star-rating">
      <div class="star">1</div><div class="star">2</div><div class="star">3</div><div class="star">4</div><div class="star">5</div>
    </div>
  </div>
  
  <div class="rating-row">
    <div class="rating-label">Overall experience:</div>
    <div class="star-rating">
      <div class="star">1</div><div class="star">2</div><div class="star">3</div><div class="star">4</div><div class="star">5</div>
    </div>
  </div>
</div>

<div class="section">
  <h3 style="color: #92400e;">Additional Comments:</h3>
  <div class="text-area"></div>
</div>

<div class="section">
  <h3 style="color: #92400e;">Would you recommend ReturnIt to others?</h3>
  <p>☐ Definitely ☐ Probably ☐ Maybe ☐ Probably Not ☐ Definitely Not</p>
</div>

<div class="section" style="border-top: 1px solid #92400e; padding-top: 15px; margin-top: 30px; text-align: center; font-size: 12px;">
  <p><strong>Thank you for your feedback!</strong></p>
  <p>Submit online at returnit.online/feedback or return to driver</p>
  <p>Questions? Call (555) 123-4567 or email support@returnit.com</p>
</div>
</body>
</html>`;

  const generateIncidentReportHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Incident Report Form</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
.header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px; }
.section { margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
.form-row { display: flex; margin-bottom: 10px; }
.label { width: 150px; font-weight: bold; }
.input-line { border-bottom: 1px solid #000; flex: 1; min-height: 20px; }
.text-area { border: 1px solid #000; width: 100%; height: 100px; padding: 5px; }
.emergency { background-color: #fee2e2; border: 2px solid #dc2626; }
@media print { body { margin: 15px; } }
</style>
</head>
<body>
<div class="header">
  <h1 style="color: #dc2626;">⚠️ INCIDENT REPORT</h1>
  <h2>ReturnIt Delivery Services</h2>
  <p><strong>CONFIDENTIAL - Complete immediately after incident</strong></p>
</div>

<div class="section emergency">
  <h3 style="color: #dc2626;">EMERGENCY INFORMATION</h3>
  <div class="form-row">
    <div class="label">Date/Time:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Location:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Emergency Services Called:</div>
    <div>☐ Police ☐ Fire ☐ Ambulance ☐ None ☐ Other: _______________</div>
  </div>
</div>

<div class="section">
  <h3>PERSONNEL INFORMATION</h3>
  <div class="form-row">
    <div class="label">Driver Name:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Employee ID:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Vehicle ID/License:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Supervisor Notified:</div>
    <div>☐ Yes ☐ No Time: _______________</div>
  </div>
</div>

<div class="section">
  <h3>INCIDENT DETAILS</h3>
  <div class="form-row">
    <div class="label">Type of Incident:</div>
    <div>☐ Vehicle Accident ☐ Package Damage ☐ Injury ☐ Theft ☐ Customer Complaint ☐ Other</div>
  </div>
  <div style="margin: 15px 0;">
    <div style="font-weight: bold; margin-bottom: 5px;">Description of Incident:</div>
    <div class="text-area"></div>
  </div>
  <div style="margin: 15px 0;">
    <div style="font-weight: bold; margin-bottom: 5px;">Contributing Factors:</div>
    <div class="text-area"></div>
  </div>
</div>

<div class="section">
  <h3>WITNESS INFORMATION</h3>
  <div class="form-row">
    <div class="label">Witness Name:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Phone Number:</div>
    <div class="input-line"></div>
  </div>
  <div class="form-row">
    <div class="label">Address:</div>
    <div class="input-line"></div>
  </div>
</div>

<div class="section">
  <h3>SIGNATURES</h3>
  <p>I certify that the information provided is accurate and complete.</p>
  <div style="margin-top: 30px;">
    <div class="form-row">
      <div class="label">Driver Signature:</div>
      <div style="border-bottom: 1px solid #000; width: 200px;"></div>
      <div style="margin-left: 20px;">Date: _______________</div>
    </div>
    <div class="form-row" style="margin-top: 20px;">
      <div class="label">Supervisor Signature:</div>
      <div style="border-bottom: 1px solid #000; width: 200px;"></div>
      <div style="margin-left: 20px;">Date: _______________</div>
    </div>
  </div>
</div>

<div style="margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px;">
  <p><strong>SUBMIT IMMEDIATELY TO: HR Department - hr@returnit.com</strong></p>
  <p>Emergency Hotline: (555) 911-HELP</p>
</div>
</body>
</html>`;

  const generateRouteManifestHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Route Manifest</title>
<style>
body { font-family: Arial, sans-serif; margin: 15px; font-size: 12px; }
.header { border-bottom: 2px solid #92400e; padding-bottom: 10px; margin-bottom: 15px; }
.route-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th, td { border: 1px solid #000; padding: 6px; text-align: left; }
th { background-color: #f3f4f6; font-weight: bold; }
.priority-high { background-color: #fee2e2; }
.priority-medium { background-color: #fef3c7; }
.checkbox-col { width: 30px; text-align: center; }
.time-col { width: 80px; }
.notes-section { border: 1px solid #000; padding: 10px; margin-top: 15px; }
@media print { body { margin: 10px; } }
</style>
</head>
<body>
<div class="header">
  <h1 style="color: #92400e; margin: 0;">📦 ReturnIt Route Manifest</h1>
  <div class="route-info">
    <div>
      <strong>Date:</strong> _________________ 
      <strong>Route:</strong> _________________
    </div>
    <div>
      <strong>Driver:</strong> _________________ 
      <strong>Vehicle:</strong> _________________
    </div>
  </div>
</div>

<h3>PICKUP SCHEDULE</h3>
<table>
  <thead>
    <tr>
      <th class="checkbox-col">✓</th>
      <th class="time-col">Time</th>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Address</th>
      <th>Phone</th>
      <th>Items</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr class="priority-high">
      <td class="checkbox-col">☐</td>
      <td>09:00</td>
      <td>ORD-001</td>
      <td>Smith, J.</td>
      <td>123 Main St, Apt 2B</td>
      <td>(555) 123-4567</td>
      <td>Electronics Return</td>
      <td>HIGH</td>
    </tr>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>09:30</td>
      <td>ORD-002</td>
      <td>Johnson, M.</td>
      <td>456 Oak Ave</td>
      <td>(555) 234-5678</td>
      <td>Clothing x3</td>
      <td>STD</td>
    </tr>
    <tr class="priority-medium">
      <td class="checkbox-col">☐</td>
      <td>10:15</td>
      <td>ORD-003</td>
      <td>Wilson, K.</td>
      <td>789 Pine Rd, Unit 5</td>
      <td>(555) 345-6789</td>
      <td>Home Goods</td>
      <td>MED</td>
    </tr>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>11:00</td>
      <td>ORD-004</td>
      <td>Brown, S.</td>
      <td>321 Elm St</td>
      <td>(555) 456-7890</td>
      <td>Books x5</td>
      <td>STD</td>
    </tr>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>11:45</td>
      <td>ORD-005</td>
      <td>Davis, R.</td>
      <td>654 Maple Dr</td>
      <td>(555) 567-8901</td>
      <td>Appliance Parts</td>
      <td>STD</td>
    </tr>
  </tbody>
</table>

<h3>DELIVERY SCHEDULE</h3>
<table>
  <thead>
    <tr>
      <th class="checkbox-col">✓</th>
      <th class="time-col">Time</th>
      <th>Order ID</th>
      <th>Destination</th>
      <th>Contact</th>
      <th>Special Instructions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>13:00</td>
      <td>ORD-001</td>
      <td>Best Buy Returns Center</td>
      <td>Loading Dock</td>
      <td>Use rear entrance</td>
    </tr>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>14:30</td>
      <td>ORD-002/003</td>
      <td>Goodwill Donation Center</td>
      <td>Front Desk</td>
      <td>Get donation receipt</td>
    </tr>
    <tr>
      <td class="checkbox-col">☐</td>
      <td>15:15</td>
      <td>ORD-004</td>
      <td>Half Price Books</td>
      <td>Manager</td>
      <td>Store credit for customer</td>
    </tr>
  </tbody>
</table>

<div style="display: flex; justify-content: space-between;">
  <div>
    <h4>ROUTE SUMMARY</h4>
    <p>Total Pickups: _____ Completed: _____</p>
    <p>Total Deliveries: _____ Completed: _____</p>
    <p>Starting Mileage: _____ Ending: _____</p>
  </div>
  <div>
    <h4>FUEL & VEHICLE</h4>
    <p>Start Fuel Level: _____</p>
    <p>End Fuel Level: _____</p>
    <p>Vehicle Issues: ☐ None ☐ See Notes</p>
  </div>
</div>

<div class="notes-section">
  <h4>NOTES & INCIDENTS</h4>
  <div style="height: 80px;"></div>
</div>

<div style="margin-top: 20px; text-align: center;">
  <p>Driver Signature: _________________________ Date: _____________</p>
  <p style="font-size: 10px;">Submit completed manifest to dispatch by end of shift</p>
</div>
</body>
</html>`;

  const generateQualityChecklistHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Quality Assurance Checklist</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
.header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
.section { margin-bottom: 25px; page-break-inside: avoid; }
.checklist-item { display: flex; align-items: flex-start; margin-bottom: 8px; }
.checkbox { width: 15px; height: 15px; border: 1px solid #000; margin-right: 10px; margin-top: 2px; flex-shrink: 0; }
.rating-scale { display: flex; margin-left: 25px; }
.rating { width: 30px; height: 20px; border: 1px solid #000; margin-right: 5px; text-align: center; font-size: 12px; line-height: 20px; }
.excellent { background-color: #d1fae5; }
.good { background-color: #fef3c7; }
.needs-improvement { background-color: #fee2e2; }
@media print { body { margin: 15px; } .section { page-break-inside: avoid; } }
</style>
</head>
<body>
<div class="header">
  <h1 style="color: #059669; margin-bottom: 5px;">✅ ReturnIt</h1>
  <h2>Quality Assurance Checklist</h2>
  <p>Date: _________________ Reviewer: _________________ Driver: _________________</p>
</div>

<div class="section">
  <h3 style="color: #059669; border-bottom: 1px solid #059669; padding-bottom: 5px;">Customer Service Excellence</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Professional appearance and uniform compliance</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
  
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Courteous and respectful customer interaction</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
  
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Clear communication about pickup/delivery process</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
  
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Promptly addressed customer questions/concerns</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #059669; border-bottom: 1px solid #059669; padding-bottom: 5px;">Operational Efficiency</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Arrived within scheduled time window</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
  
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Efficient handling and processing of items</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
  
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Proper use of technology and scanning procedures</div>
  </div>
  <div class="rating-scale">
    <div class="rating excellent">5</div><div class="rating good">4</div><div class="rating">3</div><div class="rating">2</div><div class="rating needs-improvement">1</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #059669; border-bottom: 1px solid #059669; padding-bottom: 5px;">Safety & Compliance</h3>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Followed all safety protocols and procedures</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Proper handling of fragile/valuable items</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Vehicle maintained in clean and safe condition</div>
  </div>
  <div class="checklist-item">
    <div class="checkbox"></div>
    <div>Documentation completed accurately and completely</div>
  </div>
</div>

<div class="section">
  <h3 style="color: #059669; border-bottom: 1px solid #059669; padding-bottom: 5px;">Overall Performance Assessment</h3>
  <p><strong>Strengths:</strong> ___________________________________________________________</p>
  <p>____________________________________________________________________</p>
  <p><strong>Areas for Improvement:</strong> ______________________________________________</p>
  <p>____________________________________________________________________</p>
  <p><strong>Action Items:</strong> _____________________________________________________</p>
  <p>____________________________________________________________________</p>
</div>

<div style="border: 2px solid #059669; padding: 15px; margin-top: 25px;">
  <h4 style="color: #059669; margin-top: 0;">OVERALL RATING</h4>
  <div style="display: flex; justify-content: space-between; font-size: 14px;">
    <div>☐ Excellent (5) - Exceeds expectations</div>
    <div>☐ Good (4) - Meets all requirements</div>
    <div>☐ Satisfactory (3) - Meets basic requirements</div>
    <div>☐ Needs Improvement (2)</div>
    <div>☐ Unsatisfactory (1)</div>
  </div>
</div>

<div style="margin-top: 30px; display: flex; justify-content: space-between;">
  <div>
    <p>Reviewer Signature: _________________________</p>
    <p>Date: _________________________</p>
  </div>
  <div>
    <p>Driver Signature: _________________________</p>
    <p>Date: _________________________</p>
  </div>
</div>
</body>
</html>`;

  const generateEmergencyContactHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Emergency Contact Card</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
.card { width: 3.5in; height: 2in; border: 2px solid #dc2626; border-radius: 8px; padding: 10px; box-sizing: border-box; margin: 0 auto; background-color: #fef2f2; }
.header { text-align: center; color: #dc2626; font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #dc2626; padding-bottom: 4px; }
.contact-info { font-size: 10px; line-height: 1.2; }
.emergency-section { margin-bottom: 6px; }
.company-section { border-top: 1px solid #dc2626; padding-top: 4px; margin-top: 8px; }
.phone { font-weight: bold; color: #dc2626; }
@media print { body { margin: 0; padding: 5px; } }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    🚨 EMERGENCY CONTACT
    <div style="font-size: 12px; color: #dc2626;">ReturnIt Delivery Services</div>
  </div>
  
  <div class="contact-info">
    <div class="emergency-section">
      <div><strong>EMERGENCY SERVICES:</strong></div>
      <div>Police/Fire/EMS: <span class="phone">911</span></div>
      <div>Non-Emergency: <span class="phone">(314) 231-1212</span></div>
    </div>
    
    <div class="emergency-section">
      <div><strong>COMPANY EMERGENCY:</strong></div>
      <div>24/7 Hotline: <span class="phone">(555) 911-HELP</span></div>
      <div>Dispatch: <span class="phone">(555) 123-4570</span></div>
    </div>
    
    <div class="company-section">
      <div><strong>EMPLOYEE INFO:</strong></div>
      <div>Name: _________________________</div>
      <div>Employee ID: ___________________</div>
      <div>Personal Emergency Contact:</div>
      <div>_______________________________</div>
      <div>Phone: ________________________</div>
    </div>
  </div>
</div>

<div style="margin-top: 20px; text-align: center; font-size: 10px; color: #666;">
  Cut along border • Keep in wallet • Report incidents immediately
</div>
</body>
</html>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div>
                <h1 className="text-3xl font-bold text-amber-900">Printable Templates</h1>
                <p className="text-amber-700">Ready-to-print forms and documents for operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                <Printer className="h-4 w-4 mr-1" />
                Print Ready
              </Badge>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                <Archive className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-white border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-amber-900">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs border-amber-300">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 text-sm mb-4">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.usedBy.map((user) => (
                    <Badge key={user} variant="secondary" className="text-xs">
                      {user}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => generateTemplate(template.id)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Reference Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Printing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">📄 General Printing</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Download HTML file and open in browser</li>
                  <li>• Use browser's "Print" function (Ctrl+P)</li>
                  <li>• Select "Save as PDF" for digital copies</li>
                  <li>• Use standard 8.5"×11" paper</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">🏷️ Labels & Cards</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Use label sheets or cardstock for durability</li>
                  <li>• Emergency contact cards: 3.5" × 2" business card size</li>
                  <li>• Delivery labels: Standard shipping label size</li>
                  <li>• Consider laminating frequently used items</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">📋 Forms & Checklists</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Print multiple copies for daily use</li>
                  <li>• Store in vehicle document holders</li>
                  <li>• Scan completed forms for digital records</li>
                  <li>• Keep blank forms in dispatch office</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Print a test page first to check formatting</li>
                <li>• Use "Fit to page" if content appears cut off</li>
                <li>• Keep digital copies in cloud storage for easy access</li>
                <li>• Review and update templates quarterly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
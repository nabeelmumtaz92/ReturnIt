import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, FileText, BookOpen, Users, Headphones, Settings, 
  Shield, Truck, Package, BarChart3, Clock, CheckCircle,
  User, Printer, FileDown, Archive, AlertTriangle
} from 'lucide-react';
import { ReturnItLogo } from '@/components/LogoIcon';

export default function EmployeeDocuments() {
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: string }>({});

  const generateWordDocument = async (documentType: string, _content?: any) => {
    setDownloadStatus(prev => ({ ...prev, [documentType]: 'generating' }));
    
    try {
      // Create a comprehensive HTML structure that can be opened as a Word document
      let htmlContent = '';
      
      switch (documentType) {
        case 'employee-guide':
          htmlContent = generateEmployeeGuideHTML();
          break;
        case 'support-specialist':
          htmlContent = generateSupportSpecialistHTML();
          break;
        case 'operations-manual':
          htmlContent = generateOperationsManualHTML();
          break;
        case 'manager-handbook':
          htmlContent = generateManagerHandbookHTML();
          break;
        case 'quick-reference':
          htmlContent = generateQuickReferenceHTML();
          break;
        case 'training-checklist':
          htmlContent = generateTrainingChecklistHTML();
          break;
      }

      // Create a Blob with HTML content that Word can read
      const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ReturnIt_${documentType.replace('-', '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadStatus(prev => ({ ...prev, [documentType]: 'completed' }));
    } catch (error) {
      console.error('Error generating document:', error);
      setDownloadStatus(prev => ({ ...prev, [documentType]: 'error' }));
    }
  };

  const generateEmployeeGuideHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Employee Guide</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
h3 { color: #d97706; }
.header { text-align: center; margin-bottom: 40px; }
.section { margin-bottom: 30px; page-break-inside: avoid; }
.steps { margin-left: 20px; }
.steps li { margin-bottom: 8px; }
.important { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
.contact-info { background-color: #f3f4f6; padding: 20px; margin-top: 30px; }
@media print { .section { page-break-inside: avoid; } }
</style>
</head>
<body>
<div class="header">
<h1>ReturnIt Employee Guide</h1>
<p><strong>Comprehensive Training Manual</strong></p>
<p>Version 1.0 - January 2025</p>
</div>

<div class="section">
<h2>🚀 Getting Started</h2>
<h3>Welcome to ReturnIt</h3>
<p>Welcome to the ReturnIt team! This comprehensive guide will help you master our platform and deliver exceptional service to our customers.</p>

<h3>First Day Setup</h3>
<ol class="steps">
<li>Log in with your company email and temporary password</li>
<li>Complete your profile setup in Account Settings</li>
<li>Review your role permissions and available features</li>
<li>Take the platform tour to familiarize yourself with the dashboard</li>
<li>Complete mandatory training modules for your role</li>
</ol>

<div class="important">
<strong>Important:</strong> Change your temporary password immediately and enable two-factor authentication for security.
</div>
</div>

<div class="section">
<h2>💬 Customer Support Excellence</h2>
<h3>Core Support Principles</h3>
<ul class="steps">
<li><strong>Empathy First:</strong> Always acknowledge the customer's situation with understanding</li>
<li><strong>Clear Communication:</strong> Use simple language and confirm understanding</li>
<li><strong>Solution-Focused:</strong> Work toward resolution, not just problem identification</li>
<li><strong>Follow Through:</strong> Always complete what you promise to do</li>
</ul>

<h3>Handling Customer Inquiries</h3>
<ol class="steps">
<li><strong>Greet Warmly:</strong> "Hello! Thank you for contacting ReturnIt. I'm [Name] and I'm here to help you today."</li>
<li><strong>Listen Actively:</strong> Let the customer explain their situation completely</li>
<li><strong>Acknowledge:</strong> "I understand this is frustrating, and I'm going to help resolve this for you."</li>
<li><strong>Investigate:</strong> Use our tracking system to gather all relevant information</li>
<li><strong>Explain Solutions:</strong> Present options clearly and let customer choose when possible</li>
<li><strong>Confirm Resolution:</strong> "Does this solve your concern? Is there anything else I can help with?"</li>
<li><strong>Document:</strong> Record all details in the support ticket system</li>
</ol>

<h3>Common Scenarios & Solutions</h3>
<h4>Order Tracking Issues</h4>
<ul class="steps">
<li>Access real-time tracking system immediately</li>
<li>Provide specific location and ETA updates</li>
<li>If delayed, offer proactive communication plan</li>
<li>Consider compensation for significant delays</li>
</ul>

<h4>Pickup Problems</h4>
<ul class="steps">
<li>Contact driver directly through platform messaging</li>
<li>Verify pickup address and access instructions</li>
<li>Reschedule if necessary with priority scheduling</li>
<li>Document any access or location challenges</li>
</ul>

<h4>Payment Disputes</h4>
<ul class="steps">
<li>Review complete order history and charges</li>
<li>Explain each fee clearly with policy references</li>
<li>Process refunds when policy allows</li>
<li>Escalate to supervisor for complex billing issues</li>
</ul>
</div>

<div class="section">
<h2>📦 Order Management System</h2>
<h3>Order Lifecycle</h3>
<ol class="steps">
<li><strong>Order Created:</strong> Customer books pickup through website or app</li>
<li><strong>Order Assigned:</strong> System assigns to available driver in area</li>
<li><strong>Driver En Route:</strong> Driver accepts and travels to pickup location</li>
<li><strong>Package Collected:</strong> Driver confirms pickup with photo verification</li>
<li><strong>In Transit:</strong> Package traveling to destination</li>
<li><strong>Delivered:</strong> Package delivered with confirmation</li>
<li><strong>Completed:</strong> Customer confirms satisfaction</li>
</ol>

<h3>Managing Order Issues</h3>
<h4>Missed Pickups</h4>
<ul class="steps">
<li>Immediately reschedule with priority status</li>
<li>Offer extended pickup window for customer convenience</li>
<li>Waive any rescheduling fees as goodwill gesture</li>
<li>Follow up to ensure successful pickup</li>
</ul>

<h4>Delivery Delays</h4>
<ul class="steps">
<li>Proactively notify customer before they contact us</li>
<li>Provide realistic updated timeframes</li>
<li>Offer tracking updates via SMS if preferred</li>
<li>Consider partial refunds for extended delays</li>
</ul>
</div>

<div class="section">
<h2>🚛 Driver Coordination</h2>
<h3>Driver Communication</h3>
<ul class="steps">
<li>Use respectful, professional tone in all driver communications</li>
<li>Provide clear, specific instructions for special requests</li>
<li>Support drivers with customer contact issues</li>
<li>Report driver feedback to management promptly</li>
</ul>

<h3>Driver Assignment Best Practices</h3>
<ul class="steps">
<li>Consider driver location and current workload</li>
<li>Match driver experience with order complexity</li>
<li>Factor in vehicle size for large orders</li>
<li>Optimize routes for multiple pickup efficiency</li>
</ul>
</div>

<div class="section">
<h2>📊 Platform Features</h2>
<h3>Real-Time Tracking System</h3>
<ul class="steps">
<li><strong>Live Map:</strong> Shows all active drivers and their current locations</li>
<li><strong>Order Status:</strong> Real-time updates on all order stages</li>
<li><strong>ETA Calculations:</strong> Automated estimates based on traffic and distance</li>
<li><strong>Customer Notifications:</strong> Automated SMS/email updates</li>
</ul>

<h3>Communication Tools</h3>
<ul class="steps">
<li><strong>Support Tickets:</strong> Complete history of customer interactions</li>
<li><strong>Internal Messaging:</strong> Secure team communication platform</li>
<li><strong>Driver Chat:</strong> Direct messaging with drivers in the field</li>
<li><strong>Customer Portal:</strong> Self-service options for customers</li>
</ul>

<h3>Reporting & Analytics</h3>
<ul class="steps">
<li><strong>Performance Dashboards:</strong> Track your response times and resolution rates</li>
<li><strong>Customer Satisfaction:</strong> Monitor feedback scores and comments</li>
<li><strong>Order Analytics:</strong> Volume trends and peak time analysis</li>
<li><strong>Driver Performance:</strong> Ratings, efficiency metrics, and feedback</li>
</ul>
</div>

<div class="section">
<h2>🛠️ Troubleshooting Guide</h2>
<h3>Technical Issues</h3>
<h4>Platform Not Loading</h4>
<ol class="steps">
<li>Check internet connection stability</li>
<li>Clear browser cache and cookies</li>
<li>Try different browser or incognito mode</li>
<li>Restart computer if problems persist</li>
<li>Contact IT support if issue continues</li>
</ol>

<h4>Login Problems</h4>
<ol class="steps">
<li>Verify email address spelling</li>
<li>Use "Forgot Password" if password doesn't work</li>
<li>Check for Caps Lock or special characters</li>
<li>Try different device or browser</li>
<li>Contact supervisor for account unlock</li>
</ol>

<h3>Common Customer Issues</h3>
<h4>Tracking Not Updating</h4>
<ul class="steps">
<li>Verify order number with customer</li>
<li>Check driver's last known location</li>
<li>Contact driver for status update</li>
<li>Manually update tracking if necessary</li>
<li>Follow up with customer within 30 minutes</li>
</ul>

<h4>Wrong Item Picked Up</h4>
<ul class="steps">
<li>Document what was actually collected vs. what was requested</li>
<li>Arrange immediate return of incorrect item</li>
<li>Schedule priority pickup for correct item</li>
<li>Waive all fees for the error</li>
<li>Provide service credit for inconvenience</li>
</ul>
</div>

<div class="section">
<h2>📞 Emergency Procedures</h2>
<h3>Customer Emergency Situations</h3>
<ul class="steps">
<li><strong>Lost or Stolen Packages:</strong> Immediately escalate to supervisor and file incident report</li>
<li><strong>Damaged Items:</strong> Document with photos, contact insurance team</li>
<li><strong>Driver Accidents:</strong> Ensure safety first, contact emergency services if needed</li>
<li><strong>Customer Complaints:</strong> De-escalate and involve management for serious issues</li>
</ul>

<h3>System Outages</h3>
<ul class="steps">
<li>Switch to backup communication methods</li>
<li>Use manual tracking procedures</li>
<li>Inform customers of temporary delays</li>
<li>Document all manual actions for later system input</li>
</ul>
</div>

<div class="contact-info">
<h2>📞 Important Contacts</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
<div>
<h3>Support & Operations</h3>
<p><strong>Support Hotline:</strong> (555) 123-4567</p>
<p><strong>IT Support:</strong> it@returnit.com</p>
<p><strong>Operations Manager:</strong> ops@returnit.com</p>
<p><strong>Customer Service:</strong> support@returnit.com</p>
</div>
<div>
<h3>Management</h3>
<p><strong>General Manager:</strong> (555) 123-4569</p>
<p><strong>HR Department:</strong> hr@returnit.com</p>
<p><strong>Emergency Line:</strong> (555) 911-HELP</p>
<p><strong>Driver Dispatch:</strong> (555) 123-4570</p>
</div>
</div>
</div>

<div class="section">
<h2>✅ Daily Checklist</h2>
<h3>Start of Shift</h3>
<ul class="steps">
<li>☐ Log into platform and check system status</li>
<li>☐ Review overnight tickets and urgent items</li>
<li>☐ Check driver availability and schedules</li>
<li>☐ Review any new policies or updates</li>
<li>☐ Test all communication tools</li>
</ul>

<h3>During Shift</h3>
<ul class="steps">
<li>☐ Monitor ticket queue every 15 minutes</li>
<li>☐ Update ticket statuses as work progresses</li>
<li>☐ Check driver locations hourly</li>
<li>☐ Follow up on pending customer issues</li>
<li>☐ Document all customer interactions</li>
</ul>

<h3>End of Shift</h3>
<ul class="steps">
<li>☐ Complete all open tickets or transfer to next shift</li>
<li>☐ Update any ongoing issue notes</li>
<li>☐ Review performance metrics for the day</li>
<li>☐ Submit any incident reports</li>
<li>☐ Log out of all systems securely</li>
</ul>
</div>

</body>
</html>`;

  const generateSupportSpecialistHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Customer Support Specialist Manual</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
h3 { color: #d97706; }
.header { text-align: center; margin-bottom: 40px; }
.section { margin-bottom: 30px; page-break-inside: avoid; }
.script { background-color: #e0f2fe; padding: 15px; margin: 15px 0; border-left: 4px solid #0369a1; }
.tip { background-color: #f0fdf4; padding: 15px; margin: 15px 0; border-left: 4px solid #16a34a; }
.warning { background-color: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
</style>
</head>
<body>
<div class="header">
<h1>Customer Support Specialist Manual</h1>
<p><strong>Specialized Training for Support Excellence</strong></p>
</div>

<div class="section">
<h2>🎯 Your Role & Responsibilities</h2>
<h3>Primary Duties</h3>
<ul>
<li>Respond to customer inquiries within 5 minutes during business hours</li>
<li>Resolve 80% of issues on first contact</li>
<li>Maintain customer satisfaction score above 4.5/5</li>
<li>Document all interactions thoroughly</li>
<li>Escalate complex issues appropriately</li>
</ul>

<h3>Key Performance Metrics</h3>
<ul>
<li><strong>Response Time:</strong> Average under 3 minutes</li>
<li><strong>Resolution Time:</strong> Average under 15 minutes</li>
<li><strong>Customer Satisfaction:</strong> 4.7/5 target</li>
<li><strong>Ticket Volume:</strong> 25-30 tickets per day</li>
<li><strong>Escalation Rate:</strong> Less than 10%</li>
</ul>
</div>

<div class="section">
<h2>💬 Communication Scripts</h2>

<div class="script">
<h3>Opening Greeting</h3>
<p><strong>Phone:</strong> "Hello, thank you for calling ReturnIt! This is [Your Name]. How can I help make your day better?"</p>
<p><strong>Chat/Email:</strong> "Hi [Customer Name]! Thanks for reaching out to ReturnIt. I'm [Your Name] and I'm here to help. What can I assist you with today?"</p>
</div>

<div class="script">
<h3>Acknowledging Issues</h3>
<p>"I completely understand your frustration with [issue]. That's definitely not the experience we want you to have. Let me look into this right away and get this resolved for you."</p>
</div>

<div class="script">
<h3>Providing Solutions</h3>
<p>"Great news! I found a solution for you. Here's what I can do: [explain solution]. This will [explain benefit]. Does this work for you?"</p>
</div>

<div class="script">
<h3>Closing Conversations</h3>
<p>"Is there anything else I can help you with today? I want to make sure you're completely satisfied before we end our conversation. Thank you for choosing ReturnIt!"</p>
</div>
</div>

<div class="section">
<h2>🔧 Issue Resolution Workflows</h2>

<h3>Workflow 1: Order Tracking Problems</h3>
<ol>
<li><strong>Gather Information</strong>
   - Order number
   - Customer email/phone
   - Date of order placement</li>
<li><strong>System Check</strong>
   - Look up order in tracking system
   - Check driver assignment and location
   - Review any notes from driver or dispatch</li>
<li><strong>Provide Update</strong>
   - Give specific location and ETA
   - Explain any delays with reasons
   - Set expectation for next update</li>
<li><strong>Follow-up Actions</strong>
   - Set reminder to check in 2 hours
   - Enable SMS tracking updates
   - Document customer preference for communication</li>
</ol>

<h3>Workflow 2: Missed Pickup</h3>
<ol>
<li><strong>Immediate Response</strong>
   - Apologize sincerely
   - Check driver notes for pickup attempt details
   - Verify correct address and access information</li>
<li><strong>Resolution</strong>
   - Schedule priority re-pickup for next available slot
   - Waive any fees for the inconvenience
   - Provide direct contact for the assigned driver</li>
<li><strong>Prevention</strong>
   - Add special instructions to customer profile
   - Flag address for future driver attention
   - Consider offering preferred time window</li>
</ol>

<h3>Workflow 3: Billing Disputes</h3>
<ol>
<li><strong>Review Charges</strong>
   - Pull up complete billing breakdown
   - Identify each fee and its policy basis
   - Check for any system errors</li>
<li><strong>Explanation</strong>
   - Walk through each charge clearly
   - Reference specific policy sections
   - Show comparative pricing if helpful</li>
<li><strong>Resolution Options</strong>
   - Apply available discounts or promotions
   - Offer service credits for future orders
   - Process partial refunds when justified</li>
</ol>
</div>

<div class="section">
<h2>🎯 Advanced Techniques</h2>

<div class="tip">
<h3>De-escalation Strategies</h3>
<ul>
<li><strong>Lower your voice:</strong> Speak more softly to encourage them to match your tone</li>
<li><strong>Acknowledge emotions:</strong> "I can hear that you're really frustrated about this"</li>
<li><strong>Find common ground:</strong> "We both want to get this resolved quickly"</li>
<li><strong>Use customer's name:</strong> Personalizes the interaction</li>
<li><strong>Take ownership:</strong> "Let me take care of this for you personally"</li>
</ul>
</div>

<div class="tip">
<h3>Upselling Opportunities</h3>
<ul>
<li><strong>Insurance:</strong> For valuable items, suggest package protection</li>
<li><strong>Faster Service:</strong> Offer expedited pickup for urgent returns</li>
<li><strong>Regular Service:</strong> Mention subscription discounts for frequent users</li>
<li><strong>Additional Items:</strong> "While we're scheduling pickup, do you have any other returns?"</li>
</ul>
</div>

<div class="warning">
<h3>When to Escalate</h3>
<ul>
<li>Customer demands refunds over your authorization limit</li>
<li>Legal threats or mentions of lawyers</li>
<li>Repeated service failures for the same customer</li>
<li>Driver misconduct allegations</li>
<li>Social media complaints or review threats</li>
<li>Technical issues you cannot resolve within 30 minutes</li>
</ul>
</div>
</div>

<div class="section">
<h2>📊 Ticket Management System</h2>

<h3>Ticket Priorities</h3>
<ul>
<li><strong>High Priority (Red):</strong> Service failures, lost packages, angry customers</li>
<li><strong>Medium Priority (Yellow):</strong> Billing questions, scheduling changes</li>
<li><strong>Low Priority (Green):</strong> General inquiries, account updates</li>
</ul>

<h3>Status Tracking</h3>
<ul>
<li><strong>Open:</strong> New ticket, needs initial response</li>
<li><strong>In Progress:</strong> Working on solution, may need customer input</li>
<li><strong>Pending Customer:</strong> Waiting for customer response</li>
<li><strong>Escalated:</strong> Transferred to supervisor or specialist team</li>
<li><strong>Resolved:</strong> Issue solved, customer satisfied</li>
</ul>

<h3>Documentation Standards</h3>
<ul>
<li>Use clear, professional language</li>
<li>Include all relevant details (order numbers, dates, amounts)</li>
<li>Note customer emotional state and satisfaction level</li>
<li>Record all promises made and actions taken</li>
<li>Add internal notes for team awareness</li>
</ul>
</div>

</body>
</html>`;

  const generateOperationsManualHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Operations Manual</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
h3 { color: #d97706; }
.header { text-align: center; margin-bottom: 40px; }
.section { margin-bottom: 30px; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="header">
<h1>ReturnIt Operations Manual</h1>
<p><strong>Driver Management & Operations Excellence</strong></p>
</div>

<div class="section">
<h2>🚛 Driver Management</h2>
<h3>Driver Onboarding Process</h3>
<ol>
<li>Background check verification</li>
<li>Vehicle inspection and documentation</li>
<li>Insurance verification</li>
<li>Platform training completion</li>
<li>First week mentoring program</li>
</ol>

<h3>Performance Monitoring</h3>
<ul>
<li>Daily route efficiency reviews</li>
<li>Customer satisfaction tracking</li>
<li>On-time delivery metrics</li>
<li>Safety incident reporting</li>
<li>Vehicle maintenance schedules</li>
</ul>
</div>

<div class="section">
<h2>📦 Order Processing</h2>
<h3>Order Assignment Algorithm</h3>
<ul>
<li>Driver location proximity (within 10 miles preferred)</li>
<li>Current workload balance</li>
<li>Vehicle capacity requirements</li>
<li>Driver performance ratings</li>
<li>Customer preference history</li>
</ul>

<h3>Route Optimization</h3>
<ul>
<li>Use AI-powered route planning</li>
<li>Consider traffic patterns and construction</li>
<li>Group pickups by geographic clusters</li>
<li>Allow flexibility for urgent requests</li>
<li>Monitor and adjust throughout the day</li>
</ul>
</div>

</body>
</html>`;

  const generateManagerHandbookHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Manager Handbook</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
h3 { color: #d97706; }
.header { text-align: center; margin-bottom: 40px; }
.section { margin-bottom: 30px; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="header">
<h1>ReturnIt Manager Handbook</h1>
<p><strong>Leadership & Team Management Guide</strong></p>
</div>

<div class="section">
<h2>👥 Team Leadership</h2>
<h3>Daily Management Tasks</h3>
<ul>
<li>Review team performance metrics</li>
<li>Address escalated customer issues</li>
<li>Monitor system performance and uptime</li>
<li>Conduct team stand-up meetings</li>
<li>Review and approve time-off requests</li>
</ul>

<h3>Weekly Objectives</h3>
<ul>
<li>Performance review and coaching sessions</li>
<li>Strategic planning and goal setting</li>
<li>Budget review and financial reporting</li>
<li>Process improvement initiatives</li>
<li>Stakeholder communication and updates</li>
</ul>
</div>

<div class="section">
<h2>📊 Performance Management</h2>
<h3>Key Metrics to Monitor</h3>
<ul>
<li>Customer satisfaction scores (target: >4.5/5)</li>
<li>Average response time (target: <5 minutes)</li>
<li>Order completion rate (target: >98%)</li>
<li>Driver efficiency ratings</li>
<li>Revenue per order and profit margins</li>
</ul>

<h3>Team Development</h3>
<ul>
<li>Regular one-on-one meetings with direct reports</li>
<li>Skill development and training programs</li>
<li>Career pathing and promotion planning</li>
<li>Recognition and reward programs</li>
<li>Cross-training initiatives for flexibility</li>
</ul>
</div>

</body>
</html>`;

  const generateQuickReferenceHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ReturnIt Quick Reference</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
.header { text-align: center; margin-bottom: 40px; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.reference-section { background-color: #f9fafb; padding: 20px; margin: 15px 0; border-left: 4px solid #f59e0b; }
</style>
</head>
<body>
<div class="header">
<h1>ReturnIt Quick Reference Guide</h1>
<p><strong>Essential Information at Your Fingertips</strong></p>
</div>

<div class="reference-section">
<h2>📞 Emergency Contacts</h2>
<div class="contact-grid">
<div>
<h3>Immediate Support</h3>
<p><strong>Support Hotline:</strong> (555) 123-4567</p>
<p><strong>Operations Emergency:</strong> (555) 911-HELP</p>
<p><strong>IT Support:</strong> it@returnit.com</p>
<p><strong>Manager On-Call:</strong> (555) 123-4569</p>
</div>
<div>
<h3>Departments</h3>
<p><strong>Customer Service:</strong> support@returnit.com</p>
<p><strong>Driver Dispatch:</strong> (555) 123-4570</p>
<p><strong>HR Department:</strong> hr@returnit.com</p>
<p><strong>Billing Questions:</strong> billing@returnit.com</p>
</div>
</div>
</div>

<div class="reference-section">
<h2>⚡ Common Solutions</h2>
<h3>Order Tracking Issues</h3>
<ul>
<li>Check real-time tracking system</li>
<li>Contact driver directly through platform</li>
<li>Provide ETA updates every 30 minutes</li>
<li>Enable SMS notifications for customer</li>
</ul>

<h3>Payment Problems</h3>
<ul>
<li>Verify payment method on file</li>
<li>Check for expired credit cards</li>
<li>Process refunds up to $50 without approval</li>
<li>Escalate billing disputes over $100</li>
</ul>

<h3>Delivery Delays</h3>
<ul>
<li>Proactively notify customers</li>
<li>Offer rescheduling at no charge</li>
<li>Provide service credits for delays >2 hours</li>
<li>Document weather/traffic causes</li>
</ul>
</div>

<div class="reference-section">
<h2>📋 Authorization Limits</h2>
<ul>
<li><strong>Refunds:</strong> Up to $50 without manager approval</li>
<li><strong>Service Credits:</strong> Up to $25 for service recovery</li>
<li><strong>Fee Waivers:</strong> Any standard fees (pickup, scheduling, etc.)</li>
<li><strong>Escalation Required:</strong> Legal issues, media complaints, >$100 disputes</li>
</ul>
</div>

<div class="reference-section">
<h2>🕒 Response Time Targets</h2>
<ul>
<li><strong>Phone Calls:</strong> Answer within 3 rings</li>
<li><strong>Live Chat:</strong> Initial response within 30 seconds</li>
<li><strong>Email:</strong> Response within 2 hours during business hours</li>
<li><strong>Escalations:</strong> Manager response within 30 minutes</li>
</ul>
</div>

</body>
</html>`;

  const generateTrainingChecklistHTML = () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Employee Training Checklist</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
h1 { color: #92400e; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #92400e; margin-top: 30px; }
.header { text-align: center; margin-bottom: 40px; }
.checklist { background-color: #f9fafb; padding: 20px; margin: 15px 0; }
.checklist ul { list-style: none; }
.checklist li { margin: 10px 0; }
.checklist input[type="checkbox"] { margin-right: 10px; }
</style>
</head>
<body>
<div class="header">
<h1>ReturnIt Employee Training Checklist</h1>
<p><strong>Complete Training Program Tracking</strong></p>
</div>

<div class="checklist">
<h2>📚 Week 1: Foundation Training</h2>
<ul>
<li>☐ Company orientation and culture introduction</li>
<li>☐ Platform overview and navigation training</li>
<li>☐ Customer service principles workshop</li>
<li>☐ Basic system functionality training</li>
<li>☐ Communication tools and protocols</li>
<li>☐ Security and privacy training</li>
<li>☐ Emergency procedures overview</li>
</ul>
</div>

<div class="checklist">
<h2>🎯 Week 2: Role-Specific Training</h2>
<h3>For Customer Support Specialists:</h3>
<ul>
<li>☐ Ticket management system training</li>
<li>☐ Customer communication scripts practice</li>
<li>☐ De-escalation techniques workshop</li>
<li>☐ Order tracking system mastery</li>
<li>☐ Billing and payment processing</li>
<li>☐ Refund and credit authorization levels</li>
</ul>

<h3>For Operations Staff:</h3>
<ul>
<li>☐ Driver management system training</li>
<li>☐ Route optimization techniques</li>
<li>☐ Performance monitoring tools</li>
<li>☐ Supply chain and logistics overview</li>
<li>☐ Quality assurance procedures</li>
</ul>
</div>

<div class="checklist">
<h2>🚀 Week 3: Advanced Skills</h2>
<ul>
<li>☐ Advanced problem-solving scenarios</li>
<li>☐ Cross-department collaboration training</li>
<li>☐ Performance metrics and goals setting</li>
<li>☐ Upselling and revenue optimization</li>
<li>☐ Customer retention strategies</li>
<li>☐ Final competency assessment</li>
</ul>
</div>

<div class="checklist">
<h2>✅ Certification Requirements</h2>
<ul>
<li>☐ Pass written knowledge assessment (80% minimum)</li>
<li>☐ Complete practical skills evaluation</li>
<li>☐ Shadow experienced team member for 3 shifts</li>
<li>☐ Handle 10 customer interactions independently</li>
<li>☐ Receive positive feedback from supervisor</li>
<li>☐ Sign off on all training documentation</li>
</ul>
</div>

<div style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
<h3>Trainer Sign-off</h3>
<p><strong>Employee Name:</strong> _________________________</p>
<p><strong>Start Date:</strong> _________________________</p>
<p><strong>Completion Date:</strong> _________________________</p>
<p><strong>Trainer Signature:</strong> _________________________</p>
<p><strong>Manager Approval:</strong> _________________________</p>
</div>

</body>
</html>`;

  const documents = [
    {
      id: 'employee-guide',
      title: 'Complete Employee Guide',
      description: 'Comprehensive training manual covering all platform features, customer service protocols, and daily procedures',
      icon: <BookOpen className="h-6 w-6" />,
      pages: '25-30 pages',
      category: 'Training'
    },
    {
      id: 'support-specialist',
      title: 'Customer Support Specialist Manual',
      description: 'Specialized guide for support team with scripts, workflows, and advanced techniques',
      icon: <Headphones className="h-6 w-6" />,
      pages: '15-20 pages',
      category: 'Support'
    },
    {
      id: 'operations-manual',
      title: 'Operations Manual',
      description: 'Driver management, route optimization, and operational excellence guide',
      icon: <Truck className="h-6 w-6" />,
      pages: '20-25 pages',
      category: 'Operations'
    },
    {
      id: 'manager-handbook',
      title: 'Manager Handbook',
      description: 'Leadership guide covering team management, performance metrics, and strategic planning',
      icon: <Users className="h-6 w-6" />,
      pages: '15-20 pages',
      category: 'Management'
    },
    {
      id: 'quick-reference',
      title: 'Quick Reference Guide',
      description: 'Essential contacts, common solutions, and authorization limits on one page',
      icon: <Clock className="h-6 w-6" />,
      pages: '2-3 pages',
      category: 'Reference'
    },
    {
      id: 'training-checklist',
      title: 'Training Checklist',
      description: 'Complete onboarding checklist with certification requirements',
      icon: <CheckCircle className="h-6 w-6" />,
      pages: '3-5 pages',
      category: 'Training'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Clock className="h-4 w-4 animate-spin text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generating':
        return 'Generating...';
      case 'completed':
        return 'Downloaded';
      case 'error':
        return 'Error - Retry';
      default:
        return 'Download';
    }
  };

  const downloadAllDocuments = async () => {
    for (const doc of documents) {
      await generateWordDocument(doc.id, doc);
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ReturnItLogo className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold text-amber-900">Employee Training Documents</h1>
                <p className="text-amber-700">Download printable guides and manuals for your team</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                <FileText className="h-4 w-4 mr-1" />
                Word Documents
              </Badge>
              <Button
                onClick={downloadAllDocuments}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Archive className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="bg-white border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-amber-900">{doc.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs border-amber-300">
                        {doc.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 text-sm mb-4">{doc.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-amber-600 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {doc.pages}
                  </span>
                  <span className="text-xs text-amber-600 flex items-center">
                    <Printer className="h-3 w-3 mr-1" />
                    Print Ready
                  </span>
                </div>
                <Button
                  onClick={() => generateWordDocument(doc.id, doc)}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300"
                  disabled={downloadStatus[doc.id] === 'generating'}
                >
                  {getStatusIcon(downloadStatus[doc.id])}
                  <span className="ml-2">{getStatusText(downloadStatus[doc.id])}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-amber-50 border-amber-300 mt-8">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center">
              <FileDown className="h-5 w-5 mr-2" />
              How to Use These Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-amber-900 mb-3">📥 Downloading</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Click "Download" to save each document as a .doc file</li>
                  <li>• Documents will open in Microsoft Word or similar programs</li>
                  <li>• Use "Download All" to get the complete training package</li>
                  <li>• Files are optimized for printing on standard 8.5"x11" paper</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-3">🖨️ Printing Tips</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Print in color for best visual impact</li>
                  <li>• Use "Fit to Page" if content appears too large</li>
                  <li>• Consider double-sided printing to save paper</li>
                  <li>• Bind training manuals for easy reference</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">💡 Implementation Suggestions</h4>
              <p className="text-sm text-amber-700">
                Print the Employee Guide for all new hires, provide role-specific manuals during training, 
                and post the Quick Reference Guide in common areas. Consider laminating frequently-used 
                reference materials for durability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
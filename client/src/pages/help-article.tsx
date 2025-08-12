import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  BookOpen,
  Phone,
  MessageCircle,
  Search,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  Settings,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Mail
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
  readTime: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
  relatedArticles: string[];
}

const helpArticles: Record<string, HelpArticle> = {
  'how-to-book-return': {
    id: 'how-to-book-return',
    title: 'How to Book a Return Pickup',
    category: 'Getting Started',
    lastUpdated: '2024-01-15',
    readTime: '3 min',
    helpful: 245,
    notHelpful: 12,
    tags: ['booking', 'pickup', 'returns'],
    relatedArticles: ['pricing-guide', 'tracking-order', 'return-policies'],
    content: `
# How to Book a Return Pickup

Booking a return with Returnly is simple and convenient. Follow these steps to schedule your pickup:

## Step 1: Start Your Return Request
1. Visit the Returnly homepage
2. Click "Book Pickup" or "Schedule Return"
3. Enter your zip code to confirm service availability in your area

## Step 2: Package Information
Fill out the following details about your return:

### Package Details
- **Retailer**: Select the store you're returning to (Amazon, Target, Best Buy, etc.)
- **Item Category**: Choose from Electronics, Clothing, Home & Garden, Beauty & Health, Books & Media, or Other
- **Box Size**: Select S, M, L, or XL based on your package dimensions
- **Number of Boxes**: Specify how many packages you need picked up
- **Item Description**: Brief description of what you're returning

### Return Information
- **Return Reason**: Select from dropdown options
- **Original Order Number**: Optional but helpful for tracking
- **Special Instructions**: Any specific pickup instructions

## Step 3: Pickup Details
### Pickup Address
- Enter your complete pickup address
- Include apartment/unit number if applicable
- Add gate codes or access instructions

### Pickup Time
- **Standard Pickup**: Next business day (free)
- **Same-Day Rush**: Available for +$3 fee
- **Preferred Time Window**: Choose morning (9 AM - 12 PM) or afternoon (12 PM - 5 PM)

## Step 4: Payment & Confirmation
1. Review your order summary and pricing
2. Apply any promo codes (like RETURN50 for 50% off first return)
3. Enter payment information
4. Add optional tip for your driver
5. Confirm your booking

## What Happens Next?
- You'll receive an email confirmation with tracking number
- Get SMS updates when driver is assigned and en route
- Driver will call/text 15-30 minutes before arrival
- Take photos of packages for proof of pickup
- Receive tracking updates until successful delivery

## Pricing Breakdown
Your total cost includes:
- **Base Fee**: $3.99 minimum service charge
- **Distance Fee**: $0.50 per mile from pickup to drop-off
- **Size Upcharge**: Large boxes +$2, XL boxes +$4
- **Multi-Box Fee**: $1.50 for each additional box
- **Service Fee**: 15% of subtotal
- **Rush Fee**: +$3 for same-day pickup (optional)
- **Tips**: Optional but appreciated by drivers

## Need Help?
If you have questions during booking:
- Use our AI chat support (bottom right corner)
- Call customer service: (314) 555-0123
- Email: support@returnly.com

> **Pro Tip**: Book your return the night before for best driver availability and pricing!
`
  },
  'pricing-guide': {
    id: 'pricing-guide',
    title: 'Understanding Returnly Pricing',
    category: 'Pricing & Payment',
    lastUpdated: '2024-01-12',
    readTime: '4 min',
    helpful: 189,
    notHelpful: 8,
    tags: ['pricing', 'fees', 'cost'],
    relatedArticles: ['how-to-book-return', 'promo-codes', 'payment-methods'],
    content: `
# Understanding Returnly Pricing

Our transparent pricing model ensures you know exactly what you'll pay before booking. Here's how we calculate your return cost:

## Base Pricing Structure

### Service Fees
- **Base Price**: $3.99 minimum charge per pickup
- **Service Fee**: 15% of subtotal (covers platform costs and support)
- **Distance Fee**: $0.50 per mile from your location to return destination

### Package Size Pricing
- **Small (S)**: Fits in a shoebox - No additional charge
- **Medium (M)**: Standard shipping box - No additional charge  
- **Large (L)**: Large appliance box - +$2.00 upcharge
- **Extra Large (XL)**: Oversized items - +$4.00 upcharge

### Multiple Packages
- **First Package**: Included in base price
- **Additional Packages**: +$1.50 per extra box
- **Maximum**: Up to 5 packages per pickup

## Optional Add-Ons

### Rush Delivery
- **Same-Day Pickup**: +$3.00 fee
- **Standard Pickup**: Next business day (free)

### Driver Tips
- **Recommended**: 10-20% of service cost
- **100% goes to driver**: We don't take any portion of tips
- **Add during booking or pay cash**

## Example Pricing Scenarios

### Scenario 1: Local Return
- 1 Medium box to nearby Target (2 miles)
- **Base Price**: $3.99
- **Distance**: 2 miles × $0.50 = $1.00
- **Subtotal**: $4.99
- **Service Fee**: $4.99 × 15% = $0.75
- **Total**: $5.74

### Scenario 2: Multiple Large Items
- 3 Large boxes to Amazon return center (8 miles)
- **Base Price**: $3.99
- **Size Upcharge**: 3 × $2.00 = $6.00
- **Additional Boxes**: 2 × $1.50 = $3.00
- **Distance**: 8 miles × $0.50 = $4.00
- **Subtotal**: $16.99
- **Service Fee**: $16.99 × 15% = $2.55
- **Total**: $19.54

### Scenario 3: Rush Same-Day
- 1 Small box, same-day pickup (5 miles)
- **Base Price**: $3.99
- **Distance**: 5 miles × $0.50 = $2.50
- **Rush Fee**: $3.00
- **Subtotal**: $9.49
- **Service Fee**: $9.49 × 15% = $1.42
- **Total**: $10.91

## Ways to Save Money

### Promo Codes
- **RETURN50**: 50% off your first return
- **BULK5**: $5 off orders with 3+ packages
- **WEEKLY**: 20% off for repeat customers

### Timing Tips
- **Book ahead**: Standard next-day pickup is always free
- **Combine returns**: Multiple packages in one pickup saves money
- **Off-peak hours**: Better driver availability can mean faster service

### Distance Optimization
- **Choose nearest location**: Many retailers have multiple return centers
- **Group by destination**: Return items to the same store together

## Payment Methods Accepted
- All major credit cards (Visa, MasterCard, American Express, Discover)
- Debit cards
- Apple Pay
- Google Pay
- PayPal

## Billing & Receipts
- **Charged when booked**: Payment processed immediately upon confirmation
- **Email receipt**: Detailed breakdown sent to your email
- **Refund policy**: Full refund if pickup cannot be completed
- **Business expenses**: Detailed receipts for expense reporting

## Questions About Pricing?
Contact our support team:
- **Chat**: Available 24/7 on our website
- **Phone**: (314) 555-0123
- **Email**: billing@returnly.com

> **Note**: Prices may vary during peak seasons (holidays) or high-demand periods. You'll always see the exact price before confirming your booking.
`
  },
  'tracking-order': {
    id: 'tracking-order',
    title: 'Track Your Return Order',
    category: 'Order Management',
    lastUpdated: '2024-01-10',
    readTime: '2 min',
    helpful: 156,
    notHelpful: 5,
    tags: ['tracking', 'status', 'delivery'],
    relatedArticles: ['how-to-book-return', 'driver-communication', 'delivery-issues'],
    content: `
# Track Your Return Order

Stay updated on your return pickup from booking to final delivery with our comprehensive tracking system.

## How to Track Your Order

### Method 1: Tracking Number
1. Find your tracking number in your confirmation email
2. Visit the Returnly homepage
3. Enter tracking number in the "Track Order" field
4. View real-time status updates

### Method 2: Account Dashboard
1. Log into your Returnly account
2. Go to "My Orders" section
3. View all current and past returns
4. Click on any order for detailed tracking

### Method 3: SMS & Email Updates
- Automatic notifications sent to your phone and email
- Real-time updates as your order progresses
- No need to actively check - we'll keep you informed!

## Order Status Explained

### 📋 Order Confirmed
- Your return pickup has been booked successfully
- Payment processed and confirmation email sent
- Estimated pickup time provided

### 👤 Driver Assigned  
- A driver has accepted your pickup request
- You'll receive driver details and contact information
- Estimated arrival time updated

### 🚗 Driver En Route
- Driver is on their way to your location
- Receive notification 15-30 minutes before arrival
- Track driver's approximate location

### 📦 Package Picked Up
- Driver has successfully collected your package(s)
- Photo confirmation taken for your records
- Package now in transit to destination

### 🚚 Out for Delivery
- Package is being transported to return location
- Estimated delivery time to final destination
- Driver may make multiple stops along the route

### ✅ Delivered
- Package successfully delivered to retailer
- Delivery confirmation photo provided
- Return process complete - you're all set!

## Real-Time Features

### Live Driver Tracking
- See your driver's approximate location on map
- Estimated arrival time updates automatically
- Get notified when driver is nearby

### Communication Tools
- Direct messaging with your driver
- Call or text driver through the app
- Automatic notifications at each step

### Photo Documentation
- Pickup confirmation photos
- Delivery proof photos
- Visual record of package condition

## What to Expect Timeline-Wise

### Standard Pickup (Next Day)
- **Morning Booking**: Pickup next business day
- **Afternoon Booking**: Pickup next business day
- **Weekend Booking**: Pickup Monday (if booked Friday-Sunday)

### Same-Day Rush Pickup
- **Before 10 AM**: Pickup same day afternoon
- **After 2 PM**: May extend to next business day
- **Weekend Rush**: Limited availability, additional fees apply

### Delivery Times
- **Local destinations**: Same day as pickup
- **Cross-town deliveries**: Within 24 hours
- **Multiple stops**: May take 2-3 business days

## Troubleshooting Tracking Issues

### Can't Find Your Tracking Number?
- Check your email confirmation (including spam folder)
- Log into your account to view order history
- Contact support with your phone number or email

### Status Not Updating?
- Allow 15-30 minutes between status changes
- Refresh your tracking page
- Check for SMS/email notifications

### Driver Communication Issues?
- Try calling the driver directly
- Use in-app messaging feature
- Contact customer support for assistance

## Need Help Tracking?

### Customer Support
- **24/7 Chat**: Available on website and app
- **Phone**: (314) 555-0123
- **Email**: tracking@returnly.com

### Driver Support
- **Direct Contact**: Call/text your assigned driver
- **Driver Hotline**: (314) 555-0199 (for drivers)
- **Emergency**: Use in-app emergency contact button

> **Pro Tip**: Enable push notifications in your phone settings to get instant updates about your return status!
`
  },
  'driver-faq': {
    id: 'driver-faq',
    title: 'Driver FAQ - Frequently Asked Questions',
    category: 'For Drivers',
    lastUpdated: '2024-01-14',
    readTime: '6 min',
    helpful: 312,
    notHelpful: 18,
    tags: ['driver', 'faq', 'earnings', 'requirements'],
    relatedArticles: ['driver-requirements', 'driver-payments', 'driver-safety'],
    content: `
# Driver FAQ - Frequently Asked Questions

Get answers to the most common questions about driving with Returnly.

## Getting Started

### How do I become a Returnly driver?
1. **Meet Requirements**: 18+ years old, valid driver's license, vehicle insurance, clean driving record
2. **Apply Online**: Complete application at returnly.com/driver-onboarding
3. **Background Check**: We use Checkr for fast, secure background screening
4. **Vehicle Approval**: Submit photos and documents for vehicle verification
5. **Complete Training**: Take our 10-minute driver tutorial
6. **Start Driving**: Go online and start accepting pickup requests!

### What are the vehicle requirements?
- **Year**: 2010 or newer
- **Type**: Car, SUV, pickup truck, or cargo van
- **Condition**: Clean, well-maintained, no major damage
- **Insurance**: Current liability insurance required
- **Capacity**: Able to transport packages safely

### How long does approval take?
- **Application**: Instant submission
- **Background Check**: 2-7 business days
- **Vehicle Approval**: Same day if documents are clear
- **Total Time**: Most drivers approved within 3-5 business days

## Earnings & Payments

### How much can I earn?
**Hourly Potential**: $18-25+ per hour depending on:
- **Base Pay**: $3.00 per completed pickup
- **Distance**: $0.35 per mile driven
- **Time**: $8.00 per hour of active work
- **Size Bonuses**: $1-2 extra for large packages
- **Tips**: 100% of customer tips (average $2-5 per order)
- **Peak Bonuses**: Extra pay during busy periods

### When do I get paid?
**Two Payment Options**:
1. **Instant Pay**: Cash out anytime after completing deliveries (small fee applies)
2. **Weekly Pay**: Automatic deposit every Tuesday for previous week (free)

**Payment Schedule**:
- **Instant**: Available immediately after delivery completion
- **Weekly**: Deposits every Tuesday by 6 AM
- **Holidays**: May delay weekly payments by 1 business day

### How are tips handled?
- **100% to Driver**: We never take a portion of tips
- **Instant Access**: Tips available for immediate cash-out
- **Tax Reporting**: All tips included in annual 1099 form
- **Average Tips**: Most customers tip $2-5 per pickup

## Work Schedule & Availability

### When can I work?
**Service Hours**:
- **Monday-Friday**: 8 AM - 8 PM
- **Saturday**: 9 AM - 6 PM
- **Sunday**: 11 AM - 5 PM
- **Holidays**: Limited hours, usually closed major holidays

**Driver Flexibility**:
- Work when you want within service hours
- No minimum hours required
- Go online/offline anytime
- Peak hours typically 10 AM-2 PM and 4 PM-7 PM

### How do I get more orders?
**Tips for More Pickups**:
- **Stay Online**: Longer online time = more opportunities
- **Peak Hours**: Work during busy periods for consistent orders
- **Good Rating**: Maintain 4.7+ star rating for priority access
- **Fast Acceptance**: Accept orders quickly (within 60 seconds)
- **Efficient Routes**: Complete deliveries quickly to get more orders

## App & Technology

### How does the driver app work?
**Core Features**:
- **Go Online/Offline**: Toggle availability status
- **Order Notifications**: Receive pickup requests with details
- **Navigation**: Built-in GPS routing to pickup and drop-off
- **Communication**: Call/text customers directly
- **Photo Upload**: Document pickup and delivery
- **Earnings Tracker**: Real-time earnings and statistics

### What if I have app issues?
**Troubleshooting Steps**:
1. **Force Close**: Close and reopen the app
2. **Update**: Ensure you have the latest version
3. **Restart Phone**: Power cycle your device
4. **Check Connection**: Verify strong internet connection
5. **Contact Support**: 24/7 technical support available

## Customer Interaction

### What if customer isn't available?
**Standard Procedure**:
1. **Call Customer**: Try calling first
2. **Text Message**: Send arrival notification
3. **Wait 10 Minutes**: Give reasonable time to respond
4. **Follow Instructions**: Check pickup notes for alternatives
5. **Contact Support**: If unable to complete pickup after attempts

### How do I handle difficult customers?
**Professional Guidelines**:
- **Stay Calm**: Always remain professional and courteous
- **Safety First**: If you feel unsafe, leave immediately
- **Document Issues**: Take notes and photos if necessary
- **Contact Support**: Use emergency support line for serious issues
- **Don't Argue**: Politely disengage from confrontational situations

## Safety & Support

### What safety measures are in place?
**Driver Safety**:
- **24/7 Support**: Emergency hotline always available
- **Real-Time Tracking**: Your location is monitored during deliveries
- **Customer Verification**: All customers must provide valid contact info
- **Insurance**: Additional coverage during active deliveries
- **Background Checks**: All customers also undergo verification

### Who do I contact for help?
**Support Channels**:
- **Driver Support**: (314) 555-0199 (24/7 hotline)
- **In-App Chat**: Available in driver portal
- **Email**: driversupport@returnly.com
- **Emergency**: 911 for immediate safety concerns
- **General Questions**: Regular support at (314) 555-0123

## Taxes & Documentation

### What tax documents will I receive?
**Annual Forms**:
- **1099-NEC**: If you earned $600+ during tax year
- **Summary Report**: Detailed breakdown of earnings by category
- **Expense Tracking**: Mileage and vehicle expense summaries
- **Tip Reporting**: Separate documentation for tip income

### Can I deduct vehicle expenses?
**Deductible Expenses**:
- **Mileage**: Standard IRS rate per business mile
- **Gas & Maintenance**: Direct vehicle costs
- **Phone Bill**: Portion used for work
- **Insurance**: Additional coverage costs
- **Consult Tax Professional**: For specific tax advice

> **Questions Not Answered Here?** Contact our driver support team 24/7 at (314) 555-0199 or through the driver portal chat feature!
`
  },
  'return-policies': {
    id: 'return-policies',
    title: 'Return Policies & Guidelines',
    category: 'Policies',
    lastUpdated: '2024-01-08',
    readTime: '5 min',
    helpful: 198,
    notHelpful: 22,
    tags: ['policies', 'guidelines', 'returns', 'restrictions'],
    relatedArticles: ['how-to-book-return', 'prohibited-items', 'refund-policy'],
    content: `
# Return Policies & Guidelines

Understanding our policies ensures a smooth return experience for everyone.

## What We Accept

### Eligible Items
✅ **Most Retail Returns**:
- Electronics and appliances
- Clothing and accessories  
- Home and garden items
- Books and media
- Beauty and health products
- Toys and games
- Sports and outdoor equipment

✅ **Package Requirements**:
- Items must be properly packaged
- Include original return labels when possible
- Maximum weight: 50 lbs per package
- Maximum dimensions: 36" x 24" x 24"

### Retailer Partnerships
We work with **500+ partner retailers** including:
- **Major Retailers**: Amazon, Target, Walmart, Best Buy, Home Depot
- **Department Stores**: Macy's, Nordstrom, Kohl's
- **Specialty Stores**: REI, Ulta, Sephora, GameStop
- **Online Retailers**: Most major e-commerce sites

## What We Don't Accept

### Prohibited Items ❌
- **Hazardous Materials**: Chemicals, flammables, batteries
- **Perishables**: Food items, plants, flowers
- **Fragile Items**: Glass, ceramics (unless professionally packed)
- **Valuable Items**: Jewelry, cash, gift cards over $100
- **Personal Items**: Used clothing, shoes, undergarments
- **Controlled Substances**: Medications, supplements

### Size & Weight Restrictions
- **Maximum Weight**: 50 lbs per individual package
- **Maximum Dimensions**: Cannot exceed 6 feet in any direction
- **Oversized Items**: Furniture, appliances requiring special handling
- **Multiple Small Items**: Must be consolidated into boxes

## Service Areas & Limitations

### Current Service Area
**St. Louis Metro Area**:
- St. Louis City and County
- St. Charles County
- Jefferson County
- Madison County (Illinois)
- St. Clair County (Illinois)

### Distance Limits
- **Pickup Radius**: Within 25 miles of downtown St. Louis
- **Delivery Radius**: Within 30 miles of pickup location
- **Special Requests**: Contact support for areas outside standard zones

## Booking Policies

### Scheduling Requirements
- **Advance Notice**: Minimum 2 hours for same-day pickup
- **Standard Booking**: Next business day pickup available
- **Holiday Schedule**: Limited service on major holidays
- **Weather Policy**: Service may be suspended during severe weather

### Modification & Cancellation
- **Free Cancellation**: Up to 1 hour before scheduled pickup
- **Modification**: Change time/date up to 2 hours before pickup
- **Late Cancellation**: $5 fee for cancellations within 1 hour
- **No-Show Fee**: $10 fee if customer unavailable during pickup window

## Driver Interaction Guidelines

### Customer Responsibilities
✅ **Be Available**: During scheduled pickup window
✅ **Package Ready**: Items properly boxed and labeled
✅ **Clear Access**: Ensure driver can safely reach pickup location
✅ **Communication**: Respond to driver calls/texts promptly
✅ **Respectful**: Professional interaction with drivers

### What to Expect
- **Arrival Window**: Driver will arrive within scheduled timeframe
- **Communication**: Call/text 15-30 minutes before arrival
- **ID Verification**: Driver may request name confirmation
- **Photo Documentation**: Driver will take pickup confirmation photos
- **Receipt**: Digital confirmation sent to your email/phone

## Payment & Refund Policies

### Payment Processing
- **Charged Immediately**: Upon booking confirmation
- **Payment Methods**: All major cards, PayPal, Apple Pay, Google Pay
- **Currency**: USD only
- **Business Accounts**: Invoicing available for corporate customers

### Refund Conditions
**Full Refund Scenarios**:
- Service area not available for your pickup/delivery
- Driver unable to complete pickup due to our error
- Technical issues preventing service completion
- Weather-related service cancellations

**Partial Refund Scenarios**:
- Package size/weight significantly different than booked
- Address changes requiring different distance pricing
- Service downgrades (rush to standard delivery)

**No Refund Scenarios**:
- Customer not available during pickup window
- Prohibited items discovered after booking
- Customer-requested cancellations within 1 hour
- Packages refused by destination retailer

## Quality & Satisfaction

### Our Service Promise
- **98% Success Rate**: Industry-leading completion rate
- **15-Minute Average**: Pickup time at your location
- **Real-Time Tracking**: Know exactly where your packages are
- **Professional Drivers**: Background-checked, insured drivers
- **Customer Support**: 24/7 assistance available

### Issue Resolution
**If Something Goes Wrong**:
1. **Contact Support**: Call (314) 555-0123 immediately
2. **Document Issues**: Take photos if packages are damaged
3. **File Report**: Use in-app reporting for quick resolution
4. **Follow Up**: We'll investigate and respond within 24 hours

### Feedback & Ratings
- **Rate Your Experience**: Help us improve service quality
- **Driver Ratings**: Rate your driver after each pickup
- **Service Feedback**: Tell us how we're doing
- **Suggestions Welcome**: Contact us with improvement ideas

## Privacy & Security

### Information Protection
- **Secure Payments**: PCI-compliant payment processing
- **Personal Data**: Encrypted storage of customer information
- **Location Privacy**: Precise addresses only shared with assigned drivers
- **Communication**: All driver-customer communication logged for security

### Package Security
- **Chain of Custody**: Detailed tracking from pickup to delivery
- **Photo Documentation**: Visual proof at each step
- **Insurance Coverage**: Protection against loss or damage
- **Secure Transport**: Professional handling throughout journey

## Legal & Compliance

### Terms of Service
- **Acceptance**: Using our service constitutes agreement to terms
- **Updates**: Policies may change with advance notice
- **Jurisdiction**: Governed by Missouri state law
- **Disputes**: Resolved through binding arbitration

### Liability Limits
- **Maximum Coverage**: Up to $1000 per package
- **Exclusions**: Items exceeding declared value limits
- **Insurance Claims**: Must be reported within 24 hours
- **Documentation**: Photos and receipts required for claims

## Questions About Policies?
**Contact Our Policy Team**:
- **Email**: policies@returnly.com
- **Phone**: (314) 555-0123
- **Live Chat**: Available 24/7 on website
- **Mail**: Returnly Legal, 123 Gateway Ave, St. Louis, MO 63101

> **Policy Updates**: We'll notify customers of any significant policy changes via email and app notifications.
`
  },
  'contact-support': {
    id: 'contact-support',
    title: 'Contact Customer Support',
    category: 'Support',
    lastUpdated: '2024-01-16',
    readTime: '2 min',
    helpful: 267,
    notHelpful: 8,
    tags: ['support', 'contact', 'help', 'customer service'],
    relatedArticles: ['driver-faq', 'return-policies', 'troubleshooting'],
    content: `
# Contact Customer Support

Get help quickly with multiple ways to reach our support team.

## 24/7 Support Options

### 💬 Live Chat (Recommended)
**Fastest Response Time**: Usually under 2 minutes
- **Available**: 24/7, 365 days a year
- **Access**: Click the chat bubble on any page
- **AI Assistant**: Instant answers to common questions
- **Human Agents**: Seamless handoff for complex issues
- **Languages**: English and Spanish supported

### 📞 Phone Support
**Customer Service**: (314) 555-0123
- **Available**: 6 AM - 11 PM CT, 7 days a week
- **Average Wait**: Under 3 minutes during business hours
- **Emergency Line**: 24/7 for urgent delivery issues
- **Callback Option**: Request callback to avoid waiting

**Driver Support**: (314) 555-0199
- **Available**: 24/7 dedicated driver hotline
- **For**: Active drivers needing immediate assistance
- **Emergency**: Safety issues and urgent delivery problems

### 📧 Email Support
**Response Time**: Within 4 hours during business days

**General Support**: support@returnly.com
- Order questions and booking issues
- Account management and billing
- General service inquiries

**Technical Support**: tech@returnly.com
- App problems and website issues
- Login and account access problems
- Payment processing issues

**Billing Support**: billing@returnly.com
- Payment questions and refund requests
- Corporate account inquiries
- Receipt and documentation requests

## What Information to Include

### For Faster Support
When contacting us, please provide:
- **Order Number**: Your tracking/confirmation number
- **Phone Number**: Associated with your account
- **Email Address**: Used for booking
- **Issue Description**: Clear explanation of the problem
- **Screenshots**: If experiencing app/website issues

### Common Issues We Handle
- **Booking Problems**: Can't complete order, payment issues
- **Tracking Questions**: Where is my package, status updates
- **Driver Issues**: Communication problems, delays
- **Billing Disputes**: Incorrect charges, refund requests
- **Account Help**: Password resets, profile updates
- **Technical Problems**: App crashes, website errors

## Support Response Times

### Priority Levels
**🔴 Emergency (Immediate)**:
- Safety concerns or driver emergencies
- Lost packages over $100 value
- Payment processing failures

**🟡 Urgent (Within 1 Hour)**:
- Active delivery issues
- Booking problems for same-day pickup
- Customer-driver communication issues

**🟢 Standard (Within 4 Hours)**:
- General questions and account issues
- Billing inquiries
- Technical support requests

**🔵 Low Priority (Within 24 Hours)**:
- Feature requests and feedback
- Non-urgent account modifications
- General policy questions

## Self-Service Options

### Help Center
**Instant Answers**: Browse 50+ detailed articles covering:
- How-to guides and tutorials
- Pricing and payment information
- Policy and guideline explanations
- Troubleshooting common issues

### Account Portal
**Manage Your Account**:
- View order history and tracking
- Update payment methods and addresses
- Download receipts and documentation
- Modify notification preferences

### FAQ Search
**Quick Solutions**: Search our database of common questions:
- Type your question in natural language
- Get instant relevant article suggestions
- Access step-by-step solutions
- Find related helpful resources

## Feedback & Improvement

### Rate Your Support Experience
After each support interaction:
- **Service Quality**: Rate your representative
- **Resolution Time**: Was your issue solved quickly?
- **Satisfaction**: Overall experience rating
- **Additional Comments**: Suggestions for improvement

### Feature Requests
Have ideas to improve Returnly?
- **Email**: feedback@returnly.com
- **In-App**: Use "Suggest a Feature" option
- **Community**: Join our user feedback forum
- **Beta Testing**: Sign up for early feature access

## Social Media Support
Follow us for updates and quick support:
- **Twitter**: @ReturnlySupport (fastest social response)
- **Facebook**: /ReturnlyStLouis
- **Instagram**: @returnly_official
- **LinkedIn**: /company/returnly

## Business & Enterprise Support

### Corporate Accounts
**Dedicated Support**: For businesses using Returnly regularly
- **Account Manager**: Dedicated point of contact
- **Priority Support**: Faster response times
- **Custom Solutions**: Tailored service options
- **Billing Support**: Invoicing and expense management

**Contact**: enterprise@returnly.com or (314) 555-0140

### Partner Support
**For Retail Partners**:
- Integration assistance
- Technical documentation
- Performance reporting
- Account management

**Contact**: partners@returnly.com

## Emergency Contacts

### For Drivers
**Immediate Safety Issues**: Call 911 first, then (314) 555-0199
**Vehicle Breakdown**: (314) 555-0199
**Customer Disputes**: (314) 555-0199

### For Customers
**Lost High-Value Package**: (314) 555-0123 (24/7 emergency line)
**Driver Safety Concerns**: Call 911 first, then report to us
**Urgent Delivery Issues**: Live chat or (314) 555-0123

## Office Location
**Returnly Headquarters**
123 Gateway Avenue, Suite 500
St. Louis, MO 63101

**Office Hours**: Monday-Friday, 8 AM - 6 PM CT
**Parking**: Visitor parking available in Gateway Garage
**Public Transit**: MetroLink Grand Station (2 blocks)

*Note: Office visits by appointment only. Most issues can be resolved faster through phone, chat, or email support.*

> **Quick Tip**: For the fastest support, use live chat with your order number ready. Our AI assistant can solve most common issues instantly!
`
  }
};

export default function HelpArticle() {
  const [location] = useLocation();
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | null>(null);
  const [userFeedback, setUserFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HelpArticle[]>([]);

  // Extract article ID from URL path
  useEffect(() => {
    const pathParts = location.split('/');
    const articleId = pathParts[pathParts.length - 1];
    
    if (articleId && helpArticles[articleId]) {
      const article = helpArticles[articleId];
      setCurrentArticle(article);
      
      // Load related articles
      const related = article.relatedArticles
        .map(id => helpArticles[id])
        .filter(Boolean)
        .slice(0, 3);
      setRelatedArticles(related);
    }
  }, [location]);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setUserFeedback(type);
    // Here you would typically send feedback to your analytics system
  };

  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Article Not Found</h1>
          <p className="text-amber-700 mb-4">The help article you're looking for doesn't exist.</p>
          <Link href="/help-center">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/help-center">
            <Button variant="outline" className="mb-4" data-testid="button-back-help-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {currentArticle.category}
            </Badge>
            {currentArticle.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold text-amber-900 mb-4">{currentArticle.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{currentArticle.readTime} read</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Updated {new Date(currentArticle.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span>{currentArticle.helpful} helpful</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="prose prose-amber max-w-none p-8">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: currentArticle.content.replace(/\n/g, '<br>').replace(/#{1,6}([^#\n]+)/g, '<h$1>$2</h$1>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
              }} 
            />
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-600" />
              Was this article helpful?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userFeedback ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-semibold">Thank you for your feedback!</p>
                <p className="text-gray-600 text-sm">Your input helps us improve our help documentation.</p>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleFeedback('helpful')}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
                  data-testid="button-helpful"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes, helpful
                </Button>
                <Button
                  onClick={() => handleFeedback('not-helpful')}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
                  data-testid="button-not-helpful"
                >
                  <ThumbsDown className="h-4 w-4" />
                  No, not helpful
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <Card className="bg-white shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                Related Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedArticles.map((article) => (
                  <Link key={article.id} href={`/help-article/${article.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-amber-50 transition-colors cursor-pointer" data-testid={`related-article-${article.id}`}>
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">{article.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{article.category}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                <p className="text-amber-100">Our support team is available 24/7 to assist you with any questions.</p>
              </div>
              <div className="flex gap-3">
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-live-chat">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-amber-600" data-testid="button-call-support">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  User, 
  Calendar,
  Share,
  Bookmark,
  CheckCircle,
  Star,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";

export default function HelpArticle() {
  const [match] = useRoute('/help-article/:articleId');
  const articleId = match?.articleId || '';
  
  const [hasVoted, setHasVoted] = useState(false);
  const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Article content database - in a real app this would come from an API
  const articleContent: Record<string, any> = {
    'how-to-book-return': {
      title: "How to Book a Return Pickup",
      category: "Getting Started",
      readTime: "3 min",
      lastUpdated: "2024-01-15",
      author: "ReturnIt Support Team",
      popularity: 98,
      content: `
# How to Book a Return Pickup

Booking a return pickup with ReturnIt is quick and easy! Follow this step-by-step guide to schedule your first pickup.

## Prerequisites
- A ReturnIt account (sign up at returnit.com)
- Items ready for return with original packaging when possible
- Return receipt or order information from the retailer

## Step 1: Start Your Booking
1. **Log into your account** at returnly.com or open the mobile app
2. **Click "Book Pickup"** on the main dashboard
3. **Select your pickup address** from saved addresses or add a new one

## Step 2: Package Information
- **Retailer**: Select where you're returning items (Amazon, Target, Best Buy, etc.)
- **Item Category**: Choose the type of items (Electronics, Clothing, etc.)
- **Box Size**: Select Small, Medium, Large, or Extra Large
- **Number of Boxes**: Enter how many packages you have
- **Description**: Add any special notes about your items

## Step 3: Schedule Pickup
- **Date**: Choose your preferred pickup date (same-day available in most areas)
- **Time Window**: Select a 2-hour window that works for you
- **Special Instructions**: Add gate codes, building access, or location details

## Step 4: Review and Pay
- Review your pickup details and pricing breakdown
- **Pricing includes**: Base fee ($3.99) + distance + size upcharge if applicable
- Add payment method (cards, Apple Pay, Google Pay accepted)
- **Tip**: You can add a tip for your driver (optional but appreciated!)

## Step 5: Confirmation
- You'll receive an email and SMS confirmation immediately
- Track your pickup status in real-time through the app
- Get notified when your driver is assigned and on the way

## What Happens Next?
1. **Driver Assignment**: A verified driver will accept your pickup
2. **Pickup**: Driver arrives during your chosen time window
3. **Transport**: Your items are safely transported to the return location
4. **Confirmation**: You'll receive confirmation when items are delivered

## Pricing Breakdown
- **Base Fee**: $3.99 (covers up to 5 miles)
- **Distance**: $0.50 per additional mile
- **Size Upcharges**: Large +$2, Extra Large +$4
- **Multiple Boxes**: $1.50 per additional box
- **Rush Fee**: +$3 for same-day pickup
- **Service Fee**: 15% of subtotal

## Tips for Success
- **Package items securely** - use original boxes when possible
- **Be available** during your selected time window
- **Provide accurate descriptions** to help with pricing
- **Include return labels** if provided by the retailer
- **Take photos** of items for your records

## Need Help?
If you run into any issues during booking:
- **Live Chat**: Available 8 AM - 8 PM CST
- **Phone**: (636) 254-4821
- **Email**: support@returnly.com

## Related Articles
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
- [Track Your Return Order](/help-article/tracking-order)
- [Service Areas & Availability](/help-article/service-areas)
      `,
      relatedArticles: ['pricing-guide', 'tracking-order', 'service-areas'],
      tags: ['booking', 'pickup', 'getting-started', 'tutorial', 'first-time']
    },
    'pricing-guide': {
      title: "Understanding ReturnIt Pricing",
      category: "Pricing & Payment",
      readTime: "4 min",
      lastUpdated: "2024-01-10",
      author: "ReturnIt Support Team",
      popularity: 94,
      content: `
# Understanding ReturnIt Pricing

Our transparent pricing model is designed to be fair and predictable. Here's exactly how we calculate your pickup costs.

## Base Pricing Structure

### Base Service Fee: $3.99
Every pickup starts with a $3.99 base fee that covers:
- Driver assignment and coordination
- Up to 5 miles of travel
- Basic handling and transport
- Insurance coverage up to $100

### Distance Charges: $0.50 per mile
Beyond the included 5 miles, we charge $0.50 per additional mile based on:
- **Distance calculated**: Pickup location to return destination
- **Round-trip pricing**: Driver's return journey is included
- **Efficient routing**: We optimize routes to minimize costs

## Size-Based Pricing

### Small Packages (S) - No upcharge
- Fits in a shoebox or smaller
- Weight up to 5 lbs
- Examples: Books, small electronics, jewelry

### Medium Packages (M) - No upcharge
- Standard shipping box size
- Weight up to 15 lbs
- Examples: Clothing, shoes, small home goods

### Large Packages (L) - +$2.00 upcharge
- Large shipping box or multiple small items
- Weight up to 35 lbs
- Examples: Small appliances, multiple clothing items

### Extra Large (XL) - +$4.00 upcharge
- Very large or heavy items
- Weight up to 50 lbs
- Examples: Large electronics, furniture pieces

## Additional Fees

### Multiple Boxes: +$1.50 per additional box
- First box included in base price
- Each additional box adds $1.50
- Maximum 4 boxes per pickup

### Rush Service: +$3.00
- Same-day pickup requests
- Based on driver availability
- Available in most service areas

### Service Fee: 15% of subtotal
- Applied to subtotal before tip
- Covers platform operations
- Payment processing costs

## Example Pricing Calculations

### Example 1: Simple Return
- Base fee: $3.99
- Distance: 3 miles (included)
- Size: Medium (no upcharge)
- Service fee: 15% × $3.99 = $0.60
- **Total: $4.59**

### Example 2: Multiple Items
- Base fee: $3.99
- Distance: 8 miles ($1.50 extra)
- Size: Large (+$2.00)
- Additional boxes: 2 extra (+$3.00)
- Subtotal: $10.49
- Service fee: 15% × $10.49 = $1.57
- **Total: $12.06**

### Example 3: Rush Delivery
- Base fee: $3.99
- Distance: 12 miles ($3.50 extra)
- Size: Extra Large (+$4.00)
- Rush service: +$3.00
- Subtotal: $14.49
- Service fee: 15% × $14.49 = $2.17
- **Total: $16.66**

## Ways to Save Money

### Bundle Returns
- Combine multiple returns into one pickup
- Save on multiple base fees
- Use larger box sizes efficiently

### Plan Ahead
- Avoid rush fees by booking 24+ hours in advance
- Choose flexible time windows for better rates

### Optimize Packaging
- Use appropriately sized boxes
- Consolidate when possible
- Don't overpack to avoid size upcharges

### Promotional Codes
- New customer discount: 20% off first pickup
- Referral bonus: $5 off when friends sign up
- Seasonal promotions available

## Payment Methods
We accept all major payment methods:
- **Credit/Debit Cards**: Visa, MasterCard, American Express
- **Digital Wallets**: Apple Pay, Google Pay, PayPal
- **Business Accounts**: Net-30 terms available for high-volume customers

## Refund Policy
- **Full refund** if pickup is cancelled 2+ hours in advance
- **50% refund** if cancelled within 2 hours
- **No refund** for completed pickups
- Issues with service quality may qualify for partial refunds

## Questions About Pricing?
Our support team can help clarify any charges:
- **Live Chat**: Instant pricing estimates
- **Phone**: (636) 254-4821
- **Email**: billing@returnly.com
      `,
      relatedArticles: ['how-to-book-return', 'promo-codes', 'payment-methods'],
      tags: ['pricing', 'fees', 'cost', 'payment', 'billing', 'transparent']
    },
    'tracking-order': {
      title: "Track Your Return Order",
      category: "Order Management",
      readTime: "2 min",
      lastUpdated: "2024-01-12",
      author: "ReturnIt Support Team",
      popularity: 95,
      content: `
# Track Your Return Order

Stay informed about your return pickup with real-time tracking updates from booking to delivery.

## How to Access Tracking

### Online Dashboard
1. **Log into your account** at returnly.com
2. **Go to "My Orders"** from the main menu
3. **Click on your order** to view detailed tracking

### Mobile App
1. **Open the ReturnIt app** on your phone
2. **Tap "Orders"** at the bottom
3. **Select your order** for live tracking

### SMS & Email Updates
- Automatic updates sent at each stage
- No need to check manually
- Real-time notifications when status changes

## Order Status Explained

### 1. Order Confirmed ✅
- Your pickup has been scheduled
- Payment processed successfully
- Driver search has begun

### 2. Driver Assigned 🚗
- A verified driver has accepted your pickup
- You'll see driver name and rating
- Driver contact information available

### 3. Driver En Route 📍
- Driver is traveling to your location
- Live GPS tracking available
- Estimated arrival time shown

### 4. Pickup Complete 📦
- Driver has collected your packages
- Items are secured in vehicle
- Transport to return destination begins

### 5. In Transit 🚛
- Packages are being transported
- Safe handling protocols in effect
- Delivery to retailer in progress

### 6. Delivered ✅
- Packages successfully delivered to retailer
- Return process complete
- Confirmation receipt available

## Live Tracking Features

### GPS Location
- See driver's exact location on map
- Real-time position updates
- Estimated arrival calculations

### Status Updates
- Instant notifications for status changes
- SMS and email alerts included
- In-app push notifications

### Driver Communication
- Send messages through the app
- Call driver directly if needed
- Professional driver support

## Troubleshooting Tracking Issues

### Order Not Showing?
- Check your email for confirmation
- Verify you're logged into correct account
- Contact support if order is missing

### Tracking Stuck?
- Driver may be between locations
- GPS can have brief delays
- Status will update within 15 minutes

### Need Updates Faster?
- Contact driver directly through app
- Call support for immediate assistance
- Use live chat for quick questions

## What to Do If There's a Problem

### Driver is Late
1. Check app for updated arrival time
2. Contact driver through messaging
3. Call support if over 30 minutes late

### Package Issues
1. Report through the app immediately
2. Take photos of any damage
3. Our support team will investigate

### Delivery Problems
1. Track to confirm delivery status
2. Contact retailer to verify receipt
3. We'll provide delivery confirmation

## Historical Order Tracking

### View Past Orders
- Complete order history in your account
- Download receipts for business expenses
- Track delivery confirmations

### Order Analytics
- See patterns in your return behavior
- Track spending and savings
- Download yearly summaries

## Need Help with Tracking?

### Quick Support Options
- **Live Chat**: Instant help with tracking
- **Phone**: (636) 254-4821
- **Email**: tracking@returnly.com

### Emergency Support
Available 24/7 for urgent tracking issues:
- **Emergency Line**: (636) 254-4821
- **Priority Chat**: Available to premium customers

## Related Articles
- [How to Book a Return Pickup](/help-article/how-to-book-return)
- [Delivery Problems & Solutions](/help-article/delivery-issues)
- [Contact Customer Support](/help-article/contact-support)
      `,
      relatedArticles: ['how-to-book-return', 'delivery-issues', 'contact-support'],
      tags: ['tracking', 'status', 'delivery', 'updates', 'real-time']
    },
    'service-areas': {
      title: "Service Areas & Availability",
      category: "Getting Started",
      readTime: "2 min",
      lastUpdated: "2024-01-08",
      author: "ReturnIt Support Team",
      popularity: 85,
      content: `
# Service Areas & Availability

ReturnIt currently serves the greater St. Louis metropolitan area with plans for expansion across Missouri and beyond.

## Current Service Areas

### St. Louis City & County
- **Full Coverage**: All neighborhoods
- **Same-Day Service**: Available 7 days a week
- **Service Hours**: 8 AM - 8 PM CST
- **Peak Season**: Extended hours during holidays

### Metro East Illinois
- **Coverage**: Belleville, Collinsville, Edwardsville
- **Service**: Standard pickup within 24-48 hours
- **Weekend Service**: Saturday and Sunday available

### St. Charles County
- **Cities Served**: St. Charles, St. Peters, O'Fallon
- **Service Type**: Full residential and business
- **Rush Service**: Same-day available

### Jefferson County
- **Coverage**: Arnold, Festus, Imperial
- **Service**: Next-day pickup standard
- **Business Hours**: 9 AM - 6 PM weekdays

## Service Area Map

Our coverage includes all addresses within 25 miles of downtown St. Louis:

### Primary Zone (0-10 miles)
- **Same-day pickup** available
- **No additional distance charges**
- **Premium driver availability**
- **Extended service hours**

### Secondary Zone (10-20 miles)
- **Next-day pickup** standard
- **Minimal distance charges** ($0.50/mile)
- **Regular service hours**
- **Weekend availability**

### Extended Zone (20-25 miles)
- **48-hour pickup** window
- **Distance charges** apply ($0.50/mile)
- **Limited weekend service**
- **Business hours only**

## Checking Service Availability

### During Booking
1. **Enter your address** in the pickup form
2. **Instant verification** shows if we serve your area
3. **Service options** displayed with pricing
4. **Alternative suggestions** if outside coverage

### Before Signing Up
- Use our **coverage checker** on the homepage
- **Enter ZIP code** for instant results
- **See service levels** and estimated pricing
- **Join waitlist** for expansion areas

## Retailer Delivery Locations

We deliver to major retailers throughout our service area:

### Department Stores
- **Target**: 15 locations served
- **Walmart**: 12 locations served
- **Best Buy**: 8 locations served
- **Macy's**: 4 locations served

### Specialty Retailers
- **Amazon Locker**: 25+ locations
- **UPS Store**: 40+ locations
- **FedEx**: 35+ locations
- **Local retailers**: 50+ partners

### Shopping Centers
- **West County Center**
- **Galleria**
- **Chesterfield Mall**
- **South County Center**

## Service Hours by Area

### Downtown St. Louis
- **Monday-Friday**: 7 AM - 9 PM
- **Saturday**: 8 AM - 8 PM
- **Sunday**: 9 AM - 7 PM
- **Holiday Hours**: Extended during peak seasons

### Suburban Areas
- **Monday-Friday**: 8 AM - 8 PM
- **Saturday**: 9 AM - 6 PM
- **Sunday**: 10 AM - 5 PM
- **Rush Service**: Available with $3 fee

### Rural/Extended Areas
- **Monday-Friday**: 9 AM - 6 PM
- **Saturday**: 10 AM - 4 PM
- **Sunday**: Limited availability
- **Advance booking**: 48-hour notice required

## Expansion Plans

### Coming Soon (2024)
- **Kansas City**: Metro area expansion
- **Columbia**: University town service
- **Springfield**: Southwest Missouri

### Under Consideration (2025)
- **Chicago**: Major market entry
- **Louisville**: Regional expansion
- **Nashville**: Multi-state growth

## Service Limitations

### What We Don't Serve Yet
- **Rural areas** beyond 25-mile radius
- **Addresses without GPS access**
- **PO Boxes** or mail forwarding services
- **Construction sites** without proper access

### Seasonal Restrictions
- **Severe weather**: Service may be delayed
- **Holiday periods**: Extended booking windows
- **Peak season**: Rush fees may apply

## How to Request Service Expansion

### Community Interest
- **Contact us** at expansion@returnly.com
- **Provide ZIP codes** for requested areas
- **Share demand information** from your community
- **Join our expansion waitlist**

### Business Partnerships
- **Partner retailers** can request coverage
- **Corporate clients** get priority consideration
- **Volume commitments** accelerate expansion
- **Custom service agreements** available

## Alternative Solutions

### Outside Service Area?
- **Ship to nearby pickup point** within our coverage
- **Use partner services** in your area
- **Wait for expansion** and join our waitlist
- **Contact for special arrangements**

## Stay Updated

### Expansion Notifications
- **Email alerts** when service arrives in your area
- **SMS notifications** for new coverage zones
- **App notifications** with instant updates
- **Social media** announcements

## Questions About Service Areas?

**Contact our expansion team**:
- **Email**: expansion@returnly.com
- **Phone**: (636) 254-4821 ext. 3
- **Live Chat**: Available 9 AM - 5 PM CST

## Related Articles
- [How to Book a Return Pickup](/help-article/how-to-book-return)
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
- [Contact Customer Support](/help-article/contact-support)
      `,
      relatedArticles: ['how-to-book-return', 'pricing-guide', 'contact-support'],
      tags: ['service-area', 'coverage', 'availability', 'location', 'st-louis']
    },
    'driver-faq': {
      title: "Driver FAQ - Frequently Asked Questions",
      category: "For Drivers",
      readTime: "6 min",
      lastUpdated: "2024-01-15",
      author: "ReturnIt Driver Support Team",
      popularity: 89,
      content: `
# Driver FAQ - Frequently Asked Questions

Everything drivers need to know about working with ReturnIt, from getting started to maximizing earnings.

## Getting Started

### How do I apply to be a driver?
1. **Download the Returnly Driver app** from App Store or Google Play
2. **Complete the application** with personal information
3. **Upload required documents**: License, insurance, vehicle registration
4. **Pass background check** (usually takes 2-3 business days)
5. **Complete vehicle inspection** (can be done at partner locations)
6. **Attend brief orientation** (online or in-person)

### What are the requirements?
- **Age**: 21 or older
- **Valid driver's license** with clean driving record
- **Vehicle insurance** with coverage meeting state minimums
- **Reliable vehicle** (2010 or newer preferred)
- **Smartphone** with GPS capability
- **Background check** clearance
- **Vehicle capacity** to handle package deliveries

### How long does approval take?
- **Application review**: 24-48 hours
- **Background check**: 2-3 business days
- **Vehicle inspection**: Schedule within 1 week
- **Total process**: Usually 5-7 business days

## Earnings & Payments

### How much can I earn?
- **Base rate**: 70% of customer payment
- **Average pickup**: $8-15 per job
- **Hourly potential**: $15-25 during busy periods
- **Weekly bonuses**: Available for active drivers
- **Tips**: Keep 100% of customer tips

### How does payment work?
- **Standard payout**: Weekly direct deposit (Tuesdays)
- **Instant pay**: Available for $0.50 fee
- **Payment method**: Bank transfer or debit card
- **Tax reporting**: 1099 provided annually
- **Expense tracking**: Built into driver app

### What expenses am I responsible for?
- **Fuel costs**: Your responsibility
- **Vehicle maintenance**: Regular upkeep required
- **Insurance**: Must maintain adequate coverage
- **Phone plan**: Data usage for GPS and app
- **Parking fees**: Occasional downtown pickups

## Working as a Driver

### How do I receive pickup requests?
1. **Go online** in the driver app
2. **Requests appear** based on your location
3. **Accept or decline** within 30 seconds
4. **Navigate to pickup** using in-app GPS
5. **Complete the delivery** following protocols

### Can I choose my schedule?
- **Completely flexible**: Work when you want
- **No minimum hours**: Drive as little or as much as desired
- **Peak hours**: Higher demand 4-8 PM weekdays
- **Weekend opportunities**: Saturday mornings very busy
- **Holiday seasons**: Increased demand and bonuses

### What if I can't complete a pickup?
- **Cancel in app** as soon as possible
- **Contact support** if customer isn't available
- **Emergency situations**: Call support hotline
- **Vehicle breakdown**: We'll reassign and assist
- **Safety concerns**: Your safety comes first

## Customer Interaction

### How do I communicate with customers?
- **In-app messaging**: Primary communication method
- **Phone calls**: Available through app (number masked)
- **Professional demeanor**: Always courteous and helpful
- **Language**: Clear, friendly communication
- **Privacy**: Never share personal contact information

### What if the customer isn't available?
1. **Call customer** through the app
2. **Wait 5 minutes** at the location
3. **Take photo** proving you're at correct address
4. **Mark as "Customer Not Available"** in app
5. **You'll still be paid** for the attempted pickup

### How do I handle difficult situations?
- **Stay professional** and calm
- **Document everything** through the app
- **Contact support** for guidance
- **Safety first**: Leave if you feel unsafe
- **Report issues** immediately

## Vehicle & Equipment

### What type of vehicle do I need?
- **Minimum**: Sedan with trunk space
- **Preferred**: SUV or hatchback for larger items
- **Commercial vehicles**: Accepted with proper insurance
- **Condition**: Clean, reliable, safe for transport
- **Capacity**: Able to handle multiple packages

### Do I need special equipment?
- **Smartphone**: Required for app and GPS
- **Cargo straps**: Recommended for securing items
- **Dolly/cart**: Helpful for heavy items (optional)
- **Professional appearance**: Clean vehicle and dress
- **Safety equipment**: First aid kit recommended

### What about vehicle maintenance?
- **Regular maintenance**: Your responsibility
- **Safe operating condition**: Required at all times
- **Annual inspection**: May be required
- **Insurance claims**: Report to your insurer
- **Vehicle issues**: May affect driver status

## App & Technology

### How does the driver app work?
- **Go online/offline**: Control your availability
- **Receive requests**: Accept or decline job offers
- **GPS navigation**: Turn-by-turn directions provided
- **Customer contact**: Messaging and calling features
- **Earnings tracking**: Real-time payment information

### What if the app isn't working?
1. **Force close** and restart the app
2. **Check internet connection** and GPS
3. **Update to latest version** from app store
4. **Restart phone** if problems persist
5. **Contact tech support**: (636) 254-4821 ext. 4

### How do I track my earnings?
- **Real-time tracking**: See earnings per pickup
- **Daily summaries**: Review each day's work
- **Weekly reports**: Detailed payment breakdowns
- **Tax documents**: Download 1099 forms
- **Expense tracking**: Log business expenses

## Safety & Support

### What safety measures are in place?
- **Background checks**: All drivers verified
- **GPS tracking**: Real-time location monitoring
- **Emergency support**: 24/7 hotline available
- **Insurance coverage**: Protection during deliveries
- **Customer ratings**: Mutual rating system

### How do I get help?
- **In-app support**: Chat feature for quick questions
- **Phone support**: (636) 254-4821 for drivers
- **Emergency line**: (636) 254-4821 for urgent issues
- **Email support**: drivers@returnly.com
- **Driver community**: Facebook group for tips

### What about insurance while driving?
- **Your insurance**: Primary coverage required
- **ReturnIt coverage**: Supplemental protection provided
- **Accident protocol**: Specific reporting procedures
- **Damage claims**: Support team assists with process
- **Coverage limits**: Details in driver agreement

## Performance & Ratings

### How are driver ratings calculated?
- **Customer feedback**: 5-star rating system
- **Completion rate**: Percentage of accepted jobs completed
- **Response time**: How quickly you accept requests
- **Professional conduct**: Communication and appearance
- **Overall score**: Combination of all factors

### What happens if my rating drops?
- **Performance review**: Support team consultation
- **Additional training**: Resources provided
- **Improvement plan**: Specific goals set
- **Account status**: May be affected by low ratings
- **Appeals process**: Available for unfair ratings

### How can I improve my performance?
- **Prompt communication**: Keep customers informed
- **Professional appearance**: Clean vehicle and dress
- **Careful handling**: Protect customer packages
- **Punctuality**: Arrive within scheduled windows
- **Friendly service**: Positive customer interactions

## Related Articles
- [Driver Requirements & Application](/help-article/driver-requirements)
- [Driver Payment Structure & Earnings](/help-article/driver-payments)
- [Driver App Tutorial & Features](/help-article/driver-app-guide)
      `,
      relatedArticles: ['driver-requirements', 'driver-payments', 'driver-app-guide'],
      tags: ['driver', 'faq', 'earnings', 'requirements', 'schedule', 'comprehensive']
    },
    'contact-support': {
      title: "Contact Customer Support",
      category: "Support",
      readTime: "2 min",
      lastUpdated: "2024-01-10",
      author: "ReturnIt Support Team",
      popularity: 96,
      content: `
# Contact Customer Support

Multiple ways to reach our 24/7 support team for fast, friendly assistance with any questions or issues.

## Live Chat Support ⚡

### Instant Help Available
- **Hours**: 8 AM - 8 PM CST (Mon-Sun)
- **Response time**: Under 2 minutes average
- **Best for**: Quick questions, order issues, booking help
- **Languages**: English, Spanish
- **Available**: Website and mobile app

### How to Access Chat
1. **Click the chat bubble** on any page
2. **Choose your issue type** for faster routing
3. **Provide order number** if relevant
4. **Get instant assistance** from our team

## Phone Support 📞

### Talk to a Human
- **Main line**: (636) 254-4821
- **Hours**: 8 AM - 8 PM CST daily
- **Emergency**: (636) 254-4821 (24/7)
- **Driver support**: Ext. 2
- **Billing questions**: Ext. 3

### When to Call
- **Complex issues** requiring detailed explanation
- **Urgent problems** needing immediate attention
- **Account security** concerns
- **Driver emergencies** or safety issues

## Email Support ✉️

### General Support
- **Email**: support@returnly.com
- **Response time**: 2-4 hours during business hours
- **Best for**: Non-urgent questions, detailed issues
- **Include**: Order number, detailed description

### Specialized Teams
- **Billing**: billing@returnly.com
- **Drivers**: drivers@returnly.com
- **Partnerships**: partnerships@returnly.com
- **Press/Media**: media@returnly.com

## In-App Support 📱

### Mobile App Features
- **Tap "Help"** in main menu
- **Report issues** directly with photos
- **Track support tickets** and responses
- **Get order-specific help** with context
- **Push notifications** for updates

### Common App Solutions
- **Order tracking**: Real-time status updates
- **Driver communication**: Message directly
- **Cancel/modify**: Self-service options
- **Payment issues**: Instant billing help

## Self-Service Options 🛠️

### Help Center
- **Browse articles** by category
- **Search specific topics** with keywords
- **Step-by-step guides** for common issues
- **Video tutorials** for app features
- **FAQ sections** for quick answers

### Account Management
- **Update payment methods** in account settings
- **Change notification preferences** anytime
- **View order history** and receipts
- **Download tax documents** for drivers
- **Manage addresses** and contact info

## Emergency Support 🚨

### 24/7 Emergency Line
- **Phone**: (636) 254-4821
- **For urgent issues only**:
  - Driver safety concerns
  - Package theft or damage
  - Payment disputes over $50
  - Account security breaches

### What Qualifies as Emergency
- **Safety issues**: Driver or customer safety
- **Security concerns**: Account compromised
- **High-value items**: Expensive package problems
- **Time-sensitive**: Same-day pickup issues

## Support for Drivers 🚗

### Driver-Specific Help
- **Dedicated line**: (636) 254-4821 ext. 2
- **Driver portal**: drivers.returnly.com
- **24/7 roadside**: Emergency assistance
- **Payment questions**: Instant pay support
- **App technical**: Real-time troubleshooting

### Driver Resources
- **Training materials**: Video guides and PDFs
- **Community forum**: Connect with other drivers
- **Performance feedback**: Improve your ratings
- **Vehicle requirements**: Inspection guidance

## Business & Enterprise 🏢

### Corporate Accounts
- **Dedicated support**: Account manager assigned
- **Custom solutions**: Volume discounts available
- **API integration**: Technical documentation
- **Billing options**: Net-30 terms, bulk pricing

### Partnership Inquiries
- **Retailer partnerships**: integration@returnly.com
- **Corporate clients**: enterprise@returnly.com
- **API access**: developers@returnly.com
- **White-label**: solutions@returnly.com

## Social Media Support 📱

### Quick Updates
- **Twitter**: @ReturnlySupport (fastest responses)
- **Facebook**: Returnly Customer Service
- **Instagram**: @ReturnlyHelp
- **LinkedIn**: Returnly Business Support

### What We Post
- **Service updates**: Real-time status information
- **Tips and tricks**: Using our service better
- **Feature announcements**: New functionality
- **Community highlights**: Customer and driver stories

## Language Support 🌍

### Available Languages
- **English**: Full support all channels
- **Spanish**: Chat and phone support
- **Interpretation**: Available by request for phone calls
- **Written**: Email support in multiple languages

## Response Time Guarantees ⏱️

### Our Commitments
- **Live chat**: Under 2 minutes
- **Phone**: Answer within 3 rings
- **Email**: 2-4 hours during business hours
- **Emergency**: Immediate for safety issues
- **Follow-up**: Within 24 hours for complex issues

## Feedback & Suggestions 💡

### Help Us Improve
- **Feature requests**: features@returnly.com
- **Service feedback**: feedback@returnly.com
- **Bug reports**: tech@returnly.com
- **Survey responses**: Brief post-support surveys

### Recognition Programs
- **Driver of the month**: Customer nominations
- **Support star ratings**: Rate your experience
- **Improvement rewards**: Credits for helpful feedback

## Escalation Process 📈

### If Not Satisfied
1. **Ask for supervisor** during initial contact
2. **Reference ticket number** for complex issues
3. **Request callback** from management
4. **Email escalation**: escalation@returnly.com
5. **Executive team**: Only for unresolved issues

## Related Articles
- [Common Issues & Troubleshooting](/help-article/troubleshooting)
- [How to Book a Return Pickup](/help-article/how-to-book-return)
- [Track Your Return Order](/help-article/tracking-order)
      `,
      relatedArticles: ['troubleshooting', 'how-to-book-return', 'tracking-order'],
      tags: ['support', 'contact', 'help', 'customer-service', '24-7']
    },
    'delivery-issues': {
      title: "Delivery Problems & Solutions",
      category: "Order Management",
      readTime: "4 min",
      lastUpdated: "2024-01-12",
      author: "ReturnIt Support Team",
      popularity: 72,
      content: `
# Delivery Problems & Solutions

Quick solutions for common delivery issues, from delays to damage claims.

## Driver is Late

### What to Do
1. **Check the app** for updated arrival time
2. **Contact driver** through in-app messaging
3. **Allow 15-minute buffer** - traffic happens
4. **Call support** if over 30 minutes late: (636) 254-4821

### Automatic Solutions
- **Real-time updates** sent to your phone
- **Driver GPS tracking** shows exact location
- **Automatic rebooking** if driver cancels
- **Service credits** for significant delays

## Package Not Picked Up

### If Driver Couldn't Find You
- **Check pickup address** for accuracy
- **Add special instructions** (gate codes, apartment numbers)
- **Be available** during scheduled window
- **Enable location services** for driver coordination

### If You Weren't Available
- **Reschedule pickup** through the app
- **Choose wider time window** for flexibility
- **Add contact instructions** for next attempt
- **No additional fees** for rescheduling

## Package Damage or Loss

### Immediate Steps
1. **Document damage** with photos in the app
2. **Contact support** within 24 hours
3. **Keep all packaging** for inspection
4. **File claim** through customer portal

### Our Investigation Process
- **Driver interview** within 24 hours
- **Insurance claim** filed if covered
- **Replacement arrangement** with retailer
- **Compensation** for valuable items

### What's Covered
- **Damage during transport**: Full responsibility
- **Items up to $100**: Automatic coverage
- **High-value items**: Additional insurance available
- **Retailer coordination**: We handle return process

## Wrong Delivery Location

### If Package Went to Wrong Store
1. **Contact us immediately**: (636) 254-4821
2. **Provide correct destination** details
3. **We'll redirect** or arrange new pickup
4. **No additional charges** for our error

### If Address Was Wrong
- **Customer responsibility** for address accuracy
- **Additional delivery fee** may apply
- **Distance charges** calculated from wrong location
- **Support help** to minimize extra costs

## Communication Issues with Driver

### If Driver Isn't Responding
- **Use in-app messaging** (preferred method)
- **Call through app** (masked number system)
- **Contact support** for immediate driver contact
- **Request different driver** if needed

### Professional Behavior Standards
- **Courteous communication** always required
- **Punctual arrival** within scheduled window
- **Careful package handling** expected
- **Report unprofessional behavior** immediately

## Payment and Billing Issues

### If Charged Incorrectly
1. **Review charge breakdown** in app
2. **Contact billing support**: billing@returnly.com
3. **Dispute within 7 days** for fastest resolution
4. **Automatic refund** for verified errors

### Common Billing Mistakes
- **Distance miscalculation**: GPS routing errors
- **Size category wrong**: Package measured incorrectly
- **Rush fee applied incorrectly**: Timing disputes
- **Multiple charges**: System glitches

## Pickup Window Problems

### Driver Arrived Outside Window
- **Document arrival time** in app
- **Contact support** for service credit
- **Automatic compensation** for verified issues
- **Schedule preferences** noted for future

### Customer Unavailable During Window
- **Driver will wait 5 minutes** minimum
- **Photo documentation** of attempt
- **Reschedule fee waived** for first occurrence
- **Flexible rebooking** options available

## Weather and Emergency Delays

### Severe Weather Policy
- **Safety first**: Service suspended for dangerous conditions
- **Automatic notifications**: SMS and email alerts
- **Free rescheduling**: No penalty for weather delays
- **Priority rebooking**: When conditions improve

### Natural Disasters
- **Service suspension**: For safety reasons
- **Full refunds**: No questions asked
- **Priority restoration**: First areas back online
- **Special accommodations**: Case-by-case basis

## Technology and App Problems

### App Not Working
1. **Force close** and restart app
2. **Check internet connection** and GPS
3. **Update to latest version** from app store
4. **Contact tech support**: (636) 254-4821 ext. 4

### Tracking Issues
- **GPS delays**: Updates within 15 minutes
- **Status stuck**: Refresh app or web browser
- **Missing notifications**: Check settings
- **Order not showing**: Contact support with email confirmation

## Retailer-Specific Issues

### Store Refused Delivery
- **Verify store policy** and hours
- **Contact store directly** if needed
- **Alternative location**: We'll find nearby option
- **Direct to manufacturer**: If store won't accept

### Return Label Problems
- **Missing label**: We'll print new one
- **Wrong retailer**: Redirect to correct store
- **Expired label**: Contact retailer for new one
- **Unreadable label**: Photo replacement service

## Resolution Timeline

### Immediate (0-2 hours)
- **Safety issues**: Driver or customer safety
- **Service failures**: Major delivery problems
- **Payment disputes**: Over $25
- **Missing packages**: High-priority investigation

### Same Day (2-8 hours)
- **Delivery delays**: Non-emergency issues
- **Communication problems**: Driver coordination
- **Minor billing**: Under $25 disputes
- **App technical issues**: Basic troubleshooting

### 24-48 Hours
- **Insurance claims**: Package damage
- **Complex billing**: Multiple order issues
- **Account problems**: Login or access issues
- **Policy questions**: Terms and conditions

## Prevention Tips

### For Customers
- **Accurate addresses**: Double-check before booking
- **Clear instructions**: Gate codes, building access
- **Flexible windows**: Allow buffer time
- **Package preparation**: Secure items properly

### Communication
- **Enable notifications**: SMS and push alerts
- **Check app regularly**: For driver updates
- **Respond promptly**: To driver messages
- **Be available**: During scheduled window

## When to Escalate

### Contact Support Immediately For:
- **Safety concerns**: Any unsafe situations
- **Lost packages**: Over $50 value
- **Repeated issues**: Same problem multiple times
- **Driver behavior**: Unprofessional conduct

### Emergency Hotline: (636) 254-4821
Available 24/7 for urgent issues requiring immediate attention.

## Compensation Policy

### Service Credits
- **Late delivery**: $2-5 credit depending on delay
- **Wrong delivery**: Full refund plus credit
- **Damaged package**: Replacement cost coverage
- **Poor service**: Case-by-case evaluation

### Automatic Refunds
- **Service failure**: When we can't complete pickup
- **Our error**: Wrong address, wrong store
- **Safety issues**: Weather or emergency cancellations
- **Technical problems**: App or system failures

## Related Articles
- [Track Your Return Order](/help-article/tracking-order)
- [Contact Customer Support](/help-article/contact-support)
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
      `,
      relatedArticles: ['tracking-order', 'contact-support', 'pricing-guide'],
      tags: ['problems', 'issues', 'delayed', 'damaged', 'lost', 'solutions']
    },
    'payment-methods': {
      title: "Accepted Payment Methods",
      category: "Pricing & Payment",
      readTime: "2 min",
      lastUpdated: "2024-01-05",
      author: "ReturnIt Support Team",
      popularity: 79,
      content: `
# Accepted Payment Methods

Multiple secure payment options to make your return pickup convenient and safe.

## Credit and Debit Cards 💳

### Accepted Card Types
- **Visa**: All variants including prepaid
- **Mastercard**: Personal and business cards
- **American Express**: Full acceptance
- **Discover**: Including Diners Club

### Security Features
- **Stripe encryption**: Bank-level security
- **CVV verification**: Required for all transactions
- **ZIP code matching**: Address verification
- **Fraud protection**: Real-time monitoring

### Card Storage
- **Save for future use**: Optional convenience feature
- **Multiple cards**: Store up to 5 payment methods
- **Default selection**: Set primary payment method
- **Easy switching**: Change payment before booking

## Digital Wallets 📱

### Apple Pay
- **iPhone and iPad**: Safari browser and app
- **Apple Watch**: Quick payment option
- **Touch ID/Face ID**: Secure authentication
- **Same-day availability**: Instant payment processing

### Google Pay
- **Android devices**: Full support in app
- **Chrome browser**: Web-based payments
- **Fingerprint/PIN**: Secure verification
- **Google account**: Synced payment methods

### PayPal
- **PayPal balance**: Direct account funding
- **Linked bank accounts**: ACH transfers
- **PayPal Credit**: Buy now, pay later option
- **International**: Global payment support

## Business Payments 🏢

### Corporate Accounts
- **Net-30 terms**: For qualified businesses
- **Purchase orders**: Integration available
- **Bulk billing**: Monthly consolidated invoices
- **Account managers**: Dedicated support

### Expense Management
- **Detailed receipts**: Itemized for accounting
- **Business categories**: Expense type coding
- **Tax reporting**: Year-end summaries
- **Integration**: Popular expense platforms

## Payment Security 🔒

### Data Protection
- **PCI DSS compliant**: Industry standard security
- **No card storage**: Local device only
- **Encrypted transmission**: End-to-end protection
- **Regular audits**: Third-party security testing

### Fraud Prevention
- **Real-time screening**: Suspicious activity detection
- **Address verification**: Billing address matching
- **Velocity checking**: Multiple transaction monitoring
- **3D Secure**: Additional verification when needed

## International Payments 🌍

### Supported Currencies
- **USD**: Primary currency (required)
- **Currency conversion**: Real-time rates
- **Foreign cards**: International bank cards accepted
- **Tourist support**: Visitors to St. Louis area

### International Card Features
- **No foreign fees**: By Returnly (bank fees may apply)
- **Real-time conversion**: Transparent exchange rates
- **Multi-currency display**: See charges in home currency
- **Travel-friendly**: Works for visitors

## Payment Timing ⏰

### When You're Charged
- **At booking**: Payment processed immediately
- **Authorization hold**: May show as pending
- **Final charge**: Posted within 24 hours
- **Service completion**: No additional charges

### Cancellation Refunds
- **2+ hours notice**: 100% refund
- **2 hours to pickup**: 50% refund
- **After pickup**: No refund (service completed)
- **Our cancellation**: Always 100% refund

## Failed Payments ❌

### Common Issues
- **Insufficient funds**: Check account balance
- **Expired card**: Update payment method
- **Security block**: Contact your bank
- **Address mismatch**: Verify billing address

### Automatic Retry
- **3 retry attempts**: Spaced 10 minutes apart
- **Different payment method**: Switch cards automatically
- **Support notification**: We'll contact you if all fail
- **Hold booking**: 15 minutes to resolve payment

## Payment Receipts 📧

### Immediate Confirmation
- **Email receipt**: Sent within 2 minutes
- **SMS notification**: Payment confirmation
- **App notification**: In-app payment record
- **PDF download**: Available in account

### Detailed Breakdown
- **Service itemization**: Base fee, distance, size
- **Tax information**: Where applicable
- **Driver tip**: Separate line item
- **Total charges**: All-inclusive amount

## Promo Codes and Credits 💰

### How to Apply
1. **Enter code** at checkout
2. **Automatic discount** applied to total
3. **Credit balance** used first if available
4. **Remaining charge** processed normally

### Credit Sources
- **Referral bonus**: Friend signup rewards
- **Service issues**: Compensation credits
- **Promotional offers**: Seasonal discounts
- **Loyalty rewards**: Frequent user benefits

## Changing Payment Methods 🔄

### Before Booking
- **Payment selection**: Choose during checkout
- **Update default**: Change in account settings
- **Add new method**: Securely store additional cards
- **Remove old cards**: Clean up saved methods

### After Booking
- **Before pickup**: Contact support to change
- **Same-day requests**: May require phone verification
- **Rush orders**: Limited change options
- **Completed orders**: No payment changes allowed

## Payment Support 📞

### Common Questions
- **Failed payments**: (636) 254-4821 ext. 3
- **Billing disputes**: billing@returnly.com
- **Refund status**: Check account or contact support
- **Business accounts**: enterprise@returnly.com

### Resolution Times
- **Payment failures**: Immediate assistance
- **Billing questions**: 2-4 hours response
- **Refund processing**: 3-5 business days
- **Dispute resolution**: 5-10 business days

## Tips and Gratuity 💵

### Adding Tips
- **At booking**: Include tip with payment
- **Cash option**: Give directly to driver
- **After delivery**: Add tip through app
- **Amount suggestions**: 15%, 20%, or custom

### Tip Processing
- **100% to driver**: No platform fees
- **Same payment method**: As main transaction
- **Instant delivery**: Driver sees tip immediately
- **Tax reporting**: Included in driver 1099

## Related Articles
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
- [Promo Codes & Discounts](/help-article/promo-codes)
- [Refunds & Billing Questions](/help-article/refunds-billing)
      `,
      relatedArticles: ['pricing-guide', 'promo-codes', 'refunds-billing'],
      tags: ['payment', 'methods', 'cards', 'apple-pay', 'paypal', 'security']
    },
    'return-policies': {
      title: "Return Policies & Guidelines",
      category: "Policies",
      readTime: "5 min",
      lastUpdated: "2024-01-15",
      author: "Returnly Legal Team",
      popularity: 87,
      content: `
# Return Policies & Guidelines

Complete guide to our return policies including accepted items, size restrictions, and quality standards.

## What We Accept

### Eligible Items
- **Electronics**: Phones, laptops, tablets, gaming consoles
- **Clothing & Accessories**: All sizes, any condition
- **Home Goods**: Small appliances, décor, furniture pieces
- **Books & Media**: Books, DVDs, games, CDs
- **Toys & Sports Equipment**: Non-hazardous items only
- **Beauty & Personal Care**: Unopened and opened items

### Size Limitations
- **Maximum weight**: 50 lbs per package
- **Maximum dimensions**: 24" x 18" x 18" per box
- **Multiple boxes**: Up to 4 boxes per pickup
- **Oversized items**: Contact support for special arrangements

## Prohibited Items ❌

### Safety Restrictions
- **Hazardous materials**: Chemicals, batteries, aerosols
- **Flammable items**: Alcohol, paint, solvents
- **Weapons**: Knives, firearms, ammunition
- **Explosives**: Fireworks, flares, anything explosive
- **Perishables**: Food, plants, live animals

### Legal Restrictions
- **Prescription medications**: Any controlled substances
- **Illegal items**: Counterfeit goods, stolen merchandise
- **Adult content**: Explicit materials
- **Currency**: Cash, coins, gift cards

### High-Risk Items
- **Fine jewelry**: Over $500 value (insurance required)
- **Art & antiques**: Fragile/valuable pieces
- **Medical devices**: Requires special handling
- **Automotive parts**: Fluids, batteries, heavy components

## Packaging Requirements

### Recommended Packaging
- **Original boxes**: When available and in good condition
- **Secure sealing**: Tape all seams and openings
- **Bubble wrap**: For fragile items
- **Clear labeling**: Return address and destination
- **Return labels**: Include retailer-provided labels

### What We Provide
- **Backup packaging**: If your box fails
- **Packing materials**: Basic bubble wrap and tape
- **New boxes**: For damaged packaging
- **Labels**: Print return labels if needed

## Service Area Coverage

### Primary Service Zone
- **St. Louis City & County**: Full coverage
- **Metro East Illinois**: Belleville, Collinsville, Edwardsville
- **St. Charles County**: St. Charles, St. Peters, O'Fallon
- **Jefferson County**: Arnold, Festus, Imperial

### Extended Coverage
- **Within 25 miles**: Of downtown St. Louis
- **Additional fees**: May apply beyond 20 miles
- **Advance booking**: Required for distant locations
- **Minimum order**: May apply in extended zones

## Timing and Scheduling

### Service Hours
- **Monday-Friday**: 8 AM - 8 PM CST
- **Saturday**: 9 AM - 6 PM CST
- **Sunday**: 10 AM - 5 PM CST
- **Holidays**: Limited service, check app

### Booking Windows
- **Same-day**: Available in primary zone
- **Next-day**: Standard for secondary zone
- **48-hour**: Extended zone minimum
- **Rush service**: $3 fee for urgent requests

## Quality Standards

### Package Condition
- **Secure packaging**: Must be properly sealed
- **Reasonable condition**: Light wear acceptable
- **No leaking items**: Liquids must be sealed
- **Structural integrity**: Boxes must hold contents

### Driver Safety
- **Accessible locations**: Safe pickup areas
- **Clear paths**: No obstacles to vehicle
- **Adequate lighting**: For evening pickups
- **Pet safety**: Secure animals during pickup

## Liability and Insurance

### Coverage Included
- **Basic coverage**: Up to $100 per package
- **Transport protection**: Damage during delivery
- **Lost item coverage**: If package goes missing
- **Driver negligence**: Full responsibility coverage

### Additional Insurance
- **High-value items**: Over $100 value
- **Fine jewelry**: Requires appraisal documentation
- **Electronics**: Original purchase receipts
- **Antiques**: Professional valuation needed

### Exclusions
- **Pre-existing damage**: Items damaged before pickup
- **Improper packaging**: Customer responsibility
- **Prohibited items**: No coverage provided
- **Acts of nature**: Weather, disasters, etc.

## Customer Responsibilities

### Before Pickup
- **Accurate descriptions**: List all items truthfully
- **Proper packaging**: Secure all contents
- **Availability**: Be present during pickup window
- **Payment**: Valid payment method required

### During Pickup
- **Item verification**: Confirm package contents with driver
- **Special instructions**: Communicate any handling needs
- **Documentation**: Take photos for your records
- **Professional interaction**: Courteous communication

### After Pickup
- **Tracking**: Monitor delivery progress
- **Issues reporting**: Contact support promptly
- **Receipt retention**: Keep confirmation emails
- **Feedback**: Rate your service experience

## Dispute Resolution

### Service Issues
- **Contact support**: Within 24 hours of service
- **Documentation**: Provide photos and details
- **Investigation**: We review all evidence
- **Resolution**: Fair compensation for problems

### Billing Disputes
- **7-day window**: For billing questions
- **Evidence required**: Screenshots, receipts
- **Review process**: 3-5 business days
- **Appeal option**: If initial resolution unsatisfactory

## Retailer Relationships

### Partner Stores
- **Direct relationships**: With major retailers
- **Streamlined returns**: Faster processing
- **Special handling**: Store-specific requirements
- **Extended coverage**: More locations served

### Non-Partner Returns
- **Standard service**: Still accepted
- **Customer coordination**: May require calls
- **Return policies**: Follow store requirements
- **Processing time**: May be longer

## Environmental Responsibility

### Sustainable Practices
- **Route optimization**: Reduce carbon footprint
- **Packaging reuse**: When safe and appropriate
- **Electronic recycling**: Partner with certified facilities
- **Carbon offsets**: For high-volume customers

### Recycling Programs
- **Electronics**: Proper disposal coordination
- **Batteries**: Hazmat-certified partners
- **Packaging materials**: Reuse when possible
- **Documentation**: Recycling certificates available

## Policy Updates

### Change Notifications
- **Email alerts**: 30 days advance notice
- **App notifications**: Policy change announcements
- **Website updates**: Current version always posted
- **Customer service**: Questions about changes

### Grandfathering
- **Existing bookings**: Honor original terms
- **Active disputes**: Original policy applies
- **Service agreements**: Contract terms maintained
- **Fair application**: No retroactive penalties

## Contact Information

### Policy Questions
- **General policies**: (636) 254-4821
- **Legal questions**: legal@returnly.com
- **Dispute resolution**: disputes@returnly.com
- **Insurance claims**: insurance@returnly.com

### Emergency Situations
- **Safety concerns**: (636) 254-4821
- **Prohibited items**: Stop transport immediately
- **Hazmat discovery**: Emergency protocols activated
- **Driver safety**: Priority response

## Related Articles
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
- [Service Areas & Availability](/help-article/service-areas)
- [Contact Customer Support](/help-article/contact-support)
      `,
      relatedArticles: ['pricing-guide', 'service-areas', 'contact-support'],
      tags: ['policies', 'guidelines', 'restrictions', 'terms', 'prohibited-items']
    },
    'promo-codes': {
      title: "Promo Codes & Discounts",
      category: "Pricing & Payment",
      readTime: "2 min",
      lastUpdated: "2024-01-12",
      author: "Returnly Marketing Team",
      popularity: 91,
      content: `
# Promo Codes & Discounts

Current promotional codes, how to apply discounts, and ways to save money on your returns.

## Current Promotions 🎉

### New Customer Offers
- **WELCOME20**: 20% off your first pickup
- **FIRSTRIDE**: $5 off first order over $15
- **NEWUSER**: Free rush service on first booking
- **TRYRETURNLY**: 15% off first three pickups

### Referral Program
- **Refer a friend**: Both get $5 credit
- **Multiple referrals**: $5 for each successful signup
- **Social sharing**: Bonus credits for social media posts
- **Corporate referrals**: Special rates for business customers

### Seasonal Promotions
- **HOLIDAY25**: 25% off during holiday season (Nov-Dec)
- **BACKTOSCHOOL**: Student discounts in August
- **SPRING15**: Spring cleaning special in March-May
- **SUMMER10**: Summer vacation returns discount

## How to Apply Promo Codes 💰

### During Booking
1. **Enter code** in the "Promo Code" field at checkout
2. **Click "Apply"** to see discount reflected
3. **Verify savings** in order summary
4. **Complete booking** with reduced price

### Code Requirements
- **One code per order**: Cannot stack multiple codes
- **Minimum order**: Some codes require minimum purchase
- **Expiration dates**: Check code validity
- **New customers only**: Some codes for first-time users

### Mobile App
- **Tap promo field** during checkout
- **Enter or paste code** exactly as shown
- **Automatic calculation** applies discount
- **Confirmation** shown before payment

## Loyalty Program 🌟

### Returnly Rewards
- **Points per dollar**: Earn 1 point per $1 spent
- **Bonus points**: Extra points for reviews and referrals
- **Redemption**: 100 points = $5 credit
- **No expiration**: Points never expire

### Tier Benefits
- **Bronze** (0-9 orders): Standard service
- **Silver** (10-24 orders): 5% discount + priority support
- **Gold** (25-49 orders): 10% discount + free rush service
- **Platinum** (50+ orders): 15% discount + dedicated support

### Tier Rewards
- **Birthday bonus**: Double points during birthday month
- **Anniversary credit**: $10 credit on signup anniversary
- **Milestone bonuses**: Special rewards at tier upgrades
- **Exclusive access**: Early access to new features

## Student Discounts 🎓

### Verification Required
- **Valid student ID**: Current enrollment required
- **edu email**: University email address
- **Annual verification**: Must renew yearly
- **10% discount**: Applied to all orders

### Eligible Institutions
- **Universities**: 4-year colleges and universities
- **Community colleges**: 2-year institutions
- **Graduate programs**: Masters and PhD students
- **Online schools**: Accredited online institutions

## Corporate Discounts 🏢

### Volume Pricing
- **10+ orders/month**: 15% discount
- **25+ orders/month**: 20% discount
- **50+ orders/month**: 25% discount
- **Custom rates**: For enterprise customers

### Business Benefits
- **Net-30 terms**: For qualified businesses
- **Dedicated support**: Business account manager
- **Reporting**: Detailed expense reports
- **Multiple users**: Team account management

## Seasonal Savings 📅

### Holiday Season (November-December)
- **Black Friday**: 30% off all services
- **Cyber Monday**: 25% off with code CYBER25
- **Holiday returns**: Extended return windows
- **Gift returns**: Special holiday handling

### Back-to-School (August-September)
- **Student specials**: Extra discounts for students
- **Dorm pickups**: Free service to college campuses
- **Bulk discounts**: Multiple item returns
- **Parent packages**: Send returns home for students

### Spring Cleaning (March-May)
- **Bulk bonuses**: Extra savings for multiple boxes
- **Donation service**: Partner with local charities
- **Eco-friendly**: Carbon offset credits
- **Declutter deals**: Progressive discounts

## Ways to Save Money 💡

### Bundle Returns
- **Multiple items**: Combine returns in one pickup
- **Same retailer**: Group returns to same store
- **Size optimization**: Use larger boxes efficiently
- **Timing**: Schedule during off-peak hours

### Flexible Scheduling
- **Advance booking**: Save 10% booking 48+ hours ahead
- **Off-peak hours**: Weekday mornings cost less
- **Standard delivery**: Avoid rush fees
- **Longer windows**: 4-hour windows get discounts

### Referral Strategy
- **Share your code**: Earn $5 per successful referral
- **Social media**: Post about your experience
- **Word of mouth**: Tell friends and family
- **Corporate sharing**: Refer your workplace

## Promo Code Terms 📋

### General Terms
- **One use per customer**: Unless specified otherwise
- **Valid payment required**: Cannot combine with credits
- **Service area only**: Must be within coverage zone
- **Transferable**: Can share codes with others

### Restrictions
- **Cannot combine**: Multiple codes per order
- **Minimum orders**: Some codes require minimums
- **Expiration dates**: Check validity before use
- **Excluded services**: Some codes don't apply to all services

### Abuse Prevention
- **Account monitoring**: Unusual activity flagged
- **Code sharing limits**: Excessive sharing blocked
- **Fraud protection**: Invalid codes removed
- **Fair use**: Terms enforced consistently

## Special Programs 👥

### Military Discount
- **15% off**: All active duty and veterans
- **Verification**: Through military ID or Veterans.com
- **Family members**: Spouses and dependents included
- **Year-round**: Always available, no expiration

### Senior Discount
- **10% off**: Ages 65 and older
- **Easy verification**: Driver's license or ID
- **Fixed income**: Additional assistance available
- **Flexible service**: Extended pickup windows

### Nonprofit Organizations
- **20% discount**: Registered nonprofits
- **Bulk rates**: Large volume discounts
- **Donation coordination**: Direct charity delivery
- **Tax receipts**: Detailed documentation

## Credit System 💳

### Account Credits
- **Service issues**: Compensation credits
- **Referral bonuses**: Friend signup rewards
- **Loyalty rewards**: Points converted to credits
- **Promotional credits**: Special offer bonuses

### Credit Usage
- **Automatic application**: Credits used first
- **Partial payments**: Credits + payment method
- **No expiration**: Credits never expire
- **Transferable**: Can gift credits to others

### Earning Credits
- **Quality feedback**: Detailed reviews earn credits
- **Bug reports**: Help improve service
- **Feature suggestions**: Valuable input rewarded
- **Social media**: Share experiences for bonuses

## Expired or Invalid Codes ❌

### Common Issues
- **Typos**: Check spelling and capitalization
- **Expiration**: Verify code is still valid
- **Restrictions**: Review terms and conditions
- **Usage limit**: Code may be already used

### What to Do
1. **Double-check spelling** and try again
2. **Contact support** if code should work
3. **Check email** for updated codes
4. **Browse current offers** for alternatives

## Getting Notified 📧

### Email Alerts
- **Newsletter signup**: Weekly deals and codes
- **Personalized offers**: Based on usage patterns
- **Flash sales**: Limited-time promotions
- **Milestone rewards**: Account anniversary bonuses

### App Notifications
- **Push alerts**: New promo codes available
- **Location-based**: Deals in your area
- **Usage reminders**: Codes expiring soon
- **Exclusive offers**: App-only promotions

## Related Articles
- [Understanding ReturnIt Pricing](/help-article/pricing-guide)
- [Accepted Payment Methods](/help-article/payment-methods)
- [How to Book a Return Pickup](/help-article/how-to-book-return)
      `,
      relatedArticles: ['pricing-guide', 'payment-methods', 'how-to-book-return'],
      tags: ['promo-codes', 'discounts', 'savings', 'offers', 'coupons']
    }
    // Add more articles as needed
  };

  const article = articleContent[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Article Not Found</h2>
            <p className="text-amber-700 mb-4">The help article you're looking for doesn't exist.</p>
            <Link href="/help-center">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    setVoteType(type);
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/help-center">
            <Button variant="outline" className="mb-4" data-testid="button-back-help-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3">
                  {article.category}
                </Badge>
                <h1 className="text-3xl font-bold text-amber-900 mb-3 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{article.popularity}% helpful</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                  className={bookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}
                  data-testid="button-bookmark-article"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" data-testid="button-share-article">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: article.content
                    .split('\n')
                    .map((line: string) => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-2xl font-bold text-amber-900 mt-8 mb-4">${line.substring(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-semibold text-amber-800 mt-6 mb-3">${line.substring(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-lg font-medium text-amber-700 mt-4 mb-2">${line.substring(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li class="text-gray-700 ml-4">${line.substring(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '<br />';
                      } else {
                        return `<p class="text-gray-700 mb-3 leading-relaxed">${line}</p>`;
                      }
                    })
                    .join('')
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Article Feedback */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Was this article helpful?</h3>
              
              {!hasVoted ? (
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleVote('up')}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
                    data-testid="button-vote-helpful"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes, helpful
                  </Button>
                  <Button
                    onClick={() => handleVote('down')}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
                    data-testid="button-vote-not-helpful"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not helpful
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">Thank you for your feedback!</span>
                  </div>
                  {voteType === 'down' && (
                    <p className="text-sm text-gray-600 mb-4">
                      Help us improve this article by contacting our support team with specific feedback.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <Card className="mb-8 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Related Articles</CardTitle>
              <CardDescription>Other articles that might help you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {article.relatedArticles.map((relatedId: string) => {
                  const related = articleContent[relatedId];
                  if (!related) return null;
                  
                  return (
                    <Link key={relatedId} href={`/help-article/${relatedId}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {related.category}
                          </Badge>
                          <h4 className="font-semibold text-amber-900 mb-2">{related.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{related.readTime}</span>
                            <span>•</span>
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{related.popularity}% helpful</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-amber-100 mb-4">Our support team is ready to assist you 24/7</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-live-chat">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-call">
                  <Phone className="h-4 w-4 mr-2" />
                  Call (636) 254-4821
                </Button>
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
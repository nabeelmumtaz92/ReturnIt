# ReturnIt Comprehensive App Testing Guide
**Complete Step-by-Step Walkthrough**  
**Last Updated:** October 6, 2025

---

## Table of Contents
1. [Initial Setup & Login](#initial-setup--login)
2. [Customer Journey](#customer-journey)
3. [Driver Journey](#driver-journey)
4. [Admin Dashboard](#admin-dashboard)
5. [Retailer Portal](#retailer-portal)
6. [Mobile Apps](#mobile-apps)
7. [Advanced Features](#advanced-features)
8. [Testing Checklists](#testing-checklists)

---

## Initial Setup & Login

### 1. **Access the App**
- Open browser and go to: `returnit.online` or your local development URL
- **Expected:** Welcome page loads with beige/white design (#f8f7f5 background)
- **Check:** Stitch orange accent color (#f99806) visible on buttons

### 2. **Create an Account (Customer)**
**Path:** Welcome Page → "Get Started" or "Sign Up"

**Steps:**
1. Click "Get Started" or navigate to `/login`
2. Click "Create Account" or "Sign Up" tab
3. Fill in the form:
   - **Full Name:** Your Name
   - **Email:** youremail@example.com
   - **Password:** (minimum 8 characters)
4. Click "Create Account" button
5. **Expected:** Redirected to customer dashboard or book pickup page

**Social Login Options:**
- Click "Sign in with Google" → Follow Google OAuth flow
- Click "Sign in with Facebook" → (Requires Facebook credentials setup)
- Click "Sign in with Apple" → (Requires Apple credentials setup)

### 3. **Login as Existing User**
**Path:** `/login`

**Steps:**
1. Enter email and password
2. Click "Sign In"
3. **Expected:** Redirected based on role:
   - **Customer:** Book pickup or customer dashboard
   - **Driver:** Driver portal
   - **Admin:** Admin dashboard

### 4. **Test Admin Access**
**Admin Emails:** 
- nabeelmumtaz92@gmail.com
- durremumtaz@gmail.com
- nabeelmumtaz4.2@gmail.com

**Steps:**
1. Login with admin email
2. **Expected:** Redirected to `/admin-dashboard`
3. **Check:** All admin features accessible

---

## Customer Journey

### A. Book a Pickup

#### **Step 1: Navigate to Book Pickup**
**Path:** `/book-pickup`

**What to Click:**
1. From welcome page → "Book a Pickup" button
2. Or from navigation menu → "Book Pickup"
3. **Expected:** Multi-step booking form appears

#### **Step 2: Choose Retailer**
**Form Step 1 of 5**

**Actions:**
1. Click the "Select Retailer" dropdown
2. Search or scroll to find retailer (e.g., "Target", "Amazon", "Walmart")
3. Click on retailer name
4. **Expected:** Retailer logo appears, form advances

**Test Different Retailers:**
- Target (should have return policy options)
- Amazon (check for special handling)
- Walmart
- Best Buy

#### **Step 3: Enter Package Details**
**Form Step 2 of 5**

**Actions:**
1. **Order Number:** Type any order number (e.g., "12345-ABC")
2. **Item Description:** Describe item (e.g., "Blue sneakers size 10")
3. **Return Reason:** Select from dropdown:
   - Wrong size
   - Defective
   - Changed mind
   - Wrong item
   - Quality issues
4. **Package Size:** Select:
   - Small (shoebox)
   - Medium (large box)
   - Large (multiple boxes)
5. **Special Handling:** Check boxes if needed:
   - ☐ Fragile
   - ☐ High Value (over $500)
   - ☐ Requires Original Packaging
6. Click "Next" or "Continue"
7. **Expected:** Form advances to pickup details

#### **Step 4: Pickup Location & Time**
**Form Step 3 of 5**

**Actions:**
1. **Pickup Address:**
   - Enter street address
   - Enter city: "St. Louis"
   - Enter state: "MO"
   - Enter ZIP code: "63101"
2. **Phone Number:** (314) 555-1234
3. **Pickup Instructions:** "Leave by front door" (optional)
4. **Select Pickup Date:** Click calendar icon
   - Choose date (today or future)
5. **Select Time Window:**
   - Morning (9am-12pm)
   - Afternoon (12pm-5pm)
   - Evening (5pm-8pm)
6. Click "Next"
7. **Expected:** Form advances to return destination

#### **Step 5: Return Destination**
**Form Step 4 of 5**

**Actions:**
1. **Choose Destination:**
   - ⚪ Return to Store
   - ⚪ Return to Warehouse (selected by default)
   - ⚪ Donate to Charity
2. **If "Return to Store":**
   - Select specific store location from dropdown
3. **If "Donate to Charity":**
   - Select charity from dropdown
   - **Expected:** Price changes to show potential discount
4. Click "Next"
5. **Expected:** Form advances to review

#### **Step 6: Review Order**
**Form Step 5 of 5**

**What to Check:**
1. **Order Summary displays:**
   - Retailer name and logo
   - Package size
   - Pickup address
   - Pickup date and time
   - Return destination
2. **Pricing breakdown shows:**
   - Base price
   - Any additional fees
   - Taxes
   - **Total price**
3. **Promo Code Section:**
   - Try entering: `SAVE10`
   - Click "Apply"
   - **Expected:** Discount applied, total updates
4. Click "Proceed to Checkout"
5. **Expected:** Redirected to `/checkout`

### B. Checkout & Payment

#### **Step 1: Checkout Page**
**Path:** `/checkout`

**What to Check:**
1. Order summary displays correctly
2. Price breakdown visible
3. Payment options available

#### **Step 2: Select Payment Method**

**Option A: Credit/Debit Card (Stripe)**
1. Click "Credit/Debit Card" option
2. **Card Details Form:**
   - **Test Card:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** 63101
3. Click "Pay Now" or "Complete Order"
4. **Expected:** 
   - Payment processes
   - Success message appears
   - Redirected to order status page

**Option B: PayPal**
1. Click "PayPal" button
2. **Expected:** PayPal popup opens
3. Login to PayPal sandbox account
4. Approve payment
5. **Expected:** Return to ReturnIt, order confirmed

**Option C: Save Card for Future**
1. Check "Save card for future purchases"
2. Complete payment
3. **Expected:** Card saved to account

#### **Step 3: Order Confirmation**
**Path:** `/order-status/:orderId`

**What to Check:**
1. Order number displayed prominently
2. Status shows "Confirmed" or "Pending Pickup"
3. Driver assignment status visible
4. Estimated pickup time shown
5. **Action Buttons:**
   - "Track Order" → Click to test tracking
   - "Contact Support" → Opens chat
   - "Cancel Order" → Test cancellation flow

### C. Track Your Order

#### **Live Tracking**
**Path:** `/track` or `/real-time-tracking`

**Steps:**
1. From order status page → Click "Track Order"
2. **Or:** Navigate to `/track`
3. Enter order number
4. Click "Track"

**What to Check:**
1. **Order Status Timeline:**
   - ✅ Order Confirmed
   - 🔄 Driver Assigned (when driver accepts)
   - 🚗 Driver En Route
   - 📦 Package Picked Up
   - ✅ Delivered
2. **Map Display:**
   - Your pickup location marked
   - Destination marked
   - Driver location updates (if en route)
3. **Driver Details (when assigned):**
   - Driver name
   - Driver photo
   - Vehicle info
   - Driver rating
4. **ETA:** Estimated time of arrival updates

#### **Real-Time GPS Tracking (Advanced)**
**Path:** `/real-time-tracking-advanced`

**Admin Only - Test with admin login:**
1. Navigate to `/real-time-tracking-advanced`
2. Select an active order
3. **Expected:** Mapbox map shows:
   - Live driver location
   - Route visualization
   - Real-time position updates via WebSocket

### D. Customer Dashboard

#### **Access Dashboard**
**Path:** `/customer-dashboard`

**Steps:**
1. Login as customer
2. Click profile icon or "Dashboard" in menu
3. Navigate to `/customer-dashboard`

**What to Check:**
1. **Active Orders Section:**
   - List of current orders
   - Status for each order
   - Quick actions (Track, Cancel)
2. **Order History:**
   - Past completed orders
   - Scroll through list
   - Click on order → View details
3. **Saved Payment Methods:**
   - List of saved cards
   - Add new card button
   - Delete card option
4. **Recent Activity:**
   - Timeline of actions
   - Notifications

### E. Account Settings

#### **Navigate to Settings**
**Path:** `/account-settings`

**Steps:**
1. Click profile icon → "Settings"
2. Or navigate to `/account-settings`

**Sections to Test:**

**1. Profile Information**
- Edit name
- Change email
- Update phone number
- Click "Save Changes"
- **Expected:** Success message

**2. Change Password**
- Enter current password
- Enter new password
- Confirm new password
- Click "Update Password"
- **Expected:** Password updated, stay logged in

**3. Notification Preferences**
- ☐ Email notifications
- ☐ SMS notifications
- ☐ Push notifications
- Toggle each option
- Click "Save Preferences"

**4. Payment Methods**
- View saved cards
- Add new payment method
- Set default payment method
- Remove old cards

**5. Address Book**
- Add new address
- Edit existing address
- Set default pickup address
- Delete address

### F. Customer Support

#### **Help Center**
**Path:** `/help-center`

**Steps:**
1. Click "Help" in menu
2. Or navigate to `/help-center`

**What to Test:**
1. **Browse Categories:**
   - Getting Started
   - Booking & Pricing
   - Tracking Orders
   - Payments & Refunds
   - Driver Information
2. Click on category → See articles
3. Click on article → Read full article
4. **Search Functionality:**
   - Type question in search bar
   - Press enter
   - **Expected:** Relevant articles appear

#### **Live Chat Support**
**Path:** `/chat-center`

**Steps:**
1. Click "Chat with Support" button (appears on most pages)
2. Or navigate to `/chat-center`

**Test Chat Features:**
1. **Start Conversation:**
   - Type message: "I need help with my order"
   - Press send
   - **Expected:** AI responds immediately
2. **Test AI Responses:**
   - Ask: "How much does a return cost?"
   - Ask: "How do I track my order?"
   - Ask: "What's your refund policy?"
3. **Escalate to Human:**
   - Type: "I want to speak to a person"
   - **Expected:** Options to escalate or admin notification

#### **FAQ Page**
**Path:** `/faq`

**Actions:**
1. Navigate to `/faq`
2. Browse through questions
3. Click to expand answers
4. **Check common topics:**
   - Pricing
   - Pickup times
   - Return policies
   - Driver safety

### G. Customer Rating System

#### **Rate Your Driver**
**Path:** `/customer-rating`

**When It Appears:**
- After order is completed
- Email notification with rating link
- Or navigate directly to `/customer-rating`

**Steps:**
1. Navigate to rating page
2. **Rate Driver (1-5 stars):**
   - Click on stars to rate
   - ⭐⭐⭐⭐⭐ (5 stars = excellent)
3. **Rate Experience:**
   - Timeliness
   - Professionalism
   - Care with package
4. **Written Feedback (optional):**
   - Type detailed review
5. **Tip Your Driver (optional):**
   - Select tip amount: $2, $5, $10, Custom
6. Click "Submit Rating"
7. **Expected:** Thank you message, rating saved

---

## Driver Journey

### A. Driver Signup & Onboarding

#### **Step 1: Apply to Become a Driver**
**Path:** `/driver-signup`

**Actions:**
1. Navigate to `/driver-signup`
2. Click "Become a Driver" button

**Application Form:**
1. **Personal Information:**
   - Full Name
   - Email
   - Phone Number
   - Date of Birth
2. **Vehicle Information:**
   - Vehicle Make (e.g., Honda)
   - Vehicle Model (e.g., Civic)
   - Vehicle Year (e.g., 2020)
   - License Plate Number
   - Vehicle Color
3. **Documents Upload:**
   - Driver's License (photo)
   - Vehicle Registration
   - Insurance Proof
4. **Background Check Consent:**
   - ☐ I agree to background check
5. Click "Submit Application"
6. **Expected:** Application submitted, pending review message

#### **Step 2: Complete Onboarding**
**Path:** `/driver-onboarding`

**After Admin Approves Application:**
1. Login with driver credentials
2. Navigate to `/driver-onboarding`

**Onboarding Steps:**

**1. Account Setup**
- Set up Stripe Connect for payouts
- Enter bank account details
- SSN/Tax ID for 1099

**2. Training Modules**
- Watch welcome video
- Read safety guidelines
- Review package handling procedures
- Complete quiz (must pass 80%)

**3. Insurance & Documents**
- Upload insurance certificate
- Sign driver agreement
- Review terms of service

**4. Vehicle Inspection**
- Submit vehicle photos (4 angles)
- Verify vehicle is clean and safe

**5. Complete Onboarding**
- Click "Start Driving"
- **Expected:** Access to driver portal granted

### B. Driver Portal (Desktop)

#### **Access Driver Portal**
**Path:** `/driver-portal`

**Steps:**
1. Login as driver
2. Navigate to `/driver-portal`
3. **Expected:** Driver dashboard loads

**Main Sections to Check:**

#### **1. Available Jobs**

**What to See:**
- List of nearby pickup jobs
- Each job shows:
  - Customer address (partial for privacy)
  - Package size
  - Distance from you
  - Payout amount
  - Pickup time window
  - 🎯 **"Closeby Order" indicator** (for Patent #13 clustered orders)

**Actions:**
1. Scroll through available jobs
2. Click "View Details" on a job
3. **Job Details Modal:**
   - Full address (after accepting)
   - Customer phone
   - Special instructions
   - Route preview
4. Click "Accept Job"
5. **Expected:** 
   - Job moves to "Active Jobs"
   - Customer notified
   - Navigation starts

#### **2. Active Jobs (Current Deliveries)**

**What to See:**
- Jobs you've accepted
- Status for each job
- Action buttons

**Actions:**
1. Click "Navigate" → Opens Google Maps with directions
2. Click "Contact Customer" → Opens phone or chat
3. Click "Arrived at Pickup" → Updates status
4. **Pick Up Package:**
   - Click "Complete Pickup"
   - Redirected to complete delivery page

#### **3. Completed Jobs History**

**Actions:**
1. Click "History" or "Completed" tab
2. View list of past deliveries
3. See earnings per job
4. Check customer ratings

#### **4. Earnings Dashboard**

**Navigate to:** `/driver-payments`

**What to Check:**
1. **Current Balance:**
   - Total pending earnings
   - Available for payout
2. **Earnings Breakdown:**
   - This week
   - Last 7 days
   - This month
   - All time
3. **Payout History:**
   - List of past payouts
   - Date and amount
   - Status (pending, completed)
4. **Request Payout:**
   - Click "Request Instant Payout"
   - **Fee:** $0.50
   - **Arrival:** 15-30 minutes
   - Or click "Weekly Payout" (free, arrives Friday)
5. **1099 Tax Documents:**
   - Download annual tax summary

#### **5. Driver Analytics**

**Path:** `/driver-analytics`

**Metrics to Check:**
1. **Performance Stats:**
   - Total deliveries
   - Average rating
   - On-time percentage
   - Cancellation rate
2. **Earnings Charts:**
   - Daily earnings graph
   - Weekly trends
   - Best earning hours
3. **Efficiency Metrics:**
   - Average time per delivery
   - Miles driven
   - Deliveries per hour

### C. Complete a Delivery

#### **Step 1: Navigate to Pickup Location**

**Actions:**
1. Accept job from driver portal
2. Click "Navigate" button
3. **Expected:** Opens Google Maps with route
4. Drive to customer location

#### **Step 2: Arrive at Pickup**

**Actions:**
1. In driver portal → Click "Arrived at Pickup"
2. **Or:** Use mobile app → Tap "I've Arrived"
3. **Expected:** 
   - Customer notified
   - Timer starts for pickup

#### **Step 3: Pickup Package**

**Actions:**
1. Meet customer or retrieve package per instructions
2. Verify package matches description
3. In app → Click "Package Picked Up"

#### **Step 4: Package Verification (Photo & Signature)**

**Path:** `/driver/complete/:orderId`

**Actions:**
1. After clicking "Package Picked Up"
2. Redirected to complete delivery page

**Verification Steps:**

**1. Take Package Photos**
- Click "Take Photo" or "Upload Photo"
- **Photo 1:** Package label/barcode
- **Photo 2:** Full package
- **Photo 3:** Package with customer (optional)
- Up to 5 photos allowed
- **Expected:** Photos upload and preview appears

**2. Capture Customer Signature**
- Customer name auto-filled
- Customer can sign on screen (if digital signature available)
- **Or:** Driver types customer's name as text signature
- Enter customer name: "John Smith"
- **Expected:** Signature captured

**3. Delivery Notes (Optional)**
- Type any notes: "Package in good condition"
- Document any issues
- Special instructions followed

**4. Confirm Package Condition**
- ☐ Package intact
- ☐ All items accounted for
- ☐ Customer satisfied

**5. Complete Delivery**
- Click "Complete Delivery"
- **Expected:**
  - Order marked complete
  - Earnings added to balance
  - Customer notified
  - Rating prompt sent to customer

#### **Step 5: Gift Card Delivery (Special Case)**

**Path:** `/driver/complete-gift-card/:orderId`

**If order is gift card return:**
1. Follow same photo verification
2. **Additional Step:**
   - Enter gift card balance
   - Verify gift card number
3. Complete delivery

### D. Driver Mobile App

#### **Access Mobile App**
**Path:** `/driver-app` or `/mobile-driver`

**Steps:**
1. Login on mobile device
2. Navigate to `/driver-app`
3. **Expected:** Mobile-optimized driver interface

**Key Mobile Features:**

#### **1. Mobile Dashboard**
- Swipeable job cards
- Large "Accept Job" buttons
- Quick navigation controls

#### **2. Live Order Map**
**Features to Test:**
1. **Map Display:**
   - Your current location (blue dot)
   - Customer pickup location (red marker)
   - Destination location (green marker)
2. **Patent #13 - Nearby Order Detection:**
   - **Cluster Visualization:**
     - Light orange circles around order clusters
     - Dashed lines showing potential routes
   - **Closeby Markers:**
     - Orders near each other have 🎯 indicator
   - **Batch Suggestions:**
     - Yellow banner: "3 orders nearby - Earn $45 in one trip!"
     - Click "View Batch"
     - **Expected:** Shows all orders in cluster with total earnings
   - **Accept Multiple Orders:**
     - Select 2-3 orders from same area
     - Click "Accept All"
     - **Expected:** Route optimized for all pickups
3. **Real-Time Updates:**
   - New orders appear on map
   - WebSocket updates position
   - Distance and ETA update live

#### **3. Camera Package Verification**
- Use device camera to take photos
- Multiple photo angles
- Auto-upload to server

#### **4. GPS Navigation**
- Turn-by-turn directions
- Traffic updates
- Alternative routes

### E. Driver Documents & Resources

#### **Driver Tutorial**
**Path:** `/driver-tutorial`

**Content:**
1. Video tutorials
2. Best practices guide
3. Safety protocols
4. Package handling tips

#### **Driver Documents**
**Path:** `/driver-documents`

**Available Documents:**
1. Driver agreement (PDF)
2. Insurance certificate
3. 1099 tax forms
4. Weekly earning reports
5. Download buttons for each

#### **Driver Safety Center**
**Path:** `/driver-safety-center`

**Admin Access - Test features:**
1. Safety training modules
2. Incident reporting
3. Emergency contacts
4. Safety equipment checklist

#### **Driver Performance**
**Path:** `/driver-performance`

**Metrics:**
1. Performance scorecard
2. Areas for improvement
3. Top performer leaderboard
4. Incentive eligibility

#### **Driver Incentives**
**Path:** `/driver-incentives`

**Check:**
1. Current bonuses available
2. Progress toward incentives
3. Completed incentives
4. Payment history

#### **Driver Feedback System**
**Path:** `/driver-feedback-system`

**Admin Feature:**
1. View driver feedback
2. Respond to concerns
3. Track improvement
4. Performance coaching

---

## Admin Dashboard

### A. Access Admin Dashboard

#### **Login as Admin**
**Credentials:**
- Email: nabeelmumtaz92@gmail.com (or other admin email)
- Password: (your admin password)

**Path:** `/admin-dashboard`

**Expected:** Comprehensive admin dashboard loads

### B. Dashboard Overview

**Main Metrics Displayed:**
1. **Today's Stats:**
   - Total orders
   - Active orders
   - Completed orders
   - Revenue
2. **Real-Time Activity:**
   - Active drivers
   - Customers online
   - Orders in progress
3. **Quick Actions:**
   - Create manual order
   - Message all drivers
   - Process refund
   - Run payout

### C. Order Management

#### **Path:** `/admin-orders` or Admin Dashboard → "Order Management"

**Features to Test:**

**1. View All Orders**
- Table of all orders
- Filter by status:
  - All
  - Pending
  - Assigned
  - In Progress
  - Completed
  - Cancelled
- Search by order number or customer name
- Sort by date, status, driver

**2. Create Manual Order**
- Click "Create Order" button
- **Fill Form:**
  - Customer name
  - Customer email/phone
  - Pickup address
  - Package details
  - Select retailer
  - Payment status
- Click "Create"
- **Expected:** Order appears in list, available to drivers

**3. Edit Order**
- Click on order from list
- Edit details:
  - Change address
  - Update package size
  - Modify pickup time
  - Reassign driver
- Click "Save Changes"

**4. Cancel Order**
- Click "Cancel" on order
- **Confirmation Modal:**
  - Reason for cancellation
  - Refund amount
- Click "Confirm Cancellation"
- **Expected:** 
  - Order cancelled
  - Customer notified
  - Refund processed

**5. Process Refund**
- Click "Issue Refund" on completed order
- Enter refund amount
- Select reason
- Click "Process Refund"
- **Expected:** Stripe refund initiated

### D. Driver Management

#### **Path:** `/admin-drivers` or Admin Dashboard → "Driver Management"

**Features:**

**1. View All Drivers**
- Active drivers list
- Filter by:
  - Status (active, inactive, pending)
  - Rating
  - Earnings
- Search by name or email

**2. Driver Applications**
- **Path:** `/admin-driver-applications`
- Review pending applications
- Check documents:
  - Driver's license
  - Insurance
  - Vehicle registration
- **Actions:**
  - ✅ Approve Application
  - ❌ Reject Application
  - 💬 Request More Info

**3. Driver Performance**
- Click on driver → View profile
- **Check:**
  - Total deliveries
  - Average rating
  - Earnings
  - On-time percentage
  - Customer feedback
- **Actions:**
  - Suspend driver
  - Send message
  - Issue warning
  - Award bonus

**4. Driver Payouts**
- View pending payouts
- Process bulk payouts
- Click "Process All Payouts"
- **Expected:** Stripe transfers initiated

### E. Customer Management

#### **Path:** `/admin-customers` or Admin Dashboard → "Customer Management"

**Features:**

**1. View All Customers**
- Customer list with:
  - Name
  - Email
  - Total orders
  - Lifetime value
  - Join date

**2. Customer Profile**
- Click on customer
- View:
  - Order history
  - Payment methods
  - Support tickets
  - Ratings given
- **Actions:**
  - Send email
  - Issue credit
  - View full history

**3. Customer Service Tickets**
- **Path:** `/customer-service-tickets`
- View open tickets
- Assign to team member
- Respond to customer
- Close ticket

### F. Real-Time Tracking (Admin)

#### **Path:** `/admin-tracking` or `/real-time-tracking-advanced`

**Features:**
1. **Live Map View:**
   - All active orders on map
   - Driver locations in real-time
   - Customer pickup locations
   - Routes and ETAs
2. **WebSocket Updates:**
   - Positions update every few seconds
   - Status changes appear live
3. **Order Details:**
   - Click on map marker → Order popup
   - Driver info
   - Customer info
   - Time remaining

### G. Analytics & Reporting

#### **Business Intelligence**
**Path:** `/business-intelligence`

**Dashboards:**
1. **Revenue Analytics:**
   - Daily/weekly/monthly revenue
   - Revenue by retailer
   - Average order value
   - Growth trends
2. **Operational Metrics:**
   - Orders per day
   - Average delivery time
   - Driver utilization
   - Customer retention
3. **Geographic Analysis:**
   - Heat map of orders
   - Coverage areas
   - Demand patterns

#### **Advanced Reporting**
**Path:** `/advanced-reporting`

**Reports Available:**
1. **Financial Reports:**
   - P&L statement
   - Cash flow
   - Driver payouts
   - Refunds issued
2. **Operational Reports:**
   - Driver performance
   - Order success rate
   - Failed deliveries
   - Cancellation reasons
3. **Customer Reports:**
   - New customer acquisition
   - Churn rate
   - Lifetime value
   - Satisfaction scores

**Export Options:**
- Excel (.xlsx)
- CSV
- PDF
- **Action:** Click "Export" for any report

#### **Enhanced Analytics Dashboard**
**Path:** `/enhanced-analytics`

**Advanced Features:**
1. Interactive charts
2. Custom date ranges
3. Drill-down capabilities
4. Comparative analysis
5. Predictive forecasting

### H. System Settings

#### **Path:** `/admin-settings` or Admin Dashboard → "Settings"

**Settings Sections:**

**1. General Settings**
- Platform name
- Contact email
- Support phone
- Operating hours

**2. Pricing Configuration**
- Base delivery fee
- Per-mile charge
- Size multipliers:
  - Small package
  - Medium package
  - Large package
- Special handling fees
- Click "Save Changes"

**3. Service Areas**
- Add/remove cities
- Define coverage zones
- Set delivery radii

**4. Payment Settings**
- Stripe API keys
- PayPal credentials
- Driver payout split (70/30)
- Instant payout fee ($0.50)

**5. Notification Settings**
- Email templates
- SMS templates
- Push notification settings

**6. Return Policies**
- Configure retailer policies
- Set return windows
- Define refund rules

### I. Additional Admin Features

#### **Route Optimization**
**Path:** `/route-optimization`

**Features:**
1. View all active routes
2. Optimize routes for efficiency
3. Reassign orders for better batching
4. Save fuel costs

#### **Multi-City Management**
**Path:** `/multi-city-management`

**Features:**
1. Manage multiple cities
2. City-specific pricing
3. Regional managers
4. Per-city analytics

#### **Quality Assurance**
**Path:** `/quality-assurance`

**Features:**
1. Review low-rated orders
2. Check driver compliance
3. Package damage reports
4. Customer complaint tracking

#### **Cost Monitoring**
**Path:** `/cost-monitoring`

**Features:**
1. Real-time cost tracking
2. Budget alerts
3. Expense categories
4. Profit margin analysis

#### **Monitoring Dashboard**
**Path:** `/monitoring-dashboard`

**Features:**
1. System health metrics
2. API response times
3. Error logs
4. Database performance
5. Uptime monitoring

#### **Bulk Order Import**
**Path:** `/bulk-order-import`

**Features:**
1. Upload CSV of orders
2. Validate data
3. Bulk create orders
4. Error handling

#### **Cancellation Alerts**
**Path:** `/cancellation-alerts`

**Features:**
1. Real-time cancellation notifications
2. Cancellation trends
3. Reason analysis
4. Retention strategies

#### **Employee Dashboard**
**Path:** `/employee-dashboard`

**Features:**
1. Support agent interface
2. Ticket management
3. Customer communication
4. Performance metrics

---

## Retailer Portal

### A. Retailer Registration

#### **Path:** `/retailer/register`

**Steps:**
1. Login as authenticated user
2. Navigate to `/retailer/register`
3. **Fill Registration Form:**
   - **Company Name:** "ABC Retail Co"
   - **Business Type:** Retail / E-commerce / Wholesale
   - **Tax ID:** (EIN)
   - **Business Address:**
     - Street address
     - City
     - State
     - ZIP
   - **Contact Information:**
     - Primary contact name
     - Email
     - Phone
   - **Website:** https://example.com
4. Click "Register Company"
5. **Expected:** Company created, redirected to retailer dashboard

### B. Retailer Dashboard

#### **Path:** `/retailer/dashboard`

**What to See:**
1. **Company Overview:**
   - Company name
   - Status (active, pending, suspended)
   - Subscription tier
2. **Quick Stats:**
   - Total orders
   - Active returns
   - Monthly volume
   - Total spend
3. **Recent Orders:**
   - List of recent returns
   - Status for each
4. **Action Buttons:**
   - Create return
   - View analytics
   - Manage API keys
   - Configure webhooks

### C. Retailer API Integration

#### **API Keys Management**
**Path:** `/retailer/companies/:companyId/api-keys`

**Steps:**
1. From retailer dashboard → "API Keys"
2. Or navigate to `/retailer/companies/[your-company-id]/api-keys`

**Actions:**

**1. Create New API Key**
- Click "Generate API Key" button
- **Configure:**
  - **Key Name:** "Production API Key"
  - **Environment:** Production / Sandbox
  - **Permissions:** (select scope)
    - ☐ Read orders
    - ☐ Create orders
    - ☐ Update orders
    - ☐ Read analytics
  - **Rate Limit:** 1000 requests/hour
- Click "Generate"
- **Expected:** 
  - API key displayed (only shown once!)
  - Copy and save securely

**2. Test API Key**
- Copy API key
- Open API documentation
- Make test request:
  ```bash
  curl -H "Authorization: Bearer YOUR_API_KEY" \
       https://returnit.online/api/retailer/orders
  ```
- **Expected:** JSON response with orders

**3. Manage Existing Keys**
- View list of API keys
- See last used date
- Check request count
- Revoke key if compromised

#### **Webhooks Configuration**
**Path:** `/retailer/companies/:companyId/webhooks`

**Steps:**
1. From retailer dashboard → "Webhooks"
2. Or navigate to `/retailer/companies/[your-company-id]/webhooks`

**Actions:**

**1. Create Webhook**
- Click "Add Webhook" button
- **Configure:**
  - **Endpoint URL:** https://your-server.com/webhook
  - **Events to Subscribe:**
    - ☐ order.created
    - ☐ order.assigned
    - ☐ order.picked_up
    - ☐ order.delivered
    - ☐ order.cancelled
  - **Secret Key:** Auto-generated for HMAC verification
- Click "Create Webhook"
- **Expected:** Webhook created, test event sent

**2. Test Webhook**
- Click "Send Test Event"
- Select event type
- Click "Send"
- **Expected:** 
  - Test payload sent to your endpoint
  - Response status displayed
  - Delivery log created

**3. View Webhook Logs**
- Click on webhook → "View Logs"
- **See:**
  - All deliveries
  - Success/failure status
  - Response codes
  - Retry attempts
- **Check failed deliveries:**
  - Click "Retry" to resend

**4. Monitor Webhook Health**
- Success rate percentage
- Average response time
- Recent failures
- Alerts for downtime

### D. Retailer Analytics

#### **Path:** Retailer Dashboard → "Analytics"

**Metrics:**
1. **Order Volume:**
   - Daily orders chart
   - Weekly trends
   - Monthly comparison
2. **Return Reasons:**
   - Pie chart of return reasons
   - Trend analysis
   - Product quality insights
3. **Cost Analysis:**
   - Total spend
   - Average cost per return
   - Savings vs traditional methods
4. **Performance Metrics:**
   - Average processing time
   - Customer satisfaction
   - Driver ratings

---

## Mobile Apps

### A. Customer Mobile App

#### **Access:**
**Path:** `/customer-app` or `/customer-mobile-app`

**Steps:**
1. Open on mobile device
2. Login or create account
3. Mobile-optimized interface loads

**Features to Test:**

**1. Mobile Book Pickup**
- Tap "Book Pickup"
- Fill form with mobile-friendly inputs
- Use device location for address
- Swipe between form steps
- Tap "Complete Booking"

**2. Mobile Tracking**
- Tap "Track" on active order
- View map with your location
- See driver approaching in real-time
- Receive push notifications

**3. Mobile Payment**
- **Stripe Payment Sheet:**
  - Tap "Pay with Card"
  - Enter card details in native sheet
  - Save for future use
  - Complete payment
- **PayPal Mobile:**
  - Tap "PayPal" button
  - Redirect to PayPal app/browser
  - Approve payment
  - Return to ReturnIt app

**4. Social Login (Mobile)**
- **Google OAuth:**
  - Tap "Sign in with Google"
  - expo-auth-session handles flow
  - Consent screen appears
  - Returns to app with token
- **Apple/Facebook:**
  - Similar flow (credentials required)

**5. Push Notifications**
- Driver assigned notification
- Driver en route notification
- Package picked up notification
- Delivery complete notification

### B. Driver Mobile App (React Native)

#### **Access:**
**Path:** React Native app or `/driver-app`

**Note:** Full React Native app at `mobile-apps/returnit-driver/`

**Features to Test:**

**1. Mobile Dashboard**
- View available jobs
- Scroll through job cards
- Tap to view details
- Swipe to accept/decline

**2. Live Order Map**
**Patent #13 Features:**
- View map with all nearby orders
- See cluster circles (orange, subtle)
- 🎯 Closeby order indicators
- Batch suggestion banner
- Tap "View Batch" → See multi-order option
- Accept multiple orders
- Route optimization shown

**3. Camera Package Verification**
- Tap "Take Photo"
- expo-camera launches
- Take up to 5 photos
- Photos upload immediately
- Thumbnail previews

**4. Digital Signature**
- Customer signs on screen
- Or type name as text signature
- Save signature

**5. GPS Navigation**
- Tap "Navigate"
- Opens Google/Apple Maps
- Turn-by-turn directions

**6. Stripe Connect Payouts**
- View earnings balance
- Request instant payout
- Track payout status
- Arrives in 15-30 minutes

**7. Real-Time WebSocket Updates**
- Orders appear instantly
- Status changes in real-time
- Map updates live
- No manual refresh needed

---

## Advanced Features

### A. Promo Codes & Discounts

#### **Test Promo Codes**
**During Checkout:**

**Available Codes:**
1. **SAVE10** - 10% off
2. **FREESHIP** - Free delivery
3. **FIRSTTIME** - 20% off first order
4. **LOYAL50** - $5 off for returning customers

**Steps:**
1. Proceed to checkout
2. Find "Promo Code" field
3. Enter code: `SAVE10`
4. Click "Apply"
5. **Expected:**
   - Discount applied
   - Total price updates
   - Savings amount shown
6. Try invalid code: `INVALID123`
7. **Expected:** Error message

### B. Donation System

#### **Donate Instead of Return**
**During Booking:**

**Steps:**
1. Book pickup as normal
2. At "Return Destination" step:
   - Select "Donate to Charity"
3. **Choose Charity:**
   - Local food bank
   - Goodwill
   - Salvation Army
   - Habitat for Humanity
4. **Price Adjustment:**
   - Some retailers offer discount for donations
   - Check if price updates
5. Complete booking
6. **Expected:** 
   - Driver delivers to charity
   - Tax receipt generated (if applicable)

### C. Loyalty Program

#### **Path:** `/loyalty-dashboard`

**Admin Feature - Test:**
1. Navigate to loyalty dashboard
2. **See:**
   - Customer loyalty tiers
   - Points balances
   - Rewards earned
   - Redemption options
3. **Award Points:**
   - Select customer
   - Enter points
   - Add reason
   - Click "Award"
4. **Create Reward:**
   - Define reward tier
   - Set point requirement
   - Configure benefit

### D. Multi-Package Booking

#### **Book Multiple Packages**

**Steps:**
1. Start booking process
2. After entering first package details
3. Click "Add Another Package"
4. **Expected:** New package form appears
5. Fill in second package:
   - Different retailer
   - Different size
   - Same pickup location
6. Review shows both packages
7. **Price:** Should be discounted for multiple packages
8. Complete checkout
9. **Expected:** 
   - Single order with multiple packages
   - Driver picks up all packages together

### E. Real-Time Chat Support

#### **Test Live Chat**
**Multiple Ways to Access:**

1. **Via Help Center:**
   - Navigate to `/help-center`
   - Click "Chat with Support"

2. **Via Chat Button:**
   - Most pages have chat bubble (bottom right)
   - Click to open

3. **Via Chat Center:**
   - Navigate to `/chat-center`

**Chat Features:**
1. **AI Assistant:**
   - Ask question
   - Get instant AI response
   - GPT-4o powered
2. **Escalate to Human:**
   - Type "I need a person"
   - Admin notified
   - Live agent takes over
3. **File Attachments:**
   - Upload image
   - Share order number
4. **Chat History:**
   - Previous conversations saved
   - Continue past conversations

### F. Printable Templates

#### **Path:** `/printable-templates`

**Admin Feature:**
1. Navigate to printable templates
2. **Available Templates:**
   - Shipping labels
   - Return labels
   - Packing slips
   - Driver manifests
   - Invoice templates
3. **Actions:**
   - Preview template
   - Print
   - Download PDF
   - Customize fields

---

## Testing Checklists

### Quick Smoke Test (15 minutes)

**Essential Features to Verify App is Working:**

- [ ] Welcome page loads
- [ ] Login works (email/password)
- [ ] Book pickup form loads all steps
- [ ] Checkout page displays
- [ ] Payment form appears (don't need to complete)
- [ ] Driver portal loads (login as driver)
- [ ] Admin dashboard loads (login as admin)
- [ ] Order status page displays
- [ ] Tracking page shows map
- [ ] No console errors

### Comprehensive Test (2-3 hours)

**Customer Flow:**
- [ ] Create new customer account
- [ ] Login with Google OAuth
- [ ] Book complete pickup (all 5 steps)
- [ ] Apply promo code successfully
- [ ] Complete payment with Stripe test card
- [ ] View order status page
- [ ] Track order on map
- [ ] Access customer dashboard
- [ ] Update account settings
- [ ] Change password
- [ ] Add payment method
- [ ] View help center
- [ ] Start live chat support
- [ ] Rate a completed driver
- [ ] Book donation instead of return
- [ ] Book multiple packages in one order

**Driver Flow:**
- [ ] Apply to become driver (signup)
- [ ] Complete onboarding process
- [ ] Access driver portal
- [ ] View available jobs
- [ ] Accept a job
- [ ] Navigate to pickup
- [ ] Complete delivery with photos
- [ ] Capture customer signature
- [ ] View earnings dashboard
- [ ] Request instant payout
- [ ] Check driver analytics
- [ ] Access driver documents
- [ ] Complete driver tutorial
- [ ] Test mobile driver app
- [ ] View nearby order clusters (Patent #13)
- [ ] Accept batch of multiple orders

**Admin Flow:**
- [ ] Login as admin
- [ ] View admin dashboard overview
- [ ] Create manual order
- [ ] Edit existing order
- [ ] Cancel order and process refund
- [ ] Review driver applications
- [ ] Approve new driver
- [ ] View all customers
- [ ] Open customer service ticket
- [ ] View real-time tracking map
- [ ] Check business intelligence reports
- [ ] Export analytics to Excel
- [ ] Update system settings
- [ ] Configure pricing
- [ ] Process bulk driver payouts
- [ ] Monitor system health
- [ ] Review quality assurance metrics

**Retailer Flow:**
- [ ] Register new company
- [ ] Access retailer dashboard
- [ ] Generate API key
- [ ] Test API with curl/Postman
- [ ] Create webhook endpoint
- [ ] Configure webhook events
- [ ] Send test webhook
- [ ] View webhook delivery logs
- [ ] Check retailer analytics
- [ ] Review order volume reports

**Mobile Testing:**
- [ ] Access customer mobile app
- [ ] Book pickup on mobile
- [ ] Mobile payment (Stripe sheet)
- [ ] Mobile payment (PayPal redirect)
- [ ] Google login on mobile
- [ ] Track order on mobile
- [ ] Access driver mobile app
- [ ] View live order map
- [ ] Take package photos with camera
- [ ] Capture digital signature
- [ ] GPS navigation works
- [ ] Request instant payout on mobile
- [ ] Receive push notifications

### Security & Edge Cases

**Security Tests:**
- [ ] Try accessing admin routes without auth → Should redirect
- [ ] Try accessing driver routes as customer → Should block
- [ ] Verify passwords are not exposed in network tab
- [ ] Check API keys are not leaked in frontend
- [ ] Test CSRF protection on forms
- [ ] Verify Stripe payment security

**Edge Cases:**
- [ ] Book pickup with invalid address
- [ ] Try applying multiple promo codes
- [ ] Cancel order immediately after booking
- [ ] Driver rejects all available jobs
- [ ] Customer rates before delivery complete
- [ ] Request payout with $0 balance
- [ ] Upload invalid file format for documents
- [ ] Enter special characters in forms
- [ ] Test with very long strings
- [ ] Test with empty required fields

---

## Appendix: Test Credentials

### Test Payment Cards (Stripe)

**Successful Payments:**
- **Card:** 4242 4242 4242 4242
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

**Declined Cards:**
- **Insufficient funds:** 4000 0000 0000 9995
- **Stolen card:** 4000 0000 0000 9979
- **Expired card:** 4000 0000 0000 0069

### Test PayPal

**Sandbox Account:**
- Use PayPal sandbox for testing
- Test credentials provided by PayPal developer account

### Admin Emails

**Master Admins:**
- nabeelmumtaz92@gmail.com
- durremumtaz@gmail.com
- nabeelmumtaz4.2@gmail.com

### API Testing

**Base URL:**
```
https://returnit.online/api
```

**Example API Request:**
```bash
curl -X GET https://returnit.online/api/retailer/orders \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Support

**Issues Found During Testing:**
- Report bugs via GitHub issues
- Contact: nabeelmumtaz92@gmail.com
- Live chat support at returnit.online

**Last Updated:** October 6, 2025  
**Version:** 1.0  
**App Status:** Production Ready at returnit.online

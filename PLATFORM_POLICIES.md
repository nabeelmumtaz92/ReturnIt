# Return It - Platform Policies & Governance
**Version 5.0 | Effective Date: November 1, 2025**

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Security Architecture](#security-architecture)
3. [Payment Processing & Financial Compliance](#payment-processing--financial-compliance)
4. [Tax Compliance & 1099 Reporting](#tax-compliance--1099-reporting)
5. [Data Protection & Privacy](#data-protection--privacy)
6. [Customer Policies](#customer-policies)
7. [Driver Policies](#driver-policies)
8. [Enterprise Retailer Policies](#enterprise-retailer-policies)
9. [Administrative Controls](#administrative-controls)
10. [Legal Framework](#legal-framework)

---

## Platform Overview

### Business Model
Return It operates as a **reverse logistics platform** connecting customers with independent drivers for pickup and return services. The platform acts as the customer's **agent for transport** under an agency model.

### Service Offerings
- **Standard Service**: $6.99 (driver earns $5.00) - Standard pickup and return
- **Priority Service**: $9.99 (driver earns $8.00) - Faster pickup windows
- **Instant Service**: $12.99 (driver earns $10.00) - Same-day pickup guarantee

### Core Features
- Real-time GPS tracking
- Multi-package booking
- Mandatory photo verification
- AI-powered customer support
- Instant driver payouts
- Enterprise retailer API integration

---

## Security Architecture

### Multi-Layer Security Model

#### Level 1: Public Access
**Scope**: Public tracking, marketing pages

**Controls**:
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention via Drizzle ORM
- XSS protection via security headers (Helmet)

#### Level 2: Authenticated Access
**Scope**: Customer/driver accounts, booking, order management

**Controls**:
- Session-based authentication with PostgreSQL storage
- Bcrypt password hashing (minimum 10 rounds)
- OAuth integration (Google, Apple, Facebook)
- Role-based authorization (Customer, Driver, Admin, Retailer)
- Secure session cookies (httpOnly, secure, sameSite)
- CSRF protection
- **Mandatory authentication for checkout** - prevents unauthorized bookings

#### Level 3: Sensitive Documents
**Scope**: Receipts, invoices, order details

**Controls**:
- **HMAC-SHA256 signed URLs** with cryptographic signatures
- Configurable expiration (default 72 hours)
- Resource-specific access tokens
- URL tampering detection
- No guessable document identifiers

#### Level 4: Real-Time Tracking
**Scope**: Live GPS tracking, WebSocket connections

**Controls**:
- Tracking number + ZIP code verification
- Enhanced rate limiting (10 requests/minute per IP)
- IP-based throttling for abuse prevention
- WebSocket authentication tokens
- Encrypted data transmission

#### Level 5: Tax Documents
**Scope**: 1099 forms, driver earnings reports

**Controls**:
- Private object storage with ACL policies
- Driver/admin-only access control
- Audit logging for all document access
- Encrypted storage (HTTPS/TLS in transit)
- Annual document retention (7 years for tax compliance)

### Enhanced Rate Limiting

| Endpoint Type | Rate Limit | Window |
|--------------|------------|---------|
| Authentication | 5 attempts | 15 minutes |
| Registration | 3 attempts | 1 hour |
| Payment Processing | 10 requests | 5 minutes |
| Tracking Access | 20 requests | 10 minutes |
| Sensitive Documents | 30 requests | 15 minutes |
| Admin Operations | 100 requests | 1 minute |
| Driver Instant Pay | 5 payouts | 1 day |
| API Endpoints | 1000 requests | 1 hour |

---

## Payment Processing & Financial Compliance

### PCI-DSS Compliance

**Level**: PCI-DSS Level 1 compliant via Stripe integration

**Data Handling**:
- ✅ **NO raw card data stored** - All payment card information stored only as Stripe tokens/IDs
- ✅ **NO PAN (Primary Account Number) storage** - Card numbers never touch our servers
- ✅ **NO ABA routing numbers stored** - Bank account data stored only as Stripe references
- ✅ Tokenized payment methods only
- ✅ Stripe-hosted payment forms for card capture
- ✅ Stripe Financial Connections for bank account linking

### Payment Method Storage

**Database Storage** (PCI-compliant):
```
driver_payment_methods table:
- stripeExternalAccountId (reference only)
- stripeCardId (reference only)  
- last4 (display only, not sufficient for fraud)
- type (bank_account/card)
- isDefault (boolean)
```

**Prohibited Storage**:
- ❌ Full card numbers (PAN)
- ❌ CVV/CVC codes
- ❌ Full bank account numbers
- ❌ ABA routing numbers (stored by Stripe only)

### Driver Payout System

**Instant Payout Requirements**:
- Minimum balance: $5.00
- Fee: $0.50 per instant payout
- KYC verification required (Stripe Identity)
- Valid payment method attached
- Account in good standing

**Weekly Payout Schedule**:
- Automatic processing every Monday
- No fees for weekly payouts
- Stripe Connect 70/30 revenue split
- Automatic transfer to driver's default payment method

**Payment Method Limits**:
- Maximum 3 bank accounts per driver
- Maximum 2 debit cards per driver
- One default payment method required
- Instant card verification via micro-charge

### Refund Policy

**Admin Refund Controls**:
- Full refunds: 100% customer payment returned
- Partial refunds: Custom amount specification
- Stripe integration for automatic processing
- Audit trail for all refund transactions
- 30-day refund window from order completion

**Refund Reasons**:
- Service not rendered
- Customer cancellation (before driver assignment)
- Quality issues or complaints
- Duplicate charges
- Administrative errors

---

## Tax Compliance & 1099 Reporting

### IRS 1099-NEC Compliance

**Filing Requirements**:
- Annual 1099-NEC forms for drivers earning $600+
- Electronic filing with IRS (January 31 deadline)
- Driver copy delivery (January 31 deadline)
- 7-year document retention requirement

### Driver Tax Documentation

**Collection Requirements**:
- W-9 form (TIN/SSN verification)
- Legal name and address
- Taxpayer Identification Number (TIN)
- Business structure classification

**1099 Generation Process**:
1. Automated annual calculation (November-December)
2. Driver notification (January)
3. Form generation and PDF creation
4. Email delivery with secure download link
5. IRS electronic filing (January 31)

### Tax Record Access

**Driver Access**:
- Secure 1099 download portal (`/driver/tax-info`)
- Multi-year access to historical forms
- Real-time earnings tracking
- Quarterly earnings statements

**Admin Controls**:
- Bulk 1099 generation interface
- Year-by-year filtering
- Driver-specific form regeneration
- Email distribution tracking
- Compliance dashboard

### Earnings Reporting

**Tracking Requirements**:
- Per-order driver earnings logged
- Real-time running total calculation
- Tax year segmentation (January 1 - December 31)
- Fee breakdown (instant payout fees, platform fees)
- Net earnings calculation (gross - fees)

---

## Data Protection & Privacy

### Data Collection

**Customer Data**:
- Name, email, phone number
- Pickup/dropoff addresses
- Payment methods (tokenized via Stripe)
- Order history and preferences
- Device information and IP addresses

**Driver Data**:
- Identity verification (Stripe Identity)
- W-9 tax information (TIN/SSN)
- Bank account/debit card references
- GPS location (during active jobs only)
- Earnings and payout history
- Background check results

**Retailer Data**:
- Company registration details
- Admin user accounts
- API keys and webhook URLs
- Order volume and usage metrics
- Subscription and billing information

### Data Retention

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Order Records | 7 years | Tax/legal compliance |
| Payment Transactions | 7 years | Financial audit requirements |
| 1099 Tax Forms | 7 years | IRS requirements |
| Customer Accounts | Indefinite (until deletion request) | Service continuity |
| GPS Tracking Logs | 90 days | Dispute resolution |
| Support Chat Logs | 2 years | Quality assurance |
| Audit Logs | 3 years | Security compliance |

### Data Subject Rights

**User Rights** (GDPR/CCPA compliant):
- ✅ Right to access personal data
- ✅ Right to data portability (JSON export)
- ✅ Right to deletion (account termination)
- ✅ Right to correct inaccurate data
- ✅ Right to opt-out of marketing communications
- ✅ Right to withdraw consent

**Data Deletion Process**:
1. User submits deletion request
2. 30-day grace period (account suspended)
3. Permanent data deletion (except legally required records)
4. Confirmation email sent
5. Tax/financial records retained per IRS requirements

### Encryption Standards

**Data in Transit**:
- TLS 1.3 for all HTTPS connections
- WebSocket Secure (WSS) for real-time tracking
- Stripe-to-server encrypted API calls

**Data at Rest**:
- PostgreSQL database encryption (Neon serverless)
- Object storage encryption (GCS/Replit App Storage)
- Environment variable encryption (secrets management)

---

## Customer Policies

### Account Requirements

**Registration**:
- Valid email address
- Phone number verification
- Password strength requirements (min 8 characters)
- Acceptance of Terms of Service

**Authentication**:
- Email/password login
- Social login (Google, Apple, Facebook)
- **Mandatory authentication before checkout**
- Session timeout after 30 days of inactivity

### Booking & Order Management

**Booking Requirements**:
- Authenticated account (no guest checkout)
- Valid pickup address in service area
- Payment method on file
- **Mandatory photo verification** (receipt, tags, or packaging)

**Order Modifications**:
- Cancellation allowed before driver assignment
- Address changes allowed within 1 hour of booking
- Service tier upgrades available (no downgrades)
- Special handling instructions can be added

**Multi-Item Returns**:
- Unlimited items per booking
- Each item requires name, description, value
- Dynamic total value calculation
- Photo verification required for each item

### Prohibited Items

❌ **Not Accepted**:
- Hazardous materials
- Illegal substances
- Perishable food items
- Live animals
- Weapons or ammunition
- Items over 50 lbs (single package)
- Medical waste or biohazards

### Customer Protection

**Guarantees**:
- Package tracking from pickup to dropoff
- Photo verification at each step
- Real-time GPS tracking
- Insurance coverage up to item declared value
- Dispute resolution within 48 hours

**Refund Eligibility**:
- Service not completed
- Significant delays (>24 hours beyond estimate)
- Lost or damaged items (with photo evidence)
- Driver no-show (full refund + $5 credit)

---

## Driver Policies

### Onboarding Requirements

**Identity Verification**:
- Stripe Identity verification (government ID)
- Live selfie comparison
- Address verification
- Social Security Number (for 1099 reporting)

**Background Check**:
- Criminal background check
- Driving record review (if using vehicle)
- No felony convictions in past 7 years
- Clean driving record (no DUIs, max 2 minor violations)

**Tax Documentation**:
- W-9 form completion
- TIN/SSN verification
- Business structure selection
- Tax withholding preferences

### Driver Requirements

**Active Status Maintenance**:
- Minimum 4 jobs per month
- Average rating ≥ 4.0 stars
- Completion rate ≥ 90%
- Response time < 30 minutes during active hours

**Equipment Requirements**:
- Smartphone with GPS and camera
- Reliable transportation
- Thermal bag for weather protection (recommended)
- Professional appearance and conduct

### Earnings & Payouts

**Compensation Structure**:
- Standard jobs: $5.00 per pickup + tips
- Priority jobs: $8.00 per pickup + tips
- Instant jobs: $10.00 per pickup + tips
- 100% of customer tips go to driver
- Bonus incentives for high performers

**Payout Options**:
- **Instant payout**: Available immediately, $0.50 fee
- **Weekly payout**: Every Monday, no fees
- Direct deposit to bank account or debit card
- Minimum $5.00 balance required for instant payout

**Payment Method Management**:
- Add up to 3 bank accounts
- Add up to 2 debit cards
- Set one default payment method
- Instant verification via Financial Connections

### Driver Responsibilities

**Job Execution**:
- ✅ Arrive within scheduled pickup window
- ✅ Verify items against manifest
- ✅ Capture pickup photos (mandatory)
- ✅ Handle packages with care
- ✅ Complete dropoff at correct retailer location
- ✅ Capture dropoff photos (mandatory)
- ✅ Obtain delivery confirmation

**Prohibited Conduct**:
- ❌ Mishandling or damaging packages
- ❌ Opening or inspecting package contents
- ❌ Late arrivals without notification
- ❌ Rude or unprofessional behavior
- ❌ Requesting cash payments
- ❌ Sharing customer information
- ❌ Working while impaired

### Deactivation Grounds

**Immediate Termination**:
- Theft or package tampering
- Fraudulent activity
- Violent or threatening behavior
- Driving under the influence
- Failure to pass background check renewal

**Progressive Discipline**:
- Low ratings (< 4.0 stars for 30 days)
- Excessive cancellations (> 10%)
- Repeated customer complaints
- Failure to meet minimum job requirements

---

## Enterprise Retailer Policies

### Subscription Tiers

#### Free Tier
- 10 orders per month
- Basic dashboard access
- Email support
- Standard SLA (48-hour response)

#### Basic Tier ($99/month)
- 100 orders per month
- Advanced analytics
- Priority email support
- Webhook notifications
- 24-hour SLA

#### Pro Tier ($299/month)
- 500 orders per month
- API access (5,000 requests/day)
- Dedicated account manager
- Custom integrations
- 12-hour SLA

#### Enterprise Tier (Custom pricing)
- Unlimited orders
- Unlimited API requests
- White-label options
- SLA guarantees (4-hour response)
- Dedicated infrastructure
- Custom contract terms

### API Access & Integration

**API Key Management**:
- Generate multiple API keys per account
- Permission scoping (read/write/admin)
- Rate limiting per key
- Key rotation policies (90-day recommended)
- Webhook signature verification

**API Rate Limits**:
- Free: 100 requests/hour
- Basic: 1,000 requests/hour
- Pro: 5,000 requests/hour
- Enterprise: Unlimited (fair use)

**Webhook Events**:
- `order.created` - New order placed
- `order.assigned` - Driver assigned
- `order.picked_up` - Package collected
- `order.delivered` - Return completed
- `order.cancelled` - Order cancelled
- `payment.succeeded` - Payment processed
- `payment.refunded` - Refund issued

### Multi-Admin Access

**Role Hierarchy**:
1. **Owner**: Full control, billing access, user management
2. **Admin**: Order management, reporting, settings
3. **Manager**: Order creation, customer support
4. **Viewer**: Read-only access to orders and analytics

**Access Controls**:
- Role-based permissions
- IP whitelisting (Enterprise tier)
- Two-factor authentication (optional)
- Activity audit logs
- Session management

### Usage Analytics

**Metrics Provided**:
- Total orders processed
- Average processing time
- Customer satisfaction ratings
- Driver performance metrics
- Cost analysis and ROI
- API usage statistics

---

## Administrative Controls

### Admin Dashboard Features

**Order Management** (`/admin/orders`):
- Real-time order monitoring
- Status updates and bulk actions
- Refund processing (full/partial)
- Order details modal with payment breakdown
- 30-second auto-refresh
- Export to Excel

**Driver Payouts** (`/admin/payouts`):
- Payout history and status tracking
- Bulk payout processing
- Transaction ledger
- Stripe transfer monitoring
- Tax year segmentation

**Payment Reconciliation** (`/admin/payment-tracking`):
- Transaction ledger
- Payment summary statistics
- Stripe payment intent tracking
- Refund audit trail

**1099 Tax Forms** (`/admin/tax-reports`):
- Annual form generation
- Bulk processing by year
- Driver tax summaries
- Email distribution
- Download portal

**Manual Order Creation** (`/admin/create-order`):
- Customer lookup
- Address validation
- Pricing calculator
- Service tier selection
- Instant order submission

**Retailer Management** (`/admin/retailers`):
- Account onboarding
- Subscription management
- API key provisioning
- Usage analytics
- Support ticket tracking

**Real-Time Driver Tracking** (`/admin/driver-locations`):
- Interactive Mapbox map
- Active driver locations
- Order assignment status
- Driver details modal

**Identity Verification** (`/admin/drivers`):
- Stripe Identity status review
- Verification result analysis
- Document approval/rejection
- Compliance tracking

### Admin Access Control

**Super Admin Privileges**:
- Full system access
- User role management
- Financial operations
- Database access (read-only via admin panel)
- System configuration

**Support Admin**:
- Customer/driver account management
- Order issue resolution
- Refund processing (up to $100)
- Support ticket management

**Financial Admin**:
- Payment reconciliation
- Payout processing
- Tax form generation
- Financial reporting

### Audit Logging

**Logged Events**:
- User authentication (success/failure)
- Order creation/modification
- Payment transactions
- Refund processing
- Admin actions (all)
- API key generation/revocation
- Data export operations
- Account deletions

**Log Retention**: 3 years minimum

---

## Legal Framework

### Operating Model

**Agency Relationship**:
- Return It acts as the customer's **agent for transport**
- Drivers are **independent contractors**, not employees
- Platform facilitates connection but does not employ drivers
- Customer-driver relationship mediated through platform

### Liability & Insurance

**Platform Liability**:
- Limited to declared item value (max $1,000 per item)
- No liability for prohibited items
- Force majeure exclusions
- Driver negligence covered by platform insurance

**Driver Requirements**:
- Commercial auto insurance (if using vehicle)
- General liability coverage ($100,000 minimum)
- Workers' compensation (if applicable by state)

**Customer Responsibilities**:
- Accurate item value declaration
- Proof of purchase upload (required)
- Proper packaging (if applicable)
- Accurate address information

### Proof of Purchase Requirements

**Mandatory Documentation**:
- ✅ Receipt, invoice, or order confirmation
- ✅ Photo verification at pickup
- ✅ Photo verification at dropoff
- ✅ Digital signature for high-value items (>$500)

**Dispute Resolution**:
1. Customer submits claim within 48 hours
2. Admin reviews photos and documentation
3. Investigation completed within 5 business days
4. Resolution: refund, reimbursement, or denial
5. Appeal process available (escalation to supervisor)

### Terms of Service

**Acceptance**:
- Required at account creation
- Implied acceptance upon booking
- Updates require re-acceptance for major changes
- Email notification 30 days before policy changes

**User Conduct**:
- No fraudulent activity
- Accurate information required
- Respectful communication
- Compliance with local laws
- No system abuse or circumvention

### Intellectual Property

**Platform Rights**:
- Return It name and logo (trademarked)
- Proprietary Return Graph routing algorithm
- UI/UX design and branding
- API documentation and specifications

**User-Generated Content**:
- Customer retains ownership of uploaded photos
- License granted to Return It for service purposes
- Privacy settings respected
- Deletion upon account termination

### Governing Law

**Jurisdiction**: Missouri, United States

**Dispute Resolution**:
1. Good faith negotiation (30 days)
2. Mediation (optional)
3. Binding arbitration (required for claims under $10,000)
4. Litigation (Missouri courts for claims over $10,000)

**Class Action Waiver**: Individual arbitration required (no class actions)

---

## Compliance Certifications

### Current Certifications

- ✅ **PCI-DSS Level 1** (via Stripe)
- ✅ **SOC 2 Type II** (in progress)
- ✅ **GDPR Compliant** (EU data protection)
- ✅ **CCPA Compliant** (California privacy)
- ✅ **IRS 1099 Reporting** (annual compliance)

### Security Standards

- ✅ **OWASP Top 10** protection
- ✅ **HTTPS/TLS 1.3** encryption
- ✅ **Regular penetration testing** (quarterly)
- ✅ **Vulnerability scanning** (automated)
- ✅ **Security incident response plan** (24-hour notification)

### Ongoing Compliance

**Annual Reviews**:
- Security audit (Q4)
- Privacy policy review (Q1)
- Terms of Service update (as needed)
- Tax compliance verification (January)
- Background check renewals (driver anniversary)

**Monitoring & Reporting**:
- Real-time fraud detection
- Automated anomaly detection
- Monthly compliance reports
- Quarterly security briefings
- Annual compliance certification

---

## Contact & Escalation

### Customer Support
- **Email**: support@returnit.online
- **Live Chat**: Available 7am-11pm CT
- **Phone**: (314) 555-RETURN (during business hours)
- **Response SLA**: 24 hours (48 hours weekends)

### Driver Support
- **Email**: drivers@returnit.online
- **In-App Messaging**: Real-time support
- **Emergency Line**: (314) 555-URGENT (24/7)

### Enterprise/Retailer Support
- **Email**: enterprise@returnit.online
- **Dedicated Account Manager**: For Pro/Enterprise tiers
- **API Support**: api-support@returnit.online

### Legal & Compliance
- **Email**: legal@returnit.online
- **Data Protection Officer**: privacy@returnit.online
- **Incident Reporting**: security@returnit.online

### Regulatory Inquiries
- **IRS/Tax Questions**: tax@returnit.online
- **Law Enforcement**: legal@returnit.online (subpoena required)

---

## Policy Updates

**Last Updated**: November 1, 2025  
**Version**: 5.0  
**Next Review**: February 1, 2026  

**Change Log**:
- v5.0 (Nov 2025): Added instant payout policies, 1099 compliance details, admin governance
- v4.1 (Oct 2025): Enhanced security architecture, retailer tier details
- v4.0 (Sep 2025): Multi-layer security model, signed URLs
- v3.0 (Aug 2025): Customer-paid pricing tiers, tip encouragement
- v2.0 (Jul 2025): Driver instant pay, Stripe Identity integration

**Notification Method**: Email to all users 30 days before material changes take effect.

---

**Document Control**  
**Classification**: Public  
**Owner**: Legal & Compliance Team  
**Approver**: CEO & Legal Counsel  
**Distribution**: All users, publicly available at returnit.online/policies

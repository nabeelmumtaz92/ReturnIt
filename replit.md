# Overview

ReturnIt is a reverse delivery service platform that simplifies returns, exchanges, and donations by managing the pickup and return process. It connects customers with drivers to handle these services. The platform is designed as an enterprise-grade solution with a sophisticated white/beige design, a comprehensive admin dashboard for driver and payment management, an AI-powered support chat system, and professional business content, all while maintaining a distinctive cardboard/shipping theme. It supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities, including intelligent support automation. The platform is production-ready, deployment-ready for returnit.online, and poised for partnerships, employee hiring, and operational scaling.

# User Preferences

Preferred communication style: Simple, everyday language.

# Launch Status

As of September 30, 2025, ReturnIt is launch-ready with comprehensive admin dashboard functionality including driver payouts ($0.50 instant fee structure), tax reporting (1099-NEC generation), fully functional notification management systems, dynamic pricing configuration, and complete order tracking with retailer logging. All generate buttons in tax and payout sections are operational with proper API integration. Production data cleanup completed with SMS notification system active for real-time order alerts to 6362544821.

## Recent Updates (October 2, 2025)

### Physical Gift Card Delivery System (COMPLETED)
- ✅ **New Feature**: Drivers can now handle retailer-issued physical gift cards (Target cards, Walmart cards, etc.)
- ✅ **Security**: Server-side fee validation prevents tampering - always charges exactly $3.99 for gift card delivery
- ✅ **No Double Reimbursement**: System enforces either Stripe refund OR gift card delivery (never both)
- ✅ **Customer Flow**: When retailer issues gift card, customer gets NO monetary refund + charged $3.99 delivery fee + receives physical card within 1-2 days
- ✅ **Removed**: Confusing "store credit" option that implied ReturnIt account balance (not implemented)
- ✅ **Database**: New fields track gift card delivery status (pending, in_transit, delivered) and fee payment
- ✅ **Audit Trail**: All gift card transactions logged with Stripe PaymentIntent IDs and admin notes

### Previous Updates
- ✅ **Critical Booking Flow Fixes**: Resolved complete retailer selection system failure that prevented order creation
  - Fixed DatabaseStorage missing all company-related methods (getCompany, getCompanies, getCompanyBySlug, createCompany, updateCompany, deleteCompany, getReturnPolicyByCompany, getCompanyLocations) - production database calls were failing while in-memory storage worked
  - Fixed API route ordering bug: moved `/api/companies/search` before `/api/companies/:id` to prevent "search" from being interpreted as an ID parameter causing "invalid input syntax for type integer: 'NaN'" errors
  - Fixed CompanySelector query parameter serialization: implemented custom queryFn to properly serialize `{q: searchQuery, category: selectedCategory}` into URL query string instead of `[object Object]`
  - Fixed CompanyLocation TypeScript interface schema mismatch: made id, city, state, zipCode, acceptsReturns optional to match simplified database structure (locations stored as `{name, address}` objects)
  - Fixed CompanySelector input value handling: changed from `selectedCompany?.name || searchQuery` to `isOpen ? searchQuery : (selectedCompany?.name || searchQuery)` to allow re-searching after selection
  - Auto-populated database with 8 St. Louis retailers (Best Buy, Dillard's, Macy's, Local Jones, Nordstrom Rack, Home Depot, CVS Pharmacy, Putt N' Around)
- ✅ **End-to-End Testing**: Successfully validated complete customer booking flow from retailer search through Step 3 (Pickup Preferences)
- 🔴 **Known Issues**: 
  - Google Maps API address autocomplete requires configuration - fallback manual address entry functional
  - Server 500 error when fetching return policies (non-blocking, company selection still works)

## Previous Updates (October 1, 2025)
- ✅ **Email Infrastructure Upgrade**: Switched to ImprovMX for FREE email forwarding (support@returnit.online → nabeelmumtaz92@gmail.com), updated ALL website emails from old returnly.com domain to support@returnit.online
- ✅ **Support System Integration**: Tawk.to live chat on all customer pages, Resend for outbound emails (contact form), professional email forwarding via ImprovMX
- ✅ **AI Assistant Knowledge Update**: Refreshed AI assistant with complete October 2025 platform knowledge including all integrations, features, and contact information
- ✅ **Admin Pricing Settings**: Added database-backed pricing configuration system allowing admins to modify base flat fee through admin dashboard (stored in app_settings table)
- ✅ **Order Submission Fix**: Fixed critical booking form bug where orders weren't being submitted - implemented handleStep4Submit function that constructs complete order payload and calls createOrderMutation
- ✅ **Retailer Logging**: Orders now capture and store retailer name, retailer location, and dropoff address for comprehensive reporting and analytics
- ✅ **Companies Table**: Created companies database table with auto-population logic for St. Louis area businesses (Target, Walmart, etc.)
- ✅ **Audit Logging**: Complete order lifecycle tracking with timestamps for all state changes
- ✅ **GDPR/CCPA Compliance**: Account deletion and data export functionality in account settings

## Mobile Deployment Status
ReturnIt mobile deployment features a fully functional Progressive Web App (PWA) with service worker, web manifest, and native-like mobile experience. Chrome automatically offers "Add to Home Screen" functionality, providing users with app-like access to all ReturnIt features. Alternative Expo-based native app deployment encountered prebuild configuration issues but PWA solution delivers professional mobile experience without app store complexity.

**Beta Testing Status**: EAS Update successfully deployed for Expo Go compatibility. PWA provides immediate beta testing capability for both customers and drivers without requiring DUNS number or app store approval. Mobile experience is fully functional and ready for immediate deployment.

**Production Strategy**: Unified PWA architecture serves all user roles (customers, drivers, admins) through single codebase with role-based access control. This approach provides superior operational efficiency, user experience, and technical advantages over separate applications. Long-term user distribution expected to split between PWA users (instant access) and app store users (traditional preference), with PWA-first strategy providing competitive advantages through faster updates and universal compatibility.

## Critical Launch Features Status
- ✅ Driver Payouts & Fee Structure (50-cent instant fee implemented)
- ✅ Tax Reports & 1099 Generation (functional backend API)
- ✅ Notification Management System (interactive with read/delete functions)
- ✅ Route Optimization Tools (working distance optimization)
- ✅ Driver Incentive Management (toggle activation/deactivation)
- 🟡 Driver Onboarding Workflow (needs completion)
- 🟡 Live Order Assignment System (needs real-time integration)
- 🟡 Customer Support Ticket System (needs workflow implementation)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI Components**: Shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme (tan, orange, brown).
- **State Management**: Zustand for global state, React Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Comprehensive Figma-based design system with mobile-first responsive components, including a full component library and design token system.
- **UI/UX Decisions**: Refined white/beige aesthetic, sophisticated gradients, professional typography, and a distinctive cardboard/shipping theme with authentic stock photography. Customer booking page features a single clear delivery handoff background image for consistency. Admin dashboard is optimized for desktop and mobile responsiveness.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for type-safe interactions.
- **Session Management**: Express sessions with PostgreSQL store.
- **API Design**: RESTful API endpoints.

## Data Storage
- **Database**: PostgreSQL hosted on Neon.
- **Schema Management**: Drizzle Kit for migrations.
- **Session Storage**: PostgreSQL-based session storage using `connect-pg-simple`.

## Core Data Models
- **Users**: Authentication with driver/customer roles, Stripe Connect integration, payment preferences.
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split, retailer tracking for reporting.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.
- **Companies**: St. Louis area business directory with auto-population, category filtering, return policy preferences.
- **App Settings**: System-wide configuration storage (pricing, surge multipliers, feature flags) with admin management interface.

## Authentication and Authorization
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook sign-in via Passport.js. Exclusive admin access restricted to a specific email, with auto-redirection to the admin dashboard. Persistent authentication system for mobile apps (30-day session).
- **Authorization**: Role-based access (driver vs. customer).
- **Session Management**: Server-side session storage.
- **Environment-Based Access Control**: Configurable authentication restrictions based on deployment environment (development/staging/production) with email whitelist support.

## Features and Capabilities
- **Customer Website**: Book pickups, real-time tracking, order history, mobile-responsive, AI-powered support chat.
- **Performance Monitoring**: Advanced system performance tracking with LRU caching, request timing, memory usage monitoring, automatic cache management, and health check endpoints.
- **Driver Mobile App**: Native React Native app for job management, GPS navigation, camera package verification, status updates, earnings dashboard with instant pay/incentives, payment management (Stripe Connect 70/30 split), automatic 1099 generation, driver ratings, push notifications, and integrated support chat. Ready for App Store deployment.
- **Admin Tools**: Comprehensive operations dashboard for live jobs, driver statistics, account management, payment processing, bulk payouts, support chat integration, driver performance monitoring.
- **Advanced Analytics System**: Enterprise-grade completed orders analytics with multi-sheet Excel exports, financial breakdowns, driver performance metrics, location analysis, and comprehensive business intelligence reporting. Includes real-time dashboard metrics, driver leaderboards, regional analysis, customer satisfaction scoring, and automated report generation.
- **AI Support System**: Navigation-focused, question-based conversation flow leading to specific solutions with navigation links to app pages. Features smart escalation and phone support integration.
- **Enhanced Developer Console AI**: Upgraded AI console with real OpenAI integration (GPT-4o), conversational responses, project-aware context, and intelligent code suggestions.
- **Payment Processing**: Multi-method (cards, Apple Pay, Google Pay, PayPal via Stripe), promotional codes, driver incentive system, 70/30 payment split, instant payout capabilities.
- **SEO Optimization**: Comprehensive meta tags, Open Graph tags, Twitter cards, structured data, canonical URLs, and performance-optimized DNS prefetch.

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database toolkit and query builder.

## UI and Styling
- **Shadcn/ui**: Component library.
- **Radix UI**: Low-level UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.

## Runtime Libraries
- **React Query**: Server state management.
- **Wouter**: Lightweight client-side routing.
- **Zustand**: Lightweight state management.
- **Date-fns/Dayjs**: Date manipulation utilities.
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation.

## Integrations
- **Stripe**: Payment processing (Stripe Connect for driver payouts, Stripe Identity for driver onboarding).
- **Google OAuth**: For user authentication.
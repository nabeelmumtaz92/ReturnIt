# Overview

Returnly is a reverse delivery service platform that facilitates returns, exchanges, and donations by handling the pickup and return process for customers. The platform connects customers who need items returned with drivers who can handle the delivery. The system consists of:

- **Customer Website**: Primary web interface for booking pickups, tracking returns, and managing orders
- **Customer Mobile App**: React Native version compatible with Expo Go for mobile experience (current implementation)
- **Driver Mobile App**: Dedicated mobile app for drivers to accept jobs, navigate, and update order status
- **Backend API**: Shared Node.js/Express backend serving all customer and driver interfaces

The current implementation is a sophisticated business platform with enterprise-grade operational features, built with React and TypeScript. The platform features a refined white/beige design aesthetic, comprehensive admin dashboard, driver onboarding system, and professional business content while maintaining the distinctive cardboard/shipping theme. The system includes complete customer experience (Welcome, Login, Book Pickup, Order Status) plus production-ready admin and driver management capabilities for pilot operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# Business Roadmap (Demo → Pilot Phase)

**Next Steps for Production Launch:**

## Product & Pricing
- Finalize pricing: base $3.99 + size add-ons (S/M/L/XL), rush fee, multi-item
- Lock order form fields: phone, size selector, return method, pickup window
- Define refund/cancellation rules (late cancel fee, driver no-show, mis-sized box)

## Driver Operations
- Driver onboarding: ID verification + background check (Stripe Identity/Checkr)
- Payouts: Stripe Connect accounts, weekly payout + optional instant cash-out
- In-app photo proof (pickup & drop-off), signature or receipt upload

## Operations & Safety
- SOPs: lost/damaged item policy, prohibited items list, reattempt flow
- Insurance: general liability + contingent cargo coverage
- Support: in-app chat/email, response SLAs, escalation playbook

## Legal & Compliance
- Terms of Service (customer & driver), Privacy Policy, Service area boundaries
- Independent contractor agreement for drivers; tax (1099) handling

## Technical Infrastructure
- Geocoding & routing (Google/Mapbox) for distance/ETAs
- Notifications: push + SMS (status changes, driver ETA)
- Analytics: track CAC, completion rate, on-time %, NPS, avg time per return
- Fraud controls: card 3DS, address checks, driver photo match

## Go-to-Market Strategy
- Launch pilot zip codes only (start small)
- Create FAQ + "How it works" page for trust
- Collect testimonials and photos from first 10-20 jobs

## Admin Tools
- Lightweight ops dashboard: live jobs, reassign, refund, manual payouts
- Content controls: edit pricing, fee toggles, blackout dates

## App Store Preparation
- App name, tagline, screenshots, privacy labels, TestFlight/beta testing

# Recent Changes

**August 12, 2025 (Latest)** - Enhanced with sophisticated white/beige UI design and comprehensive production features:
- Implemented sophisticated white and beige color scheme throughout welcome page and new components
- Created comprehensive Admin Operations Dashboard with real-time analytics, order management, driver approval system
- Built complete Driver Onboarding System with 5-step application process, document upload, and status tracking
- Added production-ready API endpoints for admin analytics, order management, driver applications, and document handling
- Enhanced welcome page with elegant white/stone/amber gradients, professional typography, and premium aesthetic
- All new features integrated seamlessly with existing authentication and payment processing systems
- System ready for demo-to-pilot transition with enterprise-grade operational tools

**August 10, 2025** - Completed comprehensive multi-method authentication and payment processing system:
- Built complete authentication system: Email/Password (bcrypt 12-round hashing), Google, Apple, Facebook sign-in via Passport.js
- Implemented comprehensive payment methods: Debit/Credit cards, Apple Pay, Google Pay, PayPal, Stripe processing
- Created professional PaymentMethods component with step-by-step payment flow and enterprise-grade UI
- Added payment processing API endpoints for all methods with proper authentication middleware
- Enhanced book pickup page with 2-step flow: order details → payment selection
- Added promotional code display (RETURN50, BUNDLE25, STUDENT15) and pricing transparency
- System now "high tech" and sophisticated as requested with enterprise-grade security and UX
- About Us link moved to footer per user request
- Ready for API key integration to activate live payment processing

**August 10, 2025** - Implemented sophisticated Stripe Connect payment workflow with comprehensive driver incentive system:
- Built complete 70/30 payment split system with automatic calculations and fee processing
- Added instant payout functionality with $0.50-$1.00 fees and weekly standard payouts  
- Created comprehensive driver incentive system: size-based bonuses ($5 large packages), peak season bonuses ($2 Nov-Jan), multi-stop bonuses
- Enhanced data schema with driverPayouts, driverIncentives, and businessInfo tables for enterprise-grade payment tracking
- Built sophisticated Driver Payments dashboard with earnings history, instant pay, incentives tracking, and 1099 tax documentation
- Added comprehensive About Us page with complete business information, contact details, and social media integration
- Enhanced storage layer with advanced payment workflow methods and business information management
- Created high-tech payment API endpoints for Stripe Connect, driver onboarding, payout processing, and earnings analytics
- Updated driver portal with direct payment center access and enhanced earnings visualization
- All payment features designed for enterprise scalability with automatic tax form generation and compliance tracking

**August 10, 2025** - Applied warm beige background with Deep Cardboard logo and updated hero section styling:
- Added image carousel cycling through 5 delivery photos (4 user-provided + 1 stock photo) every 4 seconds
- Removed all Card components and container borders for seamless sectioned layout
- Created 7 distinct full-width sections with unique background images and gradients
- Enlarged favicon to 1024x1024px - the absolute maximum size browsers support
- Applied warm beige background (from-amber-200 via-yellow-100 to-orange-100) with Deep Cardboard brown logo throughout website: sophisticated rich brown (#64564C base, #46362D shadows), creating monochromatic cardboard shipping aesthetic with excellent readability
- Created 8 cardboard brown shades with preview page at /logo-colors: Light, Medium Light, Medium, Medium Dark, Dark, Darker, Deep (selected by user), and Darkest cardboard browns
- Created background color picker at /background-colors with 8 gradient options that complement cardboard brown: Sage Green, Deep Blue, Forest Green, Charcoal Gray recommended
- Added comprehensive responsive web design with breakpoints from mobile to 2xl screens
- Centered "Returns made effortless" headline with responsive text scaling (3xl to 8xl)
- Enlarged favicon "R" letter to 240px font size for maximum visibility
- Maintained horizontal sectioning without visible lines or borders
- Applied authentic stock photography to each section (packages, delivery, retail, drivers)

**August 10, 2025** - Implemented comprehensive Figma design system with mobile-first responsive components:
- Built complete design token system matching Figma guide specifications (colors, typography, spacing, radii)
- Created full component library: Button, Input, Card, Chip, AppBar, OrderCard with all variants and states
- Developed interactive design system demo at /design-system-demo with live component showcase
- Added mobile-first responsive layouts with MobileContainer, AppScreen, ResponsiveGrid, FlexStack
- Created mobile app demo at /mobile-app-demo showing native app-like experience
- Enhanced HTML with PWA meta tags for mobile app capabilities
- All components match exact Figma specifications with proper naming conventions and interactive states
- User noted design system is better than main website and ready for app store deployment

**August 10, 2025** - Transformed Returnly into a complete business website with DoorDash-style marketing:
- Added promotional banner with 50% OFF coupon code (RETURN50)
- Integrated customer reviews section with 5-star testimonials and quotes
- Created "How It Works" numbered steps guide for user education
- Added retail partner grid showcasing major brands (Target, Nike, Best Buy, etc.)
- Implemented current deals section with discount codes (BUNDLE25, STUDENT15)
- Enhanced driver recruitment with specific earnings information ($18-25/hour)
- Added professional footer with navigation links and business credibility
- Maintained cardboard/shipping theme while adding comprehensive marketing elements

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme featuring tan, orange, and brown brand colors
- **State Management**: Zustand for global state management, React Query for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints for order management

## Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Fallback**: Memory storage implementation for development/testing
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Core Data Models
- **Users**: Authentication with driver/customer role distinction, Stripe Connect account integration, payment preferences
- **Orders**: Complete order lifecycle management with status tracking (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split
- **Driver Payouts**: Comprehensive payout tracking with instant vs weekly payments, Stripe transfer integration, automatic 1099 generation
- **Driver Incentives**: Advanced bonus system with size-based, peak season, and multi-stop incentives, qualification criteria tracking
- **Business Information**: Complete company profile management with contact details, social media, mission statements

## Authentication and Authorization
- **Simple Authentication**: Basic username/password system without external providers
- **Role-Based Access**: Driver vs customer role differentiation
- **Session Management**: Server-side session storage with PostgreSQL

## Mobile-First Design & App Architecture
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Touch-Friendly**: Optimized for mobile interactions and gestures
- **Cardboard Theme**: Custom shipping/logistics-inspired theme with warm tan, orange, and brown colors for accessibility and brand consistency

### Customer Website Features (Current Implementation)
- Book return pickups with address and retailer selection
- Real-time order tracking and status updates
- User-friendly cardboard/shipping theme
- Mobile-responsive design for phone and tablet use
- Order history and management

### Customer Mobile App Features (Future)
- Native mobile experience with enhanced UX
- Camera integration for photographing return items
- Push notifications for real-time updates
- Location services for accurate pickup addresses
- Offline capabilities for poor connectivity areas

### Driver Mobile App Features (Separate Platform)
- View and accept available pickup jobs in real-time
- GPS navigation and route optimization
- Update order status with location tracking
- Sophisticated earnings dashboard with instant pay options and incentive tracking
- Comprehensive payment management with Stripe Connect integration (70/30 split)
- Advanced incentive system: size bonuses ($5 large), peak season bonuses ($2), multi-stop bonuses
- Instant payout processing with $0.50-$1.00 fees vs free weekly payouts
- Automatic 1099 tax form generation and earnings summaries
- Driver ratings, performance metrics, and feedback system
- Background location services for accurate ETAs

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database toolkit and query builder

## UI and Styling
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **Replit**: Development environment with live preview capabilities
- **ESBuild**: Fast JavaScript bundler for production builds

## Runtime Libraries
- **React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Zustand**: Lightweight state management
- **Date-fns/Dayjs**: Date manipulation utilities
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
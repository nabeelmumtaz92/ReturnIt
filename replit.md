# Overview

Returnly is a reverse delivery service platform designed to simplify returns, exchanges, and donations by managing the pickup and return process for customers. The platform connects customers needing returns handled with drivers capable of providing the service. It aims to be an enterprise-grade solution featuring a sophisticated white/beige design, a comprehensive admin dashboard with driver management and payment processing, AI-powered support chat system, and professional business content, all while retaining a distinctive cardboard/shipping theme. The system supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities with intelligent support automation for pilot operations.

**Production Status (January 2025)**: 
- Platform is production-ready and deployment-ready for returnly.tech domain
- Comprehensive completed orders analytics system with advanced Excel export capabilities, professional table organization, real-time filtering/search, and detailed business intelligence reporting across multiple data sheets
- **Native Driver Mobile App**: Complete React Native mobile application for drivers with GPS navigation, camera integration, push notifications, real-time job management, and earnings tracking. Ready for App Store deployment to iOS and Android
- **Google Play Store Deployment Status**: Account registration submitted with $25 fee paid. Awaiting 1-3 day verification process. All app assets, build configurations, and deployment documentation prepared.
- **Business Transition Phase**: Platform ready for partnerships, employee hiring, and operational scaling
- **Help Center Overhaul**: Complete replacement of all mock data with comprehensive, accurate help articles covering pricing, policies, driver information, service areas, troubleshooting, and St. Louis-specific details. Professional knowledge base with proper navigation and search functionality
- **Footer Navigation**: Professional footer component added across platform with FAQ links, legal pages, and comprehensive navigation
- **UI Polish**: Hero section background image positioning optimized - driver's face now positioned to the right of logo for better visual composition
- **Brand & Asset Pack Complete**: Comprehensive brand documentation system with design tokens, asset inventory, migration reports, and vectorized icons. All background images upgraded to 5K resolution with login rotation bug fixed.
- **Figma UI Redesign Progress (January 2025)**: 6 out of 6 major screens redesigned with new Figma design system including Welcome/Landing, Login/Registration, Book Return/Pickup, Driver Portal, Order Status/Tracking, and Admin Dashboard pages. Modern component structure with clean cardboard theme and professional styling completed. **CORE SCREENS 100% COMPLETE**
- **Comprehensive Redesign Plan**: Systematic approach to redesign all 40+ pages and components: Phase 1 - Complete Admin Dashboard ✅, Phase 2 - Update shared components (header, footer, navigation) 🔄 IN PROGRESS, Phase 3 - Redesign high-traffic pages (help center, FAQ, about), Phase 4 - Update specialized admin/driver pages, Phase 5 - Polish demo and development pages.
- **Phase 2 Architecture Updates Complete**: App.tsx loading screen modernized with progress animation, NotFound page redesigned with cardboard theme and helpful navigation, Header component enhanced with consistent styling and logo integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI Components**: Shadcn/ui built on Radix UI primitives for accessibility.
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme (tan, orange, brown).
- **State Management**: Zustand for global state, React Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Comprehensive Figma-based design system with mobile-first responsive components, including a full component library and design token system.
- **UI/UX Decisions**: Refined white/beige design aesthetic, sophisticated gradients, professional typography, and a distinctive cardboard/shipping theme with authentic stock photography. Each page features randomized delivery driver background images for visual consistency and professional appeal. Admin dashboard optimized for both desktop and mobile responsive design.

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
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.

## Authentication and Authorization
- **Authentication**: Basic username/password, Email/Password (bcrypt), Google, Apple, Facebook sign-in via Passport.js.
- **Authorization**: Role-based access (driver vs. customer).
- **Session Management**: Server-side session storage.

## Features and Capabilities
- **Customer Website**: Book pickups, real-time tracking, order history, mobile-responsive, AI-powered support chat with floating help button.
- **Customer Mobile App (Future)**: Native mobile experience, camera integration, push notifications, location services, offline capabilities.
- **Driver Mobile App**: Native React Native app with view/accept jobs, GPS navigation, camera package verification, status updates, earnings dashboard with instant pay/incentives, payment management (Stripe Connect 70/30 split), automatic 1099 generation, driver ratings, push notifications, integrated support chat system. **Ready for App Store deployment.**
- **Admin Tools**: Comprehensive operations dashboard for live jobs, driver statistics, account management, payment processing, bulk payouts, support chat integration, driver performance monitoring.
- **Advanced Analytics System**: Enterprise-grade completed orders analytics with multi-sheet Excel exports, financial breakdowns, driver performance metrics, location analysis, and comprehensive business intelligence reporting.
- **AI Support System**: Intelligent chat bot with context-aware responses, common issue categories (package not left, more packages than stated, etc.), human agent escalation, phone support integration.
- **Payment Processing**: Multi-method (cards, Apple Pay, Google Pay, PayPal via Stripe), promotional codes, driver incentive system, 70/30 payment split, instant payout capabilities.

## Business Operations Ready
- **Partnership Integration**: Platform designed for retailer partnerships and white-label solutions
- **Scalable Infrastructure**: Built for high-volume operations with automated processes
- **Employee Management**: Admin dashboard supports multiple admin roles and operational staff
- **Financial Reporting**: Comprehensive analytics for business intelligence and investor reporting
- **Compliance Ready**: Driver onboarding, document management, and 1099 tax reporting systems

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

## Integrations (Planned/Implemented)
- **Stripe**: Payment processing (Stripe Connect for driver payouts, Stripe Identity for driver onboarding).
- **Google OAuth**: For user authentication (requires proper Replit domain configuration).
- **Google/Mapbox**: Geocoding and routing (planned).
- **Checkr**: Background checks (planned).
- **Twilio (or similar)**: Push + SMS notifications (planned).
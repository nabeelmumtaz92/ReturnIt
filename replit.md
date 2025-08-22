# Overview

ReturnIt is a reverse delivery service platform that simplifies returns, exchanges, and donations by managing the pickup and return process. It connects customers with drivers to handle these services. The platform is designed as an enterprise-grade solution with a sophisticated white/beige design, a comprehensive admin dashboard for driver and payment management, an AI-powered support chat system, and professional business content, all while maintaining a distinctive cardboard/shipping theme. It supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities, including intelligent support automation. The platform is production-ready, deployment-ready for returnit.online, and poised for partnerships, employee hiring, and operational scaling.

# User Preferences

Preferred communication style: Simple, everyday language.

# Launch Status

As of January 22, 2025, ReturnIt is preparing for launch with comprehensive admin dashboard functionality including driver payouts ($0.50 instant fee structure), tax reporting (1099-NEC generation), and fully functional notification management systems. All generate buttons in tax and payout sections are operational with proper API integration.

## Mobile Deployment Status
ReturnIt mobile deployment features a fully functional Progressive Web App (PWA) with service worker, web manifest, and native-like mobile experience. Chrome automatically offers "Add to Home Screen" functionality, providing users with app-like access to all ReturnIt features. Alternative Expo-based native app deployment encountered prebuild configuration issues but PWA solution delivers professional mobile experience without app store complexity.

**Beta Testing Status**: EAS Update successfully deployed for Expo Go compatibility. PWA provides immediate beta testing capability for both customers and drivers without requiring DUNS number or app store approval. Mobile experience is fully functional and ready for immediate deployment.

**Production Strategy**: Unified PWA architecture serves all user roles (customers, drivers, admins) through single codebase with role-based access control. This approach provides superior operational efficiency, user experience, and technical advantages over separate applications.

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
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.

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
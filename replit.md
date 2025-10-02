# Overview

ReturnIt is a reverse delivery service platform designed to streamline returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It is an enterprise-grade solution featuring a white/beige design, a comprehensive admin dashboard, an AI-powered support chat, and professional business content, all unified by a distinctive cardboard/shipping theme. The platform supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities, including intelligent support automation. ReturnIt is production-ready, deployed at returnit.online, and prepared for scaling, partnerships, and hiring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI Components**: Shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme (tan, orange, brown).
- **State Management**: Zustand for global state, React Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Figma-based, mobile-first responsive design system with a full component library and design tokens.
- **UI/UX Decisions**: Refined white/beige aesthetic, sophisticated gradients, professional typography, and a distinctive cardboard/shipping theme with authentic stock photography. The customer booking page features a consistent delivery handoff background image. The admin dashboard is optimized for desktop and mobile responsiveness.

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
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split, retailer tracking.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.
- **Companies**: St. Louis area business directory with auto-population, category filtering, return policy preferences.
- **App Settings**: System-wide configuration storage (pricing, surge multipliers, feature flags) with admin management interface.

## Authentication and Authorization
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook sign-in via Passport.js. Exclusive admin access restricted to specific emails with auto-redirection to the admin dashboard. Persistent authentication (30-day session) for mobile.
- **Authorization**: Role-based access (driver vs. customer).
- **Session Management**: Server-side session storage.
- **Environment-Based Access Control**: Configurable authentication restrictions based on deployment environment (development/staging/production) with email whitelist support.

## Features and Capabilities
- **Customer Website**: Booking, real-time tracking, order history, mobile-responsive, AI support chat.
- **Performance Monitoring**: Advanced system performance tracking with LRU caching, request timing, memory usage monitoring, automatic cache management, and health check endpoints.
- **Driver Mobile App**: Native React Native app for job management, GPS navigation, camera package verification, status updates, earnings dashboard with instant pay/incentives, payment management (Stripe Connect 70/30 split), automatic 1099 generation, driver ratings, push notifications, and integrated support chat.
- **Admin Tools**: Comprehensive operations dashboard for live jobs, driver statistics, account management, payment processing, bulk payouts, support chat integration, driver performance monitoring.
- **Advanced Analytics System**: Enterprise-grade completed orders analytics with multi-sheet Excel exports, financial breakdowns, driver performance metrics, location analysis, and comprehensive business intelligence reporting. Includes real-time dashboard metrics, driver leaderboards, regional analysis, customer satisfaction scoring, and automated report generation.
- **AI Support System**: Navigation-focused, question-based conversation flow leading to specific solutions with navigation links to app pages. Features smart escalation and phone support integration.
- **Enhanced Developer Console AI**: Upgraded AI console with real OpenAI integration (GPT-4o), conversational responses, project-aware context, and intelligent code suggestions.
- **Payment Processing**: Multi-method (cards, Apple Pay, Google Pay, PayPal via Stripe), promotional codes, driver incentive system, 70/30 payment split, instant payout capabilities.
- **SEO Optimization**: Comprehensive meta tags, Open Graph tags, Twitter cards, structured data, canonical URLs, and performance-optimized DNS prefetch.
- **Retailer API & Integration System**: Programmatic access for retailers to create returns, manage API keys, and integrate via webhooks. Supports physical gift card delivery system.

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
- **ImprovMX**: Email forwarding.
- **Tawk.to**: Live chat.
- **Resend**: Outbound email service.
- **OpenAI**: AI assistant integration (GPT-4o).
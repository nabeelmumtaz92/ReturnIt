# Overview

Returnly is a reverse delivery service platform that facilitates returns, exchanges, and donations by handling the pickup and return process for customers. The platform connects customers who need items returned with drivers who can handle the delivery. The system consists of:

- **Customer Website**: Primary web interface for booking pickups, tracking returns, and managing orders
- **Customer Mobile App**: React Native version compatible with Expo Go for mobile experience (current implementation)
- **Driver Mobile App**: Dedicated mobile app for drivers to accept jobs, navigate, and update order status
- **Backend API**: Shared Node.js/Express backend serving all customer and driver interfaces

The current implementation is a comprehensive business website with DoorDash-style marketing elements, built with React and TypeScript. The platform features promotional banners, customer testimonials, retail partner showcases, discount codes, and professional business content while maintaining the distinctive cardboard/shipping theme. The site includes 4 main screens: Welcome (with full marketing content), Login, Book Pickup, and Order Status, with complete order management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**August 10, 2025 (Latest)** - Implemented comprehensive Figma design system with mobile-first responsive components:
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
- **Users**: Authentication with driver/customer role distinction
- **Orders**: Complete order lifecycle management with status tracking (created, assigned, picked_up, dropped_off, refunded)

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
- Earnings dashboard and payment history
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
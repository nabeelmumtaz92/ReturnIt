# ReturnIt - Return Logistics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)

**ReturnIt** is a comprehensive return logistics platform that simplifies returns, exchanges, and donations by managing the pickup and return process for customers. The platform connects customers needing returns handled with professional drivers capable of providing the service.

## 🚀 Features

### 🌐 Web Platform (65+ Screens)
- **Customer Experience**: Easy booking, real-time tracking, order management
- **Driver Portal**: Job management, earnings tracking, payment processing
- **Admin Dashboard**: Complete business oversight, analytics, driver management
- **Advanced Analytics**: Business intelligence, performance monitoring, reporting

### 📱 Mobile Applications
- **Driver Mobile App**: React Native app with GPS navigation, camera integration, push notifications
- **Customer Mobile App**: Native mobile experience with booking and tracking capabilities

### 💳 Payment Processing
- **Multi-method Support**: Cards, Apple Pay, Google Pay, PayPal via Stripe
- **Driver Payments**: 70/30 split, instant payouts, Stripe Connect integration
- **Automated Systems**: 1099 generation, bulk payouts, incentive tracking

### 🔐 Security & Authentication
- **Enterprise-grade Security**: Bcrypt hashing, account lockout protection
- **Multiple Auth Methods**: Email/password, Google OAuth, social login
- **Role-based Access**: Customer, driver, and admin permissions

### 📊 Business Intelligence
- **Real-time Analytics**: Live order tracking, driver performance metrics
- **Financial Reporting**: Revenue analysis, cost breakdowns, profit tracking
- **Operational Insights**: Route optimization, efficiency monitoring

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom cardboard/shipping theme
- **Shadcn/ui** components built on Radix UI
- **Wouter** for client-side routing
- **React Query** for server state management
- **Zustand** for global state management

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for type-safe database interactions
- **PostgreSQL** database with Neon hosting
- **Express sessions** with PostgreSQL store

### Mobile
- **React Native** with Expo Framework
- **Cross-platform**: iOS and Android deployment
- **Native integrations**: GPS, camera, push notifications

### Infrastructure
- **Neon PostgreSQL**: Serverless database hosting
- **Stripe**: Payment processing and driver payouts
- **Google OAuth**: Authentication integration
- **Replit**: Development and deployment platform

## 🏗️ Architecture

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Web Client    │  Mobile Apps    │  Admin Panel    │
│   (React)       │ (React Native)  │   (React)       │
└─────────┬───────┴─────────┬───────┴─────────┬───────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    ┌───────▼───────┐
                    │   Express     │
                    │   Server      │
                    │ (Node.js/TS)  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  PostgreSQL   │
                    │   Database    │
                    │    (Neon)     │
                    └───────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Stripe account for payments
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/returnly.git
   cd returnly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Environment Variables

```env
# Database
DATABASE_URL=your_neon_postgres_url

# Authentication
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Production
NODE_ENV=production
```

## 📱 Mobile App Deployment

### iOS Deployment
```bash
cd mobile-driver-app
eas build --platform ios
eas submit --platform ios
```

### Android Deployment
```bash
cd mobile-driver-app
eas build --platform android
eas submit --platform android
```

## 🎯 Core Business Model

### Revenue Streams
- **Service Fees**: $3.99 per pickup with percentage-based scaling
- **Volume Discounts**: Bulk return processing for retailers
- **Premium Services**: Express returns, white-label solutions
- **Partnership Revenue**: Retailer integration commissions

### Driver Economics
- **Base Payment**: 70% of service fee
- **Incentives**: Size-based bonuses, peak season multipliers
- **Instant Payouts**: Same-day payment processing
- **Performance Bonuses**: Rating-based earning increases

## 📊 Platform Metrics

### Scale
- **65+ Total Screens**: Comprehensive user experience
- **43 Web Screens**: Complete web application
- **12+ Mobile Screens**: Full-featured driver app
- **8+ Customer Screens**: Planned customer mobile app

### Performance
- **LRU Caching**: Optimized response times
- **Real-time Tracking**: Live order status updates
- **Advanced Analytics**: Business intelligence dashboard
- **Enterprise Security**: Production-ready authentication

## 🔐 Security Features

- **Password Security**: Bcrypt hashing with 12-round salt
- **Account Protection**: Lockout after failed attempts
- **Rate Limiting**: Brute force attack prevention
- **Input Validation**: Comprehensive Zod schema validation
- **Session Security**: PostgreSQL-based session storage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Legal & Terms

Please review our legal documentation:
- [Terms of Service](TERMS.md)
- [Privacy Policy](PRIVACY.md)
- [Service Level Agreement](SLA.md)

## 📞 Support

### Business Contact
- **Email**: support@returnly.tech
- **Phone**: (636) 254-4821
- **Website**: https://returnly.tech

### Development Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive guides in `/docs`
- **Community**: Join our developer community

## 🏆 Recognition

Returnly is designed as an enterprise-grade platform ready for:
- **Partnership Integration**: Retailer partnerships and white-label solutions
- **Scalable Infrastructure**: High-volume operations with automated processes
- **Business Intelligence**: Comprehensive analytics for growth optimization
- **Compliance Ready**: Driver onboarding, document management, tax reporting

---

**Built with ❤️ for the future of return logistics**

*Returnly - Making Returns Effortless*
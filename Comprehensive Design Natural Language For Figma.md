# ReturnIt - Complete Design Brief for Galileo Figma Design Process

## **Project Overview**
ReturnIt is a production-ready reverse logistics platform targeting enterprise retail partners. The platform connects customers with drivers for pickup, return, exchange, and donation services. We need a complete Figma design system that reflects our sophisticated, cardboard-shipping theme with enterprise-grade polish.

---

## **🎨 Brand Identity & Theme**

### **Core Theme: Cardboard/Shipping Aesthetic**
- **Visual Language**: Professional packaging and logistics feel
- **Mood**: Trustworthy, efficient, sophisticated, eco-conscious
- **Style**: Clean, modern, minimal with warm earthy tones
- **Target Audience**: Enterprise retail partners, professional customers, delivery drivers

### **Brand Personality**
- Professional yet approachable
- Efficient and reliable
- Eco-friendly and sustainable
- Technology-forward

---

## **🎨 Color Palette**

### **Primary Colors**
- **Primary Orange**: `#FB923C` - Main action color, CTAs, brand accent
- **Deep Brown**: `#92400E` - Headlines, primary text, authority
- **Warm Beige**: `#F8F7F4` - Background, cards, surfaces

### **Secondary Colors**
- **Light Orange Border**: `#FED7AA` - Borders, dividers, subtle accents
- **Medium Gray Text**: `#78716C` - Secondary text, captions, metadata
- **Dark Gray**: `#374151` - Input text, body copy
- **Light Gray**: `#6B7280` - Labels, placeholder text

### **Accent Colors**
- **Success Green**: `#10B981` - Success states, confirmations, earnings
- **Success Light**: `#D1FAE5` - Success backgrounds, promo badges
- **Success Dark**: `#065F46` - Success text on light backgrounds
- **Error Red**: `#DC2626` - Errors, cancellations, warnings
- **Disabled Gray**: `#9CA3AF` - Disabled states

### **Functional Colors**
- **White**: `#FFFFFF` - Cards, modals, elevated surfaces
- **Black**: `#000000` - Shadows, overlays (low opacity)

---

## **📝 Typography**

### **Font Selection**
- **System Font Stack**: San Francisco (iOS), Roboto (Android), System UI (Web)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### **Type Scale**

**Display/Hero Text**
- Size: 30-34px
- Weight: 700
- Letter Spacing: -0.5px
- Line Height: 1.2
- Color: Deep Brown (#92400E)

**Headings**
- H1: 24px, Weight 700, Letter Spacing 0.2px
- H2: 21px, Weight 700, Letter Spacing 0.2px
- H3: 19px, Weight 700, Letter Spacing 0.2px

**Body Text**
- Large: 18px, Weight 600, Letter Spacing 0.3px
- Regular: 16px, Weight 400-500, Letter Spacing 0.1px
- Small: 15px, Weight 400, Letter Spacing 0.1px

**Captions/Labels**
- Size: 13-14px
- Weight: 400-600
- Letter Spacing: 0.1px
- Line Height: 18-20px
- Color: Medium Gray (#78716C)

### **Text Hierarchy Rules**
- Use letter spacing for enhanced readability (0.1-0.3px)
- Line heights: 18-24px for optimal legibility
- Bold (700) for emphasis and CTAs
- Semibold (600) for labels and secondary actions

---

## **🎯 Component Design System**

### **Buttons**

**Primary Button (Orange)**
- Background: #FB923C
- Text: White, 18px, Weight 700, Letter Spacing 0.3px
- Padding: 20-22px vertical, 24px horizontal
- Border Radius: 14px
- Shadow: 0px 4px 8px rgba(251, 146, 60, 0.3), Elevation 6
- Active State: 80% opacity
- States: Default, Hover, Active, Disabled (#9CA3AF, 60% opacity)

**Secondary Button (White with Orange Border)**
- Background: White
- Border: 2px solid #FED7AA
- Text: Deep Brown (#92400E), 18px, Weight 700
- Padding: 20px vertical, 24px horizontal
- Border Radius: 14px
- Shadow: 0px 2px 4px rgba(0,0,0,0.08), Elevation 3
- Active State: 80% opacity

**Tertiary/Action Buttons**
- Background: White or Light background
- Border: 1px solid #FED7AA
- Text: 15-16px, Weight 600
- Padding: 18px vertical, 20px horizontal
- Border Radius: 12px
- Shadow: 0px 2px 3px rgba(0,0,0,0.06), Elevation 2
- Active State: 70% opacity

**Icon Buttons**
- Size: 44x44px
- Border Radius: 22px (circular)
- Background: Primary Orange or contextual color
- Shadow: 0px 2px 4px rgba(color, 0.25), Elevation 4

### **Cards**

**Standard Card**
- Background: White
- Border: 1px solid #FED7AA
- Border Radius: 14px
- Padding: 22px
- Shadow: 0px 2px 4px rgba(0,0,0,0.08), Elevation 3

**Stats Card**
- Background: White
- Border: 1px solid #FED7AA
- Border Radius: 14px
- Padding: 22px
- Stat Number: 24px, Weight 700, Letter Spacing -0.3px
- Stat Label: 13px, Weight 400, Letter Spacing 0.1px
- Shadow: 0px 2px 4px rgba(0,0,0,0.08), Elevation 3

**Job/Order Card**
- Background: White
- Border: 1px solid #FED7AA
- Border Radius: 14px
- Padding: 18px
- Spacing: 14px margin bottom
- Shadow: 0px 2px 4px rgba(0,0,0,0.08), Elevation 3

**Promo/Success Card**
- Background: #D1FAE5 (Success Light)
- Border: 2px solid #10B981
- Border Radius: 12px
- Text: #065F46 (Success Dark)

### **Input Fields**

**Text Input**
- Background: White
- Border: 1px solid #FED7AA
- Border Radius: 10px
- Padding: 14px vertical, 16px horizontal
- Font Size: 16px
- Text Color: #374151
- Placeholder: #6B7280
- Shadow: 0px 1px 2px rgba(0,0,0,0.05), Elevation 1
- Focus State: Border color #FB923C, shadow increase

**Dropdown/Select**
- Same styling as text input
- Dropdown icon: Down chevron, right aligned

### **Containers & Sections**

**Section Container**
- Margin Bottom: 30px
- Section Title: 21px, Weight 700, Letter Spacing 0.2px

**Modal/Dialog**
- Background: White
- Border Radius: 16px
- Padding: 24px
- Shadow: 0px 8px 24px rgba(0,0,0,0.15)
- Backdrop: rgba(0,0,0,0.5)

---

## **📱 Mobile App Design (React Native)**

### **Navigation**
- **Tab Bar** (Bottom): 5 tabs, icons + labels, 60px height
- **Header Bar**: 56px height, app logo left, profile button right
- **Back Button**: Top left, chevron left icon

### **Screen Layout**
- **Padding**: 20px horizontal margins
- **Top Spacing**: 60px from top (safe area)
- **Section Spacing**: 30px between major sections
- **Card Spacing**: 14-16px between cards

### **Customer App Screens**

**Home Screen**
- Hero section with logo and tagline
- 3 main action buttons (Book Return, Track Package, Donate)
- 2 quick access buttons (Order History, Profile)
- Info card with "How it works"
- Support button at bottom

**Book Return Screen**
- Step-by-step form layout
- Package type selection (radio buttons with icons)
- Address inputs with maps integration
- Promo code field with "Apply" button
- Price summary card with line items
- Large submit button at bottom

**Order Tracking Screen**
- Status timeline (vertical stepper)
- Real-time map view
- Driver info card
- Live updates section

### **Driver App Screens**

**Dashboard Screen**
- Availability toggle (prominent, top section)
- Stats cards (2 columns: Today's Earnings, Active Jobs)
- Available jobs list with accept buttons
- Live Order Map button (green, prominent)
- Quick action buttons (4 in 2x2 grid)

**Earnings Screen**
- Total earnings banner (large, bold)
- Earnings breakdown (Today, Week, Month tabs)
- Payout section with instant payout button
- Transaction history list

**Live Order Map Screen**
- Full-screen Mapbox map
- Floating order cards (bottom sheet style)
- Driver location pin
- Order location pins with numbers
- Navigation controls

---

## **💻 Web Platform Design**

### **Admin Dashboard**
- **Sidebar Navigation**: 240px width, collapsible
- **Main Content**: Fluid width with max 1400px
- **Cards**: Grid layout, responsive columns
- **Data Tables**: Striped rows, sortable headers
- **Charts**: Recharts library, orange/brown color scheme

### **Retailer Portal**
- **Header**: Logo, navigation, user menu
- **Dashboard**: KPI cards, usage charts
- **API Keys Section**: Table with generation/revoke actions
- **Webhook Management**: Event configuration UI
- **Settings**: Tabbed interface

### **Public Website**
- **Hero Section**: Full viewport height, gradient overlay on cardboard texture
- **Features Grid**: 3 columns, icon + title + description
- **Pricing Cards**: 3 tiers, highlight middle option
- **Footer**: Dark brown background, white text

---

## **✨ Visual Effects & Interactions**

### **Shadows & Elevation**
- **Level 1 (Inputs)**: 0px 1px 2px rgba(0,0,0,0.05), Elevation 1
- **Level 2 (Action Buttons)**: 0px 2px 3px rgba(0,0,0,0.06), Elevation 2
- **Level 3 (Cards)**: 0px 2px 4px rgba(0,0,0,0.08), Elevation 3
- **Level 4 (Icon Buttons)**: 0px 2px 4px rgba(color,0.25), Elevation 4
- **Level 6 (Primary CTAs)**: 0px 4px 8px rgba(251,146,60,0.3), Elevation 6

### **Border Radius Standards**
- **Small Elements**: 8-10px
- **Buttons & Inputs**: 10-12px
- **Cards**: 14px
- **Modals**: 16px
- **Circular**: 50% or calculated (e.g., 22px for 44px button)

### **Interactive States**
- **Button Press**: activeOpacity 0.7-0.8 (mobile), scale 0.98 (web)
- **Hover**: Subtle shadow increase, brightness adjustment
- **Focus**: Border color change to Primary Orange
- **Disabled**: Opacity 0.6, no pointer events

### **Animations**
- **Duration**: 200-300ms for interactions, 400-600ms for transitions
- **Easing**: Ease-out for entrances, ease-in for exits
- **Loading States**: Skeleton screens with shimmer effect

---

## **📐 Spacing & Layout System**

### **Base Unit**: 4px

**Spacing Scale**
- **XS**: 8px (4×2)
- **SM**: 12px (4×3)
- **MD**: 16px (4×4)
- **LG**: 20px (4×5)
- **XL**: 24px (4×6)
- **2XL**: 32px (4×8)
- **3XL**: 40px (4×10)

### **Component Spacing**
- **Input Padding**: 14px vertical, 16px horizontal
- **Button Padding**: 20-22px vertical, 24px horizontal
- **Card Padding**: 22px all sides
- **Screen Margins**: 20px horizontal
- **Section Gaps**: 30px vertical

### **Grid System**
- **Mobile**: Single column, 20px gutters
- **Tablet**: 2-3 columns, 24px gutters
- **Desktop**: 12-column grid, 32px gutters, max-width 1400px

---

## **🖼️ Iconography**

### **Icon Style**
- **Library**: Lucide React (line icons, 2px stroke)
- **Size Scale**: 16px, 20px, 24px, 32px
- **Color**: Inherit from parent text color
- **Usage**: Actions, navigation, feature illustrations

### **Emoji Usage**
- Use sparingly for personality and warmth
- Mobile apps: Small decorative use (📦, 📍, 💝, 🚚, 💰)
- Web platform: Minimal to none (professional tone)

---

## **📊 Data Visualization**

### **Charts & Graphs**
- **Library**: Recharts for web, Victory Native for mobile
- **Color Scheme**: Primary Orange for main data, gradients for fills
- **Grid Lines**: Light gray (#F3F4F6), 1px stroke
- **Labels**: 12-14px, Medium Gray
- **Tooltips**: White background, shadow, rounded corners

### **Status Indicators**
- **Success**: Green circle, #10B981
- **Warning**: Orange circle, #FB923C
- **Error**: Red circle, #DC2626
- **Pending**: Gray circle, #9CA3AF

---

## **♿ Accessibility**

### **Color Contrast**
- **Text on White**: Minimum 4.5:1 ratio
- **Primary Orange on White**: Meets AA standard
- **Deep Brown on Beige**: Meets AA standard

### **Touch Targets**
- **Minimum Size**: 44×44px (mobile)
- **Spacing**: Minimum 8px between interactive elements

### **Typography**
- **Minimum Size**: 14px for body text
- **Line Height**: Minimum 1.5 for readability
- **Letter Spacing**: Enhanced for clarity

---

## **🎯 Key Design Principles**

1. **Cardboard Theme**: Maintain warm, earthy, sustainable aesthetic throughout
2. **Professional Polish**: Enterprise-grade visual quality with sophisticated shadows and typography
3. **Consistent Spacing**: Use 4px base unit system religiously
4. **Visual Hierarchy**: Clear distinction between primary, secondary, and tertiary elements
5. **Mobile-First**: Design for mobile experience, scale up for desktop
6. **Performance**: Optimize shadows and effects for smooth 60fps interactions
7. **Scalability**: Design system should support 100+ components and screens

---

## **📦 Deliverables Needed from Galileo**

1. **Complete Design System**
   - Color styles, typography styles, component library
   - Auto-layout components for all UI elements

2. **Mobile App Screens** (Customer & Driver)
   - All 20+ screens in high fidelity
   - Responsive variants (iPhone, Android)
   - Interactive prototypes for key flows

3. **Web Platform Screens**
   - Admin dashboard (10+ screens)
   - Retailer portal (8+ screens)
   - Public website (5+ pages)
   - Desktop responsive variants

4. **Component Specifications**
   - Detailed specs for developers
   - Spacing, sizing, color values
   - Interactive state documentation

5. **Brand Assets**
   - Logo variations (light/dark, horizontal/vertical)
   - Icon set (50+ icons)
   - Illustration library (optional)

---

## **🔗 Additional Context**

- **Production URL**: returnit.online
- **Tech Stack**: React (web), React Native (mobile), TypeScript
- **Current Status**: 173+ features built, production-ready
- **Target Market**: Enterprise retail partners, scaling to 50+ partners
- **Design Goal**: Premium, trustworthy platform worthy of $100M-200M valuation

---

**This design brief represents a complete production-ready reverse logistics platform. All design decisions should reflect enterprise-grade quality while maintaining the warm, approachable cardboard/shipping theme that defines the ReturnIt brand.**

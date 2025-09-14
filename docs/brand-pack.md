# ReturnIt Brand & Asset Pack
*Generated on January 15, 2025*

## 📋 Overview
Comprehensive documentation of ReturnIt's brand assets, design tokens, and visual identity system for the return logistics platform based in St. Louis, MO.

## 🏷️ Logo Files

### Primary Logos (PNG Format)
- `logo-cardboard-deep.png` - Primary brand logo (Deep rich brown - sophisticated)
- `logo-cardboard-dark.png` - Dark cardboard brown (Current favorite - good readability)
- `logo-cardboard-darker.png` - Deeper brown (Premium shipping feel)
- `logo-cardboard-darkest.png` - Darkest brown (Maximum contrast)
- `logo-cardboard-medium.png` - Classic cardboard brown (Balanced tone)
- `logo-cardboard-medium-dark.png` - Medium dark brown (Good readability)
- `logo-cardboard-medium-light.png` - Medium light brown (Gentle contrast)
- `logo-cardboard-light.png` - Light natural cardboard (Subtle and warm)
- `logo-cardboard.png` - Standard cardboard brown
- `logo.png` - Default logo
- `logo-transparent.png` - Logo with transparent background
- `logo-cropped.png` - Cropped version for tight spaces

### Color Variants (PNG Format)
- `logo-white.png` - White logo for dark backgrounds
- `logo-blue.png` - Blue variant
- `logo-cyan.png` - Cyan variant
- `logo-gold.png` - Gold variant
- `logo-green.png` - Green variant
- `logo-orange.png` - Orange variant
- `logo-pink.png` - Pink variant
- `logo-purple.png` - Purple variant
- `logo-red.png` - Red variant

### SVG Logos
- `logo-returnit-box.svg` - Box-style logo with text (SVG format)
- `logo-with-text.svg` - Logo with text treatment (SVG format)
- `favicon.svg` - Favicon in SVG format

**Dimensions**: Most PNG logos appear to be standard web resolution (exact dimensions not specified in source)
**Formats**: PNG (raster), SVG (vector)
**Usage**: Primary logo should be `logo-cardboard-deep.png` for maximum sophistication

## 🎨 Icons

### Emoji Icons (Used in UI)
- 🚚 - Delivery truck icon (used in driver sections)
- 🏪 - Retail partner icon
- 💰 - Deals/money icon
- 🟢 - Online status indicator
- 🔴 - Offline status indicator

### Lucide React Icons (Vector)
- `Inbox` - Empty state icon
- Various UI icons from lucide-react library

**Format**: SVG (vector) - ✅ Optimized
**Status**: All emoji icons should be converted to proper SVG icons for better scalability

## 🖼️ Images & Photography

### Hero/Marketing Images (5K Resolution)
All images upgraded to maximum 5120x3413 resolution with 100% quality:

1. **Welcome Page Carousel** (8 images)
   - Woman receiving package: `https://images.pexels.com/photos/13443801/pexels-photo-13443801.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100`
   - Used in: Homepage hero carousel

2. **Page Backgrounds** (5K Ultra HD)
   - About page: `https://images.pexels.com/photos/8001186/pexels-photo-8001186.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100`
   - Help Center: `https://images.pexels.com/photos/5025639/pexels-photo-5025639.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100`
   - Driver Portal: `https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100`
   - FAQ page: Same as Help Center
   - Admin Dashboard: `https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100`

3. **Attached Assets** (Local)
   - Delivery Driver photos (4 images) in `attached_assets/` folder
   - Used for login page backgrounds and driver demonstrations

**Source Quality**: 5K resolution (5120x3413), DPR 3, 100% quality
**Usage**: Background images for pages, hero sections, carousels

## 🎨 Colors

### Brand Primary Colors
- **Beige Gradient A**: `#FDE68A` (Light yellow-beige)
- **Beige Gradient B**: `#FEF3C7` (Cream beige)  
- **Beige Gradient C**: `#FFEDD5` (Warm cream)
- **Deep Brown**: `#64564C` (Primary brand brown)
- **Accent Orange**: `#EA580C` (Primary CTA color)

### Text Colors
- **Primary Text**: `#78716C` (Warm gray-brown)
- **Muted Text**: `#A8A29E` (Light gray-brown)

### Design System Colors (HSL Format)

#### Light Theme
- `--primary: hsl(20, 100%, 60%)` → **#FF8C42**
- `--secondary: hsl(39, 35%, 65%)` → **#C4A67A**
- `--accent: hsl(39, 35%, 65%)` → **#C4A67A**
- `--background: hsl(0, 0%, 100%)` → **#FFFFFF**
- `--foreground: hsl(210, 10%, 8%)` → **#1A1D21**
- `--border: hsl(39, 25%, 75%)` → **#CDC0B0**

#### Brand Specific Colors
- `--brand-cardboard: hsl(39, 39%, 70%)` → **#C9AF8A**
- `--brand-off-white: hsl(45, 42%, 96%)` → **#FAF8F4**
- `--brand-accent-orange: hsl(20, 100%, 63%)` → **#FF9852**
- `--brand-tape-brown: hsl(30, 32%, 39%)` → **#82654B**

### Legacy Color Tokens
From design-tokens.ts and styles.ts:
- **Cardboard**: `#D2B48C`
- **Off White**: `#F8F7F4`
- **Barcode Black**: `#1A1A1A`
- **Tape Brown**: `#7B5E3B`
- **Accent Orange**: `#FF8C42`
- **Success Green**: `#2E7D32`

## 🔤 Typography

### Font Families
- **Primary**: `Inter` (Google Fonts)
  - Weights: 300, 400, 500, 600, 700, 800, 900
  - URL: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap`
- **Monospace**: `JetBrains Mono` (Google Fonts)
  - Weights: 400, 500, 600
  - URL: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap`
- **Fallbacks**: 
  - Sans: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
  - Serif: `Georgia, Times New Roman, serif`
  - Mono: `JetBrains Mono, SF Mono, Monaco, Inconsolata, monospace`

### Typography Scale
From design-tokens.ts:
- **H1**: 28px / 34px line-height, 800 weight
- **H2**: 22px / 28px line-height, 700 weight  
- **Body**: 16px / 24px line-height, 400 weight
- **Caption**: 13px / 18px line-height, 400 weight

### CSS Font Variables
- `--font-sans: 'Inter'`
- `--font-serif: 'Georgia'`
- `--font-mono: 'JetBrains Mono'`

## 🌈 Gradients

### CSS Gradients

#### Primary Button Gradient
```css
background: linear-gradient(135deg, var(--brand-accent-orange) 0%, hsl(20, 100%, 58%) 100%);
```
**Stops**: `#FF9852` → `#FF7A29`

#### Hover Button Gradient  
```css
background: linear-gradient(135deg, var(--brand-primary-dark) 0%, hsl(20, 100%, 48%) 100%);
```
**Stops**: `#E6500C` → `#CC4700`

#### Pattern Background Gradients
```css
background-image: 
  radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.04) 0%, transparent 50%),
  radial-gradient(circle at 75% 75%, rgba(180, 83, 9, 0.03) 0%, transparent 50%),
  linear-gradient(135deg, rgba(251, 191, 36, 0.02) 0%, rgba(180, 83, 9, 0.02) 100%);
```

#### Page Background Gradients (Tailwind Classes)
- **Orange**: `from-orange-600 via-red-500 to-orange-500`
- **Sage Green**: `from-green-700 via-green-600 to-green-500`
- **Deep Blue**: `from-blue-800 via-blue-700 to-blue-600`
- **Warm Beige**: `from-amber-200 via-yellow-100 to-orange-100`
- **Charcoal**: `from-gray-800 via-gray-700 to-gray-600`

## 📐 Spacing & Radii

### Border Radius
- **Small**: `8px`
- **Medium**: `10px`, `12px` (buttons/cards)
- **Large**: `16px`
- **CSS Variable**: `--radius: 0.75rem` (12px)

### Spacing Scale (Inferred from Tailwind)
- **XS**: `4px` (p-1)
- **SM**: `8px` (p-2)  
- **MD**: `12px` (p-3)
- **LG**: `16px` (p-4)
- **XL**: `24px` (p-6)
- **2XL**: `32px` (p-8)

### Shadows
```css
/* Card Shadow */
box-shadow: 0 4px 12px rgba(0,0,0,0.08);

/* Glass Card Shadow */
box-shadow: 
  0 8px 32px 0 rgba(31, 38, 135, 0.37),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.5);

/* Button Shadow */
box-shadow: 
  0 2px 4px 0 rgba(255, 140, 66, 0.2),
  0 0 0 1px rgba(255, 140, 66, 0.1);
```

## 🧩 UI Components

### Button Variants (from design-system/Button.tsx)
- **Primary**: `bg-[#FF8C42]` with hover states
- **Secondary**: `bg-[#D2B48C]` with brown border
- **Outline**: `border-2 border-[#FF8C42]` transparent background  
- **Ghost**: `text-[#1A1A1A]` with cardboard hover

### Card Component
- **Background**: `bg-white/90` with backdrop blur
- **Border**: `border-[#D2B48C]`
- **Radius**: `rounded-[12px]`
- **Shadow**: `shadow-[0_4px_12px_rgba(0,0,0,0.1)]`

### AppBar Component
- **Background**: `bg-white/80` with backdrop blur
- **Border**: `border-b border-[#D2B48C]`
- **Height**: `h-14`

## 📱 Platform & Web Manifest

### Theme Color
- **Primary**: `#FF8C42` (set in HTML meta)

### Favicon
- **File**: `favicon.svg`
- **Format**: SVG (scalable)

### PWA Manifest
- **File**: `site.webmanifest`
- **App Name**: "ReturnIt"

---

## 🎯 Brand Guidelines

### Logo Usage
1. **Primary logo**: Use `logo-cardboard-deep.png` for maximum sophistication
2. **High contrast needed**: Use `logo-cardboard-darkest.png`
3. **Light backgrounds**: Use brown variants
4. **Dark backgrounds**: Use `logo-white.png`

### Color Usage
1. **Primary actions**: Use Accent Orange (`#EA580C`)
2. **Text hierarchy**: Primary text (`#78716C`), muted (`#A8A29E`)
3. **Backgrounds**: Beige gradient system for warmth
4. **Borders**: Cardboard brown (`#C9AF8A`) for shipping theme

### Typography
1. **Headings**: Inter 700-800 weight for impact
2. **Body text**: Inter 400 weight for readability  
3. **UI elements**: Inter 500-600 weight for clarity

### Photography Style
1. **Professional delivery/shipping imagery**
2. **5K resolution minimum for crisp display**
3. **Warm, authentic color tones**
4. **People-focused for trust and reliability**

---

*This brand pack ensures consistent visual identity across all ReturnIt touchpoints - web platform, mobile apps, and marketing materials.*
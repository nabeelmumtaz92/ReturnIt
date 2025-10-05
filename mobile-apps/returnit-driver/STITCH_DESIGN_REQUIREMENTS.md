# Stitch Design System Requirements for React Native Driver App

## Overview
This document outlines the Stitch visual pattern requirements for updating the ReturnIt driver mobile app (React Native) to match the web platform's modernized design system. The goal is to achieve cross-platform visual consistency while preserving all existing functionality and professional messaging.

## Design System Foundation

### Typography
**Primary Font:** Work Sans
- **Implementation:** Install `@expo-google-fonts/work-sans` or use React Native's custom font loading
- **Font Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Apply to:** All text elements (titles, labels, body text, buttons)

```javascript
// Example implementation
import { useFonts, WorkSans_400Regular, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';

// In styles
title: {
  fontFamily: 'WorkSans_700Bold',
  fontSize: 28,
  // ...
}
```

### Color Palette

#### Primary Colors
- **Primary Orange:** `#f99806` (replaces `#EA580C`)
- **Background Beige:** `#f8f7f5` (replaces `#FFFBEB`)
- **Card Background:** `#FFFFFF` (white, unchanged)
- **Text Dark:** `#231b0f` (replaces `#78350F`)
- **Text Medium:** `#78350f` (replaces `#B45309`)

#### Border Colors
- **Default Border:** `#e5e5e5` (replaces `#FEF3C7`)
- **Active Border:** `#f99806` (primary orange)

#### State Colors
- **Selected Background:** `rgba(249, 152, 6, 0.1)` (10% primary orange)
- **Hover/Focus:** `rgba(249, 152, 6, 0.15)` (15% primary orange)

### Border Radius System (Stitch)
- **Small (sm):** `4px` (0.25rem)
- **Medium (md):** `8px` (0.5rem)
- **Large (lg):** `16px` (1rem)
- **Extra Large (xl):** `24px` (1.5rem)
- **Round (full):** `9999px`

**Update Strategy:** Current 12px radius → 16px (lg), current 8px → 8px (md) ✅

### Shadows (React Native Implementation)

#### Stitch Card Shadow
For iOS and Android cross-platform shadows:

```javascript
// Light mode shadow
cardShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 30,
  elevation: 8, // Android
}

// Dark mode shadow (optional, uses primary color)
cardShadowDark: {
  shadowColor: '#f99806',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.15,
  shadowRadius: 30,
  elevation: 8,
}
```

## Component-Specific Requirements

### 1. CompleteDeliveryScreen Updates

#### Container & Background
```javascript
// BEFORE
container: {
  flex: 1,
  backgroundColor: '#FFFBEB',
}

// AFTER (Stitch)
container: {
  flex: 1,
  backgroundColor: '#f8f7f5', // Stitch beige
}
```

#### Order Card (Header Card)
```javascript
// BEFORE
orderCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: '#FEF3C7',
}

// AFTER (Stitch)
orderCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16, // lg radius
  padding: 16,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: '#e5e5e5', // neutral border
  // Add Stitch shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 30,
  elevation: 8,
}
```

#### Typography Updates
```javascript
// Titles
title: {
  fontFamily: 'WorkSans_700Bold',
  fontSize: 28,
  color: '#231b0f', // Stitch dark text
  marginBottom: 8,
}

// Section Titles
sectionTitle: {
  fontFamily: 'WorkSans_600SemiBold',
  fontSize: 18,
  color: '#231b0f',
  marginBottom: 8,
}

// Labels
inputLabel: {
  fontFamily: 'WorkSans_600SemiBold',
  fontSize: 14,
  color: '#231b0f',
  marginBottom: 8,
  marginTop: 12,
}
```

#### Outcome Buttons (Selection Cards)
```javascript
// BEFORE
outcomeButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#FEF3C7',
}
outcomeButtonSelected: {
  borderColor: '#EA580C',
  backgroundColor: '#FFF7ED',
}

// AFTER (Stitch)
outcomeButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 16, // lg radius
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#e5e5e5',
  // Add subtle shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
}
outcomeButtonSelected: {
  borderColor: '#f99806', // Stitch primary
  backgroundColor: 'rgba(249, 152, 6, 0.1)', // 10% tint
}
```

#### Input Fields
```javascript
// BEFORE
input: {
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#FEF3C7',
  color: '#78350F',
}

// AFTER (Stitch)
input: {
  backgroundColor: '#FFFFFF',
  borderRadius: 8, // md radius (unchanged)
  padding: 12,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#e5e5e5',
  color: '#231b0f',
  fontFamily: 'WorkSans_400Regular',
}
```

#### Primary Action Button (Complete Button)
```javascript
// BEFORE
completeButton: {
  backgroundColor: '#EA580C',
  borderRadius: 12,
  padding: 18,
  alignItems: 'center',
  marginTop: 24,
}

// AFTER (Stitch)
completeButton: {
  backgroundColor: '#f99806', // Stitch primary
  borderRadius: 16, // lg radius
  padding: 18,
  alignItems: 'center',
  marginTop: 24,
  // Add shadow for depth
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
}
completeButtonText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontFamily: 'WorkSans_600SemiBold',
}
```

#### Checkbox & Radio Components
```javascript
// Checkbox
checkbox: {
  width: 24,
  height: 24,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: '#f99806', // Stitch primary
  marginRight: 12,
  alignItems: 'center',
  justifyContent: 'center',
}
checkboxChecked: {
  backgroundColor: '#f99806',
  borderColor: '#f99806',
}

// Radio
radio: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#f99806',
  marginRight: 12,
  alignItems: 'center',
  justifyContent: 'center',
}
radioDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#f99806',
}
```

### 2. Other Driver Screens to Update

#### DriverDashboardScreen
- **Stats cards:** Apply Stitch shadow and border colors
- **Job cards:** Update to 16px radius with Stitch shadow
- **Action buttons:** Update to primary `#f99806` color

#### LiveOrderMapScreen
- **Header:** Sticky header with backdrop blur effect (use React Native's `BlurView`)
- **Map markers:** Update color to `#f99806`
- **Info cards:** Apply Stitch shadow pattern

#### PackageVerificationScreen
- **Photo grid:** Update border radius to 8px (md)
- **Camera button:** Primary `#f99806` background
- **Verification checklist:** Apply Stitch checkbox styling

#### PayoutManagementScreen
- **Earnings cards:** Apply Stitch shadow
- **Payout history cards:** 16px radius with shadow
- **Request payout button:** Primary `#f99806` with shadow

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install Work Sans font family (`@expo-google-fonts/work-sans`)
- [ ] Create `theme.js` file with Stitch color constants
- [ ] Create shadow utility functions for cross-platform shadows
- [ ] Update app-wide background color to `#f8f7f5`

### Phase 2: Component Updates
- [ ] Update CompleteDeliveryScreen with Stitch patterns
- [ ] Update DriverDashboardScreen cards and buttons
- [ ] Update LiveOrderMapScreen header and markers
- [ ] Update PackageVerificationScreen camera UI
- [ ] Update PayoutManagementScreen cards

### Phase 3: Interactive Elements
- [ ] Update all buttons to use primary `#f99806` color
- [ ] Update all checkboxes with Stitch styling
- [ ] Update all radio buttons with Stitch styling
- [ ] Update all input fields with new border colors

### Phase 4: Testing
- [ ] Visual regression testing on iOS
- [ ] Visual regression testing on Android
- [ ] Dark mode compatibility (if applicable)
- [ ] Accessibility contrast testing

## Example Theme Configuration

Create `mobile-apps/returnit-driver/theme/stitchTheme.js`:

```javascript
export const stitchColors = {
  // Primary
  primary: '#f99806',
  primaryLight: 'rgba(249, 152, 6, 0.1)',
  primaryMedium: 'rgba(249, 152, 6, 0.15)',
  
  // Background
  background: '#f8f7f5',
  cardBackground: '#FFFFFF',
  
  // Text
  textDark: '#231b0f',
  textMedium: '#78350f',
  textLight: '#a8a29e',
  
  // Borders
  border: '#e5e5e5',
  borderActive: '#f99806',
  
  // States
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const stitchRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const stitchShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const stitchTypography = {
  fontFamily: {
    regular: 'WorkSans_400Regular',
    medium: 'WorkSans_500Medium',
    semiBold: 'WorkSans_600SemiBold',
    bold: 'WorkSans_700Bold',
  },
};
```

## Cross-Platform Considerations

### Shadow Implementation
React Native shadows require different approaches for iOS and Android:
- **iOS:** Use `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android:** Use `elevation` property
- **Always include both** for consistent cross-platform shadows

### Font Loading
Use Expo's `useFonts` hook or React Native's custom font loading:
```javascript
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'WorkSans-Regular': require('./assets/fonts/WorkSans-Regular.ttf'),
    'WorkSans-SemiBold': require('./assets/fonts/WorkSans-SemiBold.ttf'),
    'WorkSans-Bold': require('./assets/fonts/WorkSans-Bold.ttf'),
  });
  
  if (!fontsLoaded) return <AppLoading />;
  // ...
}
```

### Backdrop Blur (Headers)
For sticky headers with backdrop blur:
```javascript
import { BlurView } from 'expo-blur';

<BlurView intensity={80} tint="light" style={styles.header}>
  {/* Header content */}
</BlurView>
```

## Preserved Elements

### ✅ Keep Unchanged
- All functionality and business logic
- Professional copy and messaging
- Form validation rules
- API integration endpoints
- Navigation flow and structure
- Data handling and state management

### ✅ Only Update Visual Properties
- Colors (amber → Stitch orange/beige)
- Typography (system fonts → Work Sans)
- Shadows (minimal → Stitch shadow pattern)
- Border radius (12px → 16px for cards)
- Border colors (amber → neutral gray)

## Timeline Estimate

- **Phase 1 (Foundation):** 4-6 hours
- **Phase 2 (Component Updates):** 12-16 hours
- **Phase 3 (Interactive Elements):** 6-8 hours
- **Phase 4 (Testing & QA):** 6-8 hours
- **Total:** ~30-40 hours of development time

## Notes
- This update is purely visual - no functional changes required
- All professional messaging and copy preserved
- Maintains ReturnIt's enterprise-grade brand voice
- Achieves cross-platform visual consistency with web app
- Follows Stitch design system specifications exactly

---

**Last Updated:** October 2024  
**Status:** Ready for implementation  
**Owner:** ReturnIt Development Team

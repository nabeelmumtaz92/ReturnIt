// Design Tokens - ReturnIt Design System
// Based on Figma Step-by-Step Build Guide

// 1) Colors - Figma Variables
export const colors = {
  // Brand Colors
  brand: {
    cardboard: '#D2B48C',
    offWhite: '#F8F7F4', 
    barcode: '#1A1A1A',
    tape: '#7B5E3B',
    accent: '#FF8C42',
    success: '#2E7D32'
  },
  // Semantic Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#7B5E3B',
    inverse: '#FFFFFF'
  },
  background: {
    primary: '#F8F7F4',
    surface: '#FFFFFF',
    accent: '#FF8C42'
  },
  border: {
    default: '#D2B48C',
    focus: '#FF8C42'
  }
};

// 2) Typography - Type Variables (Inter; Poppins for headlines optional)
export const typography = {
  h1: {
    fontSize: '28px',
    lineHeight: '34px', 
    fontWeight: 800,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  h2: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 700,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  body: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  caption: {
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif'
  }
};

// 3) Border Radius
export const radius = {
  card: 12,
  control: 10,
  pill: 999
};

// 4) Spacing - 8pt System
export const space = {
  4: '4px',
  8: '8px', 
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px'
};

// 5) Component Token Mappings
export const componentTokens = {
  button: {
    primary: {
      background: colors.brand.accent,
      text: colors.text.inverse,
      padding: `${space[16]} ${space[24]}`,
      borderRadius: `${radius.control}px`,
      fontWeight: 600
    },
    secondary: {
      background: colors.brand.cardboard,
      text: colors.text.primary,
      border: `1px solid ${colors.brand.tape}`,
      padding: `${space[16]} ${space[24]}`,
      borderRadius: `${radius.control}px`,
      fontWeight: 600
    },
    outline: {
      background: 'transparent',
      text: colors.brand.accent,
      border: `2px solid ${colors.brand.accent}`,
      padding: `${space[16]} ${space[24]}`,
      borderRadius: `${radius.control}px`,
      fontWeight: 600
    }
  },
  card: {
    background: colors.background.surface,
    border: `1px solid ${colors.border.default}`,
    borderRadius: `${radius.card}px`,
    padding: space[16],
    shadow: '0 2px 8px rgba(210, 180, 140, 0.2)'
  },
  input: {
    background: colors.background.surface,
    border: `1px solid ${colors.border.default}`,
    borderRadius: `${radius.control}px`,
    padding: `${space[12]} ${space[16]}`,
    fontSize: typography.body.fontSize,
    fontFamily: typography.body.fontFamily
  }
};

// 6) Status Colors (for Order Status Stepper)
export const statusColors = {
  created: {
    background: colors.brand.cardboard,
    text: colors.text.primary
  },
  assigned: {
    background: colors.brand.accent,
    text: colors.text.inverse
  },
  picked_up: {
    background: colors.brand.tape,
    text: colors.text.inverse
  },
  dropped_off: {
    background: colors.brand.success,
    text: colors.text.inverse
  },
  completed: {
    background: colors.brand.success,
    text: colors.text.inverse
  }
};

// 7) Breakpoints for Responsive Design
export const breakpoints = {
  mobile: '390px',  // iPhone 13
  tablet: '768px',
  desktop: '1024px'
};

// 8) Animation Tokens
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
  }
};
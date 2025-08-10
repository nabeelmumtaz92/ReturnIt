// Style kit for Returnly - Cardboard theme inspired by shipping/logistics
export const colors = {
  cardboard: "#D2B48C",     // Main tan color for boxes
  offWhite: "#F8F7F4",      // Light background
  barcodeBlack: "#1A1A1A",  // Text and strong contrast
  tapeBrown: "#7B5E3B",     // Secondary UI elements
  accentOrange: "#FF8C42",  // CTA buttons, highlights
  accentGreen: "#2E7D32",   // Success indicators
};

export const typography = {
  header: {
    fontSize: "1.5rem",
    fontWeight: "bold" as const,
    color: colors.barcodeBlack,
  },
  subheader: {
    fontSize: "1.125rem",
    fontWeight: "600" as const,
    color: colors.tapeBrown,
  },
  body: {
    fontSize: "1rem",
    color: colors.barcodeBlack,
  },
  muted: {
    fontSize: "0.875rem",
    color: colors.tapeBrown,
  },
};

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem", 
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  xxl: "3rem",
};

export const borderRadius = {
  sm: "0.5rem",
  md: "0.75rem", 
  lg: "1rem",
  xl: "1.25rem",
};

// Button styles matching the design system
export const buttonStyles = {
  primary: {
    backgroundColor: colors.accentOrange,
    color: "white",
    fontWeight: "600" as const,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  secondary: {
    backgroundColor: colors.cardboard,
    color: colors.barcodeBlack,
    fontWeight: "600" as const,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    border: `1px solid ${colors.tapeBrown}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  outlined: {
    backgroundColor: "transparent",
    color: colors.accentOrange,
    fontWeight: "600" as const,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    border: `2px solid ${colors.accentOrange}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

// Card styles matching the shipping aesthetic
export const cardStyles = {
  container: {
    backgroundColor: colors.offWhite,
    border: `1px solid ${colors.cardboard}`,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    boxShadow: "0 2px 8px rgba(210, 180, 140, 0.2)",
    marginBottom: spacing.md,
  },
  header: {
    ...typography.subheader,
    marginBottom: spacing.sm,
  },
  content: {
    ...typography.body,
    lineHeight: 1.5,
  },
};

// Status indicator styles
export const statusStyles = {
  created: {
    backgroundColor: colors.cardboard,
    color: colors.barcodeBlack,
  },
  assigned: {
    backgroundColor: colors.accentOrange,
    color: "white",
  },
  picked_up: {
    backgroundColor: colors.tapeBrown,
    color: colors.offWhite,
  },
  dropped_off: {
    backgroundColor: colors.accentGreen,
    color: "white",
  },
  refunded: {
    backgroundColor: colors.accentGreen,
    color: "white",
  },
};
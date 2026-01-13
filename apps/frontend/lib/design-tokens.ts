/**
 * Apple Design Tokens
 * Following macOS Sonoma + iOS 17 Human Interface Guidelines
 */

export const designTokens = {
  // Colors
  colorPrimaryBackground: "#F5F5F7",
  colorSurface: "#FFFFFF",
  colorBorder: "rgba(0,0,0,0.08)",
  colorBorderStrong: "rgba(0,0,0,0.12)",
  colorTextPrimary: "#1C1C1E",
  colorTextSecondary: "#7A7A7C",
  colorTextTertiary: "#3A3A3C",
  colorAppleBlue: "#007AFF",
  colorHover: "rgba(0,0,0,0.04)",
  colorActive: "rgba(0,0,0,0.06)",
  colorButtonHover: "#F2F2F2",
  colorButtonActive: "#E8E8E8",

  // Typography
  fontFamily: "Inter, system-ui, sans-serif",
  fontSizeTitle: "24px",
  fontSizeCardTitle: "17px",
  fontSizeBody: "14px",
  fontSizeBodyLarge: "15px",
  fontSizeSecondary: "13px",
  fontWeightTitle: 600,
  fontWeightCardTitle: 500,
  fontWeightBody: 400,

  // Spacing
  spacingSection: "32px",
  spacingSectionLarge: "40px",
  spacingCard: "24px",
  spacingCardLarge: "28px",
  spacingGrid: "20px",
  spacingGridLarge: "24px",
  spacingSidebarItem: "14px",

  // Border Radius
  radiusLarge: "16px",
  radiusMedium: "12px",
  radiusSmall: "10px",

  // Shadows
  shadowApple: "0px 8px 24px rgba(0,0,0,0.06)",
  shadowSubtle: "0px 2px 8px rgba(0,0,0,0.04)",

  // Layout
  sidebarWidth: "240px",
  sidebarWidthLarge: "260px",
} as const;


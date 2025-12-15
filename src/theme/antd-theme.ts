import { theme as antdTheme } from 'antd';

export const designTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    // shadcn/ui color palette - neutral & accessible
    colorPrimary: '#09090b',        // Nearly black, primary text
    colorPrimaryHover: '#18181b',   // Slightly lighter for hover
    colorPrimaryActive: '#09090b',  // Back to primary for active
    colorSuccess: '#22c55e',        // Green for success
    colorWarning: '#eab308',        // Amber for warning
    colorError: '#ef4444',          // Red for error
    colorInfo: '#0ea5e9',           // Sky blue for info

    // Text colors - shadcn/ui uses semantic text colors
    colorTextBase: '#09090b',       // Primary text (black)
    colorTextSecondary: '#71717a',  // Secondary text (muted gray)
    colorTextTertiary: '#a1a1aa',   // Tertiary text (lighter gray)
    colorTextPlaceholder: '#d4d4d8',// Placeholder text
    colorTextDisabled: '#d4d4d8',   // Disabled text

    // Background colors - clean whites and grays
    colorBgBase: '#ffffff',         // Base white
    colorBgContainer: '#ffffff',    // Container white
    colorBgElevated: '#fafafa',     // Slightly elevated (off-white)
    colorBgLayout: '#ffffff',       // Layout background

    // Border colors - subtle grays
    colorBorder: '#e4e4e7',         // Primary border (light gray)
    colorBorderSecondary: '#d4d4d8',// Secondary border (darker gray)

    // Typography - shadcn/ui style
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    fontSize: 14,                   // Base font size
    fontSizeHeading1: 32,           // h1
    fontSizeHeading2: 28,           // h2
    fontSizeHeading3: 24,           // h3
    fontSizeHeading4: 20,           // h4
    fontSizeHeading5: 16,           // h5
    fontSizeHeading6: 14,           // h6
    fontWeightStrong: 600,          // Bold weight
    lineHeight: 1.5715,             // Standard line height
    lineHeightHeading1: 1.2,        // Heading line height
    lineHeightHeading2: 1.35,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.5,
    lineHeightHeading5: 1.5,
    lineHeightHeading6: 1.5,
    lineHeightLG: 1.5715,           // Large line height
    lineHeightSM: 1.5,              // Small line height

    // Shadows - subtle like shadcn/ui
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    
    // Border radius
    borderRadius: 6,                // shadcn/ui uses 6px for consistency
  },
  components: {
    Button: {
      borderRadius: 6,
      colorPrimary: '#09090b',
      colorPrimaryHover: '#27272a',
      colorPrimaryActive: '#09090b',
      fontSize: 14,
      fontWeight: 500,
      controlHeight: 36,              // Reduced from 40 to 36
      lineHeight: 1.5715,
      defaultBorderColor: '#e4e4e7',
      defaultColor: '#09090b',
      paddingContentHorizontal: 20,   // Reduced from 24
      paddingXS: 6,                   // Reduced from 8
      paddingSM: 10,                  // Reduced from 12
      paddingMD: 14,                  // Reduced from 16
      controlPaddingHorizontal: 14,   // Reduced from 16
      primaryColor: '#09090b',
      controlHeightLG: 40,            // Reduced from 48
      controlHeightSM: 28,            // Reduced from 32
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      fontWeightStrong: 600,
      lineHeight: 1.5715,
      paddingBlock: 8,
      paddingInline: 12,
      colorBgContainer: '#ffffff',
      colorBorder: '#e4e4e7',
      colorBgElevated: '#fafafa',
      hoverBorderColor: '#d4d4d8',
      activeBorderColor: '#09090b',
      colorBorderHover: '#d4d4d8',
      colorTextPlaceholder: '#d4d4d8',
    },
    InputNumber: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBorder: '#e4e4e7',
      hoverBorderColor: '#d4d4d8',
      activeBorderColor: '#09090b',
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBorder: '#e4e4e7',
      colorBgElevated: '#fafafa',
      hoverBorderColor: '#d4d4d8',
    },
    Checkbox: {
      borderRadius: 4,
      fontSize: 14,
      lineHeight: 1.5715,
      colorPrimary: '#09090b',
      colorPrimaryHover: '#18181b',
      colorBorder: '#e4e4e7',
    },
    Radio: {
      borderRadius: 4,
      fontSize: 14,
      lineHeight: 1.5715,
      colorPrimary: '#09090b',
      colorPrimaryHover: '#18181b',
      colorBorder: '#e4e4e7',
    },
    Switch: {
      colorPrimary: '#22c55e',
      colorPrimaryHover: '#16a34a',
      borderRadius: 12,
      trackHeight: 24,
    },
    Card: {
      borderRadiusLG: 8,
      colorBorder: '#e4e4e7',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      boxShadowSecondary: '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      headerBg: 'transparent',
      headerFontSize: 18,
      headerFontWeight: 600,
      headerLineHeight: 1.333,       // Line height adjusted for better centering
      paddingLG: 24,
      marginXXS: 0,
    },
    Form: {
      labelFontSize: 14,
      labelFontWeight: 500,
      labelLineHeight: 1.5715,
      labelColor: '#09090b',
      itemMarginBottom: 24,
      verticalLabelPadding: 0,
    },
    Typography: {
      fontSize: 14,
      lineHeight: 1.5715,
      lineHeightHeading1: 1.2,
      lineHeightHeading2: 1.35,
      lineHeightHeading3: 1.4,
      fontWeightStrong: 600,
    },
    Message: {
      colorSuccess: '#22c55e',
      colorError: '#ef4444',
      colorWarning: '#eab308',
      colorInfo: '#0ea5e9',
      contentBg: 'transparent',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Notification: {
      colorSuccess: '#22c55e',
      colorError: '#ef4444',
      colorWarning: '#eab308',
      colorInfo: '#0ea5e9',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Modal: {
      borderRadiusLG: 8,
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      fontWeightStrong: 600,
      titleFontSize: 20,
      titleLineHeight: 1.4,
      contentBg: '#ffffff',
    },
    Tooltip: {
      borderRadius: 4,
      colorBgDefault: '#18181b',
      colorTextLightSolid: '#ffffff',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Dropdown: {
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBgElevated: '#ffffff',
      colorBorder: '#e4e4e7',
    },
    Menu: {
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBgBase: '#ffffff',
      colorItemBg: '#ffffff',
      colorItemBgHover: '#f4f4f5',
      colorItemBgSelected: '#f4f4f5',
      colorItemBgSelectedHorizontal: '#f4f4f5',
    },
    Pagination: {
      itemActiveBg: '#09090b',
      itemActiveBorderColor: '#09090b',
      itemActiveTonalBg: '#f4f4f5',
      itemLinkBg: '#ffffff',
      itemBg: '#ffffff',
      itemDisabledBgActive: '#fafafa',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Table: {
      borderColor: '#e4e4e7',
      headerBg: '#fafafa',
      headerColor: '#09090b',
      headerFontWeight: 600,
      headerFontSize: 14,
      rowHoverBg: '#fafafa',
      colorBgContainer: '#ffffff',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Spin: {
      colorPrimary: '#09090b',
      fontSize: 14,
    },
    Slider: {
      colorPrimary: '#09090b',
      colorPrimaryBorder: '#e4e4e7',
      trackBg: '#e4e4e7',
      trackBgHover: '#d4d4d8',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Progress: {
      colorPrimary: '#22c55e',
      remainingColor: '#e4e4e7',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Badge: {
      colorBgDefault: '#f4f4f5',
      colorTextLightSolid: '#09090b',
      borderRadius: 12,
      fontSize: 12,
      lineHeight: 1.5,
      fontWeightStrong: 600,
    },
    Tag: {
      borderRadiusSM: 4,
      colorBgContainer: '#f4f4f5',
      colorTextLightSolid: '#09090b',
      fontSize: 12,
      lineHeight: 1.5,
      fontWeightStrong: 600,
    },
    Divider: {
      colorBorder: '#e4e4e7',
      marginSM: 12,
      fontSize: 14,
      lineHeight: 1.5715,
    },
  },
};

import { theme as antdTheme } from 'antd';

type ThemeMode = 'light' | 'dark';

export const getTheme = (mode: ThemeMode = 'light') => {
  const isDark = mode === 'dark';
  
  return {
  algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    // shadcn/ui color palette - neutral & accessible
    colorPrimary: '#2B5797',        // Primary blue from logo
    colorPrimaryHover: '#1e3f6d',   // Darker blue for hover
    colorPrimaryActive: '#2B5797',  // Back to primary for active
    colorSuccess: '#22c55e',        // Green for success
    colorWarning: '#eab308',        // Amber for warning
    colorError: '#ef4444',          // Red for error
    colorInfo: '#0ea5e9',           // Sky blue for info

    // Text colors - shadcn/ui uses semantic text colors
    colorTextBase: isDark ? '#fafafa' : '#09090b',       // Primary text
    colorTextSecondary: isDark ? '#a1a1aa' : '#71717a',  // Secondary text
    colorTextTertiary: isDark ? '#71717a' : '#a1a1aa',   // Tertiary text
    colorTextPlaceholder: isDark ? '#666' : '#999',      // Placeholder text
    colorTextDisabled: isDark ? '#404040' : '#d4d4d8',   // Disabled text

    // Background colors
    colorBgBase: isDark ? '#141414' : '#ffffff',         // Base background
    colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',    // Container background
    colorBgElevated: isDark ? '#2a2a2a' : '#fafafa',     // Elevated background
    colorBgLayout: isDark ? '#141414' : '#ffffff',       // Layout background

    // Border colors
    colorBorder: isDark ? '#303030' : '#e4e4e7',         // Primary border
    colorBorderSecondary: isDark ? '#404040' : '#d4d4d8',// Secondary border

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

    // Shadows
    boxShadow: isDark 
      ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    
    // Border radius
    borderRadius: 6,                // shadcn/ui uses 6px for consistency
  },
  components: {
    Button: {
      borderRadius: 6,
      colorPrimary: '#2B5797',
      colorPrimaryHover: '#1e3f6d',
      colorPrimaryActive: '#2B5797',
      fontSize: 14,
      fontWeight: 500,
      controlHeight: 36,              // Reduced from 40 to 36
      lineHeight: 1.5715,
      defaultBorderColor: isDark ? '#303030' : '#e4e4e7',
      defaultColor: '#2B5797',
      paddingContentHorizontal: 20,   // Reduced from 24
      paddingXS: 6,                   // Reduced from 8
      paddingSM: 10,                  // Reduced from 12
      paddingMD: 14,                  // Reduced from 16
      controlPaddingHorizontal: 14,   // Reduced from 16
      primaryColor: '#2B5797',
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
      colorBgContainer: isDark ? '#141414' : '#ffffff',
      colorBorder: isDark ? '#303030' : '#e4e4e7',
      colorBgElevated: isDark ? '#1f1f1f' : '#fafafa',
      hoverBorderColor: isDark ? '#404040' : '#d4d4d8',
      activeBorderColor: '#2B5797',
      colorBorderHover: '#d4d4d8',
      colorTextPlaceholder: '#999',
    },
    InputNumber: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBorder: isDark ? '#303030' : '#e4e4e7',
      hoverBorderColor: isDark ? '#404040' : '#d4d4d8',
      activeBorderColor: '#2B5797',
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBorder: isDark ? '#303030' : '#e4e4e7',
      colorBgElevated: isDark ? '#1f1f1f' : '#fafafa',
      hoverBorderColor: isDark ? '#404040' : '#d4d4d8',
    },
    Checkbox: {
      borderRadius: 4,
      fontSize: 14,
      lineHeight: 1.5715,
      colorPrimary: '#2B5797',
      colorPrimaryHover: '#1e3f6d',
      colorBorder: isDark ? '#303030' : '#e4e4e7',
    },
    Radio: {
      borderRadius: 4,
      fontSize: 14,
      lineHeight: 1.5715,
      colorPrimary: '#2B5797',
      colorPrimaryHover: '#1e3f6d',
      colorBorder: isDark ? '#303030' : '#e4e4e7',
    },
    Switch: {
      colorPrimary: '#22c55e',
      colorPrimaryHover: '#16a34a',
      borderRadius: 12,
      trackHeight: 24,
    },
    Card: {
      borderRadiusLG: 8,
      colorBorder: isDark ? '#303030' : '#e4e4e7',
      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      boxShadow: isDark 
        ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      boxShadowSecondary: isDark 
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.2)'
        : '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      headerBg: isDark ? '#1f1f1f' : 'transparent',
      headerFontSize: 18,
      headerFontWeight: 600,
      headerLineHeight: 1.333,       // Line height adjusted for better centering
      headerPadding: '16px 24px',    // Reduced padding for better alignment
      paddingLG: 24,
      marginXXS: 0,
    },
    Form: {
      labelFontSize: 14,
      labelFontWeight: 500,
      labelLineHeight: 1.5715,
      labelColor: '#2B5797',
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
      colorBgMask: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)',
      fontWeightStrong: 600,
      titleFontSize: 20,
      titleLineHeight: 1.4,
      contentBg: isDark ? '#141414' : '#ffffff',
    },
    Tooltip: {
      borderRadius: 4,
      colorBgDefault: isDark ? '#1f1f1f' : '#18181b',
      colorTextLightSolid: '#ffffff',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Dropdown: {
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
      colorBorder: isDark ? '#303030' : '#e4e4e7',
    },
    Menu: {
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
      colorBgBase: isDark ? '#141414' : '#ffffff',
      colorItemBg: isDark ? '#141414' : '#ffffff',
      colorItemBgHover: isDark ? '#1f1f1f' : '#f4f4f5',
      colorItemBgSelected: isDark ? '#1f1f1f' : '#f4f4f5',
      colorItemBgSelectedHorizontal: isDark ? '#1f1f1f' : '#f4f4f5',
    },
    Pagination: {
      itemActiveBg: '#2B5797',
      itemActiveBorderColor: '#2B5797',
      itemActiveTonalBg: isDark ? '#1f1f1f' : '#f4f4f5',
      itemLinkBg: isDark ? '#141414' : '#ffffff',
      itemBg: isDark ? '#141414' : '#ffffff',
      itemDisabledBgActive: isDark ? '#0a0a0a' : '#fafafa',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Table: {
      borderColor: isDark ? '#303030' : '#e4e4e7',
      headerBg: isDark ? '#1f1f1f' : '#fafafa',
      headerColor: '#2B5797',
      headerFontWeight: 600,
      headerFontSize: 14,
      rowHoverBg: isDark ? '#1f1f1f' : '#fafafa',
      colorBgContainer: isDark ? '#141414' : '#ffffff',
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 1.5715,
    },
    Spin: {
      colorPrimary: '#2B5797',
      fontSize: 14,
    },
    Slider: {
      colorPrimary: '#2B5797',
      colorPrimaryBorder: isDark ? '#303030' : '#e4e4e7',
      trackBg: isDark ? '#303030' : '#e4e4e7',
      trackBgHover: isDark ? '#404040' : '#d4d4d8',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Progress: {
      colorPrimary: '#22c55e',
      remainingColor: isDark ? '#303030' : '#e4e4e7',
      fontSize: 12,
      lineHeight: 1.5,
    },
    Badge: {
      colorBgDefault: isDark ? '#1f1f1f' : '#f4f4f5',
      colorTextLightSolid: '#2B5797',
      borderRadius: 12,
      fontSize: 12,
      lineHeight: 1.5,
      fontWeightStrong: 600,
    },
    Tag: {
      borderRadiusSM: 4,
      colorBgContainer: isDark ? '#1f1f1f' : '#f4f4f5',
      colorTextLightSolid: '#2B5797',
      fontSize: 12,
      lineHeight: 1.5,
      fontWeightStrong: 600,
    },
    Divider: {
      colorBorder: isDark ? '#303030' : '#e4e4e7',
      marginSM: 12,
      fontSize: 14,
      lineHeight: 1.5715,
    },
  },
  };
};

// Export default light theme for backward compatibility
export const designTheme = getTheme('light');

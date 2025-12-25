import { theme } from 'antd';

// Modern shadcn/ui inspired Ant Design theme
export const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors - neutral gray for shadcn/ui style
    colorPrimary: 'hsl(0, 0%, 15%)', // #262626 - neutral dark gray
    colorPrimaryHover: 'hsl(0, 0%, 10%)', // #1a1a1a - slightly darker on hover
    colorPrimaryActive: 'hsl(0, 0%, 5%)', // #0d0d0d - darkest on active

    // Background colors - pure white
    colorBgContainer: 'hsl(0, 0%, 100%)', // #ffffff
    colorBgElevated: 'hsl(0, 0%, 98%)', // #fafafa - very subtle gray
    colorBgLayout: 'hsl(0, 0%, 100%)', // #ffffff

    // Text colors - neutral grays
    colorText: 'hsl(0, 0%, 15%)', // #262626 - neutral dark gray text
    colorTextSecondary: 'hsl(0, 0%, 45%)', // #737373 - medium gray secondary
    colorTextTertiary: 'hsl(0, 0%, 65%)', // #a6a6a6 - light gray tertiary
    colorTextPlaceholder: 'hsl(0, 0%, 75%)', // #bfbfbf - placeholder gray

    // Border colors - subtle neutral borders
    colorBorder: 'hsl(0, 0%, 90%)', // #e6e6e6 - very light neutral border
    colorBorderSecondary: 'hsl(0, 0%, 85%)', // #d9d9d9 - light neutral border

    // Fill colors
    colorFill: 'hsl(0, 0%, 100%)', // #ffffff - pure white
    colorFillSecondary: 'hsl(0, 0%, 100%)', // #ffffff - pure white
    colorFillTertiary: 'hsl(0, 0%, 100%)', // #ffffff - pure white

    // Success colors
    colorSuccess: 'hsl(142.1, 76.2%, 36.3%)', // #22c55e
    colorSuccessBg: 'hsl(142.1, 76.2%, 96.3%)', // #f0fdf4
    colorSuccessBorder: 'hsl(142.1, 76.2%, 86.3%)', // #bbf7d0

    // Warning colors
    colorWarning: 'hsl(32.5, 94.6%, 43.7%)', // #f59e0b
    colorWarningBg: 'hsl(32.5, 94.6%, 96.7%)', // #fffbeb
    colorWarningBorder: 'hsl(32.5, 94.6%, 86.7%)', // #fde68a

    // Error colors
    colorError: 'hsl(0, 84.2%, 60.2%)', // #ef4444
    colorErrorBg: 'hsl(0, 84.2%, 96.2%)', // #fef2f2
    colorErrorBorder: 'hsl(0, 84.2%, 86.2%)', // #fecaca

    // Info colors
    colorInfo: 'hsl(199.4, 89.1%, 48.2%)', // #3b82f6
    colorInfoBg: 'hsl(199.4, 89.1%, 96.2%)', // #eff6ff
    colorInfoBorder: 'hsl(199.4, 89.1%, 86.2%)', // #bfdbfe

    // Component specific colors
    colorBgSpotlight: 'hsl(222.2, 84%, 4.9%)', // #0f172a
    
    // Border radius - shadcn/ui style
    borderRadius: 8,
    borderRadiusSM: 6,
    borderRadiusLG: 12,

    // Font sizes
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,

    // Line heights
    lineHeight: 1.5714285714285714,
    lineHeightSM: 1.6666666666666667,
    lineHeightLG: 1.5,

    // Spacing
    padding: 16,
    paddingSM: 12,
    paddingLG: 24,
    
    // Box shadow - minimal shadows for shadcn/ui style
    boxShadow: 'none',
    boxShadowSecondary: 'none',
  },
  components: {
    Button: {
      // Minimal shadows for shadcn/ui
      primaryShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      dangerShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      // Neutral primary buttons
      colorPrimary: 'hsl(0, 0%, 15%)',
      colorPrimaryHover: 'hsl(0, 0%, 10%)',
      colorPrimaryActive: 'hsl(0, 0%, 5%)',
      primaryColor: 'hsl(0, 0%, 100%)',
      // Default buttons: subtle gray borders, black border on hover
      defaultBg: 'hsl(0, 0%, 100%)',
      defaultColor: 'hsl(0, 0%, 15%)',
      defaultBorderColor: 'hsl(0, 0%, 90%)',
      defaultHoverBg: 'hsl(0, 0%, 100%)',
      defaultHoverColor: 'hsl(0, 0%, 15%)',
      defaultHoverBorderColor: 'hsl(0, 0%, 15%)',
      // Border radius for shadcn/ui style
      borderRadius: 8,
    },
    Card: {
      headerBg: 'hsl(0, 0%, 100%)',
      bodyPadding: 20,
      // Minimal shadow and subtle border for shadcn/ui
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'hsl(0, 0%, 90%)',
      borderRadius: 12,
      hoverable: true,
    },
    Input: {
      // Subtle focus and hover for shadcn/ui
      activeBorderColor: 'hsl(0, 0%, 15%)',
      hoverBorderColor: 'hsl(0, 0%, 85%)',
      hoverBg: 'hsl(0, 0%, 100%)',
      borderRadius: 8,
      colorText: 'hsl(0, 0%, 15%)',
    },
    Select: {
      // Subtle focus and hover for shadcn/ui
      activeBorderColor: 'hsl(0, 0%, 15%)',
      hoverBorderColor: 'hsl(0, 0%, 85%)',
      // Minimal dropdown styling
      optionSelectedBg: 'hsl(0, 0%, 95%)',
      optionActiveBg: 'hsl(0, 0%, 93%)',
      borderRadius: 8,
      colorText: 'hsl(0, 0%, 15%)',
    },
    Modal: {
      headerBg: 'hsl(0, 0%, 100%)',
      contentBg: 'hsl(0, 0%, 100%)',
      // Thin gray border for modal
      borderColor: 'hsl(0, 0%, 90%)',
      borderWidth: 1,
    },
    // Add hover effects for other interactive components
    Menu: {
      itemHoverBg: 'hsl(0, 0%, 95%)',
      itemHoverColor: 'hsl(0, 0%, 9%)',
      itemActiveBg: 'hsl(0, 0%, 93%)',
      // Dashed border for menu separators
      dividerColor: 'hsl(0, 0%, 85%)',
      dividerStyle: 'dashed',
    },
    Dropdown: {
      colorBgElevated: 'hsl(0, 0%, 100%)',
      // Remove shadow for flat design
      boxShadow: 'none',
      // Thin gray border
      borderColor: 'hsl(0, 0%, 90%)',
      borderWidth: 1,
    },
    Tabs: {
      itemHoverColor: 'hsl(0, 0%, 9%)',
      itemActiveColor: 'hsl(0, 0%, 9%)',
      // Thin bottom border for active tab
      inkBarColor: 'hsl(0, 0%, 9%)',
      // Light gray border for tab container
      borderColor: 'hsl(0, 0%, 90%)',
    },
    Table: {
      // Thin gray borders for tables
      borderColor: 'hsl(0, 0%, 90%)',
      // Remove table shadows
      boxShadow: 'none',
    },
    Divider: {
      // Dashed divider style
      lineType: 'dashed',
      colorSplit: 'hsl(0, 0%, 85%)',
    },
  },
  };

import { theme } from 'antd';

// Modern shadcn/ui inspired Ant Design theme
export const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors - pure black for shadcn/ui style
    colorPrimary: 'hsl(0, 0%, 9%)', // #171717 - pure black
    colorPrimaryHover: 'hsl(0, 0%, 0%)', // #000000 - pure black hover
    colorPrimaryActive: 'hsl(0, 0%, 0%)', // #000000 - pure black active

    // Background colors
    colorBgContainer: 'hsl(0, 0%, 100%)', // #ffffff
    colorBgElevated: 'hsl(0, 0%, 100%)', // #ffffff
    colorBgLayout: 'hsl(0, 0%, 100%)', // #ffffff - pure white

    // Text colors - black text on white background
    colorText: 'hsl(0, 0%, 9%)', // #171717 - pure black text
    colorTextSecondary: 'hsl(0, 0%, 45%)', // #737373 - dark gray secondary
    colorTextTertiary: 'hsl(0, 0%, 55%)', // #8c8c8c - medium gray tertiary

    // Border colors - thin gray borders
    colorBorder: 'hsl(0, 0%, 90%)', // #e5e5e5 - light gray border
    colorBorderSecondary: 'hsl(0, 0%, 85%)', // #d9d9d9 - slightly darker gray

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
    
    // Border radius
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,

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
      // Remove shadows for flat design
      primaryShadow: 'none',
      dangerShadow: 'none',
      // Black primary buttons that become slightly lighter on hover
      colorPrimary: 'hsl(0, 0%, 9%)',
      colorPrimaryHover: 'hsl(0, 0%, 15%)', // Slightly lighter on hover
      colorPrimaryActive: 'hsl(0, 0%, 12%)',
      // White text on black primary buttons
      primaryColor: 'hsl(0, 0%, 100%)',
      // Default buttons: white background, gray border, black border on hover
      defaultBg: 'hsl(0, 0%, 100%)',
      defaultColor: 'hsl(0, 0%, 9%)',
      defaultBorderColor: 'hsl(0, 0%, 85%)',
      defaultHoverBg: 'hsl(0, 0%, 100%)',
      defaultHoverColor: 'hsl(0, 0%, 9%)',
      defaultHoverBorderColor: 'hsl(0, 0%, 9%)', // Black border on hover
    },
    Card: {
      headerBg: 'hsl(0, 0%, 100%)',
      bodyPadding: 24,
      // Remove shadows, add thin gray border
      boxShadow: 'none',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'hsl(0, 0%, 90%)',
      hoverable: true,
    },
    Input: {
      // Light gray focus ring for highlighted interactive components
      activeBorderColor: 'hsl(0, 0%, 70%)',
      hoverBorderColor: 'hsl(0, 0%, 80%)',
      hoverBg: 'hsl(0, 0%, 100%)',
      // Black text on white background
      colorText: 'hsl(0, 0%, 9%)',
    },
    Select: {
      // Light gray focus ring for highlighted interactive components
      activeBorderColor: 'hsl(0, 0%, 70%)',
      hoverBorderColor: 'hsl(0, 0%, 80%)',
      // Enhanced dropdown hover
      optionSelectedBg: 'hsl(0, 0%, 95%)',
      optionActiveBg: 'hsl(0, 0%, 93%)',
      // Black text
      colorText: 'hsl(0, 0%, 9%)',
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

import { theme } from 'antd';

// Modern shadcn/ui inspired Ant Design theme
export const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors - matching shadcn/ui
    colorPrimary: 'hsl(222.2, 47.4%, 11.2%)', // #111827
    colorPrimaryHover: 'hsl(222.2, 84%, 4.9%)', // #0f172a
    colorPrimaryActive: 'hsl(222.2, 47.4%, 11.2%)', // #111827

    // Background colors
    colorBgContainer: 'hsl(0, 0%, 100%)', // #ffffff
    colorBgElevated: 'hsl(0, 0%, 100%)', // #ffffff
    colorBgLayout: 'hsl(210, 40%, 96%)', // #f1f5f9

    // Text colors
    colorText: 'hsl(222.2, 84%, 4.9%)', // #0f172a
    colorTextSecondary: 'hsl(215.4, 16.3%, 46.9%)', // #64748b
    colorTextTertiary: 'hsl(215.4, 16.3%, 56.9%)', // #94a3b8

    // Border colors
    colorBorder: 'hsl(214.3, 31.8%, 91.4%)', // #e2e8f0
    colorBorderSecondary: 'hsl(214.3, 31.8%, 86.4%)', // #cbd5e1

    // Fill colors
    colorFill: 'hsl(210, 40%, 96%)', // #f1f5f9
    colorFillSecondary: 'hsl(210, 40%, 98%)', // #f8fafc
    colorFillTertiary: 'hsl(210, 40%, 97%)', // #f1f5f9

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

    // Box shadow
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    boxShadowSecondary: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      primaryShadow: '0 1px 2px 0 rgb(17 24 39 / 0.05)',
      dangerShadow: '0 1px 2px 0 rgb(239 68 68 / 0.05)',
    },
    Card: {
      headerBg: 'hsl(0, 0%, 100%)',
      bodyPadding: 24,
    },
    Input: {
      activeBorderColor: 'hsl(222.2, 47.4%, 11.2%)',
      hoverBorderColor: 'hsl(222.2, 84%, 4.9%)',
    },
    Select: {
      activeBorderColor: 'hsl(222.2, 47.4%, 11.2%)',
      hoverBorderColor: 'hsl(222.2, 84%, 4.9%)',
    },
    Modal: {
      headerBg: 'hsl(0, 0%, 100%)',
      contentBg: 'hsl(0, 0%, 100%)',
    },
  },
};

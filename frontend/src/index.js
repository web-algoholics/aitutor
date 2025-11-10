// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { store } from './app/store';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));

// === FULL DESIGN-EXACT THEME ===
const designTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    // Primary colors
    colorPrimary: '#0f172a',        // dark navy
    colorPrimaryHover: '#1e293b',   // hover
    colorPrimaryActive: '#0f172a',

    // Text
    colorTextBase: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextPlaceholder: '#94a3b8',

    // Background
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f8fafc',

    // Borders
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#cbd5e1',

    // Radius & font
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
  },

  components: {
    // BUTTON
    Button: {
      borderRadius: 8,
      colorPrimary: '#0f172a',
      colorPrimaryHover: '#1e293b',
      colorPrimaryActive: '#0f172a',
      fontWeight: 500,
    },

    // INPUT
    Input: {
      borderRadius: 8,
      hoverBorderColor: '#0f172a',
      activeBorderColor: '#0f172a',
      colorBorderHover: '#0f172a',
      paddingBlock: 10,
      paddingInline: 12,
    },

    // CARD
    Card: {
      borderRadiusLG: 12,
      colorBorder: '#e2e8f0',
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.08)',
      headerBg: 'transparent',
      headerFontSize: 18,
      headerFontWeight: 600,
    },

    // CHECKBOX
    Checkbox: {
      borderRadius: 4,
      colorPrimary: '#0f172a',
      colorPrimaryHover: '#1e293b',
    },

    // FORM
    Form: {
      labelFontSize: 14,
      labelColor: '#0f172a',
      itemMarginBottom: 20,
    },

    // MESSAGE
    Message: {
      colorSuccess: '#10b981',
      colorError: '#ef4444',
      colorWarning: '#f59e0b',
      colorInfo: '#0ea5e9',
    },
  },
};

// === HMR-SAFE RENDER ===
const render = (Component) => {
  root.render(
    <React.StrictMode>
      <ConfigProvider theme={designTheme}>
        <Provider store={store}>
          <Component />
        </Provider>
      </ConfigProvider>
    </React.StrictMode>
  );
};

// Initial render
render(App);

// HMR
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}

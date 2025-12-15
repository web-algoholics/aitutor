const pkg = require('./package')
const webpack = require('webpack')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'career-up.main': '/career-up',
    'link.career-up.auth': '/auth'
  },
  features: {
    'career-up': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    'career-up.api': '/api'
  }
}

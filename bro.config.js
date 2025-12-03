const pkg = require('./package')
const webpack = require('webpack')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            { loader: 'postcss-loader' }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000')
      })
    ]
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

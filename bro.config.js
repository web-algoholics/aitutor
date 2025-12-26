const pkg = require('./package')
const webpack = require('webpack')

// Конфигурация приложения - единственное место для изменения API URL
const appConfig = {
  'aitutor.api': 'https://bakamol.ru'
}

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        // Инжектируем конфиг в приложение из appConfig
        '__BRO_CONFIG__': JSON.stringify(appConfig),
      }),
    ],
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'aitutor.auth': '/',
    'aututor.theory': '/theory',
    'aututor.quizzes': '/quizzes',
    'aututor.anki': '/anki',
    'aututor.market-analysis': '/market-analysis',
    'aututor.profile': '/profile',
  },
  features: {
    'aitutor': {
      // add your features here in the format [featureName]: { value: string }
      theory: { value: 'true' },
      quizzes: { value: 'true' },
      anki: { value: 'true' },
      marketAnalysis: { value: 'true' },
      profile: { value: 'true' },
    },
  },
  config: appConfig
}

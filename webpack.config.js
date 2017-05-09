var webpack = require('webpack');

module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        // TODO: can we just determine this from .babelrc?
        loader: 'babel-loader',
        options: {
          presets: ['latest'],
          plugins: [
            require('babel-plugin-transform-object-rest-spread'),
            require('babel-plugin-transform-react-jsx'),
          ]
        }
      }
    }
  ]
}

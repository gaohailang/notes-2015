
you know browererify, requirejs
you see the value in:
    bundle splitting
    async loading
    packaging static assets like images and css

it can build and bundle CSS, preprocessed CSS, compile-to-JS languages and images, among other things.



### config

-p for building once for production (minification)
--watch for continuous incremental build in development
-d include source maps

loader
resolve: require files without specifying extension
plugins(feature flags): logging, internal dogfooding servers

commonChunkPlugin:
webpack can figure out what they have in common and make a shared bundle that can be cached between pages

async loading

```js
require.ensure([], function() {
    hideLoaingState();
    require('./feed').show();
});
```

```js
// webpack.config.js

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  },
  entry: { // multiple entrypoints
      Profile: './profile.js',
      Feed: './feed.js'
    },
    output: {
      path: 'build',
      filename: '[name].js' // Template based on keys in entry above
    }
  module: {
    loaders: [
        { test: /\.coffee$/, loader: 'coffee-loader' },
        {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images
      ]
  },
  plugins: [definePlugin, commonsPlugin],
  resolve: {
      extensions: ['', '.js', '.json', '.coffee'] 
    }
};
```
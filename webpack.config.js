// tslint:disable:quotemark
// tslint:disable:object-literal-sort-keys
const Encore = require('@symfony/webpack-encore');

const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackListener = require('./webpack/webpack-build-listeners');
const WebpackManifestIcons = require('./webpack/manifest.icons');
const bikeshed = require('./webpack/config/bikeshed.js');

Encore
    .setOutputPath(bikeshed.assetDir)
    .setPublicPath('/' + bikeshed.publicPath)
    .setManifestKeyPrefix(bikeshed.publicPath)

    .addEntry('app', './src/app.ts')
    .addEntry('focus', './src/focus.ts')
    .addEntry('space', './src/space.ts')
    .addEntry('editor', './src/editor.ts')

    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(bikeshed.assetVersions)
    .enableTypeScriptLoader()
    .enableForkedTypeScriptTypesChecking()
    .enableSassLoader()
    .splitEntryChunks()
    .configureSplitChunks((splitChunks) => {
        splitChunks.maxInitialRequests = 1;
    })
    .enableSingleRuntimeChunk()
    .enableIntegrityHashes(Encore.isProduction(), 'sha384')

    .addPlugin(new HtmlWebpackPlugin(require('./webpack/config/html-webpack-plugin.js')(Encore)))
    .addPlugin(new HtmlCriticalWebpackPlugin(require('./webpack/config/html-critical-webpack-plugin.js')(Encore)))
    .addPlugin(new WebappWebpackPlugin(require('./webpack/config/webapp-webpack-plugin.js')(WebpackListener.callback)))

    // Babel
    .configureBabel((babelConfig) => {
        babelConfig.plugins.push('@babel/transform-runtime');
    })
    // Manifest
    .configureManifestPlugin((manifestConfig) => { manifestConfig.map = WebpackManifestIcons.configure; })

    .copyFiles({
        from: './images',
        to: bikeshed.assetVersions ? 'images/[path][name].[hash:8].[ext]' : 'images/[path][name].[ext]',
        pattern: /\.(png|jpg|jpeg|svg)$/,
     })
;

const config = Encore.getWebpackConfig();

config.watchOptions = {
    poll: true,
    ignored: /node_modules/,
};

module.exports = config;

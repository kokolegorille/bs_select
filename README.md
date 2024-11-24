# Tester bootstrap select avec webpack

Il y a un problème pour compiler bootstrap sass

=> @import "~bootstrap/dist/css/bootstrap.css";

## Import depuis CDN

Cette config fonctionne...

```html
        <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/css/bootstrap-select.min.css">
        <!-- Latest compiled and minified JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/js/bootstrap-select.min.js"></script>
```

## Configuration webpack

Cela se resume par la configuration de webpack...

Use expose-loader if:

    You need to make modules like jQuery available globally for legacy scripts.
    Global variables are required (e.g., $ or jQuery).

Use resolve alias if:

    You want to redirect imports to a specific version or path.
    You have multiple libraries requiring different versions of a module.

Use ProvidePlugin if:

    You’re working with a modern codebase and want to avoid repetitive imports.
    You don’t want to pollute the global namespace but need common dependencies like $ or React in your modules.

Il semble que provide plugin est approprié

```js
const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin")

// Dev server
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = (_env, options) => {
    const devMode = options.mode !== 'production';

    return {
        stats: "minimal",
        optimization: {
            minimizer: [
                new TerserPlugin({}),
                new CssMinimizerPlugin({})
            ]
        },
        entry: {
            app: "./src/index.js",
        },
        devtool: devMode ? 'eval-cheap-module-source-map' : undefined,

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },

                // Load stylesheets
                {
                    test: /\.(css|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    api: "modern",
                                    // quietDeps: true,
                                }
                            }
                        }
                    ]
                },
                // Load images with the asset module, WP5
                {
                    test: /\.(ico|png|svg|jpg|jpeg|gif|svg|webp|tiff)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "./images/[hash][ext][query]"
                    }
                },
                // Load fonts with the asset module, WP5
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: "asset/resource",
                    generator: {
                        filename: "./fonts/[hash][ext][query]"
                    }
                },
            ]
        },

        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery', // Automatically provide $ globally
                jQuery: 'jquery', // Automatically provide jQuery globally
                bootstrap: 'bootstrap', // Automatically provide Bootstrap globally
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: "./static", to: path.join(__dirname, "dist") }
                ]
            }),
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: "./src/index.html",
                favicon: "./static/favicon.png",
                inject: "body",
            }),
            new MiniCssExtractPlugin({ filename: "./css/app.css" }),
        ],

        // contentBase has been deprecated in favor of static
        // https://stackoverflow.com/questions/67926476/webpack-dev-server-config-contentbase-not-working-in-latest-version
        devServer: {
            static: path.join(__dirname, "dist"),
            historyApiFallback: true,
            compress: true,
            open: true,
            // port: 8080,
        }
    }

```

## Webpack et babel

```bash
% npm start

> bs_select@1.0.0 start
> webpack serve --mode development

<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8080/, http://[::1]:8080/
<i> [webpack-dev-server] On Your Network (IPv4): http://169.254.73.28:8080/
<i> [webpack-dev-server] Content not from webpack is served from '/Users/sqrt/DATA_2024/_4AM/code/_MAC/_LAB/bs_select/dist' directory
<i> [webpack-dev-server] 404s will fallback to '/index.html'
<i> [webpack-dev-middleware] wait until bundle finished: /
4 assets
143 modules
webpack 5.96.1 compiled successfully in 1070 ms
```

## Test esbuild-loader

```bash
$ npm i -D esbuild-loader
```

Modifier la config

```js
                // UNCOMMENT to use babel-loader to compile Javascript
                // {
                //     test: /\.js$/,
                //     exclude: /node_modules/,
                //     use: {
                //         loader: "babel-loader"
                //     }
                // },

                // UNCOMMENT to use esbuild to compile JavaScript & TypeScript
                {
                    // Match `.js`, `.jsx`, `.ts` or `.tsx` files
                    test: /\.[jt]sx?$/,
                    loader: "esbuild-loader",
                    // options: {
                    //     loader: "jsx",
                    //     // JavaScript version to compile to
                    //     target: "es2015",
                    //     jsx: "automatic",
                    // }
                },
```

Ensuite on lance

```bash
% npm start

> bs_select@1.0.0 start
> webpack serve --mode development

<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8080/, http://[::1]:8080/
<i> [webpack-dev-server] On Your Network (IPv4): http://169.254.73.28:8080/
<i> [webpack-dev-server] Content not from webpack is served from '/Users/sqrt/DATA_2024/_4AM/code/_MAC/_LAB/bs_select/dist' directory
<i> [webpack-dev-server] 404s will fallback to '/index.html'
<i> [webpack-dev-middleware] wait until bundle finished: /
4 assets
143 modules
webpack 5.96.1 compiled successfully in 1043 ms
```
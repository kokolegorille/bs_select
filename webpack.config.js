const webpack = require("webpack");
const path = require("path");
// const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin")

// Dev server
const HtmlWebpackPlugin = require("html-webpack-plugin")

// const VENDOR_LIBS = [
//   "bootstrap", "jquery", "@popperjs/core",
// ];

module.exports = (_env, options) => {
    const devMode = options.mode !== 'production';

    return {
        stats: "minimal",
        optimization: {
            // https://github.com/webpack/webpack/issues/6357

            // IT IS VERY IMPORTANT!
            // THIS ALSO AVOID THE NEED TO USE OF EXPOSE_LOADER!
            // Interference when caching bootstrap with bootstrap-select!
            //   splitChunks: {
            //     cacheGroups: {
            //       vendor: {
            //         // test: /jquery|popper.js|bootstrap/,
            //         // test: /jquery|popper.js/,
            //         test: /jquery|@popperjs/,
            //         chunks: "initial",
            //         name: "vendor",
            //         enforce: true
            //       }
            //     }
            //   },
            minimizer: [
                new TerserPlugin({}),
                new CssMinimizerPlugin({})
            ]
        },
        entry: {
            // libs: VENDOR_LIBS.concat(glob.sync("./vendor/**/*.js")),
            app: "./src/index.js",
        },
        devtool: devMode ? 'eval-cheap-module-source-map' : undefined,

        module: {
            rules: [
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

                // // Expose loader v1.x new syntax
                // {
                //     test: require.resolve('jquery'),
                //     loader: 'expose-loader',
                //     options: {
                //         exposes: ['$', 'jQuery']
                //     }
                // },

                // {
                //     test: require.resolve('bootstrap'),
                //     loader: 'expose-loader',
                //     options: {
                //       exposes: ['bootstrap'], // Expose Bootstrap globally
                //     },
                //   },

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

        // resolve: {
        //     alias: {
        //       jquery: require.resolve('jquery'), // Resolve to the installed jQuery version
        //     },
        //   },

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
}
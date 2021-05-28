const path = require('path');
const fs = require('fs');
const performance = require('perf_hooks').performance;
const ExtWebpackPlugin = require('@sencha/ext-webpack-plugin');
const portfinder = require('portfinder');
const terser = require('terser');
const htmlTerser = require('html-minifier-terser');
const version = require('./package.json').version;
const csso = require('csso');

module.exports = async function (env) {

  // Utility function for retrieving environment variables
  function get(it, val) {if(env == undefined) {return val} else if(env[it] == undefined) {return val} else {return env[it]}}

  const rules = [
    { test: /.(js)$/, use: ['babel-loader'] }
  ]
  const resolve = {}
  const host = '0.0.0.0'
  const stats = 'none'

  var framework     = get('framework',     'extjs')
  var contextFolder = get('contextFolder', './')
  var entryFile     = get('entryFile',     './index.js')
  var outputFolder  = get('outputFolder',  './')
  var toolkit       = get('toolkit',       'modern')
  var theme         = get('theme',         'theme-material')
  var packages      = get('packages',      ['treegrid'])
  var script        = get('script',        '')
  var emit          = get('emit',          'yes')
  var profile       = get('profile',       '')
  var environment   = get('environment',   'development')
  var treeshake     = get('treeshake',     'no')
  var browser       = get('browser',       'yes')
  var watch         = get('watch',         'yes')
  var verbose       = get('verbose',       'no')
  var cmdopts       = get('cmdopts',     [])
  var isProd      = false

  if (environment === 'production' ||
        (cmdopts.includes('--production') ||
         cmdopts.includes('--environment=production') ||
         cmdopts.includes('-e=production') ||
         cmdopts.includes('-pr'))
      )
  {
    watch = 'no'
    isProd = true
    browser = 'no'
  }

  // The build.xml Sencha Cmd plugin uses a regex to locate the webpack bundle for use in app.json to be included in
  // the different build environments. For development builds, the file is served in memory.
  // For production builds, the hashed file name is stored as an ant property and added to the build via app.json.
  const bundleFormat = isProd ? "[name].[hash].js" : "[name].js";

  // Using Live Reload with a root context directory, necessary for Sencha Cmd, requires these folders be ignored
  const ignoreFolders = [path.resolve(__dirname, './generatedFiles'), path.resolve(__dirname, './build')]

  portfinder.basePort = get('port', 8080);
  return portfinder.getPortPromise().then(port => {
    const plugins = [
      new ExtWebpackPlugin({
        framework: framework,
        toolkit: toolkit,
        theme: theme,
        packages: packages,
        script: script,
        emit: emit,
        port: port,
        profile: profile,
        environment: environment,
        treeshake: treeshake,
        browser: browser,
        watch: watch,
        verbose: verbose,
        cmdopts: cmdopts
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('font.patcher', (compilation) => {
            console.log('  > Running font patcher plugin ...');
            const startTime = performance.now();

            try {
              /* Identify css files that need to be searched / patched */
              const mode = compilation.compilation.options.mode;
              const cssPath = path.resolve(__dirname, mode === 'production' ? 'dist' : path.resolve('build', 'development', 'Awddy'), 'resources');
              const filesToPatch = fs.readdirSync(cssPath)
                                     .filter(file => file.startsWith('Awddy-all') && file.endsWith('.css'))
                                     .map(file => path.resolve(cssPath, file));

              /* Search in files and do the patching */
              const fontFaceRegex = /@font-face[\s]*{[^}]*}/gi;
              filesToPatch.forEach(file => {
                /* Read file */
                let content = fs.readFileSync(file, { encoding: 'utf8' }),
                    result = content,
                    regexResult;
                /* Search for font faces in css */
                while (regexResult = fontFaceRegex.exec(content)) {
                  if (regexResult[0].includes('font-awesome') || !regexResult[0].includes('woff')) {
                    result = result.replace(regexResult[0], '');
                  }
                }
                /* Write patched content if changed */
                if (content.length !== result.length) {
                  fs.writeFileSync(file, result, { encoding: 'utf8' });
                }
              });

              /* Delete font folders / files */
              const fontRobotoPath = path.resolve(cssPath, 'fonts', 'roboto');
              if (fs.existsSync(fontRobotoPath)) {
                fs.rmdirSync(fontRobotoPath, { recursive: true });
              }
              const fontAwesomePath = path.resolve(cssPath, 'font-awesome');
              if (fs.existsSync(fontAwesomePath)) {
                fs.rmdirSync(fontAwesomePath, { recursive: true });
              }
              const fontExtPath = path.resolve(cssPath, 'font-ext');
              if (fs.existsSync(fontExtPath)) {
                fs.rmdirSync(fontExtPath, { recursive: true });
              }

              console.log(`    Success in ${(performance.now() - startTime).toFixed(0)}ms !`);
            } catch (err) {
              console.error(` !  Plugin error encountered: ${err.message}${err.stack}`);
            }
          });
        }
      }, {
        apply: (compiler) => {
          compiler.hooks.done.tap('preload.patcher', async (compilation) => {
            const mode = compilation.compilation.options.mode;

            if (mode === 'production') {
              console.log('  > Running preload patcher plugin ...');
              const startTime = performance.now();

              try {
                const versionSuffix = '_' + version.replace(/\./g, '_'),
                      newAppJsFilename = `app${versionSuffix}.js`,
                      newCss1Filename = `Awddy-all_1${versionSuffix}.css`,
                      newCss2Filename = `Awddy-all_2${versionSuffix}.css`,
                      additionalPreloads = `
<link rel="preload" href="${newAppJsFilename}" as="script" type="text/javascript">
<link rel="preload" href="resources/${newCss1Filename}" as="style" type="text/css">
<link rel="preload" href="resources/${newCss2Filename}" as="style" type="text/css">`,
                      preloadRegex = /<!-- Start-Preloads -->([. \r\na-z<>!\-="/0-9]*)<!-- End-Preloads -->/igm,
                      indexHtmlFilename = path.resolve(__dirname, 'dist', 'index.html'),
                      indexHtmlContent = fs.readFileSync(indexHtmlFilename, { encoding: 'utf8' }),
                      appJsFilename = path.resolve(__dirname, 'dist', 'app.js'),
                      appJsContent = fs.readFileSync(appJsFilename, { encoding: 'utf8' }),
                      css1Filename = path.resolve(__dirname, 'dist', 'resources', 'Awddy-all_1.css'),
                      css1Content = fs.readFileSync(css1Filename, { encoding: 'utf8' }),
                      css2Filename = path.resolve(__dirname, 'dist', 'resources', 'Awddy-all_2.css'),
                      css2Content = fs.readFileSync(css2Filename, { encoding: 'utf8' }),
                      desktopJsonFilename = path.resolve(__dirname, 'dist', 'desktop.json'),
                      desktopJsonContent = fs.readFileSync(desktopJsonFilename, { encoding: 'utf8' }),
                      desktopJsonPFilename = path.resolve(__dirname, 'dist', 'desktop.jsonp'),
                      desktopJsonPContent = fs.readFileSync(desktopJsonPFilename, { encoding: 'utf8' }),
                      result = preloadRegex.exec(indexHtmlContent),
                      indexHtmlContentPatched = htmlTerser.minify(indexHtmlContent
                          .replace(
                              result[0],
                              additionalPreloads + result[1].replace(/build\/development\/Awddy\/resources/gi, 'resources')), {
                              html5: true,
                              removeAttributeQuotes: true,
                              minifyCSS: true,
                              minifyJS: true,
                              minifyURLs: true,
                              removeComments: true,
                              removeEmptyAttributes: true,
                              removeEmptyElements: true,
                              removeOptionalTags: true,
                              removeRedundantAttributes: true,
                              removeTagWhitespace: true,
                              collapseWhitespace: true,
                      }),
                      appJsContentCompressed = (await terser.minify(appJsContent, { mangle: true, compress: true })).code,
                      css1ContentCompressed = csso.minify(css1Content, { restructure: false, comments: false, }).css,
                      css2ContentCompressed = csso.minify(css2Content, { restructure: false, comments: false, }).css,
                      desktopJsonContentPatched = desktopJsonContent
                          .replace('app.js', newAppJsFilename)
                          .replace('Awddy-all_1.css', newCss1Filename)
                          .replace('Awddy-all_2.css', newCss2Filename),
                      desktopJsonPContentPatched = desktopJsonPContent
                          .replace('app.js', newAppJsFilename)
                          .replace('Awddy-all_1.css', newCss1Filename)
                          .replace('Awddy-all_2.css', newCss2Filename);
                fs.writeFileSync(indexHtmlFilename, indexHtmlContentPatched, { encoding: 'utf8' });
                fs.writeFileSync(appJsFilename, appJsContentCompressed, { encoding: 'utf8' });
                fs.writeFileSync(css1Filename, css1ContentCompressed, { encoding: 'utf8' });
                fs.writeFileSync(css2Filename, css2ContentCompressed, { encoding: 'utf8' });
                fs.writeFileSync(desktopJsonFilename, desktopJsonContentPatched, { encoding: 'utf8' });
                fs.writeFileSync(desktopJsonPFilename, desktopJsonPContentPatched, { encoding: 'utf8' });

                /* Rename compiled files according to version */
                const appJsPath = path.resolve(__dirname, 'dist');
                fs.renameSync(path.resolve(appJsPath, 'app.js'), path.resolve(appJsPath, newAppJsFilename));
                const resourcesPath = path.resolve(__dirname, 'dist', 'resources');
                fs.renameSync(path.resolve(resourcesPath, 'Awddy-all_1.css'), path.resolve(resourcesPath, newCss1Filename));
                fs.renameSync(path.resolve(resourcesPath, 'Awddy-all_2.css'), path.resolve(resourcesPath, newCss2Filename));

                /* Delete not required folders */
                const archivePath = path.resolve(__dirname, 'dist', 'archive');
                if (fs.existsSync(archivePath)) {
                  fs.rmdirSync(archivePath, { recursive: true });
                }
                const desktopPath = path.resolve(__dirname, 'dist', 'desktop');
                if (fs.existsSync(desktopPath)) {
                  fs.rmdirSync(desktopPath, { recursive: true });
                }
                const imagesPath = path.resolve(__dirname, 'dist', 'resources', 'images');
                if (fs.existsSync(imagesPath)) {
                  fs.rmdirSync(imagesPath, { recursive: true });
                }
                const readmePath = path.resolve(__dirname, 'dist', 'resources', 'Readme.md');
                if (fs.existsSync(readmePath)) {
                  fs.rmSync(readmePath);
                }

                console.log(`    Success in ${(performance.now() - startTime).toFixed(0)}ms !`);
              } catch (err) {
                console.error(` !  Plugin error encountered: ${err.message}${err.stack}`);
              }
            }
          });
        }
      }
    ]
    return {
      mode: environment,
      devtool: (environment === 'development') ? 'inline-source-map' : false,
      context: path.join(__dirname, contextFolder),
      entry: entryFile,
      output: {
        path: path.join(__dirname, outputFolder),
        filename: bundleFormat
      },
      plugins: plugins,
      module: {
        rules: rules
      },
      resolve: resolve,
      performance: { hints: false },
      stats: 'none',
      optimization: { noEmitOnErrors: true },
      node: false,
      devServer: {
        watchOptions: {
          ignored: ignoreFolders
        },
        contentBase: [path.resolve(__dirname, outputFolder)],
        watchContentBase: !isProd,
        liveReload: !isProd,
        historyApiFallback: !isProd,
        host: host,
        port: port,
        disableHostCheck: isProd,
        compress: isProd,
        inline: !isProd,
        stats: stats
      }
    }
  })
}

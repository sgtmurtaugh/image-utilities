'use strict';

import gulp     from 'gulp';
import plugins  from 'gulp-load-plugins';
import fs       from 'fs';
import path     from 'path';
import mkdirp   from 'make-dir';
//import yargs    from 'yargs';
// TODO: YAML wieder aktivieren, da die YAML config self references und nested values verwenden kann
//import yaml     from 'js-yaml';
import nsg      from 'node-sprite-generator';
import promise  from 'es6-promise';
import rimraf   from 'rimraf';
import typechecks from '@sgtmurtaugh/typechecks';
import glob     from 'glob';
//import svgSpritesheet from '@mariusgundersen/gulp-svg-spritesheet';
import log from 'fancy-log';

const resizeImage   = require('resize-img');

// Promise Definition for Tasks without Streams or existing Promises
const Promise = promise.Promise;

// Load all Gulp plugins into one variable
const $ = plugins();

// Load settings from settings.yml
// const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();
const config = loadConfig();



/* ==================================================================================================================
 *  # Paths
 * ================================================================================================================== */

let srcResizeimgPath = path.join(config.paths.src, config.paths.images, config.paths.resizeimg);
let srcImageSpritePath = path.join(config.paths.src, config.paths.images, config.paths.sprite);
let srcSvgSpritePath = path.join(config.paths.src, config.paths.svg, config.paths.sprite);

let tmplSvgSpritePath = path.join(config.paths.src, config.paths.templates, config.paths.svgsprite);

let targetResizeimgPath = path.join(config.paths.build, config.paths.resizeimg);
let targetNsgPath = path.join(config.paths.build, config.paths.nsg);
let targetSvgspritePath = path.join(config.paths.build, config.paths.svgsprite);


/* ==================================================================================================================
 *  # Functions
 * ================================================================================================================== */

/* ------------------------------
 *  ## Helper Functions
 * ------------------------------ */

/**
 * Load the JSON Config
 */
function loadConfig() {
    // let ymlFile = fs.readFileSync('config.yml', 'utf8');
    // return yaml.load(ymlFile);

    let configFile = fs.readFileSync('config.json', 'utf-8');
    return JSON.parse(configFile);
}

/**
 * Creates the given directy if it not exists.
 * @param dir
 */
function ensureFolder(dir) {
    let bSuccess = false;
    if (!typechecks.isEmpty(dir)) {
        if ( !dir.startsWith( __dirname ) ) {
            dir = path.join(__dirname, dir);
        }

        if ( !(bSuccess = fs.existsSync(dir)) ) {
            const path = mkdirp.sync( dir );
            if ( typechecks.isNotEmpty(path) ) {
                bSuccess = true;
            }
        }
    }
    return bSuccess;
}

/* ------------------------------
 *  ## Build Functions
 * ------------------------------ */

/**
 * taskCleanBuild
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuild(cb) {
    rimraf.sync(config.paths.build);
    cb();
}

/**
 * taskCleanBuildNsgSprite
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuildNsgSprite(cb) {
    rimraf.sync(targetNsgPath);
    cb();
}

/**
 * taskCleanBuildResizeimgImages
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuildResizeimgImages(cb) {
    rimraf.sync(targetResizeimgPath);
    cb();
}

/**
 * taskCleanBuildSvgspriteSprite
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuildSvgspriteSprite(cb) {
    rimraf.sync(targetSvgspritePath);
    cb();
}

/* ------------------------------
 *  ## resizeimg
 * ------------------------------ */

/**
 * taskGenerateResizeimgImages
 * @param cb
 */
function taskGenerateResizeimgImages(cb) {
    let srcImages = path.join(srcResizeimgPath, '**', '{*.bmp,*.jpg,*.jpeg,*.png}');
    let files = glob.sync(
        srcImages,
        {
            "absolute": true,
            "ignore": ['**/*.ignore/**']
        }
    );

    for (let file of files) {
        log(`file: ${file}`);

        if (typechecks.isNotEmpty(file)) {
            let indexRelativPath = file.indexOf(srcResizeimgPath);
            log(`indexRelativPath: ${indexRelativPath}`);

            if (indexRelativPath > -1) {
                let absolutPathPrefix = "";
                if (indexRelativPath > 0) {
                    absolutPathPrefix = file.substring(0, indexRelativPath);
                }
                log(`absolutPathPrefix: ${absolutPathPrefix}`);

                if (file.length > indexRelativPath) {
                    let filename = file.substring(indexRelativPath + srcResizeimgPath.length);
                    log(`filename: ${filename}`);

                    for( let dimensionKey in config.resizeimg.sizes ) {
                        let indexExtension = filename.lastIndexOf('.');

                        if (indexExtension > -1) {
                            if (config.resizeimg.sizes.hasOwnProperty(dimensionKey)) {
                                let dimension = config.resizeimg.sizes[dimensionKey];

                                if (typechecks.isNotEmpty(dimension)) {
                                    // check configured height / widht
                                    let resizeimgOptions = {};
                                    let bHasWidth = typechecks.isNumeric(dimension.width);
                                    let bHasHeight = typechecks.isNumeric(dimension.height);

                                    if (!bHasWidth && !bHasHeight) {
                                        log.warn(`size '${dimensionKey}' has no height and width!`);
                                        continue;
                                    }

                                    // set auto dimension for missing config
                                    if (!bHasWidth) {
                                        // dimension.width = -1;
                                        dimension.width = "auto";
                                    }
                                    if (!bHasHeight) {
                                        // dimension.height = -1;
                                        dimension.height = "auto";
                                    }


                                    // create targetFolder
                                    let bCreateFolders = typechecks.isBoolean(config.resizeimg.createFolders) ? config.resizeimg.createFolders : false;

                                    let targetPath = path.join(absolutPathPrefix, targetResizeimgPath);
                                    let subFolder = "";

                                    // SubFolder check
                                    let subFoldersEndIndex = filename.lastIndexOf(path.sep) + 1;
                                    if (subFoldersEndIndex > -1) {
                                        subFolder = filename.substring(0, subFoldersEndIndex);
                                    }

                                    targetPath = path.join(targetPath, subFolder);
                                    if (bCreateFolders) {
                                        targetPath = path.join(targetPath, dimensionKey);
                                    }
                                    log(`targetPath: ${targetPath}`);
                                    ensureFolder(targetPath);


                                    // create Filename
                                    let targetFilename = config.resizeimg.prefix || "";

                                    if (subFoldersEndIndex > -1) {
                                        targetFilename += filename.substring(subFoldersEndIndex, indexExtension);
                                    }
                                    else {
                                        targetFilename += filename.substring(0, indexExtension);
                                    }

                                    if (!bCreateFolders) {
                                        targetFilename += '_';
                                        targetFilename += dimensionKey;
                                    }

                                    if (typechecks.isNotEmpty(config.resizeimg.suffix)) {
                                        targetFilename += config.resizeimg.suffix;
                                    }

                                    targetFilename += filename.substring(indexExtension);
                                    log(`targetFilename: ${targetFilename}`);

                                    let targetFile = path.join(targetPath, targetFilename);
                                    log(`targetFile: ${targetFile}`);


                                    // create resizeimg options
                                    if (typechecks.isNumeric(dimension.width)) {
                                        resizeimgOptions['width'] = dimension.width;
                                    }
                                    if (typechecks.isNumeric(dimension.height)) {
                                        resizeimgOptions['height'] = dimension.height;
                                    }


                                    // generate resized images
                                    resizeImage(fs.readFileSync(file), resizeimgOptions).then(buf => {
                                        fs.writeFileSync(targetFile, buf);
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    cb();
}


/* ------------------------------
 *  ## node-sprite-generator (nsg)
 * ------------------------------ */

/**
 * Task-Function
 * TODO
 */
function taskGenerateNsgSprite(cb) {
    return generateNsgSprite(true, cb);
}

/**
 * Task-Function
 * Determines all sprite folders inside the sprite-src folder and
 * runs the generateSprite function on each of them.
 */
function taskGenerateNsgSprites(cb) {
    return generateNsgSprite(false, cb);
}

/**
 * TODO
 * Determines all sprite folders inside the sprite-src folder and
 * runs the generateSprite function on each of them.
 */
function generateNsgSprite(flagSingleFileSprite, cb) {
    flagSingleFileSprite = typechecks.isBoolean(flagSingleFileSprite) ? flagSingleFileSprite : true;

    let spriteSources = glob.sync(path.join(srcImageSpritePath, '*'), {
        "ignore": ['**/*.ignore']

    })
    .filter(function (spriteSource) {
        if (fs.statSync(spriteSource).isFile()) {
            log.warn(`no parent sprite-folder definied. file '${spriteSource}' will be ignored! move image to a new/existing parent and restart the generate task.`);
            return false;
        }

        // remain only folder with images (png, jpeg, pjg
        let globImages = glob.sync( path.join(spriteSource, '**/*.{png,jpg,jpeg}' ));
        return (globImages.length >= 1);

    });


    const SPRITENAME_ALL_SPRITE = 'all-sprite';
    let spriteNames = [];
    let spriteImages = {};


    // determine individual sprite name and imageSources for determined sprite sources
    spriteSources.forEach( function(spriteSource, index) {
        let spriteSourceFolderName;
        if (!flagSingleFileSprite) {
            spriteSourceFolderName = spriteSource;
            let lastFolderIndex = spriteSource.lastIndexOf('/') + 1;
            if ( spriteSourceFolderName.length > lastFolderIndex ) {
                spriteSourceFolderName = spriteSource.substring(lastFolderIndex);
            }
        }
        else {
            spriteSourceFolderName = SPRITENAME_ALL_SPRITE;
        }

        // add current spriteSourceFolderName to spriteNames
        spriteNames.push(spriteSourceFolderName);

        if ( typechecks.isUndefined(spriteImages[spriteSourceFolderName])) {
            spriteImages[spriteSourceFolderName] = [];
        }

        // add specific sprite sources
        spriteImages[spriteSourceFolderName].push( path.join( spriteSource, '**/*.{png,jpg,jpeg}' ) );
    });

    // start nsg execution with flag depended sprite sources
    if ( typechecks.isNotEmpty(spriteImages) ) {
        if ( flagSingleFileSprite ) {
            return executeNsg( spriteNames[0], spriteImages[spriteNames[0]] );
        }
        else {
            spriteSources.forEach( async function ( spriteSource, index ) {
                return await executeNsg( spriteNames[index], spriteImages[spriteNames[index]] );
            } );
        }
    }
    cb();
}

/**
 * Creates and runs the Node-Sprite-Generator on the given folder.
 * Only PNG files will be used for the sprite. The output is a sprite PNG and a
 * SASS source file with all containing image informations.
 * @param spriteName
 * @param spriteSources
 * @returns {*}
 */
function executeNsg(spriteName, spriteSources) {
    return new Promise(function(resolve, reject) {
        log(`Start generating sprite for '${spriteName}'.`);

        let prefix = config.nsg.prefix || '';
        let suffix = config.nsg.suffix || '';

        let spriteExtension = config.nsg.spriteExtension || '.png';
        let spriteFilename = `${prefix}${spriteName}${suffix}${spriteExtension}`;
        let spritePath = path.join(targetNsgPath, config.paths.sprite, spriteFilename);

        let stylesheet = config.nsg.stylesheet || 'scss';
        let stylesheetExtension = config.nsg.stylesheetExtension || '.scss';
        let stylesheetFilename =`_${prefix}${spriteName}${suffix}${stylesheetExtension}`;
        let stylesheetPath = path.join(targetNsgPath, config.paths.stylesheet, stylesheetFilename);
        let stylesheetPrefix = `${prefix}${spriteName}${suffix}-`;
        let stylesheetSpriteUrl = path.join(config.paths.src, config.paths.assets, config.paths.media, config.paths.images, config.paths.sprite, spriteFilename);

        let pixelRatio = typechecks.isNumeric(config.nsg.pixelRatio) ? config.nsg.pixelRatio : 1;
        let compositor = config.nsg.compositor || 'jimp';
        let layout = config.nsg.layout || 'packed';

        const nsgConfig = {
            spritePath: spritePath,
            src: spriteSources,
            stylesheet: stylesheet,
            stylesheetPath: stylesheetPath,
            stylesheetOptions: {
                prefix: stylesheetPrefix,
                pixelRatio: pixelRatio,
                spritePath: stylesheetSpriteUrl
            },
            compositor: compositor,
            layout: layout,
            layoutOptions: {
                padding: 30
            }
        };

        nsg( nsgConfig, function (err) {
            if (err) {
                log.error(err);
                reject(err);
            }
            else {
                log(`Sprite for '${spriteName}' generated!`);
                resolve();
            }
        });
    });
}


/* ------------------------------
 *  ## SVG-Sprite
 * ------------------------------ */

/**
 * taskGenerateSvgSpriteSprite
 * @returns {*}
 */
function taskGenerateSvgSpriteSprite() {
    const svgSpriteConfiguration = _setupSvgSpriteConfiguration();
//    log(svgSpriteConfiguration);

    let srcSvgs = path.join(srcSvgSpritePath, '**', '*.svg');



    const prefix = config.svgsprite.prefix || ''
    const suffix = config.svgsprite.suffix || ''
    const layout = config.svgsprite.layout || 'horizontal';
    const dimensions = config.svgsprite.dimensions || '--dimensions';
    const filename = prefix + ( config.svgsprite.name || 'svg-sprite' ) + suffix;

    let oldConfig = {
        dest: './', // Main output directory
        log: 'verbose',   // {info|debug|verbose|''|false|null}

        shape: {
            id: { // SVG shape ID related options
                separator: '__', // Separator for directory name traversal
                _generator: function() { /*...*/ }, // SVG shape ID generator callback
                pseudo: '~', // File name separator for shape states (e.g. ':hover')
                whitespace: '_' // Whitespace replacement for shape IDs
            },
            dimension: { // Dimension related options
                maxWidth: 2000, // Max. shape width
                maxHeight: 2000, // Max. shape height
                precision: 2, // Floating point precision
                attributes: false, // Width and height attributes on embedded shapes
            },
            spacing: { // Spacing related options
                padding: 0, // Padding around all shapes
                box: 'content' // Padding strategy (similar to CSS `box-sizing`) {content|icon|padding}
            },
            transform: ['svgo'], // List of transformations / optimizations
            _sort: function() { /*...*/ }, // SVG shape sorting callback
            meta: null, // Path to YAML file with meta / accessibility data
            align: null, // Path to YAML file with extended alignment data
            dest: '' // Output directory for optimized intermediate SVG shapes
        },

        mode: { // {css|view|defs|symbol|stack}
            css: {
                sprite: `${filename}.css.svg`,
                bust: false,
                layout: layout, //  {vertical|horizontal|diagonal|packed}
                prefix: `.${filename}--%s`,
                dimensions: dimensions,
                common: `${filename}`,
                mixin: `${filename}`,
                render: {
                    css: {
                        dest: path.join('css', `${filename}.css.css`),
                        template: path.join(tmplSvgSpritePath, 'css', 'sprite.css')
                    },
                    scss: {
                        dest: path.join('scss', `_${filename}.css.scss`),
                        template: path.join(tmplSvgSpritePath, 'css', 'sprite.scss')
                    },
                    less: {
                        dest: path.join('less', `_${filename}.css.less`),
                        template: path.join(tmplSvgSpritePath, 'css', 'sprite.less')
                    },
                    styl: {
                        dest: path.join('styl', `${filename}.css.styl`),
                        template: path.join(tmplSvgSpritePath, 'css', 'sprite.styl')
                    }
                },
                example: {
                    dest: `${filename}-example.css.html`,
                    template: path.join(tmplSvgSpritePath, 'css', 'sprite.html')
                }
            },

            view: {
                sprite: `${filename}.view.svg`,
                bust: false,
                layout: layout,
                prefix: `.${filename}--%s`,
                dimensions: dimensions,
                common: `${filename}`,
                mixin: `${filename}`,
                render: {
                    css: {
                        dest: path.join('css', `${filename}.view.css`)
                    },
                    scss: {
                        dest: path.join('scss', `_${filename}.view.scss`)
                    },
                    less: {
                        dest: path.join('less', `_${filename}.view.less`)
                    },
                    styl: {
                        dest: path.join('styl', `${filename}.view.styl`)
                    }
                },
                example: {
                    dest: `${filename}-example.view.html`,
                    template: path.join(tmplSvgSpritePath, 'view', 'sprite.html')
                }
            },

            defs: {
                sprite: `${filename}.defs.svg`,
                bust: false,
                prefix: `.${filename}--%s`,
                dimensions: dimensions,
                inline: false,
                render: {
                    css: {
                        dest: path.join('css', `${filename}.defs.css`)
                    },
                    scss: {
                        dest: path.join('scss', `_${filename}.defs.scss`)
                    },
                    less: {
                        dest: path.join('less', `_${filename}.defs.less`)
                    },
                    styl: {
                        dest: path.join('styl', `${filename}.defs.styl`)
                    }
                },
                example: {
                    dest: `${filename}-example.defs.html`,
                    template: path.join(tmplSvgSpritePath, 'defs', 'sprite.html')
                }
            },

            symbol: {
                sprite: `${filename}.symbol.svg`,
                bust: false,
                prefix: `.${filename}--%s`,
                dimensions: dimensions,
                inline: false,
                render: {
                    css: {
                        dest: path.join('css', `${filename}.symbol.css`)
                    },
                    scss: {
                        dest: path.join('scss', `_${filename}.symbol.scss`)
                    },
                    less: {
                        dest: path.join('less', `_${filename}.symbol.less`)
                    },
                    styl: {
                        dest: path.join('styl', `${filename}.symbol.styl`)
                    }
                },
                example: {
                    dest: `${filename}-example.symbol.html`,
                    template: path.join(tmplSvgSpritePath, 'symbol', 'sprite.html')
                }
            },

            stack: {
                sprite: `${filename}.stack.svg`,
                bust: false,
                prefix: `.${filename}--%s`,
                dimensions: dimensions,
                render: {
                    css: {
                        dest: path.join('css', `${filename}.stack.css`)
                    },
                    scss: {
                        dest: path.join('scss', `_${filename}.stack.scss`)
                    },
                    less: {
                        dest: path.join('less', `_${filename}.stack.less`)
                    },
                    styl: {
                        dest: path.join('styl', `${filename}.stack.styl`)
                    }
                },
                example: {
                    dest: `${filename}-example.stack.html`,
                    template: path.join(tmplSvgSpritePath, 'stack', 'sprite.html')
                }
            }
        }
    };

    return gulp.src(srcSvgs, {
        "ignore": ['**/*.ignore/**']
    })
    .pipe($.svgSprite(svgSpriteConfiguration))
    .pipe(gulp.dest(targetSvgspritePath));
}

/**
 *
 * @returns {{log: string, dest: string}}
 * @private
 */
function _setupSvgSpriteConfiguration() {
    let svgSpriteConfigration = {
        dest: './', // Main output directory
        log: 'verbose'   // {info|debug|verbose|''|false|null}
    };

    // shape
    svgSpriteConfigration['shape'] = {
        id: { // SVG shape ID related options
            separator: '__', // Separator for directory name traversal
            _generator: function() { /*...*/ }, // SVG shape ID generator callback
            pseudo: '~', // File name separator for shape states (e.g. ':hover')
            whitespace: '_' // Whitespace replacement for shape IDs
        },
        dimension: { // Dimension related options
            maxWidth: 2000, // Max. shape width
            maxHeight: 2000, // Max. shape height
            precision: 2, // Floating point precision
            attributes: false, // Width and height attributes on embedded shapes
        },
        spacing: { // Spacing related options
            padding: 0, // Padding around all shapes
            box: 'content' // Padding strategy (similar to CSS `box-sizing`) {content|icon|padding}
        },
        transform: ['svgo'], // List of transformations / optimizations
        _sort: function() { /*...*/ }, // SVG shape sorting callback
        meta: null, // Path to YAML file with meta / accessibility data
        align: null, // Path to YAML file with extended alignment data
        dest: '' // Output directory for optimized intermediate SVG shapes
    };

    svgSpriteConfigration['mode'] = {};

    let modes = ['css', 'view', 'defs', 'symbol', 'stack']

    // global mode settings
    modes.forEach( (currentMode, index, array) => {
        const filenameBase = `${config.svgsprite.prefix || ''}${( config.svgsprite.name || 'svg-sprite' )}.${currentMode}${config.svgsprite.suffix || ''}`;
        //prefix + ( config.svgsprite.name || 'svg-sprite' ) + '.css' + suffix;
        const selectorPrefix = filenameBase.replaceAll('\.', '-');

        svgSpriteConfigration['mode'][currentMode] = {
            dest: currentMode,
            prefix: `.${selectorPrefix}--%s`,
            dimensions: config.svgsprite.dimensions || '--dimensions',
            sprite: `${filenameBase}.svg`,
            bust: false,
            render: {},
            example: {
                dest: `${filenameBase}-example.html`,
                template: path.join(tmplSvgSpritePath, currentMode, 'sprite.html')
            }
        };

        // add example templates, if file exists
        let exampleTemplate = path.join(tmplSvgSpritePath, currentMode, 'sprite.html');
        if ( fs.existsSync(exampleTemplate) ) {
            svgSpriteConfigration['mode'][currentMode]['example']['template'] = exampleTemplate;
        }

        // specific properties
        switch ( currentMode ) {
            case 'css':
            case 'view':
                svgSpriteConfigration['mode'][currentMode]['layout'] = config.svgsprite.layout || 'horizontal'; //  {vertical|horizontal|diagonal|packed};
                svgSpriteConfigration['mode'][currentMode]['common'] = `${selectorPrefix}`;
                svgSpriteConfigration['mode'][currentMode]['mixin'] = `${selectorPrefix}`;
                break;

            case 'defs':
            case 'symbol':
                svgSpriteConfigration['mode'][currentMode]['inline'] = false;
                break;

            case 'stack':
                break;
        }

        // renderer definitions
        const renderer = ['css', 'less', 'scss', 'styl'];

        renderer.forEach((currentRenderer, index, array) => {
            svgSpriteConfigration['mode'][currentMode]['render'][currentRenderer] = {
                dest: path.join(currentRenderer, `${filenameBase}.${currentRenderer}`),
            };

            // add renderer template, if file exists
            let rendererTemplate = path.join(tmplSvgSpritePath, currentMode, `sprite.${currentRenderer}.hbs`);
            if ( fs.existsSync(rendererTemplate) ) {
                svgSpriteConfigration['mode'][currentMode]['render'][currentRenderer]['template'] = rendererTemplate;
            }
        });

        log( `-- ${currentMode} --------------------------------------------------` );
        log(svgSpriteConfigration['mode'][currentMode]['render']);
    });

    return svgSpriteConfigration;
}

/* ==================================================================================================================
 *  # Tasks
 * ================================================================================================================== */

/**
 * Task: clean-build
 * runs: taskCleanBuild function
 */
gulp.task('clean-build', taskCleanBuild );

/**
 * Task: clean-build-nsg-sprite
 * runs: taskCleanBuildNsgSprite function
 */
gulp.task('clean-build-nsg-sprite', taskCleanBuildNsgSprite );


/**
 * Task: clean-build-resizeimg-images
 * runs: taskCleanBuildResizeimgImages function
 */
gulp.task('clean-build-resizeimg-images', taskCleanBuildResizeimgImages );


/**
 * Task: clean-build-svgsprite-sprite
 * runs: taskCleanBuildSvgspriteSprite function
 */
gulp.task('clean-build-svgsprite-sprite', taskCleanBuildSvgspriteSprite );

/**
 * Task: generate-nsg-sprite
 * runs: taskGenerateNsgSprite function
 */
gulp.task('generate-nsg-sprite',
    gulp.series(
        'clean-build-nsg-sprite',
        taskGenerateNsgSprite
    )
);

/**
 * Task: generate-nsg-sprites
 * runs: taskGenerateNsgSprites function
 */
gulp.task('generate-nsg-sprites',
    gulp.series(
        'generate-nsg-sprite',
        taskGenerateNsgSprites
    )
);

/**
 * Task: generate-resizeimg-scaled-images
 * runs: taskGenerateResizeimgImages function
 */
gulp.task('generate-resizeimg-images',
    gulp.series(
        'clean-build-resizeimg-images',
        taskGenerateResizeimgImages
    )
);

/**
 * Task: generate-svg-sprite
 * runs: taskGenerateSvgSpriteSprite function
 */
gulp.task('generate-svgsprite-sprite',
    gulp.series(
        'clean-build-svgsprite-sprite',
        taskGenerateSvgSpriteSprite
    )
);

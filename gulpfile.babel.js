'use strict';

import gulp     from 'gulp';
import plugins  from 'gulp-load-plugins';
import fs       from 'fs';
import path     from 'path';
 import yargs    from 'yargs';
// TODO: YAML wieder aktivieren, da die YAML config self references und nested values verwenden kann
import yaml     from 'js-yaml';
import nsg      from 'node-sprite-generator';
import promise  from 'es6-promise';
import rimraf   from 'rimraf';
import typechecks from '@sgtmurtaugh/typechecks';
import log from 'fancy-log';

const resizeImage   = require('resize-img');

// Load all Gulp plugins into one variable
const $ = plugins();

// Promise Definition for Tasks without Streams or existing Promises
const Promise = promise.Promise;

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

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
 * @returns {*}
 */
function loadConfig() {
    // let ymlFile = fs.readFileSync('config.yml', 'utf8');
    // return yaml.load(ymlFile);

    let configFile = fs.readFileSync('config.json', 'utf-8');
    return JSON.parse(configFile);
}

/**
 * Creates the given directy if it not exists.
 * @param dir {string}
 */
function ensureFolder(dir) {
    let bSuccess = false;
    if (!typechecks.isEmpty(dir)) {
        if ( !dir.startsWith( __dirname ) ) {
            dir = path.join(__dirname, dir);
        }

        bSuccess = fs.existsSync(dir);
        if ( !bSuccess ) {
            const _path = mkdirp.sync( dir );
            if ( typechecks.isNotEmpty(_path) ) {
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
 * taskGenerateResizeimgScaledImages
 * @param callback {Function}
 */
function taskGenerateResizeimgImages(callback) {
    let srcImages = path.join(srcResizeimgPath, '**', '{*.bmp,*.jpg,*.jpeg,*.png}');
    log('srcImages: ' + srcImages);
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
    callback();
}


/* ------------------------------
 *  ## node-sprite-generator (nsg)
 * ------------------------------ */

/**
 * Task-Function
 * Delegates to the #generateNsgSprites methods. The callback is passed through and the flagSingleFileSprite
 * is set to true, to generate only a single sprite-set.
 *
 * @param callback {Function}
 */
function taskGenerateNsgSprite(callback) {
    return generateNsgSprite(true, callback);
}

/**
 * Task-Function
 * Delegates to the #generateNsgSprites methods. The callback is passed through and the flagSingleFileSprite
 * is set to false, to create multiple sprites-sets.
 *
 * @param callback {Function}
 */
function taskGenerateNsgSprites(callback) {
    return generateNsgSprite(false, callback);
}

/**
 *
 * @param flagSingleFileSprite {boolean}
 * @param callback {Function}
 *
 * TODO
 * Determines all sprite folders inside the sprite-src folder and
 * runs the generateSprite function on each of them.
 */
function generateNsgSprite(flagSingleFileSprite, callback) {
    flagSingleFileSprite = typechecks.isBoolean(flagSingleFileSprite) ? flagSingleFileSprite : true;

    let spriteSources = glob.sync(path.join(srcImageSpritePath, '*'), {
        "ignore": ['**/*.ignore']

    })
    .filter(function (spriteSource) {
        if (fs.statSync(spriteSource).isFile()) {
            log.warn(`no parent sprite-folder defined. file '${spriteSource}' will be ignored! move image to a new/existing parent and restart the generate task.`);
            return false;
        }

        // remain only folder with images (png, jpeg, pjg
        let globImages = glob.sync( path.join(spriteSource, '**/*.{png,jpg,jpeg}' ));
        return (globImages.length >= 1);

    });


    const SPRITE_NAME_ALL_SPRITE = config.nsg.sprite_name || 'all-sprite';
    let spriteNames = [];
    let spriteImages = {};


    // determine individual sprite name and imageSources for determined sprite sources
    spriteSources.forEach( function(spriteSource) {
        let spriteSourceFolderName;
        if (!flagSingleFileSprite) {
            spriteSourceFolderName = spriteSource;
            let lastFolderIndex = spriteSource.lastIndexOf('/') + 1;
            if ( spriteSourceFolderName.length > lastFolderIndex ) {
                spriteSourceFolderName = spriteSource.substring(lastFolderIndex);
            }
        }
        else {
            spriteSourceFolderName = SPRITE_NAME_ALL_SPRITE;
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
            spriteNames.forEach( async function ( spriteName ) {
                return executeNsg( spriteName, spriteImages[spriteName] );
            } );
        }
    }
    callback();
}

/**
 * Creates and runs the Node-Sprite-Generator on the given folder.
 * Only PNG files will be used for the sprite. The output is a sprite PNG and a
 * SASS source file with all containing image informations.
 * @param spriteName {string}
 * @param spriteSources {string}
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
 * Task-Function
 * Delegates to the #generateSvgSpriteSprites methods. The callback is passed through and the flagSingleFileSprite
 * is set to true, to generate only a single sprite-set.
 *
 * @param callback {Function}
 */
function taskGenerateSvgSpriteSprite(callback) {
    return generateSvgSpriteSprites(true, callback);
}

/**
 * Task-Function
 * Delegates to the #generateSvgSpriteSprites methods. The callback is passed through and the flagSingleFileSprite
 * is set to false, to create multiple sprites-sets.
 *
 * @param callback {Function}
 */
function taskGenerateSvgSpriteSprites(callback) {
    return generateSvgSpriteSprites(false, callback);
}

/**
 * TODO
 * Determines all sprite folders inside the sprite-src folder and
 * runs the generateSprite function on each of them.
 *
 * @param flagSingleFileSprite {boolean}
 * @param callback {Function}
 */
function generateSvgSpriteSprites(flagSingleFileSprite, callback) {
    flagSingleFileSprite = typechecks.isBoolean(flagSingleFileSprite) ? flagSingleFileSprite : true;

    let spriteSources = glob.sync(path.join(config.svgsprite.sprite_src, '*'), {
        "ignore": ['**/*.ignore/**']
    })
    .filter(function (spriteSource) {
        if (fs.statSync(spriteSource).isFile()) {
            log.warn(`no parent sprite-folder defined. file '${spriteSource}' will be ignored! move image to a new/existing parent and restart the generate task.`);
            return false;
        }

        // remain only folder with svgs
        let globSvgs = glob.sync( path.join(spriteSource, '**/*.svg' ));
        return (globSvgs.length >= 1);

    });


    const SPRITE_NAME_ALL_SPRITE = config.svgsprite.sprite_name || 'all-sprite';
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
            spriteSourceFolderName = SPRITE_NAME_ALL_SPRITE;
        }

        // add current spriteSourceFolderName to spriteNames
        spriteNames.push(spriteSourceFolderName);

        if ( typechecks.isUndefined(spriteImages[spriteSourceFolderName])) {
            spriteImages[spriteSourceFolderName] = [];
        }

        // add specific sprite sources
        spriteImages[spriteSourceFolderName].push( path.join( spriteSource, '**/*.svg' ) );
    });

    // start nsg execution with flag depended sprite sources
    if ( typechecks.isNotEmpty(spriteImages) ) {
        if ( flagSingleFileSprite ) {
            return executeSvgSprite( spriteNames[0], spriteImages[spriteNames[0]] );
        }
        else {
            spriteNames.forEach( async function ( spriteName ) {
                return executeSvgSprite( spriteName, spriteImages[spriteNames] );
            } );
        }
    }
    callback();
}

/**
 * Creates and runs the svgsprite-Generator on the given folder.
 * Only PNG files will be used for the sprite. The output is a sprite PNG and a
 * SASS source file with all containing image informations.
 *
 * @param spriteName {string}
 * @param spriteSources {string}
 * @returns {*}
 */
function executeSvgSprite(spriteName, spriteSources) {
    const svgSpriteConfiguration = _setupSvgSpriteConfiguration(spriteName);

    let srcSvgs = path.join(srcSvgSpritePath, '**', '*.svg');

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
function _setupSvgSpriteConfiguration(spriteName) {
//    let tmplSvgSpritePath = path.join(config.paths.src, config.paths.templates, config.paths.svgsprite);
    let tmplPath = config.svgsprite.templates;
    let tmplCommonPath = config.svgsprite.common_templates;

    let spriteExample = config.svgsprite.sprite_example || '-example.html';
    let spritePrefix = config.svgsprite.sprite_prefix || '';
    let spriteSuffix = config.svgsprite.sprite_suffix || '';
    let spriteRendererPrefix = config.svgsprite.sprite_renderer_prefix || '_';
    let spriteRendererSuffix = config.svgsprite.sprite_renderer_suffix || '';
    let spriteRendererExtension = config.svgsprite.sprite_renderer_extension || 'hbs';
    let stylesheetSpriteUrl = config.svgsprite.stylesheet_sprite_url || '';

    let modes = ['css', 'view', 'defs', 'symbol', 'stack'];

    // renderer definitions
    const renderer = ['css', 'less', 'scss', 'styl'];

    let svgSpriteConfigration = {
        dest: './', // Main output directory
        log: 'verbose',   // {info|debug|verbose|''|false|null}
        variables: {
            stylesheetSpriteUrl: stylesheetSpriteUrl
        }
    };

    // shape
    svgSpriteConfigration['shape'] = {
        id: { // SVG shape ID related options
            separator: '__', // Separator for directory name traversal
            _generator: function(name, file) {/**/}, // SVG shape ID generator callback
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

    // global mode settings
    modes.forEach( (currentMode) => {
        const filenameBase = `${spritePrefix}${spriteName}-${currentMode}${spriteSuffix}`;

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
                dest: `${filenameBase}-example.html`
            }
        };

        // add example templates, if file exists
        let exampleTemplate = path.join( tmplPath, currentMode, spriteExample );
        log.info("exampleTemplate: " + exampleTemplate);

        if ( !fs.existsSync(exampleTemplate) ) {
            // otherwise add common example template, if file exists
            exampleTemplate = path.join( tmplCommonPath, spriteExample );
            log.info("exampleTemplate: " + exampleTemplate);

            if ( !fs.existsSync( exampleTemplate ) ) {
                log.info("Es existiert kein KBS spezifisches Example Template.");
                exampleTemplate = null;
            }
        }

        if ( typechecks.isNotEmpty(exampleTemplate) ) {
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

        // renderer Ausgaben
        renderer.forEach( (currentRenderer) => {
            let targetFile = `_${filenameBase}`;

            svgSpriteConfigration['mode'][currentMode]['render'][currentRenderer] = {
                dest: targetFile
            };

            // add renderer template, if file exists
            let rendererFile = `${spriteRendererPrefix}${currentRenderer}${spriteRendererSuffix}.${spriteRendererExtension}`;
            let rendererTemplate = path.join(tmplPath, currentMode, rendererFile);
            log.info("rendererTemplate: " + rendererTemplate);

            if ( !fs.existsSync(rendererTemplate) ) {

                // otherwise add common renderer template, if file exists
                rendererTemplate = path.join( tmplCommonPath, rendererFile );
                log.info("rendererTemplate (common): " + rendererTemplate);

                if ( !fs.existsSync( rendererTemplate ) ) {
                    log.info("Es existiert kein KBS spezifisches Example Template.");
                    rendererTemplate = null;
                }
            }

            if ( typechecks.isNotEmpty(rendererTemplate) ) {
                svgSpriteConfigration['mode'][currentMode]['render'][currentRenderer]['template'] = rendererTemplate;
            }
        });
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
 * Task: generate-nsg-sprite
 * runs: taskGenerateNsgSprite function
 */
gulp.task('generate-nsg-sprite', taskGenerateNsgSprite );

/**
 * Task: generate-nsg-sprites
 * runs: taskGenerateNsgSprites function
 */
gulp.task('generate-nsg-sprites', taskGenerateNsgSprites );

/**
 * Task: generate-svg-sprite
 * runs: taskGenerateSvgSpriteSprite function
 */
gulp.task('generate-svgsprite-sprite', taskGenerateSvgSpriteSprite );

/**
 * Task: generate-svg-sprites
 * runs: taskGenerateSvgSpriteSprites function
 */
gulp.task('generate-svgsprite-sprites', taskGenerateSvgSpriteSprites );

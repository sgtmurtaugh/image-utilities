'use strict';

import gulp     from 'gulp';
import fs       from 'fs';
import path     from 'path';
import mkdirp   from 'make-dir';
//import yargs    from 'yargs';
// TODO: YAML wieder aktivieren, da die YAML config self references und nested values verwenden kann
import yaml     from 'js-yaml';
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

// Load settings from settings.yml
// const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();
const config = loadConfig();



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
    rimraf.sync(config.paths.dist.path);
    rimraf.sync(config.paths.build.path);
    cb();
}

/**
 * taskCleanBuildResizeimgImages
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuildResizeimgImages(cb) {
    rimraf.sync(config.paths.dist.path);
    rimraf.sync(config.paths.build.path);
    cb();
}

/**
 * taskCleanBuildSvgspriteSprite
 * @param cb
 * Deletes dist and build folder
 * This happens every time a build starts
 */
function taskCleanBuildSvgspriteSprite(cb) {
    rimraf.sync(config.paths.dist.path);
    rimraf.sync(config.paths.build.path);
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
    let files = glob.sync(
        config.resizeimg.src,
        {
            "absolute": true,
            "ignore": ['**/*.ignore/**']
        }
    );

    for (let file of files) {
        if (typechecks.isNotEmpty(file)) {
            let indexRelativPath = file.indexOf(config.resizeimg.path);

            if (indexRelativPath > -1) {
                let absolutPathPrefix = "";
                if (indexRelativPath > 0) {
                    absolutPathPrefix = file.substring(0, indexRelativPath);
                }

                if (file.length > indexRelativPath) {
                    let filename = file.substring(indexRelativPath + config.resizeimg.path.length);

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
                                    let targetPath = path.join(absolutPathPrefix, config.resizeimg.target);
                                    let subFolder = "";

                                    // SubFolder check
                                    let subFoldersEndIndex = filename.lastIndexOf('/');
                                    if (subFoldersEndIndex > -1) {
                                        subFolder = filename.substring(0, subFoldersEndIndex);
                                    }

                                    targetPath = path.join(targetPath, subFolder);
                                    if (typechecks.isTrue(config.resizeimg.options.createFolders)) {
                                        targetPath = path.join(targetPath, dimensionKey);
                                    }
                                    ensureFolder(targetPath);


                                    // create Filename
                                    let targetFilename = "";
                                    if (subFoldersEndIndex > -1) {
                                        targetFilename = filename.substring(subFoldersEndIndex, indexExtension);
                                    }
                                    else {
                                        targetFilename = filename.substring(0, indexExtension);
                                    }

                                    if (typechecks.isFalse(config.resizeimg.options.createFolders)) {
                                        targetFilename += '_';
                                        targetFilename += dimensionKey;
                                    }

                                    targetFilename += filename.substring(indexExtension);

                                    let targetFile = path.join(targetPath, targetFilename);


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

let srcPath = path.join(config.paths.src, config.paths.images, config.paths.sprites);

    let spriteSources = glob.sync(path.join(srcPath, '*'), {
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

let targetPath = path.join(config.paths.build, config.paths.nsg);


        let spriteFilename = `${config.nsg.sprite_prefix}${spriteName}${config.nsg.sprite_suffix}.png`;
        let spritePath = path.join(targetPath, config.paths.sprites, spriteFilename);
        let stylesheetFilename =`${config.nsg.stylesheet_prefix}${spriteName}${config.nsg.stylesheet_suffix}${config.nsg.stylesheet_extension}`;
        let stylesheetPath = path.join(targetPath, config.paths.stylesheet, stylesheetFilename);
        let stylesheetPrefix = `-${config.nsg.sprite_prefix}${spriteName}${config.nsg.sprite_suffix}-`;
        let stylesheetSpriteUrl = `src/assets/media/image/sprite/${spriteFilename}`;

        const nsgConfig = {
            spritePath: spritePath,
            src: spriteSources,
            stylesheet: config.nsg.stylesheet,
            stylesheetPath: stylesheetPath,
            stylesheetOptions: {
                prefix: stylesheetPrefix,
                spritePath: stylesheetSpriteUrl
            },
            compositor: config.nsg.compositor,
            layout: config.nsg.layout,
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
    return gulp.src(config.svgsprite.src, {
        "ignore": ['**/*.ignore/**']
    }).pipe($.svgSprite({
        dest: './',
        bust: false,
        mode: {
            css: {
                sprite: "sprites/sprite.css.svg",
                layout: config.svgsprite.layout,
                prefix: ".svgsprite-%s",
                dimensions: "-dims",
                mixin: 'sprite',
                render: {
                    css: {
                        dest: 'css/_svg-sprite.css'
                    },
                    scss: {
                        dest: 'scss/_svg-sprite.scss'
                    },
                    less: {
                        dest: 'less/_svg-sprite.less'
                    },
                    styl: {
                        dest: 'styl/_svg-sprite.styl'
                    }
                },
                example: {
                    dest: 'html/svg-sprite-example.html'
                }
            },
        },
        shape: {
            spacing: {
                padding: 1,
                box: 'padding'
            }
        }
    })).pipe(gulp.dest('build/svg-sprites'));
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

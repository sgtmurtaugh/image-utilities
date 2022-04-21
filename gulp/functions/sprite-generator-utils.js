'use strict';

let path = require('path');

let gulp;
let plugins;
let app;

module.exports = function ( _gulp, _plugins, _app ) {

    gulp = _gulp;
    plugins = _plugins;
    app = _app;

    return {

        /*
         * addNPMSupport
         * <p>Delegates to separate sprite generator specific addSpriteGenerator-Methods
         */
        'addNPMSupport' : function (cb) {
            // when spritegenerator support is enabled
            if (app.wizard.spriteGeneratorSupport) {
                // and spriteGenerators selected
                if (!app.fn.typeChecks.isEmpty(app.wizard.spriteGenerators)) {
                    return app.fn.json.addMultipleNPMEntriesToPackageConfiguration(
                        app.config.spriteGenerators,
                        app.wizard.spriteGenerators,
                        cb
                    );
                }
            }
            else {
                console.info('addNPMSupport skipped!');
            }
            cb();
        },

        /*
         * copyDependencies
         * @param cb
         * <p>TODO
         */
        'copyDependencies' : function (cb) {
            cb();
        },

        /*
         * copyTemplates
         * @param cb
         * <p>Copies the spriteGenerator templates for the user selected spriteGenerator types to the default installation
         * directory.
         */
        'copyTemplates' : function (cb) {
            let src = null;
    
            // when spriteGenerator support is enabled
            if (app.wizard.spriteGeneratorSupport) {
                src = [];
    
                // for each sprite generator add concatenated src path
                for (let spriteGenerator of app.wizard.spriteGenerators) {
                    // add src folder for the current spriteGenerator
                    src.push(
                        path.join(
                            app.config.paths.spriteGenerators,
                            spriteGenerator,
                            app.config.paths.recursive
                        )
                    );
                }
            }
            else {
                console.info('copyTemplates skipped!');
            }
    
            return app.fn.template.copyTemplatesSourcesToProjectFolder(src, null, cb);
        }
    
    };
};

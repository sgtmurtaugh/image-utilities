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
         * @param cb
         * <p>Delegates to separate framework specific addFramework-Methods
         */
        'addNPMSupport' : function (cb) {
            // when framework support is enabled
            if (app.wizard.frameworkSupport) {
                // and framework selected
                if (!app.fn.typeChecks.isEmpty(app.wizard.framework)) {
                    return app.fn.json.addNPMEntryToPackageConfiguration(
                        app.config.frameworks[app.wizard.framework][app.wizard.frameworkVersion],
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
         * <p>Copies the framework dependencies (e.g. preprocessor template).
         */
        'copyDependencies' : function (cb) {
            let src = null;
        // TODO!!!!!
            // when framework support is enabled
            if (app.wizard.frameworkSupport) {
                // check dependencies
                let jsonDependencies = app.fn.npm.getOwnPropertyValue(
                    app.config.frameworks[app.wizard.framework][app.wizard.frameworkVersion],
                    'dependencies'
                );

                if (null !== jsonDependencies) {
                    for ( let jsonDependencyKey in jsonDependencies ) {
                        if ( jsonDependencyKey !== null
                                && jsonDependencies.hasOwnProperty(jsonDependencyKey) ) {

                            let jsonDependencyValue = app.fn.npm.getOwnPropertyValue(jsonDependencies, jsonDependencyKey);

                            if ( jsonDependencyKey === 'preprocessor' ) {
        // TODO!!!
        //                      copyPreprocessorTemplates(app.config.preprocessors[jsonDependencyValue], cb);
                            }
                        }
                    }
                }



                // // create framework src path variable with user selected framework informations
                // src = [
                //     path.join(
                //         app.config.paths.frameworks,
                //         app.wizard.framework,
                //         app.wizard.frameworkVersion,
                //         app.config.paths.recursive
                //     )
                // ];
            }
            else {
                console.info('copyDependencies skipped!');
            }

            // return copyTemplatesSourcesToProjectFolder(src, null, cb);
            cb();
        },

        /*
         * copyTemplates
         * @param cb
         * <p>Copies the framework template for the user selected framework type to the default installation directory.
         */
        'copyTemplates' : function (cb) {
            let src = null;

            // when framework support is enabled
            if (app.wizard.frameworkSupport) {
                // create framework src path variable with user selected framework informations
                src = [
                    path.join(
                        app.config.paths.frameworks,
                        app.wizard.framework,
                        app.wizard.frameworkVersion,
                        app.config.paths.recursive
                    )
                ];
            }
            else {
                console.info('copyTemplates skipped!');
            }

            return app.fn.template.copyTemplatesSourcesToProjectFolder(src, null, cb);
        }
    };
};

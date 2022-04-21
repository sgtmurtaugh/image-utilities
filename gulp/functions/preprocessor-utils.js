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
         * <p>Delegates to separate preprocessor specific addPreprocessor-Methods
         */
        'addNPMSupport' : function (cb) {
            // when preprocessor support is enabled
            if (app.wizard.preprocessorSupport) {
                // and preprocessor selected
                if (!app.fn.typeChecks.isEmpty(app.wizard.preprocessor)) {
                    return app.fn.json.addNPMEntryToPackageConfiguration(
                        app.config.preprocessors[app.wizard.preprocessor],
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
         * <p>Copies the preprocessor template for the user selected preprocessor type to the corresponding preprocessor folder
         * inside the assets of the installation directory.
         */
        'copyTemplates' : function (cb) {
            let src = null;

            // when preprocessor support is enabled
            if (app.wizard.preprocessorSupport) {
                // create preprocessor src path variable with user selected preprocessor informations
                src = path.join(
                    app.config.paths.preprocessors,
                    app.wizard.preprocessor,
                    app.config.paths.recursive
                );
            }
            else {
                console.info('copyTemplates skipped!');
            }

            return app.fn.template.copyTemplatesSourcesToProjectFolder(src, null, cb);
        }

    };
};

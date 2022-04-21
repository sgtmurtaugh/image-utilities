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
         * <p>TODO
         */
        'addNPMSupport' : function (cb) {
            // when template engine is selected

            if (!app.fn.typeChecks.isEmpty(app.wizard.templateEngine)) {
                return app.fn.json.addNPMEntryToPackageConfiguration(
                    app.config.templateEngines[app.wizard.templateEngine],
                    app.wizard.templateEngine,
                    cb
                );
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
         * <p>Copies the template-engine templates for the user selected type to the default installation
         * directory.
         */
        'copyTemplates' : function (cb) {
            let src = null;

            // when templateEngine is selected
            if (!app.fn.typeChecks.isEmpty(app.wizard.templateEngine)) {
                src = path.join(
                    app.config.paths.templateEngines,
                    app.wizard.templateEngine,
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

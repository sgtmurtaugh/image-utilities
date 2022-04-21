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
         * addMultipleNPMEntriesToPackageConfiguration
         * @param json
         * @param keyList
         * @param cb
         * @return {*}
         */
        'addMultipleNPMEntriesToPackageConfiguration' : function (json, keyList, cb) {
            // when the json param and the keyList param are not empty
            if (!app.fn.typeChecks.isEmpty(json)
                && !app.fn.typeChecks.isEmpty(keyList)) {
    
                let packageJson = {
                    devDependencies: {}
                };
    
                // add each keyList entry definition to devDependencies (multiple values possible)
                for ( let key of keyList ) {
                    if ( app.fn.npm.hasOwnProperty( json, key ) ) {
                        if ( app.fn.npm.hasOwnProperty( json[key], 'npm')) {
                            // for each key npm dependency
                            for ( let npmConfigKey in json[key].npm ) {
                                if ( npmConfigKey !== null
                                        && json.hasOwnProperty(npmConfigKey) ) {

                                    if ( app.fn.npm.hasOwnProperty( json[key].npm, npmConfigKey ) ) {
                                        packageJson.devDependencies[npmConfigKey] = json[key].npm[npmConfigKey];
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.log('[warn] addMultipleNPMEntriesToPackageConfiguration: current key cannot be found in' +
                            ' json. key: ' + key);
                    }
                }
    
                // add definition to package.json
                return this.writeJSONConfigToPackageConfiguration(packageJson, cb);
            }
            else
            if (null === json) {
                console.log('[warn] addMultipleNPMEntriesToPackageConfiguration: json is null.');
            }
            else
            if (null === keyList) {
                console.log('[warn] addMultipleNPMEntriesToPackageConfiguration: keyList is null/empty.');
            }
            cb();
        },


        /*
         * addNPMEntryToPackageConfiguration
         * @param json
         * @param cb
         * @return {*}
         */
        'addNPMEntryToPackageConfiguration' : function (json, cb) {
            // when json is defined
            if (null !== json) {
                let packageJson = {
                    devDependencies: {}
                };

                if (app.fn.npm.hasOwnProperty(json, 'npm')) {
                    // add entry in devDependencies
                    packageJson.devDependencies = json.npm;
    
                    // add definition to package.json
                    return this.writeJSONConfigToPackageConfiguration(packageJson, cb);
                }
            }
            cb();
        },


        /*
         * writeJSONConfigToPackageConfiguration
         * @param packageJson
         * @param cb
         * @return {*}
         * <p>Adds the json snippet parameter to the package.json file in the installation directory.
         */
         'writeJSONConfigToPackageConfiguration' : function (packageJson, cb) {
            if (null !== packageJson) {
// console.dir(packageJson);
// console.log(path.join(app.wizard.projectFolder, app.config.paths.packageJson));
                return gulp.src(
                        path.join(
                            app.wizard.projectFolder,
                            app.config.paths.packageJson
                        )
                    )
// .pipe(plugins.debug())
                    .pipe( plugins.jsonEditor( packageJson ) )
                    // .pipe( plugins.jsonEditor( function (json) {
// console.dir(json);
//                         return json;
//                     }))
                    .pipe( gulp.dest( app.wizard.projectFolder ) );
            }
            cb();
        }

    };
};

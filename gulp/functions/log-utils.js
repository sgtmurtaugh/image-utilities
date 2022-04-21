'use strict';

let fs = require('fs');

let gulp;
let plugins;
let app;

module.exports = function ( _gulp, _plugins, _app ) {

    gulp = _gulp;
    plugins = _plugins;
    app = _app;

    return {
        /**
         * file
         * @param file
         * @param options
         * <p>Logs file content to console
         */
        'file': function (file, options = { encoding: 'utf-8', flag: 'rs' }) {
            if (app.fn.typeChecks.isNotEmpty(file)) {
                fs.readFile(file, options, function(e, data) {
                    if (e) return console.log(e);
                    console.log(data);
                });
            }
        }
    };
};

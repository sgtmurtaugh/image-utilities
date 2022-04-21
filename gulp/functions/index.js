'use strict';

let fs = require('fs');
let path = require('path');

let gulp;
let plugins;
let app;

module.exports = function (_gulp, _plugins, _app) {
    gulp =_gulp;
    plugins = _plugins;
    app = _app;

    return {
        'fs' : fs,
        'path' : path,

        'config' : require('./config-utils'),
        'messages' : require('./messages'),
        'helper' : require('./helper-utils'),
        'npm' : require('./npm-utils'),
        'typeChecks' : require('./type-checks'),
        'wizard' : require('./wizard'),

        'framework' : require('./framework-utils')(gulp, plugins, app),
        'json' : require('./json-utils')(gulp, plugins, app),
        'log' : require('./log-utils')(gulp, plugins, app),
        'preprocessor' : require('./preprocessor-utils')(gulp, plugins, app),
        'spriteGenerator' : require('./sprite-generator-utils')(gulp, plugins, app),
        'tasks' : require('./task-utils')(gulp, plugins, app),
        'template' : require('./template-utils')(gulp, plugins, app),
        'templateEngine' : require('./template-engine-utils')(gulp, plugins, app)
    };
};

'use strict';

let colors = require('colors');

module.exports = function(name) {
    return {
        projectExists: "\nThere is already a folder named " + name + " "
    }
};

module.exports.noRoot = [
    'Slow down there, friend!',
    '------------------------',
    'Running this installer as an administrator can cause problems.',
    'Try running this command again without "sudo" or administrator rights.'
];

module.exports.gitNotInstalled = "\nYou need Git installed to get started. Download it here: " + "http://git-scm.com/downloads".cyan + "\n";
'use strict';

let fs = require('fs');
let path = require('path');

let requireDir = require('require-dir');

module.exports = {

    /**
     * getFolders
     * @param dir
     * TODO
     */
    'getFolders': function (dir) {
        return fs.readdirSync(dir)
            .filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    },


    /**
     * loadConfig
     * @param file
     * @return {*}
     * TODO
     */
    'loadConfig': function (file) {
        let json = null;
        if (null !== file) {
            let configFile = fs.readFileSync(file, 'utf-8');

            if (null !== configFile) {
                json = JSON.parse(configFile);
            }
        }
        return json;
    },


    /**
     * loadConfigs
     * @param recursive
     * @return {map}
     * TODO
     */
    'loadConfigs': function (recursive) {
        if (recursive === undefined || recursive === null) {
            recursive = true;
        }

        return requireDir('../conf', {recurse: recursive});
    }


};

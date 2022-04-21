'use strict';

let typeChecks = require('./type-checks');

module.exports = {

    /*
     * getMergedArray
     * @param obj1
     * @param obj2
     * @return {Array}
     * <p>TODO
     */
    'getMergedArray': function (obj1, obj2) {
        let mergedArray = [];

        if (typeChecks.isNotEmpty(obj1)) {
            if (typeChecks.isArray(obj1)) {
                mergedArray = mergedArray.concat(obj1);
            }
            else {
                mergedArray.push(obj1);
            }
        }

        if (typeChecks.isNotEmpty(obj2)) {
            if (typeChecks.isArray(obj2)) {
                mergedArray = mergedArray.concat(obj2);
            }
            else {
                mergedArray.push(obj2);
            }
        }

        return mergedArray;
    },

};

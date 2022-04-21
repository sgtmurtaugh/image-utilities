'use strict';

const mappingsTrueFalse = {
    'false': {
        'boolean': false,
        'character': ['n', 'N', '0'],
        'numeric': 0,
        'string': ['err', 'error', 'false', 'failure', 'falsch', 'fault', 'nein', 'no']
    },
    'true': {
        'boolean': true,
        'character': ['j', 'J', 'y', 'Y', '1'],
        'numeric': 1,
        'string': ['erfolg', 'ja', 'ok', 'richtig', 'success', 'true', 'wahr', 'yes']
    }
};
    
module.exports = {

    /**
     * getType
     * @param obj
     * @return {string}
     * <p>Checks the type of the given parameter. Returns the following values:
     * <dl>
     *  <dt>'array'</dt>
     *  <dd>If the param is not null and the method <code>Array.isArray()</code> returns true the String 'array' is returned.</dd>
     *
     *  <dt>'function'</dt>
     *  <dd>If the param is a function the String 'object' is returned.</dd>
     *
     *  <dt>'number'</dt>
     *  <dd>If the param is numeric the String 'number' is returned.</dd>
     *
     *  <dt>'null'</dt>
     *  <dd>If the param is null the String 'null' is returned.</dd>
     *
     *  <dt>'object'</dt>
     *  <dd>If the param is null or of type Object the String 'object' is returned.</dd>
     *
     *  <dt>'other'</dt>
     *  <dd>If the param is not null and not one of the types Array, Object and String the value 'other' is returned.</dd>
     *
     *  <dt>'string'</dt>
     *  <dd>If the param is null or of type String the String 'string' is returned.</dd>
     *
     *  <dt>'undefined'</dt>
     *  <dd>If the param is undefined the String 'undefined' is returned.</dd>
     * </dl>
     * <p>The private method doesn't make use of the log mechanism!
     */
    'getType': function (obj) {
        let type = 'object';

        if ('undefined' === typeof obj) {
            type = 'undefined';
        }
        else if (null === obj) {
            type = 'null';
        }
        else {
            if (Array.isArray(obj)) {
                type = 'array';
            }
			else
			if ('boolean' === typeof obj
					|| 'function' === typeof obj
					|| 'number' === typeof obj
					|| 'string' === typeof obj
					|| 'symbol' === typeof obj) {

				type = (typeof obj);
			}
			else
			if ('object' === typeof obj) {
				if (obj instanceof Date) {
					type = 'date';
				}
				else {
					type = (typeof obj);
				}
			}
			else {
				type = 'other';
			}
        }
        return type;
    },

    /**
     * isArray
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'array' otherwise false.
     */
    'isArray': function (obj) {
		const METHOD = 'isArray(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('array' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isBoolean
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'boolean' otherwise false.
     */
    'isBoolean': function (obj) {
		const METHOD = 'isBoolean(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('boolean' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

	/**
	 * isDate
	 * @param obj
	 * @return {boolean}
	 * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'date' otherwise false.
	 */
	'isDate': function (obj) {
		const METHOD = 'isDate(obj)';
		// log.enter(METHOD, obj);
		var bIs = ('date' === this.getType(obj));
		// log.return(METHOD, bIs);
		return bIs;
	},

    /**
     * isEmpty
     * @param obj
     * @return {boolean}
     * <p>Checks the value depending on the type of the parameter object. Returns true, if the obj is null/undefined, an
     * empty Array or an empty String, otherwise true will be returned.
     */
    'isEmpty': function (obj) {
		const METHOD = 'isEmpty(obj)';
        // log.enter(METHOD, obj);
        let bIsEmpty = false;

        if (module.exports.isNull(obj)
            || module.exports.isUndefined(obj)) {

            bIsEmpty = true;
        }
        else if (module.exports.isArray(obj)) {
            bIsEmpty = (obj.length === 0);
        }
        else if (module.exports.isString(obj)) {
            bIsEmpty = (obj.trim().length === 0);
        }

        // log.return(METHOD, bIsEmpty);
        return bIsEmpty;
    },

	/**
	 * isEmptyString
	 * @param obj
	 * @return {boolean}
	 * <p>Checks the object for type String and its value on not empty.
	 */
	'isEmptyString': function (obj) {
		const METHOD = 'isEmptyString(obj)';
		// log.enter(METHOD, obj);
		var bIsEmptyString = false;

		if (this.isString(obj)
				&& this.isEmpty(obj)) {

			bIsEmptyString = true;
		}

		// log.return(METHOD, bIsNotEmptyString);
		return bIsEmptyString;
	},

	/**
	 * isFalse
	 * @param obj
	 * @return {boolean}
	 * <p>
	 */
	'isFalse': function (obj) {
		const METHOD = 'isFalse(obj)';
		// log.enter(METHOD, obj);
		var bIs = false;

		if (this.isBoolean(obj)) {
			bIs = ( false === obj );
			// log.logDebug(METHOD, obj  + ' === ' + false + ' ? ' + bIs );
		}
		else
		if (this.isNumeric(obj)) {
			if (this.isArray(mappingsTrueFalse.false.numeric)) {
				for (var numericBool in mappingsTrueFalse.false.numeric) {
					bIs = (numericBool == obj);
					// log.logDebug(METHOD, obj  + ' == ' + numericBool + ' ? ' + bIs );

					if (true === bIs) break;
				}
			}
			else {
				bIs = (mappingsTrueFalse.false.numeric == obj);
				// log.logDebug(METHOD, obj  + ' == ' + mappingsTrueFalse.false.numeric + ' ? ' + bIs );
			}
		}
		else
		if (this.isString(obj)) {
			if (obj.trim().length > 1) {
				if (this.isArray(mappingsTrueFalse.false.string)) {
					for (var stringBool in mappingsTrueFalse.false.string) {
						bIs = (stringBool === obj.trim());
						// log.logDebug(METHOD, obj  + ' === ' + stringBool + ' ? ' + bIs );

						if (true === bIs) break;
					}
				}
				else {
					bIs = (mappingsTrueFalse.false.string === obj.trim());
					// log.logDebug(METHOD, obj  + ' === ' + mappingsTrueFalse.false.string + ' ? ' + bIs );
				}
			}
			else {
				if (this.isArray(mappingsTrueFalse.false.character)) {
					for (var characterBool in mappingsTrueFalse.false.character) {
						bIs = (characterBool === obj.trim());
						// log.logDebug(METHOD, obj  + ' === ' + characterBool + ' ? ' + bIs );

						if (true === bIs) break;
					}
				}
				else {
					bIs = (mappingsTrueFalse.false.character === obj.trim());
					// log.logDebug(METHOD, obj  + ' === ' + mappingsTrueFalse.false.character + ' ? ' + bIs );
				}
			}
		}
		else
		if (this.isObject(obj)) {
			bIs = this.isFalse(""+obj);
		}
		else {
			// log.warn(METHOD, 'Das uebergebene Objekt ist weder vom Typ Boolean, Numeric oder String. Somit kann der' +
			// 	' Wert nicht auf false geprueft werden. obj : ');
			// log.warn(METHOD, obj);
		}

		// log.return(METHOD, bIs);
		return bIs;
	},

    /**
     * isFunction
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'function' otherwise false.
     */
    'isFunction': function (obj) {
		const METHOD = 'isFunction(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('function' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isJSONString
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and checks for type 'string'. If true a JSON parse tests the object. When no exeption is thrown true will be returned otherwise false.
     * Attention: Numbers, booleans and null will also return true - these are valid JSON values!
     */
    'isJSONString': function (obj) {
		const METHOD = 'isJSONString(obj)';
        // log.enter(METHOD, obj);
        let bIs = false;

        if ('string' === module.exports.getType(obj)) {
            try {
                JSON.parse(obj);
                bIs = true;
            }
            catch (e) {
                // ignore error
            }
        }

        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isNotEmpty
     * @param obj
     * @return {boolean}
     * <p>Delegates to isEmpty and returns the inverted value.
     */
    'isNotEmpty': function (obj) {
		const METHOD = 'isNotEmpty(obj)';
        // log.enter(METHOD, obj);
        let bNotEmpty = (!module.exports.isEmpty(obj));
        // log.return(METHOD, bNotEmpty);
        return bNotEmpty;
    },

    /**
     * isNotEmptyString
     * @param obj
     * @return {boolean}
     * <p>Checks the value depending on the type of the parameter object. Returns true, if the obj is null/undefined, an
     * empty Array or an empty String, otherwise true will be returned.
     */
    'isNotEmptyString': function (obj) {
		const METHOD = 'isNotEmptyString(obj)';
        // log.enter(METHOD, obj);
        let bIsNotEmptyString = false;

        if (module.exports.isString(obj)
            && !module.exports.isEmpty(obj)) {

            bIsNotEmptyString = true;
        }

        // log.return(METHOD, bIsNotEmptyString);
        return bIsNotEmptyString;
    },

    /**
     * isNull
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'null' otherwise false.
     */
    'isNull': function (obj) {
		const METHOD = 'isNull(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('null' === module.exports.getType(obj));

        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isNumeric
     * @param obj
     * @returns {boolean}
     * <p>Checks the value for numeric type.
     */
    'isNumeric': function (obj) {
		const METHOD = 'isNumeric(obj)';
        // log.enter(METHOD, obj);
        let bIs = ((!isNaN(parseFloat(obj)))
            && isFinite(obj));

        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isObject
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'object' otherwise false.
     */
    'isObject': function (obj) {
		const METHOD = 'isObject(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('object' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isOther
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'other' otherwise false.
     */
    'isOther': function (obj) {
		const METHOD = 'isOther(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('other' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

    /**
     * isString
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'string' otherwise false.
     */
    'isString': function (obj) {
		const METHOD = 'isString(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('string' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },


    /**
     * isSymbol
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'symbol' otherwise false.
     */
    'isSymbol': function (obj) {
		const METHOD = 'isSymbol(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('symbol' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    },

	/**
	 * isTrue
	 * @param obj
	 * @return {boolean}
	 * <p>
	 */
	'isTrue': function (obj) {
		const METHOD = 'isTrue(obj)';
		// log.enter(METHOD, obj);
		var bIs = false;

		if (this.isBoolean(obj)) {
			bIs = ( true === obj );
			// log.logDebug(METHOD, obj  + ' === ' + true + ' ? ' + bIs );
		}
		else
		if (this.isNumeric(obj)) {
			if (this.isArray(mappingsTrueFalse.true.numeric)) {
				for (var numericBool in mappingsTrueFalse.true.numeric) {
					bIs = (numericBool == obj);
					// log.logDebug(METHOD, obj  + ' == ' + numericBool + ' ? ' + bIs );

					if (true === bIs) break;
				}
			}
			else {
				bIs = (mappingsTrueFalse.true.numeric == obj);
				// log.logDebug(METHOD, obj  + ' == ' + mappingsTrueFalse.true.numeric + ' ? ' + bIs );
			}
		}
		else
		if (this.isString(obj)) {
			if (obj.trim().length > 1) {
				if (this.isArray(mappingsTrueFalse.true.string)) {
					for (var stringBool in mappingsTrueFalse.true.string) {
						bIs = (stringBool === obj.trim());
						// log.logDebug(METHOD, obj  + ' === ' + stringBool + ' ? ' + bIs );

						if (true === bIs) break;
					}
				}
				else {
					bIs = (mappingsTrueFalse.true.string === obj.trim());
					// log.logDebug(METHOD, obj  + ' === ' + mappingsTrueFalse.true.string + ' ? ' + bIs );
				}
			}
			else {
				if (this.isArray(mappingsTrueFalse.true.character)) {
					for (var characterBool in mappingsTrueFalse.true.character) {
						bIs = (characterBool === obj.trim());
						// log.logDebug(METHOD, obj  + ' === ' + characterBool + ' ? ' + bIs );

						if (true === bIs) break;
					}
				}
				else {
					bIs = (mappingsTrueFalse.true.character === obj.trim());
					// log.logDebug(METHOD, obj  + ' === ' + mappingsTrueFalse.true.character + ' ? ' + bIs );
				}
			}
		}
		else
		if (this.isObject(obj)) {
			bIs = this.isTrue(""+obj);
		}
		else {
			// log.warn(METHOD, 'Das uebergebene Objekt ist weder vom Typ Boolean, Numeric oder String. Somit kann der' +
			// 	' Wert nicht auf true geprueft werden. obj : ');
			// log.warn(METHOD, obj);
		}

		// log.return(METHOD, bIs);
		return bIs;
	},

    /**
     * isUndefined
     * @param obj
     * @return {boolean}
     * <p>Delegates to <code>getType(obj)</code> and returns true if the returned type is 'undefined' otherwise false.
     */
    'isUndefined': function (obj) {
		const METHOD = 'isUndefined(obj)';
        // log.enter(METHOD, obj);
        let bIs = ('undefined' === module.exports.getType(obj));
        // log.return(METHOD, bIs);
        return bIs;
    }

};
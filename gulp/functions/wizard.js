'use strict';

/**
 * exports
 * @param inq
 * @param config
 * @return {Array}
 */
module.exports = function(inq, config) {
    let questions = [];

    /**
     * 1. Installation Directory (directory)
     */
    questions.push({
        name: 'directory',
        message: 'Enter installation path:',
        type: 'input',
        validate: function (directory) {
            return ( directory !== null && directory.trim() !== '' );
        },
        default: '../test'
    });


    /**
     * 2. Clone Name (name)
     */
    questions.push({
        name: 'name',
        message: 'Enter new clone name:',
        type: 'input',
        validate: function (name) {
            return ( name !== null && name.trim() !== '' );
        }
    });


    /**
     * 3. Quick Clone (quickClone)
     */
    questions.push({
        name: 'quickClone',
        message: 'Quick Clone (skips wizard and creates a simple clone without any framework support):',
        type: 'confirm',
        default: false
    });


    /**
     * 4. TemplateEngine (templateEngine)
     */
    questions.push({
        name: 'templateEngine',
        message: 'Choose TemplateEngine:',
        type: 'list',
        default: function(answers) {
            let def = null;
            let entryKeys = Object.keys(config.templateEngines);

            if (entryKeys.length === 1) {
                def = entryKeys[0];
            }
            return def;
        },
        choices: function (answers) {
            let choices = [];
            let templateEngines = config.templateEngines;

            choices.push({
                name: 'none',
                value: null
            });

            for ( let templateEngineKey in templateEngines ) {
                if ( templateEngineKey !== null
                        && templateEngines.hasOwnProperty(templateEngineKey) ) {

                    choices.push({
                        name: templateEngineKey
                    });
                }
            }

            return choices;
        },
        when: function (answers) {
            let bShow = false;

            if ('undefined' !== typeof config.templateEngines
                    && null !== config.templateEngines) {

                bShow = (Object.keys(config.templateEngines).length > 0);
            }
            return bShow;
        }
    });


    /**
     * 5. Framework Support (frameworkSupport)
     */
    questions.push({
        name: 'frameworkSupport',
        message: 'Install web framework:',
        type: 'confirm',
        default: true,
        when: function(answers) {
            return isQuickClone(answers)
        }
    });


    /**
     * 6. Framework (framework)
     */
    questions.push({
        name: 'framework',
        message: 'Choose Framework:',
        type: 'list',
        choices: function (answers) {
            let choices = [];
            let frameworks = config.frameworks;

            choices.push({
                name: 'none',
                value: null
            });

            for (let frameworkKey in frameworks) {
                if ( frameworkKey !== null
                        && frameworks.hasOwnProperty(frameworkKey) ) {

                    choices.push({
                        name: frameworkKey
                    });
                }
            }

            return choices;
        },
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            let bShowFrameworkQuestion = answers.frameworkSupport;
            // if true, at least one framework is configured
            if (bShowFrameworkQuestion) {
                // when more than one framework is configured prompt question
                // otherwise autoselect the only configured one.
                let keys = Object.keys(config.frameworks);
                bShowFrameworkQuestion = (keys.length > 1);

                if (!bShowFrameworkQuestion) {
                    // autoselect only configured one
                    answers.framework = keys[0];
                }
            }
            return bShowFrameworkQuestion;
        }
    });

    /**
     * 7. Framework Version (frameworkVersion)
     */
    questions.push({
        name: 'frameworkVersion',
        message: 'Choose Framework Version:',
        type: 'list',
        choices: function (answers) {
            let choices = [];
            let framework = config.frameworks[answers.framework];

            for ( let versionKey in framework ) {
                if ( versionKey !== null
                        && framework.hasOwnProperty(versionKey) ) {

                    choices.push({
                        name: answers.framework + ' ' + versionKey,
                        value: versionKey
                    });
                }
            }
            return choices;
        },
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            let bShowFrameworkVersionQuestion = answers.frameworkSupport;
            // if true, at least one framework is configured
            if (bShowFrameworkVersionQuestion) {
                // check selected framework for null
                let bHasFramework = (answers.framework !== null);
                if (bHasFramework) {
                    // when more than one framework is configured prompt question
                    // otherwise autoselect the only configured one.
                    let keys = Object.keys(config.frameworks[answers.framework]);
                    bShowFrameworkVersionQuestion = (keys.length > 1);

                    if (!bShowFrameworkVersionQuestion) {
                        // autoselect only configured one
                        answers.frameworkVersion = keys[0];
                    }
                }
                else {
                    // if framework value is null upate frameworkSupport answer!
                    answers.frameworkSupport = bShowFrameworkVersionQuestion = false;
                }
            }
            return bShowFrameworkVersionQuestion;
        }
    });


    /**
     * 8. Preprocessor Support (preprocessorSupport)
     */
    questions.push({
        name: 'preprocessorSupport',
        message: 'Install Preprocessors:',
        type: 'confirm',
        default: true,
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            let bHasPreprocessorSupport = false;

            // prompt this question only when the frameworkSupport is true and the preprocessorSupport is configured.
            if ( ! answers.frameworkSupport ) {
                bHasPreprocessorSupport = hasPreprocessorsSupport(answers);
            }
            return bHasPreprocessorSupport;
        }
    });


    /**
     * 9. Preprocessor (preprocessor)
     */
    questions.push({
        name: 'preprocessor',
        message: 'Choose Preprocessor:',
        type: 'list',
        choices: function (answers) {
            let choices = [];
            let preprocessors = config.preprocessors;

            choices.push({
                name: 'none',
                value: null
            });

            for ( let preprocessorKey in preprocessors ) {
                if ( preprocessorKey !== null
                        && preprocessors.hasOwnProperty(preprocessorKey) ) {

                    choices.push({
                        name: preprocessorKey
                    });
                }
            }

            return choices;
        },
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            let bShowPreprocessorQuestion = answers.preprocessorSupport;
            // if true, at least one preprocessor is configured
            if (bShowPreprocessorQuestion) {
                // when more than one preprocessor is configured prompt question
                // otherwise autoselect the only configured one.
                let keys = Object.keys(config.preprocessors);
                bShowPreprocessorQuestion = (keys.length > 1);

                if (!bShowPreprocessorQuestion) {
                    // autoselect only configured one
                    answers.preprocessor = keys[0];
                }
            }
            return bShowPreprocessorQuestion;
        }
    });


    /**
     * 10. Sprite Generator Support (spriteGeneratorSupport)
     */
    questions.push({
        name: 'spriteGeneratorSupport',
        message: 'Install Sprite Generators:',
        type: 'confirm',
        default: true,
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            // When preprocessor is null (none option) update preprocessorSupport answer!
            if ( answers.preprocessor === null ) {
                answers.preprocessorSupport = false;
            }

            return hasSpriteGeneratorSupport(answers);
        }
    });


    /**
     * 11. Sprite Generator List (spriteGenerators)
     */
    questions.push({
        name: 'spriteGenerators',
        message: 'Choose Sprite Generators:',
        type: 'checkbox',
        default: [],
        choices: function (answers) {
            let choices = [];
            let spriteGenerators = config.spriteGenerators;

            for ( let spriteGeneratorsKey in spriteGenerators ) {
                if ( spriteGeneratorsKey !== null
                        && spriteGenerators.hasOwnProperty(spriteGeneratorsKey) ) {

                    choices.push({
                        name: spriteGeneratorsKey
                    });
                }
            }

            return choices;
        },
        validate: function (spriteGenerators, answers) {
            if ( spriteGenerators === null || spriteGenerators.length === 0 ) {
                answers.spriteGeneratorSupport = false;
            }
            return true;
        },
        when: function (answers) {
            // QuickClone check
            if ( ! isQuickClone(answers) ) return false;

            let bShowSpriteGeneratorQuestion = answers.spriteGeneratorSupport;
            // if true, at least one preprocessor is configured
            if (bShowSpriteGeneratorQuestion) {
                // when more than one preprocessor is configured prompt question
                // otherwise autoselect the only configured one.
                let keys = Object.keys(config.spriteGenerators);
                bShowSpriteGeneratorQuestion = (keys.length > 1);

                if (!bShowSpriteGeneratorQuestion) {
                    // autoselect only configured one
                    answers.spriteGenerators = keys[0];
                }
            }
            return bShowSpriteGeneratorQuestion;
        }
    });


    /**
     * 12. Dependencies Installation (installDependencies)
     */
    questions.push({
        name: 'installDependencies',
        message: 'Install Project Dependencies after cloning:',
        type: 'confirm',
        default: false
    });

    return questions;


    /* ### wizard util functions ######################## */


    /**
     * hasFrameworkSupport
     * @param answers
     * @return {boolean}
     */
    function hasFrameworkSupport(answers) {
        let bShowFrameworkQuestion = answers.frameworkSupport;
        if ( bShowFrameworkQuestion === undefined ) {
            // default
            bShowFrameworkQuestion = false;

            let jsonFrameworks = config.frameworks;
            if (jsonFrameworks !== null) {
                for ( let frameworkKey in jsonFrameworks ) {
                    if ( frameworkKey !== null
                            && jsonFrameworks.hasOwnProperty(frameworkKey) ) {

                        let jsonFramework = jsonFrameworks[frameworkKey];
                        for ( let frameworkVersionKey in jsonFramework ) {
                            if ( frameworkVersionKey !== null
                                    && jsonFrameworks.hasOwnProperty(frameworkVersionKey) ) {

                                if ( jsonFramework[frameworkVersionKey] !== null ) {
                                    bShowFrameworkQuestion = true;
                                    break;
                                }
                            }
                        }
                    }

                    // break loop when at least one defined framework with version can be found
                    if (bShowFrameworkQuestion) break;
                }
            }
        }
        return bShowFrameworkQuestion;
    }

    /**
     * hasPreprocessorsSupport
     * @param answers
     * @return {boolean}
     */
    function hasPreprocessorsSupport(answers) {
        let bShowPreprocessorsQuestion = answers.preprocessorSupport;
        if ( bShowPreprocessorsQuestion === undefined ) {
            // default
            bShowPreprocessorsQuestion = false;

            let jsonPreprocessors = config.preprocessors;
            if (jsonPreprocessors !== null) {

                for ( let preprocessorsKey in jsonPreprocessors ) {
                    if ( preprocessorsKey !== null
                            && jsonPreprocessors.hasOwnProperty(preprocessorsKey) ) {

                        let jsonPreprocessor = jsonPreprocessors[preprocessorsKey];

                        for ( let preprocessorKey in jsonPreprocessor ) {
                            if ( preprocessorKey !== null
                                    && jsonPreprocessor.hasOwnProperty(preprocessorKey) ) {

                                bShowPreprocessorsQuestion = true;
                                break;
                            }
                        }
                    }

                    // break loop when at least one defined framework with version can be found
                    if ( bShowPreprocessorsQuestion ) break;
                }
            }
        }
        return bShowPreprocessorsQuestion;
    }

    /**
     * hasSpriteGeneratorSupport
     * @param answers
     * @return {boolean}
     */
    function hasSpriteGeneratorSupport(answers) {
        let bShowSpriteGeneratorQuestion = answers.spriteGeneratorSupport;
        if ( bShowSpriteGeneratorQuestion === undefined ) {
            // default
            bShowSpriteGeneratorQuestion = false;

            let jsonSpriteGenerators = config.spriteGenerators;
            if (jsonSpriteGenerators !== null) {
                for ( let spriteGeneratorKey in jsonSpriteGenerators ) {
                    if ( spriteGeneratorKey !== null
                            && jsonSpriteGenerators.hasOwnProperty(spriteGeneratorKey) ) {

                        bShowSpriteGeneratorQuestion = true;
                        break;
                    }
                }
            }
        }
        return bShowSpriteGeneratorQuestion;
    }

    /**
     * isQuickClone
     * @param answers
     * @return {boolean}
     */
    function isQuickClone(answers) {
        let quickClone = false;

        if ( answers.quickClone === undefined
                || answers.quickClone === false ) {
            quickClone = true;
        }
        return quickClone;
    }

};

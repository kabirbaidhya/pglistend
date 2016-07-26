import Yaml from 'yamljs';
import query from './query';
import {Pool} from 'pg';
import {log, error} from './util';
import {throttle, debounce} from './util';
import {isObject, isFunction} from './util';

export function resolveConfig(file) {
    return Yaml.load(file);
}

export function resolveHandlers(config) {
    let scripts = config.scripts || [];

    if (scripts.length === 0) {
        error('Warning: No listener scripts are configured.');

        return {};
    }

    const helpers = getCallbackHelpers(config);

    return resolveForScripts(scripts, helpers);
}

/**
 * Some helper functions available in the listener scripts
 */
function getCallbackHelpers(config) {
    let pool = new Pool(config.connection);

    return {
        log, error,
        throttle, debounce,
        query: query.bind(pool)
    };
}

function resolveHandlersFromFile(file, helpers) {
    let func = require(file);

    if (!isFunction(require(file))) {
        throw new Error(`Invalid listener script provided. The script file "${file}" should export a function.`);
    }

    let handlers = func(helpers);

    if (!isObject(handlers)) {
        throw new Error(`Invalid listener script provided. The exported function in "${file}" should return an object with handlers`);
    }

    return handlers;
}

function resolveForScripts(scripts, helpers) {
    let resolved = {};

    scripts.forEach(file => {
        try {
            let handlers = resolveHandlersFromFile(file, helpers);

            for (let key of Object.keys(handlers)) {
                let callback = handlers[key];

                if (!isFunction(callback)) {
                    error(`Invalid callback function specified for key "${key}" on file "${file}"`);

                    continue;
                }

                if (!Array.isArray(resolved[key])) {
                    resolved[key] = [];
                }

                resolved[key].push(callback);
            }
        } catch (e) {
            error(e.message);
        }
    });

    return resolved;
}

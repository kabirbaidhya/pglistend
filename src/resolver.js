import {Pool} from 'pg';
import Yaml from 'yamljs';
import {yellow} from 'chalk';
import deepAssign from 'deep-assign';

import query from './query';
import {log, error} from './util';
import {throttle, debounce} from './util';
import {isObject, isFunction} from './util';
import * as msg from './messages/common';

export function resolveConfig(file) {
    let config = loadConfig(file);

    config.connections = resolveConnections(config.connections, config.default);

    return config;
}

function resolveConnections(files, defaults = {}) {
    if (!Array.isArray(files)) return [];

    return files.map(path => deepAssign({}, loadConfig(path), defaults));
}

function loadConfig(file) {
    try {
        let config = Yaml.load(file);

        log(msg.LOADED_CONFIG_FILE, yellow(file));
        return config;
    } catch (e) {
        error(msg.ERROR_LOADING_CONFIG_FILE, file);
        throw e;
    }
}

export function resolveHandlers(config) {
    let scripts = Array.isArray(config.scripts) ? config.scripts : [];

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


import Yaml from 'yamljs';
import { log, error } from './cli';
import {isObject, isFunction} from './util';

class Resolver {

    static resolveConfig(file) {
        return Yaml.load(file);
    }

    static resolveHandlers(config) {
        let scripts = config.handlers || [];

        if (scripts.length === 0) {
            error('Warning: No handler scripts are configured.');

            return {};
        }

        return resolveForScripts(scripts);
    }
}

function resolveForScripts(scripts) {
    let resolved = {};

    scripts.forEach(file => {
        try {
            let handler = require(file);

            if (!isObject(handler)) {
                throw new Error(`Invalid handler script provided. "${file}"`);
            }

            for (let key in handler) {
                let callback = handler[key];

                if (!isFunction(callback)) {
                    throw new Error(`Invalid callback function specified for key "${key}" on file "${file}"`);

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

export default Resolver;

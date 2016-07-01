
import Yaml from 'yamljs';
import {log, error} from './util';
import {isObject, isFunction} from './util';

class Resolver {

    static resolveConfig(file) {
        return Yaml.load(file);
    }

    static resolveHandlers(config) {
        let scripts = config.scripts || [];

        if (scripts.length === 0) {
            error('Warning: No listener scripts are configured.');

            return {};
        }

        return resolveForScripts(scripts);
    }
}

function resolveForScripts(scripts) {
    let resolved = {};

    scripts.forEach(file => {
        try {
            let handlers = require(file);

            if (!isObject(handlers)) {
                throw new Error(`Invalid listener script provided. "${file}"`);
            }

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

export default Resolver;

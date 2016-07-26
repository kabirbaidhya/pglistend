
import {red} from 'chalk';
import lodashThrottle from 'lodash.throttle';
import lodashDebounce from 'lodash.debounce';

// Console helpers
export const log = (...params) => console.log(...params);
export const error = (...params) => console.error(...params.map(param => red(param)));

// Misc helpers
export const isObject = (v) => (typeof v === 'object');
export const isFunction = (v) => (typeof v === 'function');
export const isString = (v) => (typeof v === 'string');

export function throttle(func, wait = 0, opts = {}) {
    return lodashThrottle(func, wait, Object.assign({}, {
        leading: true,
        trailing: false
    }, opts));
}

export function debounce(func, wait = 0, opts = {}) {
    return lodashDebounce(func, wait, opts);
}

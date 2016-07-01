
import {red} from 'chalk';

// Console helpers
export const log = (...params) => console.log(...params);
export const error = (...params) => console.error(...params.map(param => red(param)));

// Misc helpers
export const isObject = (v) => (typeof v === 'object');
export const isFunction = (v) => (typeof v === 'function');
export const isString = (v) => (typeof v === 'string');

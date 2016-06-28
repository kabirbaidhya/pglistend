import yargs from 'yargs';
import {red} from 'chalk';

export const argv = yargs
    .describe('config', 'Configuration file to use')
    .demand(['config'])
    .alias('h', 'help')
    .help('help')

    // Version
    .alias('v', 'version')
    .version(() => require('../package').version)
    .describe('version', 'Show version information')

    // Usage
    .usage('Usage: $0 --config=[filename]')
    .showHelpOnFail(false, 'Specify --help for available options')
    .argv;

export const log = (...params) => console.log(...params);
export const error = (...params) => console.error(...params.map(param => red(param)));

import yargs from 'yargs';

export let argv = yargs
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

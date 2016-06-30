import yargs from 'yargs';
import path from 'path';
import {spawnSync} from 'child_process';
import {error} from './util';

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

    // Setup daemon command
    .command('setup-daemon', 'Setup pglistend service on this system', {}, (argv) => {
        let setupPath = path.join(__dirname + '/../setup');

        // Run the setup script and display the output without buffering
        let p = spawnSync('python', [setupPath], {stdio: 'inherit'});

        if(p.status !== 0) {
            error('Setup could not be completed.');
        }

        process.exit(p.status);
    })
    .argv;

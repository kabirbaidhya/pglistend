import path from 'path';
import {Client} from 'pg';
import prog from 'commander';
import {spawnSync} from 'child_process';

import Listener from './Listener';
import {error} from './util';
import {resolveConfig, resolveHandlers} from './resolver';

/**
 * Run the program
 */
export function run() {
    prog.version(require('../package').version)
        .description('pglisten - Postgres LISTEN CLI tool')
        .usage('--config=<path>')
        .option('-c, --config <path>', 'Configuration file to use');
    
    prog.command('setup-daemon')
        .description('Setup pglistend service on this system')
        .option('-C, --configure', 'Configure the daemon during setup')
        .action(({configure}) => setupDaemon({configure}));

    prog.parse(process.argv);

    if (prog.config) {
        listen({config: prog.config});
    } else {
        prog.help();
    }
}

/**
 * Halt the program.
 * Note: Should be called only in case of fatal error.
 */
export function halt(err) {
    error(err || 'An error occured');
    process.exit(1);
}

function listen(args) {
    let config = resolveConfig(args.config);
    let listener = new Listener(config, resolveHandlers(config));

    listener.listen();
}

function setupDaemon(args) {
    let setupPath = path.join(__dirname, '/../setup/setup.py');
    args = args.configure ? ['--configure'] : [];

    // Run the setup script and display the output without buffering
    let {status} = spawnSync('python', [setupPath, ...args], {stdio: 'inherit'});

    if (status !== 0) {
        error('Setup could not be completed.');
    }

    process.exit(status);
}

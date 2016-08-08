import path from 'path';
import {Client} from 'pg';
import prog from 'commander';
import {spawnSync} from 'child_process';

import Listener from './Listener';
import {error, isString} from './util';
import logger from './logging/logger';
import * as msg from './messages/common';
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
    logger.error(isString(err) ? err : (err.message || msg.GENERIC_ERROR_MESSAGE));
    process.exit(1);
}

function listen(args) {
    let config = resolveConfig(args.config);

    if (config.connections.length === 0) {
        throw new Error(msg.NO_CONNECTIONS_CONFIGURED);
    }

    for (let connection of config.connections) {
        let listener = new Listener(connection, resolveHandlers(connection));

        listener.listen();
    }
}

function setupDaemon(args) {
    let setupPath = path.join(__dirname, '/../setup/setup.py');
    args = args.configure ? ['--configure'] : [];

    // Run the setup script and display the output without buffering
    let {status} = spawnSync('python', [setupPath, ...args], {stdio: 'inherit'});

    if (status !== 0) {
        error(msg.SETUP_ERROR);
    }

    process.exit(status);
}

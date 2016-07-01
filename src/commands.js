import path from 'path';
import {Client} from 'pg';
import {spawnSync} from 'child_process';

import {error} from './util';
import Listener from './Listener';

export function listen(args) {
    let listener = new Listener(args.config);

    listener.listen();
}

export function setupDaemon(args) {
    let setupPath = path.join(__dirname + '/../setup');
    args = args.configure ? ['--configure'] : [];

    // Run the setup script and display the output without buffering
    let {status} = spawnSync('python', [setupPath, ...setupArgs], {stdio: 'inherit'});

    if (status !== 0) {
        error('Setup could not be completed.');
    }

    process.exit(status);
}

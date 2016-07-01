
import prog from 'commander';
import {listen, setupDaemon} from './commands';

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
} else if (!prog.args.length) {
    prog.help();
}

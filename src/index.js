
import program from 'commander';

program
    .version(require('../package').version)
    .description('pglisten - Postgres LISTEN CLI tool')
    .usage('--config=<path>');

    program
      .command('listen', {isDefault: true})
      .description('Start listening')
      .option('-c, --config=<path>', 'Configuration file to use')
      .action(function(cmd, options){
        console.log('the listen command');
      })
    // .on('--help', function() {
    //     console.log('  Examples:');
    //     console.log();
    //     console.log('    $ deploy exec sequential');
    //     console.log('    $ deploy exec async');
    //     console.log();
    //   });

    program
        .command('setup-daemon')
        .description('Setup pglistend service on this system')
        .option('-C, --configure', 'Configure the daemon during setup')
        .action(function(cmd, options){
            console.log('the setup command');
        })

      program.parse(process.argv);
        // .help();

if (!program.args.length) {
    program.help();
}

// import {Client} from 'pg';
//
// // Import CLI arguments & the Listener
// import {argv} from './cli';
// import Listener from './Listener';
//
// let listener = new Listener(argv.config);
//
// // Start listening
// listener.listen();

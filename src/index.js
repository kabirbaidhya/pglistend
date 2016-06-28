import {Client} from 'pg';
import Yaml from 'yamljs';
import yargs from 'yargs';
import Listener from './Listener';

let argv = yargs.usage('Usage: $0 --config=[filename]')
    .demand(['config']).argv;

let config = Yaml.load(argv.config);
let listener = new Listener(config);

// Start listening
listener.listen();

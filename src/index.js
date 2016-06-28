import {Client} from 'pg';
import Yaml from 'yamljs';

// Import CLI arguments & the Listener
import {argv} from './cli';
import Listener from './Listener';

let listener = new Listener(Yaml.load(argv.config));

// Start listening
listener.listen();

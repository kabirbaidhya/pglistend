import {Client} from 'pg';

// Import CLI arguments & the Listener
import {argv} from './cli';
import Listener from './Listener';

let listener = new Listener(argv.config);

// Start listening
listener.listen();

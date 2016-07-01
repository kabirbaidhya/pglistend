
import {error} from './util';
import {run, halt} from './program';

try {
    run();
} catch (err) {
    halt(err);
}

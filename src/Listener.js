import { Client } from 'pg';
import { yellow, green, red, dim } from 'chalk';
import { log, error } from './cli';
import { isObject, isFunction } from './util';
import Resolver from './Resolver';

class Listener {

    constructor(configFile) {
        this.config = Resolver.resolveConfig(configFile);
        this.handlers = Resolver.resolveHandlers(this.config);

        console.log(this.handlers);
    }

    listen() {
        const { connection, channels } = this.config;
        let client = new Client(connection);

        client.connect();
        log('Connected to database %s', yellow(connection.database));

        client.on('notification', this.handleNotification.bind(this));


        this.listenTo(client, channels);
    }

    parsePayload(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            throw new Error(
                'Error parsing the JSON payload. NOTIFY payload should be a valid JSON.',
                dim(str)
            );
        }
    }

    handleNotification(n) {
        const {channel, payload: str} = n;

        try {
            log('Received notification on channel %s: %s', green(channel), dim(str));

            const payload = this.parsePayload(str);

            if (!Array.isArray(this.handlers[channel])) {
                throw new Error(`Warning: Handler function has not been registered for channel "${channel}" yet.`);
            }

            this.handlers[channel].forEach(callback => callback(payload));
        } catch (e) {
            error(e.message);
        }
    }

    listenTo(client, channels) {
        channels.forEach(channel => {
            client.query(`LISTEN ${channel}`)
                .then(() => console.info('Started listening to channel %s', green(channel)));
        });
    }
}

export default Listener;

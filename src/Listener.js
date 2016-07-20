import {Client, Pool} from 'pg';
import {format} from 'util';
import {yellow, green, red, dim} from 'chalk';
import {halt} from './program';
import {log, error} from './util';

const NO_HANDLERS_MESSAGE = 'Warning: No handlers are registered for channel "%s" yet.';
const NO_CHANNELS_TO_LISTEN = 'No channels to LISTEN to';

class Listener {

    constructor(config, handlers) {
        this.config = config;
        this.handlers = handlers;
        this.client = new Client(config.connection);
    }

    listen() {
        let {client, config: {connection, channels}} = this;

        if (channels.length === 0) {
            throw new Error(NO_CHANNELS_TO_LISTEN);
        }

        client.connect(err => {
            if (err instanceof Error) {
                halt(err);
            }

            log('Connected to database %s', yellow(connection.database));
        });

        client.on('notice', msg => log(msg));
        client.on('notification', notification => this.handle(notification));

        channels.forEach(channel => this.listenTo(channel));
    }

    /**
     * Parses the payload and returns it.
     * If it's a valid json, parse it and return the decoded object.
     * Otherwise, just return the payload string as it is.
     *
     * @returns {object|string}
     */
    parsePayload(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    }

    invokeHandlers(channel, payload) {
        const handlers = this.handlers[channel];

        if (!Array.isArray(handlers)) {
            throw new Error(format(NO_HANDLERS_MESSAGE, channel));
        }

        // TODO: Delegate CPU-intensive jobs to a task queue or a separate process.
        
        handlers.forEach(callback => callback(payload));
    }

    handle(notification) {
        const {channel, payload: str} = notification;

        log('Received notification on channel %s: %s', green(channel), dim(str));

        try {
            const payload = this.parsePayload(str);

            // Invoke all the handlers registered on the channel
            this.invokeHandlers(channel, payload);
        } catch (e) {
            error(e.message);
        }
    }

    listenTo(channel) {
        this.client.query(`LISTEN ${channel}`).then(() => {
            log('Started listening to channel %s', green(channel));

            // Warn if handlers are not registered for the channels being listened to
            if (!Array.isArray(this.handlers[channel])) {
                error(format(NO_HANDLERS_MESSAGE, channel));
            }
        });
    }
}

export default Listener;

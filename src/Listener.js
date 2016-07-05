import {Client} from 'pg';
import {format} from 'util';
import {yellow, green, red, dim} from 'chalk';
import {halt} from './program';
import {log, error, isObject, isFunction} from './util';

const NO_HANDLERS_MESSAGE = 'Warning: No handlers are registered for channel "%s" yet.';

class Listener {

    constructor(config, handlers) {
        this.config = config;
        this.handlers = handlers;
        this.client = new Client(config.connection);
    }

    listen() {
        let {client, config: {connection, channels}} = this;

        client.connect(err => {
            if (err instanceof Error) {
                halt(err);
            }

            log('Connected to database %s', yellow(connection.database));
        });

        client.on('notice', msg => log(msg));
        client.on('notification', this.handleNotification.bind(this));

        channels.forEach(channel => this.listenTo(channel));
        // this.listenTo(client, channels);
    }

    parsePayload(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            throw new Error(
                'Error parsing the JSON payload. NOTIFY payload should be a valid JSON.' + dim(str)
            );
        }
    }

    invokeHandlers(channel, payload) {
        const handlers = this.handlers[channel];

        if (!Array.isArray(handlers)) {
            throw new Error(format(NO_HANDLERS_MESSAGE, channel));
        }

        // Bind a callback helper to the callbacks
        // to enable the users to perform various kinds of actions
        // from the listener callbacks.
        const helper = this.getCallbackHelper();

        // TODO: Need to think about debouncing execution upto certain time interval
        // on receiving same notification on a channel with same payload
        // to reduce duplicate invocation of similar types of actions too frequently.

        // TODO: Delegate CPU-intensive jobs to a task queue or a separate process.

        handlers.forEach(callback => callback.bind(helper)(payload));
    }

    getCallbackHelper() {
        return {
            log,
            error,
            db: this.client
        };
    }

    handleNotification(notification) {
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

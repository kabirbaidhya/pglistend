import {Client, Pool} from 'pg';
import {format} from 'util';
import {yellow, green, red, dim} from 'chalk';

import {halt} from './program';
import {log, error} from './util';
import * as msg from './messages/common';

class Listener {

    constructor(config, handlers) {
        this.config = config;
        this.handlers = handlers;
        this.client = new Client(config.connection);
    }

    listen() {
        let {client, config: {connection, channels}} = this;

        channels = Array.isArray(channels) ? channels : [];

        if (channels.length === 0) {
            throw new Error(msg.NO_CHANNELS_TO_LISTEN);
        }

        client.connect(err => {
            if (err instanceof Error) {
                halt(err);
            }

            log(msg.DATABASE_CONNECTED, yellow(connection.database));
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
            throw new Error(format(msg.NO_HANDLERS_FOUND, channel));
        }

        // TODO: Delegate CPU-intensive jobs to a task queue or a separate process.

        handlers.forEach(callback => callback(payload));
    }

    handle(notification) {
        const database = this.client.database;
        const {channel, payload: str} = notification;

        log(msg.RECEIVED_NOTIFICATION, green(database + ':' + channel), dim(str || '(empty)'));

        try {
            const payload = this.parsePayload(str);

            // Invoke all the handlers registered on the channel
            this.invokeHandlers(channel, payload);
        } catch (e) {
            error(e.message);
        }
    }

    listenTo(channel) {
        const database = this.client.database;

        this.client.query(`LISTEN ${channel}`).then(() => {
            log(msg.STARTED_LISTENING, green(database + ':' + channel));

            // Warn if handlers are not registered for the channels being listened to
            if (!Array.isArray(this.handlers[channel])) {
                error(format(msg.NO_HANDLERS_FOUND, channel));
            }
        });
    }
}

export default Listener;

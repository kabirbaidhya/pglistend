import {Client} from 'pg';
import {yellow, green, red, dim} from 'chalk';

class Listener {

    constructor(config) {
        this.config = config;
    }

    listen() {
        const {connection, channels} = this.config;
        let client = new Client(connection);

        client.connect();
        console.info('Connected to database %s', yellow(connection.database));

        client.on('notification', (n) => {
            try {
                let payload = JSON.parse(n.payload);

                console.info('Received notification on channel %s: %s', green(n.channel), dim(n.payload));
            } catch(e) {
                console.error(
                    red('Error parsing the JSON payload. NOTIFY payload should be a valid JSON.'),
                    dim(JSON.stringify(n))
                );
            }
        });

        channels.forEach(channel => {
            client.query(`LISTEN ${channel}`);
            console.info('Started listening to channel %s', green(channel));
        });
    }
}

export default Listener;

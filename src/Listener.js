import {Client} from 'pg';

class Listener {

    constructor(config) {
        this.config = config;
    }

    listen() {
        const {connection, channel} = this.config;
        let client = new Client(connection);

        client.connect();
        console.log('Connection established');

        client.on('notification', (n) => {
            try {
                let payload = JSON.parse(n.payload);

                console.log(n.channel, payload);
            } catch(e) {
                console.error('Error parsing the JSON payload. Please make sure the payload sent by postgresql NOTIFY is a valid JSON');
            }
        });

        console.log('Started Listening to channel ' + channel);
        client.query('LISTEN ' + channel);
    }
}

export default Listener;

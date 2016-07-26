import {log, error} from './util';

/**
 * @return {Promise}
 */
export default function query(sql, values) {
    return new Promise((resolve, reject) => {
        this.connect((err, client, done) => {
            if(err) {
                let message = `Connection Error: ${err}`;
                
                reject(message);
                error(message);
                
                return;
            }

            client.query(sql, values, (err, result) => {
                done();
                
                if (err) {
                    let message = `Query error: ${err}`;
                    
                    reject(message);
                    error(message);
                    
                    return;
                }

                log('Executed query: ', sql);
                resolve(result);
            });
        });
    });
}

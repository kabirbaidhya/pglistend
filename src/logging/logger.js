import winston from 'winston';

const formatter = (opts) => {
    return `[${opts.level}] ${(opts.message || '')}` +
        (opts.meta && Object.keys(opts.meta).length ? '\n\t' + JSON.stringify(opts.meta) : '' );
};

const logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console({formatter})
    ]
});

export default logger;
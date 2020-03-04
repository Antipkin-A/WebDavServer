const {createLogger, format, transports} = require('winston');
const {levelLog} = require('./config.js')

const logger = createLogger({
    level: levelLog,
    format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
      new transports.File({ filename: 'webdav.log' })
    ]
});

module.exports = logger
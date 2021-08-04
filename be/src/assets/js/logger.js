const { transports } = require('winston');
const winston = require('winston')

const logger = winston.createLogger({
    exitonError: false,
    format: winston.format.simple(),
    //defaultMeta: { service: 'user-service' },
    transports: [
      
     new winston.transports.File({
        filename: 'alerts.log',
        level: 'alert'
      }),
      new winston.transports.File({
        filename: 'errors.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: 'warnings.log',
        level: 'warning'
      }),
      
      new winston.transports.File({
        filename: 'combined.log',
        level: 'info'
      }),
      new winston.transports.File({
        filename: 'debug.log',
        level: 'debug'
      })
    ],
    exceptionHandlers: [
      new transports.File({ 
        filename: 'exceptions.log' 
      })
    ],
    rejectionHandlers: [
      new transports.File({ 
        filename: 'rejections.log' 
      })
    ]
  });

module.exports = logger;
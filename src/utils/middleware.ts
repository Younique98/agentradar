import morgan from 'morgan';
import logger from './logger';

// Defines a stream for Morgan to log HTTP requests using Winston
const stream = {
  write: (message: string) => logger.info(message.trim()),
};

// Morgan Middleware
const requestLogger = morgan(
  ':method :url :status :response-time ms - :remote-addr',
  { stream },
);

export default requestLogger;
